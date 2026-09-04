/**
 * The canonical Northbeam `order_tags` taxonomy, in one place.
 *
 * WHY THIS MODULE EXISTS
 *
 * Northbeam replaces `order_tags` as a complete array on every write and keeps
 * the last one, so any writer emitting a thinner or differently-shaped array
 * silently deletes a richer one. Until now four writers built that array four
 * different ways: the browser sent status plus lifecycle plus categories plus
 * source, the Relay sent a single status tag, and the two backfills sent status
 * plus lifecycle plus AWIN. Every cancel, refund and hourly sync was therefore a
 * data loss event.
 *
 * TK-1027 makes the WordPress Relay the canonical writer. This module is the
 * JavaScript half of the same taxonomy, so the storefront routes that still
 * write (the live purchase path and the backfills) produce the same array
 * rather than a competing one. The PHP implementation lives in
 * `wp-content/plugins/Northbeam Relay/Northbeam Relay.php` and the two are kept
 * deliberately in step; a change here without the matching change there
 * reintroduces exactly the drift this replaces.
 *
 * THE THREE AXES (TK-446, approved 2026-09-02)
 *
 *   Customer lifecycle   First Order  / Returning
 *   Order origin         New Order    / Renewal
 *   Purchase mode        Subscription / OTP
 *
 * They replace a single overloaded value with three outputs
 * (`Subscription First Order` / `Subscription Recurring` / `OTC`) that conflated
 * all three questions, so a returning customer starting a brand new
 * subscription (acquisition) and an auto-renewal (retention) read identically.
 *
 * THIS IS A STRAIGHT FORWARD-ONLY CUTOVER. The legacy value is not emitted
 * alongside the axes. The two schemas must not coexist on canonical writes, and
 * the production cutover timestamp is the reporting boundary between them.
 */

export const NB_AXIS = {
  LIFECYCLE_FIRST: "First Order",
  LIFECYCLE_RETURNING: "Returning",
  ORIGIN_NEW: "New Order",
  ORIGIN_RENEWAL: "Renewal",
  MODE_SUBSCRIPTION: "Subscription",
  MODE_OTP: "OTP",
};

/**
 * Woo order meta the canonical writer persists so every other writer can read
 * rather than re-derive. See the PHP `build_nb_order()` for where they are set.
 */
export const NB_AXIS_META = {
  LIFECYCLE: "_nb_customer_lifecycle",
  ORIGIN: "_nb_order_origin",
  MODE: "_nb_purchase_mode",
};

const STATUS_TAGS = {
  processing: "Processing",
  "on-hold": "On Hold",
  completed: "Completed",
  cancelled: "Cancelled",
  refunded: "Refunded",
  failed: "Failed",
  trash: "Trashed",
  trashed: "Trashed",
  expired: "Expired",
};

/**
 * The status tag, or "" when the status is not one we report.
 *
 * THE DEFAULT WAS THE BUG. Every previous implementation of this returned
 * `"Pending"` for anything unmapped, including for a missing status, and
 * because tag arrays are merged rather than replaced within a single payload an
 * order could end up carrying two status tags at once. Order 804624 currently
 * holds both `Pending` and `On Hold` live in the vendor account. A phantom
 * default is worse than an absent tag because it is indistinguishable from a
 * real one.
 *
 * `pending` is deliberately absent from the map rather than mapped: an unpaid
 * checkout is not a purchase and is not reported at all.
 *
 * @param {string} status a WooCommerce order status
 * @returns {string} the tag, or "" when there is nothing truthful to say
 */
export function statusTag(status) {
  const key = String(status || "").trim().toLowerCase();
  return STATUS_TAGS[key] || "";
}

/** Read one meta value off a WooCommerce REST order. */
export function orderMetaValue(order, key) {
  const entry = Array.isArray(order?.meta_data)
    ? order.meta_data.find((m) => m?.key === key)
    : null;
  const value = entry?.value;
  return typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim();
}

