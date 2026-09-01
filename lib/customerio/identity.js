/**
 * Customer.io identity resolution, USA.
 *
 * WARNING, READ BEFORE TRUSTING ANYTHING THIS MODULE RETURNS.
 *
 * On this repo the identity cookies (`userId`, `userEmail`, `pn`) are PLAINTEXT and UNSIGNED.
 * They are written with a bare `cookieStore.set(...)` in app/api/login/route.js,
 * app/api/register/route.js and app/api/google-login/route.js, with no HMAC and no encryption,
 * and they are readable and writable from JavaScript (utils/ga4Events.js already reads `userId`
 * straight out of document.cookie). Anyone can therefore set them to any value they like, so
 * every value this module returns is attacker-controllable and must be treated as a claim, not
 * as proof of who the visitor is.
 *
 * The consequence is deliberately bounded, which is why this ships as-is. A forged cookie can
 * only mislabel which Customer.io profile receives a marketing event: it makes someone else's
 * profile show a Product Viewed or a Product Added that did not happen, or attaches an email
 * trait to a profile. Nothing is read back to the browser (both relay routes answer with a
 * status only, never with profile data), and nothing here can reach a credential: the Pipelines
 * write key stays server-side, the WordPress auth token is never touched, and no WooCommerce or
 * Stripe call is made off the back of these values. So the blast radius is wrong marketing
 * attribution, not account access and not data disclosure.
 *
 * Closing this properly means porting the Canada repo's utils/identityCookies.js HMAC layer
 * (signed cookies plus a verifying reader, and the AES-256-GCM encrypted userId cookie beside
 * it) to this repo, then switching the reads below to the verifying reader. That is a
 * repo-wide auth change touching login, register, Google login, middleware and every consumer
 * of these cookies, so it is deliberately out of scope for the Customer.io port. Until it
 * happens, do not add anything to this resolver whose misuse would cost more than a mislabelled
 * marketing event.
 *
 * As on Canada, identity is resolved on the server and never taken from the request body: the
 * browser sends behaviour, the server decides who the behaviour belongs to, and the client
 * helper carries no PII. The WooCommerce customer ID is the WordPress user ID, the same number
 * the checkout routes send as `customer_id`, and it is the value the backend integration must
 * also use as the Customer.io `userId` or every person forks into two profiles.
 *
 * Server-only.
 */

import { normalizePhoneToE164 } from "@/utils/analytics/hash";

/**
 * Read one cookie value as a trimmed, URL-decoded string.
 *
 * Cookies written by `cookieStore.set` are percent-encoded, and a value carrying a "+" or an
 * "@" comes back encoded. decodeURIComponent throws on a malformed sequence, so a forged or
 * truncated cookie must not be able to break a relay route: on any failure the raw value is
 * used, and on any other failure the result is empty.
 *
 * @param {Awaited<ReturnType<typeof import("next/headers").cookies>>} cookieStore
 * @param {string} name
 * @returns {string}
 */
function readCookie(cookieStore, name) {
  try {
    const raw = cookieStore?.get?.(name)?.value;
    if (typeof raw !== "string" || !raw) return "";
    try {
      return decodeURIComponent(raw).trim();
    } catch {
      return raw.trim();
    }
  } catch {
    return "";
  }
}

/**
 * Resolve the current visitor's Customer.io identity from the request cookies.
 *
 * Never throws. Every field is independently optional, so a partial cookie set still yields
 * whatever is usable rather than nothing.
 *
 * @param {Awaited<ReturnType<typeof import("next/headers").cookies>>} cookieStore
 * @returns {{ wooCustomerId: string | null, email: string, phone: string }} `wooCustomerId` is
 *          the raw cookie string; payload.js normalizes and rejects it. Both are unverified,
 *          see the module header.
 */
export function resolveCustomerioIdentity(cookieStore) {
  const wooCustomerId = readCookie(cookieStore, "userId") || null;
  const email = readCookie(cookieStore, "userEmail").toLowerCase();

  let phone = "";
  try {
    // "US", not the "CA" default that utils/analytics/hashServerSide.js still carries. A bare
    // 10-digit US number must become +1XXXXXXXXXX here.
    phone = normalizePhoneToE164(readCookie(cookieStore, "pn"), "US") || "";
  } catch {
    phone = "";
  }

  return { wooCustomerId, email, phone };
}

/**
 * Client IP and user agent for Pipelines `context`. Same extraction the Meta and TikTok CAPI
 * routes use.
 *
 * @param {Request} req
 */
export function resolveRequestContext(req) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "";
  return { ip, userAgent: req.headers.get("user-agent") || "" };
}
