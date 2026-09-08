import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";

const BASE_URL = process.env.BASE_URL;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const encodedCredentials = cookieStore.get("authToken");

    if (!encodedCredentials) {
      // For unauthenticated users, we'll check for a cookie that might contain local cart data
      const localCart = cookieStore.get("localCart");

      if (localCart) {
        try {
          // The cookie value is URL-encoded on write (saveLocalCart) so that
          // names with ";" or non-ASCII (e.g. "®") survive the round-trip.
          // Fall back to the raw value for cookies written before that change.
          let cookieValue = localCart.value;
          try {
            cookieValue = decodeURIComponent(localCart.value);
          } catch (decodeError) {
            cookieValue = localCart.value;
          }

          // Try to parse the local cart data from the cookie
          let parsedCart;
          try {
            parsedCart = JSON.parse(cookieValue);
          } catch (parseError) {
            // Legacy cookies may not have been encoded; try the raw value.
            parsedCart = JSON.parse(localCart.value);
          }
          logger.log(
            "Retrieved local cart from cookie with items:",
            parsedCart.items?.length || 0
          );

          // Ensure items exists and is an array
          if (!parsedCart.items || !Array.isArray(parsedCart.items)) {
            logger.warn(
              "Local cart missing items array, initializing empty cart"
            );
            parsedCart.items = [];
          }

          // Ensure each item has the required properties for display
          const enhancedItems = parsedCart.items.map((item) => {
            // Create a proper display structure for each item
            return {
              ...item,
              // Ensure images exist in the right format
              images:
                item.images && item.images.length > 0
                  ? item.images
                  : [{ thumbnail: "", src: "" }],
              // Ensure prices are properly formatted
              prices: {
                currency_symbol: "$",
                regular_price:
                  typeof item.price === "number" ? item.price * 100 : 0,
                sale_price:
                  typeof item.price === "number" ? item.price * 100 : 0,
              },
              // Ensure totals exist
              totals: {
                total:
                  typeof item.price === "number"
                    ? item.price * item.quantity
                    : 0,
                subtotal:
                  typeof item.price === "number"
                    ? item.price * item.quantity
                    : 0,
              },
            };
          });

          // Return the enhanced local cart data
          return NextResponse.json({
            items: enhancedItems,
            total_items: parsedCart.total_items || 0,
            total_price: parsedCart.total_price || "0.00",
            needs_shipping: true,
            coupons: [],
            shipping_rates: parsedCart.shipping_rates || [],
            is_local_cart: true, // Add a flag to indicate this is a local cart
          });
        } catch (e) {
          logger.error("Error parsing local cart from cookie:", e);
        }
      }

      // If no local cart data is found or parsing fails, return an empty cart
      logger.log("User not authenticated, returning empty cart");

      return NextResponse.json({
        items: [],
        total_items: 0,
        total_price: "0.00",
        needs_shipping: false,
        coupons: [],
        shipping_rates: [],
        is_local_cart: true,
      });
    }

    // Fetch cart and customer address in parallel — both are independent WP calls
    const userId = cookieStore.get("userId");

    const [response, customerResponse] = await Promise.all([
      axios.get(`${BASE_URL}/wp-json/wc/store/cart`, {
        headers: {
          Authorization: `${encodedCredentials.value}`,
        },
      }),
      userId
        ? axios
            .get(`${BASE_URL}/wp-json/wc/v3/customers/${userId.value}`, {
              headers: {
                Authorization: encodedCredentials.value,
              },
            })
            .catch((addressError) => {
              logger.log("Could not fetch customer address data:", addressError.message);
              return null; // Non-blocking — address failure must not fail cart
            })
        : Promise.resolve(null),
    ]);

    cookieStore.set("cart-nonce", response.headers.nonce);

    // Ensure the response has the expected structure
    const responseData = response.data;
    if (!responseData.items || !Array.isArray(responseData.items)) {
      logger.warn("Server returned invalid cart structure, fixing...");
      responseData.items = responseData.items || [];
    }

    // Merge customer address data if available
    if (customerResponse?.data) {
      const { billing, shipping } = customerResponse.data;
      if (billing || shipping) {
        logger.log("Adding customer address data to cart response");
        if (billing) responseData.billing_address = billing;
        if (shipping) responseData.shipping_address = shipping;
      }
    }

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error("Error getting cart:", error.response?.data || error.message);

    // Return a valid cart structure even on error
    return NextResponse.json(
      {
        error: error.response?.data?.message || "Failed to get cart",
        items: [], // Always include empty items array
        total_items: 0,
        total_price: "0.00",
        coupons: [],
        shipping_rates: [],
      },
      { status: error.response?.status || 500 }
    );
  }
}

