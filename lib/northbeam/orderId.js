/**
 * Order id integrity for Northbeam payloads.
 *
 * Northbeam deduplicates on `order_id`, so anything we send under a key that is
 * not the Woo primary key becomes a separate record for the same purchase. The
 * cost of sending a bad id is a phantom order in the dataset that no
 * reconciliation query can match back to us; the cost of skipping one is a
 * single missing order we can re-push later. Skipping is strictly cheaper.
 *
 * The trap this closes: `String(order?.id)` on an order with no id produces the
 * STRING "undefined", which is truthy. A `if (!order.order_id)` check therefore
 * passes it, and "undefined" reaches Northbeam as a real order key.
 */

/**
 * Normalises a Woo primary key to the string form Northbeam expects.
 *
 * Accepts a positive integer, as a number or as its string form. Rejects
 * everything else, including the stringified forms of null and undefined that a
 * bare String() conversion produces.
 *
 * @param {unknown} value
 * @returns {string|null} the id as a string, or null when it is not usable
 */
export function normalizeOrderId(value) {
  if (typeof value === "number") {
    return Number.isInteger(value) && value > 0 ? String(value) : null;
  }

  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  // "undefined" and "null" are what String() produces for those values, and
  // both survive a truthiness check, so they must be rejected explicitly.
  if (!trimmed || trimmed === "undefined" || trimmed === "null") return null;
  if (!/^\d+$/.test(trimmed)) return null;

  return String(Number(trimmed)) === trimmed && Number(trimmed) > 0
    ? trimmed
    : null;
}

/**
 * @param {unknown} value
 * @returns {boolean} whether the value is a usable Northbeam order id
 */
export function isUsableOrderId(value) {
  return normalizeOrderId(value) !== null;
}
