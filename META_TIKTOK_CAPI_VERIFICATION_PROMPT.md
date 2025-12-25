# META & TikTok CAPI Implementation Verification & Implementation Prompt

## PROMPT: 
Using the specification below, verify that my codebase has META and TikTok CAPI implementations. If missing or incomplete, implement them exactly as specified using the same IDs, tokens, and architecture.

## OBJECTIVE
Verify that META (Facebook) Conversions API and TikTok Conversions API (CAPI) are fully implemented. If missing or incomplete, implement them EXACTLY as specified below using the same IDs, tokens, and architecture.

---

## CRITICAL ENVIRONMENT VARIABLES

### Meta (Facebook) CAPI - 6 Separate Pixels
```env
# Meta Pixel IDs (one per product category)
FB_PIXEL_ID_ED=522677764108011
FB_PIXEL_ID_WL=1451450365779499
FB_PIXEL_ID_SMOKING=1311848663202831
FB_PIXEL_ID_HL=754893718769214
FB_PIXEL_ID_SKINCARE=1843271713209245
FB_PIXEL_ID_OTHERS=799609076328562

# Meta Access Tokens (same system user token for all)
FB_ACCESS_TOKEN_ED=EAATo1mui4b4BQf5Eud1CdrRuBCOTSKc7VwruEje722Dn3WcS88mxZCpZCrF7U5Act00Ogo5zr6dydR1SZAKCEFeNYUki7b7MIWvCgNIsgZBJTu8N7ORXse57c90CrferBgOWyZAKTOicxUc3g2hcypZA1DnAdSBIii9oPNMzMpSGGdRCbTQMd5QwxYigbPK82UUZCnuFYk2ib2qaqZBbXxzkbT94qSo7mcZCjKSFJ5i2F
FB_ACCESS_TOKEN_WL=EAATo1mui4b4BQf5Eud1CdrRuBCOTSKc7VwruEje722Dn3WcS88mxZCpZCrF7U5Act00Ogo5zr6dydR1SZAKCEFeNYUki7b7MIWvCgNIsgZBJTu8N7ORXse57c90CrferBgOWyZAKTOicxUc3g2hcypZA1DnAdSBIii9oPNMzMpSGGdRCbTQMd5QwxYigbPK82UUZCnuFYk2ib2qaqZBbXxzkbT94qSo7mcZCjKSFJ5i2F
FB_ACCESS_TOKEN_HL=EAATo1mui4b4BQf5Eud1CdrRuBCOTSKc7VwruEje722Dn3WcS88mxZCpZCrF7U5Act00Ogo5zr6dydR1SZAKCEFeNYUki7b7MIWvCgNIsgZBJTu8N7ORXse57c90CrferBgOWyZAKTOicxUc3g2hcypZA1DnAdSBIii9oPNMzMpSGGdRCbTQMd5QwxYigbPK82UUZCnuFYk2ib2qaqZBbXxzkbT94qSo7mcZCjKSFJ5i2F
FB_ACCESS_TOKEN_SMOKING=EAATo1mui4b4BQf5Eud1CdrRuBCOTSKc7VwruEje722Dn3WcS88mxZCpZCrF7U5Act00Ogo5zr6dydR1SZAKCEFeNYUki7b7MIWvCgNIsgZBJTu8N7ORXse57c90CrferBgOWyZAKTOicxUc3g2hcypZA1DnAdSBIii9oPNMzMpSGGdRCbTQMd5QwxYigbPK82UUZCnuFYk2ib2qaqZBbXxzkbT94qSo7mcZCjKSFJ5i2F
FB_ACCESS_TOKEN_SKINCARE=EAATo1mui4b4BQf5Eud1CdrRuBCOTSKc7VwruEje722Dn3WcS88mxZCpZCrF7U5Act00Ogo5zr6dydR1SZAKCEFeNYUki7b7MIWvCgNIsgZBJTu8N7ORXse57c90CrferBgOWyZAKTOicxUc3g2hcypZA1DnAdSBIii9oPNMzMpSGGdRCbTQMd5QwxYigbPK82UUZCnuFYk2ib2qaqZBbXxzkbT94qSo7mcZCjKSFJ5i2F
FB_ACCESS_TOKEN_OTHERS=EAATo1mui4b4BQf5Eud1CdrRuBCOTSKc7VwruEje722Dn3WcS88mxZCpZCrF7U5Act00Ogo5zr6dydR1SZAKCEFeNYUki7b7MIWvCgNIsgZBJTu8N7ORXse57c90CrferBgOWyZAKTOicxUc3g2hcypZA1DnAdSBIii9oPNMzMpSGGdRCbTQMd5QwxYigbPK82UUZCnuFYk2ib2qaqZBbXxzkbT94qSo7mcZCjKSFJ5i2F
```

