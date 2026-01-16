import { NextResponse } from "next/server";
import axios from "axios";
import { logger } from "@/utils/devLogger";
import { cookies } from "next/headers";

const BASE_URL = process.env.BASE_URL;

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
    products,
    ...(shippingAddress ? { customer_shipping_address: shippingAddress } : {}),
  };
};

const maybeSendNorthbeamFromOrderReceived = async (req, order) => {
  const orderId = order?.id ? String(order.id) : "unknown";
  logger.log("[Northbeam] Attempting order send:", {
    order_id: orderId,
    source: "order-received",
  });
  const clientId = process.env.NB_CLIENT_ID || process.env.NORTHBEAM_CLIENT_ID;
  const apiKey = process.env.NB_API_KEY || process.env.NORTHBEAM_AUTH_TOKEN;
  if (!clientId || !apiKey) {
    logger.warn("[Northbeam] Missing NB credentials, skipping send", {
      order_id: orderId,
    });
    return { sent: false };
  }

  const mapped = mapWooToNorthbeamOrder(order);
  if (!mapped) {
    logger.warn("[Northbeam] Missing mapped order payload, skipping send", {
      order_id: orderId,
    });
    return { sent: false };
  }

  let origin;
  try {
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host");
    origin = host ? `${proto}://${host}` : undefined;
  } catch (_) {
    origin = undefined;
  }
  if (!origin) {
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
      return { sent: false };
    }
    logger.log("[Northbeam] Order sent:", {
      order_id: mapped.order_id,
      currency: mapped.currency,
      purchase_total: mapped.purchase_total,
      product_count: Array.isArray(mapped.products) ? mapped.products.length : 0,
      time_of_purchase: mapped.time_of_purchase,
    });
    return { sent: true };
  } catch (error) {
    logger.error("[Northbeam] Error sending order:", error);
    return { sent: false };
  }
};

export async function GET(req) {
  try {
    const order_id = req.nextUrl.searchParams.get("order_id");
    const order_key = req.nextUrl.searchParams.get("order_key");
    const cookieStore = await cookies();

    const encodedCredentials = cookieStore.get("authToken");

    if (!encodedCredentials) {
      return NextResponse.json(
        {
          error: "Not authenticated..",
        },
        { status: 500 }
      );
    }

    const response = await axios.get(
      `${BASE_URL}/wp-json/wc/v3/orders/${order_id}?consumer_key=${process.env.CONSUMER_KEY}&consumer_secret=${process.env.CONSUMER_SECRET}`,
      {
        headers: {
          Authorization: `${encodedCredentials.value}`,
          nonce: cookieStore.get("cart-nonce")?.value,
        },
      }
    );

    const order = response.data;
    const responseJson = NextResponse.json(order);

    if (order?.id) {
      await maybeSendNorthbeamFromOrderReceived(req, order);
    }

    return responseJson;
  } catch (error) {
    logger.error("Error getting order:", error.response?.data || error.message);

    return NextResponse.json(
      {
        error: error.response?.data?.message || "Failed to get order",
      },
      { status: error.response?.status || 500 }
    );
  }
}
