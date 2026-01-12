import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import axios from "axios";
import { logger } from "@/utils/devLogger";
import { validateSessionForAPI } from "@/utils/sessionValidator";

const BASE_URL = process.env.BASE_URL;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_API_VERSION = "2024-06-20";
const WC_USERNAME = process.env.WC_USERNAME;
const WC_PASSWORD = process.env.WC_PASSWORD;

/**
 * Helper function to get Stripe customer ID from cookies or WooCommerce metadata
 * @param {Object} cookieStore - Next.js cookie store
 * @param {string} userId - WooCommerce user ID
 * @param {string} authToken - Authentication token
 * @returns {Promise<string|null>} Stripe customer ID or null
 */
async function getStripeCustomerId(cookieStore, userId, authToken) {
  // Check cookies first (fastest path)
  let stripeCustomerId = cookieStore.get("stripeCustomerId")?.value;

  // If not in cookies, fetch from WooCommerce customer metadata
  if (!stripeCustomerId && BASE_URL && authToken && userId) {
    try {
      logger.log(
        "stripe-saved-cards: Fetching WooCommerce customer data for user:",
        userId
      );

      // Use basic auth with username:password from env, or fallback to admin token or user credentials
      let authHeader;
      if (WC_USERNAME && WC_PASSWORD) {
        authHeader = `Basic ${Buffer.from(
          `${WC_USERNAME}:${WC_PASSWORD}`
        ).toString("base64")}`;
        logger.log(
          "stripe-saved-cards: Using WC_USERNAME/WC_PASSWORD for authentication"
        );
      } else {
        authHeader = process.env.ADMIN_TOKEN || authToken;
        logger.log(
          "stripe-saved-cards: Using ADMIN_TOKEN or user credentials for authentication"
        );
      }

      const apiUrl = `${BASE_URL}/wp-json/wc/v3/customers/${userId}`;
      logger.log("stripe-saved-cards: WooCommerce API Request:", {
        url: apiUrl,
        userId: userId,
        hasAuth: !!authHeader,
      });

      const customerResponse = await axios.get(apiUrl, {
        headers: {
          Authorization: authHeader,
        },
      });

      logger.log("stripe-saved-cards: WooCommerce API Response:", {
        status: customerResponse.status,
        statusText: customerResponse.statusText,
        dataType: Array.isArray(customerResponse.data)
          ? "array"
          : typeof customerResponse.data,
        dataLength: Array.isArray(customerResponse.data)
          ? customerResponse.data.length
          : "N/A",
        hasData: !!customerResponse.data,
        fullResponse: JSON.stringify(customerResponse.data, null, 2),
      });

      // Using path parameter should return a single customer object
      const customerData = customerResponse.data;

      logger.log("stripe-saved-cards: Customer Data:", {
        customerId: customerData?.id,
        email: customerData?.email,
        metaDataCount: customerData?.meta_data?.length || 0,
        hasMetaData: !!customerData?.meta_data,
        allMetaKeys: customerData?.meta_data?.map((m) => m.key) || [],
      });

      const metaData = customerData.meta_data || [];

      // Look for existing Stripe customer ID in metadata
      // Search for wp_wc_stripe_customer_live (WooCommerce Stripe plugin format)
      logger.log(
        "stripe-saved-cards: Searching for wp_wc_stripe_customer_live in metadata..."
      );
      const stripeCustomerMeta = metaData.find(
        (meta) => meta.key === "wp_wc_stripe_customer_live"
      );

      if (stripeCustomerMeta) {
        logger.log("stripe-saved-cards: Found wp_wc_stripe_customer_live:", {
          key: stripeCustomerMeta.key,
          value: stripeCustomerMeta.value,
        });
      } else {
        logger.log(
          "stripe-saved-cards: wp_wc_stripe_customer_live not found in metadata"
        );
        // Log all Stripe-related keys for debugging
        const stripeRelatedKeys = metaData
          .filter((m) => m.key.toLowerCase().includes("stripe"))
          .map((m) => ({ key: m.key, value: m.value }));
        if (stripeRelatedKeys.length > 0) {
          logger.log(
            "stripe-saved-cards: Found Stripe-related metadata keys:",
            stripeRelatedKeys
          );
        }
      }

      if (stripeCustomerMeta && stripeCustomerMeta.value) {
        stripeCustomerId = stripeCustomerMeta.value;
        logger.log(
          "stripe-saved-cards: Found existing Stripe customer ID in WooCommerce:",
          stripeCustomerId
        );

        // Save to cookies for future requests
        cookieStore.set("stripeCustomerId", stripeCustomerId, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 365, // 1 year
        });
        logger.log(
          "stripe-saved-cards: Saved Stripe customer ID to cookies for future use"
        );
      }
    } catch (wooError) {
      logger.warn(
        "stripe-saved-cards: Error fetching Stripe customer ID from WooCommerce:",
        wooError.message
      );
      // Return null if fetch fails
    }
  }

  return stripeCustomerId || null;
}

