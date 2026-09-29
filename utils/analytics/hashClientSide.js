/**
 * Client-side SHA-256 hashing via the Web Crypto API.
 * Mirrors hashServerSide.js so the hashes are byte-identical.
 * SSR-safe: all exports return '' when window/crypto.subtle are unavailable.
 */

import {
  normalizeEmail,
  normalizePhone,
  normalizePhoneForMeta,
  metaExternalIdSource,
} from './normalize';

/**
 * SHA-256 hash of text.toLowerCase().trim() → lowercase hex string.
 * Returns '' for falsy / non-string input or when crypto.subtle is unavailable.
 * @param {string} text
 * @returns {Promise<string>}
 */
export async function hashSHA256Client(text) {
  if (!text || typeof text !== 'string') return '';
  try {
    // Guard for SSR and older browsers that lack SubtleCrypto
    if (typeof window === 'undefined' || !window.crypto?.subtle) return '';
    const normalized = text.toLowerCase().trim();
    const encoded = new TextEncoder().encode(normalized);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encoded);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  } catch (_) {
    return '';
  }
}

/**
 * Normalize an email then hash it with SHA-256.
 * Returns '' if the email is empty or hashing fails.
 * @param {string} email
 * @returns {Promise<string>}
 */
export async function hashEmailClient(email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return '';
  return hashSHA256Client(normalized);
}

/**
 * Normalize a phone number to E.164 then hash it with SHA-256.
 * Returns '' if the phone is empty/invalid or hashing fails.
 * @param {string} phone
 * @param {string} country  ISO country code, defaults to 'US'
 * @returns {Promise<string>}
 */
export async function hashPhoneClient(phone, country = 'US') {
  const normalized = normalizePhone(phone, country);
  if (!normalized) return '';
  return hashSHA256Client(normalized);
}

// Meta-only: digits without "+", must match hashPhoneForMeta on the server.
export async function hashPhoneForMetaClient(phone, country = 'US') {
  const normalized = normalizePhoneForMeta(phone, country);
  if (!normalized) return '';
  return hashSHA256Client(normalized);
}

// Meta-only: must match hashExternalIdForMeta on the server.
export async function hashExternalIdForMetaClient(value) {
  const source = metaExternalIdSource(value);
  if (!source) return '';
  return hashSHA256Client(source);
}
