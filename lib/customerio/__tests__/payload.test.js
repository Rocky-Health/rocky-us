/**
 * Payload construction. The allowlist is the privacy control for this integration, so the
 * tests here are written to fail whenever a new field starts reaching Customer.io, whether
 * that field is clinical or merely unplanned.
 */

import { describe, expect, it } from "vitest";

import {
  buildEventProperties,
  buildIdentifyTraits,
  buildIdentityKeys,
  buildPipelinesBody,
  createMessageId,
  isAllowedCustomerioEvent,
  normalizeWooCustomerId,
  toCustomerioProducts,
} from "@/lib/customerio/payload";

/**
 * A cart line as it might actually arrive: the GA4-shaped fields the storefront sets, plus a
 * pile of things that must never be forwarded to a marketing platform.
 */
const itemWithForbiddenFields = () => ({
  item_id: "8821",
  item_variant: "8822",
  item_sku: "ED-SIL-50-12",
  item_name: "Sildenafil 50mg",
  item_category: "ED",
  quantity: 2,
  price: 89.99,
  // None of the following may ever leave this repo.
  item_category2: "Prescription",
  item_category3: "Erectile Dysfunction",
  questionnaire_answers: { q1: "yes", q2: "no" },
  symptoms: ["low libido"],
  diagnosis: "ED",
  prescription: "Sildenafil 50mg, 12 tablets",
  medical_history: "hypertension",
  clinician_notes: "cleared by Dr. Example",
  patient_dob: "1985-04-02",
  health_card_number: "1234-567-890",
  internal_notes: "do not send",
  affiliation: "Rocky",
});

const FORBIDDEN_PRODUCT_KEYS = [
  "item_category2",
  "item_category3",
  "questionnaire_answers",
  "symptoms",
  "diagnosis",
  "prescription",
  "medical_history",
  "clinician_notes",
  "patient_dob",
  "health_card_number",
  "internal_notes",
  "affiliation",
  "item_id",
  "item_name",
  "item_sku",
  "item_variant",
  "item_category",
];

describe("the Woo customer ID that becomes the Customer.io userId", () => {
  it("gives the same bare string for a number and for its string form", () => {
    expect(normalizeWooCustomerId(12345)).toBe("12345");
    expect(normalizeWooCustomerId("12345")).toBe("12345");
  });

  it("tolerates surrounding whitespace on a string ID", () => {
    expect(normalizeWooCustomerId("  12345  ")).toBe("12345");
  });

  const rejected = [
    ["a guest order reported as zero", 0],
    ['a guest order reported as "0"', "0"],
    ["a negative ID", -1],
    ["an empty string", ""],
    ["null", null],
    ["undefined", undefined],
    ["a non-numeric string", "abc"],
    ["a fractional number", 1.5],
    ["NaN", NaN],
  ];

  it.each(rejected)("reports no customer for %s", (_label, value) => {
    expect(normalizeWooCustomerId(value)).toBeNull();
  });
});

