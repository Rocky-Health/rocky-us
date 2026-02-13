/**
 * DataLayer Helper Utility
 * Provides safe dataLayer access, session management, and diagnostic helpers
 * for GTM / GA4 / partner agency validation.
 *
 * IMPORTANT: This module is purely additive and does NOT modify any existing
 * tracking logic. All functions are guarded for SSR safety.
 */

const SESSION_KEY = "rk_sess_id";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Ensure window.dataLayer exists (no-op on server)
 */
export const initDataLayer = () => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
  }
};

/**
 * Push a payload to window.dataLayer without ever throwing.
 * @param {Object} payload - The object to push
 */
export const safePush = (payload) => {
  try {
    if (typeof window === "undefined") return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  } catch (_) {
    // swallow – tracking must never break the app
  }
};

/**
 * Read a cookie value by name (client-only, safe)
 * @param {string} name
 * @returns {string}
 */
const readCookie = (name) => {
  if (typeof document === "undefined") return "";
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(";").shift());
    }
  } catch (_) {
    // ignore
  }
  return "";
};

/**
 * Set a cookie (client-only, safe)
 * @param {string} name
 * @param {string} value
 * @param {number} maxAge - seconds
 */
const setCookie = (name, value, maxAge = SESSION_MAX_AGE) => {
  if (typeof document === "undefined") return;
  try {
    const encoded = encodeURIComponent(value);
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      document.cookie = `${name}=${encoded};path=/;max-age=${maxAge};SameSite=Lax`;
    } else {
      document.cookie = `${name}=${encoded};path=/;max-age=${maxAge};SameSite=None;Secure`;
    }
  } catch (_) {
    // ignore
  }
};

/**
 * Get or create a stable session ID.
 * Checks cookie -> localStorage -> generates new.
 * Stores in BOTH cookie (7-day, Lax) and localStorage for resilience.
 *
 * Format: sess_<timestamp>_<random hex>
 * @returns {string} session_id
 */
export const getOrCreateSessionId = () => {
  if (typeof window === "undefined") return "";

  try {
    // 1. Try cookie first (survives incognito tab refresh)
    let id = readCookie(SESSION_KEY);
    if (id) {
      // Ensure it's also in localStorage
      try {
        window.localStorage.setItem(SESSION_KEY, id);
      } catch (_) {}
      return id;
    }

    // 2. Try localStorage
    try {
      id = window.localStorage.getItem(SESSION_KEY) || "";
    } catch (_) {
      id = "";
    }
    if (id) {
      // Re-set the cookie (may have expired)
      setCookie(SESSION_KEY, id);
      return id;
    }

    // 3. Generate new session ID
    id = `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    setCookie(SESSION_KEY, id);
    try {
      window.localStorage.setItem(SESSION_KEY, id);
    } catch (_) {}
    return id;
  } catch (_) {
    // Absolute fallback – return ephemeral id, don't persist
    return `sess_${Date.now()}_fallback`;
  }
};
