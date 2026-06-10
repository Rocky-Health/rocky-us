import crypto from 'crypto';
import { normalizeEmail, normalizePhone } from './normalize';

// Re-export so any file that imports normalizeEmail / normalizePhone from
// this module continues to work without changes.
export { normalizeEmail, normalizePhone };

export const hashSHA256 = (text) => {
  if (!text || typeof text !== 'string') return '';
  return crypto
    .createHash('sha256')
    .update(text.toLowerCase().trim())
    .digest('hex');
};

export const hashEmail = (email) => {
  const normalized = normalizeEmail(email);
  if (!normalized) return '';
  return hashSHA256(normalized);
};

export const hashPhone = (phone, defaultCountry = 'CA') => {
  const normalized = normalizePhone(phone, defaultCountry);
  if (!normalized) return '';
  return hashSHA256(normalized);
};
