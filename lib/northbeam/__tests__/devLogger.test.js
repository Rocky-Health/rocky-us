import { describe, expect, it, vi } from "vitest";

import { logger, redactSensitive } from "@/utils/devLogger";

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

/**
 * Acceptance for the third TK-1071 pass.
 *
 * Ali's QA fail of 2026-09-11: full phone numbers still reached production
 * logs in both regions through `phone_number` on POST
 * /api/update-customer-profile. The key set carried `phone`, `customer_phone`
 * and `customer_phone_number` but not `phone_number`, and isSensitiveKey only
 * widened for `password` and `secret`, so the raw value printed.
 *
 * Adding that one name would have repeated the pattern that failed the first
 * two passes. These assert the family instead.
 */
describe("redactSensitive - TK-1071 phone/email key family", () => {
  it("redacts phone_number, the exact key from the QA fail", () => {
    const result = redactSensitive({ phone_number: "14165551234" });
    expect(result.phone_number).toBe("***");
  });

  it("redacts the real profile log shape from update-customer-profile", () => {
    // The shape at app/api/update-customer-profile/route.js: date_of_birth was
    // masked and phone_number printed in full on the same line, which is what
    // proved this a missed key rather than a deliberate exemption.
    const result = redactSensitive({
      date_of_birth: "1990-01-01",
      phone_number: "14165551234",
      province: "ON",
    });
    expect(result.phone_number).toBe("***");
    expect(result.date_of_birth).toBe("***");
    expect(result.province).toBe("ON");
    expect(JSON.stringify(result)).not.toContain("14165551234");
  });

  it("redacts phone variants an exact-match list would miss", () => {
    const result = redactSensitive({
      phoneNumber: "14165551234",
      billing_phone: "14165551234",
      telephone: "14165551234",
      shipping_phone_number: "14165551234",
    });
    expect(result.phoneNumber).toBe("***");
    expect(result.billing_phone).toBe("***");
    expect(result.telephone).toBe("***");
    expect(result.shipping_phone_number).toBe("***");
    expect(JSON.stringify(result)).not.toContain("14165551234");
  });

  it("redacts email variants an exact-match list would miss", () => {
    const result = redactSensitive({
      user_email: "someone@example.com",
      emailAddress: "someone@example.com",
      billing_email: "someone@example.com",
    });
    expect(result.user_email).toBe("***");
    expect(result.emailAddress).toBe("***");
    expect(result.billing_email).toBe("***");
    expect(JSON.stringify(result)).not.toContain("someone@example.com");
  });

  it("redacts the family through nested objects and arrays", () => {
    const result = redactSensitive({
      customers: [
        { profile: { phone_number: "14165551234" } },
        { profile: { user_email: "someone@example.com" } },
      ],
    });
    expect(result.customers[0].profile.phone_number).toBe("***");
    expect(result.customers[1].profile.user_email).toBe("***");
    expect(JSON.stringify(result)).not.toContain("14165551234");
    expect(JSON.stringify(result)).not.toContain("someone@example.com");
  });

  it("keeps boolean flags readable, since a boolean is never PII", () => {
    const result = redactSensitive({
      email_exists: true,
      phone_verified: false,
      phone_number: "14165551234",
    });
    expect(result.email_exists).toBe(true);
    expect(result.phone_verified).toBe(false);
    expect(result.phone_number).toBe("***");
  });

  it("leaves the hashed CAPI short keys and the namespace diagnostic alone", () => {
    // The family match must not reach either. Both are deliberate readable
    // diagnostics and neither contains a phone or email substring.
    const result = redactSensitive({
      ph: "hashedphonevalue",
      em: "hashedemailvalue",
      customer_id_namespace: "email",
    });
    expect(result.ph).toBe("hashedphonevalue");
    expect(result.em).toBe("hashedemailvalue");
    expect(result.customer_id_namespace).toBe("email");
  });
});

/**
 * Acceptance for Ali's QA fail on the previews, CA 6f9f07e / US 765da5b.
 *
 * WooCommerce meta_data is an array of { key, value } pairs, so the field name
 * lives in the VALUE of `key` and the secret lives in `value`. The generic walk
 * reads that backwards: the literal property `key` is itself in SENSITIVE_KEYS
 * as a credential name, so it masked the harmless field name and printed the
 * phone number beside it, producing { key: "***", value: "+15550100103" }.
 *
 * Worse than a miss: it destroyed the only diagnostic and kept the PII.
 */
