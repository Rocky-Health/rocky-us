/**
 * Customer.io browser helper.
 *
 * Mirrors the other client relays in this repo: build a payload, POST it to our own relay
 * route, forget about it. Attentive, GTM, Meta, TikTok and Northbeam are untouched by this
 * file and all of them keep running in parallel.
 *
 * Deliberately NOT gated on an env var. A browser helper cannot read a non-NEXT_PUBLIC var
 * (it is undefined in the client bundle, so the guard would return early and silently suppress
 * every event, which is exactly what killed DatomniX purchases), and adding a NEXT_PUBLIC
 * mirror of CUSTOMERIO_ENABLED would put the kill switch in two places that can disagree.
 * Instead the relay route owns the decision: when Customer.io is disabled or misconfigured the
 * route short-circuits before any outbound request and answers 200. The only cost of a
 * disabled integration is a same-origin POST that does nothing.
 *
 * No PII is sent from here. The relay attaches identity from the cookies server-side.
 *
 * Session ID choice. This repo has two competing session identifiers and Customer.io uses one
 * of them on purpose:
 *  - CHOSEN: `rk_sess_id`, minted by getOrCreateSessionId() in utils/dataLayerHelper.js
 *    (cookie plus localStorage, format sess_<ms>_<hex>). It is the id already stamped on every
 *    dataLayer and GA4 ecommerce event, so a Customer.io session_id lines up with the GA4
 *    session for the same visit and the two can be reconciled.
 *  - REJECTED: `rk_session_id`, the UUID v4 minted by utils/requestIds.js and used by
 *    middleware.js for API request tracing. It correlates a Customer.io event with a server
 *    request log, which is not what marketing needs, and it also exports a function of the same
 *    name, so the import path below matters. Note that Canada reads
 *    sessionStorage._session_id, which does not exist on this repo at all.
 */

import { logger } from "@/utils/devLogger";
import { getOrCreateSessionId } from "@/utils/dataLayerHelper";
import { CUSTOMERIO_EVENTS } from "@/lib/customerio/events";

const EVENTS_ENDPOINT = "/api/customerio/events";
const IDENTIFY_ENDPOINT = "/api/customerio/identify";

/**
 * The anonymous correlation ID. See the session ID note in the module header for why this is
 * the dataLayer session and not the request-tracing one.
 */
const readSessionId = () => {
  try {
    return getOrCreateSessionId() || "";
  } catch {
    return "";
  }
};

const currentUrl = () => {
  try {
    return window.location.href;
  } catch {
    return "";
  }
};

const post = (endpoint, body) => {
  try {
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      // keepalive so a send survives the navigation that often follows the action.
      keepalive: true,
    }).catch(() => {});
  } catch (error) {
    logger.warn("[Customer.io] send skipped:", error);
  }
};

/**
 * A stable signature of the cart, used as a dedupe key so a component remount does not emit
 * the same Checkout Started twice.
 *
 * @param {{ items?: Array<Record<string, unknown>> }} [ecommerce]
 */
const cartSignature = (ecommerce) =>
  (Array.isArray(ecommerce?.items) ? ecommerce.items : [])
    .map((it) => `${it?.item_id ?? it?.id ?? ""}x${it?.quantity ?? 1}`)
    .join(",");

const sendEvent = (event, ecommerce, dedupeKey) => {
  if (typeof window === "undefined") return;
  const items = Array.isArray(ecommerce?.items) ? ecommerce.items : [];
  if (!items.length) return;

  post(EVENTS_ENDPOINT, {
    event,
    ecommerce,
    url: currentUrl(),
    sessionId: readSessionId(),
    dedupeKey,
  });
};

/** @param {{ items?: Array<Record<string, unknown>>, currency?: string, value?: unknown }} ecommerce */
export const sendCustomerioProductViewed = (ecommerce) =>
  sendEvent(CUSTOMERIO_EVENTS.PRODUCT_VIEWED, ecommerce);

/** @param {{ items?: Array<Record<string, unknown>>, currency?: string, value?: unknown }} ecommerce */
export const sendCustomerioProductAdded = (ecommerce) =>
  sendEvent(CUSTOMERIO_EVENTS.PRODUCT_ADDED, ecommerce);

/** @param {{ items?: Array<Record<string, unknown>>, currency?: string, value?: unknown }} ecommerce */
export const sendCustomerioCheckoutStarted = (ecommerce) => {
  if (typeof window === "undefined") return;
  sendEvent(
    CUSTOMERIO_EVENTS.CHECKOUT_STARTED,
    ecommerce,
    `checkout|${readSessionId()}|${cartSignature(ecommerce)}`
  );
};

/**
 * Identify the current person. Safe to call with no arguments for a logged-in customer: the
 * relay reads the Woo customer ID and email from the cookies and ignores the body.
 *
 * @param {{ email?: string, phone?: string }} [lead] Only used when there is no cookie value.
 */
export const identifyCustomerioProfile = (lead = {}) => {
  if (typeof window === "undefined") return;
  post(IDENTIFY_ENDPOINT, {
    email: lead.email,
    phone: lead.phone,
    sessionId: readSessionId(),
  });
};
