import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { runTlsBypassCheck } from "@/tools/tls-bypass-check.mjs";

/**
 * The TLS bypass check, proven by injected defects (TK-1044).
 *
 * A checker that never fails is indistinguishable from one that passes
 * everything, so every case below writes a real bypass into a temporary tree
 * and asserts the real exported function rejects it.
 */

const temporaryDirs = [];

/** A throwaway repo root containing one source file. */
function repoWith(relativePath, source) {
  const dir = mkdtempSync(join(tmpdir(), "rocky-tls-"));
  temporaryDirs.push(dir);
  const file = join(dir, relativePath);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, source);
  return dir;
}

afterEach(() => {
  while (temporaryDirs.length) {
    rmSync(temporaryDirs.pop(), { recursive: true, force: true });
  }
});

describe("insecure agents", () => {
  it("fails on the copy-pasted questionnaire agent", () => {
    // The exact shape TK-1044 removed from fourteen files.
    const repoRoot = repoWith(
      "app/api/thing/route.js",
      [
        'import https from "https";',
        "const crmApi = axios.create({",
        '  baseURL: "https://api.myrocky.ca/api",',
        "  httpsAgent: new https.Agent({",
        "    rejectUnauthorized: false,",
        "  }),",
        "});",
      ].join("\n"),
    );

    const { failures } = runTlsBypassCheck({ repoRoot });

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("app/api/thing/route.js:5");
    expect(failures[0]).toContain("rejectUnauthorized must be true or absent");
  });

  it("fails on the environment-conditional form", () => {
    // Verification off wherever the flag is off, which is the reintroduction
    // most likely to read as deliberate and get waved through.
    const repoRoot = repoWith(
      "lib/client.js",
      "const agent = new https.Agent({ rejectUnauthorized: isProd });",
    );

    const { failures } = runTlsBypassCheck({ repoRoot });

    expect(failures).toHaveLength(1);
  });

  it("accepts an explicit rejectUnauthorized: true", () => {
    const repoRoot = repoWith(
      "lib/client.js",
      "const agent = new https.Agent({ rejectUnauthorized: true });",
    );

    expect(runTlsBypassCheck({ repoRoot }).failures).toEqual([]);
  });
});

describe("the other ways verification gets turned off", () => {
  it("fails on NODE_TLS_REJECT_UNAUTHORIZED", () => {
    const repoRoot = repoWith(
      "instrumentation.js",
      'process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";',
    );

    const { failures } = runTlsBypassCheck({ repoRoot });

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("process-wide");
  });

  it("fails on a checkServerIdentity override", () => {
    // Chain still validates, hostname no longer does.
    const repoRoot = repoWith(
      "utils/api.js",
      "const agent = new https.Agent({ checkServerIdentity: () => undefined });",
    );

    const { failures } = runTlsBypassCheck({ repoRoot });

    expect(failures).toHaveLength(1);
    expect(failures[0]).toContain("hostname verification");
  });

  it("fails on strictSSL: false but accepts strictSSL: true", () => {
    const bad = repoWith("lib/legacy.js", "request({ strictSSL: false });");
    const good = repoWith("lib/legacy.js", "request({ strictSSL: true });");

    expect(runTlsBypassCheck({ repoRoot: bad }).failures).toHaveLength(1);
    expect(runTlsBypassCheck({ repoRoot: good }).failures).toEqual([]);
  });
});

describe("scope", () => {
  it("ignores files that are not source", () => {
    const repoRoot = repoWith("docs/notes.md", "rejectUnauthorized: false");

    expect(runTlsBypassCheck({ repoRoot }).failures).toEqual([]);
  });

  it("passes clean against the real repository state", () => {
    // What `npm run check:tls` executes.
    const { failures, scanned } = runTlsBypassCheck();

    expect(failures).toEqual([]);
    expect(scanned.length).toBeGreaterThan(0);
  });
});
