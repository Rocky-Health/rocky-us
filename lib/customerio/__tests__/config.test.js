/**
 * Workspace resolution. Every case injects its own env object, so nothing here depends on
 * the machine's real process.env and nothing here can leak a real credential into a run.
 */

import { describe, expect, it } from "vitest";

import {
  CUSTOMERIO_PIPELINES_HOST,
  CUSTOMERIO_REFUSALS,
  CUSTOMERIO_WORKSPACES,
  describeCustomerioConfig,
  resolveCustomerioConfig,
} from "@/lib/customerio/config";

const SAMPLE_KEY = "cio-sample-write-key-for-tests";
const CA_KEY = "cio-ca-write-key-for-tests";
const US_KEY = "cio-us-write-key-for-tests";

const envWith = (overrides = {}) => ({
  CUSTOMERIO_ENABLED: "true",
  ...overrides,
});

describe("the integration stays off unless it is switched on explicitly", () => {
  const offValues = [
    ["with no CUSTOMERIO_ENABLED at all", undefined],
    ['with CUSTOMERIO_ENABLED set to "false"', "false"],
    ['with CUSTOMERIO_ENABLED set to "TRUE"', "TRUE"],
    ['with CUSTOMERIO_ENABLED set to "1"', "1"],
  ];

  it.each(offValues)("sends nothing and holds no write key %s", (_label, enabledValue) => {
    const config = resolveCustomerioConfig({
      CUSTOMERIO_ENABLED: enabledValue,
      CUSTOMERIO_WORKSPACE: "ca",
      CUSTOMERIO_SAMPLE_WRITE_KEY: SAMPLE_KEY,
      CUSTOMERIO_CA_WRITE_KEY: CA_KEY,
      CUSTOMERIO_US_WRITE_KEY: US_KEY,
    });

    expect(config.enabled).toBe(false);
    expect(config.writeKey).toBeNull();
    expect(config.reason).toBe(CUSTOMERIO_REFUSALS.DISABLED);
  });

  it("treats a completely empty environment as off rather than as a default workspace", () => {
    const config = resolveCustomerioConfig({});

    expect(config.enabled).toBe(false);
    expect(config.workspace).toBeNull();
    expect(config.writeKey).toBeNull();
    expect(config.reason).toBe(CUSTOMERIO_REFUSALS.DISABLED);
  });
});

describe("each workspace is activated only by its own write key", () => {
  it("routes to the Sample workspace with the sample key when Sample is selected", () => {
    const config = resolveCustomerioConfig(
      envWith({
        CUSTOMERIO_WORKSPACE: "sample",
        CUSTOMERIO_SAMPLE_WRITE_KEY: SAMPLE_KEY,
      })
    );

    expect(config.enabled).toBe(true);
    expect(config.workspace).toBe("sample");
    expect(config.writeKey).toBe(SAMPLE_KEY);
    expect(config.reason).toBe("ok");
  });

  it("routes to Canada production with the CA key when Canada is selected", () => {
    const config = resolveCustomerioConfig(
      envWith({
        CUSTOMERIO_WORKSPACE: "ca",
        CUSTOMERIO_CA_WRITE_KEY: CA_KEY,
      })
    );

    expect(config.enabled).toBe(true);
    expect(config.workspace).toBe("ca");
    expect(config.writeKey).toBe(CA_KEY);
  });

  it("routes to USA production with the US key when USA is selected", () => {
    const config = resolveCustomerioConfig(
      envWith({
        CUSTOMERIO_WORKSPACE: "us",
        CUSTOMERIO_US_WRITE_KEY: US_KEY,
      })
    );

    expect(config.enabled).toBe(true);
    expect(config.workspace).toBe("us");
    expect(config.writeKey).toBe(US_KEY);
  });

  it("trims a trailing space off a workspace name instead of failing on it", () => {
    const config = resolveCustomerioConfig(
      envWith({
        CUSTOMERIO_WORKSPACE: "sample ",
        CUSTOMERIO_SAMPLE_WRITE_KEY: SAMPLE_KEY,
      })
    );

    expect(config.enabled).toBe(true);
    expect(config.workspace).toBe("sample");
    expect(config.writeKey).toBe(SAMPLE_KEY);
  });

  it("trims whitespace off the write key itself", () => {
    const config = resolveCustomerioConfig(
      envWith({
        CUSTOMERIO_WORKSPACE: "ca",
        CUSTOMERIO_CA_WRITE_KEY: `  ${CA_KEY}  `,
      })
    );

    expect(config.enabled).toBe(true);
    expect(config.writeKey).toBe(CA_KEY);
  });

  it("treats a write key that is only whitespace as no key at all", () => {
    const config = resolveCustomerioConfig(
      envWith({
        CUSTOMERIO_WORKSPACE: "ca",
        CUSTOMERIO_CA_WRITE_KEY: "   ",
      })
    );

    expect(config.enabled).toBe(false);
    expect(config.writeKey).toBeNull();
    expect(config.reason).toBe(CUSTOMERIO_REFUSALS.MISSING_WRITE_KEY);
  });
});

