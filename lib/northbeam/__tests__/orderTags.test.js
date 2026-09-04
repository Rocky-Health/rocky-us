import { describe, it, expect } from "vitest";

import {
  statusTag,
  customerLifecycleAxis,
  orderOriginAxis,
  purchaseModeAxis,
  buildCanonicalOrderTags,
  NB_AXIS,
  NB_AXIS_META,
} from "@/lib/northbeam/orderTags";

/**
 * Acceptance for TK-1027.
 *
 * The defect these assertions exist for: every previous status mapper
 * defaulted unmapped or missing values to "Pending", which let an order carry
 * two status tags at once (order 804624 holds both "Pending" and "On Hold"
 * live), and every previous lifecycle mapper derived the axis from fields the
 * server side never writes or from a product name heuristic, so the same
 * order read differently depending on which writer touched it last.
 */

function meta(entries) {
  return { meta_data: Object.entries(entries).map(([key, value]) => ({ key, value })) };
}

describe("statusTag", () => {
  it("never returns Pending for pending, missing, or an unknown status", () => {
    expect(statusTag("pending")).toBe("");
    expect(statusTag("")).toBe("");
    expect(statusTag(undefined)).toBe("");
    expect(statusTag(null)).toBe("");
    expect(statusTag("some-future-status")).toBe("");
  });

  it("maps every known status, case and whitespace insensitively", () => {
    expect(statusTag("Processing")).toBe("Processing");
    expect(statusTag(" completed ")).toBe("Completed");
    expect(statusTag("ON-HOLD")).toBe("On Hold");
    expect(statusTag("cancelled")).toBe("Cancelled");
    expect(statusTag("refunded")).toBe("Refunded");
    expect(statusTag("failed")).toBe("Failed");
    expect(statusTag("trash")).toBe("Trashed");
    expect(statusTag("trashed")).toBe("Trashed");
    expect(statusTag("expired")).toBe("Expired");
  });
});

describe("customerLifecycleAxis", () => {
  it("reads only the pinned value", () => {
    expect(
      customerLifecycleAxis(meta({ [NB_AXIS_META.LIFECYCLE]: NB_AXIS.LIFECYCLE_FIRST }))
    ).toBe(NB_AXIS.LIFECYCLE_FIRST);
    expect(
      customerLifecycleAxis(meta({ [NB_AXIS_META.LIFECYCLE]: NB_AXIS.LIFECYCLE_RETURNING }))
    ).toBe(NB_AXIS.LIFECYCLE_RETURNING);
  });

  it("returns empty for a garbage, missing, or absent order", () => {
    expect(customerLifecycleAxis(meta({ [NB_AXIS_META.LIFECYCLE]: "something else" }))).toBe("");
    expect(customerLifecycleAxis(meta({}))).toBe("");
    expect(customerLifecycleAxis(null)).toBe("");
    expect(customerLifecycleAxis(undefined)).toBe("");
  });

  it("never derives from order.is_first_order, which no writer sets", () => {
    // The legacy mapper read this field. Nothing has ever written it, so a
    // regression back to reading it would silently return "" again here, not
    // "First Order" -- this pins the actual, current contract: pinned meta only.
    expect(customerLifecycleAxis({ is_first_order: true, meta_data: [] })).toBe("");
  });
});

describe("orderOriginAxis", () => {
  it("reads the pinned value first", () => {
    expect(orderOriginAxis(meta({ [NB_AXIS_META.ORIGIN]: NB_AXIS.ORIGIN_NEW }))).toBe(
      NB_AXIS.ORIGIN_NEW
    );
    expect(orderOriginAxis(meta({ [NB_AXIS_META.ORIGIN]: NB_AXIS.ORIGIN_RENEWAL }))).toBe(
      NB_AXIS.ORIGIN_RENEWAL
    );
  });

  it("falls back to the renewal meta markers when nothing is pinned", () => {
    expect(orderOriginAxis(meta({ _subscription_renewal: "123" }))).toBe(NB_AXIS.ORIGIN_RENEWAL);
    expect(orderOriginAxis(meta({ _subscription_resubscribe: "123" }))).toBe(
      NB_AXIS.ORIGIN_RENEWAL
    );
    expect(orderOriginAxis(meta({ _subscription_switch: "123" }))).toBe(NB_AXIS.ORIGIN_RENEWAL);
  });

  it("prefers the pinned value over a renewal marker that disagrees with it", () => {
    expect(
      orderOriginAxis(
        meta({
          [NB_AXIS_META.ORIGIN]: NB_AXIS.ORIGIN_NEW,
          _subscription_renewal: "123",
        })
      )
    ).toBe(NB_AXIS.ORIGIN_NEW);
  });

  it("returns empty with neither a pinned value nor a renewal marker", () => {
    expect(orderOriginAxis(meta({}))).toBe("");
    expect(orderOriginAxis(null)).toBe("");
  });
});