/**
 * GET /api/stripe-saved-cards
 * Fetches saved payment methods (cards) for the authenticated user from Stripe
 */
export async function GET() {
  try {
    const cookieStore = await cookies();

    // Validate session for authenticated users
    const sessionError = await validateSessionForAPI(cookieStore, NextResponse);
    if (sessionError) {
      return sessionError;
    }

    const authToken = cookieStore.get("authToken");
    const userId = cookieStore.get("userId");

    // Check if user is authenticated
    if (!authToken || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authenticated",
          cards: [],
        },
        { status: 401 }
      );
    }

    // Check if Stripe is configured
    if (!STRIPE_SECRET_KEY) {
      logger.error("stripe-saved-cards: Missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        {
          success: false,
          message: "Stripe is not configured",
          cards: [],
        },
        { status: 500 }
      );
    }

    // Get Stripe customer ID - check cookies first, then fallback to WooCommerce
    const stripeCustomerId = await getStripeCustomerId(
      cookieStore,
      userId.value,
      authToken.value
    );

    // If no Stripe customer ID found, return empty cards
    if (!stripeCustomerId) {
      logger.log("stripe-saved-cards: No Stripe customer ID found for user");
      return NextResponse.json({
        success: true,
        message: "No saved cards found",
        cards: [],
        stripeCustomerId: null,
      });
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION,
    });

    // Fetch payment methods for the customer
    const paymentMethods = await stripe.paymentMethods.list({
      customer: stripeCustomerId,
      type: "card",
    });

    // Get the customer to find the default payment method
    let defaultPaymentMethodId = null;
    try {
      const customer = await stripe.customers.retrieve(stripeCustomerId);
      if (customer && !customer.deleted) {
        defaultPaymentMethodId =
          customer.invoice_settings?.default_payment_method || null;
      }
    } catch (customerError) {
      logger.warn(
        "stripe-saved-cards: Could not fetch customer for default payment method",
        customerError.message
      );
    }

    // Transform payment methods to a cleaner format
    const allCards = paymentMethods.data.map((pm) => ({
      id: pm.id,
      last4: pm.card?.last4 || "****",
      brand: pm.card?.brand || "unknown",
      exp_month: pm.card?.exp_month,
      exp_year: pm.card?.exp_year,
      is_default: pm.id === defaultPaymentMethodId,
      fingerprint: pm.card?.fingerprint,
      funding: pm.card?.funding, // credit, debit, prepaid
      created: pm.created,
    }));

    // Deduplicate cards by fingerprint - keep the default one or most recent
    const cardsByFingerprint = new Map();
    for (const card of allCards) {
      const key = card.fingerprint || card.id; // Use fingerprint, fallback to id if no fingerprint
      const existing = cardsByFingerprint.get(key);

      if (!existing) {
        // First card with this fingerprint
        cardsByFingerprint.set(key, card);
      } else {
        // Keep default card, or the most recent one
        if (
          card.is_default ||
          (!existing.is_default && card.created > existing.created)
        ) {
          cardsByFingerprint.set(key, card);
        }
      }
    }

    const savedCards = Array.from(cardsByFingerprint.values());

    // Sort so default card is first
    savedCards.sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return b.created - a.created; // Most recent first
    });

    logger.log("stripe-saved-cards: Found saved cards", {
      count: savedCards.length,
      customerId: stripeCustomerId,
    });

    return NextResponse.json({
      success: true,
      message:
        savedCards.length > 0
          ? "Saved cards retrieved"
          : "No saved cards found",
      cards: savedCards,
      stripeCustomerId: stripeCustomerId,
    });
  } catch (error) {
    logger.error(
      "stripe-saved-cards: Error fetching saved payment methods:",
      error.message
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch saved payment methods",
        error: error.message,
        cards: [],
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/stripe-saved-cards
 * Deletes a saved payment method from Stripe
 */
export async function DELETE(req) {
  try {
    const cookieStore = await cookies();

    // Validate session
    const sessionError = await validateSessionForAPI(cookieStore, NextResponse);
    if (sessionError) {
      return sessionError;
    }

    const authToken = cookieStore.get("authToken");
    const userId = cookieStore.get("userId");

    if (!authToken || !userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "Stripe is not configured" },
        { status: 500 }
      );
    }

    // Get Stripe customer ID - check cookies first, then fallback to WooCommerce
    const stripeCustomerId = await getStripeCustomerId(
      cookieStore,
      userId.value,
      authToken.value
    );

    if (!stripeCustomerId) {
      return NextResponse.json(
        { success: false, message: "No Stripe customer found" },
        { status: 400 }
      );
    }

    const { paymentMethodId } = await req.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, message: "Payment method ID is required" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION,
    });

    // Verify the payment method belongs to this customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method does not belong to this customer",
        },
        { status: 403 }
      );
    }

    // Detach the payment method from the customer
    await stripe.paymentMethods.detach(paymentMethodId);

    logger.log("stripe-saved-cards: Payment method deleted", {
      paymentMethodId,
      customerId: stripeCustomerId,
    });

    return NextResponse.json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    logger.error(
      "stripe-saved-cards: Error deleting payment method:",
      error.message
    );
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete card",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stripe-saved-cards
 * Sets a payment method as the default for the customer
 */
