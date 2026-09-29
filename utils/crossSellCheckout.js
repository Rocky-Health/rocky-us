"use client";

import { logger } from "@/utils/devLogger";
import { addToCartDirectly } from "./flowCartHandler";

/**
 * Check if user is authenticated
 * @returns {boolean} true if user is authenticated, false otherwise
 */
export const isUserAuthenticated = () => {
  if (typeof window === "undefined") return false;

  // Check for auth cookie since that's what the middleware is using
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  // Check for authToken cookie which is used by the application
  const authToken = getCookie("authToken");
  return !!authToken;
};

/**
 * Save selected products to localStorage for retrieval after login
 * @param {Object} mainProduct - The main selected product
 * @param {Array} addons - Array of addon product objects
 * @param {String} flowType - Type of flow (ed, wl, hair, etc.)
 */
export const saveProductsForCheckout = (
  mainProduct,
  addons,
  flowType = "ed"
) => {
  if (typeof window === "undefined") return;

  const savedProducts = {
    mainProduct,
    addons,
    flowType,
    timestamp: new Date().getTime(),
  };

  localStorage.setItem("cross_sell_products", JSON.stringify(savedProducts));
};

/**
 * Get saved products from localStorage
 * @returns {Object|null} The saved products or null if none exist
 */
export const getSavedProducts = () => {
  if (typeof window === "undefined") return null;

  const savedProducts = localStorage.getItem("cross_sell_products");
  if (!savedProducts) return null;

  return JSON.parse(savedProducts);
};

/**
 * Clear saved products from localStorage
 */
export const clearSavedProducts = () => {
  if (typeof window === "undefined") return;

  localStorage.removeItem("cross_sell_products");
};

/**
 * Add products to cart and redirect to appropriate page using direct cart addition
 * @param {Object} mainProduct - The main selected product
 * @param {Array} addons - Array of addon product objects
 * @param {String} flowType - Type of flow (ed, wl, hair, etc.)
 * @param {Object} options - Additional options for cart addition
 * @returns {Promise<Object>} Result with success status and redirect URL
 */
export const addToCartAndRedirect = async (
  mainProduct,
  addons = [],
  flowType = "ed",
  options = {}
) => {
  try {
    logger.log(`🛒 CrossSell - Starting ${flowType} flow cart addition`);
    // Product name/dose is treatment data, so log identifiers only.
    logger.log("Main Product:", {
      id: mainProduct?.id ?? mainProduct?.productId ?? null,
      variationId: mainProduct?.variationId ?? null,
    });
    logger.log("Addon count:", Array.isArray(addons) ? addons.length : 0);

    // Use direct cart addition with proper options
    const result = await addToCartDirectly(mainProduct, addons, flowType, {
      requireConsultation: options.requireConsultation || false,
      preserveExistingCart: flowType !== "wl", // WL flow clears cart, others preserve
      subscriptionPeriod: options.subscriptionPeriod || null,
      varietyPackId: options.varietyPackId || null,
      ...options,
    });

    if (result.success) {
      logger.log(
        `🎉 CrossSell - ${flowType} flow SUCCESS! Redirecting to:`,
        result.redirectUrl
      );

      // Use window.location.href for compatibility with existing components
      window.location.href = result.redirectUrl;

      return result;
    } else {
      logger.error(`❌ CrossSell - ${flowType} flow FAILED:`, result.error);
      alert(
        result.error ||
          "There was an issue processing your checkout. Please try again."
      );
      return result;
    }
  } catch (error) {
    logger.error(`Error in addToCartAndRedirect for ${flowType} flow:`, error);
    alert("There was an issue processing your checkout. Please try again.");
    return {
      success: false,
      error: error.message,
      flowType,
    };
  }
};

/**
 * Modern version that returns the result without redirecting (for use with router.push)
 * @param {Object} mainProduct - The main selected product
 * @param {Array} addons - Array of addon product objects
 * @param {String} flowType - Type of flow (ed, wl, hair, etc.)
 * @param {Object} options - Additional options for cart addition
 * @returns {Promise<Object>} Result with success status and redirect URL
 */
export const addToCartDirectlyWithResult = async (
  mainProduct,
  addons = [],
  flowType = "ed",
  options = {}
) => {
  try {
    logger.log(
      `🛒 CrossSell (Modern) - Starting ${flowType} flow cart addition`
    );
    // Product name/dose is treatment data, so log identifiers only.
    logger.log("Main Product:", {
      id: mainProduct?.id ?? mainProduct?.productId ?? null,
      variationId: mainProduct?.variationId ?? null,
    });
    logger.log("Addon count:", Array.isArray(addons) ? addons.length : 0);

    // Use direct cart addition with proper options
    const result = await addToCartDirectly(mainProduct, addons, flowType, {
      requireConsultation: options.requireConsultation || false,
      preserveExistingCart: flowType !== "wl", // WL flow clears cart, others preserve
      subscriptionPeriod: options.subscriptionPeriod || null,
      varietyPackId: options.varietyPackId || null,
      ...options,
    });

    if (result.success) {
      logger.log(`🎉 CrossSell (Modern) - ${flowType} flow SUCCESS!`, result);
    } else {
      logger.error(
        `❌ CrossSell (Modern) - ${flowType} flow FAILED:`,
        result.error
      );
    }

    return result;
  } catch (error) {
    logger.error(
      `Error in addToCartDirectlyWithResult for ${flowType} flow:`,
      error
    );
    return {
      success: false,
      error: error.message,
      flowType,
    };
  }
};
