/**
 * Shared eligibility guards for the Northbeam backfill routes.
 *
 * These encode the same two rules the WordPress backfill plugin already
 * applies when it selects orders (northbeam-backfill-sync.php, safeguards 1
 * through 5). The manual /api/northbeam/backfill route never applied either of
 * them, so it could re-push an order the Relay had already sent and could push
 * subscription renewals that the integration deliberately never sends.
 */

/**
 * Woo meta keys that mark an order as derived from a subscription rather than
 * being a parent purchase. Mirrors the plugin's exclusion list.
 */
const SUBSCRIPTION_DERIVATIVE_META_KEYS = [
  "_subscription_renewal",
  "_subscription_resubscribe",
  "_subscription_switch",
];

/**
 * True when the order is a renewal, resubscribe or switch rather than a parent
 * purchase. The integration only ever sends parent purchases to Northbeam, so
 * these must never be backfilled.
 *
 * @param {object} order a WooCommerce REST order
 */
/**
 * Refusal reasons that are properties of the ORDER and will never change, so a
 * further attempt can only produce the same answer.
 *
 * `non_production_environment` is deliberately absent: it describes the
 * deployment that made the call, not the order, and an order refused by a
 * preview deploy must stay eligible for the production run.
 */
const PERMANENT_REFUSAL_REASONS = new Set([
  "follow-up consultation",
  "internal_coupon",
  "zero_value_order",
]);

export function isSubscriptionDerivative(order) {
  if (Array.isArray(order?.meta_data)) {
    const hit = order.meta_data.find((m) =>
      SUBSCRIPTION_DERIVATIVE_META_KEYS.includes(m?.key)
    );
    if (hit) return true;
  }

  // Belt and braces: some callers hand us a pre-mapped order that carries the
  // flag directly rather than the raw Woo meta.
  return Boolean(order?.is_recurring_order);
}

/**
 * Whether the order has already reached Northbeam, either because the Relay
 * plugin pushed it in real time or because a previous backfill run sent it.
 *
 * @param {object} order a WooCommerce REST order
 * @returns {{ synced: boolean, handled_by_relay: boolean, synced_at?: string, attempts?: number }}
 */
export function checkIfAlreadySynced(order) {
  if (!order?.meta_data || !Array.isArray(order.meta_data)) {
    return { synced: false, handled_by_relay: false };
  }

  // If the Relay sent it, it is already in Northbeam and must not be re-pushed.
  const relayMeta = order.meta_data.find(
    (m) => m.key === "_nb_last_pushed_total"
  );
  if (relayMeta) {
    return {
      synced: true,
      handled_by_relay: true,
      synced_at: "handled_by_relay",
      attempts: 0,
    };
  }

  const nbBackfilled = order.meta_data.find(
    (m) => m.key === "_northbeam_backfilled"
  );
  const nbBackfilledAt = order.meta_data.find(
    (m) => m.key === "_northbeam_backfilled_at"
  );
  const nbBackfillAttempts = order.meta_data.find(
    (m) => m.key === "_northbeam_backfill_attempts"
  );

  if (nbBackfilled && nbBackfilled.value === "yes") {
    return {
      synced: true,
      handled_by_relay: false,
      synced_at: nbBackfilledAt?.value || "unknown",
      attempts: parseInt(nbBackfillAttempts?.value || "1", 10),
    };
  }

  // A PREVIOUS DELIBERATE REFUSAL IS NOT A SYNC, AND MUST NEVER BE REPORTED AS
  // ONE. Before TK-1027 there was no distinction: the route answers HTTP 200
  // with `skipped: true` for an internal coupon or a zero value order, the
  // caller saw `res.ok` and wrote the delivery marker, and this function then
  // told every future run the order was already in Northbeam. That is what
  // sealed 21 paid Canadian orders out of the vendor permanently.
  //
  // The refusal is reported separately so a caller can stop re-sending an order
  // that a permanent business rule forbids, without any reader mistaking it for
  // delivery. Only PERMANENT reasons count: `non_production_environment` is a
  // property of the deployment that wrote it, not of the order, so an order
  // refused by a preview deploy stays eligible in production.
  const refused = order.meta_data.find(
    (m) => m.key === "_northbeam_backfill_refused"
  );
  const refusedReason = order.meta_data.find(
    (m) => m.key === "_northbeam_backfill_refused_reason"
  );

  if (refused && refused.value === "yes") {
    const reason = String(refusedReason?.value || "");
    return {
      synced: false,
      handled_by_relay: false,
      refused: PERMANENT_REFUSAL_REASONS.has(reason),
      refused_reason: reason,
    };
  }

  return { synced: false, handled_by_relay: false };
}
