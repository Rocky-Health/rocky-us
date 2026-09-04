/**
 * Resolves a WooCommerce order to the true UTC instant it was purchased.
 *
 * Northbeam's Orders API is the declared source of truth and is compared
 * against the client-side pixel. An API timestamp that lands earlier than the
 * pixel means the order is not attributed at all, so a timestamp that is merely
 * "close" is not good enough.
 *
 * The trap this exists to close: the Woo REST API returns `date_created` and
 * `date_paid` as bare strings in the SITE timezone with no offset, e.g.
 * "2026-08-31T15:12:11". A date-time string with no offset is parsed as the
 * local time of whatever runtime evaluates it. Some of this code runs in the
 * customer's browser, so `new Date(order.date_created)` produced a different
 * instant for every customer timezone, skewed by the difference between their
 * device and the store's configured offset.
 *
 * The `_gmt` variants carry the correct instant but are also bare strings, so
 * they must be pinned to UTC explicitly rather than left to the runtime.
 *
 * The store timezones are deliberate and are not changing: CA runs a fixed
 * UTC-5 to match how head office reads the data, and US runs UTC. Correctness
 * is therefore handled here, in code, rather than by moving a store setting.
 */

const ZONE_SUFFIX = /(?:Z|[+-]\d{2}:?\d{2})$/i;

/**
 * Seconds added to a LIVE purchase timestamp so it cannot land before the
 * client purchase pixel.
 *
 * Northbeam's own recommendation, given in writing on 2026-09-02: when the exact
 * pixel time is uncertain, add a hard two minutes to the value. A real purchase
 * clears payment and the pixel then fires on the confirmation page seconds
 * later, so any instant taken from the order itself is always earlier than the
 * pixel, which is the condition that drops attribution entirely.
 *
 * Their stated caveat, which is the only cost: an order inside this window
 * before the reporting day boundary moves onto the next calendar date.
 */
export const NB_PIXEL_GUARD_SECONDS = 120;

/**
 * Pushes an ISO instant forward by the pixel guard.
 *
 * Deliberately NOT folded into `resolveOrderTimeIso`. That resolver feeds every
 * Northbeam payload path in this repository, including both backfills, and a
 * historical replay must send the true purchase instant unchanged. Keeping the
 * guard as a separate named call is what stops it leaking into history. See
 * `lib/northbeam/writeContext.js` for how a caller declares which it is.
 *
 * @param {string} iso an ISO 8601 instant
 * @param {number} [guardSeconds] override, for tests and for a future vendor change
 * @returns {string|null} the shifted ISO instant, or null when the input is unusable
 */
export function applyPixelGuard(iso, guardSeconds = NB_PIXEL_GUARD_SECONDS) {
  if (typeof iso !== "string" || !iso.trim()) return null;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return null;
  const seconds = Number(guardSeconds);
  if (!Number.isFinite(seconds)) return null;
  return new Date(ms + seconds * 1000).toISOString();
}

/**
 * How recent an instant must be for the pixel guard to be allowed to touch it.
 *
 * Two hours, chosen to match the default lookback of the US auto-retry cron
 * (`NB_RETRY_LOOKBACK_MINUTES`, 120). That is deliberate: an order whose live
 * send failed and which the cron recovers minutes later DID have a pixel fire,
 * so it needs the guard. An order re-sent weeks later through the pay-for-order
 * flow did not, and shifting its purchase instant by two minutes would mutate a
 * reporting period that has already closed.
 *
 * So the window is not about the day boundary. Shifting any instant by the guard
 * crosses a day boundary only when it sits within the guard of that boundary,
 * and that is true whatever the order's age. The window is about not rewriting
 * figures that have already been reported.
 */
export const NB_LIVE_RECENCY_SECONDS = 2 * 60 * 60;

/**
 * Whether an instant is recent enough to be treated as a live purchase write.
 *
 * A caller declaring `live_purchase` is not taken at its word: several callers
 * cannot know how old the order they are re-sending is. This is the route's
 * backstop against a stale timestamp being shifted.
 *
 * @param {string} iso the instant about to be sent
 * @param {number} nowMs the current epoch milliseconds
 * @returns {boolean} false when the input is unusable, so an unparseable value
 *   never earns the guard
 */
export function isWithinLiveWindow(iso, nowMs) {
  if (typeof iso !== "string" || !iso.trim()) return false;
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms) || !Number.isFinite(nowMs)) return false;
  return nowMs - ms <= NB_LIVE_RECENCY_SECONDS * 1000;
}

/**
 * The guard, with a ceiling so it can never outrun the clock by more than the
 * guard itself.
 *
 * Two reasons for the ceiling, both found in review:
 *
 * 1. The caller clamps a timestamp more than two hours in the future back to
 *    now, and the guard used to be added afterwards unconditionally. A value
 *    just inside that threshold could therefore be sent as two hours and two
 *    minutes ahead, past the range the clamp exists to reject.
 * 2. When the caller had to invent `now` because the order carried no usable
 *    timestamp, the guard would date the purchase two minutes into the future.
 *    Bounded to `now + guard` that is the same magnitude Northbeam themselves
 *    recommended, rather than an unbounded one.
 *
 * @param {string} iso an already-clamped ISO instant
 * @param {number} nowMs the current epoch milliseconds
 * @returns {string|null} the guarded instant, or null when the input is unusable
 */
export function applyPixelGuardBounded(iso, nowMs) {
  const guarded = applyPixelGuard(iso);
  if (!guarded) return null;
  if (!Number.isFinite(nowMs)) return guarded;
  const ceiling = nowMs + NB_PIXEL_GUARD_SECONDS * 1000;
  const guardedMs = Date.parse(guarded);
  return guardedMs > ceiling ? new Date(ceiling).toISOString() : guarded;
}

/**
 * Parses a Woo date string as UTC. Bare strings get pinned to UTC rather than
 * being left to the runtime's local zone.
 *
 * @param {string} value
 * @returns {Date|null} a valid Date, or null when the input is unusable
 */
function parseAsUtc(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const trimmed = value.trim();
  const pinned = ZONE_SUFFIX.test(trimmed) ? trimmed : `${trimmed}Z`;
  const parsed = new Date(pinned);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Best available UTC instant for an order, as an ISO 8601 string.
 *
 * Only the GMT fields are trusted. The site-local fields are deliberately not
 * used as a fallback: without knowing the store's offset at that moment we
 * cannot convert them, and guessing produces exactly the silent skew this
 * function exists to prevent. Callers keep their own final fallback for the
 * case where an order carries no GMT field at all.
 *
 * @param {object} order a WooCommerce REST order
 * @returns {string|null} ISO 8601 in UTC, or null when no GMT field is usable
 */
export function resolveOrderTimeIso(order) {
  const candidates = [
    order?.date_paid_gmt,
    order?.date_created_gmt,
    order?.date_completed_gmt,
  ];

  for (const candidate of candidates) {
    const parsed = parseAsUtc(candidate);
    if (parsed) return parsed.toISOString();
  }

  return null;
}
