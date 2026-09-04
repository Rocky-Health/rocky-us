import { beforeEach, describe, expect, it, vi } from "vitest";

import { requireSyncApiKey } from "@/lib/northbeam/syncAuth";
import {
  checkIfAlreadySynced,
  isSubscriptionDerivative,
} from "@/lib/northbeam/orderGuards";

const SECRET = "a".repeat(64);

/**
 * Acceptance for TK-1024, region parity with the CA storefront.
 *
 * The defect these assertions exist for: /api/northbeam/backfill and
 * /api/northbeam/backfill-auto accepted unauthenticated POSTs from the open
 * internet, and the manual route had no eligibility guards at all, so it could
 * re-push an order the Relay had already sent and wipe its marketing tags.
 *
 * Run against the pre-fix tree these fail: requireSyncApiKey and the guard
 * module do not exist, and the route reaches body validation with no header.
 */

function requestWithKey(key) {
  const headers = new Headers();
  if (key !== undefined) headers.set("x-api-key", key);
  return new Request("https://example.test/api/northbeam/backfill", {
    method: "POST",
    headers,
    body: JSON.stringify({ order_ids: [] }),
  });
}

function silentLog() {
  return { log: vi.fn(), warn: vi.fn(), error: vi.fn() };
}

describe("requireSyncApiKey", () => {
  beforeEach(() => {
    delete process.env.NORTHBEAM_SYNC_AUTH_MODE;
    process.env.NORTHBEAM_SYNC_API_KEY = SECRET;
  });

  it("rejects a request with no X-API-Key header", async () => {
    const res = requireSyncApiKey(requestWithKey(undefined), "t", silentLog());
    expect(res).not.toBeNull();
    expect(res.status).toBe(401);
    await expect(res.json()).resolves.toEqual({ error: "Unauthorized" });
  });

  it("rejects a wrong key", () => {
    const res = requireSyncApiKey(requestWithKey("b".repeat(64)), "t", silentLog());
    expect(res?.status).toBe(401);
  });

  it("rejects a correct prefix of the key", () => {
    const res = requireSyncApiKey(requestWithKey(SECRET.slice(0, 32)), "t", silentLog());
    expect(res?.status).toBe(401);
  });

  it("rejects an empty string key", () => {
    const res = requireSyncApiKey(requestWithKey(""), "t", silentLog());
    expect(res?.status).toBe(401);
  });

  it("accepts the correct key", () => {
    expect(requireSyncApiKey(requestWithKey(SECRET), "t", silentLog())).toBeNull();
  });

  it("fails closed when the secret is not configured", () => {
    delete process.env.NORTHBEAM_SYNC_API_KEY;
    const res = requireSyncApiKey(requestWithKey(SECRET), "t", silentLog());
    expect(res?.status).toBe(401);
  });

  it("observe mode lets a request through that would have been rejected", () => {
    process.env.NORTHBEAM_SYNC_AUTH_MODE = "observe";
    expect(requireSyncApiKey(requestWithKey("wrong"), "t", silentLog())).toBeNull();
  });

  it("observe mode is case insensitive and ignores unrelated values", () => {
    process.env.NORTHBEAM_SYNC_AUTH_MODE = "OBSERVE";
    expect(requireSyncApiKey(requestWithKey("wrong"), "t", silentLog())).toBeNull();
    process.env.NORTHBEAM_SYNC_AUTH_MODE = "enforce";
    expect(requireSyncApiKey(requestWithKey("wrong"), "t", silentLog())?.status).toBe(401);
  });
});

describe("isSubscriptionDerivative", () => {
  const meta = (key) => ({ meta_data: [{ key, value: "1" }] });

  it("skips renewals, resubscribes and switches", () => {
    expect(isSubscriptionDerivative(meta("_subscription_renewal"))).toBe(true);
    expect(isSubscriptionDerivative(meta("_subscription_resubscribe"))).toBe(true);
    expect(isSubscriptionDerivative(meta("_subscription_switch"))).toBe(true);
  });

  it("does not skip a parent purchase", () => {
    expect(isSubscriptionDerivative({ meta_data: [{ key: "_awin_awc", value: "x" }] })).toBe(false);
    expect(isSubscriptionDerivative({ meta_data: [] })).toBe(false);
    expect(isSubscriptionDerivative({})).toBe(false);
  });
});

describe("checkIfAlreadySynced", () => {
  it("treats a Relay-sent order as synced", () => {
    const r = checkIfAlreadySynced({
      meta_data: [{ key: "_nb_last_pushed_total", value: "249.00" }],
    });
    expect(r.synced).toBe(true);
    expect(r.handled_by_relay).toBe(true);
  });

  it("treats a previously backfilled order as synced and reads its attempt count", () => {
    const r = checkIfAlreadySynced({
      meta_data: [
        { key: "_northbeam_backfilled", value: "yes" },
        { key: "_northbeam_backfilled_at", value: "2026-09-01T00:00:00Z" },
        { key: "_northbeam_backfill_attempts", value: "3" },
      ],
    });
    expect(r.synced).toBe(true);
    expect(r.handled_by_relay).toBe(false);
    expect(r.attempts).toBe(3);
  });

  it("does not treat a fresh order as synced", () => {
    expect(checkIfAlreadySynced({ meta_data: [] }).synced).toBe(false);
    expect(checkIfAlreadySynced({}).synced).toBe(false);
  });

  it("does not treat _northbeam_backfilled=no as synced", () => {
    const r = checkIfAlreadySynced({
      meta_data: [{ key: "_northbeam_backfilled", value: "no" }],
    });
    expect(r.synced).toBe(false);
  });
});

describe("route ordering: auth runs before body validation", () => {
  beforeEach(() => {
    // The Woo client validates these at import time. Dummy values are enough
    // because no request in this suite ever reaches a Woo call.
    process.env.BASE_URL = "https://example.test";
    process.env.CONSUMER_KEY = "ck_test";
    process.env.CONSUMER_SECRET = "cs_test";
    process.env.NORTHBEAM_SYNC_API_KEY = SECRET;
    delete process.env.NORTHBEAM_SYNC_AUTH_MODE;
    vi.resetModules();
  });

  it("returns 401 for an unauthenticated POST rather than starting a batch", async () => {
    const { POST } = await import("@/app/api/northbeam/backfill/route");
    const res = await POST(requestWithKey(undefined));
    expect(res.status).toBe(401);
  });

  it("returns 400 for an authenticated POST with an empty order_ids array", async () => {
    // The 400 is the proof of the accept path: reaching body validation means
    // the key was accepted.
    const { POST } = await import("@/app/api/northbeam/backfill/route");
    const res = await POST(requestWithKey(SECRET));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({ error: "order_ids array required" });
  });

  it("returns 401 on backfill-auto for an unauthenticated POST", async () => {
    const { POST } = await import("@/app/api/northbeam/backfill-auto/route");
    const res = await POST(requestWithKey(undefined));
    expect(res.status).toBe(401);
  });
});
