import { NextResponse } from "next/server";
import { evaluateSendGate } from "@/lib/northbeam/sendGate";
import { normalizeOrderId } from "@/lib/northbeam/orderId";
import {
  resolveOrderTimeIso,
  applyPixelGuardBounded,
  isWithinLiveWindow,
} from "@/lib/northbeam/orderTime";
import {
  normalizeWriteContext,
  shouldApplyPixelGuard,
} from "@/lib/northbeam/writeContext";
import { acceptCustomerIdOverride } from "@/lib/northbeam/customerId";
import { logger } from "@/utils/devLogger";
import { api as wooApi } from "@/lib/woocommerce";
import { buildCanonicalOrderTags } from "@/lib/northbeam/orderTags";
import { buildSourceTagsFromOrder } from "@/lib/northbeam/attributionTags";
import { buildCategoryTagsFromNames } from "@/lib/northbeam/categoryTags";

/**
 * Convert 2-letter country code to 3-letter ISO 3166-1 alpha-3 code
 * @param {string} countryCode - 2-letter country code
 * @returns {string} 3-letter country code
 */
const convertToISO3166Alpha3 = (countryCode) => {
  // Comprehensive ISO 3166-1 alpha-2 to alpha-3 mapping
  const countryMap = {
    // North America
    CA: "CAN", US: "USA", MX: "MEX",
    // Europe
    GB: "GBR", DE: "DEU", FR: "FRA", IT: "ITA", ES: "ESP", NL: "NLD", BE: "BEL",
    AT: "AUT", CH: "CHE", SE: "SWE", NO: "NOR", DK: "DNK", FI: "FIN", IE: "IRL",
    PT: "PRT", GR: "GRC", PL: "POL", CZ: "CZE", HU: "HUN", RO: "ROU", SK: "SVK",
    BG: "BGR", HR: "HRV", SI: "SVN", LT: "LTU", LV: "LVA", EE: "EST", IS: "ISL",
    LU: "LUX", MT: "MLT", CY: "CYP", RS: "SRB", UA: "UKR", BY: "BLR", MD: "MDA",
    AL: "ALB", BA: "BIH", MK: "MKD", ME: "MNE", XK: "XKX",
    // Asia
    CN: "CHN", JP: "JPN", KR: "KOR", IN: "IND", SG: "SGP", MY: "MYS", TH: "THA",
    ID: "IDN", PH: "PHL", VN: "VNM", TW: "TWN", HK: "HKG", MO: "MAC", KH: "KHM",
    LA: "LAO", MM: "MMR", BN: "BRN", BD: "BGD", LK: "LKA", NP: "NPL", PK: "PAK",
    AF: "AFG", MV: "MDV", BT: "BTN", MN: "MNG", KZ: "KAZ", UZ: "UZB", TM: "TKM",
    KG: "KGZ", TJ: "TJK",
    // Middle East
    IL: "ISR", AE: "ARE", SA: "SAU", TR: "TUR", IQ: "IRQ", IR: "IRN", JO: "JOR",
    LB: "LBN", SY: "SYR", YE: "YEM", OM: "OMN", KW: "KWT", BH: "BHR", QA: "QAT",
    PS: "PSE", AM: "ARM", AZ: "AZE", GE: "GEO",
    // Oceania
    AU: "AUS", NZ: "NZL", FJ: "FJI", PG: "PNG", NC: "NCL", PF: "PYF", GU: "GUM",
    AS: "ASM", MP: "MNP", FM: "FSM", MH: "MHL", PW: "PLW", WS: "WSM", TO: "TON",
    VU: "VUT", SB: "SLB", KI: "KIR", TV: "TUV", NR: "NRU",
    // South America
    BR: "BRA", AR: "ARG", CL: "CHL", CO: "COL", PE: "PER", VE: "VEN", EC: "ECU",
    BO: "BOL", PY: "PRY", UY: "URY", GY: "GUY", SR: "SUR", GF: "GUF", FK: "FLK",
    // Central America & Caribbean
    GT: "GTM", HN: "HND", SV: "SLV", NI: "NIC", CR: "CRI", PA: "PAN", BZ: "BLZ",
    CU: "CUB", JM: "JAM", HT: "HTI", DO: "DOM", PR: "PRI", TT: "TTO", BS: "BHS",
    BB: "BRB", LC: "LCA", VC: "VCT", GD: "GRD", AG: "ATG", DM: "DMA", KN: "KNA",
    AW: "ABW", CW: "CUW", SX: "SXM", BQ: "BES", VG: "VGB", KY: "CYM", TC: "TCA",
    BM: "BMU", MS: "MSR", AI: "AIA", GP: "GLP", MQ: "MTQ",
    // Africa
    ZA: "ZAF", EG: "EGY", NG: "NGA", KE: "KEN", GH: "GHA", TZ: "TZA", UG: "UGA",
    DZ: "DZA", MA: "MAR", AO: "AGO", SD: "SDN", ET: "ETH", MZ: "MOZ", CM: "CMR",
    CI: "CIV", MG: "MDG", NE: "NER", BF: "BFA", ML: "MLI", MW: "MWI", ZM: "ZMB",
    SN: "SEN", SO: "SOM", TD: "TCD", GN: "GIN", RW: "RWA", BJ: "BEN", BI: "BDI",
    TN: "TUN", SS: "SSD", TG: "TGO", SL: "SLE", LY: "LBY", LR: "LBR", MR: "MRT",
    CF: "CAF", ER: "ERI", GM: "GMB", BW: "BWA", GA: "GAB", GW: "GNB", MU: "MUS",
    SZ: "SWZ", DJ: "DJI", KM: "COM", CV: "CPV", ST: "STP", SC: "SYC", GQ: "GNQ",
    ZW: "ZWE", NA: "NAM", LS: "LSO", RE: "REU", YT: "MYT",
  };
  
  const code = String(countryCode || "").toUpperCase().trim();
  
  // If already 3 letters, return as-is
  if (code.length === 3) {
    return code;
  }
  
  // Convert 2-letter to 3-letter, default to USA for US platform
  return countryMap[code] || "USA";
};

