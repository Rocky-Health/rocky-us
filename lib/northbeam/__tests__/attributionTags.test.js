import { describe, it, expect } from "vitest";

import { buildSourceTagsFromOrder, hasPersistedAttribution } from "@/lib/northbeam/attributionTags";

/**
 * Acceptance for TK-1027 / TK-1026's reader half.
 *
 * The defect this exists for: the reservoir of `_nb_*` meta TK-1026 persisted
 * on checkout went unread by the backfills, so the hourly sync kept replacing
 * an order's marketing source tags with nothing. This is the reader, and the
 * AWIN test below is the specific regression it must not reintroduce: the old
 * backfill mapper pushed `source:AWIN` unconditionally, which could produce
 * two `source:` tags on one order.
 */

function orderWith(entries) {
  return { meta_data: Object.entries(entries).map(([key, value]) => ({ key, value })) };
}

describe("buildSourceTagsFromOrder", () => {
  it("returns an empty array for an order with no persisted attribution", () => {
    expect(buildSourceTagsFromOrder(orderWith({}))).toEqual([]);
    expect(buildSourceTagsFromOrder({})).toEqual([]);
    expect(buildSourceTagsFromOrder(null)).toEqual([]);
  });

  it("rebuilds the tags in the fixed order: source, utm fields, referrer", () => {
    const order = orderWith({
      _nb_source_name: "google",
      _nb_utm_source: "google",
      _nb_utm_medium: "cpc",
      _nb_utm_campaign: "brand",
      _nb_utm_term: "rocky+health",
      _nb_utm_content: "ad1",
      _nb_referrer_domain: "google.com",
    });

    expect(buildSourceTagsFromOrder(order)).toEqual([
      "source:google",
      "utm_source:google",
      "utm_medium:cpc",
      "utm_campaign:brand",
      "utm_term:rocky+health",
      "utm_content:ad1",
      "referrer:google.com",
    ]);
  });

  it("skips a utm field that was never persisted rather than emitting it blank", () => {
    const order = orderWith({ _nb_utm_source: "newsletter" });
    expect(buildSourceTagsFromOrder(order)).toEqual(["utm_source:newsletter"]);
  });

  it("claims source:AWIN only when nothing else has already claimed the source axis", () => {
    const order = orderWith({ _awin_awc: "abc123" });
    const tags = buildSourceTagsFromOrder(order);
    expect(tags).toContain("source:AWIN");
    expect(tags).toContain("awin_awc:abc123");
  });

  it("never produces two source: tags on the same order", () => {
    // This is the regression: the old backfill mapper pushed source:AWIN
    // unconditionally, even when the browser had already recorded a real
    // source. A real _nb_source_name must win and AWIN must yield.
    const order = orderWith({
      _nb_source_name: "google",
      _awin_awc: "abc123",
    });

    const tags = buildSourceTagsFromOrder(order);
    const sourceTags = tags.filter((t) => t.startsWith("source:"));

    expect(sourceTags).toEqual(["source:google"]);
    expect(tags).toContain("awin_awc:abc123");
  });

  it("still records the awin_channel tag independent of which source won", () => {
    const order = orderWith({
      _nb_source_name: "google",
      _awin_channel: "cashback",
    });
    expect(buildSourceTagsFromOrder(order)).toContain("awin_channel:cashback");
  });
});

describe("hasPersistedAttribution", () => {
  it("is false for an order with no _nb_* meta at all", () => {
    expect(hasPersistedAttribution(orderWith({ _stripe_customer_id: "cus_1" }))).toBe(false);
    expect(hasPersistedAttribution(orderWith({}))).toBe(false);
    expect(hasPersistedAttribution({})).toBe(false);
  });

  it("is false when every _nb_* value is empty", () => {
    expect(hasPersistedAttribution(orderWith({ _nb_utm_source: "" }))).toBe(false);
  });

  it("is true when at least one _nb_* value is non-empty", () => {
    expect(hasPersistedAttribution(orderWith({ _nb_utm_source: "google" }))).toBe(true);
  });
});
