import { logger } from '@/utils/devLogger';
import { toMoney } from '@/utils/priceFormatter';
import { TIKTOK_CAPI_GATEWAYS } from './tiktokCapiConfig';
import { splitOrderByGateway, allocateCostsForSplit, reconcilePennyDifferences } from './metaCapiPurchase';
import { enrichOrderWithProductData } from './enrichOrderData';

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
    logger.log(`[TikTok CAPI] ▶️ Starting tracking for order ${order.id}`);
    logger.log(`[TikTok CAPI] Order has ${order.line_items?.length || 0} line items`);
    
    if (debug && logger?.log) {
      logger.log('[TikTok CAPI] Processing purchase for order:', order.id);
    }

    // **CRITICAL**: Enrich order with product categories BEFORE categorization
    // Without this, all products will be categorized as OTHERS
    if (logger?.log) {
      logger.log(`[TikTok CAPI] Enriching order ${order.id} with product categories...`);
    }
    
    const enrichedOrder = await enrichOrderWithProductData(order, { 
      debug: debug 
    });
    
    if (!enrichedOrder) {
      logger.error('[TikTok CAPI] ❌ Enrichment returned null/undefined');
      return;
    }
    
    if (logger?.log) {
      logger.log(`[TikTok CAPI] Order ${order.id} enrichment complete`);
    }
    
    // Log enrichment results for debugging
    const itemsWithCategories = enrichedOrder.line_items?.filter(
      item => item.categories && Array.isArray(item.categories) && item.categories.length > 0
    ).length || 0;
    logger.log(`[TikTok CAPI] ${itemsWithCategories}/${enrichedOrder.line_items?.length || 0} items have categories`);

    // Reuse the exact same split logic as Meta (now with categories!)
    const gatewaySplits = splitOrderByGateway(enrichedOrder);
    
    if (Object.keys(gatewaySplits).length === 0) {
      if (logger?.warn) logger.warn('[TikTok CAPI] No items to track for order:', order.id);
      return;
    }

    // Calculate costs for each split
    const splitsWithCosts = {};
    for (const [gateway, split] of Object.entries(gatewaySplits)) {
      if (!TIKTOK_CAPI_GATEWAYS[gateway]) continue;

      const costs = allocateCostsForSplit(enrichedOrder, split.items);
      splitsWithCosts[gateway] = { ...split, costs };
    }

    // Reconcile pennies
    const reconciledSplits = reconcilePennyDifferences(enrichedOrder, splitsWithCosts);

    // Send to each gateway in parallel
    const sendPromises = Object.entries(reconciledSplits).map(async ([gatewayKey, split]) => {
      try {
        const payload = {
          order_id: enrichedOrder.id,
          gateway: gatewayKey,
          value: split.costs.total,
          currency: enrichedOrder.currency || 'USD',
          contents: split.items.map(item => ({
            content_id: item.sku || item.product_id?.toString(),
            content_type: 'product',
            content_name: item.name,
            quantity: parseInt(item.quantity) || 1,
            price: toMoney(item.subtotal)
          })),
          order_data: enrichedOrder,
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

