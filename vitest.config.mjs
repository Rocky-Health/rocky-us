import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";

const repoRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  resolve: {
    // Mirrors the "@/*" -> "./*" mapping in jsconfig.json so imports resolve the same way
    // under vitest as they do under Next.
    alias: [{ find: /^@\//, replacement: `${repoRoot}` }],
  },
  test: {
    // Scoped to the Customer.io suite on purpose. One unit test file predates this change and
    // cannot run as written: utils/__tests__/zonnicQuebecValidation.test.js expects jest
    // globals, and package-lock.json still carries orphan jest entries that are not in
    // package.json and not on disk. Rescuing it is not this change's job, so it stays out of
    // the include list rather than being left to fail the run.
    include: ["lib/customerio/__tests__/**/*.test.js"],
    environment: "node",
  },
});