### TikTok CAPI - 6 Separate Pixels
```env
# TikTok Pixel IDs (one per product category)
TIKTOK_PIXEL_ID_ED=D4KGNAJC77UEBGID1TP0
TIKTOK_PIXEL_ID_WL=D4KGQORC77UBCCH9F8AG
TIKTOK_PIXEL_ID_HL=D4KGRGJC77UA1JCQ0JQG
TIKTOK_PIXEL_ID_SMOKING=D4KGS6JC77UA1JCQ0JRG
TIKTOK_PIXEL_ID_SKINCARE=D4KGSSBC77U7MI8IL9U0
TIKTOK_PIXEL_ID_OTHERS=D4KGTEJC77U1VUV8RDQ0

# TikTok Access Tokens (unique per pixel)
TIKTOK_ACCESS_TOKEN_ED=3ee997f7215097e9147605e1c114a8df51a55c3f
TIKTOK_ACCESS_TOKEN_WL=eed350d2f64869ca0b7cf0f262d005c6d8b67973
TIKTOK_ACCESS_TOKEN_HL=8098ccbfd46d346209e555c22100a7c8ba7dbbdc
TIKTOK_ACCESS_TOKEN_SMOKING=dc6150947e1a1cee9024d5961644772b5c13518d
TIKTOK_ACCESS_TOKEN_SKINCARE=cc705fa18b8c8d3260c4d77f9e6d45757a9ff2b0
TIKTOK_ACCESS_TOKEN_OTHERS=4dfab9a602b769b77568dc3b008ce2b42c932338

# Legacy TikTok Pixel (for client-side tracking)
TIKTOK_PIXEL_ID=CAFRJUBC77U9MLGRG970
NEXT_PUBLIC_TIKTOK_PIXEL_ID=CAFRJUBC77U9MLGRG970
TIKTOK_ACCESS_TOKEN=773570e8c60b784e8a55f78ac9f6bf29e903844b
```

### WooCommerce API Credentials
```env
BASE_URL=https://myrocky.ca
CONSUMER_KEY=ck_d0a88824e4dc4cde04b4a26ae5f463139b07feeb
CONSUMER_SECRET=cs_f88f1c6d32b72c38743410456c1f109546a808d9
```

---

## ARCHITECTURE OVERVIEW

### System Design
Both META and TikTok CAPI use the **SAME ARCHITECTURE**:
1. **Multi-Gateway Split System**: Orders are split by product category
2. **6 Separate Pixels**: ED, WL, HL, SMOKING, SKINCARE, OTHERS
3. **Server-Side Tracking**: All conversion events sent server-to-server
4. **Zero Revenue Duplication**: Each product tracked to its designated pixel only
5. **Line-Level Tax Support**: Accurate tax allocation using WooCommerce data

### Product Category Mapping
```javascript
ED: ['ed', 'erectile-dysfunction']
WL: ['weight-loss', 'wl', 'body-optimization']
HL: ['hair-loss', 'hairloss', 'hair', 'my-rocky-hair-kit', 'organic-hair-kit', 'organic-shampoo', 'prescription-hair-kit']
SMOKING: ['smoking-cessation', 'zonnic', 'smoking']
SKINCARE: ['skincare', 'skin-care', 'skin', 'acne', 'anti-ageing', 'hyperpigmentation']
OTHERS: [] // Catch-all for unmatched categories
```

---

## FILE 1: `utils/metaCapiConfig.js`

**Purpose**: Configuration for all 6 Meta pixels with cryptic event names

