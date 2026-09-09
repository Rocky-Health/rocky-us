import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { NB_CANONICAL_CUTOVER_ISO } from "@/lib/northbeam/auditWindow";

/**
 * Acceptance for TK-1030's storefront contract.
 *
 * The strongest constraint of TK-1030 lived only in a comment in
 * app/api/northbeam/backfill-auto/route.js: in audit mode the route must
 * issue zero wooApi.put calls and zero fetches to /api/northbeam/orders, and
 * a post-cutover order with no sync meta must be classified as a gap. Run
 * against a tree where that comment is the only enforcement, nothing here
 * fails on its own; these assertions are what would have caught a regression
 * that let audit mode write again.
 *
 * These drive the REAL backfill-auto POST route handler. Only
 * @/lib/woocommerce and global.fetch are mocked.
 */

const SECRET = "a".repeat(64);
const CUTOVER_MS = Date.parse(NB_CANONICAL_CUTOVER_ISO);

// A day after cutover: post cutover, and (relative to FAKE_NOW below) well
// past the 24h settle window, so it is both post_cutover-eligible and
// settled.
const POST_CUTOVER_PAID_ISO = new Date(
  CUTOVER_MS + 24 * 60 * 60 * 1000
).toISOString();
// A day before cutover.
const PRE_CUTOVER_PAID_ISO = new Date(
  CUTOVER_MS - 24 * 60 * 60 * 1000
).toISOString();
// Three days after cutover, comfortably clearing the 24h settle window for
// the post-cutover fixture above.
const FAKE_NOW_ISO = new Date(
  CUTOVER_MS + 3 * 24 * 60 * 60 * 1000
).toISOString();

const ORIGINAL_FETCH = global.fetch;

function wooOrderFixture(id, paidIso) {
  return {
    id,
    status: "completed",
    total: "49.99",
    total_tax: "0",
    shipping_total: "0",
    discount_total: "0",
    currency: "USD",
    billing: {
      email: "buyer@example.com",
      phone: "",
      first_name: "A",
      last_name: "B",
    },
    customer_id: 456,
    line_items: [],
    coupon_lines: [],
    meta_data: [],
    date_paid_gmt: paidIso,
  };
}

function backfillAutoRequest(body, key = SECRET) {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (key !== undefined) headers.set("x-api-key", key);
  return new Request("https://example.test/api/northbeam/backfill-auto", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

describe("TK-1030 audit contract: POST /api/northbeam/backfill-auto", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FAKE_NOW_ISO));

    process.env.NORTHBEAM_SYNC_API_KEY = SECRET;
    delete process.env.NORTHBEAM_SYNC_AUTH_MODE;
    process.env.NB_CLIENT_ID = "cid";
    process.env.NB_API_KEY = "key";
    delete process.env.NORTHBEAM_CANONICAL_CUTOVER;
    delete process.env.NORTHBEAM_AUDIT_SETTLE_HOURS;
  });

  afterEach(() => {
    global.fetch = ORIGINAL_FETCH;
    vi.useRealTimers();
  });

  it("audit mode reports a gap for a post-cutover, unsynced, settled order, and never writes or sends", async () => {
    const order = wooOrderFixture(2001, POST_CUTOVER_PAID_ISO);
    const put = vi.fn(async () => ({ data: {} }));
    vi.doMock("@/lib/woocommerce", () => ({
      api: {
        get: vi.fn(async () => ({ data: order })),
        put,
      },
    }));

    // Audit mode should never reach a fetch at all: throwing here turns a
    // regression into a loud failure instead of a silently-swallowed one.
    const fetchMock = vi.fn(async () => {
      throw new Error("audit mode must never fetch");
    });
    global.fetch = fetchMock;

    const { POST } = await import("@/app/api/northbeam/backfill-auto/route");
    const res = await POST(
      backfillAutoRequest({ order_ids: ["2001"], mode: "audit" })
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.mode).toBe("audit");
    expect(json.results).toEqual([
      expect.objectContaining({
        id: "2001",
        status: "gap",
        reason: "unsynced_post_cutover",
      }),
    ]);
    expect(json.gaps).toBe(1);
    expect(json.stats.gaps).toBe(1);

    expect(put).not.toHaveBeenCalled();
    const orderCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/api/northbeam/orders")
    );
    expect(orderCalls).toHaveLength(0);
  });

  it("a pre-cutover order is skipped with reason pre_cutover and writes nothing", async () => {
    const order = wooOrderFixture(2002, PRE_CUTOVER_PAID_ISO);
    const put = vi.fn(async () => ({ data: {} }));
    vi.doMock("@/lib/woocommerce", () => ({
      api: {
        get: vi.fn(async () => ({ data: order })),
        put,
      },
    }));

    const fetchMock = vi.fn(async () => {
      throw new Error("a pre-cutover order must never fetch either");
    });
    global.fetch = fetchMock;

    const { POST } = await import("@/app/api/northbeam/backfill-auto/route");
    const res = await POST(
      backfillAutoRequest({ order_ids: ["2002"], mode: "audit" })
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.results).toEqual([
      expect.objectContaining({
        id: "2002",
        status: "skipped",
        reason: "pre_cutover",
      }),
    ]);
    expect(json.gaps).toBe(0);

    expect(put).not.toHaveBeenCalled();
    const orderCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/api/northbeam/orders")
    );
    expect(orderCalls).toHaveLength(0);
  });

  it("repair mode reaches the write path for the same post-cutover order: the control proving the audit assertions are not vacuous", async () => {
    const order = wooOrderFixture(2001, POST_CUTOVER_PAID_ISO);
    const put = vi.fn(async () => ({ data: {} }));
    vi.doMock("@/lib/woocommerce", () => ({
      api: {
        get: vi.fn(async () => ({ data: order })),
        put,
      },
    }));

    const fetchMock = vi.fn(async (url) => {
      if (String(url).includes("/api/northbeam/orders")) {
        return { ok: true, status: 200, json: async () => ({ success: true }) };
      }
      throw new Error(`unexpected fetch to ${url}`);
    });
    global.fetch = fetchMock;

    const { POST } = await import("@/app/api/northbeam/backfill-auto/route");
    const res = await POST(
      backfillAutoRequest({ order_ids: ["2001"], mode: "repair" })
    );
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.mode).toBe("repair");
    expect(json.results).toEqual([
      expect.objectContaining({
        id: "2001",
        status: "ok",
        marker_written: true,
      }),
    ]);

    const orderCalls = fetchMock.mock.calls.filter(([url]) =>
      String(url).includes("/api/northbeam/orders")
    );
    expect(orderCalls).toHaveLength(1);
    expect(put).toHaveBeenCalledTimes(1);
  });
});
