import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { logger, redactSensitive } from "@/utils/devLogger";

const BASE_URL = process.env.BASE_URL;

/**
 * API endpoint for batch migrating cart items
 * Receives an array of cart items and adds them all at once to the server cart
 */
export async function POST(req) {
  try {
    logger.log("Starting cart migration API endpoint");

    const { items } = await req.json();
    logger.log(
      `Received cart items for migration:`,
      JSON.stringify(redactSensitive(items))
    );

    const cookieStore = await cookies();
    const encodedCredentials = cookieStore.get("authToken");

    logger.log(
      "Authentication check:",
      encodedCredentials ? "Auth token present" : "Auth token missing"
    );

    if (!encodedCredentials) {
      logger.log("Cart migration failed: User not authenticated");
      return NextResponse.json(
        {
          error: "User not authenticated",
        },
        { status: 401 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      logger.log("Cart migration failed: No valid cart items provided");
      return NextResponse.json(
        {
          error: "No valid cart items provided",
        },
        { status: 400 }
      );
    }

    logger.log(`Processing batch migration of ${items.length} cart items`);

    // FIRST STEP: Always fetch the cart first to get a nonce
    let currentNonce = "";

    try {
      logger.log("Fetching cart to establish nonce...");
      const cartResponse = await axios.get(
        `${BASE_URL}/wp-json/wc/store/cart`,
        {
          headers: {
            Authorization: `${encodedCredentials.value}`,
          },
        }
      );

      // Extract nonce from response headers
      if (cartResponse.headers && cartResponse.headers.nonce) {
        currentNonce = cartResponse.headers.nonce;
        logger.log("Got initial nonce from cart response");
        cookieStore.set("cart-nonce", currentNonce);
      } else {
        logger.log(
          "No nonce in cart response headers, headers:",
          Object.keys(cartResponse.headers).join(", ")
        );
      }
    } catch (cartError) {
      logger.error(
        "Error fetching cart to get initial nonce:",
        cartError.message,
        "\nResponse data:",
        cartError.response?.data || "No response data",
        "\nResponse status:",
        cartError.response?.status || "No status"
      );
      // Continue without a nonce and handle possible errors later
    }

    // Use batch processing for better performance when migrating multiple items
    let successfulItems = 0;
    let failedItems = 0;
    let lastError = null;
    let updatedCart = null;

    // Try batch processing first if we have multiple items
    if (items.length > 1) {
      try {
        logger.log(`Attempting batch migration of ${items.length} items`);

        // Transform items for batch endpoint format
        const batchItems = items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          variationId: item.variationId || undefined,
          // Include any additional metadata from the original item
          ...(item.meta_data && { meta_data: item.meta_data }),
          ...(item.isSubscription && { isSubscription: item.isSubscription }),
          ...(item.subscriptionPeriod && {
            subscriptionPeriod: item.subscriptionPeriod,
          }),
          ...(item.attributes && { attributes: item.attributes }),
        }));

        // Use our internal batch endpoint which handles WooCommerce batch API
        const batchResponse = await fetch(
          `${
            process.env.NEXTAUTH_URL || "http://localhost:3000"
          }/api/cart/add-items-batch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Cookie: `authToken=${encodedCredentials.value}; cart-nonce=${
                currentNonce || ""
              }`,
            },
            body: JSON.stringify({ items: batchItems }),
          }
        );

        if (batchResponse.ok) {
          const batchResult = await batchResponse.json();
          logger.log("Batch migration result:", batchResult);

          if (batchResult.success) {
            successfulItems = batchResult.added_items || 0;
            failedItems = batchResult.failed_items || 0;
            updatedCart = batchResult.cart;

            logger.log(
              `Batch migration completed: ${successfulItems}/${items.length} items migrated`
            );
          } else {
            throw new Error(batchResult.error || "Batch migration failed");
          }
        } else {
          logger.error(
            "Batch endpoint returned error status:",
            batchResponse.status
          );
          throw new Error("Batch migration failed with HTTP error");
        }
      } catch (batchError) {
        logger.error(
          "Batch migration failed, falling back to individual processing:",
          batchError
        );

        // Reset counters for fallback processing
        successfulItems = 0;
        failedItems = 0;

        // Fallback to individual processing
        await processItemsIndividually();
      }
    } else {
      // For single item, process individually (no batch overhead)
      logger.log("Single item migration, processing individually");
      await processItemsIndividually();
    }

    // Individual processing function (used for fallback and single items)
    async function processItemsIndividually() {
      for (const item of items) {
        try {
          logger.log(`Attempting to add item to cart: ${item.productId}`);

          // Prepare headers with the current nonce if available
          const headers = {
            Authorization: `${encodedCredentials.value}`,
            "Content-Type": "application/json",
          };

          if (currentNonce) {
            headers["Nonce"] = currentNonce;
            headers["X-WC-Store-API-Nonce"] = currentNonce;
          }

          // Make the request to add the item
          const response = await axios.post(
            `${BASE_URL}/wp-json/wc/store/cart/add-item`,
            {
              id: item.productId,
              quantity: item.quantity,
              variation_id: item.variationId || undefined,
            },
            { headers }
          );

          // Store updated cart from successful response
          updatedCart = response.data;

          // Update nonce if available in response
          if (response.headers && response.headers.nonce) {
            currentNonce = response.headers.nonce;
            cookieStore.set("cart-nonce", currentNonce);
            logger.log("Updated nonce from item add response");
          }

          successfulItems++;
          logger.log(`Successfully added item ${item.productId} to cart`);
        } catch (err) {
          // Check if this is a nonce error and we need to retry
          const isNonceError =
            err.response?.data?.code === "woocommerce_rest_missing_nonce" ||
            (err.response?.data?.message &&
              err.response?.data?.message.includes("nonce"));

          if (isNonceError && !item.retried) {
            logger.log(
              `Nonce error detected, retrying item ${item.productId} with direct approach...`
            );

            try {
              // For the very first request, WooCommerce might not require a nonce for cart creation
              // Try a direct request with just authentication
              const retryResponse = await axios.post(
                `${BASE_URL}/wp-json/wc/store/cart/add-item`,
                {
                  id: item.productId,
                  quantity: item.quantity,
                  variation_id: item.variationId || undefined,
                },
                {
                  headers: {
                    Authorization: `${encodedCredentials.value}`,
                    "Content-Type": "application/json",
                  },
                }
              );

              // If successful, update nonce and cart
              if (retryResponse.headers && retryResponse.headers.nonce) {
                currentNonce = retryResponse.headers.nonce;
                cookieStore.set("cart-nonce", currentNonce);
                logger.log("Got nonce from retry response");
              }

              updatedCart = retryResponse.data;
              successfulItems++;
              logger.log(
                `Successfully added item ${item.productId} to cart on retry`
              );
              continue; // Skip the error handling below
            } catch (retryErr) {
              logger.error(
                `Retry failed for item ${item.productId}:`,
                retryErr.message,
                "\nResponse data:",
                retryErr.response?.data || "No response data"
              );
            }
          }

          // Regular error handling
          failedItems++;
          lastError = err;
          logger.error(
            `Error adding item ${item.productId} to cart:`,
            err.message,
            "\nResponse data:",
            err.response?.data || "No response data",
            "\nResponse status:",
            err.response?.status || "No status code"
          );
        }
      }
    }

    // If all items failed, return an error
    if (successfulItems === 0 && failedItems > 0) {
      logger.log("Cart migration failed: Could not add any items to cart");

      return NextResponse.json(
        {
          error: "Failed to migrate any cart items",
          details: lastError
            ? {
                message: lastError.message,
                response: lastError.response?.data || null,
                status: lastError.response?.status || null,
              }
            : null,
        },
        { status: 500 }
      );
    }

    // Return success or partial success
    logger.log(
      `Cart migration completed: ${successfulItems}/${items.length} items migrated`
    );
    return NextResponse.json({
      success: true,
      message:
        failedItems > 0
          ? `Cart migration partially successful (${successfulItems}/${items.length} items migrated)`
          : "Cart migrated successfully",
      migrated_items: successfulItems,
      failed_items: failedItems,
      cart: updatedCart,
    });
  } catch (error) {
    logger.error(
      "Cart migration error:",
      error.message,
      "\nResponse data:",
      error.response?.data || "No response data"
    );

    return NextResponse.json(
      {
        error: "Failed to migrate cart",
      },
      { status: 500 }
    );
  }
}
