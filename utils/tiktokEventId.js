/**
 * Shared TikTok purchase event_id for browser ttq ↔ CAPI deduplication.
 * Matches app/api/tiktok-capi/purchase/route.js: purchase_{orderId}_{gateway}.
 */

export function buildTikTokPurchaseEventId(orderId, gateway) {
  const id = orderId != null ? String(orderId) : "unknown";
  const gw =
    gateway != null && String(gateway).trim() !== ""
      ? String(gateway)
      : "UNKNOWN";
  return `purchase_${id}_${gw}`;
}
