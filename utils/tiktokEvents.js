import { logger } from "@/utils/devLogger";
import { toMoney } from "@/utils/priceFormatter";
import { safePush, getOrCreateSessionId } from "@/utils/dataLayerHelper";
import { getCanonicalProductId } from "@/utils/getCanonicalProductId";

/**
 * TikTok Events Utility
 * Handles TikTok Ads tracking events based on TikTok's standard events
 * Reference: https://ads.tiktok.com/help/article/standard-events-parameters
 */

/**
 * Map native TikTok event names to GTM-friendly dataLayer event names
 */
const TIKTOK_DL_EVENT_MAP = {
  ViewContent: "tiktok_view_content",
  AddToCart: "tiktok_add_to_cart",
  InitiateCheckout: "tiktok_initiate_checkout",
  Purchase: "tiktok_purchase",
  Search: "tiktok_search",
  CompleteRegistration: "tiktok_complete_registration",
  SubmitForm: "tiktok_submit_form",
  Contact: "tiktok_contact",
};

/**
 * Mirror a TikTok event to window.dataLayer for GTM visibility.
 * This does NOT alter the existing ttq.track behavior.
 * @param {string} nativeName - The native TikTok event name
 * @param {Object} eventData - The event data passed to ttq.track
 * @param {Object} [extra] - Optional extra fields (e.g. event_id for Purchase)
 */
const mirrorToDataLayer = (nativeName, eventData, extra = {}) => {
  try {
    const dlEventName = TIKTOK_DL_EVENT_MAP[nativeName] || `tiktok_${nativeName.toLowerCase()}`;
    const sessionId = getOrCreateSessionId();

    safePush({
      event: dlEventName,
      tiktok_event_name: nativeName,
      tiktok_event_data: { ...eventData },
      rk_session_id: sessionId,
      ...eventData,
      ...extra,
    });
  } catch (_) {
    // never let mirroring break main tracking
  }
};

/**
 * Initialize TikTok pixel and dataLayer
 */
const initializeTikTokPixel = () => {
  if (typeof window !== "undefined") {
    window.ttq = window.ttq || [];
  }
};

/**
 * Build a stable event_id for browser/CAPI deduplication when callers omit one.
 */
const buildTikTokEventId = (eventName, eventData = {}) => {
  if (eventData.event_id) return eventData.event_id;
  const sessionId = getOrCreateSessionId();
  const suffix = sessionId ? sessionId.slice(-8) : Math.random().toString(36).slice(2, 10);
  return `${eventName}_${Date.now()}_${suffix}`;
};

/**
 * Track TikTok standard event
 * @param {string} eventName - The TikTok event name (e.g., 'AddToCart', 'Purchase')
 * @param {Object} eventData - The event data object
 * @param {boolean} debug - Whether to log debug information
 * @param {Object} [mirrorExtra] - Optional extra fields for the dataLayer mirror push
 */
export const trackTikTokEvent = (eventName, eventData = {}, debug = true, mirrorExtra = {}) => {
  // Skip if running on server
  if (typeof window === "undefined") return;

  try {
    initializeTikTokPixel();

    const event_id = buildTikTokEventId(eventName, eventData);
    const payload = { ...eventData, event_id };

    if (debug) {
      logger.log(`[TikTok] Tracking event: ${eventName}`, payload);
    }

    // Track the event with TikTok pixel (existing behavior — unchanged)
    window.ttq.track(eventName, payload);

    // Mirror to dataLayer for GTM visibility
    mirrorToDataLayer(eventName, payload, { event_id, ...mirrorExtra });

    if (debug) {
      logger.log(`[TikTok] ✅ Event "${eventName}" tracked successfully`);
    }
  } catch (error) {
    logger.error(`[TikTok] Error tracking event "${eventName}":`, error);
  }
};

/**
 * Format product item for TikTok events
 * @param {Object} product - Product data
 * @param {number} quantity - Item quantity (default: 1)
 * @returns {Object} Formatted data for TikTok
 */
export const formatTikTokEventData = (product, quantity = 1) => {
  const price = toMoney(product.price);
  const value = toMoney(price * quantity);

  const categories = product.categories || [];
  const contentCategory = categories
    .map((c) => (typeof c === "string" ? c : c?.name || ""))
    .filter(Boolean)
    .join(", ");

  const contentId = getCanonicalProductId(product);

  return {
    content_type: "product",
    content_id: contentId,
    contents: [
      {
        content_id: contentId,
        content_type: "product",
        content_name: product.name || "",
        quantity: quantity,
        price: price,
      },
    ],
    content_name: product.name || "",
    content_category: contentCategory,
    quantity: quantity,
    price: price,
    value: value,
    currency: "USD",
    description: product.short_description || product.name || "",
  };
};

/**
 * Track AddToCart event
 * @param {Object} product - Product data
 * @param {number} quantity - Quantity added
 * @param {Object} additionalData - Additional event data
 * @param {boolean} debug - Whether to log debug information
 */
export const trackTikTokAddToCart = (
  product,
  quantity = 1,
  additionalData = {},
  debug = true
) => {
  const eventData = {
    ...formatTikTokEventData(product, quantity),
    ...additionalData,
  };

  trackTikTokEvent("AddToCart", eventData, debug);
};

/**
 * Track InitiateCheckout event
 * @param {Array} cartItems - Array of cart items
 * @param {Object} additionalData - Additional event data
 * @param {boolean} debug - Whether to log debug information
 */
