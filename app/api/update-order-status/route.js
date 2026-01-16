import { NextResponse } from "next/server";
import axios from "axios";
import { logger } from "@/utils/devLogger";

const BASE_URL = process.env.BASE_URL;
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

const getIsoCountry3 = (countryCode) => {
  const code = String(countryCode || "").toUpperCase().trim();
  if (code.length === 3) return code;
  if (code === "US") return "USA";
  return code || "USA";
};

const mapWooToNorthbeamOrder = (order) => {
  if (!order || !order.id) return null;

  const purchaseTotal = parseFloat(order?.total ?? 0) || 0;
  const tax = parseFloat(order?.total_tax ?? 0) || 0;
  const shipping = parseFloat(order?.shipping_total ?? 0) || 0;
  const discountAmount = parseFloat(order?.discount_total ?? 0) || 0;
  const email = order?.billing?.email || "";
  const phone = order?.billing?.phone || "";
  const name = `${order?.billing?.first_name || ""} ${
    order?.billing?.last_name || ""
  }`.trim();
  const status = String(order?.status || "");
  const timeCandidate =
    order?.date_paid_gmt ||
    order?.date_created_gmt ||
    order?.date_paid ||
    order?.date_completed ||
    order?.date_created;

  const products = Array.isArray(order?.line_items)
    ? order.line_items.map((item) => {
        const qty = parseInt(item?.quantity || 1, 10) || 1;
        const unitPrice =
          (parseFloat(item?.total || 0) || 0) / Math.max(1, qty) || 0;
        const base = {
          id: item?.sku || String(item?.product_id || ""),
          product_id: String(item?.product_id || ""),
          name: item?.name || "",
          quantity: qty,
          price: unitPrice,
        };
        if (item?.variation_id) {
          base.variant_id = String(item.variation_id);
        }
        return base;
      })
    : [];

  const getStatusTag = (s) => {
    const map = {
      pending: "Pending",
      processing: "Processing",
      "on-hold": "On Hold",
      completed: "Completed",
      cancelled: "Cancelled",
      refunded: "Refunded",
      failed: "Failed",
    };
    return map[String(s || "").toLowerCase()] || "Pending";
  };
  const hasSubscription = products.some((p) =>
    /subscription/i.test(p?.name || "")
  );
  const lifecycle = hasSubscription
    ? order?.is_first_order
      ? "Subscription First Order"
      : "Subscription Recurring"
    : "OTC";

  const shippingAddress = order?.shipping
    ? {
        address1: order.shipping.address_1 || "",
        address2: order.shipping.address_2 || "",
        city: order.shipping.city || "",
        state: order.shipping.state || "",
        zip: order.shipping.postcode || "",
        country_code: getIsoCountry3(order.shipping.country),
      }
    : undefined;

  const rawCustomerId = order?.customer_id;
  const emailLower = (email || "").toString().trim().toLowerCase();
  const phoneDigits = (phone || "").toString().replace(/\D+/g, "");
  let canonicalCustomerId = "";
  if (rawCustomerId && Number(rawCustomerId) > 0) {
    canonicalCustomerId = `wc:${String(rawCustomerId)}`;
  } else if (emailLower) {
    canonicalCustomerId = `email:${emailLower}`;
  } else if (phoneDigits) {
    canonicalCustomerId = `phone:${phoneDigits}`;
  }

  return {
    order_id: String(order?.id),
    customer_id:
      canonicalCustomerId || String(order?.customer_id || email || ""),
    customer_id_canonical:
      canonicalCustomerId || String(order?.customer_id || email || ""),
    time_of_purchase: new Date(
      timeCandidate || order?.date_created || Date.now()
    ).toISOString(),
    currency: order?.currency || "USD",
    purchase_total: purchaseTotal,
    tax,
    shipping_cost: shipping,
    discount_codes: Array.isArray(order?.coupon_lines)
      ? order.coupon_lines.map((c) => c?.code).filter(Boolean)
      : [],
    discount_amount: discountAmount,
    customer_email: email,
    customer_phone_number: phone,
    customer_name: name,
    customer_ip_address: order?.customer_ip_address || "",
    is_recurring_order: Boolean(order?.is_recurring_order),
    order_tags: [getStatusTag(status), lifecycle],
    products,
    ...(shippingAddress ? { customer_shipping_address: shippingAddress } : {}),
  };
};