describe("redactSensitive - WooCommerce meta_data { key, value } entries", () => {
  const metaDataUpdates = [
    { key: "date_of_birth", value: "1990-01-01" },
    { key: "phone_number", value: "+15550100103" },
    { key: "province", value: "ON" },
  ];

  it("masks the value and keeps the field name, the exact inversion from the fail", () => {
    const [dob, phone, province] = redactSensitive(metaDataUpdates);
    expect(phone).toEqual({ key: "phone_number", value: "***" });
    expect(dob).toEqual({ key: "date_of_birth", value: "***" });
    expect(province).toEqual({ key: "province", value: "ON" });
  });

  it("leaves neither value anywhere in the metadata array log", () => {
    const serialized = JSON.stringify(redactSensitive(metaDataUpdates));
    expect(serialized).not.toContain("+15550100103");
    expect(serialized).not.toContain("1990-01-01");
  });

  it("masks meta_data nested inside the full updatePayload", () => {
    // The "Full WooCommerce update payload:" log shape.
    const updatePayload = {
      first_name: "Jane",
      billing: { phone: "+15550100103", email: "jane@example.com" },
      meta_data: metaDataUpdates,
    };
    const serialized = JSON.stringify(redactSensitive(updatePayload));
    expect(serialized).not.toContain("+15550100103");
    expect(serialized).not.toContain("1990-01-01");
    expect(serialized).not.toContain("jane@example.com");
    // The field names stay readable, since they are schema and not PII.
    expect(serialized).toContain("phone_number");
    expect(serialized).toContain("date_of_birth");
  });

  it("masks the response metadata shape WooCommerce returns", () => {
    // Woo echoes meta_data back with an id on each entry.
    const responseMeta = [
      { id: 1, key: "phone_number", value: "+15550100103" },
      { id: 2, key: "date_of_birth", value: "1990-01-01" },
    ];
    const result = redactSensitive(responseMeta);
    expect(result[0]).toEqual({ id: 1, key: "phone_number", value: "***" });
    expect(result[1]).toEqual({ id: 2, key: "date_of_birth", value: "***" });
  });

  it("masks a canonical customer id in a meta entry prefix-preserving", () => {
    const result = redactSensitive([
      { key: "customer_id_canonical", value: "email:jane@example.com" },
      { key: "customer_id_canonical", value: "wc:123" },
    ]);
    expect(result[0].value).toBe("email:***");
    expect(result[1].value).toBe("wc:123");
  });

  it("leaves a non-sensitive meta entry completely alone", () => {
    const result = redactSensitive([{ key: "order_source", value: "web" }]);
    expect(result).toEqual([{ key: "order_source", value: "web" }]);
  });

  it("does not mistake an ordinary object that merely has a key property", () => {
    // { key, value } is only a meta entry when both are present. A lone `key`
    // stays a credential name and keeps its blanket redaction.
    const result = redactSensitive({ key: "sk_live_abc123", label: "stripe" });
    expect(result.key).toBe("***");
    expect(result.label).toBe("stripe");
  });

  it("does not mutate the array it was given", () => {
    // Redaction is log-only. The outgoing WooCommerce payload must be intact.
    const original = [{ key: "phone_number", value: "+15550100103" }];
    redactSensitive(original);
    expect(original[0].value).toBe("+15550100103");
    expect(original[0].key).toBe("phone_number");
  });
});

/**
 * End-to-end on the emitted output, which is what Ali actually reads.
 *
 * The assertions above test redactSensitive directly. This drives the real
 * `logger` through console and asserts on what lands in the log, mirroring the
 * four calls the profile route makes in order. It is the difference between
 * "the redactor is correct" and "nothing leaks from this route".
 */
describe("logger emit - profile route log path end to end", () => {
  const PHONE = "+15550100103";
  const DOB = "1990-01-01";
  const EMAIL = "jane@example.com";

  it("emits no raw phone, DOB or email across the route's four log calls", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const requestData = {
        phone_number: PHONE,
        date_of_birth: DOB,
        email: EMAIL,
        first_name: "Jane",
      };
      const metaDataUpdates = [
        { key: "date_of_birth", value: DOB },
        { key: "phone_number", value: PHONE },
        { key: "province", value: "ON" },
      ];
      const updatePayload = {
        first_name: "Jane",
        email: EMAIL,
        meta_data: metaDataUpdates,
      };

      // The route's calls, in order.
      logger.log(
        "Update customer profile request data:",
        JSON.stringify(redactSensitive(requestData), null, 2)
      );
      logger.log("Meta data to update via WooCommerce API:", metaDataUpdates);
      logger.log(
        "Full WooCommerce update payload:",
        JSON.stringify(redactSensitive(updatePayload), null, 2)
      );
      logger.log("=== METADATA UPDATED IN WOOCOMMERCE ===", {
        date_of_birth: DOB,
        phone_number: PHONE,
        province: "ON",
      });

      const emitted = spy.mock.calls
        .map((args) => args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" "))
        .join("\n");

      expect(emitted).not.toContain(PHONE);
      expect(emitted).not.toContain(DOB);
      expect(emitted).not.toContain(EMAIL);
      // The diagnostics that make these logs worth keeping survive.
      expect(emitted).toContain("phone_number");
      expect(emitted).toContain("province");
      expect(emitted).toContain("ON");
    } finally {
      spy.mockRestore();
    }
  });

  it("leaves the outgoing WooCommerce payload unmutated by logging", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    try {
      const metaDataUpdates = [
        { key: "phone_number", value: PHONE },
        { key: "date_of_birth", value: DOB },
      ];
      const updatePayload = { email: EMAIL, meta_data: metaDataUpdates };

      logger.log("Meta data to update via WooCommerce API:", metaDataUpdates);
      logger.log("Full WooCommerce update payload:", JSON.stringify(redactSensitive(updatePayload), null, 2));

      // Redaction is log-only. What goes to WooCommerce must be untouched.
      expect(updatePayload.email).toBe(EMAIL);
      expect(updatePayload.meta_data[0]).toEqual({ key: "phone_number", value: PHONE });
      expect(updatePayload.meta_data[1]).toEqual({ key: "date_of_birth", value: DOB });
    } finally {
      spy.mockRestore();
    }
  });
});
