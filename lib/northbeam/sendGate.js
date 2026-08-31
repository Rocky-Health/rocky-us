/**
 * Decides whether an order may be sent to Northbeam.
 *
 * The outbound call used to be gated only on the presence of credentials, so
 * any environment holding NB_CLIENT_ID and NB_API_KEY sent live data. Preview
 * deployments and QA orders therefore reached the production Northbeam dataset,
 * where they inflate the new customer count and distort per vertical averages.
 * Northbeam is reconciling against our source records order by order, so this
 * noise is actively costing us in that exercise.
 *
 * Three gates, all fail-closed:
 *
 *   1. Environment. Only VERCEL_ENV === "production" sends. Preview, local and
 *      anything else are refused. There is deliberately no override: an escape
 *      hatch is how test data reached production in the first place.
 *   2. Internal coupons. Codes are read from NORTHBEAM_EXCLUDED_COUPONS so QA
 *      can add one without a deploy.
 *   3. Zero value orders, which are what a 100% off internal coupon produces.
 *
 * Skips are reported rather than dropped silently, so it is visible when a gate
 * fires and why.
 */

/**
 * Internal coupon codes that must never produce a Northbeam order.
 * Comma separated in NORTHBEAM_EXCLUDED_COUPONS, matched case insensitively.
 *
 * @returns {Set<string>} lowercased codes
 */
function excludedCoupons() {
  return new Set(
    String(process.env.NORTHBEAM_EXCLUDED_COUPONS || "")
      .split(",")
      .map((code) => code.trim().toLowerCase())
      .filter(Boolean)
  );
}

/**
 * @param {object} order the mapped Northbeam order payload
 * @returns {{ send: boolean, reason?: string, detail?: string }}
 */
export function evaluateSendGate(order) {
  if (process.env.VERCEL_ENV !== "production") {
    return {
      send: false,
      reason: "non_production_environment",
      detail: `VERCEL_ENV is ${process.env.VERCEL_ENV || "unset"}`,
    };
  }

  const excluded = excludedCoupons();
  if (excluded.size) {
    const codes = Array.isArray(order?.discount_codes)
      ? order.discount_codes
      : [];
    const hit = codes.find(
      (code) => typeof code === "string" && excluded.has(code.trim().toLowerCase())
    );
    if (hit) {
      return { send: false, reason: "internal_coupon", detail: hit };
    }
  }

  // A 100% off internal coupon lands here even when its code is not listed.
  if (!(parseFloat(order?.purchase_total) > 0)) {
    return {
      send: false,
      reason: "zero_value_order",
      detail: String(order?.purchase_total),
    };
  }

  return { send: true };
}
