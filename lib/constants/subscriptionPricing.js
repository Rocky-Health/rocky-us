/**
 * Shared display constants for subscription product pricing.
 * Single source of truth — imported by plan configs, cart, and checkout surfaces.
 *
 * Detection rule (mirrors getCompoundedPlanInfo):
 *   Compounded Semaglutide = item name (lowercased) includes "semaglutide"
 *                            AND does NOT include "oral" or "sublingual"
 */

export const SEMA_PRICING = {
  productId: 489798,
  firstMonthAmount: 150,
  firstMonthPrice: "$150",
  recurringPrice: "$249",
  recurringTagline: "$249/month after first month",
};

/**
 * Returns the sema pricing display object when the cart/checkout item is
 * Compounded Semaglutide (by name rule), otherwise returns null.
 *
 * @param {{ name?: string }} item  — any object with a .name string
 * @returns {typeof SEMA_PRICING | null}
 */
export function getSemaFirstMonthDisplay(item) {
  const name = (item?.name || "").toLowerCase();
  const isSema =
    name.includes("semaglutide") &&
    !name.includes("oral") &&
    !name.includes("sublingual");
  return isSema ? SEMA_PRICING : null;
}
