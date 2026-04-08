"use client";

import { sha256Hex } from "@/utils/analytics/hash";

const LS_HASH_KEY = "quiz_password_hash_v1";
const LS_ENCRYPTED_KEY = "quiz_password_encrypted_v1";
const SS_AES_KEY = "quiz_password_aes_key_v1";

const toBase64 = (bytes) => btoa(String.fromCharCode(...bytes));
const fromBase64 = (str) => Uint8Array.from(atob(str), (c) => c.charCodeAt(0));

const getOrCreateSessionKey = () => {
  if (typeof window === "undefined") return null;
  let encoded = sessionStorage.getItem(SS_AES_KEY);
  if (!encoded) {
    const raw = crypto.getRandomValues(new Uint8Array(32));
    encoded = toBase64(raw);
    sessionStorage.setItem(SS_AES_KEY, encoded);
  }
  return fromBase64(encoded);
};

const importAesKey = async () => {
  const raw = getOrCreateSessionKey();
  if (!raw) return null;
  return crypto.subtle.importKey("raw", raw, "AES-GCM", false, [
    "encrypt",
    "decrypt",
  ]);
};

export const storePasswordSecurely = async (plainPassword) => {
  if (typeof window === "undefined") return;

  if (!plainPassword || typeof plainPassword !== "string") {
    clearStoredPasswordSecurely();
    return;
  }

  try {
    const hash = await sha256Hex(plainPassword);
    if (hash) localStorage.setItem(LS_HASH_KEY, hash);

    const key = await importAesKey();
    if (!key) return;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(plainPassword);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      data
    );
    const encrypted = new Uint8Array(encryptedBuffer);
    const payload = new Uint8Array(iv.length + encrypted.length);
    payload.set(iv, 0);
    payload.set(encrypted, iv.length);
    localStorage.setItem(LS_ENCRYPTED_KEY, toBase64(payload));
  } catch {
    // Intentionally silent: do not block user path if vault fails
  }
};

export const restorePasswordSecurely = async () => {
  if (typeof window === "undefined") return "";
  const encoded = localStorage.getItem(LS_ENCRYPTED_KEY);
  if (!encoded) return "";

  try {
    const key = await importAesKey();
    if (!key) return "";
    const payload = fromBase64(encoded);
    if (payload.length <= 12) return "";
    const iv = payload.slice(0, 12);
    const ciphertext = payload.slice(12);
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return "";
  }
};

export const clearStoredPasswordSecurely = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_HASH_KEY);
  localStorage.removeItem(LS_ENCRYPTED_KEY);
  sessionStorage.removeItem(SS_AES_KEY);
};
