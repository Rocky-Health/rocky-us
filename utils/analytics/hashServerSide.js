import crypto from 'crypto';

export const hashSHA256 = (text) => {
  if (!text || typeof text !== 'string') return '';
  return crypto
    .createHash('sha256')
    .update(text.toLowerCase().trim())
    .digest('hex');
};

export const normalizeEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase().replace(/\s+/g, '');
};

export const normalizePhone = (phone, defaultCountry = 'CA') => {
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

