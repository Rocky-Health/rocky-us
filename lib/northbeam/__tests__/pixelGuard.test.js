import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  applyPixelGuard,
  applyPixelGuardBounded,
  isWithinLiveWindow,
  NB_LIVE_RECENCY_SECONDS,
  resolveOrderTimeIso,
} from "@/lib/northbeam/orderTime";
import {
  NB_WRITE_CONTEXT,
  normalizeWriteContext,
  shouldApplyPixelGuard,
} from "@/lib/northbeam/writeContext";
import {
  acceptCustomerIdOverride,
  isCanonicalCustomerId,
} from "@/lib/northbeam/customerId";

/**
 * Acceptance for TK-1052.
 *
 * The defect these assertions exist for: Northbeam compares the ISO instant in
 * time_of_purchase against its client purchase pixel, and a live order's own
 * instant is always earlier than the pixel firing on the confirmation page a
 * few seconds later, which drops the order from attribution entirely. Run
 * against a tree where the guard has leaked into resolveOrderTimeIso, where
 * the orders route never reads order.nb_write_context, or where a stale
 * re-send gets shifted anyway, these fail.
 */

const FAKE_NOW_ISO = "2026-09-02T21:00:00.000Z";
const FAKE_NOW_MS = Date.parse(FAKE_NOW_ISO);

// Restored after every test in this file, regardless of which describe set
// them, so a leaked value from one block cannot change the outcome of another.
const ORIGINAL_FETCH = global.fetch;

afterEach(() => {
  global.fetch = ORIGINAL_FETCH;
  delete process.env.VERCEL_ENV;
  vi.useRealTimers();
});

describe("orderTime seam, in isolation", () => {
  it("resolves the true UTC instant with no guard applied", () => {
    expect(resolveOrderTimeIso({ date_paid_gmt: "2026-09-02T20:12:11" })).toBe(
      "2026-09-02T20:12:11.000Z"
    );
  });

  it("pushes an instant forward by the pixel guard", () => {
    expect(applyPixelGuard("2026-09-02T20:12:11.000Z")).toBe(
      "2026-09-02T20:14:11.000Z"
    );
  });

  it("returns null for input it cannot shift", () => {
    expect(applyPixelGuard(null)).toBeNull();
    expect(applyPixelGuard("")).toBeNull();
    expect(applyPixelGuard("not-a-date")).toBeNull();
  });

  it("isWithinLiveWindow accepts anything within NB_LIVE_RECENCY_SECONDS and refuses anything older", () => {
    const justInside = new Date(
      FAKE_NOW_MS - (NB_LIVE_RECENCY_SECONDS - 1) * 1000
    ).toISOString();
    const justOutside = new Date(
      FAKE_NOW_MS - (NB_LIVE_RECENCY_SECONDS + 1) * 1000
    ).toISOString();
    expect(isWithinLiveWindow(justInside, FAKE_NOW_MS)).toBe(true);
    expect(isWithinLiveWindow(justOutside, FAKE_NOW_MS)).toBe(false);
    expect(isWithinLiveWindow(null, FAKE_NOW_MS)).toBe(false);
    expect(isWithinLiveWindow("not-a-date", FAKE_NOW_MS)).toBe(false);
  });

  it("applyPixelGuardBounded returns null for input it cannot shift, which is what the route's || clampedTimeIso fallback exists for", () => {
    expect(applyPixelGuardBounded("not-a-date", FAKE_NOW_MS)).toBeNull();
    expect(applyPixelGuardBounded(null, FAKE_NOW_MS)).toBeNull();
  });

  it("applyPixelGuardBounded caps the shift so it can never outrun now by more than the guard itself", () => {
    const nearlyTwoHoursAhead = new Date(FAKE_NOW_MS + 7190000).toISOString();
    const guarded = applyPixelGuardBounded(nearlyTwoHoursAhead, FAKE_NOW_MS);
    expect(guarded).toBe(new Date(FAKE_NOW_MS + 120000).toISOString());
  });
});

describe("normalizeWriteContext / shouldApplyPixelGuard", () => {
  it("treats anything unrecognised, missing or of the wrong type as historical", () => {
    for (const value of [undefined, null, "", "backfill", "BACKEND", 42, {}]) {
      expect(normalizeWriteContext(value)).toBe(
        NB_WRITE_CONTEXT.HISTORICAL_BACKFILL
      );
      expect(shouldApplyPixelGuard(value)).toBe(false);
    }
  });

  it("enables the guard only for a live purchase, case and whitespace insensitive", () => {
    expect(normalizeWriteContext("live_purchase")).toBe(
      NB_WRITE_CONTEXT.LIVE_PURCHASE
    );
    expect(shouldApplyPixelGuard("live_purchase")).toBe(true);
    expect(normalizeWriteContext("  LIVE_PURCHASE  ")).toBe(
      NB_WRITE_CONTEXT.LIVE_PURCHASE
    );
    expect(shouldApplyPixelGuard("  LIVE_PURCHASE  ")).toBe(true);
  });
});

