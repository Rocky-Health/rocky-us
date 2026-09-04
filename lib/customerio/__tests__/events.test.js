/**
 * Event vocabulary and the client bundle boundary.
 *
 * The vocabulary module exists so the browser helper can name events without importing the
 * server-only payload builder. The source scans below are the automated form of the manual
 * "no secret reaches the browser" check: they read the two files that are allowed to end up in
 * a client bundle and fail if either one so much as mentions a credential.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { CUSTOMERIO_EVENTS } from "@/lib/customerio/events";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

const readSource = (relativePath) => readFileSync(`${repoRoot}${relativePath}`, "utf8");

const FORBIDDEN_IN_CLIENT_SOURCE = [
  "CUSTOMERIO_SAMPLE_WRITE_KEY",
  "CUSTOMERIO_CA_WRITE_KEY",
  "CUSTOMERIO_US_WRITE_KEY",
  "writeKey",
  "process.env",
];

const CLIENT_REACHABLE_FILES = [
  "utils/customerioEvents.js",
  "lib/customerio/events.js",
];

describe("the event vocabulary", () => {
  it("names the three actions a browser can actually observe", () => {
    expect(CUSTOMERIO_EVENTS).toEqual({
      PRODUCT_VIEWED: "Product Viewed",
      PRODUCT_ADDED: "Product Added",
      CHECKOUT_STARTED: "Checkout Started",
    });
  });

  it("leaves purchase and abandonment out, because this repo does not own them", () => {
    const names = Object.values(CUSTOMERIO_EVENTS);

    expect(names).not.toContain("Order Completed");
    expect(names).not.toContain("cart_abandoned");
  });
});

describe("the client bundle boundary", () => {
  it.each(CLIENT_REACHABLE_FILES)("keeps every credential out of %s", (relativePath) => {
    const source = readSource(relativePath);

    expect(source.length).toBeGreaterThan(0);
    FORBIDDEN_IN_CLIENT_SOURCE.forEach((needle) => {
      expect(source, `${relativePath} must not mention ${needle}`).not.toContain(needle);
    });
  });

  it("keeps the vocabulary module free of imports, so nothing server-only rides along", () => {
    const source = readSource("lib/customerio/events.js");

    // No import of any kind, which is what keeps node:crypto and the payload builder out.
    expect(source).not.toMatch(/^\s*import\s/m);
    expect(source).not.toMatch(/\brequire\(/);
  });

  it("keeps the browser helper away from the server-only payload builder", () => {
    const source = readSource("utils/customerioEvents.js");

    expect(source).not.toContain("lib/customerio/payload");
    expect(source).not.toContain("lib/customerio/client");
    expect(source).not.toContain("lib/customerio/config");
    expect(source).not.toContain("lib/customerio/server");
    expect(source).toContain("@/lib/customerio/events");
  });
});