describe("purchaseModeAxis", () => {
  it("reads only the pinned value", () => {
    expect(purchaseModeAxis(meta({ [NB_AXIS_META.MODE]: NB_AXIS.MODE_SUBSCRIPTION }))).toBe(
      NB_AXIS.MODE_SUBSCRIPTION
    );
    expect(purchaseModeAxis(meta({ [NB_AXIS_META.MODE]: NB_AXIS.MODE_OTP }))).toBe(
      NB_AXIS.MODE_OTP
    );
  });

  it("has no name heuristic: a product named Subscription proves nothing here", () => {
    // This is the whole point of the axis. The WooCommerce REST order carries
    // no product type and no subscription linkage, so matching /subscription/i
    // against a product name is exactly the trap the old writers fell into.
    expect(
      purchaseModeAxis({
        meta_data: [],
        line_items: [{ name: "Monthly Subscription Plan" }],
      })
    ).toBe("");
  });

  it("returns empty for a garbage or absent pinned value", () => {
    expect(purchaseModeAxis(meta({ [NB_AXIS_META.MODE]: "Subscription Recurring" }))).toBe("");
    expect(purchaseModeAxis(meta({}))).toBe("");
    expect(purchaseModeAxis(null)).toBe("");
  });
});

describe("buildCanonicalOrderTags", () => {
  it("orders status, lifecycle, origin, mode, categories, then source", () => {
    const order = meta({
      [NB_AXIS_META.LIFECYCLE]: NB_AXIS.LIFECYCLE_FIRST,
      [NB_AXIS_META.ORIGIN]: NB_AXIS.ORIGIN_NEW,
      [NB_AXIS_META.MODE]: NB_AXIS.MODE_SUBSCRIPTION,
    });

    const tags = buildCanonicalOrderTags({
      status: "processing",
      order,
      categoryTags: ["item-category-1:ED"],
      sourceTags: ["source:google"],
    });

    expect(tags).toEqual([
      "Processing",
      NB_AXIS.LIFECYCLE_FIRST,
      NB_AXIS.ORIGIN_NEW,
      NB_AXIS.MODE_SUBSCRIPTION,
      "item-category-1:ED",
      "source:google",
    ]);
  });

  it("drops empty entries rather than emitting a blank tag", () => {
    const tags = buildCanonicalOrderTags({ status: "pending", order: null });
    expect(tags).toEqual([]);
  });

  it("dedupes while preserving first-seen position", () => {
    const tags = buildCanonicalOrderTags({
      status: "completed",
      order: null,
      sourceTags: ["source:google"],
      extraTags: ["Completed", "source:google", "extra-one"],
    });

    expect(tags).toEqual(["Completed", "source:google", "extra-one"]);
  });

  it("never emits the retired overloaded lifecycle value alongside the axes", () => {
    const order = meta({
      [NB_AXIS_META.LIFECYCLE]: NB_AXIS.LIFECYCLE_RETURNING,
      [NB_AXIS_META.ORIGIN]: NB_AXIS.ORIGIN_RENEWAL,
      [NB_AXIS_META.MODE]: NB_AXIS.MODE_SUBSCRIPTION,
    });

    const tags = buildCanonicalOrderTags({ status: "processing", order });

    expect(tags).not.toContain("Subscription First Order");
    expect(tags).not.toContain("Subscription Recurring");
    expect(tags).not.toContain("OTC");
  });
});