export async function PUT(req) {
  try {
    const { itemKey, quantity } = await req.json();
    const cookieStore = await cookies();

    const encodedCredentials = cookieStore.get("authToken");

    if (!encodedCredentials) {
      return NextResponse.json(
        {
          error: "Not authenticated..",
          items: [], // Always include empty items array to prevent undefined errors
          total_items: 0,
          total_price: "0.00",
        },
        { status: 401 }
      );
    }

    const response = await axios.post(
      `${BASE_URL}/wp-json/wc/store/cart/update-item`,
      { key: itemKey, quantity },
      {
        headers: {
          Authorization: `${encodedCredentials.value}`,
          nonce: cookieStore.get("cart-nonce")?.value,
        },
      }
    );

    // Ensure response data has the expected structure
    const responseData = response.data;
    if (!responseData.items || !Array.isArray(responseData.items)) {
      logger.warn("Server returned invalid cart structure, fixing...");
      responseData.items = responseData.items || [];
    }

    return NextResponse.json(responseData);
  } catch (error) {
    logger.error("Error updating cart:", error.response?.data || error.message);

    // Return a valid cart structure even on error
    return NextResponse.json(
      {
        error: error.response?.data?.message || "Failed to update cart",
        items: [], // Always include empty items array
        total_items: 0,
        total_price: "0.00",
      },
      { status: error.response?.status || 500 }
    );
  }
}

/**
 * DELETE method to properly remove items from the cart
 * This uses the dedicated remove-item endpoint instead of updating quantity to 0
 */