describe("mapping cart lines to the Customer.io product schema", () => {
  it("forwards exactly the allowlisted product fields and nothing else", () => {
    const products = toCustomerioProducts({ items: [itemWithForbiddenFields()] });

    expect(products).toHaveLength(1);
    expect(Object.keys(products[0]).sort()).toEqual([
      "category",
      "currency",
      "name",
      "price",
      "product_id",
      "quantity",
      "sku",
      "variation_id",
    ]);
    expect(products[0]).toEqual({
      product_id: "8821",
      variation_id: "8822",
      sku: "ED-SIL-50-12",
      name: "Sildenafil 50mg",
      category: "ED",
      quantity: 2,
      price: 89.99,
      currency: "USD",
    });
  });

  it("drops every clinical and unplanned field on the way through", () => {
    const [product] = toCustomerioProducts({ items: [itemWithForbiddenFields()] });
    const serialized = JSON.stringify(product);

    FORBIDDEN_PRODUCT_KEYS.forEach((key) => {
      expect(product, `product must not carry ${key}`).not.toHaveProperty(key);
    });
    expect(serialized).not.toContain("questionnaire");
    expect(serialized).not.toContain("clinician");
    expect(serialized).not.toContain("1985-04-02");
    expect(serialized).not.toContain("1234-567-890");
  });

  it("drops a line that has no product ID rather than sending an orphan row", () => {
    const products = toCustomerioProducts({
      items: [
        { item_name: "Nameless line", quantity: 1 },
        { item_id: "", item_name: "Blank ID" },
        { item_id: "  ", item_name: "Whitespace ID" },
        { item_id: "8821", item_name: "Real line" },
      ],
    });

    expect(products).toHaveLength(1);
    expect(products[0].product_id).toBe("8821");
  });

  it("accepts the plain id and name field spellings as well as the GA4 ones", () => {
    const [product] = toCustomerioProducts({
      items: [{ id: 4410, name: "Minoxidil Foam", variant_id: 4411, sku: "HAIR-MIN-5" }],
    });

    expect(product.product_id).toBe("4410");
    expect(product.name).toBe("Minoxidil Foam");
    expect(product.variation_id).toBe("4411");
    expect(product.sku).toBe("HAIR-MIN-5");
  });

  it("omits the variation when it merely repeats the product ID", () => {
    const [product] = toCustomerioProducts({ items: [{ item_id: "8821", variant_id: "8821" }] });

    expect(product).not.toHaveProperty("variation_id");
  });

  const quantities = [
    ["a missing quantity", undefined],
    ["a zero quantity", 0],
    ["a negative quantity", -3],
    ["a non-numeric quantity", "two"],
    ["a null quantity", null],
  ];

  it.each(quantities)("counts one unit for %s", (_label, quantity) => {
    const [product] = toCustomerioProducts({ items: [{ item_id: "8821", quantity }] });

    expect(product.quantity).toBe(1);
  });

  it("keeps a real quantity as given", () => {
    const [product] = toCustomerioProducts({ items: [{ item_id: "8821", quantity: 4 }] });

    expect(product.quantity).toBe(4);
  });

  it("falls back to United States dollars when the cart names no currency", () => {
    const [product] = toCustomerioProducts({ items: [{ item_id: "8821" }] });

    expect(product.currency).toBe("USD");
  });

  it("uses the currency the cart names when there is one", () => {
    const [product] = toCustomerioProducts({ currency: "CAD", items: [{ item_id: "8821" }] });

    expect(product.currency).toBe("CAD");
  });

  it("returns an empty list for a cart with no items at all", () => {
    expect(toCustomerioProducts(undefined)).toEqual([]);
    expect(toCustomerioProducts({})).toEqual([]);
    expect(toCustomerioProducts({ items: "not-an-array" })).toEqual([]);
  });
});

describe("the properties object on a track call", () => {
  it("carries only the allowlisted top-level keys", () => {
    const properties = buildEventProperties({
      ecommerce: { items: [itemWithForbiddenFields()], currency: "USD", value: 179.98 },
    });

    expect(Object.keys(properties).sort()).toEqual(["cart_total", "currency", "products"]);
    expect(properties.cart_total).toBe(179.98);
    expect(properties.currency).toBe("USD");
  });

  it("leaves out the session and the page URL when neither is supplied", () => {
    const properties = buildEventProperties({ ecommerce: { items: [{ item_id: "8821" }] } });

    expect(Object.keys(properties).sort()).toEqual(["currency", "products"]);
    expect(properties).not.toHaveProperty("session_id");
    expect(properties).not.toHaveProperty("url");
  });

  it("includes the session and the page URL once they are supplied", () => {
    const properties = buildEventProperties({
      ecommerce: { items: [{ item_id: "8821" }] },
      url: "https://myrocky.ca/cart",
      sessionId: "sess-abc-123",
    });

    expect(properties.url).toBe("https://myrocky.ca/cart");
    expect(properties.session_id).toBe("sess-abc-123");
    expect(Object.keys(properties).sort()).toEqual([
      "currency",
      "products",
      "session_id",
      "url",
    ]);
  });

  it("ignores anything handed in that is not part of the schema", () => {
    const properties = buildEventProperties({
      ecommerce: {
        items: [{ item_id: "8821" }],
        coupon: "SAVE20",
        patient_email: "someone@example.com",
      },
      diagnosis: "ED",
      email: "someone@example.com",
    });

    expect(Object.keys(properties).sort()).toEqual(["currency", "products"]);
    expect(JSON.stringify(properties)).not.toContain("someone@example.com");
    expect(JSON.stringify(properties)).not.toContain("SAVE20");
  });
});

