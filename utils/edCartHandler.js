// Create a utility file for ED cart functions
import { toast } from "react-toastify";
import { logger } from "@/utils/devLogger";
import {
  checkEdShippingRestriction,
  getUserState,
  isEdRestrictedProduct,
} from "@/utils/edShippingRestrictions";
import { analyticsService } from "@/utils/analytics/analyticsService";
import { getOrCreateSessionId } from "@/utils/dataLayerHelper";

/**
 * Add ED product to cart directly using API
 * @param {Object} productOptions - Product options including variation ID, preference, etc.
 * @param {String} dosage - Selected dosage
 * @param {Function} onRestrictionBlocked - Callback when restriction is detected (optional)
 * @returns {Promise<Object>} Result of the cart addition operation
 */
export const addEdProductToCart = async (
  productOptions,
  dosage,
  onRestrictionBlocked = null
) => {
  try {
    // Check for ED product shipping restrictions
    // Note: We need product name to check, but productOptions might not have it
    // For ED products, we can assume they are restricted if they're being added via this function
    // We'll check the state/province restriction
    
    // Fetch user profile to check state
    let profileData = null;
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          profileData = data;
        }
      }
    } catch (error) {
      logger.error("Error fetching user profile for restriction check:", error);
    }

    if (profileData) {
      const userState = getUserState(profileData);
      // Since this is an ED product handler, we know it's a restricted product type
      // We just need to check if the state is restricted
      const restrictedStates = [
        "ALASKA",
        "CALIFORNIA",
        "DELAWARE",
        "HAWAII",
        "MASSACHUSETTS",
        "NEW HAMPSHIRE",
        "NEW MEXICO",
        "NORTH CAROLINA",
        "RHODE ISLAND",
        "VERMONT",
      ];
      
      const normalizedState = userState.toUpperCase().trim();
      if (restrictedStates.includes(normalizedState)) {
        logger.log(
          `ED product is restricted for state: ${userState}`
        );
        if (onRestrictionBlocked) {
          onRestrictionBlocked();
        }
        return {
          success: false,
          error: "Product not available in your state",
          restricted: true,
        };
      }
    }
    // Construct the request body for the cart API
    const requestBody = {
      productId:
        productOptions.productId || productOptions.variationId.split(",")[0],
      variationId: productOptions.variationId,
      quantity: 1,
      isSubscription: false,
      attributes: {
        "Dose/ Strength": dosage,
      },
      meta_data: [
        {
          key: "_dosage",
          value: dosage,
        },
      ],
    };

    // For generic/brand preference, add it to attributes if needed
    if (productOptions.preference) {
      requestBody.attributes.Brand =
        productOptions.preference === "brand" ? "Brand" : "Generic";
    }

    // Attribute and meta values carry dose/strength, so log the ids only.
    logger.log("Adding ED product to cart:", {
      productId: requestBody.productId,
      variationId: requestBody.variationId,
      quantity: requestBody.quantity,
      attributeKeys: Object.keys(requestBody.attributes || {}),
      metaKeys: (requestBody.meta_data || []).map((entry) => entry?.key),
    });

    // Make the API call to add the item to cart
    const response = await fetch("/api/cart/add-item", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Error adding product to cart:", errorText);
      throw new Error(`Failed to add product to cart: ${response.statusText}`);
    }

    const result = await response.json();
    logger.log("Product added to cart, item count:", result?.items?.length ?? 0);

    // Fire add_to_cart analytics event
    try {
      const itemId = String(requestBody.productId || requestBody.variationId || "");
      analyticsService.trackAddToCart(
        {
          id: itemId,
          sku: itemId,
          name: productOptions.name || dosage || "",
          price: result?.price ? parseFloat(result.price) : 0,
          categories: [],
          attributes: [],
        },
        1,
        { event_id: `add_to_cart_${getOrCreateSessionId()}_${itemId}_${Date.now()}` }
      );
    } catch (_) {
      // non-blocking
    }

    // Show success message
    toast.success("Product added to cart");

    return {
      success: true,
      result,
    };
  } catch (error) {
    logger.error("Error in addEdProductToCart:", error);

    // Show error message
    toast.error("Failed to add product to cart. Please try again.");

    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Handle ED product checkout based on authentication status
 * @param {Object} productOptions - Product options including variation ID, preference, etc.
 * @param {String} dosage - Selected dosage
 * @returns {Promise<Object>} Result object with success status and redirect URL
 */
export const handleEdProductCheckout = async (productOptions, dosage) => {
  try {
    // Check if user is authenticated
    const isAuthenticated =
      typeof document !== "undefined"
        ? document.cookie.includes("authToken=")
        : false;

    if (isAuthenticated) {
      // For authenticated users, add directly to cart via API and redirect to checkout
      const addToCartResult = await addEdProductToCart(productOptions, dosage);

      if (addToCartResult.success) {
        return {
          success: true,
          redirectUrl: "/checkout?ed-flow=1", // Clean URL without product IDs
        };
      } else {
        return {
          success: false,
          error: addToCartResult.error,
        };
      }
    } else {
      // For unauthenticated users, redirect to login/register with redirect to checkout
      const redirectToCheckout = encodeURIComponent("/checkout?ed-flow=1");
      return {
        success: true,
        redirectUrl: `/login-register/?ed-flow=1&onboarding=1&view=account&viewshow=register&redirect_to=${redirectToCheckout}`,
      };
    }
  } catch (error) {
    logger.error("Error in handleEdProductCheckout:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Build a checkout URL for ED products with addon items
 * Follows the same pattern as the build_checkout_url_for_new_ed_cross_sell PHP function
 * @param {Object} mainProduct - The main ED product with variationId
 * @param {Array} addons - Array of addon products that have been selected
 * @param {Boolean} isAuthenticated - Whether user is authenticated
 * @returns {String} The checkout URL with all products
 */
export const buildEdCheckoutUrl = (
  mainProduct,
  addons = [],
  isAuthenticated = false
) => {
  // Base cart URL (different for authenticated vs. unauthenticated users)
  const baseUrl = isAuthenticated ? "/checkout" : "/login-register";

  // Get the main product ID (from variationId which should contain the actual product ID)
  let mainProductId = "";
  if (mainProduct && mainProduct.variationId) {
    // Use the first part of the variationId as the main product ID (handles case of comma-separated IDs)
    mainProductId = mainProduct.variationId.split(",")[0];
  }

  if (!mainProductId) {
    logger.error(
      "Error: No valid product ID found for main product",
      mainProduct
    );
    return isAuthenticated ? "/checkout" : "/login-register";
  }

  // Start building the products string
  let productsString = mainProductId;

  // Process each addon product
  if (addons && addons.length > 0) {
    addons.forEach((addon) => {
      if (!addon || !addon.id) return;

      // Add the addon ID to the product string
      productsString += "%2C" + addon.id; // URL-encoded comma
    });
  }

  // Build the final URL
  let finalUrl = `${baseUrl}?`;

  // Add authentication parameters if user is not authenticated
  if (!isAuthenticated) {
    finalUrl += "onboarding=1&view=account&viewshow=register&";
  }

  // Add the ed-flow parameter
  finalUrl += "ed-flow=1";

  // Add the products parameter
  finalUrl += `&onboarding-add-to-cart=${productsString}`;

  // Add subscription parameter for the main product (hardcoded to 1_month_1 as in the example)
  finalUrl += `&convert_to_sub_${mainProductId}=1_month_1`;

  // Add any dosage information if available
  if (mainProduct && mainProduct.selectedDose) {
    finalUrl += `&dose_${mainProductId}=${encodeURIComponent(
      mainProduct.selectedDose
    )}`;
  }

  // Add subscription parameters for addon products if they are subscription type
  addons.forEach((addon) => {
    if (
      addon &&
      addon.id &&
      addon.dataType === "subscription" &&
      addon.dataVar
    ) {
      finalUrl += `&convert_to_sub_${addon.id}=${addon.dataVar}`;
    }
  });

  logger.log("Generated ED checkout URL:", finalUrl);
  return finalUrl;
};