const maybeSendNorthbeam = async (req, order, status) => {
  const shouldSend =
    status === "processing" || status === "completed" || status === "on-hold";
  if (!shouldSend) return;

  const clientId = process.env.NB_CLIENT_ID || process.env.NORTHBEAM_CLIENT_ID;
  const apiKey = process.env.NB_API_KEY || process.env.NORTHBEAM_AUTH_TOKEN;
  if (!clientId || !apiKey) {
    logger.warn("[Northbeam] Missing NB credentials, skipping send");
    return;
  }

  const mapped = mapWooToNorthbeamOrder(order);
  if (!mapped) return;

  let origin;
  try {
    origin = new URL(req.url).origin;
  } catch (_) {
    origin =
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      "http://localhost:3000";
  }

  try {
    const response = await fetch(`${origin}/api/northbeam/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orders: [mapped] }),
    });
    if (!response.ok) {
      const errorText = await response.text();
      logger.error("[Northbeam] Failed to send order:", {
        order_id: mapped.order_id,
        status: response.status,
        error: errorText,
      });
    } else {
      logger.log("[Northbeam] Order sent:", mapped.order_id);
    }
  } catch (error) {
    logger.error("[Northbeam] Error sending order:", error);
  }
};

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
    // Send with both key names for compatibility
    if (stripeCustomerId) {
      metaData.push({ key: "_stripe_customer_id", value: stripeCustomerId });
      metaData.push({ key: "_wc_stripe_customer", value: stripeCustomerId });
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

    // Trigger Northbeam server-side tracking after order update
    await maybeSendNorthbeam(req, response.data, status);

    // Update associated subscriptions with payment method information
    // This enables automatic renewals instead of manual renewal
    if (stripeCustomerId && paymentMethodId && paymentMethod === "stripe_cc") {
      try {
        logger.log("Updating subscriptions with payment method information...");

        // Get subscriptions for this order
        const subscriptionsResponse = await axios.get(
          `${BASE_URL}/wp-json/wc/v3/subscriptions`,
          {
            params: {
              parent: orderId,
            },
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${Buffer.from(
                `${CONSUMER_KEY}:${CONSUMER_SECRET}`
              ).toString("base64")}`,
            },
          }
        );

        const subscriptions = subscriptionsResponse.data || [];

        if (subscriptions.length > 0) {
          logger.log(
            `Found ${subscriptions.length} subscription(s) to update with payment method`
          );

          // Update each subscription with payment method info
          const subscriptionUpdatePromises = subscriptions.map(
            async (subscription) => {
              const subscriptionUpdateData = {
                payment_method: "stripe_cc",
                payment_method_title: "Stripe",
                meta_data: [
                  {
                    key: "_stripe_customer_id",
                    value: stripeCustomerId,
                  },
                  {
                    key: "_wc_stripe_customer",
                    value: stripeCustomerId,
                  },
                  {
                    key: "_payment_method_token",
                    value: paymentMethodId,
                  },
                  {
                    key: "_stripe_source_id",
                    value: paymentMethodId,
                  },
                ],
              };

              // Add payment intent ID if available
              if (paymentIntentId) {
                subscriptionUpdateData.meta_data.push({
                  key: "_payment_intent_id",
                  value: paymentIntentId,
                });
              }

              logger.log(
                `Updating subscription ${subscription.id} with payment method`
              );

              return axios.put(
                `${BASE_URL}/wp-json/wc/v3/subscriptions/${subscription.id}`,
                subscriptionUpdateData,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(
                      `${CONSUMER_KEY}:${CONSUMER_SECRET}`
                    ).toString("base64")}`,
                  },
                }
              );
            }
          );

          await Promise.all(subscriptionUpdatePromises);
          logger.log(
            "✅ All subscriptions updated with payment method information"
          );
        } else {
          logger.log("No subscriptions found for this order");
        }
      } catch (subscriptionError) {
        logger.error(
          "Failed to update subscriptions with payment method:",
          subscriptionError.response?.data || subscriptionError.message
        );
        // Don't fail the order update if subscription update fails
      }
    }

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
