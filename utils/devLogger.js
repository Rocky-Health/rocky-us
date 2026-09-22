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
 * NOTE: also deliberately does NOT include customer_id or any of the
 * customer_id* family. The canonical Northbeam customer id is wc:{wooUserId}
 * when WooCommerce has a user (an internal identifier, not PII), falling back
 * to email:{address} or phone:{digits} when it does not. A blunt redact would
 * destroy the debuggable wc: form, so that whole family is masked
 * prefix-preserving by maskCustomerId below instead of being listed here:
 * everything up to and including the first colon is kept, and only the
 * remainder is replaced. See isCanonicalCustomerIdKey for which keys qualify
 * and for the one namespace-only key that is excluded.
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

/**
 * Substring families that carry raw PII under whatever prefix or suffix a call
 * site invents. TK-1071 was fixed twice by adding the one exact key QA had just
 * found, `customer_id_canonical` and then `phone_number`, and failed QA twice
 * for the same reason: an exact-name list only ever covers the names somebody
 * has already been bitten by. Matching the family covers the variant nobody has
 * written yet, which is the argument isCanonicalCustomerIdKey already makes for
 * the customer_id family.
 *
 * The hashed CAPI short keys (em, ph, fn, ln, db, zp, ct, st) contain none of
 * these substrings and stay readable as intended, and so does
 * `customer_id_namespace`.
 */
const SENSITIVE_KEY_SUBSTRINGS = [
  "password",
  "secret",
  "phone",
  "email",
  // TK-1046. Each family below was observed leaking under a name the exact
  // list did not carry: access_token / refresh_token / id_token / wl_token /
  // jobToken, sessionId / session_id, billing_address_1 and ipAddress beside a
  // masked address_1, billing_postcode beside a masked postcode, dateOfBirth
  // beside a masked date_of_birth, and the *_entrykey family.
  "token",
  "session",
  "address",
  "postal",
  "postcode",
  "birth",
  "entrykey",
  "nonce",
];

/**
 * Name fragments rather than a bare "name" family on purpose:
 * "customer_id_namespace" contains "name", and that key is logged deliberately
 * so the namespace survives when the raw id does not. None of the fragments
 * below occurs inside it.
 *
 * These are substrings, not exact names, because an exact list left
 * billing_first_name and shipping_last_name printing in clear beside a masked
 * first_name in the same log object. The hashed CAPI short keys (fn, ln)
 * contain none of these and stay readable.
 */
const NAME_KEY_SUBSTRINGS = [
  "first_name",
  "firstname",
  "last_name",
  "lastname",
  "full_name",
  "fullname",
  "fname",
  "lname",
  "username",
  "displayname",
  "patientname",
  "customername",
];

function isSensitiveKey(key) {
  const k = String(key).toLowerCase();
  if (SENSITIVE_KEYS.has(k)) return true;
  if (NAME_KEY_SUBSTRINGS.some((fragment) => k.includes(fragment))) return true;
  return SENSITIVE_KEY_SUBSTRINGS.some((fragment) => k.includes(fragment));
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
 * Keys that hold ONLY a namespace and never the value behind it, so they carry
 * no PII and must NOT go through maskCustomerId: that function answers "***"
 * for a value with no colon, which would erase the diagnostic these keys exist
 * to provide. `customer_id_namespace` is logged deliberately by both orders
 * routes precisely so the namespace survives when the raw id does not.
 */
const CUSTOMER_ID_NAMESPACE_ONLY_KEYS = new Set(["customer_id_namespace"]);

/**
 * True for any key carrying a canonical Northbeam customer id, not just the
 * exact `customer_id`.
 *
 * The original TK-1071 pass matched `customer_id` exactly, which left
 * `customer_id_canonical` printing in plain text even though it holds the same
 * value: `analyticsService` logs both keys in the SAME object on the purchase
 * path, so the identical address was masked under one name and printed under
 * the other. Matching the whole `customer_id*` family closes that and also
 * catches the next variant somebody adds, which an exact-match list cannot.
 *
 * The namespace-only keys above are excluded by name rather than by pattern,
 * because "holds a namespace" is not something the key string can express.
 */
function isCanonicalCustomerIdKey(key) {
  const k = String(key).toLowerCase();
  if (CUSTOMER_ID_NAMESPACE_ONLY_KEYS.has(k)) return false;
  return k.startsWith("customer_id");
}

/**
 * WooCommerce meta_data is an array of { key, value } pairs, so the field name
 * lives in the VALUE of `key` and the secret lives in `value`. The generic walk
 * reads that backwards: the literal property `key` is itself a credential name
 * in SENSITIVE_KEYS, so it masked the harmless field name and printed the phone
 * beside it, giving { key: "***", value: "+1555..." }. Decide from the field
 * name instead, and keep that name readable, since it is schema and not PII.
 *
 * Both properties must be present. An ordinary object that merely carries a
 * `key` is still a credential and keeps its blanket redaction.
 */
function isMetaDataEntry(obj) {
  return typeof obj.key === "string" && "value" in obj;
}

function redactMetaDataEntry(entry, seen) {
  const name = entry.key;
  let redactedValue;
  if (isCanonicalCustomerIdKey(name)) {
    redactedValue = maskCustomerId(entry.value);
  } else if (isSensitiveKey(name)) {
    redactedValue = typeof entry.value === "boolean" ? entry.value : "***";
  } else {
    redactedValue = redactSensitive(entry.value, seen);
  }

  // Woo echoes entries back with an id, so anything else walks normally.
  const out = {};
  for (const [k, v] of Object.entries(entry)) {
    if (k === "key") out[k] = name;
    else if (k === "value") out[k] = redactedValue;
    else out[k] = redactSensitive(v, seen);
  }
  return out;
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
  if (isMetaDataEntry(obj)) {
    return redactMetaDataEntry(obj, seen);
  }
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    if (isCanonicalCustomerIdKey(key)) {
      out[key] = maskCustomerId(value);
    } else if (isSensitiveKey(key)) {
      // A boolean is never PII, so a family key match must not eat a flag.
      out[key] = typeof value === "boolean" ? value : "***";
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
