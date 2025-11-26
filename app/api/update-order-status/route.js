import { NextResponse } from "next/server";
import axios from "axios";
import { logger } from "@/utils/devLogger";

const BASE_URL = process.env.BASE_URL;
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

export async function POST(req) {
  try {
    const requestData = await req.json();

    const {
      orderId,
      status,
      paymentIntentId,
      chargeId,
      paymentMethodId, // Critical for WooCommerce to capture payment
      paymentMethod,
      currency,
      cardBrand,
      cardLast4,
      errorMessage, // For failed status
      stripeCustomerId, // Stripe customer ID
    } = requestData;

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    logger.log("=== UPDATING ORDER STATUS ===");
    logger.log("Order ID:", orderId);
    logger.log("Status:", status);
    logger.log("Payment Intent:", paymentIntentId);
    logger.log("Charge ID:", chargeId);
    logger.log("Payment Method ID:", paymentMethodId);
    logger.log("Stripe Customer ID:", stripeCustomerId);
    logger.log("==============================");

    const metaData = [];

    // Add Stripe customer ID - CRITICAL for linking payment to customer
    if (stripeCustomerId) {
      metaData.push({ key: "_stripe_customer_id", value: stripeCustomerId });
      logger.log("✅ Added Stripe customer ID:", stripeCustomerId);
    }

    // Add payment intent ID with both key names for compatibility
    if (paymentIntentId) {
      metaData.push({ key: "_stripe_intent_id", value: paymentIntentId });
      metaData.push({ key: "_payment_intent_id", value: paymentIntentId });
      logger.log("✅ Added Payment Intent ID:", paymentIntentId);
    }

    if (chargeId) {
      metaData.push({ key: "_stripe_charge_id", value: chargeId });
      metaData.push({ key: "_transaction_id", value: chargeId });
    }

    // CRITICAL: PaymentMethod ID is required for WooCommerce to capture
    // Add with both key names for compatibility
    if (paymentMethodId) {
      metaData.push({ key: "_stripe_source_id", value: paymentMethodId });
      metaData.push({ key: "_payment_method_token", value: paymentMethodId });
      logger.log("✅ Added PaymentMethod ID for capture:", paymentMethodId);
    }

    // Handle capture status based on actual Stripe payment status
    if (status === "on-hold") {
      // Check if payment was actually captured by Stripe
      // Since we use automatic capture for PaymentElement compatibility,
      // the payment might already be captured
      metaData.push({ key: "_stripe_charge_captured", value: "no" });
      logger.log("✅ Marked payment as uncaptured (manual processing mode)");
    }

    if (paymentMethod) {
      metaData.push({ key: "_payment_method", value: paymentMethod });
      metaData.push({ key: "_payment_method_title", value: "Stripe" });
    }

    if (currency) {
      metaData.push({ key: "_stripe_currency", value: currency });
    }

    if (cardBrand) {
      metaData.push({ key: "_stripe_card_brand", value: cardBrand });
    }

    if (cardLast4) {
      metaData.push({ key: "_stripe_card_last4", value: cardLast4 });
    }

    const updateData = {
      status: status,
      payment_method: paymentMethod || "stripe_cc",
      payment_method_title: "Stripe",
    };

    // Add metadata to update
    if (metaData.length > 0) {
      updateData.meta_data = metaData;
    }

    // Prepare order note based on status
    let orderNote = "";
    if (status === "on-hold" && (chargeId || paymentIntentId)) {
      const reference = chargeId || paymentIntentId;
      const pmNote = paymentMethodId
        ? ` | Payment Method: ${paymentMethodId}`
        : "";
      orderNote = `Payment processed via Stripe (${reference}${pmNote}). Marked for manual review.`;
    } else if (status === "processing" && (chargeId || paymentIntentId)) {
      const reference = chargeId || paymentIntentId;
      const pmNote = paymentMethodId
        ? ` | Payment Method: ${paymentMethodId}`
        : "";
      orderNote = `Payment completed via Stripe (${reference}${pmNote}).`;
    } else if (status === "processing" && paymentMethod === "free_order") {
      // Free order (100% discount)
      orderNote =
        errorMessage ||
        "Free order - 100% discount applied. No payment required.";
    } else if (status === "failed") {
      orderNote = `Payment failed: ${errorMessage || "Unknown error"}`;
    }

    logger.log("Update payload:", JSON.stringify(updateData, null, 2));

    // Update order using WooCommerce REST API
    const response = await axios.put(
      `${BASE_URL}/wp-json/wc/v3/orders/${orderId}`,
      updateData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${CONSUMER_KEY}:${CONSUMER_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    logger.log("Order updated:", response.data.id, response.data.status);

    // Add order note
    if (orderNote) {
      await axios.post(
        `${BASE_URL}/wp-json/wc/v3/orders/${orderId}/notes`,
        {
          note: orderNote,
          customer_note: false,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              `${CONSUMER_KEY}:${CONSUMER_SECRET}`
            ).toString("base64")}`,
          },
        }
      );
      logger.log("Order note added");
    }

    return NextResponse.json({
      success: true,
      order: {
        id: response.data.id,
        status: response.data.status,
        order_key: response.data.order_key,
        total: response.data.total,
      },
    });
  } catch (error) {
    logger.error("❌ Failed to update order status:", error);
    logger.error("Error details:", error.response?.data || error.message);

    return NextResponse.json(
      {
        error: "Failed to update order status",
        details: error.response?.data || error.message,
      },
      { status: error.response?.status || 500 }
    );
  }
}
