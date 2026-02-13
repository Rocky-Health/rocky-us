/**
 * Source Attribution Utility
 * Comprehensive traffic source tracking for attribution across all marketing channels
 * Captures UTM parameters, click IDs, affiliate tracking, and referrer data
 */

import { logger } from "@/utils/devLogger";

/**
 * Storage keys for persisting attribution data
 */
const STORAGE_KEYS = {
  SOURCE: "traffic_source",
  MEDIUM: "traffic_medium",
  CAMPAIGN: "traffic_campaign",
  CONTENT: "traffic_content",
  TERM: "traffic_term",
  UTM_ID: "traffic_utm_id",
  CLICK_ID: "traffic_click_id",
  CLICK_ID_TYPE: "traffic_click_id_type",
  AWIN_AWC: "awin_awc",
  GBRAID: "traffic_gbraid",
  WBRAID: "traffic_wbraid",
  REFERRER: "traffic_referrer",
  LANDING_PAGE: "traffic_landing_page",
  FIRST_TOUCH_TIME: "traffic_first_touch",
  LAST_TOUCH_TIME: "traffic_last_touch",
};

/**
 * Cookie options for persisting attribution data
 * 30-day expiration for attribution window
 */
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * Read a cookie value by name
 * @param {string} name - Cookie name
 * @returns {string} Cookie value or empty string
 */
const readCookie = (name) => {
  if (typeof document === "undefined") return "";
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(";").shift());
    }
  } catch (e) {
    logger.warn(`[Attribution] Error reading cookie ${name}:`, e);
  }
  return "";
};

/**
 * Set a cookie with proper attributes
 * @param {string} name - Cookie name
 * @param {string} value - Cookie value
 */
const setCookie = (name, value) => {
  if (typeof document === "undefined") return;
  try {
    const encodedValue = encodeURIComponent(value);
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (isLocalhost) {
      document.cookie = `${name}=${encodedValue};path=/;max-age=${COOKIE_MAX_AGE};SameSite=Lax`;
    } else {
      document.cookie = `${name}=${encodedValue};path=/;max-age=${COOKIE_MAX_AGE};SameSite=None;Secure`;
    }
  } catch (e) {
    logger.warn(`[Attribution] Error setting cookie ${name}:`, e);
  }
};

/**
 * Get value from localStorage
 * @param {string} key - Storage key
 * @returns {string} Stored value or empty string
 */
const getFromStorage = (key) => {
  if (typeof window === "undefined" || !window.localStorage) return "";
  try {
    return window.localStorage.getItem(key) || "";
  } catch (e) {
    return "";
  }
};

/**
 * Set value in localStorage
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 */
const setInStorage = (key, value) => {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, value);
  } catch (e) {
    logger.warn(`[Attribution] Error setting localStorage ${key}:`, e);
  }
};

/**
 * Parse URL parameters
 * @param {string} url - URL to parse (defaults to current URL)
 * @returns {URLSearchParams} Parsed URL parameters
 */
const getUrlParams = (url = null) => {
  if (typeof window === "undefined") return new URLSearchParams();
  try {
    const searchString = url
      ? new URL(url).search
      : window.location.search || "";
    return new URLSearchParams(searchString);
  } catch (e) {
    return new URLSearchParams();
  }
};

/**
 * Detect click ID type from parameter name
 * @param {string} paramName - URL parameter name
 * @returns {string|null} Click ID type or null
 */
const detectClickIdType = (paramName) => {
  const clickIdMap = {
    fbclid: "Facebook",
    gclid: "Google Ads",
    gbraid: "Google Ads",
    wbraid: "Google Ads",
    ttclid: "TikTok",
    msclkid: "Microsoft Ads",
    twclid: "Twitter",
    li_fat_id: "LinkedIn",
    ScCid: "Snapchat",
    irclickid: "Impact",
    clickid: "Generic",
  };
  return clickIdMap[paramName] || null;
};

/**
 * Get the current referrer, excluding same-domain traffic
 * @returns {string} Referrer URL or empty string
 */
const getReferrer = () => {
  if (typeof document === "undefined" || typeof window === "undefined")
    return "";
  try {
    const referrer = document.referrer || "";
    if (!referrer) return "";

    // Exclude same-domain referrers
    const currentDomain = window.location.hostname;
    const referrerUrl = new URL(referrer);
    if (referrerUrl.hostname === currentDomain) {
      return ""; // Same domain, not an external referrer
    }

    return referrer;
  } catch (e) {
    return "";
  }
};

