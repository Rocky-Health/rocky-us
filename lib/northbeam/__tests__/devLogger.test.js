import { describe, expect, it } from "vitest";

import { redactSensitive } from "@/utils/devLogger";

/**
 * Acceptance for TK-1071.
 *
 * The storefront half of TK-1071: customer_email and customer_phone_number
 * must be blanket redacted like the other raw PII keys, and the canonical
 * Northbeam customer_id (wc:{id}, or a fallback email:{address} /
 * phone:{digits} when WooCommerce has no user id) must be masked
 * prefix-preserving instead, since customer_id is not in SENSITIVE_KEYS and a
 * blunt redact would destroy the wc:123 form that makes these logs
 * debuggable. These assertions fail against the code before this change:
 * customer_email/customer_phone_number were not in SENSITIVE_KEYS at all, and
 * there was no customer_id handling, so both passed through in plain text.
 */

describe("redactSensitive - TK-1071 Northbeam customer id / PII", () => {
  it("redacts customer_email", () => {
    const result = redactSensitive({ customer_email: "someone@example.com" });
    expect(result.customer_email).toBe("***");
  });

  it("redacts customer_phone_number", () => {
    const result = redactSensitive({ customer_phone_number: "15551234567" });
    expect(result.customer_phone_number).toBe("***");
  });

  it("redacts customer_phone", () => {
    const result = redactSensitive({ customer_phone: "15551234567" });
    expect(result.customer_phone).toBe("***");
  });

  it("masks an email-fallback customer_id, keeping the prefix and dropping the address", () => {
    const result = redactSensitive({
      customer_id: "email:someone@example.com",
    });
    expect(result.customer_id).toBe("email:***");
    expect(result.customer_id).not.toContain("someone@example.com");
  });

  it("masks a phone-fallback customer_id, keeping the prefix and dropping the digits", () => {
    const result = redactSensitive({ customer_id: "phone:15551234567" });
    expect(result.customer_id).toBe("phone:***");
    expect(result.customer_id).not.toContain("15551234567");
  });

  it("preserves a wc: customer_id unchanged, since it is an internal identifier and not PII", () => {
    const result = redactSensitive({ customer_id: "wc:123" });
    expect(result.customer_id).toBe("wc:123");
  });

  it("preserves a numeric customer_id unchanged", () => {
    const result = redactSensitive({ customer_id: 4471 });
    expect(result.customer_id).toBe(4471);
  });

  it("falls back to blanket redaction for a customer_id with no colon", () => {
    const result = redactSensitive({ customer_id: "notanamespacedid" });
    expect(result.customer_id).toBe("***");
  });

  it("falls back to blanket redaction for a non-string, non-number customer_id", () => {
    expect(redactSensitive({ customer_id: null }).customer_id).toBe("***");
    expect(redactSensitive({ customer_id: { nested: true } }).customer_id).toBe("***");
  });

  it("does not redact the hashed CAPI short keys, proving the documented exclusion still holds", () => {
    const result = redactSensitive({
      em: "5d41402abc4b2a76b9719d911017c592",
      ph: "d4c9d9027326471b0b8d81723aad6288",
      fn: "3e23e8160039594a33894f6564e1b134",
    });
    expect(result.em).toBe("5d41402abc4b2a76b9719d911017c592");
    expect(result.ph).toBe("d4c9d9027326471b0b8d81723aad6288");
    expect(result.fn).toBe("3e23e8160039594a33894f6564e1b134");
  });

  it("redacts and masks correctly through a nested object", () => {
    const result = redactSensitive({
      order: {
        customer_email: "buyer@example.com",
        customer_id: "email:buyer@example.com",
        customer_id_backup: "wc:987",
      },
    });
    expect(result.order.customer_email).toBe("***");
    expect(result.order.customer_id).toBe("email:***");
    expect(result.order.customer_id_backup).toBe("wc:987");
  });

  it("redacts and masks correctly through an array of payloads", () => {
    const result = redactSensitive([
      { customer_id: "wc:1", customer_phone_number: "15551234567" },
      { customer_id: "phone:15559876543", customer_email: "a@b.com" },
    ]);
    expect(result[0].customer_id).toBe("wc:1");
    expect(result[0].customer_phone_number).toBe("***");
    expect(result[1].customer_id).toBe("phone:***");
    expect(result[1].customer_email).toBe("***");
  });

  it("is case-insensitive on the customer_id key, matching isSensitiveKey's own normalisation", () => {
    const result = redactSensitive({ CUSTOMER_ID: "email:someone@example.com" });
    expect(result.CUSTOMER_ID).toBe("email:***");
  });
});

