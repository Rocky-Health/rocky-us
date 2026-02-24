const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Read a cookie value by name. Returns "" if unavailable (SSR, blocked, missing).
 * @param {string} name
 * @returns {string}
 */
export function getCookie(name) {
  if (typeof document === "undefined") return "";
  try {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return decodeURIComponent(parts.pop().split(";").shift());
    }
  } catch (_) {
    /* cookie read failed — blocked or malformed */
  }
  return "";
}

/**
 * Set a cookie. No-op during SSR or if document is unavailable.
 * @param {string} name
 * @param {string} value
 * @param {{ maxAgeSeconds?: number, path?: string, sameSite?: string, secure?: boolean }} opts
 */
export function setCookie(name, value, opts = {}) {
  if (typeof document === "undefined") return;
  try {
    const {
      maxAgeSeconds = SESSION_COOKIE_MAX_AGE,
      path = "/",
      sameSite,
      secure,
    } = opts;

    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    const effectiveSameSite = sameSite ?? (isLocalhost ? "Lax" : "None");
    const effectiveSecure = secure ?? !isLocalhost;

    let cookie = `${name}=${encodeURIComponent(value)};path=${path};max-age=${maxAgeSeconds};SameSite=${effectiveSameSite}`;
    if (effectiveSecure) {
      cookie += ";Secure";
    }
    document.cookie = cookie;
  } catch (_) {
    /* cookie write failed — blocked or quota exceeded */
  }
}
