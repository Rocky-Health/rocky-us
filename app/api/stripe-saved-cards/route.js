import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import Stripe from "stripe";
import axios from "axios";
import { logger } from "@/utils/devLogger";

const BASE_URL = process.env.BASE_URL;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_API_VERSION = "2024-06-20";
const CONSUMER_KEY = process.env.CONSUMER_KEY;
const CONSUMER_SECRET = process.env.CONSUMER_SECRET;

// The WP Stripe plugin stores the customer id per mode, so read the key that
// matches the active secret key (test vs live).
const IS_TEST_MODE = (STRIPE_SECRET_KEY || "").startsWith("sk_test");
const STRIPE_CUSTOMER_META_KEY = IS_TEST_MODE
  ? "wp_wc_stripe_customer_test"
  : "wp_wc_stripe_customer_live";

function isNoSuchCustomer(err) {
  const msg = (err?.message || "").toLowerCase();
  return err?.code === "resource_missing" || msg.includes("no such customer");
}

/**
 * Resolve the user's Stripe customer id. Checks the stripeCustomerId cookie
 * first (unless skipCookie), then falls back to the WooCommerce customer's
 * metadata, read with admin WooCommerce credentials (CONSUMER_KEY/SECRET) —
 * the user's own authToken can't read wc/v3/customers. Mirrors rocky-headless.
 */
async function getStripeCustomerId(
  cookieStore,
  userId,
  { skipCookie = false } = {}
) {
  let stripeCustomerId = skipCookie
    ? null
    : cookieStore.get("stripeCustomerId")?.value;

  if (
    !stripeCustomerId &&
    BASE_URL &&
    CONSUMER_KEY &&
    CONSUMER_SECRET &&
    userId
  ) {
    try {
      const authHeader = `Basic ${Buffer.from(
        `${CONSUMER_KEY}:${CONSUMER_SECRET}`
      ).toString("base64")}`;

      const customerResponse = await axios.get(
        `${BASE_URL}/wp-json/wc/v3/customers/${userId}`,
        { headers: { Authorization: authHeader } }
      );

      const metaData = customerResponse.data?.meta_data || [];
      // Mode-specific WP Stripe plugin key first, then the generic key written
      // by /api/create-payment-intent.
      const stripeCustomerMeta = metaData.find(
        (meta) =>
          meta.key === STRIPE_CUSTOMER_META_KEY ||
          meta.key === "_stripe_customer_id"
      );

      if (stripeCustomerMeta?.value) {
        stripeCustomerId = stripeCustomerMeta.value;
        // Cache for future requests.
        cookieStore.set("stripeCustomerId", stripeCustomerId, {
          httpOnly: true,
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          path: "/",
          maxAge: 60 * 60 * 24 * 365,
        });
      } else {
        logger.warn(
          `stripe-saved-cards: no ${STRIPE_CUSTOMER_META_KEY} or _stripe_customer_id meta on WC customer ${userId}`
        );
      }
    } catch (wooError) {
      logger.warn(
        "stripe-saved-cards: Could not resolve Stripe customer from WooCommerce:",
        wooError.message
      );
    }
  }

  return stripeCustomerId || null;
}