describe("isCanonicalCustomerId / acceptCustomerIdOverride", () => {
  it("accepts the three known namespaces with a non-empty, conforming remainder", () => {
    for (const value of ["wc:123", "email:a@b.com", "phone:15551234567"]) {
      expect(isCanonicalCustomerId(value)).toBe(true);
      expect(acceptCustomerIdOverride(value)).toBe(value);
    }
  });

  it("lowercases an email override so it cannot split a customer against the derived, lowercased form", () => {
    expect(acceptCustomerIdOverride("email:Buyer@Example.com")).toBe(
      "email:buyer@example.com"
    );
  });

  it("rejects a shape-invalid value in each namespace, an unknown namespace, and non-string input", () => {
    for (const value of [
      "wc:0",
      "wc:-1",
      "wc:",
      "email:undefined",
      "email:wc:123",
      "phone:notaphone",
      "backend:99",
      "123",
      "",
      "   ",
      null,
      42,
      "email:a\nb@example.com",
      `wc:${"9".repeat(20)}`,
    ]) {
      expect(isCanonicalCustomerId(value)).toBe(false);
      expect(acceptCustomerIdOverride(value)).toBeNull();
    }
  });
});

describe("POST /api/northbeam/orders: clamp, pixel guard, and customer id override", () => {
  beforeEach(() => {
    process.env.BASE_URL = "https://example.test";
    process.env.CONSUMER_KEY = "ck_test";
    process.env.CONSUMER_SECRET = "cs_test";
    process.env.NB_CLIENT_ID = "cid";
    process.env.NB_API_KEY = "key";
    process.env.VERCEL_ENV = "production";
    delete process.env.NORTHBEAM_EXCLUDED_COUPONS;

    // The route derives its clamp and its guard from Date.now(). Pinning the
    // clock makes both deterministic instead of depending on how far the real
    // wall clock has drifted from the fixture timestamps below.
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FAKE_NOW_ISO));

    global.fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => "{}",
    }));

    vi.resetModules();
  });

  function buildOrder(overrides = {}) {
    return {
      order_id: "1001",
      currency: "USD",
      purchase_total: 49.99,
      customer_id: 123,
      customer_email: "buyer@example.com",
      products: [],
      ...overrides,
    };
  }

  async function postOrder(order) {
    const { POST } = await import("@/app/api/northbeam/orders/route");
    const req = new Request("https://example.test/api/northbeam/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: [order] }),
    });
    await POST(req);
    // Picks out the call whose URL is the vendor endpoint rather than
    // assuming position: a fixture that starts triggering the route's own
    // product-category lookup would otherwise silently read the wrong call.
    const call = global.fetch.mock.calls.find(
      ([url]) => url === "https://api.northbeam.io/v2/orders"
    );
    if (!call) throw new Error("no call reached the Northbeam endpoint");
    return JSON.parse(call[1].body)[0];
  }

  it("guards a live purchase forward by the pixel guard", async () => {
    const outbound = await postOrder(
      buildOrder({
        order_id: "1001",
        date_paid_gmt: "2026-09-02T20:12:11",
        nb_write_context: "live_purchase",
      })
    );
    expect(outbound.time_of_purchase).toBe("2026-09-02T20:14:11.000Z");
  });

  it("sends a years-old historical order with its true instant unshifted", async () => {
    // Region-convergence regression: the clamp used to be symmetric (Math.abs),
    // so any past instant more than 2h old was silently rewritten to now. A
    // fixture only 48 minutes old would still pass with that defect present,
    // so this uses a fixture years in the past instead, which can only pass
    // once the clamp is future-only.
    const outbound = await postOrder(
      buildOrder({
        order_id: "1002",
        date_paid_gmt: "2024-01-15T23:59:30",
        nb_write_context: "historical_backfill",
      })
    );
    expect(outbound.time_of_purchase).toBe("2024-01-15T23:59:30.000Z");
  });

  it("defaults an absent write context to historical: same years-old instant, unshifted", async () => {
    const outbound = await postOrder(
      buildOrder({
        order_id: "1003",
        date_paid_gmt: "2024-01-15T23:59:30",
      })
    );
    expect(outbound.time_of_purchase).toBe("2024-01-15T23:59:30.000Z");
  });

  it("still clamps a date more than 2h in the future to now: the surviving half of the fix", async () => {
    const threeHoursAhead = new Date(FAKE_NOW_MS + 3 * 60 * 60 * 1000).toISOString();
    const outbound = await postOrder(
      buildOrder({
        order_id: "1004",
        time_of_purchase: threeHoursAhead,
        nb_write_context: "historical_backfill",
      })
    );
    expect(outbound.time_of_purchase).toBe(FAKE_NOW_ISO);
  });

  it("does not shift a live-declared order whose instant is older than NB_LIVE_RECENCY_SECONDS", async () => {
    // The route no longer clamps a past instant to now, so this order's true
    // three-hour-old timestamp reaches the guard decision unchanged, and the
    // recency backstop is what refuses to shift it despite the live
    // declaration: shifting it would mutate a period that already closed.
    const threeHoursAgo = new Date(
      FAKE_NOW_MS - (NB_LIVE_RECENCY_SECONDS + 60 * 60) * 1000
    ).toISOString();
    const outbound = await postOrder(
      buildOrder({
        order_id: "1005",
        time_of_purchase: threeHoursAgo,
        nb_write_context: "live_purchase",
      })
    );
    expect(outbound.time_of_purchase).toBe(threeHoursAgo);
  });

  it("crosses the midnight boundary when the guard applies close to it", async () => {
    vi.setSystemTime(new Date("2026-09-02T23:59:30.000Z"));
    const outbound = await postOrder(
      buildOrder({
        order_id: "1006",
        date_paid_gmt: "2026-09-02T23:59:00",
        nb_write_context: "live_purchase",
      })
    );
    expect(outbound.time_of_purchase).toBe("2026-09-03T00:01:00.000Z");
  });

  it("caps a live purchase clamped just inside the future threshold at now plus the guard", async () => {
    const nearlyTwoHoursAhead = new Date(FAKE_NOW_MS + 7190000).toISOString();
    const outbound = await postOrder(
      buildOrder({
        order_id: "1007",
        time_of_purchase: nearlyTwoHoursAhead,
        nb_write_context: "live_purchase",
      })
    );
    const ceiling = new Date(FAKE_NOW_MS + 120000).toISOString();
    expect(outbound.time_of_purchase).toBe(ceiling);
    expect(Date.parse(outbound.time_of_purchase)).toBeLessThanOrEqual(
      FAKE_NOW_MS + 120000
    );
  });

  it("falls back to now plus the guard when order.time_of_purchase is invalid on a live purchase", async () => {
    const outbound = await postOrder(
      buildOrder({
        order_id: "1008",
        time_of_purchase: "not-a-real-date",
        nb_write_context: "live_purchase",
      })
    );
    expect(outbound.time_of_purchase).toBe(
      new Date(FAKE_NOW_MS + 120000).toISOString()
    );
  });

  it("refuses a non-conforming customer_id_canonical override and keeps the derived id", async () => {
    const outbound = await postOrder(
      buildOrder({
        order_id: "1009",
        customer_id: 123,
        customer_id_canonical: "backend:99",
      })
    );
    expect(outbound.customer_id).toBe("wc:123");
  });

  it("honours a conforming customer_id_canonical override", async () => {
    const outbound = await postOrder(
      buildOrder({
        order_id: "1010",
        customer_id: 456,
        customer_id_canonical: "email:someone@example.com",
      })
    );
    expect(outbound.customer_id).toBe("email:someone@example.com");
  });

  it("lowercases a mixed-case email override before it reaches the outbound payload", async () => {
    const outbound = await postOrder(
      buildOrder({
        order_id: "1011",
        customer_id: 456,
        customer_id_canonical: "email:Buyer@Example.com",
      })
    );
    expect(outbound.customer_id).toBe("email:buyer@example.com");
  });
});