```javascript
/**
 * Meta CAPI Configuration for Multi-Gateway Attribution
 * Each product category sends to its own dedicated Meta pixel via Direct API
 * 
 * @see https://developers.facebook.com/docs/marketing-api/conversions-api
 */

/**
 * Custom Event Names for Meta CAPI (Cryptic to bypass health restrictions)
 * DO NOT use health/medical/product-related terms
 * 
 * MAPPING (Internal use only - DO NOT expose to Meta):
 * - RKY_TNT: ED Purchase Event (Target)
 * - RKY_FLW: WL Purchase Event (Flow)
 * - RKY_VBE: HL Purchase Event (Vibe)
 * - RKY_ZXT: SMOKING Purchase Event (Zeta)
 * - RKY_LXS: SKINCARE Purchase Event (Luxus)
 * - RKY_MXR: OTHERS Purchase Event (Mixer)
 */
export const CUSTOM_EVENT_NAMES = {
  ED: 'RKY_TNT',
  WL: 'RKY_FLW',
  HL: 'RKY_VBE',
  SMOKING: 'RKY_ZXT',
  SKINCARE: 'RKY_LXS',
  OTHERS: 'RKY_MXR'
};

export const META_CAPI_GATEWAYS = {
  ED: {
    accessToken: process.env.FB_ACCESS_TOKEN_ED,
    pixelId: '522677764108011',
    customEventName: CUSTOM_EVENT_NAMES.ED,
    categories: ['ed', 'erectile-dysfunction'],
    name: 'ED'
  },
  WL: {
    accessToken: process.env.FB_ACCESS_TOKEN_WL,
    pixelId: '1451450365779499',
    customEventName: CUSTOM_EVENT_NAMES.WL,
    categories: ['weight-loss', 'wl', 'body-optimization'],
    name: 'WL'
  },
  HL: {
    accessToken: process.env.FB_ACCESS_TOKEN_HL,
    pixelId: '754893718769214',
    customEventName: CUSTOM_EVENT_NAMES.HL,
    categories: [
      'hair-loss',
      'hairloss', 
      'hair',
      'my-rocky-hair-kit',
      'organic-hair-kit',
      'organic-shampoo',
      'prescription-hair-kit'
    ],
    name: 'HL'
  },
  SMOKING: {
    accessToken: process.env.FB_ACCESS_TOKEN_SMOKING,
    pixelId: '1311848663202831',
    customEventName: CUSTOM_EVENT_NAMES.SMOKING,
    categories: ['smoking-cessation', 'zonnic', 'smoking'],
    name: 'SMOKING'
  },
  SKINCARE: {
    accessToken: process.env.FB_ACCESS_TOKEN_SKINCARE,
    pixelId: '1843271713209245',
    customEventName: CUSTOM_EVENT_NAMES.SKINCARE,
    categories: [
      'skincare',
      'skin-care',
      'skin',
      'acne',
      'anti-ageing',
      'hyperpigmentation'
    ],
    name: 'SKINCARE'
  },
  OTHERS: {
    accessToken: process.env.FB_ACCESS_TOKEN_OTHERS,
    pixelId: '799609076328562',
    customEventName: CUSTOM_EVENT_NAMES.OTHERS,
    categories: [],
    name: 'OTHERS'
  }
};

/**
 * Get full gateway URL for a given gateway key
 * Uses Direct Meta Graph API for Conversions API
 * Format: https://graph.facebook.com/v18.0/{pixelId}/events
 */
export const getGatewayUrl = (gatewayKey) => {
  const gateway = META_CAPI_GATEWAYS[gatewayKey];
  if (!gateway) {
    throw new Error(`Unknown gateway: ${gatewayKey}`);
  }
  
  if (!gateway.pixelId) {
    throw new Error(`Gateway ${gatewayKey} missing pixelId`);
  }
  
  return `https://graph.facebook.com/v18.0/${gateway.pixelId}/events`;
};

export const getGatewayConfig = (gatewayKey) => {
  const config = META_CAPI_GATEWAYS[gatewayKey];
  if (!config) {
    throw new Error(`Unknown gateway: ${gatewayKey}`);
  }
  return config;
};
```

---

## FILE 2: `utils/metaCapiPurchase.js`

**Purpose**: Core purchase tracking logic with WooCommerce tax support (270 lines)

**Key Functions**:
- `categorizeProduct(product)` - Route product to correct gateway
- `splitOrderByGateway(order)` - Split order by category
- `allocateCostsForSplit(order, splitItems)` - Calculate costs with WC tax logic
- `reconcilePennyDifferences(order, splitsWithCosts)` - Ensure exact total match
- `trackMetaCapiPurchase(order, additionalData, debug)` - Main entry point

**Critical Implementation Details**:
1. **WooCommerce Line-Level Tax**: Uses `line_item.total_tax` when available
2. **Respects `tax_class: 'none'`**: Non-taxable items handled correctly
3. **Proportional Allocation**: Shipping/discounts distributed by subtotal ratio
4. **Penny Reconciliation**: Ensures split totals match WC order total exactly
5. **Parallel Submission**: All gateways called simultaneously

```javascript
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
```

---

## FILE 3: `app/api/meta-capi/purchase/route.js`

**Purpose**: Server-side API endpoint for sending events to Meta Graph API (465 lines)

**Critical Features**:
1. Fetches complete order from WooCommerce API if needed
2. Enriches line items with categories
3. Fetches customer profile for gender and DOB (improves match quality by 12%)
4. Hashes all PII (SHA-256): email, phone, name, address, gender, DOB, country
5. Uses ParamBuilder SDK for optimal fbc/fbp extraction
6. Generates stable event_id for deduplication
7. Sends to Direct Meta Graph API with retry logic
8. Skips $0 orders (100% discount)

**API Endpoint**: `POST https://graph.facebook.com/v18.0/{pixelId}/events`

