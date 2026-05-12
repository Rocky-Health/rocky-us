/**
 * Price formatting utility
 * Formats prices to show 2 decimal places only when the price has decimal values
 * Examples:
 * - 29.1 -> 29.10
 * - 29.0 -> 29
 * - 29 -> 29
 * - 29.99 -> 29.99
 */

export const formatPrice = (price) => {
  if (price === null || price === undefined || price === '') {
    return '0';
  }

  // Convert to number if it's a string
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  // Check if it's a valid number
  if (isNaN(numPrice)) {
    return '0';
  }

  // Check if the price has decimal places
  const hasDecimals = numPrice % 1 !== 0;
  
  // If it has decimals, show 2 decimal places, otherwise show as integer
  return hasDecimals ? numPrice.toFixed(2) : numPrice.toString();
};

/**
 * Format price with currency symbol
 * @param {number|string} price - The price to format
 * @param {string} currencySymbol - The currency symbol (default: '$')
 * @returns {string} Formatted price with currency symbol
 */
export const formatPriceWithCurrency = (price, currencySymbol = '$') => {
  return `${currencySymbol}${formatPrice(price)}`;
};

/**
 * Format price for display in components
 * Handles both regular prices and prices that need to be divided by 100 (cents)
 * @param {number|string} price - The price to format
 * @param {boolean} isInCents - Whether the price is in cents and needs to be divided by 100
 * @param {string} currencySymbol - The currency symbol (default: '$')
 * @returns {string} Formatted price with currency symbol
 */
export const formatDisplayPrice = (price, isInCents = false, currencySymbol = '$') => {
  const actualPrice = isInCents ? price / 100 : price;
  return formatPriceWithCurrency(actualPrice, currencySymbol);
};

/**
 * Round a numeric value to exactly 2 decimal places (standard currency precision).
 * Avoids IEEE 754 floating-point artifacts like 1608.800000000000002.
 * @param {number|string} n - The value to round
 * @returns {number} Value rounded to 2 decimal places
 */
export const toMoney = (n) => {
  const num = typeof n === 'string' ? parseFloat(n) : n;
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
};

/**
 * Format price for UI (product cards, quizzes, cart).
 * Strips trailing ".00" from whole-number prices so $249.00 renders as $249.
 * Fractional prices keep exactly 2 decimal places (e.g. $29.99 → "29.99").
 * Accepts number or numeric string. Strips leading "$" and commas.
 * @param {number|string} price
 * @returns {string} e.g. 29 -> "29", 249.00 -> "249", 29.99 -> "29.99"
 */
export const formatPriceUI = (price) => {
  if (price === null || price === undefined || price === '') {
    return '0';
  }

  let raw;
  if (typeof price === 'string') {
    const cleaned = price.trim().replace(/^\$/, '').replace(/,/g, '');
    raw = cleaned === '' ? NaN : parseFloat(cleaned);
  } else {
    raw = Number(price);
  }

  if (!Number.isFinite(raw)) {
    return '0';
  }

  const rounded = toMoney(raw);
  return rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(2);
};