describe("sixth writer: a recovered live order keeps the guard (TK-1052 gap)", () => {
  /**
   * app/api/northbeam/auto-retry/route.js forwards to
   * app/api/northbeam/backfill/route.js, whose mapper used to stamp
   * HISTORICAL_BACKFILL unconditionally. Auto-retry only ever recovers orders
   * with no prior successful write, which is exactly the set whose live send
   * failed after a pixel had already fired, so that hardcoded context was the
   * one guaranteed way an unguarded timestamp reached Northbeam. These two
   * tests cover the two production files involved individually rather than
   * end to end: the first proves auto-retry declares the context, the second
   * proves the backfill route honours a declared context all the way to a
   * shifted vendor payload.
   */
  beforeEach(() => {
    vi.resetModules();
    process.env.CRON_SECRET = "test-cron-secret";
    delete process.env.VERCEL_CRON_SECRET;
    process.env.NB_CLIENT_ID = "cid";
    process.env.NB_API_KEY = "key";
  });

  it("auto-retry declares live_purchase on the batch it hands to backfill", async () => {
    vi.doMock("@/lib/woocommerce", () => ({
      api: {
        get: vi.fn(async () => ({ data: [{ id: 555 }] })),
        put: vi.fn(async () => ({ data: {} })),
      },
    }));

    const fetchMock = vi.fn(async (url) => {
      if (String(url).endsWith("/api/northbeam/backfill")) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            totals: { ok: 1, failed: 0 },
            results: [],
          }),
        };
      }
      throw new Error(`unexpected fetch to ${url}`);
    });
    global.fetch = fetchMock;

    const { POST } = await import("@/app/api/northbeam/auto-retry/route");
    const req = new Request("https://example.test/api/northbeam/auto-retry", {
      method: "POST",
      headers: { authorization: "Bearer test-cron-secret" },
    });
    await POST(req);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(body.order_ids).toEqual([555]);
    expect(body.write_context).toBe(NB_WRITE_CONTEXT.LIVE_PURCHASE);
  });

  it("backfill honours a body-level write_context all the way to a shifted vendor payload", async () => {
    process.env.NORTHBEAM_SYNC_API_KEY = "a".repeat(64);
    process.env.VERCEL_ENV = "production";
    delete process.env.NORTHBEAM_EXCLUDED_COUPONS;

    vi.useFakeTimers();
    vi.setSystemTime(new Date(FAKE_NOW_ISO));

    vi.doMock("@/lib/woocommerce", () => ({
      api: {
        get: vi.fn(async () => ({
          data: {
            id: 777,
            status: "completed",
            total: "49.99",
            total_tax: "0",
            shipping_total: "0",
            discount_total: "0",
            currency: "USD",
            billing: { email: "buyer@example.com", phone: "", first_name: "A", last_name: "B" },
            customer_id: 456,
            line_items: [],
            coupon_lines: [],
            meta_data: [],
            date_paid_gmt: "2026-09-02T20:12:11",
          },
        })),
        put: vi.fn(async () => ({ data: {} })),
      },
    }));

    const vendorCalls = [];
    global.fetch = vi.fn(async (url, init) => {
      const urlStr = String(url);
      if (urlStr === "https://api.northbeam.io/v2/orders") {
        // The route posts an array of one order to the vendor, so capture
        // the order itself rather than the wrapping array.
        vendorCalls.push(JSON.parse(init.body)[0]);
        return { ok: true, status: 200, text: async () => "{}" };
      }
      if (urlStr.includes("/api/northbeam/orders")) {
        // Drives the real orders route handler rather than a generic stub, so
        // this proves the guard actually runs on the mapped order, not just
        // that a field was set on an object nobody reads.
        const { POST: ordersPost } = await import(
          "@/app/api/northbeam/orders/route"
        );
        const req = new Request(urlStr, {
          method: "POST",
          headers: init.headers,
          body: init.body,
        });
        return ordersPost(req);
      }
      throw new Error(`unexpected fetch to ${urlStr}`);
    });

    const { POST } = await import("@/app/api/northbeam/backfill/route");
    const req = new Request("https://example.test/api/northbeam/backfill", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.NORTHBEAM_SYNC_API_KEY,
      },
      body: JSON.stringify({
        order_ids: ["777"],
        write_context: "live_purchase",
      }),
    });
    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(vendorCalls).toHaveLength(1);
    expect(vendorCalls[0].time_of_purchase).toBe("2026-09-02T20:14:11.000Z");
  });
});

describe("the real browser call site: trackNorthbeamPurchase", () => {
  /**
   * Deleting the nb_write_context line added to this payload currently leaves
   * both the unit suite and the build green while killing attribution on
   * every live purchase, because nothing else exercises the function actually
   * called from the confirmation page.
   */
  it("stamps a live purchase with the unshifted true instant, leaving the guard to the route", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      status: 200,
      text: async () => "{}",
    }));
    global.fetch = fetchMock;

    const { trackNorthbeamPurchase } = await import("@/utils/northbeamEvents");

    const order = {
      id: 9001,
      status: "processing",
      date_paid_gmt: "2026-09-02T20:12:11",
      currency: "USD",
      total: "49.99",
      total_tax: "0",
      shipping_total: "0",
      discount_total: "0",
      billing: { email: "buyer@example.com", phone: "", first_name: "A", last_name: "B" },
      customer_id: 456,
      line_items: [],
      coupon_lines: [],
    };

    await trackNorthbeamPurchase(order, {}, false);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    const outbound = body.orders[0];
    expect(outbound.nb_write_context).toBe(NB_WRITE_CONTEXT.LIVE_PURCHASE);
    expect(outbound.time_of_purchase).toBe("2026-09-02T20:12:11.000Z");
  });
});