describe("the traits on an identify call", () => {
  it("lowercases the email, keeps the phone, and carries nothing else", () => {
    const traits = buildIdentifyTraits({
      email: "  Someone.Else@Example.COM ",
      phone: "+15551234567",
      firstName: "Someone",
      province: "ON",
      dateOfBirth: "1985-04-02",
      diagnosis: "ED",
      questionnaire_answers: { q1: "yes" },
    });

    expect(traits).toEqual({ email: "someone.else@example.com", phone: "+15551234567" });
    expect(Object.keys(traits).sort()).toEqual(["email", "phone"]);
  });

  it("returns nothing at all when there is no email and no phone", () => {
    expect(buildIdentifyTraits({})).toEqual({});
    expect(buildIdentifyTraits()).toEqual({});
    expect(buildIdentifyTraits({ email: "   ", phone: "" })).toEqual({});
  });
});

describe("choosing the identity keys a call may use", () => {
  it("addresses a known customer by the bare Woo ID", () => {
    const identity = buildIdentityKeys({ wooCustomerId: 12345 });

    expect(identity).toEqual({ userId: "12345" });
    expect(identity.userId).toBe("12345");
  });

  it("keeps the Woo ID as the identity even when a session ID is also present", () => {
    const identity = buildIdentityKeys({ wooCustomerId: "12345", anonymousId: "sess-abc-123" });

    expect(identity.userId).toBe("12345");
    expect(identity.anonymousId).toBe("sess-abc-123");
  });

  it("addresses an email-only lead by its session ID and never invents a userId", () => {
    const identity = buildIdentityKeys({
      email: "lead@example.com",
      anonymousId: "sess-abc-123",
    });

    expect(identity).toEqual({ anonymousId: "sess-abc-123" });
    expect(identity).not.toHaveProperty("userId");
  });

  it("derives a stable anonymous ID for an email-only lead with no session ID", () => {
    const first = buildIdentityKeys({ email: "lead@example.com" });
    const second = buildIdentityKeys({ email: "lead@example.com" });

    expect(first.anonymousId).toBe(second.anonymousId);
    expect(first).not.toHaveProperty("userId");
    expect(first.anonymousId).toMatch(/^cio-email-[0-9a-f]{64}$/);
  });

  it("derives the same anonymous ID no matter how the email was cased", () => {
    const lower = buildIdentityKeys({ email: "lead@example.com" });
    const mixed = buildIdentityKeys({ email: "  Lead@Example.COM " });

    expect(mixed.anonymousId).toBe(lower.anonymousId);
  });

  it("derives a different anonymous ID for a different email", () => {
    const first = buildIdentityKeys({ email: "lead@example.com" });
    const other = buildIdentityKeys({ email: "other@example.com" });

    expect(other.anonymousId).not.toBe(first.anonymousId);
  });

  it("reports no identity when there is nothing to address a profile by", () => {
    expect(buildIdentityKeys({})).toBeNull();
    expect(buildIdentityKeys()).toBeNull();
    expect(buildIdentityKeys({ wooCustomerId: 0, email: "", anonymousId: "" })).toBeNull();
    expect(buildIdentityKeys({ phone: "+15551234567" })).toBeNull();
  });
});

describe("the Pipelines message ID", () => {
  it("is identical on both calls when the same dedupe key and event are given", () => {
    const first = createMessageId({ event: "Checkout Started", dedupeKey: "checkout|sess|8821x1" });
    const second = createMessageId({
      event: "Checkout Started",
      dedupeKey: "checkout|sess|8821x1",
    });

    expect(first).toBe(second);
    expect(first).toMatch(/^cio-[0-9a-f]{64}$/);
  });

  it("differs when the dedupe key differs", () => {
    const first = createMessageId({ event: "Checkout Started", dedupeKey: "checkout|sess|8821x1" });
    const other = createMessageId({ event: "Checkout Started", dedupeKey: "checkout|sess|8821x2" });

    expect(other).not.toBe(first);
  });

  it("differs when the event differs under the same dedupe key", () => {
    const started = createMessageId({ event: "Checkout Started", dedupeKey: "same-key" });
    const added = createMessageId({ event: "Product Added", dedupeKey: "same-key" });

    expect(added).not.toBe(started);
  });

  it("is unique per call when no dedupe key is given, so repeat actions are not collapsed", () => {
    const first = createMessageId({ event: "Product Added" });
    const second = createMessageId({ event: "Product Added" });

    expect(second).not.toBe(first);
    expect(first.startsWith("cio-")).toBe(true);
  });
});

