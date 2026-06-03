/**
 * Logger utility.
 *
 * - Browser: logs only in development; SILENT in production (no ?debug hatch).
 * - Server: logs (→ Vercel), toggleable via SERVER_LOGS_ENABLED (default ON;
 *   set "false" to silence). This is the single place to read logs in prod.
 * - Every argument is passed through redactSensitive() so credentials/PII are
 *   masked in whatever reaches the console (browser dev console OR Vercel).
 *
 * IMPORTANT: redaction is LOG-ONLY and non-mutating. It returns a deep copy for
 * the console call and never alters the original objects, so it has zero effect
 * on data sent to APIs / CRM / CAPI tracking (which send hashed PII separately).
 */

const isServer = typeof window === "undefined";
const isDevelopment = process.env.NODE_ENV === "development";

// Server-side logging toggle for Vercel. Default ON; set SERVER_LOGS_ENABLED="false" to silence.
const serverLogsEnabled = () => (process.env.SERVER_LOGS_ENABLED ?? "true") !== "false";

// Browser: dev only (silent in prod). Server: gated by the Vercel toggle.
const shouldLog = () => (isServer ? serverLogsEnabled() : isDevelopment);

/**
 * Keys whose values must never be logged in plain text.
 * NOTE: deliberately does NOT include the hashed CAPI short-keys (em, ph, fn,
 * ln, db, zp, ct, st, country) — those are already hashed/pseudonymous and are
 * the tracking payload fields; masking them adds no compliance value and would
 * make CAPI debug logs useless.
 */
const SENSITIVE_KEYS = new Set([
  // credentials
  "password",
  "confirm_password",
  "encryptedpassword",
  "authtoken",
  "auth_token",
  "token",
  "key",
  "apikey",
  "api_key",
  "secret",
  "credentials",
  "authorization",
  // raw PII
  "email",
  "phone",
  "first_name",
  "last_name",
  "full_name",
  "address_1",
  "address_2",
  "postcode",
  "zip",
  "date_of_birth",
  "dob",
  "birthdate",
]);

function isSensitiveKey(key) {
  const k = String(key).toLowerCase();
  return SENSITIVE_KEYS.has(k) || k.includes("password") || k.includes("secret");
}

/**
 * Returns a deep copy of obj with sensitive field values replaced by "***".
 * Non-mutating. Safe to call on anything before logging.
 */
export function redactSensitive(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitive(item));
  }
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    out[key] = isSensitiveKey(key) ? "***" : redactSensitive(value);
  }
  return out;
}

const emit = (consoleMethod, label, args) => {
  if (!shouldLog()) return;
  console[consoleMethod](label, ...args.map((a) => redactSensitive(a)));
};

export const logger = {
  log: (...args) => emit("log", "[LOG]", args),
  error: (...args) => emit("error", "[ERROR]", args),
  warn: (...args) => emit("warn", "[WARN]", args),
  info: (...args) => emit("info", "[INFO]", args),
  debug: (...args) => emit("log", "[DEBUG]", args),
};

// Convenience functions
export const debug = logger.debug;
