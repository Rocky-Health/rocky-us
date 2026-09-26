/**
 * Shared TikTok event_id builders for browser pixel and Events API dedup.
 */

/**
 * Deterministic purchase event_id shared by browser pixel and CAPI.
 *
 * TikTok dedup requires matching pixel code, event name, and event_id. The
 * timestamp comes from analyticsService's canonical purchase timestamp so the
 * browser and server payloads can use the same value.
 *
 * @param {string|number} orderId
 * @param {string} [timeOfPurchaseIso]
 * @returns {string}
 */
export function buildTikTokPurchaseEventId(orderId, timeOfPurchaseIso) {
  const id = orderId != null ? String(orderId) : "unknown";
  const parsed = timeOfPurchaseIso ? new Date(timeOfPurchaseIso).getTime() : NaN;
  const tsMs = Number.isFinite(parsed) ? parsed : Date.now();
  return `purchase_${id}_${tsMs}`;
}
