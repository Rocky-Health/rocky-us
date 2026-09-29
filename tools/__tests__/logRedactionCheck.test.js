import { describe, expect, it } from "vitest";

import { runLogRedactionCheck } from "../log-redaction-check.mjs";

// Mirrors lib/i18n/__tests__/i18nCheck.test.js: the suite runs the same
// exported function the npm script runs, so a guard cannot pass locally and
// fail in review, or the reverse.
describe("log redaction check", () => {
  it("passes clean against the real repository state", () => {
    const { failures } = runLogRedactionCheck();
    expect(failures).toEqual([]);
  });

  it("scans the repository rather than a fixture", () => {
    const { filesScanned } = runLogRedactionCheck();
    expect(filesScanned).toBeGreaterThan(500);
  });
});
