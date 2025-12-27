# Meta/TikTok CAPI Categorization Issue - Complete Analysis

**Date:** December 27, 2025  
**Issue:** Order 489302 (ED order) still being sent to OTHERS pixel  
**Status:** 🔍 INVESTIGATING

---

## 🔴 The Problem

Despite previous fix attempts, order 489302 (an ED order) is still being categorized as OTHERS:

```
2025-12-27 17:29:16.400 [info] [Meta CAPI] Fetching order 489302 from WooCommerce...
2025-12-27 17:29:17.426 [info] [Meta CAPI] Sending event for order 489302 to OTHERS: {
  pixel_id: '799609076328562',  ← WRONG! Should be ED pixel (522677764108011)
  event_name: 'RKY_MXR',         ← WRONG! Should be RKY_TNT (ED event)
  value: 48,
  ...
}
```

---

## 🔍 Root Cause Analysis

### Expected Flow

```
1. Order Received Page loads
   ↓
2. Fetch order from /api/order (NO categories in line_items)
   ↓
3. analyticsService.trackPurchase(order)
   ↓
4. trackMetaCapiPurchase(order)
   ↓
5. ✅ enrichOrderWithProductData(order)
   ↓ Should fetch product details for each line item
   ↓ Should add categories to each line item
   ↓
6. splitOrderByGateway(enrichedOrder)
   ↓
7. categorizeProduct(item) - matches categories to gateways
   ↓
8. ✅ Send to correct pixel
```

### What's Actually Happening

The logs show:
- ✅ Order is being fetched
- ❌ NO "Enriching order..." log message (should appear at metaCapiPurchase.js line 186)
- ❌ NO "Categorizing product..." log messages (should appear at metaCapiPurchase.js line 20)
- ✅ "Fetching order from WooCommerce..." appears (from API route line 191)
- ❌ Order categorized as OTHERS

This suggests one of these issues:

### Potential Issues

#### Issue 1: enrichOrderWithProductData Not Being Called

**File:** `utils/metaCapiPurchase.js` lines 183-195

The enrichment function should be called BEFORE splitting, but logs don't show it executing.

**Possible Causes:**
- Function throwing error and being caught silently
- Logger not working properly
- Import issue with enrichOrderWithProductData

#### Issue 2: enrichOrderWithProductData Failing Silently

**File:** `utils/enrichOrderData.js` lines 1-69

The function uses `NEXT_PUBLIC_SITE_URL` which might be incorrect or the API endpoint `/api/products/id/${productId}` might be failing.

**Line 5:**
```javascript
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://myrocky.com';
```

**Problems:**
- Using client-side env var (`NEXT_PUBLIC_*`) in server-side code
- Default fallback to `myrocky.com` but US platform is `myrocky.com` (same, so OK)
- API calls might be failing and returning empty categories

#### Issue 3: Product API Not Returning Categories

**File:** `app/api/products/id/[id]/route.js` lines 25-35

The API returns:
```javascript
const productInfo = {
  id: productData.id,
  name: productData.name,
  price: productData.price,
  image: ...,
  shortDescription: productData.short_description,
  categories: productData.categories || [],  ← Empty if WooCommerce doesn't have it
};
```

**Problem:** If WooCommerce product doesn't have categories set, this returns `[]`

#### Issue 4: Category Mapping Mismatch

**File:** `utils/metaCapiConfig.js` lines 29-86

Current ED category mapping:
```javascript
ED: {
  categories: ['ed', 'erectile-dysfunction'],
  ...
}
```

**Problem:** If the actual WooCommerce product categories use different slugs (e.g., 'erectile-dysfunction-products', 'ed-treatment', etc.), they won't match.

---

## 🔧 Required Fixes

### Fix 1: Improve Enrichment Logging

Add comprehensive logging to track exactly where the process fails.

### Fix 2: Fix enrichOrderData API Calls

Use absolute URLs and proper error handling.

### Fix 3: Add Fallback Categorization

If categories are missing, check product name or SKU for keywords.

### Fix 4: Verify WooCommerce Category Slugs

Need to check actual product #489302 in WooCommerce to see its exact category slugs.

---

## 🎯 Immediate Actions

1. ✅ Add debug logging throughout the flow
2. ✅ Fix enrichOrderData to use absolute URLs
3. ✅ Add error handling that doesn't swallow errors
4. ✅ Add fallback categorization by product name
5. ⏳ Test with order 489302 or similar ED order
6. ⏳ Verify category slugs in WooCommerce match config

---

## 📝 Questions for Investigation

1. What are the actual WooCommerce category slugs for ED products on myrocky.com?
2. Is the enrichment function actually being called?
3. Are the /api/products/id/{id} calls succeeding?
4. What do the product categories look like in WooCommerce API response?

---

## 🚨 Critical Insight

Looking at the API route logs, it's fetching the order from WooCommerce (line 191 of route.js).
This should ONLY happen if `!order_data?.billing || !order_data?.line_items`.

But trackMetaCapiPurchase should be sending order_data with both billing and line_items.

**This means:** Either:
- enrichOrderWithProductData is not being called
- enrichOrderWithProductData is failing and returning original order
- enrichOrderWithProductData is not actually adding categories
- The enriched order is not being passed to the API correctly

---

**Next Step:** Apply comprehensive fixes and add extensive logging to trace exact failure point.