/**
 * Get product type tags based on categories
 * @param {Array} products - Order products
 * @returns {Promise<Array>} Product type tags
 */
const getProductTypeTags = async (products, baseUrlFromRequest) => {
  const names = new Set();

  if (!products || products.length === 0) {
    return [];
  }

  try {
    // Resolve base URL from request headers or envs; default to localhost
    let baseUrl =
      baseUrlFromRequest ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL ||
      process.env.NEXTAUTH_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000";

    // Fetch product details for each product
    const productPromises = products.map(async (product) => {
      try {
        // Prefer numeric Woo product_id; fall back to product.id only if numeric
        const candidateId =
          product?.product_id ||
          (typeof product?.id !== "undefined" &&
          /^\d+$/.test(String(product.id))
            ? product.id
            : null);

        if (!candidateId) {
          return null;
        }

        const response = await fetch(
          `${baseUrl}/api/products/by-id/${candidateId}`
        );
        if (response.ok) {
          return await response.json();
        }
        return null;
      } catch (error) {
        console.error(
          `Error fetching product details for ${
            product.id || product.product_id
          }:`,
          error
        );
        return null;
      }
    });

    const productDetails = await Promise.all(productPromises);

    // Extract category names from product details. The N in item-category-N
    // is assigned later by buildCategoryTagsFromNames, which sorts them
    // deterministically; see lib/northbeam/categoryTags.js for why Set
    // insertion order (line item order) is exactly the defect TK-1002 found.
    productDetails.forEach((product) => {
      if (product?.categories) {
        product.categories.forEach((category) => {
          if (category?.name) names.add(category.name);
        });
      }
    });
  } catch (error) {
    console.error("Error in getProductTypeTags:", error);
    // Return empty array if category fetching fails - don't break the order tracking
    return [];
  }

  return buildCategoryTagsFromNames([...names]);
};

