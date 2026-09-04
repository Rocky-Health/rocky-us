/**
 * Customer.io Pipelines transport.
 *
 * Direct HTTPS rather than the @customerio/cdp-analytics-node SDK. The SDK pulls node-fetch v2
 * plus two UUID packages into the bundle, hides timeout control, and batches on a background
 * flush timer that does not survive a serverless invocation ending. Every other server relay
 * in this repo (Attentive, Meta CAPI, TikTok CAPI, Northbeam) is a direct fetch, so this also
 * matches the house shape. The contract implemented here was read off the current SDK source
 * (@customerio/cdp-analytics-node 0.5.9): host, Basic auth with the write key as the username
 * and a blank password, and the /v1/identify and /v1/track paths.
 *
 * This module never throws and never returns a credential. Customer.io being slow, down, rate
 * limited or misconfigured must not be able to affect a cart, a checkout or a form.
 *
 * Server-only.
 */

import { describeCustomerioConfig } from "./config";

/** Customer.io rejects a single /v1/* request larger than 32kb. */
const MAX_BODY_BYTES = 32 * 1024;

/** Matches the 4000 ms used by the Attentive relay and the client-side product enrichers. */
const REQUEST_TIMEOUT_MS = 4000;

const RETRY_DELAY_MS = 1000;

const PATHS = {
  identify: "/v1/identify",
  track: "/v1/track",
};

const isRetryableStatus = (status) => status === 429 || (status >= 500 && status < 600);

const isRetryableError = (error) => {
  const code = error?.cause?.code || error?.code || "";
  if (["ETIMEDOUT", "ECONNRESET", "EAI_AGAIN", "ENOTFOUND", "ECONNREFUSED"].includes(code)) {
    return true;
  }
  const message = String(error?.message || "").toLowerCase();
  return (
    message.includes("timeout") || message.includes("network") || message.includes("fetch failed")
  );
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * POST one event to Customer.io Pipelines.
 *
 * The same serialized body is reused across the retry, so the caller-supplied `messageId`
 * stays identical and a retried 5xx cannot land as a second event.
 *
 * @param {object} input
 * @param {{ enabled: boolean, writeKey: string | null, host: string, workspace: string | null }} input.config
 * @param {"identify" | "track"} input.type
 * @param {Record<string, unknown>} input.body
 * @param {typeof fetch} [input.fetchImpl] Injected in tests.
 * @returns {Promise<{ ok: boolean, status: number | null, error?: string, attempts: number }>}
 */
export async function postToCustomerio(input) {
  const { config, type, body } = input;
  const fetchImpl = input.fetchImpl || fetch;

  // Defensive: the routes already refuse before reaching here. A disabled or keyless config
  // must never produce an outbound request under any caller mistake.
  if (!config?.enabled || !config?.writeKey) {
    return { ok: false, status: null, error: config?.reason || "not-configured", attempts: 0 };
  }

  const path = PATHS[type];
  if (!path) {
    return { ok: false, status: null, error: "unsupported-type", attempts: 0 };
  }

  let serialized;
  try {
    serialized = JSON.stringify(body);
  } catch {
    return { ok: false, status: null, error: "unserializable-body", attempts: 0 };
  }

  if (Buffer.byteLength(serialized, "utf8") > MAX_BODY_BYTES) {
    return { ok: false, status: null, error: "payload-too-large", attempts: 0 };
  }

  const url = `${config.host}${path}`;
  // Write key as the HTTP Basic username with a blank password.
  const authorization = `Basic ${Buffer.from(`${config.writeKey}:`, "utf8").toString("base64")}`;

  let attempts = 0;
  let lastStatus = null;
  let lastError = "";

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    attempts = attempt;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetchImpl(url, {
        method: "POST",
        headers: {
          Authorization: authorization,
          "Content-Type": "application/json",
        },
        body: serialized,
        signal: controller.signal,
      });

      lastStatus = response?.status ?? null;

      if (response?.ok) {
        return { ok: true, status: lastStatus, attempts };
      }

      if (attempt === 1 && isRetryableStatus(lastStatus)) {
        lastError = `retryable-status-${lastStatus}`;
        await sleep(RETRY_DELAY_MS);
        continue;
      }

      return { ok: false, status: lastStatus, error: `status-${lastStatus}`, attempts };
    } catch (error) {
      lastError = error?.name === "AbortError" ? "timeout" : "network";
      if (attempt === 1 && (lastError === "timeout" || isRetryableError(error))) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      return { ok: false, status: null, error: lastError, attempts };
    } finally {
      clearTimeout(timer);
    }
  }

  return { ok: false, status: lastStatus, error: lastError || "failed", attempts };
}

/**
 * A log line for one relay attempt. Carries no identity values and no credential, only
 * whether each was present.
 *
 * @param {ReturnType<typeof import("./config").resolveCustomerioConfig>} config
 * @param {{ ok: boolean, status: number | null, error?: string, attempts: number }} result
 * @param {{ event?: string, hasUserId?: boolean, hasEmail?: boolean, hasPhone?: boolean, productCount?: number }} [meta]
 */
export function buildRelayLog(config, result, meta = {}) {
  return {
    ...describeCustomerioConfig(config),
    event: meta.event || null,
    ok: !!result?.ok,
    status: result?.status ?? null,
    attempts: result?.attempts ?? 0,
    error: result?.error || null,
    has_user_id: !!meta.hasUserId,
    has_email: !!meta.hasEmail,
    has_phone: !!meta.hasPhone,
    product_count: Number.isFinite(meta.productCount) ? meta.productCount : null,
  };
}
