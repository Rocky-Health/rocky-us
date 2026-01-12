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