export async function POST(req) {
  try {
    const orderData = await req.json();

    // Validate required fields
    if (
      !orderData.orders ||
      !Array.isArray(orderData.orders) ||
      orderData.orders.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid order data: orders array is required" },
        { status: 400 }
      );
    }

    const order = orderData.orders[0];
    // A falsy check is not enough here. String(undefined) produces the string
    // "undefined", which is truthy, so a mapper that lost the primary key would
    // pass this gate and create a phantom order in Northbeam under that key.
    if (!normalizeOrderId(order.order_id)) {
      return NextResponse.json(
        { error: "Invalid order data: order_id is required" },
        { status: 400 }
      );
    }

    // Check for required environment variables (support legacy names)
    const clientId =
      process.env.NB_CLIENT_ID || process.env.NORTHBEAM_CLIENT_ID;
    const apiKey = process.env.NB_API_KEY || process.env.NORTHBEAM_AUTH_TOKEN;

    if (!clientId || !apiKey) {
      logger.error(
        "[Northbeam API] Missing required environment variables: NB_CLIENT_ID or NB_API_KEY"
      );
      return NextResponse.json(
        { error: "Northbeam configuration missing" },
        { status: 500 }
      );
    }

    // Gate the outbound call. Previously this was reachable from any
    // environment holding Northbeam credentials, so preview deploys and QA
    // orders reached the production dataset.
    const gate = evaluateSendGate(order);
    if (!gate.send) {
      logger.log(
        `[Northbeam API] Skipping order ${order.order_id}: ${gate.reason}`,
        { order_id: order.order_id, reason: gate.reason, detail: gate.detail }
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: gate.reason,
        order_id: order.order_id,
      });
    }

    // Build base URL from incoming request
    const proto = req.headers.get("x-forwarded-proto") || "https";
    const host = req.headers.get("host");
    const requestBaseUrl = host ? `${proto}://${host}` : undefined;

    // Get product type tags
    const productTypeTags = await getProductTypeTags(
      order.products,
      requestBaseUrl
    );

    // The three canonical axes (lifecycle, origin, mode) are pinned onto the
    // Woo order by the canonical writer, not carried in the client payload, so
    // this route has to read the order back to see them. Best effort only: two
    // writers are live until TK-1029 retires the browser one, and Northbeam
    // keeps the last write, so both must produce the same array or each
    // overwrites the other with a different one. A failed read here still
    // sends an order, just one with the axes omitted rather than invented.
    let wooOrder = null;
    if (shouldApplyPixelGuard(order.nb_write_context)) {
      try {
        const { data } = await wooApi.get(`orders/${order.order_id}`);
        wooOrder = data;
      } catch (e) {
        logger.warn("[Northbeam API] Could not read order meta for canonical axes", {
          order_id: order.order_id,
        });
      }
    }

    // Derive canonical timestamp and customer_id
    // Explicit overrides first, then the order's true UTC instant.
    //
    // The site-local tail (date_paid / date_completed / date_created) was
    // removed deliberately: those fields carry no offset, so Date.parse resolves
    // them against the runtime's own timezone and silently shifts the instant by
    // the store offset. The _gmt fields are bare strings too, which is why they
    // now go through resolveOrderTimeIso to be pinned to UTC rather than parsed
    // loosely here.
    const rawClientTime =
      order.time_of_purchase ||
      order.timeOfPurchase ||
      resolveOrderTimeIso(order);

    const nowMs = Date.now();
    let parsedMs = Number.isFinite(Date.parse(rawClientTime))
      ? Date.parse(rawClientTime)
      : NaN;

    // CRITICAL FIX: Allow historical orders for backfill
    // Only clamp timestamp if:
    // 1. Invalid date, OR
    // 2. Future date (>2h in future) - prevents clock skew
    // Do NOT clamp past dates - they're valid for backfill!
    const isFutureDate = Number.isFinite(parsedMs) && (parsedMs - nowMs) > 2 * 60 * 60 * 1000;

    if (!Number.isFinite(parsedMs) || isFutureDate) {
      if (rawClientTime) {
        logger.warn(
          "[Northbeam API] Adjusting time_of_purchase (invalid or future date)",
          {
            order_id: order.order_id,
            rawClientTime,
            nowIso: new Date(nowMs).toISOString(),
            reason: !Number.isFinite(parsedMs) ? 'invalid_date' : 'future_date'
          }
        );
      }
      parsedMs = nowMs;
    }
    const clampedTimeIso = new Date(parsedMs).toISOString();

    // The pixel guard only belongs on a live purchase, where a client purchase
    // pixel is firing on the confirmation page moments after this write. A
    // historical backfill must send the true purchase instant unchanged, so it
    // is clamped first and guarded second: the guard can only push a value that
    // has already survived the skew clamp, never turn a rejected one into a
    // silently invented one.
    //
    // A caller declaring live_purchase is not taken at its word: some callers
    // re-send an order without knowing how old it is, and shifting a stale
    // instant would mutate a reporting period that already closed. isWithinLiveWindow
    // is the route's own backstop against that, and applyPixelGuardBounded caps
    // the shift at now plus the guard itself, so a value already sitting near the
    // clamp's own future ceiling cannot be pushed past it. See
    // lib/northbeam/writeContext.js and lib/northbeam/orderTime.js for the contracts.
    const writeContext = order.nb_write_context;
    const declaredLive = shouldApplyPixelGuard(writeContext);
    const withinLiveWindow = isWithinLiveWindow(clampedTimeIso, nowMs);
    const guardApplies = declaredLive && withinLiveWindow;
    const timeOfPurchaseIso = guardApplies
      ? applyPixelGuardBounded(clampedTimeIso, nowMs) || clampedTimeIso
      : clampedTimeIso;

    logger.log("[Northbeam API] Pixel guard decision", {
      order_id: order.order_id,
      write_context: normalizeWriteContext(writeContext),
      within_live_window: withinLiveWindow,
      guard_applied: guardApplies,
      clamped_time_of_purchase: clampedTimeIso,
      time_of_purchase: timeOfPurchaseIso,
    });

    // Normalize customer_id: prefer Woo user id, then email, then phone; prefix namespace
    let derivedCustomerId = "";
    if (order.customer_id && Number(order.customer_id) > 0) {
      derivedCustomerId = `wc:${String(order.customer_id)}`;
    } else if (order.customer_email) {
      derivedCustomerId = `email:${String(order.customer_email)
        .trim()
        .toLowerCase()}`;
    } else if (order.customer_phone_number) {
      const digits = String(order.customer_phone_number).replace(/\D+/g, "");
      if (digits) derivedCustomerId = `phone:${digits}`;
    }
    // Allow explicit override from client if provided, but only within the
    // three namespaces this integration has ever emitted. A refused override
    // degrades to the derived value above rather than to an empty one. See
    // lib/northbeam/customerId.js.
    const customerIdOverride = acceptCustomerIdOverride(
      order.customer_id_canonical
    );
    if (customerIdOverride) {
      derivedCustomerId = customerIdOverride;
    } else if (order.customer_id_canonical) {
      logger.warn(
        "[Northbeam API] Refused non-conforming customer_id_canonical override, keeping derived customer_id",
        { order_id: order.order_id }
      );
    }

    // Merge any client-provided tags to preserve item-category-* computed on
    // client, dropping the retired lifecycle values explicitly. TK-446 forbids
    // the two schemas coexisting, and a client build that has not picked up
    // this cutover yet would otherwise still be sending one of these three.
    const RETIRED_LIFECYCLE_TAGS = new Set([
      "Subscription First Order",
      "Subscription Recurring",
      "OTC",
    ]);
    const clientProvidedTags = Array.isArray(order.order_tags)
      ? order.order_tags.filter(
          (tag) => Boolean(tag) && !RETIRED_LIFECYCLE_TAGS.has(tag)
        )
      : [];

    // Build the Northbeam API payload - send as array directly
    const payload = [
      {
      order_id: order.order_id,
      customer_id: derivedCustomerId, // Ensure customer_id is a string
      time_of_purchase: timeOfPurchaseIso, // Ensure proper ISO format
      currency: order.currency || "USD",
        purchase_total: parseFloat(order.purchase_total) || 0, // Keep in dollars, not cents
        tax: parseFloat(order.tax) || 0, // Keep in dollars, not cents
        shipping_cost: parseFloat(order.shipping_cost) || 0,
        discount_codes: order.discount_codes || [],
        discount_amount: parseFloat(order.discount_amount) || 0, // Keep in dollars, not cents
        customer_email: order.customer_email || "",
        customer_phone_number: order.customer_phone_number || "",
        customer_name: order.customer_name || "",
        ...(order.customer_ip_address && {
          customer_ip_address: order.customer_ip_address,
        }),
        is_recurring_order: order.is_recurring_order || false,
        order_tags: buildCanonicalOrderTags({
          // The Woo order is authoritative on status and the client payload
          // frequently omits it altogether: that omission is TK-1003, and it
          // used to be papered over by a `Pending` default that produced
          // orders carrying two contradictory status tags. With the default
          // gone, reading the real status here is what stops a live purchase
          // shipping with no status tag at all.
          status: wooOrder?.status || order.status,
          order: wooOrder,
          categoryTags: productTypeTags,
          sourceTags: wooOrder ? buildSourceTagsFromOrder(wooOrder) : [],
          extraTags: clientProvidedTags,
        }),
        products: (order.products || []).map((product) => ({
          id: product.id || "",
          name: product.name || "",
          quantity: parseInt(product.quantity) || 1,
          price: parseFloat(product.price) || 0, // Keep in dollars, not cents
          ...(product.variant_id ? { variant_id: product.variant_id } : {}),
          ...(product.variant_name
            ? { variant_name: product.variant_name }
            : {}),
        })),
        ...(order.customer_shipping_address && {
          customer_shipping_address: {
            address1: order.customer_shipping_address.address1 || "",
            address2: order.customer_shipping_address.address2 || "",
            city: order.customer_shipping_address.city || "",
            state: order.customer_shipping_address.state || "",
            zip: order.customer_shipping_address.zip || "",
            country_code: convertToISO3166Alpha3(
              order.customer_shipping_address.country_code
            ),
          },
        }),
      },
    ];

    if (!payload[0].customer_id) {
      logger.warn(
        "[Northbeam API] Missing customer_id; proceeding with empty customer_id for order",
        order.order_id
      );
    }

    logger.log("[Northbeam API] Sending order data:", {
      order_id: payload[0].order_id,
      // Never log the raw customer_id: for a guest order the canonical id IS
      // the email address, and devLogger's redaction does not know this key.
      customer_id_namespace:
        String(payload[0].customer_id || "").split(":")[0] || "none",
      purchase_total: payload[0].purchase_total,
      product_count: payload[0].products.length,
      order_tags: payload[0].order_tags,
      s2s_time_of_purchase: payload[0].time_of_purchase,
    });

    // Send to Northbeam API
    const response = await fetch("https://api.northbeam.io/v2/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Data-Client-ID": clientId,
        Authorization: apiKey,
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { message: responseText };
    }

    if (!response.ok) {
      logger.error("[Northbeam API] Error response:", {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
      });
      return NextResponse.json(
        {
          error: "Failed to send order to Northbeam",
          details: responseData,
        },
        { status: response.status }
      );
    }

    logger.log("[Northbeam API] ✅ Order sent successfully:", {
      order_id: payload[0].order_id,
      status: response.status,
    });

    // Optional debug echo: return sanitized payload when debug=1 (URL param only)
    const debugParam = req.nextUrl?.searchParams?.get("debug") === "1";
    const allowEcho = debugParam;

    if (allowEcho) {
      try {
        const echo = JSON.parse(JSON.stringify(payload));
        const o = echo?.[0] || {};
        if (o) {
          if (o.customer_email) o.customer_email = "[redacted]";
          if (o.customer_phone_number) o.customer_phone_number = "[redacted]";
          if (o.customer_name) o.customer_name = "[redacted]";
          if (o.customer_ip_address) o.customer_ip_address = "[redacted]";
        }
        return NextResponse.json({
          success: true,
          order_id: payload[0].order_id,
          status: response.status,
          data: responseData,
          echo,
        });
      } catch (_) {}
    }

    return NextResponse.json({
      success: true,
      order_id: payload[0].order_id,
      status: response.status,
      data: responseData,
    });
  } catch (error) {
    logger.error("[Northbeam API] Unexpected error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