/**
 * Capture and persist attribution data from URL and cookies
 * This should be called on every page load
 * @returns {Object} Current attribution data
 */
export const captureAttribution = () => {
  if (typeof window === "undefined") {
    return getAttributionData();
  }

  try {
    const params = getUrlParams();
    const now = new Date().toISOString();

    // Check if this is first touch (no previous attribution)
    const isFirstTouch = !getFromStorage(STORAGE_KEYS.FIRST_TOUCH_TIME);

    // Always update last touch time
    setInStorage(STORAGE_KEYS.LAST_TOUCH_TIME, now);
    setCookie(STORAGE_KEYS.LAST_TOUCH_TIME, now);

    if (isFirstTouch) {
      setInStorage(STORAGE_KEYS.FIRST_TOUCH_TIME, now);
      setCookie(STORAGE_KEYS.FIRST_TOUCH_TIME, now);
      setInStorage(STORAGE_KEYS.LANDING_PAGE, window.location.href);
      setCookie(STORAGE_KEYS.LANDING_PAGE, window.location.href);
    }

    // Capture UTM parameters (overwrite on new campaign)
    const utmSource = params.get("utm_source");
    const utmMedium = params.get("utm_medium");
    const utmCampaign = params.get("utm_campaign");
    const utmContent = params.get("utm_content");
    const utmTerm = params.get("utm_term");

    if (utmSource) {
      setInStorage(STORAGE_KEYS.SOURCE, utmSource);
      setCookie(STORAGE_KEYS.SOURCE, utmSource);
    }
    if (utmMedium) {
      setInStorage(STORAGE_KEYS.MEDIUM, utmMedium);
      setCookie(STORAGE_KEYS.MEDIUM, utmMedium);
    }
    if (utmCampaign) {
      setInStorage(STORAGE_KEYS.CAMPAIGN, utmCampaign);
      setCookie(STORAGE_KEYS.CAMPAIGN, utmCampaign);
    }
    if (utmContent) {
      setInStorage(STORAGE_KEYS.CONTENT, utmContent);
      setCookie(STORAGE_KEYS.CONTENT, utmContent);
    }
    if (utmTerm) {
      setInStorage(STORAGE_KEYS.TERM, utmTerm);
      setCookie(STORAGE_KEYS.TERM, utmTerm);
    }

    // Capture utm_id (Google Ads campaign-level identifier)
    const utmId = params.get("utm_id");
    if (utmId) {
      setInStorage(STORAGE_KEYS.UTM_ID, utmId);
      setCookie(STORAGE_KEYS.UTM_ID, utmId);
    }

    // Capture click IDs (platform-specific tracking IDs)
    const clickIdParams = [
      "fbclid",
      "gclid",
      "gbraid",
      "wbraid",
      "ttclid",
      "msclkid",
      "twclid",
      "li_fat_id",
      "ScCid",
      "irclickid",
      "clickid",
    ];

    for (const param of clickIdParams) {
      const clickId = params.get(param);
      if (clickId) {
        const clickIdType = detectClickIdType(param);
        setInStorage(STORAGE_KEYS.CLICK_ID, clickId);
        setCookie(STORAGE_KEYS.CLICK_ID, clickId);
        if (clickIdType) {
          setInStorage(STORAGE_KEYS.CLICK_ID_TYPE, clickIdType);
          setCookie(STORAGE_KEYS.CLICK_ID_TYPE, clickIdType);
        }
        break; // Use first found click ID
      }
    }

    // Capture gbraid/wbraid individually (Google cookieless click IDs)
    // These are stored separately because the loop above only keeps the first match
    const gbraid = params.get("gbraid");
    if (gbraid) {
      setInStorage(STORAGE_KEYS.GBRAID, gbraid);
      setCookie(STORAGE_KEYS.GBRAID, gbraid);
    }
    const wbraid = params.get("wbraid");
    if (wbraid) {
      setInStorage(STORAGE_KEYS.WBRAID, wbraid);
      setCookie(STORAGE_KEYS.WBRAID, wbraid);
    }

    // Capture AWIN affiliate tracking
    const awc = params.get("awc");
    if (awc) {
      setInStorage(STORAGE_KEYS.AWIN_AWC, awc);
      setCookie(STORAGE_KEYS.AWIN_AWC, awc);
      // Also set legacy AWIN cookies for compatibility
      setCookie("awc", awc);
      setCookie("_awin_awc", awc);
    }

    // Capture referrer on first touch
    if (isFirstTouch) {
      const referrer = getReferrer();
      if (referrer) {
        setInStorage(STORAGE_KEYS.REFERRER, referrer);
        setCookie(STORAGE_KEYS.REFERRER, referrer);
      }
    }

    logger.log("[Attribution] Captured attribution data");
    return getAttributionData();
  } catch (error) {
    logger.error("[Attribution] Error capturing attribution:", error);
    return getAttributionData();
  }
};