export async function PATCH(req) {
  try {
    const cookieStore = await cookies();

    // Validate session
    const sessionError = await validateSessionForAPI(cookieStore, NextResponse);
    if (sessionError) {
      return sessionError;
    }

    const authToken = cookieStore.get("authToken");
    const userId = cookieStore.get("userId");

    if (!authToken || !userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      );
    }

    if (!STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { success: false, message: "Stripe is not configured" },
        { status: 500 }
      );
    }

    // Get Stripe customer ID - check cookies first, then fallback to WooCommerce
    const stripeCustomerId = await getStripeCustomerId(
      cookieStore,
      userId.value,
      authToken.value
    );

    if (!stripeCustomerId) {
      return NextResponse.json(
        { success: false, message: "No Stripe customer found" },
        { status: 400 }
      );
    }

    const { paymentMethodId, makeDefault } = await req.json();

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, message: "Payment method ID is required" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: STRIPE_API_VERSION,
    });

    // Verify the payment method belongs to this customer
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
    if (paymentMethod.customer !== stripeCustomerId) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment method does not belong to this customer",
        },
        { status: 403 }
      );
    }

    if (makeDefault) {
      // Set as default payment method for the customer
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      logger.log("stripe-saved-cards: Set default payment method", {
        paymentMethodId,
        customerId: stripeCustomerId,
      });

      return NextResponse.json({
        success: true,
        message: "Card set as default",
      });
    }

    return NextResponse.json(
      { success: false, message: "No valid action provided" },
      { status: 400 }
    );
  } catch (error) {
    logger.error(
      "stripe-saved-cards: Error updating payment method:",
      error.message
    );
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update card",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
