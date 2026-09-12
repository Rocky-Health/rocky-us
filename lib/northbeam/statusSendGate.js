/**
 * Which WooCommerce statuses are a purchase worth reporting to Northbeam.
 *
 * THE ON-HOLD RULE, AND WHY IT IS NOT A STATUS ALLOWLIST.
 *
 * Rocky holds orders at `on-hold` while they wait for medical review. Those
 * orders have not necessarily been paid, and they must not reach Northbeam
 * until they actually change status and the payment is captured, or they are
 * counted against revenue that has not happened. Northbeam keeps the last
 * write, so a premature on-hold record is not merely early: it is a sale the
 * vendor now believes in.
 *
 * The WordPress Relay already draws exactly this line. Its classify_transition()
 * treats `on-hold` as a purchase ONLY when the order carries a payment date,
 * because the status alone cannot separate payment-authorized from
 * awaiting-payment, and the two are indistinguishable across gateways.
 *
 * This route previously sent on `on-hold` unconditionally, so it was reporting
 * precisely the orders the canonical writer refuses on purpose. Same test here,
 * for the same reason, so the two writers cannot disagree about what a purchase
 * is while both feed the same account.
 */

/** Statuses where payment has been taken and the status alone is sufficient. */
export const NB_PAID_STATUSES = ["processing", "completed"];

/**
 * Did money actually change hands on this order?
 *
 * Woo sets the paid date on capture. Both the `_gmt` and bare forms are checked
 * because the REST payload carries both and either can be the populated one.
 */
export const orderHasPayment = (order) =>
  Boolean(order?.date_paid_gmt || order?.date_paid);

/**
 * Should a transition into `status` be reported to Northbeam as a purchase?
 *
 * @param {string} status WooCommerce status, without the `wc-` prefix
 * @param {object} order  the WooCommerce order payload
 * @returns {boolean}
 */
export const shouldSendOnStatus = (status, order) => {
  if (NB_PAID_STATUSES.includes(status)) return true;
  if (status === "on-hold") return orderHasPayment(order);
  return false;
};