/**
 * Get all current attribution data
 * Reads from both cookies and localStorage for redundancy
 * @returns {Object} Attribution data object
 */
export const getAttributionData = () => {
  const source =
    readCookie(STORAGE_KEYS.SOURCE) || getFromStorage(STORAGE_KEYS.SOURCE);
  const medium =
    readCookie(STORAGE_KEYS.MEDIUM) || getFromStorage(STORAGE_KEYS.MEDIUM);
  const campaign =
    readCookie(STORAGE_KEYS.CAMPAIGN) ||
    getFromStorage(STORAGE_KEYS.CAMPAIGN);
  const content =
    readCookie(STORAGE_KEYS.CONTENT) || getFromStorage(STORAGE_KEYS.CONTENT);
  const term =
    readCookie(STORAGE_KEYS.TERM) || getFromStorage(STORAGE_KEYS.TERM);
  const clickId =
    readCookie(STORAGE_KEYS.CLICK_ID) || getFromStorage(STORAGE_KEYS.CLICK_ID);
  const clickIdType =
    readCookie(STORAGE_KEYS.CLICK_ID_TYPE) ||
    getFromStorage(STORAGE_KEYS.CLICK_ID_TYPE);
  const awinAwc =
    readCookie(STORAGE_KEYS.AWIN_AWC) ||
    getFromStorage(STORAGE_KEYS.AWIN_AWC) ||
    readCookie("awc") ||
    readCookie("_awin_awc");
  const referrer =
    readCookie(STORAGE_KEYS.REFERRER) || getFromStorage(STORAGE_KEYS.REFERRER);
  const landingPage =
    readCookie(STORAGE_KEYS.LANDING_PAGE) ||
    getFromStorage(STORAGE_KEYS.LANDING_PAGE);
  const firstTouchTime =
    readCookie(STORAGE_KEYS.FIRST_TOUCH_TIME) ||
    getFromStorage(STORAGE_KEYS.FIRST_TOUCH_TIME);
  const lastTouchTime =
    readCookie(STORAGE_KEYS.LAST_TOUCH_TIME) ||
    getFromStorage(STORAGE_KEYS.LAST_TOUCH_TIME);
  const utmId =
    readCookie(STORAGE_KEYS.UTM_ID) || getFromStorage(STORAGE_KEYS.UTM_ID);
  const gbraid =
    readCookie(STORAGE_KEYS.GBRAID) || getFromStorage(STORAGE_KEYS.GBRAID);
  const wbraid =
    readCookie(STORAGE_KEYS.WBRAID) || getFromStorage(STORAGE_KEYS.WBRAID);

  return {
    source,
    medium,
    campaign,
    content,
    term,
    utmId,
    clickId,
    clickIdType,
    awinAwc,
    gbraid,
    wbraid,
    referrer,
    landingPage,
    firstTouchTime,
    lastTouchTime,
  };
};

/**
 * Derive a human-readable source name for Northbeam
 * ONLY for sources that Northbeam doesn't automatically track
 * (Northbeam already tracks ad platforms via integrations)
 * @param {Object} attribution - Attribution data from getAttributionData()
 * @returns {string|null} Source name or null if Northbeam already tracks it
 */
export const deriveSourceName = (attribution = null) => {
  const data = attribution || getAttributionData();

  // Priority 1: AWIN affiliate (not auto-tracked by Northbeam)
  if (data.awinAwc) {
    return "AWIN";
  }

  // Priority 2: Check if this is an ad platform that Northbeam already tracks
  // Skip these sources as Northbeam handles them via direct integrations
  const nbTrackedPlatforms = ["google", "facebook", "instagram", "tiktok", "snapchat", "pinterest", "twitter", "linkedin", "microsoft", "bing"];
  const source = (data.source || "").toLowerCase();
  const medium = (data.medium || "").toLowerCase();
  
  // Skip if it's a known ad platform that NB already tracks
  if (nbTrackedPlatforms.some(platform => source.includes(platform) && (medium.includes("cpc") || medium.includes("paid") || medium.includes("social")))) {
    return null; // Northbeam already tracking this
  }
  
  // Skip if click ID is from ad platform (NB tracks these automatically)
  if (data.clickIdType && ["Google Ads", "Facebook", "TikTok", "Microsoft Ads", "Snapchat", "LinkedIn"].includes(data.clickIdType)) {
    return null; // Northbeam already tracking this
  }

  // Priority 3: Custom UTM sources (not ad platforms)
  if (data.source && !nbTrackedPlatforms.some(p => source.includes(p))) {
    return data.source;
  }

  // Priority 4: Referrer domain (for organic/referral traffic)
  if (data.referrer) {
    try {
      const referrerUrl = new URL(data.referrer);
      const domain = referrerUrl.hostname.replace(/^www\./, "");
      // Skip major ad platforms in referrer
      if (!nbTrackedPlatforms.some(p => domain.includes(p))) {
        return domain;
      }
    } catch (e) {
      return "Referral";
    }
  }

  // Don't send "Direct" tag - let Northbeam handle that attribution
  return null;
};