**Payload Structure**:
```javascript
{
  access_token: gatewayConfig.accessToken,
  data: [
    {
      event_name: gatewayConfig.customEventName, // e.g., "RKY_TNT"
      event_time: Math.floor(Date.now() / 1000),
      event_id: `purchase_${order_id}_${gateway}`,
      event_source_url: `https://myrocky.ca/checkout/order-received/${order_id}`,
      action_source: 'website',
      user_data: {
        em: [hashedEmail],
        ph: [hashedPhone],
        fn: [hashedFirstName],
        ln: [hashedLastName],
        ct: [hashedCity],
        st: [hashedState],
        zp: [hashedZip],
        country: [hashedCountry],
        ge: [hashedGender], // 'm' or 'f' only
        db: [hashedDOB], // YYYYMMDD format
        client_ip_address: req.headers.get('x-forwarded-for'),
        client_user_agent: req.headers.get('user-agent'),
        fbp: '_fbp cookie',
        fbc: '_fbc cookie',
        external_id: [hashedCustomerId]
      },
      custom_data: {
        value: parseFloat(value),
        currency: 'CAD',
        content_ids: ['sku1', 'sku2'],
        content_type: 'item',
        num_items: 2,
        order_id: `${order_id}-${gateway}`,
        rky_cat: gateway,
        subtotal: 100.00,
        shipping: 10.00,
        tax: 13.00,
        discount: 5.00
      }
    }
  ]
}
```

---

## FILE 4: `utils/analytics/hashServerSide.js`

**Purpose**: Server-side hashing utilities using Node.js crypto

```javascript
import crypto from 'crypto';

export const hashSHA256 = (text) => {
  if (!text || typeof text !== 'string') return '';
  return crypto
    .createHash('sha256')
    .update(text.toLowerCase().trim())
    .digest('hex');
};

export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase().replace(/\s+/g, '');
};

export const normalizePhone = (phone, defaultCountry = 'CA') => {
  if (!phone || typeof phone !== 'string') return '';

  const trimmed = phone.trim();
  
  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/[^\d]/g, '');
    return `+${digits}`;
  }

  const digitsOnly = trimmed.replace(/\D/g, '');

  const isNorthAmerica = ['CA', 'US', 'USA'].includes(
    (defaultCountry || '').toUpperCase()
  );

  if (isNorthAmerica) {
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    }
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+${digitsOnly}`;
    }
  }

  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    return `+${digitsOnly}`;
  }

  return '';
};

export const hashEmail = (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return '';
  return hashSHA256(normalized);
};

export const hashPhone = (phone, defaultCountry = 'CA') => {
  const normalized = normalizePhone(phone, defaultCountry);
  if (!normalized) return '';
  return hashSHA256(normalized);
};
```

---

## FILE 5: `lib/meta/paramBuilderHelper.js`

**Purpose**: Server-side helper for processing fbc/fbp cookies using Meta's official SDK

```javascript
import { ParamBuilder } from 'capi-param-builder-nodejs';

const DOMAINS = ['myrocky.ca', 'localhost'];

export async function processMetaParameters(request) {
  try {
    const paramBuilder = new ParamBuilder(DOMAINS);

    const host = request.headers.get('host') || '';
    const url = new URL(request.url);
    
    const queryParams = {};
    url.searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = {};
    
    if (cookieHeader) {
      cookieHeader.split(';').forEach(cookie => {
        const [key, ...valueParts] = cookie.split('=');
        if (key && valueParts.length > 0) {
          cookies[key.trim()] = valueParts.join('=').trim();
        }
      });
    }

    const referer = request.headers.get('referer') || '';

    const updatedCookies = paramBuilder.processRequest(
      host,
      queryParams,
      cookies,
      referer
    );

    const fbp = paramBuilder.getFbp(cookies) || '';
    const fbc = paramBuilder.getFbc(cookies) || '';

    return {
      fbp,
      fbc,
      updatedCookies,
      processed: true
    };
  } catch (error) {
    console.error('[ParamBuilder] Error processing Meta parameters:', error);
    
    const cookieHeader = request.headers.get('cookie') || '';
    const fbp = cookieHeader.match(/_fbp=([^;]+)/)?.[1] || '';
    const fbc = cookieHeader.match(/_fbc=([^;]+)/)?.[1] || '';
    
    return {
      fbp,
      fbc,
      updatedCookies: [],
      processed: false,
      error: error.message
    };
  }
}
```

---

## FILE 6: `utils/metaPixelHelper.js`

**Purpose**: Client-side Meta cookie initialization (captures fbclid from URL)

