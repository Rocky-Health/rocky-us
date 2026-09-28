/**
 * Every place this repo already carries a guest across the sign-in boundary (the same
 * migrateLocalCartToServer call sites that move the local cart to the server) must also tell
 * Customer.io that the anonymous session now belongs to the profile the auth cookies resolve
 * to, so the anonymous event merge can attach whatever that session did as a guest.
 *
 * This is a source scan, not a render test: it reads each file from disk and checks two things
 * per file, the same way the client-bundle-boundary test in events.test.js does. The call must
 * exist, and it must never be awaited, because an awaited identify could stall or fail the
 * login or registration it rides along with, which this integration must never be allowed to
 * do.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = fileURLToPath(new URL("../../..", import.meta.url));

const readSource = (relativePath) => readFileSync(`${repoRoot}${relativePath}`, "utf8");

/**
 * Every occurrence of `identifyCustomerioProfile(` in the file, with the token immediately
 * before it, so a call preceded by `await` is distinguishable from a fire-and-forget one.
 */
const findCalls = (source) => {
  const calls = [];
  const pattern = /identifyCustomerioProfile\s*\(/g;
  let match;
  while ((match = pattern.exec(source))) {
    const before = source.slice(0, match.index);
    const precedingWord = before.match(/(\S+)\s*$/)?.[1] || "";
    calls.push({ awaited: precedingWord === "await" });
  }
  return calls;
};

// One entry per file that must call the browser helper, with the exact number of
// fire-and-forget call sites expected.
const AUTH_SUCCESS_FILES = [
  { path: "components/LoginRegisterPage/Login.jsx", calls: 2 }, // Google login, email login
  { path: "components/LoginRegisterPage/Register.jsx", calls: 1 }, // email registration
  {
    path: "components/WLPreConsultationQuizV2/Glp2PreConsultation/components/Glp2ContactAuthStep.jsx",
    calls: 1,
  }, // unified existing-account login / new-account registration
  {
    path: "components/WLPreConsultationQuizV2/NadPlusQuiz/components/Glp2ContactAuthStep.jsx",
    calls: 1,
  },
  {
    path: "components/WLPreConsultationQuizV2/Glp1Pre/components/Glp1ContactAuthStep.jsx",
    calls: 1,
  },
  {
    path: "components/WLPreConsultationQuizV2/Glp1PreConsultation3/components/Glp2ContactAuthStep.jsx",
    calls: 1,
  },
  {
    path: "components/WLPreConsultationQuizV2/components/WeightLossResultPasswordPopup.jsx",
    calls: 1,
  }, // existing-account password login mid-quiz
];

describe("every existing auth-success point also identifies the session to Customer.io", () => {
  it.each(AUTH_SUCCESS_FILES)(
    "calls identifyCustomerioProfile() the expected number of times, none of them awaited: %s",
    ({ path, calls: expectedCalls }) => {
      const source = readSource(path);
      const calls = findCalls(source);

      expect(calls, `${path} must call identifyCustomerioProfile()`).toHaveLength(expectedCalls);
      calls.forEach((call, index) => {
        expect(
          call.awaited,
          `${path}: call #${index + 1} to identifyCustomerioProfile() must not be awaited`,
        ).toBe(false);
      });
    },
  );

  it.each(AUTH_SUCCESS_FILES)("imports the browser helper it calls: %s", ({ path }) => {
    const source = readSource(path);

    expect(source).toContain('from "@/utils/customerioEvents"');
  });
});
