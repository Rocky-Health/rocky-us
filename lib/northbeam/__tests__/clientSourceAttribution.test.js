import { afterEach, describe, expect, it } from "vitest";

import {
  captureAttribution,
  getAttributionData,
  isOwnPropertyReferrer,
} from "@/utils/sourceAttribution";

/**
 * Acceptance for TK-1074.
 *
 * The defect: an own-property navigation (an account portal link, an
 * internal promo) that happens to carry UTM params overwrote a real
 * acquisition with our own site, because captureAttribution wrote the
 * incoming UTM fields unconditionally. The old own-domain check in
 * getReferrer also compared hostnames exactly, so www. against the bare apex
 * and a sibling subdomain were both (wrongly) treated as external. These
 * tests fail against the pre-fix code for exactly those reasons.
 *
 * environment is "node" (see vitest.config.mjs), so window/document/
 * localStorage are hand-rolled doubles rather than jsdom.
 */

function createStorageDouble(initial = {}) {
  const store = { ...initial };
  return {
    getItem: (key) =>
      Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null,
    setItem: (key, value) => {
      store[key] = String(value);
    },
    removeItem: (key) => {
      delete store[key];
    },
  };
}

function createDocumentDouble({ referrer = "" } = {}) {
  let jar = {};
  return {
    referrer,
    get cookie() {
      return Object.entries(jar)
        .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
        .join("; ");
    },
    set cookie(raw) {
      const pair = String(raw).split(";")[0];
      const eqIdx = pair.indexOf("=");
      if (eqIdx === -1) return;
      const name = pair.slice(0, eqIdx);
      const value = pair.slice(eqIdx + 1);
      jar[name] = decodeURIComponent(value || "");
    },
  };
}

function installEnv({ hostname, search = "", referrer = "" }) {
  const localStorage = createStorageDouble();
  const documentDouble = createDocumentDouble({ referrer });
  global.window = {
    location: {
      hostname,
      search,
      href: `https://${hostname}/${search}`,
    },
    localStorage,
    addEventListener: () => {},
  };
  global.document = documentDouble;
  return { localStorage, document: documentDouble };
}

afterEach(() => {
  delete global.window;
  delete global.document;
});

describe("isOwnPropertyReferrer (registrable-base, replaces the old exact-hostname check)", () => {
  it("returns true for www. against the bare apex, where exact-match returned false", () => {
    expect(isOwnPropertyReferrer("www.myrocky.com", "myrocky.com")).toBe(true);
  });

  it("returns true for a sibling subdomain, where exact-match returned false", () => {
    expect(isOwnPropertyReferrer("account.myrocky.com", "myrocky.com")).toBe(true);
  });

  it("returns false for an unrelated domain", () => {
    expect(isOwnPropertyReferrer("google.com", "myrocky.com")).toBe(false);
  });
});

describe("captureAttribution: own-property navigations do not overwrite acquisition", () => {
  it.each([
    ["www subdomain vs apex", "myrocky.com", "https://www.myrocky.com/account"],
    ["sibling subdomain", "myrocky.com", "https://account.myrocky.com/account"],
    ["vercel preview", "myrocky.com", "https://storefront-git-tk.vercel.app/account"],
  ])(
    "leaves stored UTMs untouched for %s, and sets the suppression marker",
    (label, hostname, referrer) => {
      const { localStorage } = installEnv({
        hostname,
        search: "?utm_source=own_promo&utm_medium=internal",
        referrer,
      });
      localStorage.setItem("traffic_source", "google");
      localStorage.setItem("traffic_medium", "cpc");
      localStorage.setItem("traffic_campaign", "brand");

      captureAttribution();

      const data = getAttributionData();
      expect(data.source).toBe("google");
      expect(data.medium).toBe("cpc");
      expect(data.campaign).toBe("brand");
      expect(localStorage.getItem("utm_suppressed_own_domain")).toBe("true");
    }
  );

  it("stores the incoming set when an own-property referrer arrives with nothing stored yet", () => {
    installEnv({
      hostname: "myrocky.com",
      search: "?utm_source=own_promo&utm_medium=internal",
      referrer: "https://www.myrocky.com/account",
    });

    captureAttribution();

    const data = getAttributionData();
    expect(data.source).toBe("own_promo");
    expect(data.medium).toBe("internal");
  });

  it("does overwrite when the referrer is a genuine external site", () => {
    const { localStorage } = installEnv({
      hostname: "myrocky.com",
      search: "?utm_source=newsletter&utm_medium=email",
      referrer: "https://www.externalsite.com/page",
    });
    localStorage.setItem("traffic_source", "google");
    localStorage.setItem("traffic_medium", "cpc");

    captureAttribution();

    const data = getAttributionData();
    expect(data.source).toBe("newsletter");
    expect(data.medium).toBe("email");
  });
});

