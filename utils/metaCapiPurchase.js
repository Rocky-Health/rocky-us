/**
 * Meta CAPI Purchase Event Tracking with WooCommerce Line-Level Tax Support
 * Splits orders by product category with accurate tax allocation
 */

import { logger } from '@/utils/devLogger';
import { META_CAPI_GATEWAYS } from './metaCapiConfig';

/**
 * Categorize product by checking its WooCommerce categories
 */
export const categorizeProduct = (product) => {
  const productCategories = product.categories?.map(c => 
    (c.slug || c.name || c).toLowerCase()
  ) || [];
  
  // Check each gateway's category matches (in priority order)
  for (const [gatewayKey, config] of Object.entries(META_CAPI_GATEWAYS)) {
    if (gatewayKey === 'OTHERS') continue; // Skip catch-all
    
    const matches = config.categories.some(cat => 
      productCategories.includes(cat.toLowerCase())
    );
    
    if (matches) {
      return gatewayKey;
    }
  }
  
  return 'OTHERS'; // Default fallback
};

/**
 * Split order line items by gateway
 */
export const splitOrderByGateway = (order) => {
  const splits = {};
  
  order.line_items?.forEach(item => {
    const gateway = categorizeProduct(item);
    
    if (!splits[gateway]) {
      splits[gateway] = {
        items: [],
        content_ids: [],
        num_items: 0
      };
    }
    
    const itemQuantity = parseInt(item.quantity) || 1;
    
    splits[gateway].items.push(item);
    splits[gateway].content_ids.push(item.sku || item.product_id?.toString());
    splits[gateway].num_items += itemQuantity;
  });
  
  return splits;
};

/**
 * Allocate costs for a given split using WooCommerce line-level tax data
 * This respects taxable vs non-taxable items and uses WC's authoritative tax calculations
 */
export const allocateCostsForSplit = (order, splitItems) => {
  const shippingTotal = parseFloat(order.shipping_total) || 0;
  const orderDiscount = parseFloat(order.discount_total) || 0;
  const orderTotalTax = parseFloat(order.total_tax) || 0;

  // Build normalized lines list from the order
  const lines = (order.line_items || []).map(li => {
    const exTax = parseFloat(li.subtotal) || parseFloat(li.total) || 0;
    const qty = parseInt(li.quantity) || 1;
    const lineTax = parseFloat(li.total_tax) || 0;
    const taxClass = (li.tax_class || '').toLowerCase();
    const explicitNonTaxable = taxClass === 'none' || taxClass === 'zero-rate';
    
    const taxable = !explicitNonTaxable && (lineTax > 0 || taxClass !== 'none');

    return {
      id: li.id,
      priceExTax: exTax,
      totalTax: lineTax,
      taxable
    };
  });

  const splitIds = new Set(splitItems.map(i => i.id));
  const inSplit = lines.filter(l => splitIds.has(l.id));

  // Total ex-tax for all items and split items
  const S_total = lines.reduce((a, l) => a + l.priceExTax, 0) || 1;
  const S_split = inSplit.reduce((a, l) => a + l.priceExTax, 0);

  // Discounts allocated by ex-tax proportion
  const discount_split = orderDiscount * (S_split / S_total);
  const net_subtotal_split = S_split - discount_split;

  // Shipping allocated by ex-tax proportion
  const shipping_split = shippingTotal * (S_split / S_total);

  // Tax: prefer exact per-line tax if present
  let tax_split = inSplit.reduce((a, l) => a + l.totalTax, 0);

  // Fallback: allocate only among taxable lines by proportion of ex-tax
  if (!tax_split && orderTotalTax > 0) {
    const taxableLines = lines.filter(l => l.taxable);
    const taxableSum = taxableLines.reduce((a, l) => a + l.priceExTax, 0) || 1;
    const splitTaxableSum = inSplit.filter(l => l.taxable).reduce((a, l) => a + l.priceExTax, 0);
    tax_split = orderTotalTax * (splitTaxableSum / taxableSum);
  }

  const round2 = n => parseFloat((Math.round(n * 100) / 100).toFixed(2));
  
  return {
    subtotal: round2(S_split),
    discount: round2(discount_split),
    net_subtotal: round2(net_subtotal_split),
    shipping: round2(shipping_split),
    tax: round2(tax_split || 0),
    total: round2(net_subtotal_split + shipping_split + (tax_split || 0))
  };
};

