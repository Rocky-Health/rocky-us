import { beforeEach, describe, expect, it, vi } from "vitest";

const SECRET = "a".repeat(64);

/**
 * Acceptance for TK-1025, region parity with the CA storefront.
 *
 * /api/northbeam/orders is the route the WordPress Northbeam Relay plugin
 * (and the backfill routes, internally) post to. Before this change it
 * accepted an unauthenticated POST from the open internet. These assertions
 * run against the REAL route POST handler, not a mock, because the point is
 * to prove the guard is actually wired as the first statement in the
 * handler, not merely that requireSyncApiKey itself works (that is already
 * covered in syncAuth.test.js).
 *
 * Run against the pre-fix tree, every assertion in the first describe block
 * fails: the route had no header check at all, so an unauthenticated,
 * wrong-key, or partial-key request all reached body validation and returned
 * something other than 401.
 */

function requestWithHeaders(headers, body) {
  const h = new Headers();
  for (const [key, value] of Object.entries(headers || {})) {
    if (value !== undefined) h.set(key, value);
  }
  if (!h.has("Content-Type")) h.set("Content-Type", "application/json");
  return new Request("https://example.test/api/northbeam/orders", {
    method: "POST",
    headers: h,
    body: JSON.stringify(body ?? { orders: [] }),
  });
}

describe("POST /api/northbeam/orders auth guard", () => {
  beforeEach(() => {
    process.env.BASE_URL = "https://example.test";
    process.env.CONSUMER_KEY = "ck_test";
    process.env.CONSUMER_SECRET = "cs_test";
    process.env.NB_CLIENT_ID = "cid";
    process.env.NB_API_KEY = "key";
    process.env.VERCEL_ENV = "production";
    process.env.NORTHBEAM_SYNC_API_KEY = SECRET;
    delete process.env.NORTHBEAM_SYNC_AUTH_MODE;
    vi.resetModules();
  });

  it("rejects a request with no X-API-Key header with 401", async () => {
    const { POST } = await import("@/app/api/northbeam/orders/route");
    const res = await POST(requestWithHeaders({}, { orders: [] }));
    expect(res.status).toBe(401);
  });

  it("rejects a wrong key with 401", async () => {
    const { POST } = await import("@/app/api/northbeam/orders/route");
    const res = await POST(
      requestWithHeaders({ "X-API-Key": "b".repeat(64) }, { orders: [] })
    );
    expect(res.status).toBe(401);
  });

  it("rejects a correct prefix of the key with 401", async () => {
    const { POST } = await import("@/app/api/northbeam/orders/route");
    const res = await POST(
      requestWithHeaders({ "X-API-Key": SECRET.slice(0, 32) }, { orders: [] })
    );
    expect(res.status).toBe(401);
  });

  it("reaches the route's own validation, not the auth guard, for a correct key with a body that fails validation", async () => {
    const { POST } = await import("@/app/api/northbeam/orders/route");
    // No `orders` array at all: the route's own 400 for invalid order data.
    // A 400 here, rather than a 401, is the proof the accept path was reached.
    const res = await POST(requestWithHeaders({ "X-API-Key": SECRET }, {}));
    expect(res.status).toBe(400);
    await expect(res.json()).resolves.toEqual({
      error: "Invalid order data: orders array is required",
    });
  });

  it("fails closed with 401 when the secret is unset in the environment", async () => {
    delete process.env.NORTHBEAM_SYNC_API_KEY;
    vi.resetModules();
    const { POST } = await import("@/app/api/northbeam/orders/route");
    const res = await POST(
      requestWithHeaders({ "X-API-Key": SECRET }, { orders: [] })
    );
    expect(res.status).toBe(401);
  });
});
