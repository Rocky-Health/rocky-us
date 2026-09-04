import { describe, it, expect } from "vitest";

import {
  classifySyncResponse,
  syncOutcomeMeta,
  NB_SYNC_OUTCOME,
  NB_SYNC_META,
} from "@/lib/northbeam/syncOutcome";

/**
 * Acceptance for TK-1027's backfill fix.
 *
 * The defect this whole module exists to close: /api/northbeam/orders answers
 * HTTP 200 with { success: true, skipped: true, reason } for a deliberate
 * refusal, and the pre-fix backfill routes read res.ok alone and wrote the
 * delivery marker on it. That sealed 21 paid Canadian orders out of the
 * vendor permanently, because checkIfAlreadySynced then read the same marker
 * and skipped them on every later run.
 */

describe("classifySyncResponse: a 200 with skipped:true is REFUSED, not ACCEPTED", () => {
  it("classifies the skip body as refused, carrying the reason", () => {
    const classified = classifySyncResponse({
      ok: true,
      status: 200,
      body: { success: true, skipped: true, reason: "internal_coupon" },
    });

    expect(classified.outcome).toBe(NB_SYNC_OUTCOME.REFUSED);
    expect(classified.outcome).not.toBe(NB_SYNC_OUTCOME.ACCEPTED);
    expect(classified.reason).toBe("internal_coupon");
  });

  it("defaults the reason to 'skipped' when the body omits one", () => {
    const classified = classifySyncResponse({
      ok: true,
      status: 200,
      body: { success: true, skipped: true },
    });
    expect(classified.outcome).toBe(NB_SYNC_OUTCOME.REFUSED);
    expect(classified.reason).toBe("skipped");
  });
});

describe("classifySyncResponse: a 200 with success:true is ACCEPTED", () => {
  it("classifies a genuine delivery as accepted", () => {
    const classified = classifySyncResponse({
      ok: true,
      status: 200,
      body: { success: true, order_id: "12345" },
    });
    expect(classified.outcome).toBe(NB_SYNC_OUTCOME.ACCEPTED);
    expect(classified.reason).toBe("");
  });
});

describe("classifySyncResponse: !ok is FAILED", () => {
  it("classifies a non-2xx response as failed, carrying the http status", () => {
    const classified = classifySyncResponse({ ok: false, status: 500, body: null });
    expect(classified.outcome).toBe(NB_SYNC_OUTCOME.FAILED);
    expect(classified.reason).toBe("http_500");
  });

  it("falls back to a generic reason when status is missing", () => {
    const classified = classifySyncResponse({ ok: false, body: null });
    expect(classified.outcome).toBe(NB_SYNC_OUTCOME.FAILED);
    expect(classified.reason).toBe("http_error");
  });
});

describe("classifySyncResponse: an unparseable body on a 200 is FAILED, not ACCEPTED", () => {
  it("treats a null body as failed rather than assuming delivery", () => {
    const classified = classifySyncResponse({ ok: true, status: 200, body: null });
    expect(classified.outcome).toBe(NB_SYNC_OUTCOME.FAILED);
    expect(classified.reason).toBe("unreadable_response_body");
  });

  it("treats a non-object body as failed", () => {
    const classified = classifySyncResponse({ ok: true, status: 200, body: "not json" });
    expect(classified.outcome).toBe(NB_SYNC_OUTCOME.FAILED);
  });

  it("treats a 200 with neither success nor skipped as failed", () => {
    const classified = classifySyncResponse({ ok: true, status: 200, body: {} });
    expect(classified.outcome).toBe(NB_SYNC_OUTCOME.FAILED);
    expect(classified.reason).toBe("no_success_flag");
  });
});

describe("syncOutcomeMeta", () => {
  const TIMESTAMP = "2026-09-04T00:00:00.000Z";

  it("returns null for FAILED, writing no state beyond what the caller already tracks", () => {
    const classified = { outcome: NB_SYNC_OUTCOME.FAILED, reason: "http_500" };
    expect(syncOutcomeMeta(classified, TIMESTAMP)).toBeNull();
  });

  it("never writes the delivery key for REFUSED", () => {
    const classified = { outcome: NB_SYNC_OUTCOME.REFUSED, reason: "zero_value_order" };
    const meta = syncOutcomeMeta(classified, TIMESTAMP);
    const keys = meta.map((m) => m.key);

    expect(keys).not.toContain(NB_SYNC_META.DELIVERED);
    expect(keys).not.toContain(NB_SYNC_META.DELIVERED_AT);
    expect(keys).toContain(NB_SYNC_META.REFUSED);
    expect(keys).toContain(NB_SYNC_META.REFUSED_REASON);
  });

  it("writes the delivery key for ACCEPTED, and nothing under the refusal keys", () => {
    const classified = { outcome: NB_SYNC_OUTCOME.ACCEPTED, reason: "" };
    const meta = syncOutcomeMeta(classified, TIMESTAMP);
    const keys = meta.map((m) => m.key);

    expect(keys).toContain(NB_SYNC_META.DELIVERED);
    const delivered = meta.find((m) => m.key === NB_SYNC_META.DELIVERED);
    expect(delivered.value).toBe("yes");
    expect(keys).not.toContain(NB_SYNC_META.REFUSED);
  });

  it("records the refusal reason verbatim so different reasons stay distinguishable", () => {
    const classified = { outcome: NB_SYNC_OUTCOME.REFUSED, reason: "follow-up consultation" };
    const meta = syncOutcomeMeta(classified, TIMESTAMP);
    const reasonEntry = meta.find((m) => m.key === NB_SYNC_META.REFUSED_REASON);
    expect(reasonEntry.value).toBe("follow-up consultation");
  });
});