describe("captureAttribution: own-property UTM stamps are never acquisition", () => {
  it("does not let a patient_portal stamp overwrite a stored campaign, even with no referrer", () => {
    const { localStorage } = installEnv({
      hostname: "myrocky.com",
      search: "?utm_source=patient_portal&utm_medium=authenticated&utm_campaign=portal_treatments",
    });
    localStorage.setItem("traffic_source", "google");
    localStorage.setItem("traffic_medium", "cpc");
    localStorage.setItem("traffic_campaign", "brand");

    captureAttribution();

    const data = getAttributionData();
    expect(data.source).toBe("google");
    expect(data.medium).toBe("cpc");
    expect(data.campaign).toBe("brand");
    expect(localStorage.getItem("utm_suppressed_own_domain")).toBe("true");
  });

  it("does not store a patient_portal stamp when nothing is stored yet", () => {
    const { localStorage } = installEnv({
      hostname: "myrocky.com",
      search: "?utm_source=patient_portal&utm_medium=authenticated",
    });

    captureAttribution();

    const data = getAttributionData();
    expect(data.source).toBe("");
    expect(data.medium).toBe("");
    expect(localStorage.getItem("utm_suppressed_own_domain")).toBe("true");
  });

  it("matches the internal list case-insensitively and ignoring surrounding space", () => {
    const { localStorage } = installEnv({
      hostname: "myrocky.com",
      search: "?utm_source=%20Patient_Portal%20",
    });
    localStorage.setItem("traffic_source", "google");

    captureAttribution();

    expect(getAttributionData().source).toBe("google");
  });

  it("still captures a genuine campaign that arrives with no referrer", () => {
    const { localStorage } = installEnv({
      hostname: "myrocky.com",
      search: "?utm_source=newsletter&utm_medium=email",
    });
    localStorage.setItem("traffic_source", "google");

    captureAttribution();

    const data = getAttributionData();
    expect(data.source).toBe("newsletter");
    expect(data.medium).toBe("email");
  });
});

/**
 * QA regression: a new utm_source is a new acquisition and must replace the
 * whole set. Writing only the fields present on the URL left bing reporting
 * the campaign and term that google brought. A partial set with no utm_source
 * still merges, which is the other half of the same rule.
 */
describe("captureAttribution: a new source replaces the set, a partial set merges", () => {
  function installReturningVisitor({ search }) {
    const env = installEnv({ hostname: "myrocky.com", search });
    env.localStorage.setItem("traffic_source", "google");
    env.localStorage.setItem("traffic_medium", "cpc");
    env.localStorage.setItem("traffic_campaign", "qa1074");
    env.localStorage.setItem("traffic_term", "brandterm");
    env.localStorage.setItem("traffic_content", "heroimage");
    return env;
  }

  it("clears the previous campaign fields when a new utm_source arrives", () => {
    installReturningVisitor({ search: "?utm_source=bing" });

    captureAttribution();

    const data = getAttributionData();
    expect(data.source).toBe("bing");
    expect(data.medium).toBe("");
    expect(data.campaign).toBe("");
    expect(data.term).toBe("");
    expect(data.content).toBe("");
  });

  it("keeps the fields a new source does supply", () => {
    installReturningVisitor({ search: "?utm_source=bing&utm_campaign=q4launch" });

    captureAttribution();

    const data = getAttributionData();
    expect(data.source).toBe("bing");
    expect(data.campaign).toBe("q4launch");
    expect(data.term).toBe("");
  });

  it("merges a partial set with no utm_source over what is stored", () => {
    installReturningVisitor({ search: "?utm_medium=email" });

    captureAttribution();

    const data = getAttributionData();
    expect(data.source).toBe("google");
    expect(data.medium).toBe("email");
    expect(data.campaign).toBe("qa1074");
    expect(data.term).toBe("brandterm");
  });
});