describe("assembling the request body", () => {
  const identity = { userId: "12345" };

  it("carries the type, event, properties, message ID, timestamp and identity for a track", () => {
    const body = buildPipelinesBody({
      type: "track",
      identity,
      event: "Product Added",
      properties: { currency: "USD", products: [{ product_id: "8821" }] },
      messageId: "cio-fixed-message-id",
      timestamp: "2026-09-01T12:00:00.000Z",
    });

    expect(body).toEqual({
      type: "track",
      event: "Product Added",
      properties: { currency: "USD", products: [{ product_id: "8821" }] },
      messageId: "cio-fixed-message-id",
      timestamp: "2026-09-01T12:00:00.000Z",
      userId: "12345",
    });
  });

  it("stamps the current time when no timestamp is supplied", () => {
    const before = Date.now();
    const body = buildPipelinesBody({
      type: "track",
      identity,
      event: "Product Added",
      properties: {},
      messageId: "cio-fixed-message-id",
    });
    const stamped = Date.parse(body.timestamp);

    expect(Number.isNaN(stamped)).toBe(false);
    expect(stamped).toBeGreaterThanOrEqual(before - 1000);
    expect(stamped).toBeLessThanOrEqual(Date.now() + 1000);
  });

  it("carries traits and no event name for an identify", () => {
    const body = buildPipelinesBody({
      type: "identify",
      identity: { anonymousId: "sess-abc-123" },
      traits: { email: "lead@example.com" },
      messageId: "cio-fixed-message-id",
      timestamp: "2026-09-01T12:00:00.000Z",
    });

    expect(body.traits).toEqual({ email: "lead@example.com" });
    expect(body).not.toHaveProperty("event");
    expect(body).not.toHaveProperty("properties");
    expect(body.anonymousId).toBe("sess-abc-123");
    expect(body).not.toHaveProperty("userId");
  });

  it("leaves the context out entirely when no request detail is supplied", () => {
    const body = buildPipelinesBody({
      type: "track",
      identity,
      event: "Product Added",
      properties: {},
      messageId: "cio-fixed-message-id",
    });

    expect(body).not.toHaveProperty("context");
  });

  it("includes the IP, user agent and page URL only once each is supplied", () => {
    const body = buildPipelinesBody({
      type: "track",
      identity,
      event: "Product Added",
      properties: {},
      messageId: "cio-fixed-message-id",
      context: {
        ip: "203.0.113.7",
        userAgent: "Mozilla/5.0 (test)",
        url: "https://myrocky.ca/cart",
      },
    });

    expect(body.context).toEqual({
      ip: "203.0.113.7",
      userAgent: "Mozilla/5.0 (test)",
      page: { url: "https://myrocky.ca/cart" },
    });
  });

  it("includes only the parts of the context that were actually supplied", () => {
    const body = buildPipelinesBody({
      type: "track",
      identity,
      event: "Product Added",
      properties: {},
      messageId: "cio-fixed-message-id",
      context: { ip: "203.0.113.7", userAgent: "", url: undefined },
    });

    expect(body.context).toEqual({ ip: "203.0.113.7" });
    expect(body.context).not.toHaveProperty("userAgent");
    expect(body.context).not.toHaveProperty("page");
  });
});

describe("the event vocabulary gate used by the orchestrator", () => {
  it("accepts the three storefront-owned events and refuses everything else", () => {
    expect(isAllowedCustomerioEvent("Product Viewed")).toBe(true);
    expect(isAllowedCustomerioEvent("Product Added")).toBe(true);
    expect(isAllowedCustomerioEvent("Checkout Started")).toBe(true);
    expect(isAllowedCustomerioEvent("Order Completed")).toBe(false);
    expect(isAllowedCustomerioEvent("cart_abandoned")).toBe(false);
    expect(isAllowedCustomerioEvent("product added")).toBe(false);
    expect(isAllowedCustomerioEvent(undefined)).toBe(false);
  });
});
