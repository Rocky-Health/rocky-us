import { getCookie, setCookie } from "./cookieHelper";

const COOKIE_NAME = "rk_session_id";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const REFRESH_THROTTLE_MS = 5 * 60 * 1000; // 5 minutes

let inMemorySessionId = "";
let sessionStable = false;
let lastCookieRefreshAt = 0;

/**
 * Generate a crypto-safe random UUID.
 * Prefers crypto.randomUUID(); falls back to crypto.getRandomValues().
 * @returns {string}
 */
export function generateId() {
  try {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    if (typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function") {
      const bytes = new Uint8Array(16);
      crypto.getRandomValues(bytes);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 1
      const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
      return (
        hex.slice(0, 8) + "-" +
        hex.slice(8, 12) + "-" +
        hex.slice(12, 16) + "-" +
        hex.slice(16, 20) + "-" +
        hex.slice(20)
      );
    }
  } catch (_) {
    /* crypto unavailable */
  }
  // Last-resort fallback (still not Math.random — uses timestamp + performance counter)
  const ts = Date.now().toString(36);
  const rand = ((typeof performance !== "undefined" ? performance.now() : 0) * 1e6)
    .toString(36)
    .replace(".", "");
  return `${ts}-${rand}-${ts.split("").reverse().join("")}`;
}

/**
 * Get or create a stable session ID stored in the rk_session_id cookie.
 * Implements a 7-day sliding window with a 5-minute write throttle.
 * Falls back to an in-memory ID if cookies are blocked.
 * Returns "" during SSR.
 * @returns {string}
 */
export function getOrCreateSessionId() {
  if (typeof window === "undefined") return "";

  try {
    const existing = getCookie(COOKIE_NAME);

    if (existing) {
      sessionStable = true;

      // Sliding window: refresh TTL, but throttle writes to once per 5 min
      const now = Date.now();
      if (now - lastCookieRefreshAt > REFRESH_THROTTLE_MS) {
        setCookie(COOKIE_NAME, existing, { maxAgeSeconds: MAX_AGE_SECONDS });
        lastCookieRefreshAt = now;
      }

      inMemorySessionId = existing;
      return existing;
    }

    // No cookie — generate a new ID
    const newId = generateId();

    // Attempt to persist
    setCookie(COOKIE_NAME, newId, { maxAgeSeconds: MAX_AGE_SECONDS });
    lastCookieRefreshAt = Date.now();

    // Verify the cookie was actually written
    const verification = getCookie(COOKIE_NAME);
    if (verification === newId) {
      sessionStable = true;
      inMemorySessionId = newId;
      return newId;
    }

    // Cookie write failed (blocked) — use in-memory fallback
    sessionStable = false;
    if (!inMemorySessionId) {
      inMemorySessionId = newId;
    }
    return inMemorySessionId;
  } catch (_) {
    sessionStable = false;
    if (!inMemorySessionId) {
      inMemorySessionId = generateId();
    }
    return inMemorySessionId;
  }
}

/**
 * Returns true if the session ID is persisted in a cookie (stable across reloads).
 * Returns false if using the in-memory fallback (cookies blocked).
 * @returns {boolean}
 */
export function isSessionStable() {
  return sessionStable;
}

/**
 * Generate a new unique request ID (one per call).
 * @returns {string}
 */
export function getRequestId() {
  return generateId();
}