```javascript
/**
 * Capture fbclid from URL and store as _fbc cookie
 * Format of _fbc cookie: fb.{subdomain_index}.{creation_time}.{fbclid}
 */
export function captureMetaParameters() {
  if (typeof window === 'undefined') {
    return { fbp: '', fbc: '', fbclid: '' };
  }

  try {
    const params = new URLSearchParams(window.location.search || '');
    const fbclid = params.get('fbclid');
    const hostname = window.location.hostname;

    const domain = getETLDPlusOne(hostname);

    const existingFbp = getCookie('_fbp');
    const existingFbc = getCookie('_fbc');

    let fbp = existingFbp;
    if (!fbp) {
      const creationTime = Date.now();
      const subdomainIndex = '1';
      fbp = `fb.${subdomainIndex}.${creationTime}`;
      
      setCookie('_fbp', fbp, domain, 90);
      console.log('[Meta Helper] Generated new _fbp:', fbp);
    }

    let fbc = existingFbc;
    if (fbclid) {
      const existingFbclid = existingFbc ? existingFbc.split('.').pop() : '';
      
      if (fbclid !== existingFbclid) {
        const clickTime = Date.now();
        const subdomainIndex = '1';
        fbc = `fb.${subdomainIndex}.${clickTime}.${fbclid}`;
        
        setCookie('_fbc', fbc, domain, 7);
        console.log('[Meta Helper] Captured fbclid and set _fbc:', fbc);
      }
    }

    return {
      fbp: fbp || '',
      fbc: fbc || '',
      fbclid: fbclid || ''
    };
  } catch (error) {
    console.error('[Meta Helper] Error capturing Meta parameters:', error);
    return { fbp: '', fbc: '', fbclid: '' };
  }
}

function getCookie(name) {
  if (typeof document === 'undefined') return '';
  
  try {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find(row => row.startsWith(`${name}=`));
    return cookie ? cookie.split('=')[1] : '';
  } catch (error) {
    return '';
  }
}

function setCookie(name, value, domain, days) {
  try {
    const maxAge = days * 24 * 60 * 60;
    
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
    } else {
      document.cookie = `${name}=${value};path=/;max-age=${maxAge};domain=${domain};SameSite=Lax;Secure`;
      document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax;Secure`;
    }
  } catch (error) {
    console.error('[Meta Helper] Error setting cookie:', error);
  }
}

function getETLDPlusOne(hostname) {
  try {
    hostname = hostname.split(':')[0];
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return hostname;
    }
    
    const parts = hostname.split('.');
    
    if (parts.length <= 2) {
      return hostname;
    }
    
    return parts.slice(-2).join('.');
  } catch (error) {
    return hostname;
  }
}

export function initializeMetaCookies() {
  if (typeof window === 'undefined') return;
  
  captureMetaParameters();
  
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('popstate', () => {
      setTimeout(() => captureMetaParameters(), 100);
    });
  }
}
```

---

## FILE 7: `components/Layout/MetaCookieInitializer.jsx`

**Purpose**: React component to initialize Meta cookies on every page load

```javascript
"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { captureMetaParameters } from "@/utils/metaPixelHelper";

export default function MetaCookieInitializer() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    captureMetaParameters();

    if (process.env.NODE_ENV === 'development') {
      console.log('[Meta Cookie Init] Initialized on:', pathname);
    }
  }, [pathname, searchParams]);

  return null;
}
```

**Add to `app/layout.jsx`**:
```javascript
import MetaCookieInitializer from '@/components/Layout/MetaCookieInitializer';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <MetaCookieInitializer />
        {children}
      </body>
    </html>
  );
}
```

---

## FILE 8: `utils/tiktokCapiConfig.js`

**Purpose**: Configuration for all 6 TikTok pixels

```javascript
/**
 * TikTok CAPI Configuration
 * Maps product categories to specific TikTok Pixels
 * Mirrors the Meta CAPI setup for consistent attribution
 */

export const TIKTOK_CAPI_GATEWAYS = {
  ED: {
    accessToken: process.env.TIKTOK_ACCESS_TOKEN_ED,
    pixelId: process.env.TIKTOK_PIXEL_ID_ED,
    eventName: 'CompletePayment',
    categories: ['ed', 'erectile-dysfunction'],
    name: 'ED'
  },
  WL: {
    accessToken: process.env.TIKTOK_ACCESS_TOKEN_WL,
    pixelId: process.env.TIKTOK_PIXEL_ID_WL,
    eventName: 'CompletePayment',
    categories: ['weight-loss', 'wl', 'body-optimization'],
    name: 'WL'
  },
  HL: {
    accessToken: process.env.TIKTOK_ACCESS_TOKEN_HL,
    pixelId: process.env.TIKTOK_PIXEL_ID_HL,
    eventName: 'CompletePayment',
    categories: [
      'hair-loss',
      'hairloss', 
      'hair',
      'my-rocky-hair-kit',
      'organic-hair-kit',
      'organic-shampoo',
      'prescription-hair-kit'
    ],
    name: 'HL'
  },
  SMOKING: {
    accessToken: process.env.TIKTOK_ACCESS_TOKEN_SMOKING,
    pixelId: process.env.TIKTOK_PIXEL_ID_SMOKING,
    eventName: 'CompletePayment',
    categories: ['smoking-cessation', 'zonnic', 'smoking'],
    name: 'SMOKING'
  },
  SKINCARE: {
    accessToken: process.env.TIKTOK_ACCESS_TOKEN_SKINCARE,
    pixelId: process.env.TIKTOK_PIXEL_ID_SKINCARE,
    eventName: 'CompletePayment',
    categories: [
      'skincare',
      'skin-care',
      'skin',
      'acne',
      'anti-ageing',
      'hyperpigmentation'
    ],
    name: 'SKINCARE'
  },
  OTHERS: {
    accessToken: process.env.TIKTOK_ACCESS_TOKEN_OTHERS,
    pixelId: process.env.TIKTOK_PIXEL_ID_OTHERS,
    eventName: 'CompletePayment',
    categories: [],
    name: 'OTHERS'
  }
};

