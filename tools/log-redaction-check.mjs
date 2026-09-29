#!/usr/bin/env node
/**
 * Log redaction check (TK-1046).
 *
 * Run by `npm run logs:check` and by the vitest suite, so CI cannot drift from
 * what a developer sees locally.
 *
 * What it reports, and why each one matters:
 *
 *   1. JSON.stringify(x) inside a logger.* or console.* call, where x is not
 *      passed through redactSensitive first. The logger receives a finished
 *      string, redactSensitive returns non-objects untouched, and every key in
 *      the payload prints in clear. This is the defect that failed TK-1071's QA
 *      twice: the call looks redacted and is not.
 *
 *   2. Raw console.* under app/api/**. The server logger is gated by
 *      SERVER_LOGS_ENABLED and passes every argument through redactSensitive;
 *      a bare console call does neither, so it reaches Vercel production logs
 *      unmasked.
 *
 * The scanner is deliberately paren-balanced rather than line based. In
 * rocky-us 14 of 37 offending sites are formatted across several lines, so a
 * single-line grep reports a repo clean when it is not.
 *
 * ALLOWLIST: utils/devLogger.js is the logger itself, and the two console
 * calls in utils/tiktokPixelGuard.js live inside an injected inline-script
 * string where the module logger is not in scope.
 */

import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_EXTENSIONS = new Set([".js", ".jsx"]);
const SKIP_DIRECTORIES = new Set([
  "node_modules",
  ".next",
  ".git",
  "public",
  "coverage",
]);

// Files exempt from the raw-console rule, with the reason each one needs it.
const CONSOLE_ALLOWLIST = new Set([
  "utils/devLogger.js",
  "utils/tiktokPixelGuard.js",
]);

const LOG_CALL = /\b(?:logger|console)\.(?:log|error|warn|info|debug|trace)\s*\(/g;
const STRINGIFY = /JSON\.stringify\s*\(/g;
// Helpers that already mask before stringifying.
const REDACTORS = /redactSensitive|maskPaymentDataInObject|safeStringifyForLogging/;

function listSourceFiles(dir, found = []) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRECTORIES.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      listSourceFiles(full, found);
      continue;
    }
    const dot = entry.lastIndexOf(".");
    if (dot !== -1 && SOURCE_EXTENSIONS.has(entry.slice(dot))) found.push(full);
  }
  return found;
}

/**
 * Returns the index just past the ")" that closes the "(" at openIndex - 1,
 * so callers get the argument list without its brackets.
 */
function findCloseParen(source, openIndex) {
  let depth = 1;
  let i = openIndex;
  while (i < source.length && depth > 0) {
    const ch = source[i];
    if (ch === "(") depth += 1;
    else if (ch === ")") depth -= 1;
    i += 1;
  }
  return i;
}

function lineOf(source, index) {
  return source.slice(0, index).split("\n").length;
}

function checkFile(absolutePath) {
  const relativePath = relative(REPO_ROOT, absolutePath).split(sep).join("/");
  const source = readFileSync(absolutePath, "utf8");
  const failures = [];

  LOG_CALL.lastIndex = 0;
  let match;
  while ((match = LOG_CALL.exec(source)) !== null) {
    const argsStart = match.index + match[0].length;
    const argsEnd = findCloseParen(source, argsStart) - 1;
    const args = source.slice(argsStart, argsEnd);
    if (!args.includes("JSON.stringify")) continue;

    STRINGIFY.lastIndex = 0;
    let stringify;
    while ((stringify = STRINGIFY.exec(args)) !== null) {
      const innerStart = stringify.index + stringify[0].length;
      const innerEnd = findCloseParen(args, innerStart) - 1;
      if (!REDACTORS.test(args.slice(innerStart, innerEnd))) {
        failures.push(
          `${relativePath}:${lineOf(source, match.index)} JSON.stringify inside a log call is not redacted; ` +
            `use JSON.stringify(redactSensitive(x), null, 2)`,
        );
        break;
      }
    }
  }

  if (relativePath.startsWith("app/api/") && !CONSOLE_ALLOWLIST.has(relativePath)) {
    const consoleCall = /\bconsole\.(?:log|error|warn|info|debug|trace)\s*\(/g;
    let raw;
    while ((raw = consoleCall.exec(source)) !== null) {
      failures.push(
        `${relativePath}:${lineOf(source, raw.index)} raw console.* in a server route bypasses redaction; ` +
          `use logger from @/utils/devLogger`,
      );
    }
  }

  return failures;
}

export function runLogRedactionCheck() {
  const files = listSourceFiles(REPO_ROOT);
  const failures = files.flatMap(checkFile);
  return { failures, filesScanned: files.length };
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop())) {
  // Node reparses these ESM-syntax .mjs modules against a package with no
  // "type": "module". Expected here, and the warning is noise.
  process.removeAllListeners("warning");
  process.on("warning", (warning) => {
    if (warning.code !== "MODULE_TYPELESS_PACKAGE_JSON") console.warn(warning);
  });

  const { failures, filesScanned } = runLogRedactionCheck();
  for (const failure of failures) console.error(`error ${failure}`);
  if (failures.length) {
    console.error(`\nlog redaction check failed: ${failures.length} problem(s).`);
    process.exit(1);
  }
  console.log(`log redaction check passed: ${filesScanned} file(s) scanned.`);
}
