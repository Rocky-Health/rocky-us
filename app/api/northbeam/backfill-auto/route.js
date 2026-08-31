import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";
import { api as wooApi } from "@/lib/woocommerce";
import { requireSyncApiKey } from "@/lib/northbeam/syncAuth";

/**
 * POST /api/northbeam/backfill-auto
 * 
 * This endpoint is designed for WordPress plugin automated backfill.
 * Accepts: { order_ids: number[], batch_id?: string, wp_cron_run?: string }
 * 
 * Fetches WooCommerce orders and forwards to Northbeam.
 * Returns statistics about succeeded/failed orders.
 */

/**
 * Convert 2-letter country code to 3-letter ISO 3166-1 alpha-3 code
 */
const convertToISO3166Alpha3 = (countryCode) => {
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
 * Map WooCommerce order to Northbeam format
 */
const mapWooToNorthbeamOrder = (order) => {
  const purchaseTotal = parseFloat(order?.total ?? 0) || 0;
  const tax = parseFloat(order?.total_tax ?? 0) || 0;
  const shipping = parseFloat(order?.shipping_total ?? 0) || 0;
  const discountAmount = parseFloat(order?.discount_total ?? 0) || 0;
  const email = order?.billing?.email || "";
  const phone = order?.billing?.phone || "";
  const name = `${order?.billing?.first_name || ""} ${order?.billing?.last_name || ""}`.trim();
  const status = String(order?.status || "");
  const timeCandidate =
    order?.date_paid_gmt ||
    order?.date_created_gmt ||
    order?.date_paid ||
    order?.date_completed ||
    order?.date_created;

  // Build product list
  const products = Array.isArray(order?.line_items)
    ? order.line_items.map((item) => {
        const unitPrice =
          (parseFloat(item?.total || 0) || 0) /
            Math.max(1, parseInt(item?.quantity || 1, 10) || 1) || 0;
        const variantId = item?.variation_id ? String(item.variation_id) : "";
        const base = {
          id: item?.sku || String(item?.product_id || ""),
          product_id: String(item?.product_id || ""),
          name: item?.name || "",
          quantity: parseInt(item?.quantity || 1, 10) || 1,
          price: unitPrice,
        };
        if (variantId) base.variant_id = variantId;
        return base;
      })
    : [];

  // Build status tag
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

  const hasSubscription = products.some(
    (p) => /subscription/i.test(p?.name || "")
  );
  const lifecycle = hasSubscription
    ? order?.is_first_order
      ? "Subscription First Order"
      : "Subscription Recurring"
    : "OTC";

  // Shipping address
  const shippingAddress = order?.shipping
    ? {
        address1: order.shipping.address_1 || "",
        address2: order.shipping.address_2 || "",
        city: order.shipping.city || "",
        state: order.shipping.state || "",
        zip: order.shipping.postcode || "",
        country_code: convertToISO3166Alpha3(order.shipping.country),
      }
    : undefined;

  // Build canonical customer_id
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
    customer_id: canonicalCustomerId || String(order?.customer_id || email || ""),
    customer_id_canonical: canonicalCustomerId || String(order?.customer_id || email || ""),
    time_of_purchase: new Date(timeCandidate || order?.date_created || Date.now()).toISOString(),
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

export async function POST(req) {
  const startTime = Date.now();
  
  try {
    const unauthorized = requireSyncApiKey(req, "NB Backfill Auto", logger);
    if (unauthorized) return unauthorized;

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.order_ids) ? body.order_ids : [];
    const batchId = body?.batch_id || `batch_${Date.now()}`;
    const wpCronRun = body?.wp_cron_run || "manual";
    const forceResync = Boolean(body?.force_resync);

    logger.info(`[NB Backfill Auto] Started: ${batchId}`, {
      batch_id: batchId,
      wp_cron_run: wpCronRun,
      order_count: ids.length,
      force_resync: forceResync,
    });

    if (!ids.length) {
      return NextResponse.json(
        { error: "order_ids array required" },
        { status: 400 }
      );
    }

    // Validate Northbeam credentials
    const clientId = process.env.NB_CLIENT_ID || process.env.NORTHBEAM_CLIENT_ID;
    const apiKey = process.env.NB_API_KEY || process.env.NORTHBEAM_AUTH_TOKEN;
    if (!clientId || !apiKey) {
      logger.error("[NB Backfill Auto] Missing Northbeam credentials");
      return NextResponse.json(
        { error: "Northbeam configuration missing (NB_CLIENT_ID/NB_API_KEY)" },
        { status: 500 }
      );
    }

    // Get origin for internal API calls
    let origin;
    try {
      origin = new URL(req.url).origin;
    } catch (_) {
      origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        "https://rocky-us.vercel.app";
    }

    // Process orders
    const results = [];
    let succeeded = 0;
    let failed = 0;
    let skipped = 0;

    for (const rawId of ids) {
      const id = String(rawId).trim();
      if (!/^[0-9]+$/.test(id)) {
        results.push({ id, status: "skipped", reason: "invalid_id" });
        skipped++;
        continue;
      }

      try {
        // Fetch WooCommerce order
        const { data: order } = await wooApi.get(`orders/${id}`);
        if (!order?.id) {
          results.push({ id, status: "not_found" });
          failed++;
          
          // Mark as backfilled attempt even if not found to prevent retry loops
          try {
            await wooApi.put(`orders/${id}`, {
              meta_data: [
                { key: '_northbeam_backfill_attempts', value: String(((order?.meta_data?.find(m => m.key === '_northbeam_backfill_attempts')?.value || 0) + 1)) },
                { key: '_northbeam_last_backfill_attempt', value: new Date().toISOString() },
              ]
            });
          } catch (metaErr) {
            logger.error(`[NB Backfill Auto] Failed to update meta for order ${id}:`, metaErr);
          }
          
          continue;
        }

        // Deduplication checks (skip if force_resync is true)
        if (!forceResync) {
          // Check if already backfilled
          const nbBackfilled = order?.meta_data?.find(m => m.key === '_northbeam_backfilled');
          if (nbBackfilled?.value === 'yes') {
            results.push({ id, status: "skipped", reason: "already_backfilled" });
            skipped++;
            logger.info(`[NB Backfill Auto] Skipped order ${id}: already backfilled`);
            continue;
          }

          // Check if Relay plugin already synced
          const relayMeta = order?.meta_data?.find(m => m.key === '_nb_last_pushed_total');
          if (relayMeta) {
            results.push({ 
              id, 
              status: "skipped", 
              reason: "handled_by_relay",
              handled_by_relay: true 
            });
            skipped++;
            logger.info(`[NB Backfill Auto] Skipped order ${id}: handled by Relay plugin`);
            continue;
          }
        }

        // Map to Northbeam format
        const mapped = mapWooToNorthbeamOrder(order);

        // Send to Northbeam via internal API
        const internalUrl = `${origin}/api/northbeam/orders`;
        const res = await fetch(internalUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orders: [mapped] }),
          cache: "no-store",
        });

        if (!res.ok) {
          const text = await res.text();
          results.push({
            id,
            status: "failed",
            error: `${res.status} ${res.statusText}`,
            details: text.substring(0, 200),
          });
          failed++;
          
          // Update attempt count
          try {
            const currentAttempts = order?.meta_data?.find(m => m.key === '_northbeam_backfill_attempts')?.value || 0;
            await wooApi.put(`orders/${id}`, {
              meta_data: [
                { key: '_northbeam_backfill_attempts', value: String(Number(currentAttempts) + 1) },
                { key: '_northbeam_last_backfill_attempt', value: new Date().toISOString() },
              ]
            });
          } catch (metaErr) {
            logger.error(`[NB Backfill Auto] Failed to update meta for order ${id}:`, metaErr);
          }
          
          continue;
        }

        const json = await res.json().catch(() => ({}));
        results.push({ id, status: "ok", northbeam: json });
        succeeded++;
        
        // Mark order as successfully backfilled
        try {
          await wooApi.put(`orders/${id}`, {
            meta_data: [
              { key: '_northbeam_backfilled', value: 'yes' },
              { key: '_northbeam_backfilled_at', value: new Date().toISOString() },
              { key: '_northbeam_backfill_batch_id', value: batchId },
            ]
          });
        } catch (metaErr) {
          logger.error(`[NB Backfill Auto] Failed to mark order ${id} as backfilled:`, metaErr);
        }
        
      } catch (err) {
        logger.error(`[NB Backfill Auto] Error processing order ${id}:`, err);
        results.push({ id, status: "error", error: err?.message || String(err) });
        failed++;
      }
    }

    const duration = Date.now() - startTime;
    
    logger.info(`[NB Backfill Auto] Completed: ${batchId}`, {
      batch_id: batchId,
      wp_cron_run: wpCronRun,
      total: ids.length,
      succeeded,
      failed,
      skipped,
      duration_ms: duration,
    });

    return NextResponse.json({
      success: true,
      batch_id: batchId,
      wp_cron_run: wpCronRun,
      stats: {
        total: ids.length,
        succeeded,
        failed,
        skipped,
        processed: succeeded + failed,
        duration_ms: duration,
      },
      results,
    });
  } catch (error) {
    logger.error("[NB Backfill Auto] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}