describe("redactSensitive - TK-1071 canonical customer id key family", () => {
  /**
   * The 2026-09-09 QA failure. The first TK-1071 pass matched the key
   * `customer_id` exactly, so `customer_id_canonical` carried the same value
   * straight through in plain text. It is not a hypothetical key: the purchase
   * path logs an "[Analytics] purchase parity" object that holds BOTH keys with
   * the identical value, so one was masked and one was printed in the same log
   * line. These assertions fail against the code before this change.
   */
  it("masks an email-fallback customer_id_canonical", () => {
    const result = redactSensitive({
      customer_id_canonical: "email:someone@example.com",
    });
    expect(result.customer_id_canonical).toBe("email:***");
    expect(result.customer_id_canonical).not.toContain("someone@example.com");
  });

  it("masks a phone-fallback customer_id_canonical", () => {
    const result = redactSensitive({ customer_id_canonical: "phone:15551234567" });
    expect(result.customer_id_canonical).toBe("phone:***");
    expect(result.customer_id_canonical).not.toContain("15551234567");
  });

  it("preserves a wc: customer_id_canonical, keeping it debuggable", () => {
    const result = redactSensitive({ customer_id_canonical: "wc:123" });
    expect(result.customer_id_canonical).toBe("wc:123");
  });

  it("masks a bare-email customer_id_canonical with no namespace at all", () => {
    // The backfill routes build this field as
    // `canonicalCustomerId || String(order?.customer_id || email || "")`, so a
    // raw address with no "namespace:" prefix can occupy it. No colon means no
    // namespace worth preserving, so it is blanket redacted.
    const result = redactSensitive({ customer_id_canonical: "someone@example.com" });
    expect(result.customer_id_canonical).toBe("***");
  });

  it("masks the whole purchase-parity payload shape, both keys at once", () => {
    const result = redactSensitive({
      order_id: 813077,
      ga4_tiktok_time_of_purchase: "2026-09-09T18:49:11.000Z",
      customer_id: "email:someone@example.com",
      customer_id_canonical: "email:someone@example.com",
    });
    expect(result.order_id).toBe(813077);
    expect(result.customer_id).toBe("email:***");
    expect(result.customer_id_canonical).toBe("email:***");
    expect(JSON.stringify(result)).not.toContain("someone@example.com");
  });

  it("masks an unknown future customer_id variant, which an exact-match list could not", () => {
    const result = redactSensitive({
      customer_id_resolved: "email:someone@example.com",
      customer_id_v2: "phone:15551234567",
    });
    expect(result.customer_id_resolved).toBe("email:***");
    expect(result.customer_id_v2).toBe("phone:***");
  });

  it("leaves customer_id_namespace alone, because it holds a namespace and never a value", () => {
    // Both orders routes log this deliberately so the namespace survives when
    // the raw id does not. It has no colon, so routing it through
    // maskCustomerId would answer "***" and destroy the only diagnostic the
    // key exists to provide.
    expect(redactSensitive({ customer_id_namespace: "email" }).customer_id_namespace).toBe("email");
    expect(redactSensitive({ customer_id_namespace: "none" }).customer_id_namespace).toBe("none");
    expect(redactSensitive({ customer_id_namespace: "wc" }).customer_id_namespace).toBe("wc");
  });

  it("is case-insensitive on the canonical key", () => {
    const result = redactSensitive({ Customer_ID_Canonical: "email:someone@example.com" });
    expect(result.Customer_ID_Canonical).toBe("email:***");
  });

  it("masks the canonical key through nested objects and arrays", () => {
    // Ali asked for nested objects and arrays specifically. redactSensitive
    // already recursed through both; this proves it rather than asserting it.
    const result = redactSensitive({
      batch: [
        { order: { customer_id_canonical: "email:a@example.com" } },
        { order: { customer_id_canonical: "phone:15550001111" } },
      ],
    });
    expect(result.batch[0].order.customer_id_canonical).toBe("email:***");
    expect(result.batch[1].order.customer_id_canonical).toBe("phone:***");
    expect(JSON.stringify(result)).not.toContain("a@example.com");
    expect(JSON.stringify(result)).not.toContain("15550001111");
  });
});
