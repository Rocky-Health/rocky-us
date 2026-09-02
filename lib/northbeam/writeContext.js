/**
 * Declares what KIND of Northbeam write a caller is performing.
 *
 * This exists for one reason. Northbeam clarified on 2026-09-02 that the value
 * which must not precede the client purchase pixel is the ISO-8601 string in
 * the `time_of_purchase` field, not the time of the HTTP call. Their
 * recommendation when the exact pixel time is unknown is to add a fixed two
 * minutes to the value.
 *
 * That guard is only correct for a LIVE purchase, where a pixel is firing on
 * the confirmation page moments after we write. It is wrong for a historical
 * backfill: shifting an old order's purchase time mutates a figure that has
 * already been reported, and for an order inside the last two minutes before
 * the reporting day boundary it moves that order onto a different calendar day.
 *
 * Every writer funnels through `/api/northbeam/orders`, which is the only place
 * in this repository that posts to the vendor, so the route cannot tell a live
 * purchase from a backfill by inspection. It has to be told. This module is how
 * it is told, and the default is deliberately the safe one: an unknown or absent
 * context is treated as historical and gets no guard, so a future caller that
 * forgets to declare itself cannot silently rewrite a historical timestamp.
 */

export const NB_WRITE_CONTEXT = {
  /** A purchase happening now, with a client purchase pixel firing alongside it. */
  LIVE_PURCHASE: "live_purchase",
  /** A replay of an existing order. No pixel is firing. Timestamps stay untouched. */
  HISTORICAL_BACKFILL: "historical_backfill",
};

const KNOWN_CONTEXTS = new Set(Object.values(NB_WRITE_CONTEXT));

/**
 * Coerces any caller supplied value to a known context.
 *
 * Anything unrecognised, missing, empty or of the wrong type resolves to
 * `HISTORICAL_BACKFILL`, because that is the branch that changes nothing.
 *
 * @param {unknown} value
 * @returns {string} one of NB_WRITE_CONTEXT
 */
export function normalizeWriteContext(value) {
  if (typeof value !== "string") return NB_WRITE_CONTEXT.HISTORICAL_BACKFILL;
  const trimmed = value.trim().toLowerCase();
  return KNOWN_CONTEXTS.has(trimmed)
    ? trimmed
    : NB_WRITE_CONTEXT.HISTORICAL_BACKFILL;
}

/**
 * Whether the pixel guard applies to this write.
 *
 * True for exactly one context. Written as an allowlist rather than as
 * `!== HISTORICAL_BACKFILL` on purpose: adding a third context later must not
 * silently opt it into shifting timestamps.
 *
 * @param {unknown} value a raw or normalized context
 * @returns {boolean}
 */
export function shouldApplyPixelGuard(value) {
  return normalizeWriteContext(value) === NB_WRITE_CONTEXT.LIVE_PURCHASE;
}
