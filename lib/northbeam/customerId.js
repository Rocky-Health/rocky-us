/**
 * Guards the Northbeam customer ID namespace.
 *
 * Every writer in this integration builds the ID the same way, and has always
 * done so: `wc:{wooUserId}`, else `email:{address}`, else `phone:{digits}`. That
 * consistency is load bearing. Northbeam treats two different ID strings as two
 * different customers, so a single writer emitting a fourth namespace splits one
 * person into two and reports the returning order as a first time purchase.
 *
 * TK-1001 reported exactly that failure, attributing it to a `backend:` prefix
 * emitted by the backfill. A search of every commit on every branch of all three
 * Rocky repositories found no code that has ever produced that prefix, and the
 * writer surface was enumerated rather than assumed: this repository posts to
 * the vendor from one route, and the WordPress Relay is the only other writer.
 * So the reported mechanism is unsupported.
 *
 * What is real is the override the ticket points at. The orders route accepts a
 * caller supplied `customer_id_canonical` and forwards it verbatim, with no
 * validation of its shape, and the browser sets that field on every purchase. So
 * the override is the path most live orders actually take. It happens to carry a
 * correct value today, which is the only reason nothing has gone wrong.
 *
 * This module closes the mechanism whatever produced the original observation.
 *
 * Rejecting an override is normally safe: the route re-derives the ID from
 * `customer_id`, `customer_email` and `customer_phone_number` using the same
 * three rules, so a refused override degrades to the correct value.
 *
 * One input class is the exception, and it is recorded here rather than papered
 * over. An order carrying a non-numeric truthy `customer_id` with no email and
 * no phone derives to an empty string, so a refused override leaves the ID
 * empty where it previously carried the raw value. That is deliberate: the raw
 * value was never a namespace Northbeam could match, so it only ever created an
 * orphan customer record. The case is unreachable through the WooCommerce REST
 * API, which returns `customer_id` as integer 0 for a guest, and is reachable
 * only by a hand-crafted request to an endpoint that is being locked.
 */

/** The only namespaces Northbeam has ever been sent from this integration. */
export const NB_CUSTOMER_ID_NAMESPACES = ["wc", "email", "phone"];

/**
 * One pattern per namespace rather than a single "prefix plus anything" rule.
 *
 * A prefix-only check was the first version of this module and review showed it
 * accepted `wc:0`, `wc:-1`, `email:undefined`, `phone:not-a-phone` and even a
 * nested `email:wc:123`. Every one of those creates a Northbeam customer record
 * that nothing can ever be matched back to, which is the same harm an unknown
 * namespace does.
 *
 * Each pattern is drawn from what the real producers emit, so none of them can
 * reject a genuine value:
 *   `wc:{id}`    only when Number(id) > 0, so digits with no leading zero
 *   `email:{addr}` always lowercased and always containing an @
 *   `phone:{digits}` digits only, after a non-digit strip
 */
const NAMESPACE_PATTERNS = {
  wc: /^wc:[1-9]\d{0,17}$/,
  email: /^email:[^\s@]{1,64}@[^\s@]{1,255}$/,
  phone: /^phone:\d{7,15}$/,
};

/**
 * Hard ceiling on the whole string, independent of the patterns above.
 *
 * The patterns already bound each namespace, but an explicit total length is
 * cheaper to reason about than composing the parts, and it is what stops an
 * arbitrarily long value being forwarded as a customer identifier. Every real
 * producer emits well under this.
 */
const MAX_CUSTOMER_ID_LENGTH = 320;

/**
 * Whether a customer ID conforms to its own namespace's shape.
 *
 * An earlier version of this comment said the check was deliberately permissive
 * about what follows the colon. It is no longer: see NAMESPACE_PATTERNS for why
 * a prefix-only rule was not enough.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
export function isCanonicalCustomerId(value) {
  return normalizeCustomerId(value) !== null;
}

/**
 * Trims and lowercases a candidate, then tests it against its own namespace.
 *
 * The lowercasing matters and was a review finding. The route's own derive path
 * lowercases an email before namespacing it, so an override of
 * `email:Buyer@Example.com` that was accepted verbatim would sit in Northbeam
 * as a second customer alongside `email:buyer@example.com`: precisely the split
 * this module exists to prevent, reintroduced by the module itself. Lowercasing
 * is safe for the other two namespaces, which are digits.
 *
 * @param {unknown} value
 * @returns {string|null} the normalized id, or null when it does not conform
 */
export function normalizeCustomerId(value) {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toLowerCase();
  if (!normalized || normalized.length > MAX_CUSTOMER_ID_LENGTH) return null;
  const namespace = normalized.slice(0, normalized.indexOf(":"));
  const pattern = NAMESPACE_PATTERNS[namespace];
  return pattern && pattern.test(normalized) ? normalized : null;
}

/**
 * Returns the override when it is safe to honour, otherwise null.
 *
 * Callers pass the result through `??` or a truthiness check against their own
 * derived value, so a null means "keep what you derived".
 *
 * @param {unknown} value a caller supplied `customer_id_canonical`
 * @returns {string|null}
 */
export function acceptCustomerIdOverride(value) {
  return normalizeCustomerId(value);
}
