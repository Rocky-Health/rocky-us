/**
 * Customer.io Pipelines payload construction.
 *
 * Everything Customer.io receives is built here, field by field, from an explicit allowlist.
 * Raw WooCommerce product, cart and order objects are never spread into a payload. This is a
 * health business: questionnaire answers, symptoms, diagnoses, clinician notes, prescription
 * detail and medical history must never reach a marketing platform, and the way to guarantee
 * that is to enumerate what may be sent rather than to filter what may not.
 *
 * Product and medication display names ARE sent deliberately, because abandoned-cart messaging
 * needs them. That is the only concession, and the schema stays narrow around it.
 *
 * This is the USA storefront, so the fallback currency is USD. It is only a fallback: when the
 * caller's `ecommerce.currency` is present it wins, and every US analytics payload already sets
 * it to USD.
 *
 * Server-only module. It reads node:crypto and is imported by the relay routes.
 */

import { createHash, randomUUID } from "node:crypto";

import { CUSTOMERIO_EVENTS } from "./events";

export { CUSTOMERIO_EVENTS } from "./events";

const ALLOWED_EVENT_NAMES = new Set(Object.values(CUSTOMERIO_EVENTS));

/** @param {string} name */
export const isAllowedCustomerioEvent = (name) => ALLOWED_EVENT_NAMES.has(name);

const DEFAULT_CURRENCY = "USD";

const asCleanString = (value) => {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
};

const asPositiveNumber = (value) => {
  const n = typeof value === "number" ? value : parseFloat(value);
  return Number.isFinite(n) && n >= 0 ? n : null;
};

const asQuantity = (value) => {
  const n = parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : 1;
};

/**
 * Normalize a WooCommerce customer ID to the canonical string form used as the Customer.io
 * `userId`.
 *
 * A bare stringified integer, not the `wc:` prefixed form the ad-platform relays use. Mayu's
 * backend integration writes the same bare Woo customer ID, and the two sides must agree
 * exactly or every person forks into two profiles.
 *
 * Woo reports `0` for a guest order, so anything at or below zero counts as "no customer yet".
 *
 * @param {unknown} rawId
 * @returns {string | null}
 */
export function normalizeWooCustomerId(rawId) {
  if (rawId === null || rawId === undefined || rawId === "") return null;
  const asNumber = typeof rawId === "number" ? rawId : Number(String(rawId).trim());
  if (!Number.isFinite(asNumber) || asNumber <= 0) return null;
  if (!Number.isInteger(asNumber)) return null;
  return String(asNumber);
}

/**
 * Map the repo's GA4-shaped `ecommerce.items` to the Customer.io product schema.
 *
 * Allowlisted fields only. Anything without a product ID is dropped rather than sent as an
 * orphan row.
 *
 * @param {{ items?: Array<Record<string, unknown>>, currency?: string }} [ecommerce]
 * @param {{ defaultCurrency?: string }} [options]
 */
export function toCustomerioProducts(ecommerce, options = {}) {
  const fallbackCurrency = options.defaultCurrency || DEFAULT_CURRENCY;
  const currency = asCleanString(ecommerce?.currency) || fallbackCurrency;
  const items = Array.isArray(ecommerce?.items) ? ecommerce.items : [];

  return items
    .map((item) => {
      const productId = asCleanString(item?.item_id ?? item?.id);
      if (!productId) return null;

      const product = { product_id: productId, currency };

      const variationId = asCleanString(item?.variant_id ?? item?.item_variant);
      if (variationId && variationId !== productId) product.variation_id = variationId;

      const sku = asCleanString(item?.sku ?? item?.item_sku);
      if (sku) product.sku = sku;

      const name = asCleanString(item?.item_name ?? item?.name);
      if (name) product.name = name;

      // Top-level vertical only (ED, WL, Hair and so on). The deeper item_category2..5 chain
      // can carry clinical detail, so it is not forwarded.
      const category = asCleanString(item?.item_category);
      if (category) product.category = category;

      product.quantity = asQuantity(item?.quantity);

      const price = asPositiveNumber(item?.price);
      if (price !== null) product.price = price;

      return product;
    })
    .filter(Boolean);
}

/**
 * Build the allowlisted `properties` object for a track call.
 *
 * @param {object} input
 * @param {{ items?: Array<Record<string, unknown>>, currency?: string, value?: unknown }} [input.ecommerce]
 * @param {string} [input.url] Page URL the action happened on.
 * @param {string} [input.sessionId] Anonymous session correlation ID.
 * @param {string} [input.defaultCurrency]
 */
