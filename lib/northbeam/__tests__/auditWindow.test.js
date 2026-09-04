import { describe, it, expect, afterEach } from "vitest";

import {
  NB_CANONICAL_CUTOVER_ISO,
  NB_AUDIT_INELIGIBLE,
  NB_AUDIT_MODE,
  canonicalCutoverMs,
  orderPaidMs,
  evaluateAuditWindow,
  normalizeAuditMode,
} from "@/lib/northbeam/auditWindow";

/**
 * Acceptance for TK-1030's audit window.
 *
 * The defect this module exists to prevent: an auditor pointed at all of
 * history reports every order the Relay never touched because it never ran
 * yet, which is most of a year of orders and an alert nobody reads by the
 * second day. The window has to start at the canonical writer's own cutover,
 * anchored on the paid instant only, never on creation time.
 *
 * This repository is the UNITED STATES sibling. Its cutover is later than
 * Canada's because the US Relay landed an hour and a half after the US
 * storefront did, so the two constants are deliberately not interchangeable.
 * The last test in this file is the one that catches the Canadian value being
 * copied in by mistake.
 */

const SETTLE_MS = 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

describe("NB_CANONICAL_CUTOVER_ISO: this repo is the United States", () => {
  it("is exactly the US instant, not the Canadian one", () => {
    // If this fails, the Canadian value has been copied in, and the auditor
    // would treat the hour and a half when the US Relay was still on the old
    // payload as canonical.
    expect(NB_CANONICAL_CUTOVER_ISO).toBe("2026-09-04T17:48:02Z");
  });
});

describe("orderPaidMs / evaluateAuditWindow: no_paid_date never falls back to date_created_gmt", () => {
  const GOOD_CREATED = "2026-09-05T10:00:00Z";

  it("reports no_paid_date when date_paid_gmt is absent", () => {
    const order = { date_created_gmt: GOOD_CREATED };
    expect(orderPaidMs(order)).toBeNull();
    const result = evaluateAuditWindow(order);
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe(NB_AUDIT_INELIGIBLE.NO_PAID_DATE);
    expect(result.paidMs).toBeNull();
  });

  it("reports no_paid_date when date_paid_gmt is an empty string", () => {
    const order = { date_paid_gmt: "", date_created_gmt: GOOD_CREATED };
    const result = evaluateAuditWindow(order);
    expect(result.reason).toBe(NB_AUDIT_INELIGIBLE.NO_PAID_DATE);
  });

  it("reports no_paid_date when date_paid_gmt is whitespace only", () => {
    const order = { date_paid_gmt: "   ", date_created_gmt: GOOD_CREATED };
    const result = evaluateAuditWindow(order);
    expect(result.reason).toBe(NB_AUDIT_INELIGIBLE.NO_PAID_DATE);
  });

  it("reports no_paid_date when date_paid_gmt is unparseable", () => {
    const order = { date_paid_gmt: "not-a-real-date", date_created_gmt: GOOD_CREATED };
    const result = evaluateAuditWindow(order);
    expect(result.reason).toBe(NB_AUDIT_INELIGIBLE.NO_PAID_DATE);
  });
});

describe("evaluateAuditWindow: the cutover boundary is inclusive", () => {
  const CUTOVER_MS = Date.parse("2026-09-01T00:00:00Z");
  const NOW_MS = Date.parse("2026-09-10T00:00:00Z");

  it("is pre_cutover one millisecond before the cutover", () => {
    const order = { date_paid_gmt: new Date(CUTOVER_MS - 1).toISOString() };
    const result = evaluateAuditWindow(order, { cutoverMs: CUTOVER_MS, nowMs: NOW_MS, settleMs: SETTLE_MS });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe(NB_AUDIT_INELIGIBLE.PRE_CUTOVER);
  });

  it("is eligible exactly at the cutover instant", () => {
    const order = { date_paid_gmt: new Date(CUTOVER_MS).toISOString() };
    const result = evaluateAuditWindow(order, { cutoverMs: CUTOVER_MS, nowMs: NOW_MS, settleMs: SETTLE_MS });
    expect(result.eligible).toBe(true);
    expect(result.reason).toBe("");
  });
});