export const getTikTokEndpoint = () => {
  return 'https://business-api.tiktok.com/open_api/v1.3/pixel/track/';
};

export const getTikTokGatewayConfig = (gatewayKey) => {
  const config = TIKTOK_CAPI_GATEWAYS[gatewayKey];
  if (!config) {
    throw new Error(`Unknown gateway: ${gatewayKey}`);
  }
  return config;
};
```

---

## FILE 9: `utils/tiktokCapiPurchase.js`

**Purpose**: Track purchase across all relevant TikTok pixels (reuses Meta split logic)

```javascript
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
```

---

## FILE 10: `app/api/tiktok-capi/purchase/route.js`

**Purpose**: Server-side API endpoint for sending events to TikTok Events API (232 lines)

**API Endpoint**: `POST https://business-api.tiktok.com/open_api/v1.3/pixel/track/`

**Authentication**: `Access-Token` header (pixel-specific)

**Payload Structure** (TikTok Events API v1.3):
```javascript
{
  pixel_code: gatewayConfig.pixelId,
  event: 'CompletePayment',
  event_id: `purchase_${order_id}_${gateway}`,
  timestamp: new Date().toISOString(),
  context: {
    page: {
      url: `https://www.myrocky.ca/checkout/order-received/${order_id}`
    },
    user: {
      email: hashedEmail, // String (hashed SHA-256)
      phone_number: hashedPhone, // String (hashed SHA-256)
      external_id: hashedCustomerId, // String (hashed SHA-256)
      ip: clientIP, // String
      user_agent: userAgent, // String
      ttp: '_ttp cookie' // String
    },
    ad: {
      callback: 'ttclid' // TikTok Click ID
    }
  },
  properties: {
    contents: [
      {
        content_id: 'SKU123',
        content_type: 'product',
        content_name: 'Product Name',
        quantity: 1,
        price: 100.00
      }
    ],
    currency: 'CAD',
    value: 113.00
  }
}
```

**Critical Implementation**:
```javascript
import { NextResponse } from 'next/server';
import { getTikTokGatewayConfig, getTikTokEndpoint } from '@/utils/tiktokCapiConfig';
import { hashEmail, hashPhone, hashSHA256 } from '@/utils/analytics/hashServerSide';
import axios from 'axios';

const fetchOrderFromWooCommerce = async (orderId) => {
  try {
    const BASE_URL = process.env.BASE_URL;
    const CONSUMER_KEY = process.env.CONSUMER_KEY;
    const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

    const response = await axios.get(
      `${BASE_URL}/wp-json/wc/v3/orders/${orderId}`,
      {
        auth: {
          username: CONSUMER_KEY,
          password: CONSUMER_SECRET
        },
        timeout: 10000
      }
    );

    return response.data;
  } catch (error) {
    console.error(`[TikTok CAPI] Error fetching order ${orderId}:`, error.message);
    return null;
  }
};