export function buildEventProperties(input = {}) {
  const { ecommerce, url, sessionId } = input;
  const fallbackCurrency = input.defaultCurrency || DEFAULT_CURRENCY;
  const products = toCustomerioProducts(ecommerce, { defaultCurrency: fallbackCurrency });
  const currency = asCleanString(ecommerce?.currency) || fallbackCurrency;

  const properties = { currency, products };

  const cartTotal = asPositiveNumber(ecommerce?.value);
  if (cartTotal !== null) properties.cart_total = cartTotal;

  const cleanUrl = asCleanString(url);
  if (cleanUrl) properties.url = cleanUrl;

  const cleanSession = asCleanString(sessionId);
  if (cleanSession) properties.session_id = cleanSession;

  return properties;
}

/**
 * Build the allowlisted `traits` object for an identify call.
 *
 * Email and phone are identifiers in our workspace, so they belong on the profile. Nothing
 * else is carried: no address, no date of birth, no province, and nothing clinical.
 *
 * @param {{ email?: string, phone?: string }} [input]
 */
export function buildIdentifyTraits(input = {}) {
  const traits = {};
  const email = asCleanString(input.email).toLowerCase();
  if (email) traits.email = email;
  const phone = asCleanString(input.phone);
  if (phone) traits.phone = phone;
  return traits;
}

const sha256Hex = (value) => createHash("sha256").update(value).digest("hex");

/**
 * Resolve which Customer.io identity keys a call may use.
 *
 * A known customer is addressed by `userId`, the bare Woo customer ID. A lead with only an
 * email has no Woo ID yet, so it is addressed by `anonymousId` and carries its email as a
 * trait, which is what lets Customer.io multi-identifier merge converge the two once the Woo
 * ID appears.
 *
 * Returns null when there is nothing to address a profile by, so the caller can skip the send
 * instead of creating an unreachable profile.
 *
 * @param {{ wooCustomerId?: unknown, email?: string, anonymousId?: string }} [input]
 * @returns {{ userId?: string, anonymousId?: string } | null}
 */
export function buildIdentityKeys(input = {}) {
  const userId = normalizeWooCustomerId(input.wooCustomerId);
  const anonymousId = asCleanString(input.anonymousId);
  const email = asCleanString(input.email);

  const keys = {};
  if (userId) keys.userId = userId;
  if (anonymousId) keys.anonymousId = anonymousId;

  if (keys.userId) return keys;
  // No Woo ID: an email-only lead is still addressable, but only if we can correlate it.
  if (email && keys.anonymousId) return keys;
  if (email) return { anonymousId: `cio-email-${sha256Hex(email.toLowerCase())}` };
  return null;
}

/**
 * Build a Pipelines `messageId`.
 *
 * Two modes, on purpose:
 *  - With a `dedupeKey`, the ID is deterministic, so a double fire of the same logical
 *    application event collapses into one Customer.io event.
 *  - Without one, the ID is random, because events like Product Added are legitimately
 *    repeatable and collapsing them would lose real activity.
 *
 * Either way the caller generates the ID once and reuses it across transport retries, which
 * is what stops a retried 5xx from landing twice.
 *
 * Never pass a dedupeKey for an identify. An identify is idempotent, so deduplicating it gains
 * nothing, and it costs the ability to recover: a profile that failed to merge on its first
 * identify can only be healed by a later identify, which a stable messageId would silently drop.
 *
 * This is the Pipelines messageId. It is unrelated to a legacy Journeys event ID, and it is
 * not a substitute for one business event having one authoritative producer.
 *
 * @param {{ event: string, dedupeKey?: string }} input
 */
export function createMessageId(input = {}) {
  const event = asCleanString(input.event);
  const dedupeKey = asCleanString(input.dedupeKey);
  if (dedupeKey) return `cio-${sha256Hex(`${event}|${dedupeKey}`)}`;
  return `cio-${randomUUID()}`;
}

/**
 * Assemble a complete Pipelines event body.
 *
 * @param {object} input
 * @param {"identify" | "track"} input.type
 * @param {{ userId?: string, anonymousId?: string }} input.identity
 * @param {string} input.messageId
 * @param {string} [input.event] Required for `track`.
 * @param {Record<string, unknown>} [input.properties]
 * @param {Record<string, unknown>} [input.traits]
 * @param {{ ip?: string, userAgent?: string, url?: string }} [input.context]
 * @param {string} [input.timestamp] ISO 8601. Defaults to now.
 */
export function buildPipelinesBody(input) {
  const { type, identity, messageId, event, properties, traits } = input;

  const body = {
    type,
    messageId,
    timestamp: input.timestamp || new Date().toISOString(),
  };

  if (identity?.userId) body.userId = identity.userId;
  if (identity?.anonymousId) body.anonymousId = identity.anonymousId;

  if (type === "track") {
    body.event = event;
    body.properties = properties || {};
  } else {
    body.traits = traits || {};
  }

  const context = {};
  const ip = asCleanString(input.context?.ip);
  if (ip) context.ip = ip;
  const userAgent = asCleanString(input.context?.userAgent);
  if (userAgent) context.userAgent = userAgent;
  const url = asCleanString(input.context?.url);
  if (url) context.page = { url };
  if (Object.keys(context).length) body.context = context;

  return body;
}