export const trackTikTokInitiateCheckout = (
  cartItems = [],
  additionalData = {},
  debug = true
) => {
  const contents = [];
  const categorySet = new Set();
  let totalValue = 0;
  let totalQuantity = 0;

  cartItems.forEach((item) => {
    const product = item.product || item;
    const qty = item.quantity || 1;
    const price = parseFloat(product.price) || 0;

    contents.push({
      content_id: getCanonicalProductId(product),
      content_type: "product",
      content_name: product.name || "",
      quantity: qty,
      price: toMoney(price),
    });
    totalValue += price * qty;
    totalQuantity += qty;

    (product.categories || []).forEach((c) => {
      const name = typeof c === "string" ? c : c?.name;
      if (name) categorySet.add(name);
    });
  });

  const eventData = {
    content_type: "product",
    contents: contents,
    content_category: [...categorySet].join(", "),
    quantity: totalQuantity,
    value: totalValue,
    currency: "USD",
    ...additionalData,
  };

  trackTikTokEvent("InitiateCheckout", eventData, debug);
};

/**
 * Track Purchase event
 * @param {Object} order - Order data
 * @param {Object} additionalData - Additional event data
 * @param {boolean} debug - Whether to log debug information
 */
export const trackTikTokPurchase = (
  order,
  additionalData = {},
  debug = true
) => {
  if (!order || !order.id) return;

  const contents = [];
  const categorySet = new Set();
  let totalQuantity = 0;

  if (order.line_items && Array.isArray(order.line_items)) {
    order.line_items.forEach((item) => {
      contents.push({
        content_id: getCanonicalProductId(item),
        content_type: "product",
        content_name: item.name || "",
        quantity: parseInt(item.quantity) || 1,
        price: toMoney(item.subtotal ?? item.price ?? 0),
      });
      totalQuantity += parseInt(item.quantity) || 1;
      (item.categories || []).forEach((c) => {
        const name = typeof c === "string" ? c : c?.name;
        if (name) categorySet.add(name);
      });
    });
  }

  const purchaseEventId = `purchase_${order.id || "na"}_${Date.now()}`;

  const eventData = {
    event_id: purchaseEventId,
    content_type: "product",
    contents: contents,
    content_category: [...categorySet].join(", "),
    quantity: totalQuantity,
    value: toMoney(order.total),
    currency: order.currency || "USD",
    description: `Order #${order.id}`,
    order_data: additionalData.order_data || {},
    time_of_purchase_iso: additionalData.time_of_purchase_iso || "",
    customer_id: additionalData.customer_id || "",
    customer_id_canonical: additionalData.customer_id_canonical || "",
  };

  trackTikTokEvent("Purchase", eventData, debug, {
    event_id: purchaseEventId,
    order_data: eventData.order_data,
    time_of_purchase_iso: eventData.time_of_purchase_iso,
    customer_id: eventData.customer_id,
    customer_id_canonical: eventData.customer_id_canonical,
  });
};

/**
 * Track ViewContent event
 * @param {Object} product - Product data
 * @param {Object} additionalData - Additional event data
 * @param {boolean} debug - Whether to log debug information
 */
export const trackTikTokViewContent = (
  product,
  additionalData = {},
  debug = true
) => {
  const eventData = {
    ...formatTikTokEventData(product, 1),
    ...additionalData,
  };

  trackTikTokEvent("ViewContent", eventData, debug);
};

/**
 * Track Search event
 * @param {string} searchTerm - The search term
 * @param {Object} additionalData - Additional event data
 * @param {boolean} debug - Whether to log debug information
 */
export const trackTikTokSearch = (
  searchTerm,
  additionalData = {},
  debug = true
) => {
  const eventData = {
    search_string: searchTerm,
    ...additionalData,
  };

  trackTikTokEvent("Search", eventData, debug);
};

/**
 * Track CompleteRegistration event
 * @param {Object} userData - User registration data
 * @param {Object} additionalData - Additional event data
 * @param {boolean} debug - Whether to log debug information
 */
export const trackTikTokCompleteRegistration = (
  userData = {},
  additionalData = {},
  debug = true
) => {
  const eventData = {
    ...userData,
    ...additionalData,
  };

  trackTikTokEvent("CompleteRegistration", eventData, debug);
};

/**
 * Track SubmitForm event
 * @param {string} formName - Form identifier
 * @param {Object} additionalData - Additional event data
 * @param {boolean} debug - Whether to log debug information
 */
export const trackTikTokSubmitForm = (
  formName,
  additionalData = {},
  debug = true
) => {
  const eventData = {
    form_name: formName,
    ...additionalData,
  };

  trackTikTokEvent("SubmitForm", eventData, debug);
};

/**
 * Track Contact event
 * @param {Object} contactData - Contact information
 * @param {Object} additionalData - Additional event data
 * @param {boolean} debug - Whether to log debug information
 */
export const trackTikTokContact = (
  contactData = {},
  additionalData = {},
  debug = true
) => {
  const eventData = {
    ...contactData,
    ...additionalData,
  };

  trackTikTokEvent("Contact", eventData, debug);
};

/**
 * Track custom TikTok event
 * @param {string} eventName - Custom event name
 * @param {Object} eventData - Event data
 * @param {boolean} debug - Whether to log debug information
 */
export const trackTikTokCustomEvent = (
  eventName,
  eventData = {},
  debug = true
) => {
  trackTikTokEvent(eventName, eventData, debug);
};
