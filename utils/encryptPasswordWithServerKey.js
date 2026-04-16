const DEFAULT_CHECK_PRIVATE_KEY_URL = "/api/check-private-key";

/**
 * Client-side RSA public key (same PEM as server `RSA_PUBLIC_KEY`).
 * Must use the NEXT_PUBLIC_ prefix so Next.js inlines it into the browser bundle.
 */
function getPublicKeyPem(options = {}) {
    if (options.publicKey) return options.publicKey;
    return process.env.NEXT_PUBLIC_RSA_PUBLIC_KEY;
}

/**
 * Converts a PEM public key string to a CryptoKey using the Web Crypto API.
 * Uses RSA-OAEP with SHA-256 — compatible with Node.js crypto.privateDecrypt
 * using RSA_PKCS1_OAEP_PADDING + oaepHash: "sha256".
 */
async function importPublicKey(pem) {
    // Strip PEM headers/footers and decode base64 to binary
    const pemBody = pem
        .replace(/-----BEGIN PUBLIC KEY-----/, "")
        .replace(/-----END PUBLIC KEY-----/, "")
        .replace(/\s+/g, "");
    const binaryDer = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

    return crypto.subtle.importKey(
        "spki",
        binaryDer.buffer,
        {
            name: "RSA-OAEP",
            hash: "SHA-256",
        },
        false,
        ["encrypt"],
    );
}

/**
 * Encrypts the password with the RSA public key for the login API.
 * Uses RSA-OAEP (SHA-256) which is supported by all modern browsers and
 * is compatible with Node.js crypto.privateDecrypt RSA_PKCS1_OAEP_PADDING.
 *
 * @param {string} plainPassword
 * @param {{ publicKey?: string }} [options] - override key (e.g. tests)
 * @returns {Promise<{ encryptedPassword: string } | { error: true, statusText: string }>}
 */
export async function encryptPasswordWithServerKey(
    plainPassword,
    options = {},
) {
    const publicKeyPem = getPublicKeyPem(options);

    if (!publicKeyPem || typeof publicKeyPem !== "string") {
        return {
            error: true,
            statusText: "Missing NEXT_PUBLIC_RSA_PUBLIC_KEY",
        };
    }

    const checkPrivateKeyResponse = await fetch(DEFAULT_CHECK_PRIVATE_KEY_URL);
    const checkPrivateKeyData = await checkPrivateKeyResponse.json();
    if (!checkPrivateKeyData.thereIsPrivateKey) {
        return {
            error: true,
            statusText: "Private key not found",
        };
    }

    try {
        const publicKey = await importPublicKey(publicKeyPem);
        const encoded = new TextEncoder().encode(plainPassword);
        const encryptedBuffer = await crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            encoded,
        );
        const encryptedPassword = btoa(
            String.fromCharCode(...new Uint8Array(encryptedBuffer)),
        );
        return { encryptedPassword };
    } catch (err) {
        return {
            error: true,
            statusText: "Encryption failed: " + err.message,
        };
    }
}
