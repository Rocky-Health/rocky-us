/**
 * Resolve a single canonical product identifier for analytics events.
 * Used so the same product resolves to the same id across every funnel step
 * (ViewContent / AddToCart / InitiateCheckout / Purchase) and across
 * browser + server, matching the TikTok product catalog keys.
 *
 * Priority: SKU first (variation-level, catalog key), then variation id,
 * then parent product id, then generic id.
 */
export const getCanonicalProductId = (item = {}) => {
  if (!item || typeof item !== "object") return "";
  return (
    item.sku ||
    item.variation_id?.toString() ||
    item.product_id?.toString() ||
    item.id?.toString() ||
    ""
  );
};