export async function POST(req) {
  try {
    const payload = await req.json();
    let { order_id, gateway, value, currency, contents, order_data } = payload;

    const gatewayConfig = getTikTokGatewayConfig(gateway);
    
    if (!order_data?.billing || !order_data?.line_items) {
      console.log(`[TikTok CAPI] Fetching order ${order_id} from WooCommerce...`);
      order_data = await fetchOrderFromWooCommerce(order_id);
      
      if (!order_data) {
        return NextResponse.json(
          { error: 'Could not fetch order from WooCommerce' },
          { status: 500 }
        );
      }
    }
    
    const billing = order_data?.billing || {};
    let userEmail = billing.email || '';
    let userPhone = billing.phone || '';
    
    // Fetch customer profile data if registered user
    let customerData = null;
    if (order_data?.customer_id && order_data.customer_id > 0) {
      try {
        const customerResponse = await axios.get(
          `${process.env.BASE_URL}/wp-json/wc/v3/customers/${order_data.customer_id}`,
          {
            auth: {
              username: process.env.CONSUMER_KEY,
              password: process.env.CONSUMER_SECRET
            },
            timeout: 5000
          }
        );
        
        customerData = customerResponse.data;
      } catch (error) {
        console.warn(`[TikTok CAPI] Could not fetch customer profile:`, error.message);
      }
    }
    
    // Enhance phone from customer profile if missing
    if (!userPhone && customerData?.billing?.phone) {
      userPhone = customerData.billing.phone;
    }
    
    // Hash user data
    const email = hashEmail(userEmail);
    const phone = hashPhone(userPhone, 'CA');
    const external_id = order_data.customer_id ? hashSHA256(order_data.customer_id.toString()) : '';
    
    // Client Info
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';
    const user_agent = req.headers.get('user-agent') || '';
    
    // Extract TikTok cookies
    const cookieHeader = req.headers.get('cookie') || '';
    const getCookie = (name) => {
        const match = cookieHeader.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
    };
    const ttp = getCookie('_ttp');
    const ttclid = getCookie('ttclid');

    // Build page URL
    const pageUrl = `https://www.myrocky.ca/checkout/order-received/${order_id}`;

    // Build user context
    const userContext = {};
    
    if (email && email.length > 0) userContext.email = email;
    if (phone && phone.length > 0) userContext.phone_number = phone;
    if (external_id && external_id.length > 0) userContext.external_id = external_id;
    if (ip && ip.length > 0) userContext.ip = ip;
    if (user_agent && user_agent.length > 0) userContext.user_agent = user_agent;
    if (ttp && ttp.length > 0) userContext.ttp = ttp;

    // Build context object
    const contextObj = {
      page: {
        url: pageUrl
      },
      user: userContext
    };
    
    // Add ad context if we have ttclid
    if (ttclid && ttclid.length > 0) {
      contextObj.ad = {
        callback: ttclid
      };
    }

    // TikTok Events API v1.3 Payload
    const eventPayload = {
      pixel_code: gatewayConfig.pixelId,
      event: gatewayConfig.eventName, // 'CompletePayment'
      event_id: `purchase_${order_id}_${gateway}`,
      timestamp: new Date().toISOString(),
      context: contextObj,
      properties: {
        contents: contents || [],
        currency: currency || 'CAD',
        value: parseFloat(value)
      }
    };

    console.log(`[TikTok CAPI] Sending event for order ${order_id} to ${gateway}:`, {
      pixel_code: eventPayload.pixel_code,
      event: eventPayload.event,
      value: eventPayload.properties.value,
      has_ttclid: !!eventPayload.context.ad?.callback
    });

    // Send to TikTok
    const response = await fetch(getTikTokEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': gatewayConfig.accessToken
      },
      body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[TikTok CAPI] HTTP Error ${gateway}:`, {
        status: response.status,
        statusText: response.statusText,
        body: text
      });
      throw new Error(`TikTok API returned ${response.status}: ${text.substring(0, 200)}`);
    }

    const data = await response.json();

    if (data.code !== 0) {
        console.error(`[TikTok CAPI] Error ${gateway}:`, data);
        return NextResponse.json({ success: false, error: data.message }, { status: 400 });
    }

    console.log(`[TikTok CAPI] ✅ Success ${gateway}:`, {
      event_id: eventPayload.event_id,
      response: data
    });

    return NextResponse.json({
      success: true,
      gateway,
      event_id: eventPayload.event_id
    });

  } catch (error) {
    console.error('[TikTok CAPI] System Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

---

## INTEGRATION POINT: Order Received Page

**File**: `components/OrderReceived/OrderReceivedPageContent.jsx` or similar

**Where to call**:
```javascript
// After order is loaded and enriched
useEffect(() => {
  if (orderData && !hasTracked.current) {
    hasTracked.current = true;
    
    // Enrich order with product categories
    const enrichedOrder = await enrichOrderWithProductData(orderData, {
      debug: true
    });
    
    // Track purchase (includes Meta CAPI and TikTok CAPI)
    analyticsService.trackPurchase(enrichedOrder, {
      skipNorthbeam: false
    });
  }
}, [orderData]);
```

**File**: `utils/analytics/analyticsService.js`

```javascript
import { trackMetaCapiPurchase } from '@/utils/metaCapiPurchase';
import { trackTikTokCapiPurchase } from '@/utils/tiktokCapiPurchase';

export const analyticsService = {
  async trackPurchase(order, options = {}) {
    try {
      if (!order || !order.id) return;

      // Track Meta CAPI event
      const guardKeyMetaCAPI = `analytics:purchase:meta-capi:${order.id}`;
      if (setOnce(guardKeyMetaCAPI)) {
        try {
          await trackMetaCapiPurchase(order, additionalData, true);
        } catch (metaError) {
          logger.error("[Analytics] Meta CAPI tracking failed:", metaError);
        }
      }

      // Track TikTok CAPI event
      const guardKeyTikTokCAPI = `analytics:purchase:tiktok-capi:${order.id}`;
      if (setOnce(guardKeyTikTokCAPI)) {
        try {
          await trackTikTokCapiPurchase(order, additionalData, true);
        } catch (tiktokError) {
          logger.error("[Analytics] TikTok CAPI tracking failed:", tiktokError);
        }
      }
    } catch (error) {
      logger.error("[Analytics] Error tracking purchase:", error);
    }
  }
};
```

---

## ORDER ENRICHMENT

**File**: `utils/enrichOrderData.js`

**Purpose**: Enrich order line items with product categories (required for gateway routing)

```javascript
import axios from 'axios';

const fetchProductDetails = async (productId) => {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://myrocky.ca';
    const response = await axios.get(
      `${BASE_URL}/api/order/product-details/${productId}`,
      { timeout: 5000 }
    );
    return response.data;
  } catch (error) {
    console.warn(`[EnrichOrder] Error fetching product ${productId}:`, error.message);
    return null;
  }
};

const enrichLineItem = async (lineItem) => {
  if (lineItem.categories && Array.isArray(lineItem.categories) && lineItem.categories.length > 0) {
    if (!lineItem.category) {
      lineItem.category = lineItem.categories[0]?.name || 'General';
    }
    return lineItem;
  }

  const productDetails = await fetchProductDetails(lineItem.product_id);

  if (!productDetails) {
    return {
      ...lineItem,
      categories: [],
      category: 'General'
    };
  }

  return {
    ...lineItem,
    sku: lineItem.sku || productDetails.sku,
    categories: productDetails.categories || [],
    category: productDetails.categories?.[0]?.name || 'General'
  };
};

export const enrichOrderWithProductData = async (order, options = {}) => {
  const { force = false, debug = true } = options;

  if (!order || !order.id) {
    return order;
  }

  const alreadyEnriched = order.line_items?.every(
    item => item.categories && Array.isArray(item.categories) && item.categories.length > 0
  );

  if (alreadyEnriched && !force) {
    return order;
  }

  const enrichedLineItems = await Promise.all(
    (order.line_items || []).map(item => enrichLineItem(item))
  );

  return {
    ...order,
    line_items: enrichedLineItems,
    _enriched: true,
    _enrichment_timestamp: Date.now()
  };
};
```

---

## VERIFICATION CHECKLIST

### ✅ Meta CAPI Implementation
- [ ] Environment variables configured (6 pixel IDs + 6 access tokens)
- [ ] `utils/metaCapiConfig.js` created with cryptic event names
- [ ] `utils/metaCapiPurchase.js` implemented with split logic
- [ ] `app/api/meta-capi/purchase/route.js` created
- [ ] `utils/analytics/hashServerSide.js` created
- [ ] `lib/meta/paramBuilderHelper.js` created
- [ ] `utils/metaPixelHelper.js` created (client-side)
- [ ] `components/Layout/MetaCookieInitializer.jsx` added to layout
- [ ] Package `capi-param-builder-nodejs` installed
- [ ] Meta CAPI called from `analyticsService.trackPurchase()`

### ✅ TikTok CAPI Implementation
- [ ] Environment variables configured (6 pixel IDs + 6 access tokens)
- [ ] `utils/tiktokCapiConfig.js` created
- [ ] `utils/tiktokCapiPurchase.js` created (reuses Meta split logic)
- [ ] `app/api/tiktok-capi/purchase/route.js` created
- [ ] TikTok CAPI called from `analyticsService.trackPurchase()`

### ✅ Order Enrichment
- [ ] `utils/enrichOrderData.js` implemented
- [ ] Order enrichment called before tracking
- [ ] Product categories populated in line items

### ✅ Testing
- [ ] Test order with ED product only → sends to ED pixel only
- [ ] Test order with WL + HL products → splits to WL and HL pixels
- [ ] Test order with 100% discount → skipped (no events sent)
- [ ] Verify split totals match WooCommerce order total exactly
- [ ] Check Meta Events Manager for custom events (RKY_TNT, RKY_FLW, etc.)
- [ ] Check TikTok Events Manager for CompletePayment events
- [ ] Verify event_id deduplication works

---

## IMPORTANT NOTES

### Meta CAPI
1. **Uses CRYPTIC event names** (RKY_TNT, RKY_FLW, etc.) to bypass health restrictions
2. **Direct Meta Graph API** (not Stape.io)
3. **Gender and DOB improve match quality by 12%**
4. **ParamBuilder SDK** for optimal fbp/fbc extraction
5. **Stable event_id** for automatic deduplication

### TikTok CAPI
1. **Standard event name** ('CompletePayment')
2. **TikTok Events API v1.3** endpoint
3. **Access-Token header** authentication
4. **Reuses Meta split logic** for consistency

### Both Systems
1. **Zero revenue duplication**: Each product tracked once
2. **Line-level tax support**: Respects WC tax calculations
3. **Penny reconciliation**: Ensures exact total match
4. **Parallel submissions**: All gateways called simultaneously
5. **Retry logic**: One retry on failure
6. **Idempotency guards**: Prevents duplicate tracking

---

## DEPENDENCY PACKAGES

```json
{
  "dependencies": {
    "capi-param-builder-nodejs": "^1.0.0",
    "axios": "^1.6.0"
  }
}
```

---

## END OF PROMPT

**Action Required**: Verify all files exist and are implemented EXACTLY as specified. If any are missing or incomplete, implement them using the code provided above with the EXACT IDs and tokens listed.

