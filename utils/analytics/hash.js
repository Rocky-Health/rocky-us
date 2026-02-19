import { logger } from "@/utils/devLogger";

/**
 * Lightweight hashing and normalization utilities for analytics
 */

/**
 * Normalize email for hashing: trim and lowercase
 * @param {string} email
 * @returns {string}
 */
export const normalizeEmail = (email) => {
  if (!email || typeof email !== "string") return "";
  return email.trim().toLowerCase();
};

/**
 * Best-effort normalize to E.164 for North America by default
 * - Strips non-digits
 * - If 10 digits and defaultCountry is CA/US → prefix +1
 * - If 11 digits starting with 1 → prefix + and keep
 * - If already starts with + and has digits → return as-is (trim spaces)
 * Otherwise returns an empty string
 * @param {string} phone
 * @param {string} defaultCountry
 * @returns {string}
 */
export const normalizePhoneToE164 = (phone, defaultCountry = "US") => {
  if (!phone || typeof phone !== "string") return "";

  const trimmed = phone.trim();
  if (trimmed.startsWith("+")) {
    // Already in international format (best-effort)
    const digits = trimmed.replace(/[^+\d]/g, "");
    return digits;
  }

  const digitsOnly = trimmed.replace(/\D/g, "");

  // NANP handling
  const isNorthAmerica = ["CA", "US", "USA"].includes(
    (defaultCountry || "").toUpperCase()
  );

  if (isNorthAmerica) {
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    }
    if (digitsOnly.length === 11 && digitsOnly.startsWith("1")) {
      return `+${digitsOnly}`;
    }
  }

  // Fallback: if looks like a plausible international number (>= 8 digits)
  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    return `+${digitsOnly}`;
  }

  return "";
};

/**
 * SHA-256 hash to lowercase hex using Web Crypto API
 * @param {string} value
 * @returns {Promise<string>} lowercase hex digest or empty string on failure
 */
export const sha256Hex = async (value) => {
  try {
    if (typeof window === "undefined" || !window.crypto?.subtle) return "";
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  } catch (e) {
    logger.warn("[Analytics] SHA-256 hashing unavailable:", e);
    return "";
  }
};

/**
 * Hash an email with SHA-256 after normalization
 * @param {string} email
 * @returns {Promise<string>}
 */
export const hashEmail = async (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return "";
  return sha256Hex(normalized);
};

/**
 * Hash a phone with SHA-256 after E.164 normalization
 * @param {string} phone
 * @param {string} defaultCountry
 * @returns {Promise<string>}
 */
export const hashPhone = async (phone, defaultCountry = "US") => {
  const normalized = normalizePhoneToE164(phone, defaultCountry);
  if (!normalized) return "";
  return sha256Hex(normalized);
};
