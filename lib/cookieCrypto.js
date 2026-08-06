// Server-only AES-256-GCM helper for encrypting cookie values / small payloads.
// Ported from the CA repo pattern (utils/userIdCookie.js, lib/offerCookie.js).
// The key comes from COOKIE_ENCRYPTION_KEY and never reaches the client bundle,
// because this module is imported only from server code (API routes / server
// utilities). Do NOT import it into a client component.

import crypto from "crypto";
import { logger } from "@/utils/devLogger";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const AUTH_TAG_LENGTH = 16;

let _devKeyWarned = false;

// Resolve the 32-byte key. A 64-hex-char env value is used as the raw key;
// anything else is hashed to 32 bytes. Hard-fails in production when missing so
// a misconfigured deploy never silently downgrades to plaintext.
function getEncryptionKey() {
  const raw = process.env.COOKIE_ENCRYPTION_KEY;

  if (raw && typeof raw === "string") {
    const trimmed = raw.trim();
    if (trimmed.length > 0) {
      if (/^[a-fA-F0-9]{64}$/.test(trimmed)) {
        return Buffer.from(trimmed, "hex");
      }
      return crypto.createHash("sha256").update(trimmed).digest();
    }
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "COOKIE_ENCRYPTION_KEY is missing. Set it in the production environment " +
        "before deploying."
    );
  }

  if (!_devKeyWarned) {
    logger.warn(
      "[cookieCrypto] COOKIE_ENCRYPTION_KEY not set; using dev-mode fallback " +
        "key. Set a real key before any production deploy."
    );
    _devKeyWarned = true;
  }
  return crypto
    .createHash("sha256")
    .update("rocky-us-dev-only-fallback-encryption-key")
    .digest();
}

// Encrypt a string. Returns base64url(iv | authTag | ciphertext).
export function encryptCookieValue(value) {
  const key = getEncryptionKey();
  const plain = String(value);

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return Buffer.concat([iv, authTag, encrypted]).toString("base64url");
}

// Decrypt a value produced by encryptCookieValue. Returns null if the input is
// missing, malformed, or fails the GCM authentication check (tamper-evident).
export function decryptCookieValue(encrypted) {
  if (!encrypted || typeof encrypted !== "string") return null;

  const key = getEncryptionKey();

  try {
    const buf = Buffer.from(encrypted, "base64url");
    if (buf.length < IV_LENGTH + AUTH_TAG_LENGTH) return null;

    const iv = buf.subarray(0, IV_LENGTH);
    const authTag = buf.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
    const ciphertext = buf.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
      authTagLength: AUTH_TAG_LENGTH,
    });
    decipher.setAuthTag(authTag);

    return decipher.update(ciphertext) + decipher.final("utf8");
  } catch {
    return null;
  }
}
