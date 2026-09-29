import { logger } from "@/utils/devLogger";

// Dosage cookie management utility for storing and retrieving user's dosage selections

const COOKIE_NAME = "dosages";
const COOKIE_EXPIRY_DAYS = 30;

/**
 * Get all dosage selections from cookie
 * @returns {Object} Object containing product IDs and their dosage selections
 */
export const getDosageSelections = () => {
  if (typeof window === "undefined") return {};

  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return {};

  try {
    const value = decodeURIComponent(cookie.split("=")[1]);
    return JSON.parse(value);
  } catch (error) {
    logger.error("Error parsing dosage selections cookie:", error);
    return {};
  }
};

/**
 * Save dosage selection for a specific product
 * @param {string} productId - The product ID
 * @param {string} dosage - The selected dosage
 */
export const saveDosageSelection = (productId, dosage) => {
  if (typeof window === "undefined") {
    logger.log("Window is undefined, cannot save cookie");
    return;
  }

  try {
    // Dosage is treatment data, so log the product and counts only.
    logger.log("Saving dosage selection for product:", productId);
    const selections = getDosageSelections();
    logger.log("Current selection count:", Object.keys(selections).length);

    // Store in format: { "259": "50mg", "260": "100mg" }
    selections[productId] = dosage;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

    const cookieValue = JSON.stringify(selections);

    const cookieString = `${COOKIE_NAME}=${encodeURIComponent(
      cookieValue
    )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;

    document.cookie = cookieString;

    // Verify the cookie was set
    const savedCookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${COOKIE_NAME}=`));
    logger.log("Dosage cookie written:", Boolean(savedCookie));
  } catch (error) {
    logger.error("Error saving dosage selection:", error);
  }
};

/**
 * Get dosage selection for a specific product
 * @param {string} productId - The product ID
 * @returns {string|null} The selected dosage or null if not found
 */
export const getDosageSelection = (productId) => {
  const selections = getDosageSelections();
  logger.log(
    "Getting dosage selection for product",
    productId,
    "found:",
    Boolean(selections[productId])
  );
  return selections[productId] || null;
};

/**
 * Remove dosage selection for a specific product
 * @param {string} productId - The product ID
 */
export const removeDosageSelection = (productId) => {
  if (typeof window === "undefined") return;

  try {
    const selections = getDosageSelections();
    delete selections[productId];

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS);

    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(
      JSON.stringify(selections)
    )}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
  } catch (error) {
    logger.error("Error removing dosage selection:", error);
  }
};

/**
 * Clear all dosage selections
 */
export const clearDosageSelections = () => {
  if (typeof window === "undefined") return;

  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
};
