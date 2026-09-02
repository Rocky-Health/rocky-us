import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import {
  isOwnDomainReferrer,
  buildSourceAttributionMeta,
  NB_SOURCE_PROVENANCE,
} from "@/lib/northbeam/sourceAttribution";

/**
 * Acceptance for TK-1026.
 *
 * The defect this exists for: utm parameters, click ids, the landing page and
 * the original referrer only ever live in the shopper's browser session, so a
 * server side re-push has no way to see them and a re-push wipes an order's
 * marketing source tags. These assertions fail on a tree where the order
 * route stops spreading the seam's meta into meta_data, or where the seam
 * itself regresses on the own domain exclusion it exists for.
 *
 * Fixtures use the US storefront host (www.myrocky.com) so the regional
 * exclusion (myrocky.ca is not myrocky.com's own domain) is actually
 * exercised here rather than copied from the CA suite.
 */

const HOST = "www.myrocky.com";

function metaValue(meta, suffix) {
  const entry = meta.find((m) => m.key === `_nb_${suffix}`);
  return entry ? entry.value : undefined;
}

describe("isOwnDomainReferrer", () => {
  it("is true for the exact request host", () => {
    expect(isOwnDomainReferrer("www.myrocky.com", HOST)).toBe(true);
  });

  it("is true for any subdomain of the request host's apex", () => {
    expect(isOwnDomainReferrer("account.myrocky.com", "myrocky.com")).toBe(true);
  });

  it("is true for any vercel.app preview", () => {
    expect(isOwnDomainReferrer("rocky-us-git-tk-1026.vercel.app", HOST)).toBe(true);
  });

  it("is true for localhost", () => {
    expect(isOwnDomainReferrer("localhost", HOST)).toBe(true);
  });

  it("is false for an unrelated domain", () => {
    expect(isOwnDomainReferrer("google.com", HOST)).toBe(false);
  });

  it("is false for the other region's storefront", () => {
    // myrocky.ca is a real referrer, just not this storefront's own domain.
    expect(isOwnDomainReferrer("myrocky.ca", HOST)).toBe(false);
  });

  it("is false for an empty referrer", () => {
    expect(isOwnDomainReferrer("", HOST)).toBe(false);
  });
});

describe("buildSourceAttributionMeta, own domain referrer", () => {
  it("drops the referrer, its domain, and an echoed source name, and records why", () => {
    const meta = buildSourceAttributionMeta({
      source: {
        referrer: "https://www.myrocky.com/checkout",
        referrer_domain: "www.myrocky.com",
        // Same failure mode the module's own comment describes: source_name
        // fell through to the referrer domain, so it must be dropped with it.
        source_name: "www.myrocky.com",
      },
      requestHost: HOST,
    });

    expect(metaValue(meta, "referrer")).toBe("");
    expect(metaValue(meta, "referrer_domain")).toBe("");
    expect(metaValue(meta, "referrer_excluded")).toBe("own_domain");
    expect(metaValue(meta, "source_name")).toBe("");
  });
});

describe("buildSourceAttributionMeta, real external referrer", () => {
  it("survives intact with no exclusion recorded", () => {
    const meta = buildSourceAttributionMeta({
      source: {
        referrer: "https://google.com/search?q=rocky+health",
        referrer_domain: "google.com",
      },
      requestHost: HOST,
    });

    expect(metaValue(meta, "referrer")).toBe("https://google.com/search?q=rocky+health");
    expect(metaValue(meta, "referrer_domain")).toBe("google.com");
    expect(metaValue(meta, "referrer_excluded")).toBe("");
  });
});

describe("buildSourceAttributionMeta, click id degradation path", () => {
  it("a gclid present only in cookies still reaches _nb_click_ids, provenance server_cookie", () => {
    const meta = buildSourceAttributionMeta({
      source: {},
      cookies: { gclid: "cookie-only-gclid" },
      requestHost: HOST,
    });

    const clickIds = JSON.parse(metaValue(meta, "click_ids"));
    expect(clickIds.gclid).toBe("cookie-only-gclid");
    expect(metaValue(meta, "source_provenance")).toBe(NB_SOURCE_PROVENANCE.SERVER_COOKIE);
  });

  it("client fields plus a cookie only click id produce provenance mixed", () => {
    const meta = buildSourceAttributionMeta({
      source: { utm_source: "newsletter" },
      cookies: { gclid: "cookie-only-gclid" },
      requestHost: HOST,
    });

    expect(metaValue(meta, "source_provenance")).toBe(NB_SOURCE_PROVENANCE.MIXED);
  });

  it("nothing available produces provenance none and still emits every key", () => {
    const meta = buildSourceAttributionMeta({ requestHost: HOST });

    expect(metaValue(meta, "source_provenance")).toBe(NB_SOURCE_PROVENANCE.NONE);
    // 5 utm fields + source_name + referrer + referrer_domain + landing_page +
    // session_id + click_ids + referrer_excluded + source_provenance +
    // source_captured_at.
    expect(meta).toHaveLength(14);
    for (const entry of meta) {
      if (entry.key === "_nb_source_provenance") continue;
      if (entry.key === "_nb_source_captured_at") continue;
      expect(entry.value).toBe("");
    }
  });

  it("_epik and epik collapse to a single epik entry", () => {
    const meta = buildSourceAttributionMeta({
      source: {},
      cookies: { epik: "epik-value", _epik: "underscore-epik-value" },
      requestHost: HOST,
    });

    const clickIds = JSON.parse(metaValue(meta, "click_ids"));
    expect(Object.keys(clickIds)).toEqual(["epik"]);
    expect(clickIds.epik).toBe("epik-value");
  });
});

