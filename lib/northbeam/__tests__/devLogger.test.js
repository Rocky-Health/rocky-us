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
