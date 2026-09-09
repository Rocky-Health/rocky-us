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
 * NOTE: also deliberately does NOT include customer_id. The canonical
 * Northbeam customer id is wc:{wooUserId} when WooCommerce has a user (an
 * internal identifier, not PII), falling back to email:{address} or
 * phone:{digits} when it does not. A blunt redact would destroy the
 * debuggable wc: form, so customer_id is masked prefix-preserving by
 * maskCustomerId below instead of being listed here: everything up to and
 * including the first colon is kept, and only the remainder is replaced.
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
  "customer_email",
  "customer_phone_number",
  "customer_phone",
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
 * Masks a canonical Northbeam customer id (wc:{id}, email:{address} or
 * phone:{digits}). The wc: namespace is an internal WooCommerce user id, not
 * PII, so it passes through unchanged; every other namespace keeps its
 * prefix up to and including the first ":" and has the remainder replaced
 * with the same redaction marker used elsewhere in this file.
 * A number is left as is (not PII in this field); anything else that is not
 * a string falls back to the blanket redaction marker.
 */
function maskCustomerId(value) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return "***";
  const colonIndex = value.indexOf(":");
  if (colonIndex === -1) return "***";
  const namespace = value.slice(0, colonIndex).toLowerCase();
  if (namespace === "wc") return value;
  return `${value.slice(0, colonIndex + 1)}***`;
}

/**
 * Returns a deep copy of obj with sensitive field values replaced by "***".
 * Non-mutating. Safe to call on anything before logging.
 */
export function redactSensitive(obj, _seen) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  // Guard against circular references (e.g. axios error objects) so logging
  // one can never overflow the stack.
  const seen = _seen || new WeakSet();
  if (seen.has(obj)) return "[Circular]";
  seen.add(obj);
  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitive(item, seen));
  }
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const k = String(key).toLowerCase();
    if (k === "customer_id") {
      out[key] = maskCustomerId(value);
    } else if (isSensitiveKey(key)) {
      out[key] = "***";
    } else {
      out[key] = redactSensitive(value, seen);
    }
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