/**
 * The customer lifecycle axis for an order.
 *
 * READ, NEVER DERIVED HERE. Two reasons, and both were bought with a defect:
 *
 * 1. `order.is_first_order` is read in four places across the two storefronts
 *    and written in none of them. It has always been undefined, so the legacy
 *    lifecycle tag could never emit `Subscription First Order` from any server
 *    path. Reading a field nothing writes is how that survived unnoticed.
 * 2. The answer depends on WHEN it is asked. A backfill running weeks later
 *    would find the customer's subsequent orders and report the original as
 *    `Returning`. The canonical writer resolves it once, at the purchase, and
 *    pins it to the order.
 *
 * An order with no pinned value is one the canonical writer has never seen,
 * which means a historical order. The axis is omitted there rather than
 * invented, matching TK-446's forward-only rule.
 *
 * @returns {string} one of the lifecycle values, or "" when unknown
 */
export function customerLifecycleAxis(order) {
  const pinned = orderMetaValue(order, NB_AXIS_META.LIFECYCLE);
  return pinned === NB_AXIS.LIFECYCLE_FIRST || pinned === NB_AXIS.LIFECYCLE_RETURNING
    ? pinned
    : "";
}

/**
 * The order origin axis.
 *
 * Prefers the pinned value, then falls back to the subscription-derivative meta
 * the WooCommerce REST order does carry. That fallback is safe in a way the
 * mode fallback is not: `_subscription_renewal` and its siblings are explicit
 * markers, not a heuristic.
 */
export function orderOriginAxis(order) {
  const pinned = orderMetaValue(order, NB_AXIS_META.ORIGIN);
  if (pinned === NB_AXIS.ORIGIN_NEW || pinned === NB_AXIS.ORIGIN_RENEWAL) return pinned;

  const renewalMarkers = [
    "_subscription_renewal",
    "_subscription_resubscribe",
    "_subscription_switch",
  ];
  const hasRenewalMarker = renewalMarkers.some((key) => orderMetaValue(order, key) !== "");
  if (hasRenewalMarker) return NB_AXIS.ORIGIN_RENEWAL;

  return "";
}

/**
 * The purchase mode axis.
 *
 * READ ONLY, WITH NO HEURISTIC FALLBACK, AND THAT IS THE POINT. The WooCommerce
 * REST order representation carries no product type and no subscription
 * linkage, so the only thing available here would be matching /subscription/i
 * against the product NAME. That is precisely what the old writers did, and it
 * is why the same order flipped between `OTC` and `Subscription Recurring`
 * depending on which writer touched it last. An omitted axis is recoverable; a
 * confidently wrong one is not.
 */
export function purchaseModeAxis(order) {
  const pinned = orderMetaValue(order, NB_AXIS_META.MODE);
  return pinned === NB_AXIS.MODE_SUBSCRIPTION || pinned === NB_AXIS.MODE_OTP ? pinned : "";
}

/**
 * Assemble the canonical tag array.
 *
 * Order is fixed (status, lifecycle, origin, mode, categories, source) so two
 * payloads for the same order are diffable by eye. Northbeam does not care
 * about order; humans reading a discrepancy do.
 *
 * Empty entries are dropped and duplicates collapse, preserving first-seen
 * position.
 *
 * @param {object} args
 * @param {string} [args.status] the WooCommerce status
 * @param {object} [args.order] the WooCommerce REST order, for the pinned axes
 * @param {string[]} [args.categoryTags] from lib/northbeam/categoryTags.js
 * @param {string[]} [args.sourceTags] from lib/northbeam/attributionTags.js
 * @param {string[]} [args.extraTags] anything a caller already holds
 * @returns {string[]}
 */
export function buildCanonicalOrderTags({
  status = "",
  order = null,
  categoryTags = [],
  sourceTags = [],
  extraTags = [],
} = {}) {
  const ordered = [
    statusTag(status),
    customerLifecycleAxis(order),
    orderOriginAxis(order),
    purchaseModeAxis(order),
    ...(Array.isArray(categoryTags) ? categoryTags : []),
    ...(Array.isArray(sourceTags) ? sourceTags : []),
    ...(Array.isArray(extraTags) ? extraTags : []),
  ];

  const seen = new Set();
  const deduped = [];
  for (const tag of ordered) {
    const key = String(tag || "").trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    deduped.push(key);
  }
  return deduped;
}
