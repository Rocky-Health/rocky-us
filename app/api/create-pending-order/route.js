import { NextResponse } from "next/server";
import axios from "axios";
import { cookies } from "next/headers";
import { logger } from "@/utils/devLogger";
import {
  transformPaymentError,
  logPaymentError,
} from "@/utils/paymentErrorHandler";
import {
  validateCheckoutData,
  formatValidationErrors,
} from "@/utils/checkoutValidation";
import { buildSourceAttributionMeta } from "@/lib/northbeam/sourceAttribution";

const BASE_URL = process.env.BASE_URL;
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

// Plain name/value cookie map from the raw header, matching the pattern
// app/api/meta-capi/start-checkout/route.js already uses. buildSourceAttributionMeta
// wants a plain object, not the next/headers RequestCookies instance this route
// otherwise reads auth cookies from.
const parseCookies = (req) => {
  const header = req.headers.get("cookie") || "";
  const out = {};
  header.split(";").forEach((c) => {
    const [k, ...v] = c.split("=");
    if (k && v.length) out[k.trim()] = v.join("=").trim();
  });
  return out;
};

export async function POST(req) {
  try {
    // Dispute-evidence IP capture (stopgap ahead of MAYU-822 making WooCommerce's
    // native customer_ip_address authoritative). Read off the incoming request as
    // early as possible so the captured timestamp reflects this request, not order
    // creation. Production sits behind Cloudflare, which proxies to Vercel, so
    // x-forwarded-for/x-real-ip only ever show Cloudflare's own edge IP (Vercel
    // overwrites those headers with whoever connects to it directly, and that's
    // Cloudflare, not the visitor). cf-connecting-ip is Cloudflare's real-client
    // header and takes priority; the old chain stays as a fallback for anything
    // not behind Cloudflare (local dev, direct preview URLs).
    const clientIp =
      req.headers.get("cf-connecting-ip")?.trim() ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const clientUserAgent = req.headers.get("user-agent") || "";
    const ipCapturedAt = new Date().toISOString();

    // Host serving this request, for the seam's own-domain referrer check.
    // Cloudflare/Vercel put the original host in x-forwarded-host; fall back
    // to host for anything not proxied that way (local dev).
    const requestHost =
      req.headers.get("x-forwarded-host")?.trim() ||
      req.headers.get("host")?.trim() ||
      "";

    const requestData = await req.json();

    const {
      firstName,
      lastName,
      addressOne,
      addressTwo,
      city,
      state,
      postcode,
      country,
      phone,
      email,
      discreet,
      toMailBox,
      customerNotes,
      cardNumber,
      cardType,
      cardExpMonth,
      cardExpYear,
      cardCVD,
      savedCardToken,
      savedCardId,
      useSavedCard,
      shipToAnotherAddress,
      shippingFirstName,
      shippingLastName,
      shippingAddressOne,
      shippingAddressTwo,
      shippingCity,
      shippingState,
      shippingPostCode,
      shippingCountry,
      shippingPhone,
      totalAmount,
      awin_awc,
      awin_channel,
      source_attribution,
    } = requestData;

    // Validate checkout data before processing
    // For Stripe payments, skip card validation (pass dummy values)
    const validationResult = validateCheckoutData({
      billing_address: {
        first_name: firstName,
        last_name: lastName,
        address_1: addressOne,
        address_2: addressTwo,
        city,
        state,
        postcode,
        country,
        email,
        phone,
      },
      shipping_address: {
        ship_to_different_address: shipToAnotherAddress,
        first_name: shippingFirstName,
        last_name: shippingLastName,
        address_1: shippingAddressOne,
        address_2: shippingAddressTwo,
        city: shippingCity,
        state: shippingState,
        postcode: shippingPostCode,
        country: shippingCountry,
        phone: shippingPhone,
      },
      // Skip card validation for pending orders (Stripe handles it)
      cardNumber: "dummy",
      cardExpMonth: "12",
      cardExpYear: "30",
      cardCVD: "123",
      useSavedCard: false,
    });

    if (!validationResult.isValid) {
      logger.log("Order creation validation failed:", validationResult.errors);
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validationResult.errors,
          message: formatValidationErrors(validationResult.errors),
        },
        { status: 500 }
      );
    }

    logger.log("Order creation data validation passed");

    const cookieStore = await cookies();
    const encodedCredentials = cookieStore.get("authToken");
    const cartNonce = cookieStore.get("cart-nonce");
    const userId = cookieStore.get("userId");

    logger.log("Authentication check:", {
      hasAuthToken: !!encodedCredentials,
      hasUserId: !!userId,
      userIdValue: userId?.value,
    });

    if (!encodedCredentials || !userId) {
      return NextResponse.json(
        { error: "Not authenticated." },
        { status: 401 }
      );
    }

    // Get cart items and coupons to build order line items
    // OPTIMIZATION: Accept cart items from client to avoid server-side fetch (saves 500-1000ms)
    let cartItems = [];
    let appliedCoupons = [];
    
    // Check if cart items were provided in the request (optimization)
    if (requestData.cartItems && Array.isArray(requestData.cartItems) && requestData.cartItems.length > 0) {
      logger.log("Using cart items from client (optimization)");
      cartItems = requestData.cartItems;
      appliedCoupons = requestData.appliedCoupons || [];
      logger.log("Cart data from client:", {
        itemsCount: cartItems.length,
        couponsCount: appliedCoupons.length,
        coupons: appliedCoupons.map((c) => c.code || c),
      });
    } else {
      // Fallback: Fetch cart from server if not provided
      try {
        logger.log("Fetching cart from server (fallback)");
        const cartResponse = await axios.get(
          `${BASE_URL}/wp-json/wc/store/cart`,
          {
            headers: {
              Authorization: encodedCredentials.value,
              Nonce: cartNonce?.value || "",
            },
          }
        );
        cartItems = cartResponse.data.items || [];
        appliedCoupons = cartResponse.data.coupons || [];
        logger.log("Cart data retrieved from server:", {
          itemsCount: cartItems.length,
          couponsCount: appliedCoupons.length,
          coupons: appliedCoupons.map((c) => c.code),
        });
      } catch (cartError) {
        logger.error("Failed to fetch cart items:", cartError);
        return NextResponse.json(
          { error: "Failed to fetch cart items" },
          { status: 500 }
        );
      }
    }

    // Build line items from cart with subscription metadata
    const lineItems = cartItems.map((item) => {
      const lineItem = {
        product_id: item.id,
        quantity: item.quantity,
        price: item.prices?.price ? parseFloat(item.prices.price) / 100 : 0,
      };

      // Check if this is a one-time purchase by looking at the variation attributes
      const isOneTimePurchase = item.variation?.some(
        (attr) =>
          attr.attribute === "Subscription Type" &&
          attr.value.toLowerCase().includes("one-time")
      );

      // Add subscription metadata only if this is NOT a one-time purchase
      if (item.extensions?.subscriptions && !isOneTimePurchase) {
        const subscriptionData = item.extensions.subscriptions;
        lineItem.meta_data = [
          {
            key: "_subscription_period",
            value: subscriptionData.billing_period || "month",
          },
          {
            key: "_subscription_period_interval",
            value: subscriptionData.billing_interval || "1",
          },
        ];

        // Add additional subscription metadata if available
        if (subscriptionData.subscription_length) {
          lineItem.meta_data.push({
            key: "_subscription_length",
            value: subscriptionData.subscription_length,
          });
        }
        if (subscriptionData.trial_length) {
          lineItem.meta_data.push({
            key: "_subscription_trial_length",
            value: subscriptionData.trial_length,
          });
        }
        if (subscriptionData.trial_period) {
          lineItem.meta_data.push({
            key: "_subscription_trial_period",
            value: subscriptionData.trial_period,
          });
        }
        if (subscriptionData.sign_up_fees) {
          lineItem.meta_data.push({
            key: "_subscription_sign_up_fee",
            value: subscriptionData.sign_up_fees,
          });
        }

        logger.log(`Added subscription metadata for product ${item.name}:`, {
          period: subscriptionData.billing_period,
          interval: subscriptionData.billing_interval,
        });
      } else if (isOneTimePurchase) {
        logger.log(
          `Skipping subscription metadata for one-time purchase product: ${item.name}`
        );
      }

      return lineItem;
    });

    // Determine AWIN values with server-side fallback
    const awcCookie = cookieStore.get("awc")?.value || "";
    const resolvedAwinAwc = (awin_awc || "").trim() || awcCookie;
    const resolvedAwinChannel = (awin_channel || "").trim() || "other";

    // Marketing source attribution only ever lived in the shopper's browser
    // session, so this is the one place a server side writer can still see it.
    // capturedAt reuses ipCapturedAt so both provenance timestamps on the order
    // agree instead of drifting by however long order creation takes.
    const sourceAttributionMeta = buildSourceAttributionMeta({
      source: source_attribution,
      cookies: parseCookies(req),
      requestHost,
      capturedAt: ipCapturedAt,
    });

    // Build order data for WooCommerce REST API v3
    const orderData = {
      status: "pending", // Create order without payment processing
      customer_id: parseInt(userId.value), // Set the authenticated user's ID
      billing: {
        first_name: firstName,
        last_name: lastName,
        address_1: addressOne,
        address_2: addressTwo || "",
        city,
        state,
        postcode,
        country: country || "CA",
        email,
        phone,
      },
      shipping: {
        first_name: shipToAnotherAddress ? shippingFirstName : firstName,
        last_name: shipToAnotherAddress ? shippingLastName : lastName,
        address_1: shipToAnotherAddress ? shippingAddressOne : addressOne,
        address_2: shipToAnotherAddress ? shippingAddressTwo : addressTwo || "",
        city: shipToAnotherAddress ? shippingCity : city,
        state: shipToAnotherAddress ? shippingState : state,
        postcode: shipToAnotherAddress ? shippingPostCode : postcode,
        country: shipToAnotherAddress ? shippingCountry : country || "CA",
        phone: shipToAnotherAddress ? shippingPhone : phone,
      },
      line_items: lineItems,
      ...(appliedCoupons.length > 0 && {
        coupon_lines: appliedCoupons.map((coupon) => ({
          code: coupon.code,
          discount: coupon.discount || "0",
          discount_tax: coupon.discount_tax || "0",
        })),
      }),
      meta_data: [
        { key: "_meta_discreet", value: discreet ? "1" : "0" },
        { key: "_meta_mail_box", value: toMailBox ? "1" : "0" },
        { key: "_awin_awc", value: resolvedAwinAwc || "" },
        { key: "_awin_channel", value: resolvedAwinChannel },
        { key: "_is_created_from_rocky_fe", value: "true" },
        { key: "_rocky_customer_ip", value: clientIp },
        { key: "_rocky_customer_user_agent", value: clientUserAgent },
        { key: "_rocky_ip_source", value: "storefront_request_header" },
        { key: "_rocky_ip_captured_at", value: ipCapturedAt },
        ...sourceAttributionMeta,
      ],
    };

    // Add customer note if provided
    if (customerNotes && customerNotes.trim()) {
      orderData.customer_note = customerNotes.trim();
    }

    // Add payment method info for saved cards (for reference, not processing)
    if (useSavedCard && savedCardToken) {
      orderData.meta_data.push(
        { key: "_saved_card_token", value: savedCardToken },
        { key: "_saved_card_id", value: savedCardId || "1" },
        { key: "_payment_method", value: "bambora_credit_card" }
      );
    }

    logger.log("Creating order with data:", JSON.stringify(orderData, null, 2));
    logger.log(
      "Order will be associated with customer_id:",
      orderData.customer_id
    );
    logger.log("Applied coupons:", orderData.coupon_lines);

    // Create order using WooCommerce REST API v3
    const response = await axios.post(
      `${BASE_URL}/wp-json/wc/v3/orders`,
      orderData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${CONSUMER_KEY}:${CONSUMER_SECRET}`
          ).toString("base64")}`,
        },
      }
    );

    logger.log("Order created successfully:", {
      order_id: response.data.id,
      order_key: response.data.order_key,
      status: response.data.status,
    });

    // No usable IP means this order will carry no dispute-evidence address.
    // A quiet gap here is exactly what went unnoticed for fifteen months.
    if (!clientIp) {
      logger.error(
        "create-pending-order: no customer IP resolved, order has no dispute-evidence address",
        { order_id: response.data.id }
      );
    }

    // ========================================
    // ASYNC: Create subscriptions (non-blocking)
    // Subscriptions are created in the background after order is returned
    // ========================================
    const order = response.data;
    
    // Group line items by subscription schedule (period + interval)
    // Only include items that have subscription metadata (excludes one-time purchases)
    const subscriptionGroups = new Map();

    for (const lineItem of order.line_items) {
      if (lineItem.meta_data) {
        const periodMeta = lineItem.meta_data.find(
          (meta) => meta.key === "_subscription_period"
        );
        const intervalMeta = lineItem.meta_data.find(
          (meta) => meta.key === "_subscription_period_interval"
        );

        if (periodMeta && intervalMeta) {
          const scheduleKey = `${periodMeta.value}_${intervalMeta.value}`;

          if (!subscriptionGroups.has(scheduleKey)) {
            subscriptionGroups.set(scheduleKey, {
              billing_period: periodMeta.value,
              billing_interval: parseInt(intervalMeta.value),
              line_items: [],
              meta_data: lineItem.meta_data.filter((meta) =>
                meta.key.startsWith("_subscription_")
              ),
            });
          }

          // Build complete line item with all product details for subscription
          const subscriptionLineItem = {
            product_id: lineItem.product_id,
            quantity: lineItem.quantity,
          };

          // Add variation_id if present (critical for variable products like different pill counts)
          if (lineItem.variation_id) {
            subscriptionLineItem.variation_id = lineItem.variation_id;
          }

          // Add product name for proper display in subscription details
          if (lineItem.name) {
            subscriptionLineItem.name = lineItem.name;
          }

          // Add SKU if available
          if (lineItem.sku) {
            subscriptionLineItem.sku = lineItem.sku;
          }

          // Add price information to ensure correct subscription pricing
          if (lineItem.price !== undefined && lineItem.price !== null) {
            subscriptionLineItem.price = lineItem.price;
          }

          // Include subtotal and total if available
          if (lineItem.subtotal !== undefined) {
            subscriptionLineItem.subtotal = lineItem.subtotal;
          }
          if (lineItem.total !== undefined) {
            subscriptionLineItem.total = lineItem.total;
          }

          subscriptionGroups
            .get(scheduleKey)
            .line_items.push(subscriptionLineItem);

          logger.log(
            `Product ${lineItem.product_id} (${
              lineItem.name || "N/A"
            }) added to subscription group: ${scheduleKey}`,
            {
              variation_id: subscriptionLineItem.variation_id || "none",
              quantity: subscriptionLineItem.quantity,
              price: subscriptionLineItem.price,
            }
          );
        } else {
          logger.log(
            `Product ${lineItem.product_id} (${lineItem.name}) skipped - no subscription metadata (likely one-time purchase)`
          );
        }
      }
    }

    // Create subscriptions asynchronously (fire and forget)
    if (subscriptionGroups.size > 0) {
      logger.log(
        `Creating ${subscriptionGroups.size} subscription(s) asynchronously for order: ${order.id}`
      );

      // Fire and forget - don't await
      Promise.all(
        Array.from(subscriptionGroups.entries()).map(
          async ([scheduleKey, subscriptionData]) => {
            try {
              const subscriptionPayload = {
                parent_id: order.id,
                customer_id: order.customer_id,
                status: "pending", // Leave pending until payment is captured
                billing_period: subscriptionData.billing_period,
                billing_interval: subscriptionData.billing_interval,
                line_items: subscriptionData.line_items,
                billing: order.billing,
                shipping: order.shipping,
                meta_data: subscriptionData.meta_data,
              };

              logger.log(
                `Creating subscription for schedule ${scheduleKey} (async):`,
                subscriptionPayload
              );

              const subscriptionResponse = await axios.post(
                `${BASE_URL}/wp-json/wc/v3/subscriptions`,
                subscriptionPayload,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Basic ${Buffer.from(
                      `${CONSUMER_KEY}:${CONSUMER_SECRET}`
                    ).toString("base64")}`,
                  },
                }
              );

              logger.log(
                `✅ Subscription created successfully (async): ${subscriptionResponse.data.id}`
              );
              return subscriptionResponse.data;
            } catch (subscriptionError) {
              logger.error(
                `Error creating subscription for schedule ${scheduleKey} (async):`,
                subscriptionError.response?.data || subscriptionError.message
              );
              // Don't throw - log for manual review
              return null;
            }
          }
        )
      )
        .then((createdSubscriptions) => {
          const successfulSubscriptions = createdSubscriptions.filter(
            (sub) => sub !== null
          );
          logger.log(
            `✅ Successfully created ${successfulSubscriptions.length}/${subscriptionGroups.size} subscriptions for order ${order.id} (async)`,
            successfulSubscriptions.map((sub) => sub.id)
          );
        })
        .catch((asyncError) => {
          logger.error(
            "Error in async subscription creation:",
            asyncError
          );
          // Don't throw - subscriptions can be created manually if needed
        });
    } else {
      logger.log(
        "No subscription items found in order. Skipping subscription creation."
      );
    }

    // Return the response in a consistent format
    return NextResponse.json({
      success: true,
      data: {
        id: response.data.id,
        order_id: response.data.id, // For compatibility
        order_key: response.data.order_key,
        status: response.data.status,
        total: response.data.total, // Add total for Stripe payment
        currency: response.data.currency || "USD",
        payment_deferred: true,
        message:
          "Order created successfully. Payment will be processed separately.",
      },
    });
  } catch (error) {
    logger.error(
      "Error creating order:",
      error.response?.data || error.message
    );

    // Transform technical errors into user-friendly messages
    const originalError =
      error.response?.data?.message ||
      error.message ||
      "Failed to create order.";
    const userFriendlyMessage = transformPaymentError(
      originalError,
      error.response?.data
    );

    // Log the original error for debugging
    logPaymentError("create-order-only", error, userFriendlyMessage);

    return NextResponse.json(
      {
        error: userFriendlyMessage,
        details: error.response?.data || null,
      },
      { status: error.response?.status || 500 }
    );
  }
}