export async function DELETE(req) {
  try {
    const { itemKey } = await req.json();
    const cookieStore = await cookies();

    const encodedCredentials = cookieStore.get("authToken");

    if (!encodedCredentials) {
      return NextResponse.json(
        {
          error: "Not authenticated",
          items: [],
          total_items: 0,
          total_price: "0.00",
        },
        { status: 401 }
      );
    }

    // First, get the current cart to check the items
    const currentCartResponse = await axios.get(
      `${BASE_URL}/wp-json/wc/store/cart`,
      {
        headers: {
          Authorization: `${encodedCredentials.value}`,
        },
      }
    );

    const currentCart = currentCartResponse.data;

    // Helper function to check if Body Optimization Program can be removed
    const checkBodyOptimizationRemoval = (cartItems, itemToRemoveKey) => {
      const BODY_OPTIMIZATION_PROGRAM_ID = "148515";
      const WEIGHT_LOSS_PRODUCT_IDS = [
        "489523", // Compounded Tirzepatide
        "489799", // Compounded Semaglutide
        "142976", // Ozempic
        "160469", // Mounjaro
        "276274", // Wegovy
        "369795", // Rybelsus
        // Multi-month plan variation IDs (the variation ID is sent as the cart product ID)
        "490167", // Compounded Tirzepatide 3-month
        "490168", // Compounded Tirzepatide 6-month
        "490169", // Compounded Tirzepatide 12-month
        "490164", // Compounded Semaglutide 3-month
        "490165", // Compounded Semaglutide 6-month
        "490166", // Compounded Semaglutide 12-month
      ];

      const itemToRemove = cartItems.find(
        (item) => item.key === itemToRemoveKey
      );

      if (
        !itemToRemove ||
        itemToRemove.id !== parseInt(BODY_OPTIMIZATION_PROGRAM_ID)
      ) {
        return { allowed: true, message: "" };
      }

      const hasWeightLossProducts = cartItems.some(
        (item) =>
          WEIGHT_LOSS_PRODUCT_IDS.includes(item.id.toString()) &&
          item.key !== itemToRemoveKey
      );

      if (hasWeightLossProducts) {
        return {
          allowed: false,
          message:
            "Body Optimization Program cannot be removed while Weight Loss products are in your cart. Please remove the Weight Loss products first.",
        };
      }

      return { allowed: true, message: "" };
    };

    // Helper function to get items to remove (including Body Optimization Program when removing WL products)
    const getItemsToRemoveWithWL = (cartItems, itemToRemoveKey) => {
      const BODY_OPTIMIZATION_PROGRAM_ID = "148515";
      const WEIGHT_LOSS_PRODUCT_IDS = [
        "489523", // Compounded Tirzepatide
        "489799", // Compounded Semaglutide
        "142976", // Ozempic
        "160469", // Mounjaro
        "276274", // Wegovy
        "369795", // Rybelsus
        // Multi-month plan variation IDs (the variation ID is sent as the cart product ID)
        "490167", // Compounded Tirzepatide 3-month
        "490168", // Compounded Tirzepatide 6-month
        "490169", // Compounded Tirzepatide 12-month
        "490164", // Compounded Semaglutide 3-month
        "490165", // Compounded Semaglutide 6-month
        "490166", // Compounded Semaglutide 12-month
      ];

      const itemToRemove = cartItems.find(
        (item) => item.key === itemToRemoveKey
      );

      if (
        !itemToRemove ||
        !WEIGHT_LOSS_PRODUCT_IDS.includes(itemToRemove.id.toString())
      ) {
        return [itemToRemoveKey];
      }

      const bodyOptimizationItem = cartItems.find(
        (item) => item.id === parseInt(BODY_OPTIMIZATION_PROGRAM_ID)
      );

      const itemsToRemove = [itemToRemoveKey];

      if (bodyOptimizationItem) {
        itemsToRemove.push(bodyOptimizationItem.key);
        logger.log(
          "Also removing Body Optimization Program when removing Weight Loss product"
        );
      }

      return itemsToRemove;
    };

    // Helper function to get items to remove for variety pack products
    const getItemsToRemoveWithVarietyPack = (cartItems, itemToRemoveKey) => {
      const itemToRemove = cartItems.find(
        (item) => item.key === itemToRemoveKey
      );

      if (!itemToRemove) {
        return [itemToRemoveKey];
      }

      // Check if this item is part of a variety pack
      const isVarietyPack = itemToRemove.meta_data?.some(
        (meta) => meta.key === "_is_variety_pack" && meta.value === "true"
      );

      if (!isVarietyPack) {
        return [itemToRemoveKey];
      }

      // Get the variety pack ID
      const varietyPackId = itemToRemove.meta_data?.find(
        (meta) => meta.key === "_variety_pack_id"
      )?.value;

      if (!varietyPackId) {
        return [itemToRemoveKey];
      }

      // Find all items that are part of the same variety pack
      const varietyPackItems = cartItems.filter((item) =>
        item.meta_data?.some(
          (meta) =>
            meta.key === "_variety_pack_id" && meta.value === varietyPackId
        )
      );

      const itemsToRemove = varietyPackItems.map((item) => item.key);

      logger.log(
        `Removing variety pack products together: ${itemsToRemove.length} items`
      );

      return itemsToRemove;
    };

    // Check if Body Optimization Program removal is allowed
    const removalCheck = checkBodyOptimizationRemoval(
      currentCart.items,
      itemKey
    );
    if (!removalCheck.allowed) {
      logger.warn(
        "Body Optimization Program removal blocked:",
        removalCheck.message
      );
      return NextResponse.json(
        {
          error: removalCheck.message,
          items: currentCart.items || [],
          total_items: currentCart.total_items || 0,
          total_price: currentCart.total_price || "0.00",
        },
        // Business-rule rejection (not a server failure): use 409 Conflict so the
        // client shows the message instead of treating it as a transient 500 and
        // retrying in a loop.
        { status: 409 }
      );
    }

    // Get all items that should be removed
    const itemKeysToRemove = getItemsToRemoveWithWL(currentCart.items, itemKey);

    // Also check for variety pack products
    const varietyPackItemsToRemove = getItemsToRemoveWithVarietyPack(
      currentCart.items,
      itemKey
    );

    // Combine both arrays and remove duplicates
    const allItemsToRemove = [
      ...new Set([...itemKeysToRemove, ...varietyPackItemsToRemove]),
    ];

    // Remove all items. Carry the nonce forward from each WooCommerce response:
    // cookieStore.set() only stages the cookie on the OUTGOING response, so a
    // second cookieStore.get() within this same request would still return the
    // already-spent nonce and the next removal would fail. Tracking it locally
    // keeps every cascaded removal (e.g. WL product + Body Optimization Program)
    // using a valid nonce.
    let finalCartData = currentCart;
    let currentNonce = cookieStore.get("cart-nonce")?.value;
    const failedKeys = [];

    for (const keyToRemove of allItemsToRemove) {
      try {
        const response = await axios.post(
          `${BASE_URL}/wp-json/wc/store/cart/remove-item`,
          { key: keyToRemove },
          {
            headers: {
              Authorization: `${encodedCredentials.value}`,
              nonce: currentNonce,
            },
          }
        );

        // Update the cart data after each removal
        finalCartData = response.data;

        // Carry the refreshed nonce into the next removal in this request
        if (response.headers && response.headers.nonce) {
          currentNonce = response.headers.nonce;
          cookieStore.set("cart-nonce", response.headers.nonce);
        }

        logger.log(`Item ${keyToRemove} removed from server cart`);
      } catch (error) {
        logger.error(
          `Error removing item ${keyToRemove} from cart:`,
          error.response?.data || error.message
        );
        failedKeys.push(keyToRemove);
      }
    }

    // Ensure response data has the expected structure
    if (!finalCartData.items || !Array.isArray(finalCartData.items)) {
      logger.warn("Server returned invalid cart structure, fixing...");
      finalCartData.items = finalCartData.items || [];
    }

    // If any removal actually failed, do NOT report success. Returning the live
    // cart (rather than a fake 200) prevents the client/server desync that would
    // otherwise leave an item the user thinks is gone but the server still holds.
    if (failedKeys.length > 0) {
      return NextResponse.json(
        {
          error: "Some items couldn't be removed. Please try again.",
          items: finalCartData.items || [],
          total_items: finalCartData.total_items || 0,
          total_price: finalCartData.total_price || "0.00",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(finalCartData);
  } catch (error) {
    logger.error(
      "Error removing item from cart:",
      error.response?.data || error.message
    );

    return NextResponse.json(
      {
        error:
          error.response?.data?.message || "Failed to remove item from cart",
        items: [], // Always include empty items array
        total_items: 0,
        total_price: "0.00",
      },
      { status: error.response?.status || 500 }
    );
  }
}