/**
 * GET /api/stripe-saved-cards
 * Lists the authenticated user's saved cards directly from Stripe.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;
    const userId = cookieStore.get("userId")?.value;

    if (!authToken || !userId) {
      return NextResponse.json(
        { success: false, message: "Not authenticated", cards: [] },
        { status: 401 }
      );
    }

    if (!STRIPE_SECRET_KEY) {
      logger.error("stripe-saved-cards: Missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { success: false, message: "Stripe is not configured", cards: [] },
        { status: 500 }
      );
    }

    let stripeCustomerId = await getStripeCustomerId(cookieStore, userId);

    if (!stripeCustomerId) {
      logger.log("stripe-saved-cards: no Stripe customer for user", userId);
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

    logger.log(
      `stripe-saved-cards: listing cards for ${stripeCustomerId} (${
        IS_TEST_MODE ? "test" : "live"
      } mode)`
    );

    let paymentMethods;
    try {
      paymentMethods = await stripe.paymentMethods.list({
        customer: stripeCustomerId,
        type: "card",
      });
    } catch (listError) {
      // A cookie cached from the other Stripe mode points at a customer that
      // doesn't exist here. Drop it, re-resolve from WooCommerce, and retry.
      if (isNoSuchCustomer(listError)) {
        logger.warn(
          `stripe-saved-cards: ${stripeCustomerId} not found in ${
            IS_TEST_MODE ? "test" : "live"
          } mode — clearing cookie and re-resolving`
        );
        cookieStore.delete("stripeCustomerId");
        stripeCustomerId = await getStripeCustomerId(cookieStore, userId, {
          skipCookie: true,
        });
        if (!stripeCustomerId) {
          return NextResponse.json({
            success: true,
            message: "No saved cards found",
            cards: [],
            stripeCustomerId: null,
          });
        }
        paymentMethods = await stripe.paymentMethods.list({
          customer: stripeCustomerId,
          type: "card",
        });
      } else {
        throw listError;
      }
    }

    logger.log(
      `stripe-saved-cards: Stripe returned ${paymentMethods.data.length} card(s) for ${stripeCustomerId}`
    );

    // Find the default payment method.
    let defaultPaymentMethodId = null;
    try {
      const customer = await stripe.customers.retrieve(stripeCustomerId);
      if (customer && !customer.deleted) {
        defaultPaymentMethodId =
          customer.invoice_settings?.default_payment_method || null;
      }
    } catch (customerError) {
      logger.warn(
        "stripe-saved-cards: Could not fetch customer for default PM",
        customerError.message
      );
    }

    const allCards = paymentMethods.data.map((pm) => ({
      id: pm.id,
      last4: pm.card?.last4 || "****",
      brand: pm.card?.brand || "unknown",
      exp_month: pm.card?.exp_month,
      exp_year: pm.card?.exp_year,
      is_default: pm.id === defaultPaymentMethodId,
      fingerprint: pm.card?.fingerprint,
      funding: pm.card?.funding,
      created: pm.created,
    }));

    // Deduplicate by fingerprint - keep the default or most recent.
    const cardsByFingerprint = new Map();
    for (const card of allCards) {
      const key = card.fingerprint || card.id;
      const existing = cardsByFingerprint.get(key);
      if (!existing) {
        cardsByFingerprint.set(key, card);
      } else if (
        card.is_default ||
        (!existing.is_default && card.created > existing.created)
      ) {
        cardsByFingerprint.set(key, card);
      }
    }

    const savedCards = Array.from(cardsByFingerprint.values());
    savedCards.sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return b.created - a.created;
    });

    return NextResponse.json({
      success: true,
      message:
        savedCards.length > 0 ? "Saved cards retrieved" : "No saved cards found",
      cards: savedCards,
      stripeCustomerId,
    });
  } catch (error) {
    logger.error("stripe-saved-cards: Error fetching cards:", error.message);
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
 * DELETE /api/stripe-saved-cards  { paymentMethodId }
 * Detaches a saved card from the customer.
 */
export async function DELETE(req) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;
    const userId = cookieStore.get("userId")?.value;

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

    const stripeCustomerId = await getStripeCustomerId(cookieStore, userId);

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

    // Make sure the card belongs to this customer before detaching.
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

    await stripe.paymentMethods.detach(paymentMethodId);

    return NextResponse.json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    logger.error("stripe-saved-cards: Error deleting card:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to delete card", error: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/stripe-saved-cards  { paymentMethodId, makeDefault }
 * Sets the customer's default card.
 */
export async function PATCH(req) {
  try {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("authToken")?.value;
    const userId = cookieStore.get("userId")?.value;

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

    const stripeCustomerId = await getStripeCustomerId(cookieStore, userId);

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
      await stripe.customers.update(stripeCustomerId, {
        invoice_settings: { default_payment_method: paymentMethodId },
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
    logger.error("stripe-saved-cards: Error updating card:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to update card", error: error.message },
      { status: 500 }
    );
  }
}
