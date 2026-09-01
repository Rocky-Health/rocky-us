/**
 * Orchestration. Both the environment and the transport are injected, so these cases exercise
 * the real decision path end to end without a network call and without reading the machine's
 * environment.
 */

import { describe, expect, it, vi } from "vitest";

import { CUSTOMERIO_EVENTS } from "@/lib/customerio/events";
import { identifyCustomerioProfile, trackCustomerioEvent } from "@/lib/customerio/server";

const CA_KEY = "cio-ca-write-key-for-tests";

const enabledEnv = {
  CUSTOMERIO_ENABLED: "true",
  CUSTOMERIO_WORKSPACE: "ca",
  CUSTOMERIO_CA_WRITE_KEY: CA_KEY,
};

const disabledEnv = {
  CUSTOMERIO_ENABLED: "false",
  CUSTOMERIO_WORKSPACE: "ca",
  CUSTOMERIO_CA_WRITE_KEY: CA_KEY,
};

const respondWith = (status) => ({ ok: status >= 200 && status < 300, status });

const okFetch = () => vi.fn().mockResolvedValue(respondWith(200));

const oneItem = () => ({
  currency: "USD",
  value: 89.99,
  items: [
    {
      item_id: "8821",
      item_name: "Sildenafil 50mg",
      item_category: "ED",
      quantity: 1,
      price: 89.99,
      diagnosis: "ED",
      questionnaire_answers: { q1: "yes" },
    },
  ],
});

const parsedCall = (fetchImpl, index = 0) => ({
  url: fetchImpl.mock.calls[index][0],
  body: JSON.parse(fetchImpl.mock.calls[index][1].body),
});

describe("a switched-off environment", () => {
  it("sends no identify request", async () => {
    const fetchImpl = okFetch();

    const result = await identifyCustomerioProfile({
      email: "lead@example.com",
      env: disabledEnv,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(result.skipped).toBe("disabled");
  });

  it("sends no track request", async () => {
    const fetchImpl = okFetch();

    const result = await trackCustomerioEvent({
      event: CUSTOMERIO_EVENTS.PRODUCT_ADDED,
      wooCustomerId: 12345,
      ecommerce: oneItem(),
      env: disabledEnv,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(result.skipped).toBe("disabled");
  });

  it("sends nothing when the selected workspace has no write key of its own", async () => {
    const fetchImpl = okFetch();

    const result = await trackCustomerioEvent({
      event: CUSTOMERIO_EVENTS.PRODUCT_ADDED,
      wooCustomerId: 12345,
      ecommerce: oneItem(),
      env: {
        CUSTOMERIO_ENABLED: "true",
        CUSTOMERIO_WORKSPACE: "ca",
        CUSTOMERIO_SAMPLE_WRITE_KEY: "cio-sample-write-key-for-tests",
      },
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(result.skipped).toBe("missing-write-key");
  });
});

describe("events this storefront does not own", () => {
  const forbiddenEvents = [
    ["a purchase, which Woo and the backend own", "Order Completed"],
    ["an abandonment, which Customer.io derives", "cart_abandoned"],
    ["a name that does not exist at all", "Product Removed"],
    ["the right name in the wrong case", "product added"],
  ];

  it.each(forbiddenEvents)("cannot be sent: %s", async (_label, event) => {
    const fetchImpl = okFetch();

    const result = await trackCustomerioEvent({
      event,
      wooCustomerId: 12345,
      ecommerce: oneItem(),
      env: enabledEnv,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(result.ok).toBe(false);
    expect(result.error).toBe("unsupported-event");
  });
});

describe("a known customer adding a product", () => {
  it("sends one track call addressed by the bare Woo customer ID", async () => {
    const fetchImpl = okFetch();

    const result = await trackCustomerioEvent({
      event: CUSTOMERIO_EVENTS.PRODUCT_ADDED,
      wooCustomerId: 12345,
      ecommerce: oneItem(),
      url: "https://myrocky.ca/cart",
      env: enabledEnv,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const { url, body } = parsedCall(fetchImpl);
    expect(url).toBe("https://cdp.customer.io/v1/track");
    expect(body.userId).toBe("12345");
    expect(body.event).toBe("Product Added");
    expect(body.type).toBe("track");
    expect(body.properties.products).toHaveLength(1);
    expect(body.properties.products[0].product_id).toBe("8821");
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
  });

  it("forwards nothing clinical from the cart line", async () => {
    const fetchImpl = okFetch();

    await trackCustomerioEvent({
      event: CUSTOMERIO_EVENTS.PRODUCT_ADDED,
      wooCustomerId: 12345,
      ecommerce: oneItem(),
      env: enabledEnv,
      fetchImpl,
    });

    const sent = fetchImpl.mock.calls[0][1].body;
    expect(sent).not.toContain("diagnosis");
    expect(sent).not.toContain("questionnaire_answers");
  });
});

describe("a lead known only by email", () => {
  it("sends one identify call addressed anonymously with the email as a trait", async () => {
    const fetchImpl = okFetch();

    const result = await identifyCustomerioProfile({
      email: "Lead@Example.com",
      env: enabledEnv,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    const { url, body } = parsedCall(fetchImpl);
    expect(url).toBe("https://cdp.customer.io/v1/identify");
    expect(body.type).toBe("identify");
    expect(body.anonymousId).toBeTruthy();
    expect(body).not.toHaveProperty("userId");
    expect(body.traits.email).toBe("lead@example.com");
    expect(result.ok).toBe(true);
  });

  it("sends nothing when there is no way to address a profile", async () => {
    const fetchImpl = okFetch();

    const result = await identifyCustomerioProfile({ env: enabledEnv, fetchImpl });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(result.skipped).toBe("no-identity");
  });
});

describe("an event with nothing in the cart", () => {
  it("sends nothing rather than an empty product list", async () => {
    const fetchImpl = okFetch();

    const result = await trackCustomerioEvent({
      event: CUSTOMERIO_EVENTS.CHECKOUT_STARTED,
      wooCustomerId: 12345,
      ecommerce: { currency: "USD", items: [] },
      env: enabledEnv,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(result.skipped).toBe("no-products");
  });

  it("sends nothing when every cart line lacks a product ID", async () => {
    const fetchImpl = okFetch();

    const result = await trackCustomerioEvent({
      event: CUSTOMERIO_EVENTS.CHECKOUT_STARTED,
      wooCustomerId: 12345,
      ecommerce: { items: [{ item_name: "Nameless line" }] },
      env: enabledEnv,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(0);
    expect(result.skipped).toBe("no-products");
  });
});

describe("Customer.io answering with an error", () => {
  it("reports the failure instead of throwing into the cart", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respondWith(400));

    const result = await trackCustomerioEvent({
      event: CUSTOMERIO_EVENTS.PRODUCT_ADDED,
      wooCustomerId: 12345,
      ecommerce: oneItem(),
      env: enabledEnv,
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
    expect(result.error).toBe("status-400");
  });

  it("reports a failed identify instead of throwing into the form", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(respondWith(400));

    const result = await identifyCustomerioProfile({
      email: "lead@example.com",
      env: enabledEnv,
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    expect(result.status).toBe(400);
  });

  it("does not throw when the network itself fails", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("fetch failed"));

    const result = await trackCustomerioEvent({
      event: CUSTOMERIO_EVENTS.PRODUCT_ADDED,
      wooCustomerId: 12345,
      ecommerce: oneItem(),
      env: enabledEnv,
      fetchImpl,
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBeTruthy();
  });
});
