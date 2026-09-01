/**
 * Transport. Every case injects a fetch spy, so no test here can reach the network, and the
 * assertions are on call counts and on the exact bytes handed to fetch.
 */

import { describe, expect, it, vi } from "vitest";

import { resolveCustomerioConfig } from "@/lib/customerio/config";
import { buildRelayLog, postToCustomerio } from "@/lib/customerio/client";

const CA_KEY = "cio-ca-write-key-for-tests";

/** Base64 of "cio-ca-write-key-for-tests:", worked out separately from the implementation. */
const EXPECTED_BASIC_CREDENTIAL = "Y2lvLWNhLXdyaXRlLWtleS1mb3ItdGVzdHM6";

const enabledConfig = () =>
  resolveCustomerioConfig({
    CUSTOMERIO_ENABLED: "true",
    CUSTOMERIO_WORKSPACE: "ca",
    CUSTOMERIO_CA_WRITE_KEY: CA_KEY,
  });

const disabledConfig = () => resolveCustomerioConfig({});

const respondWith = (status) => ({ ok: status >= 200 && status < 300, status });

const sampleBody = (overrides = {}) => ({
  type: "track",
  event: "Product Added",
  messageId: "cio-fixed-message-id",
  timestamp: "2026-09-01T12:00:00.000Z",
  userId: "12345",
  properties: { currency: "USD", products: [{ product_id: "8821", quantity: 1 }] },
  ...overrides,
});

