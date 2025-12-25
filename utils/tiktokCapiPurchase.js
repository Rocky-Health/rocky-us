import { logger } from '@/utils/devLogger';
import { TIKTOK_CAPI_GATEWAYS } from './tiktokCapiConfig';
import { splitOrderByGateway, allocateCostsForSplit, reconcilePennyDifferences } from './metaCapiPurchase';

/**
 * Track purchase across all relevant TikTok pixels
 * Reuses the split logic from Meta CAPI for consistency
 */
export const trackTikTokCapiPurchase = async (order, additionalData = {}, debug = true) => {
  if (!order || !order.id) {
    if (logger?.error) logger.error('[TikTok CAPI] Invalid order data');
    return;
  }

  try {
    if (debug && logger?.log) {
      logger.log('[TikTok CAPI] Processing purchase for order:', order.id);
    }

    // Reuse the exact same split logic as Meta
    const gatewaySplits = splitOrderByGateway(order);
    
    if (Object.keys(gatewaySplits).length === 0) {
      if (logger?.warn) logger.warn('[TikTok CAPI] No items to track for order:', order.id);
      return;
    }

    // Calculate costs for each split
    const splitsWithCosts = {};
    for (const [gateway, split] of Object.entries(gatewaySplits)) {
      if (!TIKTOK_CAPI_GATEWAYS[gateway]) continue;

      const costs = allocateCostsForSplit(order, split.items);
      splitsWithCosts[gateway] = { ...split, costs };
    }

    // Reconcile pennies
    const reconciledSplits = reconcilePennyDifferences(order, splitsWithCosts);

    // Send to each gateway in parallel
    const sendPromises = Object.entries(reconciledSplits).map(async ([gatewayKey, split]) => {
      try {
        const payload = {
          order_id: order.id,
          gateway: gatewayKey,
          value: split.costs.total,
          currency: order.currency || 'CAD',
          contents: split.items.map(item => ({
            content_id: item.sku || item.product_id?.toString(),
            content_type: 'product',
            content_name: item.name,
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.subtotal) || 0
          })),
          order_data: order,
          ...additionalData
        };

        const response = await fetch('/api/tiktok-capi/purchase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gateway ${gatewayKey} failed: ${response.status} ${errorText}`);
        }

        const result = await response.json();
        
        if (debug && logger?.log) {
          logger.log(`[TikTok CAPI] ✅ ${gatewayKey}: $${split.costs.total}`);
        }

        return { gateway: gatewayKey, success: true, value: split.costs.total };
      } catch (error) {
        if (logger?.error) logger.error(`[TikTok CAPI] ❌ ${gatewayKey} failed:`, error);
        return { gateway: gatewayKey, success: false, error: error.message };
      }
    });

    return await Promise.allSettled(sendPromises);
  } catch (error) {
    if (logger?.error) logger.error('[TikTok CAPI] Error tracking purchase:', error);
    throw error;
  }
};

