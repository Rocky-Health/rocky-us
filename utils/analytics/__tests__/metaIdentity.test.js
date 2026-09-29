import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { normalizePhoneForMeta, metaExternalIdSource } from "@/utils/analytics/normalize";
import { hashPhoneForMeta, hashExternalIdForMeta, hashPhone } from "@/utils/analytics/hashServerSide";
import {
  hashPhoneForMetaClient,
  hashExternalIdForMetaClient,
} from "@/utils/analytics/hashClientSide";

// TK-714: pixel and CAPI must hash the identical string or Meta never joins them.

// The client hashers bail out without window.crypto.subtle; Node has the same API.
beforeAll(() => {
  globalThis.window = { crypto: globalThis.crypto };
});
afterAll(() => {
  delete globalThis.window;
});

describe("normalizePhoneForMeta", () => {
  it("formats to country code + digits with no plus", () => {
    expect(normalizePhoneForMeta("(416) 555-1234", "US")).toBe("14165551234");
    expect(normalizePhoneForMeta("416-555-1234", "US")).toBe("14165551234");
    expect(normalizePhoneForMeta("+1 416 555 1234", "US")).toBe("14165551234");
    expect(normalizePhoneForMeta("14165551234", "US")).toBe("14165551234");
  });

  it("returns empty for junk", () => {
    expect(normalizePhoneForMeta("", "US")).toBe("");
    expect(normalizePhoneForMeta("abc", "US")).toBe("");
    expect(normalizePhoneForMeta(undefined, "US")).toBe("");
  });

  it("leaves the shared TikTok normalizer untouched", async () => {
    const { normalizePhone } = await import("@/utils/analytics/normalize");
    expect(normalizePhone("(416) 555-1234", "US")).toBe("+14165551234");
  });
});

describe("metaExternalIdSource", () => {
  it("strips the wc: canonical prefix down to the bare id", () => {
    expect(metaExternalIdSource("wc:121149")).toBe("121149");
    expect(metaExternalIdSource("WC:121149")).toBe("121149");
  });

  it("keeps a bare id as is, including numbers", () => {
    expect(metaExternalIdSource("121149")).toBe("121149");
    expect(metaExternalIdSource(121149)).toBe("121149");
  });

  it("passes non-wc canonicals through and empties nothing-values", () => {
    expect(metaExternalIdSource("email:a@b.com")).toBe("email:a@b.com");
    expect(metaExternalIdSource("")).toBe("");
    expect(metaExternalIdSource(null)).toBe("");
    expect(metaExternalIdSource(undefined)).toBe("");
  });
});

describe("client and server hash the same identity", () => {
  it("external_id: client bare id === server canonical wc: id", async () => {
    const client = await hashExternalIdForMetaClient("121149");
    expect(client).toMatch(/^[0-9a-f]{64}$/);
    expect(hashExternalIdForMeta("wc:121149")).toBe(client);
    expect(hashExternalIdForMeta("121149")).toBe(client);
  });

  it("phone: formatted cookie value on the client === billing phone on the server", async () => {
    const client = await hashPhoneForMetaClient("(416) 555-1234", "US");
    expect(client).toMatch(/^[0-9a-f]{64}$/);
    expect(hashPhoneForMeta("416.555.1234", "US")).toBe(client);
  });

  it("Meta phone hash differs from the old plus-prefixed hash", () => {
    expect(hashPhoneForMeta("(416) 555-1234", "US")).not.toBe(hashPhone("(416) 555-1234", "US"));
  });
});