describe("a send that must never leave the process", () => {
  it("makes no request at all when the integration is switched off", async () => {
    const fetchImpl = vi.fn();

    const result = await postToCustomerio({
      config: disabledConfig(),
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(fetchImpl.mock.calls).toHaveLength(0);
    expect(result.ok).toBe(false);
    expect(result.attempts).toBe(0);
    expect(result.error).toBe("disabled");
  });

  it("makes no request when a config arrives with no write key", async () => {
    const fetchImpl = vi.fn();

    const result = await postToCustomerio({
      config: {
        enabled: true,
        workspace: "ca",
        writeKey: null,
        host: "https://cdp.customer.io",
        reason: "ok",
      },
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(result.ok).toBe(false);
    expect(result.attempts).toBe(0);
  });

  it("refuses a body over the 32kb Pipelines limit before any request is made", async () => {
    const fetchImpl = vi.fn();
    const oversized = sampleBody({ properties: { blob: "x".repeat(33 * 1024) } });

    const result = await postToCustomerio({
      config: enabledConfig(),
      type: "track",
      body: oversized,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("payload-too-large");
    expect(result.attempts).toBe(0);
  });

  it("refuses an unsupported call type before any request is made", async () => {
    const fetchImpl = vi.fn();

    const result = await postToCustomerio({
      config: enabledConfig(),
      type: "group",
      body: sampleBody(),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(result.error).toBe("unsupported-type");
  });
});

describe("a successful send", () => {
  it("reports success after exactly one request", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respondWith(200));

    const result = await postToCustomerio({
      config: enabledConfig(),
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: true, status: 200, attempts: 1 });
  });

  it("authenticates with the write key as the Basic username and a blank password", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respondWith(200));

    await postToCustomerio({
      config: enabledConfig(),
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    const [, init] = fetchImpl.mock.calls[0];
    expect(init.headers.Authorization).toBe(`Basic ${EXPECTED_BASIC_CREDENTIAL}`);
    // Decoding is the inverse operation, so it checks the same claim from the other side.
    const decoded = Buffer.from(
      init.headers.Authorization.replace("Basic ", ""),
      "base64"
    ).toString("utf8");
    expect(decoded).toBe(`${CA_KEY}:`);
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(init.method).toBe("POST");
  });

  it("posts a track call to the track endpoint on the US Pipelines host", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respondWith(200));

    await postToCustomerio({
      config: enabledConfig(),
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    expect(fetchImpl.mock.calls[0][0]).toBe("https://cdp.customer.io/v1/track");
  });

  it("posts an identify call to the identify endpoint on the US Pipelines host", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respondWith(200));

    await postToCustomerio({
      config: enabledConfig(),
      type: "identify",
      body: sampleBody({ type: "identify", traits: { email: "lead@example.com" } }),
      fetchImpl,
    });

    expect(fetchImpl.mock.calls[0][0]).toBe("https://cdp.customer.io/v1/identify");
  });
});

describe("failure handling", () => {
  it("retries a server error once and resends the identical bytes", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respondWith(500));

    const result = await postToCustomerio({
      config: enabledConfig(),
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    const firstBody = fetchImpl.mock.calls[0][1].body;
    const secondBody = fetchImpl.mock.calls[1][1].body;
    expect(typeof firstBody).toBe("string");
    expect(secondBody).toBe(firstBody);
    expect(JSON.parse(secondBody).messageId).toBe(JSON.parse(firstBody).messageId);
    expect(JSON.parse(secondBody).messageId).toBe("cio-fixed-message-id");
    expect(result.ok).toBe(false);
    expect(result.attempts).toBe(2);
    expect(result.status).toBe(500);
  });

  it("retries a rate-limit response once", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respondWith(429));

    const result = await postToCustomerio({
      config: enabledConfig(),
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(429);
  });

  it("does not retry a rejected request, because resending will be rejected again", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respondWith(400));

    const result = await postToCustomerio({
      config: enabledConfig(),
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toBe("status-400");
    expect(result.attempts).toBe(1);
  });

  it("retries a network failure once and then gives up quietly", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("fetch failed"));

    const result = await postToCustomerio({
      config: enabledConfig(),
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(false);
    expect(result.error).not.toBeNull();
    expect(result.error).toBe("network");
    expect(result.status).toBeNull();
  });

  it("reports a timeout as a timeout instead of throwing out of the call", async () => {
    const abortError = new Error("The operation was aborted");
    abortError.name = "AbortError";
    const fetchImpl = vi.fn().mockRejectedValue(abortError);

    const result = await postToCustomerio({
      config: enabledConfig(),
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    expect(result.error).toBe("timeout");
    expect(result.ok).toBe(false);
  });

  it("survives a fetch that answers with nothing usable", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(undefined);

    const result = await postToCustomerio({
      config: enabledConfig(),
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    expect(() => JSON.stringify(result)).not.toThrow();
  });
});

describe("the relay log line", () => {
  it("carries no write key anywhere in it", async () => {
    const config = enabledConfig();
    const fetchImpl = vi.fn().mockResolvedValue(respondWith(200));
    const result = await postToCustomerio({
      config,
      type: "track",
      body: sampleBody(),
      fetchImpl,
    });

    const log = buildRelayLog(config, result, {
      event: "Product Added",
      hasUserId: true,
      hasEmail: true,
      hasPhone: false,
      productCount: 1,
    });

    const serialized = JSON.stringify(log);
    expect(serialized).not.toContain(CA_KEY);
    expect(serialized).not.toContain(EXPECTED_BASIC_CREDENTIAL);
    expect(serialized).not.toContain("write-key-for-tests");
    expect(log).not.toHaveProperty("writeKey");
    expect(log.has_write_key).toBe(true);
  });

  it("carries no identity values, only whether each was present", () => {
    const config = enabledConfig();
    const log = buildRelayLog(config, { ok: true, status: 200, attempts: 1 }, {
      event: "Product Added",
      hasUserId: true,
      hasEmail: true,
      hasPhone: true,
      productCount: 2,
    });

    expect(Object.keys(log).sort()).toEqual([
      "attempts",
      "enabled",
      "error",
      "event",
      "has_email",
      "has_phone",
      "has_user_id",
      "has_write_key",
      "ok",
      "product_count",
      "reason",
      "status",
      "workspace",
    ]);
    expect(JSON.stringify(log)).not.toContain("@");
  });
});
