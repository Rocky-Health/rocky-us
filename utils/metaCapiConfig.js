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
 * - RKY_FLW_US: WL Purchase mirror — US-only (fires only on rocky-us; lands on the US-only WL dataset 1873491106559002 alongside RKY_FLW which stays on the legacy shared pixel for in-flight ad campaigns)
 * - RKY_VBE: HL Purchase Event (Vibe)
 * - RKY_ZXT: SMOKING Purchase Event (Zeta)
 * - RKY_LXS: SKINCARE Purchase Event (Luxus)
 * - RKY_AEN: LONGEVITY Purchase Event (Aeon) — parent vertical pixel (US-only
 *   pixel; CA uses its own). NAD+ now rides this same pixel/event (merged back
 *   in), tagged rky_cat:'NAD' in custom_data so NAD+ stays filterable. The old
 *   RKY_NVA / NAD pixel is retired.
 * - RKY_MXR: OTHERS Purchase Event (Mixer)
 */
export const CUSTOM_EVENT_NAMES = {
  ED: 'RKY_TNT',
  WL: 'RKY_FLW',
  HL: 'RKY_VBE',
  SMOKING: 'RKY_ZXT',
  SKINCARE: 'RKY_LXS',
  LONGEVITY: 'RKY_AEN',
  OTHERS: 'RKY_MXR'
};

/**
 * Per-gateway `secondaryPixels` is an optional array of additional
 * { pixelId, customEventName } destinations that the server CAPI route
 * fans out to *in addition* to the primary `pixelId`. The same gateway
 * `accessToken` is used for every entry — the underlying System User on
 * rocky-us has access to both the legacy shared pixel and the new
 * US-only dataset, so a single token authenticates against both. Per-fire
 * payload (user_data, custom_data, event_source_url, event_time) is
 * byte-identical between primary and secondary so EMQ / data freshness
 * scores match the primary one-for-one. event_id is suffixed per-pixel
 * to keep dedup namespaces independent.
 */
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
    secondaryPixels: [
      {
        // US-only mirror dataset ("Rocky USA WL"). Fires alongside the
        // primary RKY_FLW so existing ad campaigns optimizing on the
        // legacy pixel keep getting US Purchase signal, while the new
        // dataset accumulates a clean US-only event stream we can build
        // fresh Custom Conversions and audiences from.
        pixelId: '1873491106559002',
        customEventName: 'RKY_FLW_US',
      },
    ],
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
  // NAD+ is merged into LONGEVITY: NAD+ products carry both the `nad` and
  // parent `longevity` slugs, and both slugs route here. NAD+ is tagged
  // rky_cat:'NAD' in custom_data (see metaCapiPurchase) so it stays filterable
  // without a separate pixel. (US currently only has the NAD+ product under
  // longevity; this auto-includes any future US longevity products.)
  LONGEVITY: {
    accessToken: process.env.FB_ACCESS_TOKEN_LONGEVITY,
    pixelId: '1315116483444151', // Rocky USA Longevity (US-only pixel)
    customEventName: CUSTOM_EVENT_NAMES.LONGEVITY,
    categories: ['longevity', 'nad'],
    name: 'LONGEVITY'
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

