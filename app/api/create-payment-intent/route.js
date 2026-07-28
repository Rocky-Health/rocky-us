import { NextResponse } from "next/server";
import Stripe from "stripe";
import { logger } from "@/utils/devLogger";
import { cookies } from "next/headers";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");
const BASE_URL = process.env.BASE_URL;

export async function POST(req) {
  try {
    const requestData = await req.json();

    const {
      orderId,
      amount, // Amount in cents
      paymentMethodId, // Payment method ID from PaymentElement
      customerEmail,
      customerName,
      billingDetails,
      metadata = {},
      paymentAttemptId,
    } = requestData;

    // Validation
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Valid amount is required" },
        { status: 400 }
      );
    }

    // Stripe minimum amount requirement: $0.50 USD (50 cents)
    const MINIMUM_AMOUNT_CENTS = 50; 
    if (amount < MINIMUM_AMOUNT_CENTS) {
      logger.warn(
        `Amount too small for Stripe: ${amount} cents (minimum: ${MINIMUM_AMOUNT_CENTS} cents / $0.50 USD)`
      );
      return NextResponse.json(
        {
          success: false,
          error: `Payment amount must be at least $0.50 USD. Current amount: $${(amount / 100).toFixed(2)}`,
          details: {
            amount_cents: amount,
            minimum_cents: MINIMUM_AMOUNT_CENTS,
            message: "Stripe requires a minimum charge of $0.50 USD",
          },
        },
        { status: 400 }
      );
    }

    if (!paymentMethodId) {
      return NextResponse.json(
        { success: false, error: "Payment method is required" },
        { status: 400 }
      );
    }

    logger.log("=== CREATING PAYMENT INTENT ===");
    logger.log("Order ID:", orderId);
    logger.log("Amount:", amount, "cents");
    logger.log("Payment Method:", paymentMethodId);
    logger.log("Customer:", customerEmail);
    logger.log("================================");

    // Get or create Stripe customer (minimal sync operations - only what's needed for PaymentIntent)
    let stripeCustomerId = null;
    let userId = null;
    let authToken = null;
    let needsWooCommerceUpdate = false; // Flag to update WooCommerce async later

    try {
      const cookieStore = await cookies();
      userId = cookieStore.get("userId");
      authToken = cookieStore.get("authToken");

      // Check if we have Stripe customer ID in cookies first (fastest path - no API calls)
      const cachedStripeCustomerId = cookieStore.get("stripeCustomerId");
      if (cachedStripeCustomerId && cachedStripeCustomerId.value) {
        stripeCustomerId = cachedStripeCustomerId.value;
        logger.log(
          "Using cached Stripe customer ID from cookies:",
          stripeCustomerId
        );
      } else if (userId && authToken) {
        // Cookie not found - create Stripe customer quickly (don't wait for WooCommerce lookup)
        // This is faster than fetching from WooCommerce first
        logger.log("Creating new Stripe customer (fast path)...");
        const stripeCustomer = await stripe.customers.create({
          email: customerEmail,
          name: customerName,
          metadata: {
            woocommerce_user_id: userId.value,
          },
        });

        stripeCustomerId = stripeCustomer.id;
        logger.log("Created new Stripe customer:", stripeCustomerId);

        // Save to cookies immediately (fast)
        cookieStore.set("stripeCustomerId", stripeCustomerId);
        logger.log("Saved new Stripe customer ID to cookies");

        // Mark that we need to update WooCommerce async later
        needsWooCommerceUpdate = true;
      }
    } catch (customerError) {
      logger.error(
        "Error creating Stripe customer:",
        customerError.message
      );
      // Continue without customer ID - payment can still succeed
    }

    // ========================================
    // CRITICAL: Attach PaymentMethod to Customer BEFORE creating PaymentIntent
    // This is required for the PaymentMethod to be reusable for renewals.
    // If a PaymentMethod is used in a PaymentIntent without Customer attachment,
    // Stripe won't allow it to be reused later.
    // ========================================
    if (stripeCustomerId && paymentMethodId) {
      try {
        // Attach payment method to customer (synchronous - must complete before PaymentIntent)
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: stripeCustomerId,
        });
        logger.log("✅ Payment method attached to customer (before PaymentIntent)");
      } catch (attachError) {
        if (attachError.code === "resource_already_exists") {
          logger.log("Payment method already attached to customer");
        } else {
          logger.warn(
            "Failed to attach payment method before PaymentIntent:",
            attachError.message
          );
          // Continue anyway - payment might still work, but renewals may fail
          // This is a critical error for renewals, but we don't want to block the payment
        }
      }
    }

    // Create PaymentIntent with manual capture for authorization-only payments
    // This will create an "uncaptured" payment in Stripe dashboard
    const paymentIntentData = {
      amount: Math.round(amount),
      currency: "usd",
      payment_method: paymentMethodId,
      capture_method: "manual", // Authorization only - payment remains uncaptured
      confirm: true, // Confirm immediately to authorize the payment
      // Save the card on the customer so it shows up next checkout and can be
      // charged off-session for renewals. Stripe attaches it after confirm.
      setup_future_usage: "off_session",
      description: `Order #${orderId}`,
      receipt_email: customerEmail || undefined,
      return_url: `${
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
      }/checkout/order-received/${orderId}`,
      metadata: {
        order_id: orderId,
        customer_name: customerName,
        ...metadata,
      },
      // Configure automatic payment methods to not allow redirects
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
    };

    // Add customer ID if available
    if (stripeCustomerId) {
      paymentIntentData.customer = stripeCustomerId;
      logger.log(
        "Payment intent will be linked to customer:",
        stripeCustomerId
      );
    }

    // Dedupes duplicate submits of the same attempt; falls back to the
    // payment method id for clients that don't send an attempt id yet.
    const paymentIntent = await stripe.paymentIntents.create(paymentIntentData, {
      idempotencyKey: `create-payment-intent-${orderId}-${
        paymentAttemptId || paymentMethodId
      }`,
    });

    logger.log("✅ PaymentIntent created and confirmed:", {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      capture_method: paymentIntent.capture_method,
      captured: paymentIntent.captured,
    });

    // ========================================
    // ASYNC OPERATIONS (non-blocking)
    // Perform customer updates after PaymentIntent is created
    // These run in the background and don't block the response
    // ========================================
    if (stripeCustomerId && paymentMethodId) {
      // Fire and forget - don't await these operations
      const asyncOperations = [];

      // Set as default payment method (non-critical for initial payment)
      asyncOperations.push(
        stripe.customers
          .update(stripeCustomerId, {
            invoice_settings: {
              default_payment_method: paymentMethodId,
            },
          })
          .then(() => {
            logger.log("✅ Set payment method as default (async)");
          })
          .catch((defaultError) => {
            logger.warn("Failed to set default payment method (async):", defaultError.message);
          })
      );

      // Update WooCommerce metadata if needed (async)
      if (needsWooCommerceUpdate && userId && authToken) {
        asyncOperations.push(
          axios
            .put(
              `${BASE_URL}/wp-json/wc/v3/customers/${userId.value}`,
              {
                meta_data: [
                  {
                    key: "_stripe_customer_id",
                    value: stripeCustomerId,
                  },
                ],
              },
              {
                headers: {
                  Authorization: authToken.value,
                  "Content-Type": "application/json",
                },
              }
            )
            .then(() => {
              logger.log("✅ Saved Stripe customer ID to WooCommerce (async)");
            })
            .catch((metaError) => {
              logger.error(
                "Failed to save Stripe customer ID to WooCommerce (async):",
                metaError.message
              );
            })
        );
      }

      // Execute all async operations in parallel (fire and forget)
      Promise.all(asyncOperations).catch((asyncError) => {
        logger.error("Error in async customer operations:", asyncError);
        // Don't throw - these are non-critical operations
      });
    }

    // Handle successful authorization (requires_capture)
    if (paymentIntent.status === "requires_capture") {
      const chargeId = paymentIntent.latest_charge || null;

      return NextResponse.json({
        success: true,
        paymentIntent: paymentIntent,
        chargeId: chargeId,
        stripeCustomerId: stripeCustomerId || null,
      });
    }

    // Handle payments requiring action (e.g., 3D Secure)
    // This is NOT a success - payment is not authorized yet
    // Only return success after 3DS is completed and payment is authorized
    if (paymentIntent.status === "requires_action") {
      logger.log("⚠️ Payment requires 3D Secure authentication - NOT authorized yet");
      return NextResponse.json({
        success: false,
        requiresAction: true,
        paymentIntent: paymentIntent,
        clientSecret: paymentIntent.client_secret,
        stripeCustomerId: stripeCustomerId || null,
        error: "3D Secure authentication required. Please complete authentication.",
      });
    }

    // Handle incomplete payments (3DS started but not completed)
    if (paymentIntent.status === "incomplete") {
      logger.log("⚠️ Payment is incomplete - 3DS authentication was not completed");
      return NextResponse.json({
        success: false,
        paymentIntent: paymentIntent,
        stripeCustomerId: stripeCustomerId || null,
        error: "Payment incomplete. 3D Secure authentication was not completed.",
      });
    }

    // Handle successful payment (if capture_method was automatic)
    if (paymentIntent.status === "succeeded") {
      const chargeId = paymentIntent.latest_charge || null;

      return NextResponse.json({
        success: true,
        paymentIntent: paymentIntent,
        chargeId: chargeId,
        stripeCustomerId: stripeCustomerId || null,
      });
    }

    // Handle failed payment
    if (
      paymentIntent.status === "canceled" ||
      paymentIntent.status === "requires_payment_method"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: paymentIntent.last_payment_error?.message || "Payment failed",
          paymentIntent: paymentIntent,
        },
        { status: 400 }
      );
    }

    // Handle other statuses
    return NextResponse.json(
      {
        success: false,
        error: `Unexpected payment status: ${paymentIntent.status}`,
        paymentIntent: paymentIntent,
      },
      { status: 400 }
    );
  } catch (error) {
    logger.error("❌ PaymentIntent creation failed:", error);

    // Handle Stripe-specific errors
    let userFriendlyMessage = "Failed to initialize payment. Please try again.";
    if (error.type === "StripeCardError") {
      userFriendlyMessage = error.message;
    } else if (error.type === "StripeInvalidRequestError") {
      userFriendlyMessage =
        "Invalid payment request. Please check your details and try again.";
    } else if (error.type === "StripeAPIError") {
      userFriendlyMessage =
        "Payment service unavailable. Please try again later.";
    }

    return NextResponse.json(
      {
        success: false,
        error: userFriendlyMessage,
        details: {
          message: error.message,
          type: error.type,
          code: error.code,
        },
      },
      { status: error.statusCode || 500 }
    );
  }
}
