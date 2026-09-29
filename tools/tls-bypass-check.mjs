#!/usr/bin/env node
/**
 * TLS verification bypass check (TK-1044).
 *
 * Run by `npm run check:tls` and by the vitest suite, so CI cannot drift from
 * what a developer sees locally.
 *
 * Every questionnaire route used to build its axios client with
 * `new https.Agent({ rejectUnauthorized: false })`, which accepts any
 * certificate from any host. These routes carry PHI to the CRM, so a bypass
 * here means questionnaire answers can be read or altered by anything that can
 * intercept the connection. It spread by copy-paste across twelve files;
 * this check exists so it cannot spread back.
 *
 * What fails:
 *   - `rejectUnauthorized` set to anything but a literal `true`. Matching on
 *     "not true" rather than "is false" is deliberate: it also catches the
 *     environment-conditional form, which disables verification wherever the
 *     flag happens to be off.
 *   - any use of NODE_TLS_REJECT_UNAUTHORIZED, which turns verification off
 *     process-wide.
 *   - any `checkServerIdentity` override, the usual way hostname verification
 *     gets neutered while the certificate chain still validates.
 *   - `strictSSL` set to anything but a literal `true`.
 *
 * If an upstream ever presents a certificate Node rejects, fix the upstream
 * chain. Do not add an exemption here.
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const DEFAULT_ROOTS = [
  "app",
  "components",
  "config",
  "lib",
  "pages",
  "scripts",
  "tools",
  "utils",
  "instrumentation.js",
  "middleware.js",
  "next.config.mjs",
];

const SKIP_DIRS = new Set([
  "node_modules",
  ".next",
  ".git",
  "coverage",
  "dist",
  "build",
  "out",
]);

const SOURCE_FILE = /\.(js|jsx|mjs|cjs|ts|tsx)$/;

// This checker and its test have to contain the literal patterns to search for
// and to prove they fail. Nothing else is exempt.
const DEFAULT_EXEMPT = [
  "tools/tls-bypass-check.mjs",
  "tools/__tests__/tlsBypassCheck.test.js",
];

const RULES = [
  {
    id: "rejectUnauthorized",
    test: (line) =>
      /rejectUnauthorized/.test(line) &&
      !/rejectUnauthorized\s*:\s*true\b/.test(line),
    message: "rejectUnauthorized must be true or absent",
  },
  {
    id: "NODE_TLS_REJECT_UNAUTHORIZED",
    test: (line) => /NODE_TLS_REJECT_UNAUTHORIZED/.test(line),
    message: "NODE_TLS_REJECT_UNAUTHORIZED disables verification process-wide",
  },
  {
    id: "checkServerIdentity",
    test: (line) => /checkServerIdentity/.test(line),
    message: "checkServerIdentity overrides hostname verification",
  },
  {
    id: "strictSSL",
    test: (line) =>
      /strictSSL/.test(line) && !/strictSSL\s*:\s*true\b/.test(line),
    message: "strictSSL must be true or absent",
  },
];

/** Every source file under a root, which may itself be a single file. */
function collectFiles(repoRoot, root) {
  const absolute = join(repoRoot, root);
  let entry;
  try {
    entry = statSync(absolute);
  } catch {
    return [];
  }
  if (entry.isFile()) return SOURCE_FILE.test(absolute) ? [absolute] : [];

  const files = [];
  for (const child of readdirSync(absolute, { withFileTypes: true })) {
    if (child.isDirectory()) {
      if (SKIP_DIRS.has(child.name)) continue;
      files.push(...collectFiles(repoRoot, join(root, child.name)));
    } else if (SOURCE_FILE.test(child.name)) {
      files.push(join(absolute, child.name));
    }
  }
  return files;
}

export function runTlsBypassCheck(options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const roots = options.roots ?? DEFAULT_ROOTS;
  const exempt = new Set(options.exempt ?? DEFAULT_EXEMPT);

  const failures = [];
  const scanned = [];

  for (const root of roots) {
    for (const file of collectFiles(repoRoot, root)) {
      const path = relative(repoRoot, file).split(sep).join("/");
      if (exempt.has(path)) continue;
      scanned.push(path);

      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, index) => {
        for (const rule of RULES) {
          if (rule.test(line)) {
            failures.push(`${path}:${index + 1} ${rule.message}: ${line.trim()}`);
          }
        }
      });
    }
  }

  return { failures, scanned };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  const { failures, scanned } = runTlsBypassCheck();
  for (const failure of failures) console.error(`error ${failure}`);
  if (failures.length) {
    console.error(
      `\nTLS bypass check failed: ${failures.length} problem(s). Fix the upstream certificate chain instead of disabling verification.`,
    );
    process.exit(1);
  }
  console.log(`TLS bypass check passed: ${scanned.length} file(s) scanned.`);
}
