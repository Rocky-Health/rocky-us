import { NextResponse } from "next/server";
import axios from "axios";
import { logger } from "@/utils/devLogger";
import { cookies } from "next/headers";
import { clearLocalCart } from "@/lib/cart/cartService";

const BASE_URL = process.env.BASE_URL;

export async function POST() {
  try {
    const cookieStore = await cookies();
    const encodedCredentials = cookieStore.get("authToken");
    const nonce = cookieStore.get("cart-nonce")?.value;

    if (!encodedCredentials) {
      // For unauthenticated users, we'll clear the local cart
      // Since this is server-side code, we need to clear the cookie but can't directly access localStorage
      cookieStore.set("localCart", "", {
        maxAge: -1,
        path: "/",
      });

      return NextResponse.json({
        success: true,
        message: "Local cart emptied",
        items: [],
        total_items: 0,
        total_price: "0.00",
      });
    }

    // For authenticated users, call the WordPress REST API endpoint.
    // Run the empty-cart POST and a cart GET (for nonce) in parallel.
    // The custom empty-cart endpoint does not return a WC nonce header, so we
    // fetch the cart simultaneously to reliably capture the nonce.
    try {
      const [response] = await Promise.all([
        axios.post(
          `${BASE_URL}/wp-json/custom/v1/empty-cart`,
          {},
          {
            headers: {
              Authorization: `${encodedCredentials.value}`,
              "X-WP-Nonce": nonce,
            },
          }
        ),
        // Parallel nonce refresh — result is discarded, only the nonce header matters
        axios
          .get(`${BASE_URL}/wp-json/wc/store/cart`, {
            headers: { Authorization: `${encodedCredentials.value}` },
          })
          .then((cartRes) => {
            const freshNonce = cartRes.headers?.nonce;
            if (freshNonce) {
              cookieStore.set("cart-nonce", freshNonce);
              logger.log("Cart nonce refreshed in parallel with empty-cart");
            }
          })
          .catch(() => {
            // Non-blocking — nonce fetch failure must not prevent empty from succeeding
          }),
      ]);

      // Also capture nonce from empty-cart response if the custom endpoint returns one
      if (response.headers?.nonce) {
        cookieStore.set("cart-nonce", response.headers.nonce);
      }

      logger.log("WordPress empty-cart endpoint successful");
      return NextResponse.json({
        success: true,
        message: "Cart emptied successfully",
        items: [],
        total_items: 0,
        total_price: "0.00",
      });
    } catch (wpError) {
      logger.error(
        "WordPress empty-cart endpoint failed:",
        wpError.response?.data || wpError.message
      );

      // Fallback: Try to clear cart using WooCommerce REST API
      try {
        logger.log("Attempting fallback cart clearing via WooCommerce API...");

        // Get current cart items first
        const cartResponse = await axios.get(
          `${BASE_URL}/wp-json/wc/store/cart`,
          {
            headers: {
              Authorization: `${encodedCredentials.value}`,
            },
          }
        );

        if (
          cartResponse.data &&
          cartResponse.data.items &&
          cartResponse.data.items.length > 0
        ) {
          // Remove each item individually
          for (const item of cartResponse.data.items) {
            try {
              await axios.post(
                `${BASE_URL}/wp-json/wc/store/cart/remove-item`,
                { key: item.key },
                {
                  headers: {
                    Authorization: `${encodedCredentials.value}`,
                    nonce: nonce,
                  },
                }
              );
              logger.log(`Removed item ${item.key} from cart`);
            } catch (itemError) {
              logger.error(
                `Failed to remove item ${item.key}:`,
                itemError.response?.data || itemError.message
              );
            }
          }
        }

        logger.log("Fallback cart clearing completed");
        return NextResponse.json({
          success: true,
          message: "Cart emptied successfully (fallback method)",
          items: [],
          total_items: 0,
          total_price: "0.00",
        });
      } catch (fallbackError) {
        logger.error(
          "Fallback cart clearing also failed:",
          fallbackError.response?.data || fallbackError.message
        );
        throw wpError; // Re-throw original error
      }
    }
  } catch (error) {
    logger.error("Error emptying cart:", error.response?.data || error.message);

    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.message || "Failed to empty cart",
        items: [],
        total_items: 0,
        total_price: "0.00",
      },
      { status: error.response?.status || 500 }
    );
  }
}