describe("the zero-fallback rule between workspaces", () => {
  it("refuses to fall back to the sample key when the CA key is missing", () => {
    const config = resolveCustomerioConfig(
      envWith({
        CUSTOMERIO_WORKSPACE: "ca",
        CUSTOMERIO_SAMPLE_WRITE_KEY: SAMPLE_KEY,
      })
    );

    expect(config.enabled).toBe(false);
    expect(config.reason).toBe(CUSTOMERIO_REFUSALS.MISSING_WRITE_KEY);
    expect(config.workspace).toBe("ca");
    expect(config.writeKey).toBeNull();
    // The point of the rule: Canadian production traffic must not land in Sample.
    expect(config.writeKey).not.toBe(SAMPLE_KEY);
  });

  it("refuses to fall back to the sample key when the US key is missing", () => {
    const config = resolveCustomerioConfig(
      envWith({
        CUSTOMERIO_WORKSPACE: "us",
        CUSTOMERIO_SAMPLE_WRITE_KEY: SAMPLE_KEY,
      })
    );

    expect(config.enabled).toBe(false);
    expect(config.reason).toBe(CUSTOMERIO_REFUSALS.MISSING_WRITE_KEY);
    expect(config.workspace).toBe("us");
    expect(config.writeKey).toBeNull();
    expect(config.writeKey).not.toBe(SAMPLE_KEY);
  });

  it("refuses to fall back to the CA key when the US key is missing", () => {
    const config = resolveCustomerioConfig(
      envWith({
        CUSTOMERIO_WORKSPACE: "us",
        CUSTOMERIO_CA_WRITE_KEY: CA_KEY,
      })
    );

    expect(config.enabled).toBe(false);
    expect(config.writeKey).toBeNull();
    expect(config.writeKey).not.toBe(CA_KEY);
  });
});

describe("an unrecognised workspace name fails closed", () => {
  const invalidValues = [
    ["an empty string", ""],
    ["a name that was never defined", "prod"],
    ["the right name in the wrong case", "CA"],
    ["a missing value", undefined],
    ["a prototype-pollution style value", "__proto__"],
    ["another prototype-pollution style value", "constructor"],
    ["a whitespace-only value", "   "],
  ];

  it.each(invalidValues)("sends nothing and holds no write key given %s", (_label, workspace) => {
    const config = resolveCustomerioConfig({
      CUSTOMERIO_ENABLED: "true",
      CUSTOMERIO_WORKSPACE: workspace,
      CUSTOMERIO_SAMPLE_WRITE_KEY: SAMPLE_KEY,
      CUSTOMERIO_CA_WRITE_KEY: CA_KEY,
      CUSTOMERIO_US_WRITE_KEY: US_KEY,
    });

    expect(config.enabled).toBe(false);
    expect(config.reason).toBe(CUSTOMERIO_REFUSALS.INVALID_WORKSPACE);
    expect(config.writeKey).toBeNull();
    expect(config.writeKey).not.toBe(SAMPLE_KEY);
    expect(config.writeKey).not.toBe(CA_KEY);
    expect(config.writeKey).not.toBe(US_KEY);
  });

  it("accepts exactly three workspace names and no others", () => {
    expect(CUSTOMERIO_WORKSPACES).toEqual(["sample", "ca", "us"]);
  });
});

describe("the account region is fixed", () => {
  it("always resolves the US Pipelines host and never an EU host", () => {
    const resolutions = [
      resolveCustomerioConfig({}),
      resolveCustomerioConfig({ CUSTOMERIO_ENABLED: "true", CUSTOMERIO_WORKSPACE: "prod" }),
      resolveCustomerioConfig(envWith({ CUSTOMERIO_WORKSPACE: "ca" })),
      resolveCustomerioConfig(
        envWith({ CUSTOMERIO_WORKSPACE: "ca", CUSTOMERIO_CA_WRITE_KEY: CA_KEY })
      ),
    ];

    expect(CUSTOMERIO_PIPELINES_HOST).toBe("https://cdp.customer.io");
    resolutions.forEach((config) => {
      expect(config.host).toBe("https://cdp.customer.io");
      expect(config.host).not.toContain("cdp-eu");
      expect(config.host).not.toContain("-eu.");
    });
  });
});

describe("the log-safe view of a resolution", () => {
  it("reports only that a write key was found and never the key itself", () => {
    const config = resolveCustomerioConfig(
      envWith({
        CUSTOMERIO_WORKSPACE: "ca",
        CUSTOMERIO_CA_WRITE_KEY: CA_KEY,
      })
    );

    const described = describeCustomerioConfig(config);

    expect(described).toEqual({
      enabled: true,
      workspace: "ca",
      has_write_key: true,
      reason: "ok",
    });
    expect(Object.keys(described).sort()).toEqual([
      "enabled",
      "has_write_key",
      "reason",
      "workspace",
    ]);
    expect(JSON.stringify(described)).not.toContain(CA_KEY);
  });

  it("still carries no key material for a refused resolution", () => {
    const described = describeCustomerioConfig(
      resolveCustomerioConfig(
        envWith({ CUSTOMERIO_WORKSPACE: "ca", CUSTOMERIO_SAMPLE_WRITE_KEY: SAMPLE_KEY })
      )
    );

    expect(described).toEqual({
      enabled: false,
      workspace: "ca",
      has_write_key: false,
      reason: CUSTOMERIO_REFUSALS.MISSING_WRITE_KEY,
    });
    expect(JSON.stringify(described)).not.toContain(SAMPLE_KEY);
  });

  it("survives being handed nothing at all", () => {
    expect(describeCustomerioConfig(undefined)).toEqual({
      enabled: false,
      workspace: null,
      has_write_key: false,
      reason: null,
    });
  });
});
