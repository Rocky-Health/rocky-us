/**
 * Customer.io server orchestration.
 *
 * The single place that turns "something happened, and here is who it happened to" into a
 * Pipelines request. Both relay routes call it, and so does the server-side subscribe path, so
 * a lead captured by a form and a lead captured in the browser take the same code.
 *
 * Every function here resolves to a result object and never throws, so no caller has to guard.
 *
 * Server-only.
 */

import { logger } from "@/utils/devLogger";
import { resolveCustomerioConfig } from "./config";
import { buildRelayLog, postToCustomerio } from "./client";
import {
  buildEventProperties,
  buildIdentifyTraits,
  buildIdentityKeys,
  buildPipelinesBody,
  createMessageId,
  isAllowedCustomerioEvent,
} from "./payload";

const skipped = (reason) => ({ ok: true, skipped: reason, status: null });

/**
 * Send an identify call.
 *
 * @param {object} input
 * @param {unknown} [input.wooCustomerId]
 * @param {string} [input.email]
 * @param {string} [input.phone]
 * @param {string} [input.anonymousId]
 * @param {{ ip?: string, userAgent?: string, url?: string }} [input.context]
 * @param {Record<string, string | undefined>} [input.env]
 * @param {typeof fetch} [input.fetchImpl]
 */
export async function identifyCustomerioProfile(input = {}) {
  const config = resolveCustomerioConfig(input.env);
  if (!config.enabled) return skipped(config.reason);

  const identity = buildIdentityKeys({
    wooCustomerId: input.wooCustomerId,
    email: input.email,
    anonymousId: input.anonymousId,
  });
  if (!identity) return skipped("no-identity");

  const traits = buildIdentifyTraits({ email: input.email, phone: input.phone });
  if (!Object.keys(traits).length && !identity.userId) return skipped("no-traits");

  const body = buildPipelinesBody({
    type: "identify",
    identity,
    traits,
    context: input.context,
    // Deliberately NOT deduplicated. An identify is idempotent by nature: it asserts the
    // traits and identifiers a profile should have, so sending it twice is harmless. Giving it
    // a deterministic messageId was actively harmful, because Customer.io then drops every
    // repeat, and a profile that failed to merge on the first attempt can never heal. A later
    // identify carrying the same userId, anonymousId and email is exactly what merges a forked
    // pair back together, and it must be allowed through.
    messageId: createMessageId({ event: "identify" }),
  });

  const result = await postToCustomerio({
    config,
    type: "identify",
    body,
    fetchImpl: input.fetchImpl,
  });

  logger.log(
    "[Customer.io identify]",
    buildRelayLog(config, result, {
      event: "identify",
      hasUserId: !!identity.userId,
      hasEmail: !!traits.email,
      hasPhone: !!traits.phone,
    })
  );

  return { ok: result.ok, status: result.status, error: result.error };
}

/**
 * Send a track call for one storefront-owned event.
 *
 * @param {object} input
 * @param {string} input.event One of the names in CUSTOMERIO_EVENTS.
 * @param {{ items?: Array<Record<string, unknown>>, currency?: string, value?: unknown }} [input.ecommerce]
 * @param {unknown} [input.wooCustomerId]
 * @param {string} [input.email]
 * @param {string} [input.anonymousId]
 * @param {string} [input.url]
 * @param {string} [input.dedupeKey]
 * @param {{ ip?: string, userAgent?: string }} [input.context]
 * @param {Record<string, string | undefined>} [input.env]
 * @param {typeof fetch} [input.fetchImpl]
 */
export async function trackCustomerioEvent(input = {}) {
  const config = resolveCustomerioConfig(input.env);
  if (!config.enabled) return skipped(config.reason);

  if (!isAllowedCustomerioEvent(input.event)) {
    return { ok: false, status: null, error: "unsupported-event" };
  }

  const identity = buildIdentityKeys({
    wooCustomerId: input.wooCustomerId,
    email: input.email,
    anonymousId: input.anonymousId,
  });
  if (!identity) return skipped("no-identity");

  const properties = buildEventProperties({
    ecommerce: input.ecommerce,
    url: input.url,
    sessionId: input.anonymousId,
  });
  if (!properties.products.length) return skipped("no-products");

  const body = buildPipelinesBody({
    type: "track",
    identity,
    event: input.event,
    properties,
    context: { ...(input.context || {}), url: input.url },
    messageId: createMessageId({ event: input.event, dedupeKey: input.dedupeKey }),
  });

  const result = await postToCustomerio({
    config,
    type: "track",
    body,
    fetchImpl: input.fetchImpl,
  });

  logger.log(
    `[Customer.io ${input.event}]`,
    buildRelayLog(config, result, {
      event: input.event,
      hasUserId: !!identity.userId,
      hasEmail: !!input.email,
      productCount: properties.products.length,
    })
  );

  return { ok: result.ok, status: result.status, error: result.error };
}