describe("buildSourceAttributionMeta, capture timestamp", () => {
  it("uses the injected capturedAt rather than calling the clock itself", () => {
    const meta = buildSourceAttributionMeta({
      requestHost: HOST,
      capturedAt: "2020-01-01T00:00:00.000Z",
    });

    expect(metaValue(meta, "source_captured_at")).toBe("2020-01-01T00:00:00.000Z");
  });
});

// ─────────────────────────────────────────────────────────────────────────
// Route level: proves the order actually carries the seam's output, not just
// that the seam produces correct output in isolation.
//
// UNTESTED BOUNDARY: next/headers' cookies() throws "called outside a
// request scope" when a route handler is invoked directly under vitest,
// because it depends on the AsyncLocalStorage Next's own server sets up
// around a real request; that is a pre-existing property of every route in
// this app (TK-1022's route reads the same way) and is not something this
// change introduces. It is mocked below the same way axios is mocked, so the
// route's actual logic, including the meta_data spread this ticket adds,
// still runs for real.
// ─────────────────────────────────────────────────────────────────────────

const ROUTE_COOKIES = {
  authToken: "Basic dGVzdA==",
  "cart-nonce": "test-nonce",
  userId: "42",
};

vi.mock("axios", () => {
  const post = vi.fn(async (url) => {
    if (String(url).includes("/wp-json/wc/v3/orders")) {
      return {
        data: {
          id: 123,
          order_key: "wc_order_test",
          status: "pending",
          total: "10.00",
          line_items: [],
        },
      };
    }
    return { data: {} };
  });
  const get = vi.fn(async () => ({ data: { items: [], coupons: [] } }));
  return { default: { post, get } };
});

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name) => (name in ROUTE_COOKIES ? { value: ROUTE_COOKIES[name] } : undefined),
  })),
}));

describe("create-pending-order route, meta_data", () => {
  const ORIGINAL_ENV = { ...process.env };

  beforeEach(() => {
    process.env.BASE_URL = "https://wp.example.com";
    process.env.CONSUMER_KEY = "ck_test";
    process.env.CONSUMER_SECRET = "cs_test";
  });

  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
    vi.clearAllMocks();
  });

  it("carries the caller's source attribution and TK-1022's provenance keys on the same order", async () => {
    const { POST } = await import("@/app/api/create-pending-order/route");
    const axios = (await import("axios")).default;

    const body = {
      firstName: "Jane",
      lastName: "Doe",
      addressOne: "123 Main Street",
      addressTwo: "",
      city: "New York",
      state: "NY",
      postcode: "10001",
      country: "US",
      phone: "5555551234",
      email: "jane@example.com",
      totalAmount: 10,
      cartItems: [{ id: 1, quantity: 1, prices: { price: "1000" } }],
      appliedCoupons: [],
      source_attribution: { utm_source: "newsletter", utm_medium: "email" },
    };

    const req = new Request("https://checkout.myrocky.com/api/create-pending-order", {
      method: "POST",
      headers: {
        cookie: "authToken=Basic%20dGVzdA%3D%3D; cart-nonce=test-nonce; userId=42",
        host: "checkout.myrocky.com",
        "x-forwarded-host": HOST,
      },
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    const json = await res.json();
    expect(res.status).toBe(200);

    expect(axios.post).toHaveBeenCalled();
    const orderCall = axios.post.mock.calls.find((call) =>
      String(call[0]).includes("/wp-json/wc/v3/orders")
    );
    expect(orderCall).toBeTruthy();

    const meta = orderCall[1].meta_data;
    const byKey = (key) => meta.find((m) => m.key === key)?.value;

    expect(byKey("_nb_utm_source")).toBe("newsletter");
    expect(meta.some((m) => m.key === "_nb_source_provenance")).toBe(true);

    // TK-1022's provenance keys must still be on the same array, undisplaced.
    expect(meta.some((m) => m.key === "_rocky_customer_ip")).toBe(true);
    expect(meta.some((m) => m.key === "_rocky_customer_user_agent")).toBe(true);
    expect(meta.some((m) => m.key === "_rocky_ip_source")).toBe(true);
    expect(meta.some((m) => m.key === "_rocky_ip_captured_at")).toBe(true);

    // Both provenance timestamps on the order should agree.
    expect(byKey("_nb_source_captured_at")).toBe(byKey("_rocky_ip_captured_at"));

    expect(json.success).toBe(true);
  });
});

