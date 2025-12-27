# Meta & TikTok CAPI Categorization Bug Fix

**Date:** December 27, 2025  
**Issue:** Order 489302 (ED order) was being sent to OTHERS pixel instead of ED pixel  
**Status:** ✅ FIXED

---

## 🔴 Critical Bug Identified

### The Problem

All orders were being categorized as "OTHERS" regardless of their actual product categories. This caused:
- ED orders → sent to OTHERS pixel (799609076328562) instead of ED pixel (522677764108011)
- WL orders → sent to OTHERS pixel instead of WL pixel (1451450365779499)
- HL orders → sent to OTHERS pixel instead of HL pixel (754893718769214)
- And so on...

### Root Cause

The categorization logic in `splitOrderByGateway()` relies on product categories being present in the order's line items:

```javascript
export const categorizeProduct = (product) => {
  const productCategories = product.categories?.map(c => 
    (c.slug || c.name || c).toLowerCase()
  ) || [];
  
  // If categories is empty, this will ALWAYS return 'OTHERS'
  for (const [gatewayKey, config] of Object.entries(META_CAPI_GATEWAYS)) {
    if (gatewayKey === 'OTHERS') continue;
    
    const matches = config.categories.some(cat => 
      productCategories.includes(cat.toLowerCase())
    );
    
    if (matches) {
      return gatewayKey;
    }
  }
  
  return 'OTHERS'; // Default fallback
};
```

**However**, when orders are fetched from WooCommerce via `/api/order`, the line items **DO NOT include categories**:

```javascript
// app/api/order/route.js
const response = await axios.get(
  `${BASE_URL}/wp-json/wc/v3/orders/${order_id}?consumer_key=...`,
  // ...
);
return NextResponse.json(response.data); // ← No categories in line_items!
```

### The Flow (Before Fix)

```
Order Received Page
  ↓
Fetch order from /api/order (NO categories in line_items)
  ↓
analyticsService.trackPurchase(order)
  ↓
trackMetaCapiPurchase(order) / trackTikTokCapiPurchase(order)
  ↓
splitOrderByGateway(order)
  ↓
categorizeProduct(item) → product.categories = [] or undefined
  ↓
❌ ALL PRODUCTS → 'OTHERS'
```

---

## ✅ The Fix

### Solution: Enrich Order Data BEFORE Categorization

We already had an `enrichOrderWithProductData()` function that fetches product details (including categories) from the WooCommerce API. The fix was to call this function **before** categorization happens.

### Files Modified

#### 1. `utils/metaCapiPurchase.js`

**Changes:**
1. Added import for `enrichOrderWithProductData`
2. Added debug logging to `categorizeProduct()` to help troubleshoot future issues
3. Modified `trackMetaCapiPurchase()` to enrich order data before splitting

```javascript
import { enrichOrderWithProductData } from './enrichOrderData';

export const trackMetaCapiPurchase = async (order, additionalData = {}, debug = true) => {
  // ... validation ...

  try {
    // **CRITICAL**: Enrich order with product categories BEFORE categorization
    if (logger?.log) {
      logger.log(`[Meta CAPI] Enriching order ${order.id} with product categories...`);
    }
    
    const enrichedOrder = await enrichOrderWithProductData(order, { 
      debug: debug 
    });
    
    if (logger?.log) {
      logger.log(`[Meta CAPI] Order ${order.id} enrichment complete`);
    }
    
    // Split order by gateway (now with categories!)
    const gatewaySplits = splitOrderByGateway(enrichedOrder);
    
    // Use enrichedOrder for all subsequent operations
    // ...
  }
}
```

#### 2. `utils/tiktokCapiPurchase.js`

**Changes:**
1. Added import for `enrichOrderWithProductData`
2. Modified `trackTikTokCapiPurchase()` to enrich order data before splitting

```javascript
import { enrichOrderWithProductData } from './enrichOrderData';

export const trackTikTokCapiPurchase = async (order, additionalData = {}, debug = true) => {
  // ... validation ...

  try {
    // **CRITICAL**: Enrich order with product categories BEFORE categorization
    if (logger?.log) {
      logger.log(`[TikTok CAPI] Enriching order ${order.id} with product categories...`);
    }
    
    const enrichedOrder = await enrichOrderWithProductData(order, { 
      debug: debug 
    });
    
    if (logger?.log) {
      logger.log(`[TikTok CAPI] Order ${order.id} enrichment complete`);
    }

    // Reuse the exact same split logic as Meta (now with categories!)
    const gatewaySplits = splitOrderByGateway(enrichedOrder);
    
    // Use enrichedOrder for all subsequent operations
    // ...
  }
}
```

