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
