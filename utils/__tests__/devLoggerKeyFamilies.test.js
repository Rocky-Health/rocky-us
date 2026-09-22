/**
 * TK-1046: the key families added to redactSensitive, and the keys that must
 * deliberately stay readable.
 *
 * Every masked case below is a real call site found during the TK-1046
 * inventory, not a hypothetical. The readable cases are load bearing: Northbeam
 * attribution and the CAPI debug logs stop being useful if they are masked.
 */
import { describe, expect, it } from "vitest";

import { redactSensitive } from "@/utils/devLogger";

describe("auth material", () => {
  it("masks token names the exact list never carried", () => {
    const result = redactSensitive({
      access_token: "at_live_abc",
      refresh_token: "rt_live_abc",
      id_token: "eyJhbGciOi",
      jobToken: "job_abc",
      wl_token: "wl_abc",
      session_token: "st_abc",
    });
    expect(Object.values(result)).toEqual(["***", "***", "***", "***", "***", "***"]);
  });

  it("masks session identifiers", () => {
    const result = redactSensitive({ sessionId: "s_1", session_id: "s_2" });
    expect(result.sessionId).toBe("***");
    expect(result.session_id).toBe("***");
  });

  it("masks the entrykey family", () => {
    const result = redactSensitive({
      entrykey: "edq-3056e6",
      therapy_entrykey: "thq-771ab2",
    });
    expect(result.entrykey).toBe("***");
    expect(result.therapy_entrykey).toBe("***");
  });

  it("keeps a boolean flag readable even when its name matches a family", () => {
    // hasToken / hasSession are diagnostics, and a boolean is never PII.
    const result = redactSensitive({ hasToken: true, hasSession: false });
    expect(result.hasToken).toBe(true);
    expect(result.hasSession).toBe(false);
  });
});

describe("address and postal families", () => {
  it("masks the prefixed address variants beside the exact ones", () => {
    // address_1 was masked and billing_address_1 was not, in the same object,
    // in all three CheckoutPageContent forks.
    const result = redactSensitive({
      address_1: "12 King St",
      billing_address_1: "12 King St",
      shipping_address_1: "9 Queen St",
      ipAddress: "203.0.113.7",
    });
    expect(Object.values(result)).toEqual(["***", "***", "***", "***"]);
  });

  it("masks postal code variants", () => {
    const result = redactSensitive({
      postcode: "M5H 2N2",
      billing_postcode: "M5H 2N2",
      postal_code: "M5H 2N2",
      postalCode: "M5H 2N2",
    });
    expect(Object.values(result)).toEqual(["***", "***", "***", "***"]);
  });
});

describe("date of birth family", () => {
  it("masks camelCase and prefixed variants", () => {
    const result = redactSensitive({
      dateOfBirth: "1990-01-01",
      birthDate: "1990-01-01",
      billing_date_of_birth: "1990-01-01",
    });
    expect(JSON.stringify(result)).not.toContain("1990-01-01");
  });
});

describe("name keys", () => {
  it("masks the camelCase and abbreviated name keys", () => {
    const result = redactSensitive({
      firstName: "Jane",
      lastName: "Doe",
      fName: "Jane",
      lName: "Doe",
      userName: "jdoe",
      displayName: "Jane D",
    });
    expect(JSON.stringify(result)).not.toContain("Jane");
    expect(JSON.stringify(result)).not.toContain("Doe");
  });

  it("masks prefixed name variants beside their already-masked twins", () => {
    // An exact list left billing_first_name printing in clear next to a masked
    // first_name in the same CheckoutPageContent log object.
    const result = redactSensitive({
      first_name: "Jane",
      billing_first_name: "Jane",
      shipping_last_name: "Doe",
      billing_firstName: "Jane",
      customer_username: "jdoe",
    });
    expect(JSON.stringify(result)).not.toContain("Jane");
    expect(JSON.stringify(result)).not.toContain("Doe");
    expect(JSON.stringify(result)).not.toContain("jdoe");
  });

  it("does not mask customer_id_namespace, which merely contains 'name'", () => {
    // This is why the name keys are listed exactly instead of as a family.
    expect(redactSensitive({ customer_id_namespace: "email" }).customer_id_namespace).toBe(
      "email",
    );
  });
});

describe("keys that must stay readable", () => {
  it("keeps province, which Northbeam attribution reads", () => {
    expect(redactSensitive({ province: "ON" }).province).toBe("ON");
  });

  it("keeps the hashed CAPI short keys", () => {
    const hashed = "5d41402abc4b2a76b9719d911017c592";
    const result = redactSensitive({ em: hashed, ph: hashed, fn: hashed, ln: hashed });
    expect(Object.values(result)).toEqual([hashed, hashed, hashed, hashed]);
  });

  it("keeps a wc: customer id debuggable", () => {
    expect(redactSensitive({ customer_id: "wc:123" }).customer_id).toBe("wc:123");
  });
});

describe("what a key list still cannot reach", () => {
  it("returns a string untouched, which is why stringify inside a log call leaks", () => {
    // Documents the limit the tools/log-redaction-check.mjs guard exists to
    // cover: no key, no mask.
    expect(redactSensitive(JSON.stringify({ email: "a@b.ca" }))).toBe('{"email":"a@b.ca"}');
  });

  it("does not mask clinical free text under an ordinary key", () => {
    // Call sites carrying clinical data have to be reduced or deleted; there is
    // no key name that makes this safe.
    const result = redactSensitive({ customer_note: "takes metformin" });
    expect(result.customer_note).toBe("takes metformin");
  });
});