describe("generic click id pair, storefronts that keep one id plus a vendor label", () => {
  const meta = (source) =>
    Object.fromEntries(
      buildSourceAttributionMeta({
        source,
        requestHost: "www.myrocky.com",
        capturedAt: "2026-09-02T00:00:00.000Z",
      }).map((e) => [e.key, e.value])
    );

  it("records the pair verbatim under reserved keys", () => {
    const ids = JSON.parse(
      meta({ click_id: "Cj0KCQiA", click_id_type: "Google Ads" })._nb_click_ids
    );
    expect(ids).toEqual({ click_id: "Cj0KCQiA", click_id_type: "Google Ads" });
  });

  it("never fabricates a vendor parameter name from the label", () => {
    // The label is many to one, so gclid cannot be inferred from "Google Ads".
    // Writing one would be inventing a fact, which is the whole point of the
    // reserved keys.
    const ids = JSON.parse(
      meta({ click_id: "Cj0KCQiA", click_id_type: "Google Ads" })._nb_click_ids
    );
    expect(ids.gclid).toBeUndefined();
    expect(ids.gbraid).toBeUndefined();
    expect(ids.wbraid).toBeUndefined();
  });

  it("counts as a client field so provenance is not reported as none", () => {
    expect(
      meta({ click_id: "abc", click_id_type: "TikTok" })._nb_source_provenance
    ).toBe(NB_SOURCE_PROVENANCE.CLIENT_SESSION);
  });

  it("keeps a cookie read vendor id separate from a client sent generic pair", () => {
    // The gclid deliberately arrives via cookies, not via source. An earlier
    // version of this test put it in source, so it would still have passed with
    // the entire server side cookie fallback deleted.
    const entries = Object.fromEntries(
      buildSourceAttributionMeta({
        source: { click_id: "generic", click_id_type: "Google Ads" },
        cookies: { gclid: "real-gclid" },
        requestHost: "www.myrocky.com",
        capturedAt: "2026-09-02T00:00:00.000Z",
      }).map((e) => [e.key, e.value])
    );
    const ids = JSON.parse(entries._nb_click_ids);
    expect(ids.gclid).toBe("real-gclid");
    expect(ids.click_id).toBe("generic");
    // One value from each origin, so provenance must say so.
    expect(entries._nb_source_provenance).toBe(NB_SOURCE_PROVENANCE.MIXED);
  });

  it("omits the label when only a bare id is available", () => {
    const ids = JSON.parse(meta({ click_id: "bare" })._nb_click_ids);
    expect(ids).toEqual({ click_id: "bare" });
  });

  it("ignores an empty or whitespace only id", () => {
    expect(meta({ click_id: "   ", click_id_type: "Google Ads" })._nb_click_ids).toBe("");
    expect(meta({ click_id: "   ", click_id_type: "Google Ads" })._nb_source_provenance).toBe(
      NB_SOURCE_PROVENANCE.NONE
    );
  });
});

describe("cookieSource, the server side cookie recovery channel", () => {
  const build = (args) =>
    Object.fromEntries(
      buildSourceAttributionMeta({
        requestHost: "www.myrocky.com",
        capturedAt: "2026-09-02T00:00:00.000Z",
        ...args,
      }).map((e) => [e.key, e.value])
    );

  it("recovers utm values when the client payload is absent", () => {
    const m = build({ cookieSource: { utm_source: "newsletter", utm_medium: "email" } });
    expect(m._nb_utm_source).toBe("newsletter");
    expect(m._nb_utm_medium).toBe("email");
  });

  it("reports server_cookie provenance, never client_session", () => {
    // This is the point of the separate channel. Passing these as `source`
    // would report that a browser sent them on this request. It did not.
    expect(
      build({ cookieSource: { utm_source: "newsletter" } })._nb_source_provenance
    ).toBe(NB_SOURCE_PROVENANCE.SERVER_COOKIE);
  });

  it("lets the client payload win over the cookie for the same field", () => {
    const m = build({
      source: { utm_source: "from-client" },
      cookieSource: { utm_source: "from-cookie" },
    });
    expect(m._nb_utm_source).toBe("from-client");
    expect(m._nb_source_provenance).toBe(NB_SOURCE_PROVENANCE.CLIENT_SESSION);
  });

  it("recovers a generic click id pair from cookies", () => {
    const m = build({ cookieSource: { click_id: "abc", click_id_type: "TikTok" } });
    expect(JSON.parse(m._nb_click_ids)).toEqual({
      click_id: "abc",
      click_id_type: "TikTok",
    });
    expect(m._nb_source_provenance).toBe(NB_SOURCE_PROVENANCE.SERVER_COOKIE);
  });

  it("still excludes an own domain referrer recovered from a cookie", () => {
    // The exclusion must not depend on which channel the referrer arrived on.
    const m = build({
      cookieSource: {
        referrer: "https://www.myrocky.com/cart",
        referrer_domain: "www.myrocky.com",
      },
    });
    expect(m._nb_referrer).toBe("");
    expect(m._nb_referrer_excluded).toBe("own_domain");
  });
});