/**
 * Derive a channel grouping for Northbeam
 * ONLY for sources that Northbeam doesn't automatically track
 * @param {Object} attribution - Attribution data from getAttributionData()
 * @returns {string|null} Channel name or null if Northbeam already tracks it
 */
export const deriveChannel = (attribution = null) => {
  const data = attribution || getAttributionData();

  // AWIN affiliate (not auto-tracked by Northbeam)
  if (data.awinAwc) {
    return "Affiliate";
  }

  // Skip channels that Northbeam already tracks via ad platform integrations
  const medium = (data.medium || "").toLowerCase();
  const source = (data.source || "").toLowerCase();
  
  // Skip paid ad channels (Northbeam tracks these automatically)
  if (medium.includes("cpc") || medium.includes("ppc") || medium.includes("paid")) {
    return null; // Northbeam already tracking
  }

  // Custom non-ad channels
  if (medium.includes("affiliate")) {
    return "Affiliate";
  }
  if (medium.includes("email")) {
    return "Email";
  }
  if (medium.includes("organic")) {
    return "Organic";
  }
  if (medium.includes("referral")) {
    return "Referral";
  }
  if (medium.includes("partner")) {
    return "Partner";
  }

  // Referrer-based detection for organic/referral only
  if (data.referrer) {
    try {
      const referrerUrl = new URL(data.referrer);
      const domain = referrerUrl.hostname.toLowerCase();
      
      // Organic search traffic
      if (domain.includes("google") || domain.includes("bing") || domain.includes("yahoo") || domain.includes("duckduckgo")) {
        return "Organic Search";
      }
      
      // Skip social platforms (Northbeam tracks paid social)
      if (domain.includes("facebook") || domain.includes("instagram") || domain.includes("tiktok") || domain.includes("twitter") || domain.includes("linkedin")) {
        return null; // Let Northbeam handle social attribution
      }
      
      // Other referrals
      return "Referral";
    } catch (e) {
      // Invalid URL
    }
  }

  // Don't tag as "Direct" - let Northbeam handle that
  return null;
};

/**
 * Get Northbeam-formatted source tags
 * Returns an array of tags to include in order_tags
 * ONLY includes sources/channels that Northbeam doesn't already track
 * @returns {Array<string>} Array of source/channel tags
 */
export const getNorthbeamSourceTags = () => {
  const attribution = getAttributionData();
  const sourceName = deriveSourceName(attribution);
  const channel = deriveChannel(attribution);

  const tags = [];

  // Only add tags for sources Northbeam doesn't auto-track
  if (sourceName) {
    tags.push(`source:${sourceName}`);
  }

  if (channel) {
    tags.push(`channel:${channel}`);
  }

  // Add campaign only for non-ad campaigns (Northbeam tracks ad campaigns automatically)
  if (attribution.campaign && !channel?.includes("Paid")) {
    tags.push(`campaign:${attribution.campaign}`);
  }

  // Add medium only for non-ad mediums
  const medium = (attribution.medium || "").toLowerCase();
  if (attribution.medium && 
      !medium.includes("cpc") && 
      !medium.includes("ppc") && 
      !medium.includes("paid") &&
      attribution.medium !== channel) {
    tags.push(`medium:${attribution.medium}`);
  }

  return tags;
};

/**
 * Initialize attribution tracking
 * Call this on app initialization (e.g., in layout or _app)
 */
export const initializeAttribution = () => {
  if (typeof window === "undefined") return;

  try {
    // Capture attribution immediately
    captureAttribution();

    // Also capture on navigation (for SPAs)
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("popstate", captureAttribution);
    }

    logger.log("[Attribution] Initialized source attribution tracking");
  } catch (error) {
    logger.error("[Attribution] Error initializing attribution:", error);
  }
};

