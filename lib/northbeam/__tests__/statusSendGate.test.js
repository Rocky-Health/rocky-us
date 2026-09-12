import { describe, it, expect } from "vitest";

import {
  shouldSendOnStatus,
  orderHasPayment,
  NB_PAID_STATUSES,
} from "@/lib/northbeam/statusSendGate";

/**
 * Acceptance for the on-hold half of TK-1087.
 *
 * The defect: this storefront reported every `on-hold` transition to Northbeam
 * unconditionally. Rocky holds orders at on-hold while they await medical
 * review, so an unpaid on-hold order became a sale in the vendor account before
 * any payment was captured. The WordPress Relay has always refused that case,
 * so the two writers disagreed about what a purchase is while feeding the same
 * account.
 *
 * Every assertion below fails against the pre-change gate
 * (`status === "processing" || "completed" || "on-hold"`), which is what makes
 * this a control and not a restatement.
 */
describe("Northbeam status send gate", () => {
  const paid = { date_paid_gmt: "2026-09-12T10:00:00" };
  const paidBareField = { date_paid: "2026-09-12T06:00:00" };
  const unpaid = { id: 1 };

  it("sends a processing order regardless of the paid date", () => {
    expect(shouldSendOnStatus("processing", unpaid)).toBe(true);
    expect(shouldSendOnStatus("processing", paid)).toBe(true);
  });

  it("sends a completed order regardless of the paid date", () => {
    expect(shouldSendOnStatus("completed", unpaid)).toBe(true);
  });

  it("REFUSES an on-hold order that has not been paid", () => {
    // The medical-review case. This is the assertion the old gate failed.
    expect(shouldSendOnStatus("on-hold", unpaid)).toBe(false);
  });

  it("sends an on-hold order that HAS been paid", () => {
    expect(shouldSendOnStatus("on-hold", paid)).toBe(true);
  });

  it("accepts the bare date_paid field as well as the _gmt form", () => {
    expect(shouldSendOnStatus("on-hold", paidBareField)).toBe(true);
  });

  it("treats an empty paid date as unpaid rather than as present", () => {
    expect(shouldSendOnStatus("on-hold", { date_paid_gmt: "" })).toBe(false);
    expect(shouldSendOnStatus("on-hold", { date_paid_gmt: null })).toBe(false);
  });

  it("refuses every other status, including pending and cancelled", () => {
    for (const s of ["pending", "cancelled", "refunded", "failed", "trash"]) {
      expect(shouldSendOnStatus(s, paid)).toBe(false);
    }
  });

  it("survives a missing or malformed order without throwing", () => {
    expect(shouldSendOnStatus("on-hold", undefined)).toBe(false);
    expect(shouldSendOnStatus("on-hold", null)).toBe(false);
    expect(orderHasPayment(undefined)).toBe(false);
  });

  it("keeps the paid status list to the two the Relay recognises", () => {
    // If this list grows, the WordPress paid_statuses() must grow with it, or
    // the two writers disagree again.
    expect(NB_PAID_STATUSES).toEqual(["processing", "completed"]);
  });
});
