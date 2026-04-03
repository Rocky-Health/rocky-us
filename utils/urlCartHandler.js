"use client";

import { logger } from "@/utils/devLogger";

/**
 * Utility for handling URL-based cart operations across different product flows
 * This can be used for ED, Hair, Weight Loss, etc. product flows
 */

// Cache for product mappings to avoid repeated API calls
let productCache = {
  byName: {},
  bySlug: {},
  byInternalId: {},
  lastUpdated: null,
};

// Cache for product type information to avoid repeated API calls
const productTypeCache = {};

/**
 * Get product information dynamically from the API
 * @param {string} productId - The ID of the product
 * @returns {Promise<Object>} Product type and variation information
 */
const getProductInfo = async (productId) => {
  // Check cache first
  if (productTypeCache[productId]) {
    return productTypeCache[productId];
  }

  try {
    logger.log(`Fetching product info for ${productId} from API`);
    const response = await fetch(`/api/products/debug?id=${productId}`);

    if (!response.ok) {
      // Enhanced error logging with status code
      logger.error(
        `Failed to fetch product info for ID ${productId}: ${response.status} ${response.statusText}`
      );

      // Instead of throwing an error, return a default product info object
      return {
        productType: "simple",
        isVariableProduct: false,
        isSubscriptionProduct: false,
        isVariableSubscription: false,
        firstVariationId: null,
        subscriptionPeriod: "1_month",
        variations: [],
        variationPrices: {},
        attributes: [],
      };
    }

    const data = await response.json();

    // If data is empty or missing product, return default
    if (!data || !data.product) {
      logger.error(`Product data not found for ID ${productId}`);
      return {
        productType: "simple",
        isVariableProduct: false,
        isSubscriptionProduct: false,
        isVariableSubscription: false,
        firstVariationId: null,
        subscriptionPeriod: "1_month",
        variations: [],
        variationPrices: {},
        attributes: [],
      };
    }

    // Extract product type and determine if it's a variable-subscription product
    const productType = data.product?.type || "";
    const isVariableProduct = productType.includes("variable");
    const isSubscriptionProduct = productType.includes("subscription");

    // Get variations and their prices
    const variations = data.raw_variations || [];
    const variationPrices = {};

    // Extract prices for each variation
    variations.forEach((variation) => {
      if (variation.id && variation.price) {
        variationPrices[variation.id] = parseFloat(variation.price);
      }
    });

    // Get first variation if it exists
    const firstVariation = variations[0] || null;
    let subscriptionPeriod = "1_month";

    // Extract subscription period if available
    if (firstVariation?.meta_data) {
      const periodMeta = firstVariation.meta_data.find(
        (m) => m.key === "_subscription_period"
      );
      const intervalMeta = firstVariation.meta_data.find(
        (m) => m.key === "_subscription_period_interval"
      );

      if (periodMeta && intervalMeta) {
        subscriptionPeriod = `${intervalMeta.value}_${periodMeta.value}`;
      }
    }

    // Create product info object with price information
    const productInfo = {
      productType,
      isVariableProduct,
      isSubscriptionProduct,
      isVariableSubscription: isVariableProduct && isSubscriptionProduct,
      firstVariationId: firstVariation?.id || null,
      subscriptionPeriod,
      variations: variations,
      variationPrices: variationPrices,
      attributes: data.product?.attributes || [],
    };

    // Store in cache
    productTypeCache[productId] = productInfo;

    return productInfo;
  } catch (error) {
    logger.error(`Error fetching product info for ${productId}:`, error);
    return {
      productType: "simple",
      isVariableProduct: false,
      isSubscriptionProduct: false,
      isVariableSubscription: false,
      firstVariationId: null,
      subscriptionPeriod: "1_month",
      variations: [],
      variationPrices: {},
      attributes: [],
    };
  }
};

/**
 * Fetch product mapping from API
 * @returns {Promise<Object>} Product mapping object
 */