### The Flow (After Fix)

```
Order Received Page
  ↓
Fetch order from /api/order (NO categories in line_items)
  ↓
analyticsService.trackPurchase(order)
  ↓
trackMetaCapiPurchase(order) / trackTikTokCapiPurchase(order)
  ↓
✅ enrichOrderWithProductData(order)
  ↓ Fetches product details for each line item
  ↓ Adds categories to each line item
  ↓
splitOrderByGateway(enrichedOrder)
  ↓
categorizeProduct(item) → product.categories = ['ed', 'erectile-dysfunction']
  ↓
✅ ED PRODUCTS → 'ED' gateway
✅ WL PRODUCTS → 'WL' gateway
✅ HL PRODUCTS → 'HL' gateway
✅ etc.
```

---

## 🔍 How enrichOrderWithProductData Works

```javascript
// utils/enrichOrderData.js
export const enrichOrderWithProductData = async (order, options = {}) => {
  // Check if already enriched
  const alreadyEnriched = order.line_items?.every(
    item => item.categories && Array.isArray(item.categories) && item.categories.length > 0
  );

  if (alreadyEnriched && !force) {
    return order; // Skip if already has categories
  }

  // Fetch product details for each line item
  const enrichedLineItems = await Promise.all(
    (order.line_items || []).map(async (item) => {
      // Fetch from /api/products/id/{product_id}
      const productDetails = await fetchProductDetails(item.product_id);
      
      return {
        ...item,
        categories: productDetails.categories || [],
        category: productDetails.categories?.[0]?.name || 'General'
      };
    })
  );

  return {
    ...order,
    line_items: enrichedLineItems,
    _enriched: true
  };
};
```

---

## 📊 Expected Behavior After Fix

### For Order 489302 (ED Order)

**Before Fix:**
```
[Meta CAPI] Sending event for order 489302 to OTHERS: {
  pixel_id: '799609076328562',
  event_name: 'RKY_MXR',
  value: 48,
  ...
}
```

**After Fix:**
```
[Meta CAPI] Enriching order 489302 with product categories...
[Meta CAPI] Categorizing product 123456:
  name: "ED Consultation"
  categories: ['ed', 'erectile-dysfunction']
  has_categories: true
[Meta CAPI] Product matched to ED gateway
[Meta CAPI] Sending event for order 489302 to ED: {
  pixel_id: '522677764108011',
  event_name: 'RKY_TNT',
  value: 48,
  ...
}
```

---

## 🧪 Testing Checklist

- [ ] Test ED order → should go to ED pixel (522677764108011)
- [ ] Test WL order → should go to WL pixel (1451450365779499)
- [ ] Test HL order → should go to HL pixel (754893718769214)
- [ ] Test SMOKING order → should go to SMOKING pixel (1311848663202831)
- [ ] Test SKINCARE order → should go to SKINCARE pixel (1843271713209245)
- [ ] Test mixed order (ED + WL) → should split correctly to both pixels
- [ ] Check logs for enrichment messages
- [ ] Verify no orders are going to OTHERS unless they truly don't match any category

---

## 🚨 Important Notes

1. **Performance Impact:** Each order now makes additional API calls to fetch product details. This is necessary for correct categorization but adds ~100-500ms per order depending on number of line items.

2. **Caching:** The enrichment function checks if categories are already present before fetching, so if the order is already enriched, it skips the API calls.

3. **Logging:** Enhanced logging has been added to `categorizeProduct()` to help debug future categorization issues. Look for these log messages:
   - `[Meta CAPI] Categorizing product {id}`
   - `[Meta CAPI] Product matched to {gateway} gateway`
   - `[Meta CAPI] Product {id} defaulting to OTHERS - no category match found`

4. **Currency:** Also updated default currency from 'CAD' to 'USD' for US platform consistency.

---

## 📝 Related Files

- `utils/metaCapiPurchase.js` - Meta CAPI tracking logic
- `utils/tiktokCapiPurchase.js` - TikTok CAPI tracking logic
- `utils/enrichOrderData.js` - Order enrichment utility
- `utils/metaCapiConfig.js` - Pixel configuration and category mappings
- `utils/tiktokCapiConfig.js` - TikTok pixel configuration
- `app/api/order/route.js` - Order fetching endpoint
- `app/api/products/id/[id]/route.js` - Product details endpoint

---

## 🎯 Next Steps

1. Deploy the fix to production
2. Monitor logs for order 489302 or similar ED orders
3. Verify events are being sent to correct pixels in Meta Events Manager
4. Check TikTok Events Manager for correct pixel attribution
5. If issues persist, check the category mappings in `metaCapiConfig.js` and `tiktokCapiConfig.js`

