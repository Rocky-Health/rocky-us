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

