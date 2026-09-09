import { NextResponse } from "next/server";
import { normalizeOrderId } from "@/lib/northbeam/orderId";
import { resolveOrderTimeIso } from "@/lib/northbeam/orderTime";
import { normalizeWriteContext } from "@/lib/northbeam/writeContext";
import { logger } from "@/utils/devLogger";
import { api as wooApi } from "@/lib/woocommerce";
import { requireSyncApiKey } from "@/lib/northbeam/syncAuth";
import {
  checkIfAlreadySynced,
  isSubscriptionDerivative,
} from "@/lib/northbeam/orderGuards";
import { buildCanonicalOrderTags } from "@/lib/northbeam/orderTags";
import { buildSourceTagsFromOrder } from "@/lib/northbeam/attributionTags";
import {
  classifySyncResponse,
  syncOutcomeMeta,
  NB_SYNC_OUTCOME,
} from "@/lib/northbeam/syncOutcome";

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
 * POST /api/northbeam/backfill
 * Body: { order_ids: (number[]|string[]), dry_run?: boolean }
 * For each Woo order id, fetch order + forward to `/api/northbeam/orders`.
 */
export async function POST(req) {
  try {
    const unauthorized = requireSyncApiKey(req, "NB Backfill", logger);
    if (unauthorized) return unauthorized;

    const body = await req.json().catch(() => ({}));
    const ids = Array.isArray(body?.order_ids) ? body.order_ids : [];
    const dryRun = Boolean(body?.dry_run);
    // Threaded through explicitly rather than guessed. auto-retry recovers
    // orders whose live send already failed after a pixel had fired, so it
    // declares live_purchase; anything else defaults to historical, which
    // normalizeWriteContext already guarantees for an absent or unrecognised
    // value.
    const writeContext = normalizeWriteContext(body?.write_context);
    // Pass-through debug echo controls to internal NB orders route (URL param only)
    const debugParam = req.nextUrl?.searchParams?.get("debug") === "1";

    if (!ids.length) {
      return NextResponse.json(
        { error: "order_ids array required" },
        { status: 400 }
      );
    }

    // Validate Northbeam credentials exist early to fail fast if not configured
    const clientId = process.env.NB_CLIENT_ID || process.env.NORTHBEAM_CLIENT_ID;
    const apiKey = process.env.NB_API_KEY || process.env.NORTHBEAM_AUTH_TOKEN;
    if (!clientId || !apiKey) {
      return NextResponse.json(
        { error: "Northbeam configuration missing (NB_CLIENT_ID/NB_API_KEY)" },
        { status: 500 }
      );
    }

    // Helper: map Woo order to the shape our NB orders endpoint expects
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

      // Build canonical customer_id aligned with client/pixel and server route
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
        // Northbeam dedupes on order_id, so a non primary key here becomes a
    // separate record for the same purchase. String(order?.id) on a
    // missing id yields the string "undefined", which survives a
    // truthiness check downstream, so normalize explicitly.
    order_id: normalizeOrderId(order?.id),
        // Provide canonical id for parity with pixel and to override on server
        customer_id: canonicalCustomerId || String(order?.customer_id || email || ""),
        customer_id_canonical: canonicalCustomerId || String(order?.customer_id || email || ""),
        // timeCandidate already prefers the _gmt fields; resolveOrderTimeIso pins
    // them to UTC and drops the bare date_created tail, which carried no
    // offset and so resolved against the runtime's own timezone.
    time_of_purchase: resolveOrderTimeIso(order) || new Date(timeCandidate || Date.now()).toISOString(),
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
        // The Woo REST order carries no product categories here either, so no
        // categoryTags argument is passed; buildCanonicalOrderTags drops an
        // empty axis rather than inventing one.
        order_tags: buildCanonicalOrderTags({
          status,
          order,
          sourceTags: buildSourceTagsFromOrder(order),
        }),
        products,
        nb_write_context: writeContext,
        ...(shippingAddress ? { customer_shipping_address: shippingAddress } : {}),
      };
    };

    // Resolve same-origin base URL from incoming request to avoid external network hops
    let origin;
    try {
      origin = new URL(req.url).origin;
    } catch (_) {
      origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        "http://localhost:3000";
    }

    // Process sequentially to avoid overwhelming Woo/NB; could batch if needed
    const results = [];
    for (const rawId of ids) {
      const id = String(rawId).trim();
      if (!/^[0-9]+$/.test(id)) {
        results.push({ id, status: "skipped", reason: "invalid_id" });
        continue;
      }

      try {
        // 1) Fetch Woo order
        const { data: order } = await wooApi.get(`orders/${id}`);
        if (!order?.id) {
          results.push({ id, status: "not_found" });
          continue;
        }

        // 1a) Never backfill subscription renewals, resubscribes or switches.
        // The integration only sends parent purchases, so pushing these would
        // invent orders Northbeam has never seen from the live path.
        if (isSubscriptionDerivative(order)) {
          logger.log("[NB Backfill] Skipping subscription-derived order", id);
          results.push({ id, status: "skipped", reason: "subscription_renewal" });
          continue;
        }

        // 1b) Never re-push an order that is already in Northbeam. A re-push
        // overwrites the stored record and wipes its marketing source tags.
        const syncStatus = checkIfAlreadySynced(order);
        if (syncStatus.synced) {
          logger.log("[NB Backfill] Skipping already-synced order", id, syncStatus.handled_by_relay ? "(relay)" : "(backfill)");
          results.push({
            id,
            status: "skipped",
            reason: syncStatus.handled_by_relay
              ? "already_sent_by_relay"
              : "already_backfilled",
            synced_at: syncStatus.synced_at,
          });
          continue;
        }

        // 2) Map to NB format our server accepts
        const mapped = mapWooToNorthbeamOrder(order);

        if (dryRun) {
          results.push({ id, status: "dry_run", payload_preview: { ...mapped, customer_email: "[redacted]", customer_phone_number: "[redacted]", customer_name: "[redacted]", customer_ip_address: "[redacted]" } });
          continue;
        }

        // 3) Send to our own NB endpoint (same-origin) to centralize logic/tags
        const internalUrl = `${origin}/api/northbeam/orders${debugParam ? "?debug=1" : ""}`;
        const headers = { "Content-Type": "application/json" };
        if (process.env.NORTHBEAM_SYNC_API_KEY) {
          headers["X-API-Key"] = process.env.NORTHBEAM_SYNC_API_KEY;
        } else {
          logger.error(
            "[NB Backfill] NORTHBEAM_SYNC_API_KEY not configured, the orders call will be rejected"
          );
        }
        const res = await fetch(internalUrl, {
          method: "POST",
          headers,
          body: JSON.stringify({ orders: [mapped] }),
          // Avoid caching
          cache: "no-store",
        });

        // The route answers HTTP 200 for both a genuine delivery and a
        // deliberate refusal (internal coupon, zero value order, and so on),
        // so res.ok alone cannot tell them apart. classifySyncResponse is the
        // one place that makes the call; see lib/northbeam/syncOutcome.js for
        // the defect that collapsing REFUSED into ACCEPTED caused.
        const json = await res.json().catch(() => null);
        const classified = classifySyncResponse({ ok: res.ok, status: res.status, body: json });
        const outcomeTimestamp = new Date().toISOString();

        if (classified.outcome === NB_SYNC_OUTCOME.ACCEPTED) {
          // A genuine delivery has to be marked, or checkIfAlreadySynced never
          // sees it and the same order is reselected and re-sent forever. This
          // route wrote no meta at all on success before TK-1030.
          //
          // The marker write can itself fail, and swallowing that failure while
          // still reporting a clean "ok" recreates the same divergence from the
          // other direction: Northbeam HAS the order, nothing on our side
          // records it, and a later run writes over a canonical record. So the
          // marker outcome is reported rather than logged and forgotten.
          let markerWritten = true;
          try {
            await wooApi.put(`orders/${id}`, {
              meta_data: syncOutcomeMeta(classified, outcomeTimestamp),
            });
          } catch (metaErr) {
            markerWritten = false;
            logger.error("[NB Backfill] Delivered but failed to mark order as backfilled", id, metaErr);
          }

          // If internal route echoed sanitized payload, surface it under payload_preview for convenience
          const payloadEcho = Array.isArray(json?.echo) && json.echo.length > 0 ? json.echo[0] : undefined;
          const resultEntry = { id, status: "ok", marker_written: markerWritten, northbeam: json };
          if (payloadEcho) {
            resultEntry.payload_preview = payloadEcho;
          }
          results.push(resultEntry);

          continue;
        }

        if (classified.outcome === NB_SYNC_OUTCOME.REFUSED) {
          // Never sent, so never the delivery marker. Recorded under its own
          // refusal keys so this order stays distinguishable from one
          // Northbeam actually has, and checkIfAlreadySynced can skip it
          // without lying about what happened to it.
          results.push({ id, status: "refused", reason: classified.reason });

          try {
            await wooApi.put(`orders/${id}`, {
              meta_data: syncOutcomeMeta(classified, outcomeTimestamp),
            });
          } catch (metaErr) {
            logger.error("[NB Backfill] Failed to record refusal meta", id, metaErr);
          }

          continue;
        }

        // FAILED: no outcome meta written, so the order stays retryable on
        // the next run.
        results.push({
          id,
          status: "failed",
          error: `${res.status} ${res.statusText}`,
          http_status: res.status,
          reason: classified.reason,
          details: json,
        });
      } catch (err) {
        logger.error("[NB Backfill] Error processing order", id, err);
        results.push({ id, status: "error", error: err?.message || String(err) });
      }
    }

    // "ok" is now written only for the ACCEPTED branch above, so counting it
    // no longer counts a refusal as a delivery. refused gets its own bucket
    // rather than being folded into either ok or failed.
    const okCount = results.filter((r) => r.status === "ok").length;
    const refusedCount = results.filter((r) => r.status === "refused").length;
    const failCount = results.filter((r) => r.status === "failed" || r.status === "error").length;
    return NextResponse.json({
      success: true,
      dry_run: dryRun,
      // Delivered, but we failed to record that we delivered it. Counted on
      // its own because it is the one outcome that looks clean and is not: the
      // order is in Northbeam carrying no marker, so the auditor reports it as
      // a gap on its next run. That gap is FALSE and must not be repaired
      // blindly, since repairing it is a second write over a canonical record.
      totals: {
        count: ids.length,
        ok: okCount,
        refused: refusedCount,
        failed: failCount,
        unmarked: results.filter((r) => r.status === "ok" && r.marker_written === false).length,
      },
      results,
    });
  } catch (error) {
    logger.error("[NB Backfill] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}