describe("evaluateAuditWindow: the settle window", () => {
  const CUTOVER_MS = Date.parse("2026-09-01T00:00:00Z");
  const NOW_MS = Date.parse("2026-09-10T00:00:00Z");

  it("is not_settled inside the settle window", () => {
    const order = { date_paid_gmt: new Date(NOW_MS - 1000 * 60 * 60).toISOString() }; // paid 1h ago
    const result = evaluateAuditWindow(order, { cutoverMs: CUTOVER_MS, nowMs: NOW_MS, settleMs: SETTLE_MS });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe(NB_AUDIT_INELIGIBLE.NOT_SETTLED);
  });

  it("is eligible just outside the settle window", () => {
    const order = { date_paid_gmt: new Date(NOW_MS - SETTLE_MS - 1000).toISOString() };
    const result = evaluateAuditWindow(order, { cutoverMs: CUTOVER_MS, nowMs: NOW_MS, settleMs: SETTLE_MS });
    expect(result.eligible).toBe(true);
    expect(result.reason).toBe("");
  });
});

describe("evaluateAuditWindow: the 365 day lookback", () => {
  it("reports beyond_lookback for an order paid over 365 days ago", () => {
    // The cutover is pushed far into the past on purpose. If it sat at its
    // real 2026 instant, an order this old would already fail pre_cutover,
    // and the assertion below would prove nothing about the lookback check.
    const cutoverMs = Date.parse("2000-01-01T00:00:00Z");
    const nowMs = Date.parse("2026-09-10T00:00:00Z");
    const paidMs = nowMs - 400 * DAY_MS;
    const order = { date_paid_gmt: new Date(paidMs).toISOString() };

    const result = evaluateAuditWindow(order, { cutoverMs, nowMs, settleMs: SETTLE_MS });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe(NB_AUDIT_INELIGIBLE.BEYOND_LOOKBACK);
  });
});

describe("orderPaidMs: a bare Woo _gmt string with no zone parses as UTC", () => {
  it("treats the unmarked string as UTC, not the runtime's local zone", () => {
    const order = { date_paid_gmt: "2026-09-05T10:00:00" };
    expect(orderPaidMs(order)).toBe(Date.parse("2026-09-05T10:00:00Z"));
  });
});

describe("normalizeAuditMode", () => {
  it("recognises repair regardless of case or surrounding whitespace", () => {
    expect(normalizeAuditMode("repair")).toBe(NB_AUDIT_MODE.REPAIR);
    expect(normalizeAuditMode("REPAIR")).toBe(NB_AUDIT_MODE.REPAIR);
    expect(normalizeAuditMode(" repair ")).toBe(NB_AUDIT_MODE.REPAIR);
  });

  it("defaults everything else to audit, including a typo, so a typo can never turn writing back on", () => {
    expect(normalizeAuditMode(undefined)).toBe(NB_AUDIT_MODE.AUDIT);
    expect(normalizeAuditMode("")).toBe(NB_AUDIT_MODE.AUDIT);
    expect(normalizeAuditMode("audit")).toBe(NB_AUDIT_MODE.AUDIT);
    expect(normalizeAuditMode("repari")).toBe(NB_AUDIT_MODE.AUDIT);
    expect(normalizeAuditMode("push")).toBe(NB_AUDIT_MODE.AUDIT);
  });
});

describe("canonicalCutoverMs: a garbage override falls back to the measured constant", () => {
  const ENV_KEY = "NORTHBEAM_CANONICAL_CUTOVER";
  const original = process.env[ENV_KEY];

  afterEach(() => {
    if (original === undefined) {
      delete process.env[ENV_KEY];
    } else {
      process.env[ENV_KEY] = original;
    }
  });

  it("never falls back to zero or NaN, and matches the measured constant on garbage input", () => {
    process.env[ENV_KEY] = "not-a-real-date";
    const ms = canonicalCutoverMs();
    expect(Number.isFinite(ms)).toBe(true);
    expect(ms).not.toBe(0);
    expect(Number.isNaN(ms)).toBe(false);
    expect(ms).toBe(Date.parse(NB_CANONICAL_CUTOVER_ISO));
  });
});
