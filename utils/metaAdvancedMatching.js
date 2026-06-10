/**
 * Client-side Meta Pixel advanced matching helper.
 *
 * Reads identity cookies set at login (none are httpOnly), hashes each field
 * with the same algorithm as the server CAPI so client and server events
 * reconcile to a single person in Meta's identity graph.
 *
 * All functions are SSR-safe and never throw — AM is best-effort enrichment.
 */

import { getCookie } from '@/utils/cookieHelper';
import {
  hashSHA256Client,
  hashEmailClient,
  hashPhoneClient,
} from '@/utils/analytics/hashClientSide';

/**
 * Read the userId and userEmail cookies and return a stable string that
 * represents the current identity state.  Used by FBPixelLoader to detect
 * when identity first becomes available (after login/navigation) so it can
 * recompute AM exactly once per identity change.
 *
 * Returns '' when neither cookie is present (pre-login).
 * @returns {string}
 */
export function getIdentityKey() {
  if (typeof document === 'undefined') return '';
  try {
    const userId = getCookie('userId');
    const userEmail = getCookie('userEmail');
    if (!userId && !userEmail) return '';
    return `${userId}|${userEmail}`;
  } catch (_) {
    return '';
  }
}

/**
 * Build a Meta Pixel advanced matching object from identity cookies.
 *
 * All PII fields are pre-hashed with SHA-256 so the values are
 * byte-identical to the hashes the server CAPI sends.  Meta Pixel detects
 * a 64-character hex string and will NOT re-hash, ensuring parity.
 *
 * Returns null when no email and no userId are available (pre-login state),
 * so callers can skip `fbq('init', pid, null)` without passing an empty object.
 *
 * @returns {Promise<Object|null>}
 */
export async function buildAdvancedMatching() {
  // SSR guard — document / cookies unavailable
  if (typeof document === 'undefined') return null;

  try {
    const userEmail = getCookie('userEmail');
    const rawPhone = getCookie('pn'); // may be URL-encoded; getCookie already decodes
    const userId = getCookie('userId'); // WooCommerce customer_id
    const userName = getCookie('userName'); // full name, e.g. "John Doe"
    const displayName = getCookie('displayName'); // first name fallback
    const province = getCookie('province'); // maps to st
    const dob = getCookie('dob'); // maps to db

    // Require at least one primary identifier before building AM
    if (!userEmail && !userId) return null;

    // Derive first / last names:
    // userName is "First Last" (set at login); displayName is first name only.
    let firstName = '';
    let lastName = '';
    if (userName) {
      const parts = userName.trim().split(/\s+/);
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    } else if (displayName) {
      firstName = displayName.trim();
    }

    // Hash all fields in parallel for performance
    const [em, ph, external_id, fn, ln, st, db] = await Promise.all([
      hashEmailClient(userEmail),
      hashPhoneClient(rawPhone, 'US'),
      hashSHA256Client(userId),   // server: hashSHA256(customer_id.toString()) = sha256(lowercase(trim(id)))
      hashSHA256Client(firstName),
      hashSHA256Client(lastName),
      hashSHA256Client(province),
      hashSHA256Client(dob),
    ]);

    // Build the object including only fields that produced a non-empty hash
    const am = {};
    if (em) am.em = em;
    if (ph) am.ph = ph;
    if (external_id) am.external_id = external_id;
    if (fn) am.fn = fn;
    if (ln) am.ln = ln;
    if (st) am.st = st;
    if (db) am.db = db;

    // If nothing was hashed (unexpected but possible), treat as no identity
    if (Object.keys(am).length === 0) return null;

    return am;
  } catch (_) {
    // Never let AM errors surface to the caller
    return null;
  }
}