export const fetchProductMapping = async () => {
  try {
    // Check if we have a recent cache (less than 1 hour old)
    const now = new Date().getTime();
    const cacheExpiry = 60 * 60 * 1000; // 1 hour

    if (
      productCache.lastUpdated &&
      now - productCache.lastUpdated < cacheExpiry
    ) {
      return {
        byName: { ...productCache.byName },
        bySlug: { ...productCache.bySlug },
        byInternalId: { ...productCache.byInternalId },
      };
    }

    // Fetch product mapping from API
    const response = await fetch("/api/products/mapping");

    if (!response.ok) {
      throw new Error(
        `Failed to fetch product mapping: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Format the response into our mapping structure
    const mapping = {
      byName: {},
      bySlug: {},
      byInternalId: {},
    };

    // Process the products into the mapping
    data.products.forEach((product) => {
      if (product.name) mapping.byName[product.name] = product.id;
      if (product.slug) mapping.bySlug[product.slug] = product.id;
      if (product.internalId)
        mapping.byInternalId[product.internalId] = product.id;
    });

    // Update cache
    productCache = {
      byName: { ...mapping.byName },
      bySlug: { ...mapping.bySlug },
      byInternalId: { ...mapping.byInternalId },
      lastUpdated: now,
    };

    return mapping;
  } catch (error) {
    logger.error("Error fetching product mapping:", error);

    // If fetch fails, return the cached mapping if available
    if (productCache.lastUpdated) {
      return {
        byName: { ...productCache.byName },
        bySlug: { ...productCache.bySlug },
        byInternalId: { ...productCache.byInternalId },
      };
    }

    // Fallback to empty mapping
    return {
      byName: {},
      bySlug: {},
      byInternalId: {},
    };
  }
};

/**
 * Get WooCommerce product ID from internal product identifier
 * Tries to match by name, slug, or internal ID
 * @param {Object|String} product - Product object or identifier string
 * @returns {Promise<String>} WooCommerce product ID
 */
export const getProductId = async (product) => {
  // If product is already a numeric ID, return it directly
  if (typeof product === "string" && /^\d+$/.test(product)) {
    return product;
  }

  try {
    // Log the product to help with debugging
    logger.log("Getting product ID for:", product);

    // Fetch current mapping
    const mapping = await fetchProductMapping();

    // If product is a string, check each mapping
    if (typeof product === "string") {
      return (
        mapping.byName[product] ||
        mapping.bySlug[product] ||
        mapping.byInternalId[product] ||
        product
      );
    }

    // If product is an object, try to match by various properties
    if (product) {
      // Check if this is an ED product with a woocommerceId
      if (product.woocommerceId) {
        logger.log(`Found woocommerceId: ${product.woocommerceId}`);
        return product.woocommerceId;
      }

      // Check if this is an ED product with productId
      if (product.productId) {
        logger.log(`Found productId: ${product.productId}`);
        return product.productId;
      }

      // Try to match by product ID, WooCommerce ID, or database ID first
      if (product.id && /^\d+$/.test(product.id)) {
        logger.log(`Found numeric id: ${product.id}`);
        return product.id;
      }

      // Try special ED-specific properties
      if (product.dosage && product.name) {
        // Create a key based on name and dosage for ED products
        const edKey = `${product.name}-${product.dosage}`
          .toLowerCase()
          .replace(/\s+/g, "-");
        logger.log(`Trying ED-specific key: ${edKey}`);

        // Check if we have a mapping for this specific ED product variation
        if (mapping.byInternalId[edKey]) {
          return mapping.byInternalId[edKey];
        }
      }

      // Try name, slug, and internal ID
      if (product.name && mapping.byName[product.name]) {
        logger.log(`Found by name: ${product.name}`);
        return mapping.byName[product.name];
      }

      if (product.slug && mapping.bySlug[product.slug]) {
        logger.log(`Found by slug: ${product.slug}`);
        return mapping.bySlug[product.slug];
      }

      if (product.internalId && mapping.byInternalId[product.internalId]) {
        logger.log(`Found by internalId: ${product.internalId}`);
        return mapping.byInternalId[product.internalId];
      }

      // If we still don't have a match but product has an id, return that
      if (product.id) {
        logger.log(`Using fallback id: ${product.id}`);
        return product.id;
      }
    }

    // If no match is found, return null
    logger.warn("Could not find product ID for", product);
    return null;
  } catch (error) {
    logger.error("Error getting product ID:", error);

    // If product has an id property, return that as fallback
    if (product && product.id) {
      return product.id;
    }

    // If product is a string, return it as fallback
    if (typeof product === "string") {
      return product;
    }

    return null;
  }
};

/**
 * Process URL parameters and add products to cart
 * @param {Object} searchParams - Next.js searchParams object from useSearchParams()
 * @returns {Promise<Object>} Result object with status and message
 */
export const processUrlCartParameters = async (searchParams) => {
  try {
    // Import the dynamic product variation functionality
    const { findVariationId } = require("@/lib/api/productVariations");

    // Check if there are products to add from URL parameters
    const onboardingAddToCart = searchParams.get("onboarding-add-to-cart");
    if (!onboardingAddToCart)
      return { status: "skipped", message: "No cart parameters to process" };

    // Parse the product IDs from URL parameter - handle both comma-separated and encoded comma (%2C)
    const rawIds = onboardingAddToCart.includes("%2C")
      ? onboardingAddToCart.split("%2C")
      : onboardingAddToCart.split(",");

    const productIds = rawIds.map((id) => id.trim()).filter((id) => id);

    logger.log("Processing products from URL:", productIds);

    // Detect flow type (ed, wl, etc.)
    const isEdFlow = searchParams.get("ed-flow") === "1";
    const isWlFlow = searchParams.get("wl-flow") === "1";
    const isHairFlow = searchParams.get("hair-flow") === "1";
    const isMhFlow = searchParams.get("mh-flow") === "1";
    const isSkincareFlow = searchParams.get("skincare-flow") === "1";

    let flowType = "general"; // Default to general
    if (isEdFlow) {
      flowType = "ed";
    } else if (isWlFlow) {
      flowType = "wl";
    } else if (isHairFlow) {
      flowType = "hair";
    } else if (isMhFlow) {
      flowType = "mh";
    } else if (isSkincareFlow) {
      flowType = "skincare";
    }

    // Keep track of processed products
    const results = [];

    // Add debug logging
    logger.log(
      "All URL parameters:",
      Object.fromEntries([...searchParams.entries()])
    );

    // Process multiple products using batch endpoint for better performance
    try {
      // Prepare all items for batch processing
      const batchItems = [];
      const isVarietyPack = searchParams.get("is_variety_pack") === "true";
      const varietyPackId = searchParams.get("variety_pack_id");

      // Build request bodies for all products
      for (const productId of productIds) {
        try {
          // Skip empty product IDs
          if (!productId) continue;

          logger.log(`Preparing product ID for batch: ${productId}`);

          // Build the request body for this product using the smart approach
          let requestBody = await buildSmartProductRequestBody(
            productId,
            searchParams
          );

          // Check for variety pack metadata in URL parameters
          if (isVarietyPack && varietyPackId) {
            requestBody.isVarietyPack = true;
            requestBody.varietyPackId = varietyPackId;
            logger.log(`Adding variety pack metadata: ID ${varietyPackId}`);
          }

          // Handle dynamic variation lookup if needed
          if (
            requestBody.needsDynamicVariationLookup &&
            requestBody.attributes
          ) {
            logger.log(
              `Dynamically looking up variation for product ${productId}`
            );
            try {
              const variationId = await findVariationId(
                productId,
                requestBody.attributes
              );
              if (variationId) {
                logger.log(
                  `Dynamic lookup found variation ID: ${variationId} for product ${productId}`
                );
                requestBody.variationId = variationId;
              } else {
                logger.log(
                  `No matching variation found via dynamic lookup for ${productId}`
                );
              }
            } catch (variationError) {
              logger.error(
                `Error finding variation for ${productId}:`,
                variationError
              );
            }

            // Remove the flag as we've handled it
            delete requestBody.needsDynamicVariationLookup;
          }

          batchItems.push(requestBody);
          logger.log(
            `Prepared product ${productId} for batch:`,
            JSON.stringify(requestBody, null, 2)
          );
        } catch (productError) {
          logger.error(`Error preparing product ${productId}:`, productError);
          // Add error to results but continue with other products
          results.push({
            status: "error",
            productId,
            message: productError.message,
          });
        }
      }

      // If we have items to process and more than one item, use batch endpoint
      if (batchItems.length > 1) {
        logger.log(`Using batch endpoint for ${batchItems.length} items`);

        const batchResponse = await fetch("/api/cart/add-items-batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ items: batchItems }),
        });

        if (!batchResponse.ok) {
          logger.error(
            "Batch request failed, falling back to individual calls"
          );
          throw new Error("Batch operation failed");
        }

        const batchResult = await batchResponse.json();
        logger.log("Batch operation result:", batchResult);

        // Process batch results
        if (batchResult.success) {
          results.push({
            status: "success",
            message: batchResult.message,
            added_items: batchResult.added_items,
            failed_items: batchResult.failed_items,
            total_items: batchResult.total_items,
            cart: batchResult.cart,
          });

          // Add any error details if some items failed
          if (batchResult.errors && batchResult.errors.length > 0) {
            batchResult.errors.forEach((error) => {
              results.push({
                status: "error",
                productId: error.item?.productId || "unknown",
                message: error.error?.message || "Unknown error",
                error: error,
              });
            });
          }
        } else {
          throw new Error(batchResult.error || "Batch operation failed");
        }
      } else if (batchItems.length === 1) {
        // For single item, use individual endpoint (no benefit from batch)
        logger.log("Single item detected, using individual endpoint");
        const item = batchItems[0];

        const response = await fetch("/api/cart/add-item", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(item),
        });

        if (!response.ok) {
          const errorText = await response.text();
          logger.error(`Error adding single product to cart:`, errorText);
          throw new Error(
            `Failed to add product to cart: ${response.statusText}`
          );
        }

        const result = await response.json();
        results.push(result);
        logger.log("Single product added to cart:", result);
      }
    } catch (batchError) {
      logger.error(
        "Batch processing failed, falling back to individual calls:",
        batchError
      );

      // Fallback: Process each product individually
      for (const productId of productIds) {
        try {
          // Skip empty product IDs
          if (!productId) continue;

          logger.log(
            `Fallback: Processing product ID individually: ${productId}`
          );

          // Build the request body for this product using the smart approach
          let requestBody = await buildSmartProductRequestBody(
            productId,
            searchParams
          );

          // Check for variety pack metadata in URL parameters
          const isVarietyPack = searchParams.get("is_variety_pack") === "true";
          const varietyPackId = searchParams.get("variety_pack_id");

          if (isVarietyPack && varietyPackId) {
            requestBody.isVarietyPack = true;
            requestBody.varietyPackId = varietyPackId;
          }

          // Handle dynamic variation lookup if needed
          if (
            requestBody.needsDynamicVariationLookup &&
            requestBody.attributes
          ) {
            try {
              const variationId = await findVariationId(
                productId,
                requestBody.attributes
              );
              if (variationId) {
                requestBody.variationId = variationId;
              }
            } catch (variationError) {
              logger.error(
                `Error finding variation for ${productId}:`,
                variationError
              );
            }
            delete requestBody.needsDynamicVariationLookup;
          }

          // Add product to cart using individual endpoint
          const response = await fetch("/api/cart/add-item", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
          });

          if (!response.ok) {
            const errorText = await response.text();
            logger.error(
              `Error adding product ${productId} to cart:`,
              errorText
            );
            throw new Error(
              `Failed to add product ${productId} to cart: ${response.statusText}`
            );
          }

          const result = await response.json();
          results.push(result);
          logger.log(`Fallback: Product ${productId} added to cart:`, result);
        } catch (productError) {
          logger.error(
            `Error processing product ${productId} in fallback:`,
            productError
          );
          results.push({
            status: "error",
            productId,
            message: productError.message,
          });
        }
      }
    }

    return {
      status: results.some((r) => r.status === "error") ? "partial" : "success",
      message: results.some((r) => r.status === "error")
        ? "Some products were added to cart, but others failed"
        : "Products added to cart successfully",
      results,
      flowType,
    };
  } catch (error) {
    logger.error("Error processing URL cart parameters:", error);
    return {
      status: "error",
      message: error.message || "Error processing cart parameters",
      error,
    };
  }
};

/**
 * Build the request body for adding a product to cart
 * @param {string} productId - The ID of the product
 * @param {Object} searchParams - URL search parameters
 * @returns {Object} Request body for the cart API
 */
function buildProductRequestBody(productId, searchParams) {
  // Import the dynamic product variation functionality
  const { findVariationId } = require("@/lib/api/productVariations");

  // Get product-specific configuration
  const productConfig = getProductConfig(productId);

  // Get parameters from URL
  const convertToSub = searchParams.get(`convert_to_sub_${productId}`);
  const quantity =
    searchParams.get(`quantity_${productId}`) ||
    searchParams.get("quantity") ||
    "1";
  const variationId = searchParams.get(`variation_${productId}`);
  const dinValue = searchParams.get(`din_${productId}`);
  const doseValue = searchParams.get(`dose_${productId}`);
  const brandValue = searchParams.get(`brand_${productId}`);
  const subscription = searchParams.get(`subscription_${productId}`);
  const subscriptionPeriod = searchParams.get(
    `subscription_period_${productId}`
  );

  // Determine if this is a subscription product
  const isSubscription =
    !!convertToSub || !!subscription || productConfig.isSubscription;

  // Prepare request body
  const requestBody = {
    quantity: parseInt(quantity, 10),
    isSubscription: isSubscription,
  };

  // Collect attributes from both URL parameters and product config
  const attributes = { ...(productConfig.attributes || {}) };
  if (dinValue) attributes.DIN = dinValue;
  if (doseValue) attributes["Dose/ Strength"] = doseValue;
  if (brandValue) attributes.Brand = brandValue;

  // Add attributes to request if we have any
  if (Object.keys(attributes).length > 0) {
    requestBody.attributes = attributes;
  }

  // Special handling for products that need to use variation as the product ID
  if (productConfig.useVariationAsProduct && productConfig.variationId) {
    requestBody.productId = productConfig.variationId;
    logger.log(
      `Using variation ID ${productConfig.variationId} as the product ID for ${productId}`
    );
  } else {
    // Normal case: use the regular product ID
    requestBody.productId = productId;

    // Add variation ID if specified explicitly in the URL
    if (variationId) {
      logger.log(`Using explicitly provided variation ID: ${variationId}`);
      requestBody.variationId = variationId;
    }
    // Use subscription variation if converting to subscription
    else if (convertToSub) {
      logger.log(`Using subscription variation ID: ${convertToSub}`);
      requestBody.variationId = convertToSub;
    }
    // Use hardcoded variation from product config for special products
    else if (productConfig.variationId && productConfig.skipDynamicLookup) {
      requestBody.variationId = productConfig.variationId;
      logger.log(
        `Using hardcoded variation ID ${requestBody.variationId} for product ${productId}`
      );
    }
    // Dynamically lookup variation ID for all other products
    else if (
      Object.keys(attributes).length > 0 &&
      !productConfig.skipDynamicLookup
    ) {
      // This will be handled asynchronously later
      requestBody.needsDynamicVariationLookup = true;
      requestBody.attributes = attributes;
      logger.log(
        `Will dynamically lookup variation ID for product ${productId} with attributes:`,
        attributes
      );
    }
  }

  // Add subscription period if this is a subscription product
  if (isSubscription) {
    requestBody.subscriptionPeriod =
      productConfig.subscriptionPeriod || subscriptionPeriod || "1_month";
  }

  return requestBody;
}

/**
 * Build the request body for adding a product to cart with dynamic product configuration
 * @param {string} productId - The ID of the product
 * @param {Object} searchParams - URL search parameters
 * @returns {Promise<Object>} Request body for the cart API
 */
async function buildSmartProductRequestBody(productId, searchParams) {
  // Check if we have a price parameter for this product
  const priceParam = searchParams.get(`price_${productId}`);

  // Get smart product configuration, potentially using the price for variation selection
  const productConfig = await getSmartProductConfig(productId, priceParam);

  // Get parameters from URL
  const convertToSub = searchParams.get(`convert_to_sub_${productId}`);
  const quantity =
    searchParams.get(`quantity_${productId}`) ||
    searchParams.get("quantity") ||
    "1";
  const variationId = searchParams.get(`variation_${productId}`);
  const dinValue = searchParams.get(`din_${productId}`);
  const doseValue = searchParams.get(`dose_${productId}`);
  const brandValue = searchParams.get(`brand_${productId}`);
  const subscription = searchParams.get(`subscription_${productId}`);
  const subscriptionPeriod = searchParams.get(
    `subscription_period_${productId}`
  );

  // CRITICAL: Check for add-product-subscription parameter which is required for products like Lidocaine
  const isAddProductSubscription =
    searchParams.get(`add-product-subscription`) === productId;

  // Determine if this is a subscription product
  const isSubscription =
    !!convertToSub ||
    !!subscription ||
    productConfig.isSubscription ||
    isAddProductSubscription;

  // Prepare request body
  const requestBody = {
    quantity: parseInt(quantity, 10),
    isSubscription: isSubscription,
  };

  // Collect attributes from both URL parameters and product config
  const attributes = { ...(productConfig.attributes || {}) };
  if (dinValue) attributes.DIN = dinValue;
  if (doseValue) attributes["Dose/ Strength"] = doseValue;
  if (brandValue) attributes.Brand = brandValue;

  // Add attributes to request if we have any
  if (Object.keys(attributes).length > 0) {
    requestBody.attributes = attributes;
  }

  // Special case for Lidocaine Cream - it needs variation ID 276
  if (productId === "276") {
    logger.log("Adding Lidocaine Cream (276) with correct variation ID 276");
    requestBody.productId = productId;

    // For Lidocaine Cream, we MUST include the variationId of 276
    if (isSubscription) {
      requestBody.subscriptionPeriod =
        productConfig.subscriptionPeriod || subscriptionPeriod || "1_month";
    }

    // Return early for this special case
    logger.log(
      `Final request for Lidocaine Cream:`,
      JSON.stringify(requestBody, null, 2)
    );
    return requestBody;
  }

  // Special case for Lidocaine Spray - it should also have correct variation handling
  if (productId === "52162") {
    logger.log(
      "Adding Lidocaine Spray (52162) with correct subscription handling"
    );
    requestBody.productId = productId;

    // For Lidocaine Spray, include variation if available or subscription if needed
    if (variationId) {
      requestBody.variationId = variationId;
    } else if (isSubscription) {
      requestBody.subscriptionPeriod =
        productConfig.subscriptionPeriod || subscriptionPeriod || "1_month";
    }

    // Return early for this special case
    logger.log(
      `Final request for Lidocaine Spray:`,
      JSON.stringify(requestBody, null, 2)
    );
    return requestBody;
  }

  // Special handling for variety pack products (Cialis + Viagra)
  // Check if this is a variety pack by looking for comma-separated variation IDs
  if (variationId && variationId.includes(",")) {
    logger.log(
      `Detected variety pack product with variation IDs: ${variationId}`
    );

    // Generate a unique variety pack ID for this specific pack
    const varietyPackId = `variety_pack_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Add variety pack metadata
    requestBody.isVarietyPack = true;
    requestBody.varietyPackId = varietyPackId;

    logger.log(`Added variety pack metadata with ID: ${varietyPackId}`);
  }

  // Special handling for products that need to use variation as the product ID
  if (productConfig.useVariationAsProduct && productConfig.variationId) {
    requestBody.productId = productConfig.variationId;
    logger.log(
      `Using variation ID ${productConfig.variationId} as the product ID for ${productId}`
    );
  } else {
    // Normal case: use the regular product ID
    requestBody.productId = productId;

    // Add variation ID if specified explicitly in the URL
    if (variationId) {
      logger.log(`Using explicitly provided variation ID: ${variationId}`);

      // CRITICAL FIX: For certain products like DHM Blend,
      // we need to use the variation ID as the product ID directly
      // Check if this product is one that needs this special handling
      if (productId === "359245") {
        logger.log(
          `Special product detected (${productId}). Using variation ID ${variationId} as product ID instead`
        );
        requestBody.productId = variationId;
      } else {
        // Regular handling - keep both IDs
        requestBody.variationId = variationId;
      }
    }
    // Use subscription variation if converting to subscription
    else if (convertToSub) {
      logger.log(`Using subscription variation ID: ${convertToSub}`);
      requestBody.variationId = convertToSub;
    }
    // Use configured variation from product config
    else if (productConfig.variationId) {
      // CRITICAL FIX: For DHM Blend, use the variation ID as the product ID
      if (productId === "359245") {
        logger.log(
          `Special product detected (${productId}). Using config variation ID ${productConfig.variationId} as product ID instead`
        );
        requestBody.productId = productConfig.variationId;
      } else {
        // Regular handling - keep both IDs
        requestBody.variationId = productConfig.variationId;
        logger.log(
          `Using provided variation ID ${requestBody.variationId} for product ${productId}`
        );
      }
    }
  }

  // Add subscription period if this is a subscription product
  if (isSubscription) {
    requestBody.subscriptionPeriod =
      productConfig.subscriptionPeriod || subscriptionPeriod || "1_month";
  }

  // Handle logging for debug purposes
  logger.log(
    `Final request for product ${productId}:`,
    JSON.stringify(requestBody, null, 2)
  );

  return requestBody;
}

/**
 * Find the best variation ID based on the target price
 * @param {string} productId - The ID of the product
 * @param {number|string} targetPrice - The price shown to the user (or in URL param)
 * @returns {Promise<string|null>} The best matching variation ID
 */
async function findVariationByPrice(productId, targetPrice) {
  try {
    // Convert targetPrice to a number
    const price = parseFloat(targetPrice);
    if (isNaN(price)) {
      logger.log(`Invalid price format: ${targetPrice}`);
      return null;
    }

    // Get product info with variations
    const productInfo = await getProductInfo(productId);

    if (!productInfo.variations || productInfo.variations.length === 0) {
      logger.log(`No variations found for product ${productId}`);
      return null;
    }

    // Find the variation with the closest price
    let closestVariation = null;
    let priceDifference = Infinity;

    for (const variation of productInfo.variations) {
      if (variation.id && variation.price) {
        const variationPrice = parseFloat(variation.price);
        const difference = Math.abs(variationPrice - price);

        if (difference < priceDifference) {
          priceDifference = difference;
          closestVariation = variation;
        }

        // If we find an exact match, return immediately
        if (difference < 0.01) {
          logger.log(
            `Found exact price match for ${productId}: variation ${variation.id} at $${variation.price}`
          );
          return variation.id;
        }
      }
    }

    if (closestVariation) {
      logger.log(
        `Found closest price match for ${productId}: variation ${
          closestVariation.id
        } at $${
          closestVariation.price
        } (target: $${price}, difference: $${priceDifference.toFixed(2)})`
      );
      return closestVariation.id;
    }

    logger.log(
      `No suitable variation found for product ${productId} at price $${price}`
    );
    return null;
  } catch (error) {
    logger.error(`Error finding variation by price for ${productId}:`, error);
    return null;
  }
}

/**
 * Only keep a minimal set of truly problematic products that need special handling
 */
const SPECIAL_PRODUCT_CONFIGS = {
  // Ozempic - hardcoded due to special requirements
  142975: {
    name: "Ozempic",
    isSubscription: true,
    subscriptionPeriod: "6_week",
    variationId: "142976",
    useVariationAsProduct: true,
    attributes: {
      Brand: "Novo Nordisk",
      DIN: "02540258",
      "Dose/ Strength": "0.68mg/ml",
    },
    skipDynamicLookup: true,
  },
  // Wegovy - hardcoded due to special requirements
  250827: {
    name: "Wegovy",
    isSubscription: true,
    subscriptionPeriod: "4_week",
    variationId: "276268",
    useVariationAsProduct: true,
    attributes: {
      Brand: "Novo Nordisk",
      DIN: "02528509",
      "Dose/ Strength": "1mg/1.5ml",
    },
    skipDynamicLookup: true,
  },
  // Body Optimization Program
  148515: {
    name: "Body Optimization Program",
    isSubscription: true,
    subscriptionPeriod: "6_week",
    variationId: "142976", // 0.68mg/ml with DIN 02540258
    attributes: {
      Brand: "Novo Nordisk",
      DIN: "02540258",
      "Dose/ Strength": "0.68mg/ml",
    },
    skipDynamicLookup: true, // Skip dynamic lookup for this product
  },
};

/**
 * Get product-specific configuration, dynamically if possible
 * @param {string} productId - The ID of the product
 * @param {number|string} targetPrice - Target price for variation selection (optional)
 * @returns {Promise<Object>} Product configuration
 */
async function getSmartProductConfig(productId, targetPrice = null) {
  // Default configuration
  const defaultConfig = {
    isSubscription: false,
    subscriptionPeriod: "1_month",
    variationId: null,
    attributes: {},
    useVariationAsProduct: false,
    skipDynamicLookup: false,
  };

  // Check if we have a price-specific request for a special product
  if (targetPrice && SPECIAL_PRODUCT_CONFIGS[productId]) {
    // Get the base configuration
    const baseConfig = {
      ...defaultConfig,
      ...SPECIAL_PRODUCT_CONFIGS[productId],
    };

    // Find the variation based on price
    const priceBasedVariationId = await findVariationByPrice(
      productId,
      targetPrice
    );

    if (priceBasedVariationId) {
      logger.log(
        `Selected variation ${priceBasedVariationId} based on target price $${targetPrice} for product ${productId}`
      );
      return {
        ...baseConfig,
        variationId: priceBasedVariationId,
      };
    }

    return baseConfig;
  }

  // Check if this is a special product with hardcoded config (without price targeting)
  if (SPECIAL_PRODUCT_CONFIGS[productId]) {
    return {
      ...defaultConfig,
      ...SPECIAL_PRODUCT_CONFIGS[productId],
    };
  }

  // Otherwise, dynamically determine product configuration
  try {
    const productInfo = await getProductInfo(productId);

    // For variable-subscription products, return a config that uses the first variation
    if (productInfo.isVariableSubscription && productInfo.firstVariationId) {
      return {
        ...defaultConfig,
        name: `Product ${productId}`,
        isSubscription: true,
        subscriptionPeriod: productInfo.subscriptionPeriod,
        variationId: productInfo.firstVariationId,
        useVariationAsProduct: true, // Use the same approach as Ozempic for all variable-subscription products
        skipDynamicLookup: false,
      };
    }

    // For regular variable products, return a config that includes variation ID but doesn't use it as product
    if (productInfo.isVariableProduct && productInfo.firstVariationId) {
      return {
        ...defaultConfig,
        name: `Product ${productId}`,
        isSubscription: productInfo.isSubscriptionProduct,
        subscriptionPeriod: productInfo.subscriptionPeriod,
        variationId: productInfo.firstVariationId,
        useVariationAsProduct: false,
        skipDynamicLookup: false,
      };
    }

    // For subscription products, return a config with subscription enabled
    if (productInfo.isSubscriptionProduct) {
      return {
        ...defaultConfig,
        name: `Product ${productId}`,
        isSubscription: true,
        subscriptionPeriod: productInfo.subscriptionPeriod,
        skipDynamicLookup: false,
      };
    }

    // For all other products, return the default config
    return defaultConfig;
  } catch (error) {
    logger.error(`Error getting smart product config for ${productId}:`, error);
    return defaultConfig;
  }
}

/**
 * Get product-specific configuration, with compatibility for non-async code
 * @param {string} productId - The ID of the product
 * @returns {Object} Product configuration
 */
function getProductConfig(productId) {
  // Default configuration
  const defaultConfig = {
    isSubscription: false,
    subscriptionPeriod: "1_month",
    variationId: null,
    attributes: {},
    useVariationAsProduct: false,
    skipDynamicLookup: false,
  };

  // Check if this is a special product with hardcoded config
  if (SPECIAL_PRODUCT_CONFIGS[productId]) {
    return {
      ...defaultConfig,
      ...SPECIAL_PRODUCT_CONFIGS[productId],
    };
  }

  // For non-special products, return default config
  // The dynamic lookup will be handled later in buildSmartProductRequestBody
  return defaultConfig;
}

/**
 * Create a URL with product parameters for cart additions
 * @param {Object} mainProduct - The main product object
 * @param {Array} addons - Array of addon product objects
 * @param {String} flowType - Type of flow (ed, hair, wl, etc.)
 * @param {Boolean} isAuthenticated - Whether the user is authenticated
 * @returns {Promise<String>} URL with product parameters
 */
export const createCartUrl = async (
  mainProduct,
  addons = [],
  flowType = "ed",
  isAuthenticated = true
) => {
  try {
    // Detailed logging of the product being processed
    logger.log("===== PRODUCT INFO FOR CART URL =====");
    logger.log("Main Product:", JSON.stringify(mainProduct, null, 2));
    logger.log("Flow Type:", flowType);
    logger.log("Is Authenticated:", isAuthenticated);

    // Direct product ID mapping with fallback mechanism
    let productId = null;

    // Special handling for weight loss addons - use their IDs directly
    const wlAddons = {
      353755: "MyRocky Essential Cap", // Essential Cap - CORRECT ID
      90995: "Essential T-Boost", // Essential T-Boost - CORRECT ID
      323511: "Ovulation Test Kit", // Ovulation Test Kit
      323512: "Perimenopause Test Kit", // Perimenopause Test Kit
      471638: "Essential Night Boost", // Essential Night Boost
      471652: "Essential Mood Balance", // Essential Mood Balance
      471657: "Essential Gut Relief", // Essential Gut Relief
    };

    // Check if this is a direct ID that we already know
    if (mainProduct.id && wlAddons[mainProduct.id]) {
      productId = mainProduct.id;
      logger.log(`Using direct ID for ${wlAddons[productId]}: ${productId}`);
    }
    // Or if it's one of our special WL addon products by name
    else if (
      mainProduct.name &&
      Object.values(wlAddons).includes(mainProduct.name)
    ) {
      // Find the ID by name
      for (const [id, name] of Object.entries(wlAddons)) {
        if (name === mainProduct.name) {
          productId = id;
          logger.log(`Found ID by direct name match for ${name}: ${productId}`);
          break;
        }
      }
    }

    // If not a special WL product, use regular approach
    if (!productId) {
      // Approach 1: Try to use an existing ID property from the product object
      if (mainProduct) {
        // Check all possible ID properties
        const idProps = ["id", "productId", "product_id", "woocommerceId"];
        for (const prop of idProps) {
          if (mainProduct[prop] && mainProduct[prop].toString().trim()) {
            productId = mainProduct[prop].toString();
            logger.log(
              `Using product ID from property '${prop}': ${productId}`
            );
            break;
          }
        }
      }
    }

    // Final fallback
    if (!productId && typeof mainProduct === "string") {
      productId = mainProduct;
      logger.log(`Using raw string as product ID: ${productId}`);
    }

    if (!productId) {
      throw new Error(
        `Could not determine product ID for: ${JSON.stringify(mainProduct)}`
      );
    }

    logger.log("Final main product ID for URL:", productId);

    // Always use checkout as the base URL - middleware will handle redirection if needed
    let baseUrl = "/checkout";
    let queryParams = `?${flowType}-flow=1`;

    // Check if we need to include price parameter
    let priceParam = "";
    if (mainProduct.price && !isNaN(mainProduct.price)) {
      priceParam = `&price_${productId}=${encodeURIComponent(
        mainProduct.price
      )}`;
      logger.log(`Adding price parameter: ${priceParam}`);
    }

    // Special handling for Weight Loss flow with any weight loss product
    // Define all weight loss product IDs that should include Body Optimization Program
    const weightLossProductIds = [
      "489523", // Compounded Tirzepatide
      "489798", // Compounded Semaglutide
      "142975",
      "160468",
      "250827",
      "369618",
      "490537",
    ]; // Ozempic, Mounjaro, Wegovy, Rybelsus, Sublingual Semaglutide

    if (flowType === "wl" && weightLossProductIds.includes(productId)) {
      // Add consultation-required parameter for WL flow
      queryParams += "&consultation-required=1";

      // Always include both the selected weight loss product and Body Optimization Program for WL flow
      logger.log(
        `Weight loss product detected in WL flow (ID: ${productId}). Adding Body Optimization Program (148515)`
      );
      queryParams += `&onboarding-add-to-cart=${productId},148515`;

      // Add the price parameter if available
      if (priceParam) {
        queryParams += priceParam;
      }

      // Check if we have addons to add
      if (addons && addons.length > 0) {
        logger.log(`WL flow has ${addons.length} addons to process:`, addons);

        // Process WL addons before returning
        const wlAddons = {
          353755: "MyRocky Essential Cap", // Essential Cap - CORRECT ID
          90995: "Essential T-Boost", // Essential T-Boost - CORRECT ID
          323511: "Ovulation Test Kit", // Ovulation Test Kit
          323512: "Perimenopause Test Kit", // Perimenopause Test Kit
          471638: "Essential Night Boost", // Essential Night Boost
          471652: "Essential Mood Balance", // Essential Mood Balance
          471657: "Essential Gut Relief", // Essential Gut Relief
        };

        const addonIds = addons
          .map((addon) => {
            logger.log("Processing WL addon:", addon);

            // Use dataAddToCart if available (this is the primary ID for WL addons)
            if (addon.dataAddToCart) {
              logger.log(
                `Using dataAddToCart for WL addon: ${addon.dataAddToCart}`
              );
              return addon.dataAddToCart;
            }
            // If addon is a known WL product, use its ID directly
            else if (addon.id && wlAddons[addon.id]) {
              logger.log(
                `Found WL addon by ID: ${addon.id} -> ${wlAddons[addon.id]}`
              );
              return addon.id;
            }
            // If addon has a name that matches our known products
            else if (
              addon.name &&
              Object.values(wlAddons).includes(addon.name)
            ) {
              // Find the ID by name
              for (const [id, name] of Object.entries(wlAddons)) {
                if (name === addon.name) {
                  logger.log(`Found WL addon by name: ${addon.name} -> ${id}`);
                  return id;
                }
              }
            }
            // Fallback to regular id
            logger.log(`Using fallback ID for WL addon: ${addon.id}`);
            return addon.id || null;
          })
          .filter((id) => id !== null);

        if (addonIds.length > 0) {
          // Add addons to the existing onboarding-add-to-cart parameter
          const currentProducts = `${productId},148515`;
          const allProductIds = [currentProducts, ...addonIds];

          // Replace the onboarding-add-to-cart parameter to include addons
          queryParams = queryParams.replace(
            `onboarding-add-to-cart=${productId},148515`,
            `onboarding-add-to-cart=${allProductIds.join("%2C")}`
          );

          logger.log("Direct addon IDs for WL flow:", addonIds);
          logger.log("Final WL flow URL query params:", queryParams);
        }
      } else {
        logger.log("WL flow has no addons to process");
      }

      // Build the final URL and return
      const redirectUrl = `${baseUrl}${queryParams}`;
      logger.log(
        `Created WL flow URL with product ${productId} + BO Program + addons: ${redirectUrl}`
      );
      return redirectUrl;
    }

    // Standard handling for non-WL flows or other products
    // Add consultation-required parameter for WL flow
    if (flowType === "wl") {
      queryParams += "&consultation-required=1";
    }

    // Add main product to cart params (only if not already added for weight loss case)
    if (!(flowType === "wl" && weightLossProductIds.includes(productId))) {
      queryParams += `&onboarding-add-to-cart=${productId}`;

      // Add price parameter if available
      if (priceParam) {
        queryParams += priceParam;
      }
    }

    // Add additional products if any
    if (addons && addons.length > 0) {
      // For WL flow, use direct IDs for addons without API calls
      if (flowType === "wl") {
        logger.log("Processing WL flow addons:", addons);

        const addonIds = addons
          .map((addon) => {
            logger.log("Processing WL addon:", addon);

            // Use dataAddToCart if available (this is the primary ID for WL addons)
            if (addon.dataAddToCart) {
              logger.log(
                `Using dataAddToCart for WL addon: ${addon.dataAddToCart}`
              );
              return addon.dataAddToCart;
            }
            // If addon is a known WL product, use its ID directly
            else if (addon.id && wlAddons[addon.id]) {
              logger.log(
                `Found WL addon by ID: ${addon.id} -> ${wlAddons[addon.id]}`
              );
              return addon.id;
            }
            // If addon has a name that matches our known products
            else if (
              addon.name &&
              Object.values(wlAddons).includes(addon.name)
            ) {
              // Find the ID by name
              for (const [id, name] of Object.entries(wlAddons)) {
                if (name === addon.name) {
                  logger.log(`Found WL addon by name: ${addon.name} -> ${id}`);
                  return id;
                }
              }
            }
            // Fallback to regular id
            logger.log(`Using fallback ID for WL addon: ${addon.id}`);
            return addon.id || null;
          })
          .filter((id) => id !== null);

        if (addonIds.length > 0) {
          // Start with main product and add all addons
          const allProductIds = [productId, ...addonIds];

          // Replace the onboarding-add-to-cart parameter
          queryParams = queryParams.replace(
            `onboarding-add-to-cart=${productId}`,
            `onboarding-add-to-cart=${allProductIds.join("%2C")}`
          );

          logger.log("Direct addon IDs for WL flow:", addonIds);
          logger.log("Final WL flow URL query params:", queryParams);
        }
      } else if (flowType === "hair") {
        // For hair flow, use direct IDs for addons without API calls
        const hairAddons = {
          93366: "Essential Follicle Support",
          262914: "Essential T-Boost",
          471638: "Essential Night Boost",
          471652: "Essential Mood Balance",
          471657: "Essential Gut Relief",
          353755: "MyRocky Essential Cap",
        };

        logger.log("Processing hair flow addons:", addons);

        const addonIds = addons
          .map((addon) => {
            logger.log("Processing hair addon:", addon);

            // If addon is a known hair product, use its ID directly
            if (addon.id && hairAddons[addon.id]) {
              logger.log(
                `Found hair addon by ID: ${addon.id} -> ${hairAddons[addon.id]}`
              );
              return addon.id;
            }
            // If addon has a name that matches our known products
            else if (
              addon.name &&
              Object.values(hairAddons).includes(addon.name)
            ) {
              // Find the ID by name
              for (const [id, name] of Object.entries(hairAddons)) {
                if (name === addon.name) {
                  logger.log(
                    `Found hair addon by name: ${addon.name} -> ${id}`
                  );
                  return id;
                }
              }
            }
            // Use dataAddToCart if available (this is the primary ID for hair addons)
            else if (addon.dataAddToCart) {
              logger.log(
                `Using dataAddToCart for hair addon: ${addon.dataAddToCart}`
              );
              return addon.dataAddToCart;
            }
            // Fallback to regular id
            logger.log(`Using fallback ID for hair addon: ${addon.id}`);
            return addon.id || null;
          })
          .filter((id) => id !== null);

        if (addonIds.length > 0) {
          // Start with main product and add all addons
          const allProductIds = [productId, ...addonIds];

          // Replace the onboarding-add-to-cart parameter
          queryParams = queryParams.replace(
            `onboarding-add-to-cart=${productId}`,
            `onboarding-add-to-cart=${allProductIds.join("%2C")}`
          );

          logger.log("Direct addon IDs for hair flow:", addonIds);
          logger.log("Final hair flow URL query params:", queryParams);
        }
      } else if (flowType === "ed") {
        // For ED flow, use direct IDs for addons without API calls
        const edAddons = {
          353755: "MyRocky Essential Cap", // Essential Cap
          90995: "Essential T-Boost", // Essential T-Boost (WL version)
          262914: "Essential T-Boost", // Essential T-Boost (ED version)
          471638: "Essential Night Boost", // Essential Night Boost
          471652: "Essential Mood Balance", // Essential Mood Balance
          471657: "Essential Gut Relief", // Essential Gut Relief
          276: "Lidocaine Cream", // Lidocaine Cream
          52162: "Lidocaine Spray", // Lidocaine Spray
          13534: "Durex Condoms", // Durex Condoms
          353755: "MyRocky Essential Cap", // MyRocky Essential Cap (alternative ID)
          323626: "DHM Blend", // DHM Blend
          359245: "DHM Blend", // DHM Blend (alternative ID)
        };

        logger.log("Processing ED flow addons:", addons);

        const addonIds = addons
          .map((addon) => {
            logger.log("Processing ED addon:", addon);

            // Use dataAddToCart if available (this is the primary ID for ED addons)
            if (addon.dataAddToCart) {
              logger.log(
                `Using dataAddToCart for ED addon: ${addon.dataAddToCart}`
              );
              return addon.dataAddToCart;
            }
            // If addon is a known ED product, use its ID directly
            else if (addon.id && edAddons[addon.id]) {
              logger.log(
                `Found ED addon by ID: ${addon.id} -> ${edAddons[addon.id]}`
              );
              return addon.id;
            }
            // If addon has a name that matches our known products
            else if (
              addon.name &&
              Object.values(edAddons).includes(addon.name)
            ) {
              // Find the ID by name
              for (const [id, name] of Object.entries(edAddons)) {
                if (name === addon.name) {
                  logger.log(`Found ED addon by name: ${addon.name} -> ${id}`);
                  return id;
                }
              }
            }
            // Fallback to regular id
            logger.log(`Using fallback ID for ED addon: ${addon.id}`);
            return addon.id || null;
          })
          .filter((id) => id !== null);

        if (addonIds.length > 0) {
          // Start with main product and add all addons
          const allProductIds = [productId, ...addonIds];

          // Replace the onboarding-add-to-cart parameter
          queryParams = queryParams.replace(
            `onboarding-add-to-cart=${productId}`,
            `onboarding-add-to-cart=${allProductIds.join("%2C")}`
          );

          logger.log("Direct addon IDs for ED flow:", addonIds);
          logger.log("Final ED flow URL query params:", queryParams);
        }
      } else {
        // Process addon products for other flows (mh, etc.)
        const addonIds = addons
          .map((addon) => {
            // Use dataAddToCart if available (this is the primary ID for addons)
            if (addon.dataAddToCart) {
              return addon.dataAddToCart;
            }
            // Fallback to regular id
            return addon.id || null;
          })
          .filter((id) => id !== null);

        if (addonIds.length > 0) {
          // Add addon products to the URL if we have the main product ID already in URL
          if (queryParams.includes(`onboarding-add-to-cart=${productId}`)) {
            // Append addon IDs to the existing onboarding-add-to-cart parameter
            queryParams = queryParams.replace(
              `onboarding-add-to-cart=${productId}`,
              `onboarding-add-to-cart=${productId}%2C${addonIds.join("%2C")}`
            );
          }
        }
      }
    }

    // Add variety pack metadata to URL parameters if the product is a variety pack
    queryParams = addVarietyPackMetadata(mainProduct, queryParams);

    // Build the final URL
    const redirectUrl = `${baseUrl}${queryParams}`;
    logger.log(`Created cart URL for ${flowType} flow:`, redirectUrl);

    return redirectUrl;
  } catch (error) {
    logger.error(`Error creating cart URL for ${flowType} flow:`, error);
    return "/checkout"; // Always return checkout URL even in case of error
  }
};

/**
 * Add variety pack metadata to URL parameters if the product is a variety pack
 * @param {Object} mainProduct - The main product object
 * @param {String} queryParams - Existing query parameters
 * @returns {String} Updated query parameters with variety pack metadata
 */
const addVarietyPackMetadata = (mainProduct, queryParams) => {
  if (mainProduct.isVarietyPack && mainProduct.varietyPackId) {
    // Add variety pack metadata to the URL
    const varietyPackParams = `&is_variety_pack=true&variety_pack_id=${mainProduct.varietyPackId}`;
    return queryParams + varietyPackParams;
  }
  return queryParams;
};

/**
 * Clean up cart-related URL parameters
 * This function should be called after processing URL parameters
 * @param {String} flowType - Type of flow (ed, hair, wl, etc.)
 * @returns {void}
 */
export const cleanupCartUrlParameters = (flowType = "ed") => {
  if (typeof window === "undefined") return;

  // Keep only the flow parameter and remove others
  const flowParam =
    flowType === "ed"
      ? "ed-flow=1"
      : flowType === "wl"
      ? "wl-flow=1"
      : flowType === "hair"
      ? "hair-flow=1"
      : flowType === "mh"
      ? "mh-flow=1"
      : `${flowType}-flow=1`;

  let newUrl = window.location.pathname + `?${flowParam}`;
  try {
    const current = new URLSearchParams(window.location.search);
    if (current.get("glp2-checkout") === "1") {
      newUrl += "&glp2-checkout=1";
    }
  } catch (_) {
    // ignore
  }
  logger.log(`Cleaning up URL parameters, preserving flow type: ${flowType}`);
  window.history.replaceState({}, document.title, newUrl);
};

/**
 * Manual product ID mapping for fallback purposes
 * This should only be used if the API call fails
 */
const FALLBACK_PRODUCT_MAPPING = {
  // Main products
  Viagra: "260",
  Cialis: "261",
  Tadalafil: "259",
  Sildenafil: "258",
  Chewalis: "261",

  // Add-on products - ED flow
  "testosterone-support": "262914",
  "lidocaine-cream": "276",
  "lidocaine-spray": "52162",
  "durex-condoms": "13534",
  "rocky-essential-cap": "353755",
  "dhm-blend": "323626",

  // Add-on products - WL cross sell (using exact product names)
  "MyRocky Essential Cap": "353755",
  "Essential T-Boost": "323579",
  "Ovulation Test Kit": "287538",
  "Perimenopause Test Kit": "287539",
};

/**
 * Set initial product cache from fallback data
 * This initializes the cache with fallback data to ensure functionality
 * even if the first API call fails
 */
if (typeof window !== "undefined" && !productCache.lastUpdated) {
  productCache = {
    byName: { ...FALLBACK_PRODUCT_MAPPING },
    bySlug: {},
    byInternalId: {},
    lastUpdated: new Date().getTime(),
  };
}
