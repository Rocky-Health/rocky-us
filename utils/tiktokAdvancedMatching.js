/**
 * Client-side TikTok Manual Advanced Matching helper.
 *
 * TikTok expects Manual AM to be sent through ttq.identify({ email,
 * phone_number, external_id }). Values here are SHA-256 hashes, matching the
 * server CAPI normalization/hashing path.
 */

import { getCookie } from "@/utils/cookieHelper";
import {
  hashSHA256Client,
  hashEmailClient,
  hashPhoneClient,
} from "@/utils/analytics/hashClientSide";

const SHA256_HEX_RE = /^[a-f0-9]{64}$/;

let lastIdentifiedKey = "";

const isSha256Hex = (value) =>
  typeof value === "string" && SHA256_HEX_RE.test(value.trim());

const pickHash = (...values) => {
  for (const value of values) {
    if (isSha256Hex(value)) return value.trim();
  }
  return "";
};

const getOrderData = (eventData = {}) =>
  eventData.order_data || eventData.orderData || {};

const getOrderHash = (orderData = {}, flatKey, nestedKey) =>
  orderData[flatKey] || orderData?.customer?.billing?.[nestedKey] || "";

const getExternalIdSource = (eventData = {}) => {
  const userId = getCookie("userId");
  if (userId) return userId;

  const raw =
    eventData.customer_id ||
    eventData.customer_id_canonical ||
    eventData.user_id ||
    "";
  const value = String(raw || "").trim();
  if (!value) return "";

  const wcMatch = value.match(/^wc:(.+)$/i);
  if (wcMatch?.[1]) return wcMatch[1].trim();

  return value;
};

const getIdentityKey = (eventData = {}) => {
  if (typeof document === "undefined") return "";

  try {
    const orderData = getOrderData(eventData);
    return [
      getCookie("userId"),
      getCookie("userEmail"),
      getCookie("pn"),
      getOrderHash(orderData, "billing_email_hash", "email_hash"),
      getOrderHash(orderData, "billing_phone_hash", "phone_hash"),
      eventData.customer_id || "",
      eventData.customer_id_canonical || "",
    ].join("|");
  } catch (_) {
    return "";
  }
};

/**
 * Build a TikTok Manual AM object from already-hashed event data and identity
 * cookies. Returns null when no usable identifier is available.
 *
 * @param {Object} eventData
 * @returns {Promise<Object|null>}
 */
export async function buildTikTokAdvancedMatching(eventData = {}) {
  if (typeof document === "undefined") return null;

  try {
    const orderData = getOrderData(eventData);
    const cookieEmail = getCookie("userEmail");
    const cookiePhone = getCookie("pn");
    const externalIdSource = getExternalIdSource(eventData);

    const [cookieEmailHash, cookiePhoneHash, externalIdHash] = await Promise.all([
      cookieEmail ? hashEmailClient(cookieEmail) : "",
      cookiePhone ? hashPhoneClient(cookiePhone, "US") : "",
      externalIdSource ? hashSHA256Client(externalIdSource) : "",
    ]);

    const am = {};
    const email = pickHash(
      getOrderHash(orderData, "billing_email_hash", "email_hash"),
      cookieEmailHash
    );
    const phone = pickHash(
      getOrderHash(orderData, "billing_phone_hash", "phone_hash"),
      cookiePhoneHash
    );

    if (email) am.email = email;
    if (phone) am.phone_number = phone;
    if (externalIdHash) am.external_id = externalIdHash;

    return Object.keys(am).length > 0 ? am : null;
  } catch (_) {
    return null;
  }
}

/**
 * Call ttq.identify exactly when a new usable identity is available. This is
 * best-effort enrichment and must never block or break event tracking.
 *
 * @param {Object} eventData
 * @returns {Promise<Object|null>}
 */
export async function identifyTikTokUser(eventData = {}) {
  if (typeof window === "undefined" || typeof window.ttq?.identify !== "function") {
    return null;
  }

  try {
    const am = await buildTikTokAdvancedMatching(eventData);
    if (!am) return null;

    const identityKey = `${getIdentityKey(eventData)}::${JSON.stringify(am)}`;
    if (identityKey && identityKey === lastIdentifiedKey) return am;

    window.ttq.identify(am);
    lastIdentifiedKey = identityKey;
    return am;
  } catch (_) {
    return null;
  }
}
