/**
 * Platform-neutral normalizers for Meta Pixel advanced matching.
 * No Node.js crypto, no browser APIs — safe to import on server or client.
 * Logic is byte-for-byte identical to hashServerSide.js so client and server
 * produce the same pre-hash input, guaranteeing reconcilable identity.
 */

/**
 * Normalize an email address for SHA-256 hashing.
 * Trim → lowercase → strip all internal whitespace.
 * @param {string} email
 * @returns {string}
 */
export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase().replace(/\s+/g, '');
};

/**
 * Normalize a phone number to E.164-ish format for SHA-256 hashing.
 * Mirrors hashServerSide.js normalizePhone exactly.
 *
 * Rules:
 * - Already starts with '+': keep '+' and strip non-digits after it
 * - North America (CA / US / USA): 10 digits → +1XXXXXXXXXX,
 *   11 digits starting with 1 → +<digits>
 * - Otherwise 8–15 digits → +<digits>
 * - Anything else → ''
 *
 * @param {string} phone
 * @param {string} defaultCountry  ISO country code, defaults to 'US'
 * @returns {string}
 */
export const normalizePhone = (phone, defaultCountry = 'US') => {
  if (!phone || typeof phone !== 'string') return '';

  const trimmed = phone.trim();

  if (trimmed.startsWith('+')) {
    const digits = trimmed.replace(/[^\d]/g, '');
    return `+${digits}`;
  }

  const digitsOnly = trimmed.replace(/\D/g, '');

  const isNorthAmerica = ['CA', 'US', 'USA'].includes(
    (defaultCountry || '').toUpperCase()
  );

  if (isNorthAmerica) {
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    }
    if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+${digitsOnly}`;
    }
  }

  if (digitsOnly.length >= 8 && digitsOnly.length <= 15) {
    return `+${digitsOnly}`;
  }

  return '';
};