/**
 * Reconcile penny differences to match WooCommerce order total exactly
 */
export const reconcilePennyDifferences = (order, splits) => {
  const wcTotal = parseFloat(order.total) || 0;
  const sumOfSplits = Object.values(splits).reduce((sum, split) => sum + split.costs.total, 0);
  const difference = parseFloat((wcTotal - sumOfSplits).toFixed(2));
  
  if (Math.abs(difference) > 0 && Math.abs(difference) <= 0.05) {
    let largestGateway = null;
    let largestNetSubtotal = 0;
    
    for (const [gateway, split] of Object.entries(splits)) {
      if (split.costs.net_subtotal > largestNetSubtotal) {
        largestNetSubtotal = split.costs.net_subtotal;
        largestGateway = gateway;
      }
    }
    
    if (largestGateway) {
      splits[largestGateway].costs.total = parseFloat(
        (splits[largestGateway].costs.total + difference).toFixed(2)
      );
    }
  }
  
  return splits;
};

/**
 * Track purchase across all relevant gateways
 * Main entry point for Meta CAPI purchase tracking
 */
export const trackMetaCapiPurchase = async (order, additionalData = {}, debug = true) => {
  if (!order || !order.id) {
    if (logger?.error) {
      logger.error('[Meta CAPI] Invalid order data - missing order or order.id');
    }
    return;
  }

  try {
    // Split order by gateway
    const gatewaySplits = splitOrderByGateway(order);
    
    if (Object.keys(gatewaySplits).length === 0) {
      if (logger?.warn) {
        logger.warn('[Meta CAPI] No items to track for order:', order.id);
      }
      return;
    }

    // Calculate costs for each split
    const splitsWithCosts = {};
    for (const [gateway, split] of Object.entries(gatewaySplits)) {
      const costs = allocateCostsForSplit(order, split.items);
      splitsWithCosts[gateway] = {
        ...split,
        costs
      };
    }

    // Reconcile penny differences
    const reconciledSplits = reconcilePennyDifferences(order, splitsWithCosts);

    // Send to each gateway in parallel
    const sendPromises = Object.entries(reconciledSplits).map(async ([gatewayKey, split]) => {
      try {
        const payload = {
          order_id: order.id,
          gateway: gatewayKey,
          value: split.costs.total,
          subtotal: split.costs.subtotal,
          net_subtotal: split.costs.net_subtotal,
          shipping: split.costs.shipping,
          tax: split.costs.tax,
          discount: split.costs.discount,
          currency: order.currency || 'CAD',
          content_ids: split.content_ids,
          num_items: split.num_items,
          order_data: order,
          ...additionalData
        };

        const response = await fetch('/api/meta-capi/purchase', {
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

        if (result.skipped) {
          if (debug && logger?.log) {
            logger.log(`[Meta CAPI] ⊘ ${gatewayKey}: Skipped (${result.reason})`);
          }
          return { gateway: gatewayKey, success: true, skipped: true, value: 0, reason: result.reason };
        }

        if (debug && logger?.log) {
          logger.log(`[Meta CAPI] ✅ ${gatewayKey}: $${split.costs.total} (${split.num_items} items)`);
        }

        return { gateway: gatewayKey, success: true, value: split.costs.total };
      } catch (error) {
        if (logger?.error) {
          logger.error(`[Meta CAPI] ❌ ${gatewayKey} failed:`, error);
        }
        return { gateway: gatewayKey, success: false, error: error.message };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    
    return results;
  } catch (error) {
    if (logger?.error) {
      logger.error('[Meta CAPI] Error tracking purchase:', error);
    }
    throw error;
  }
};

