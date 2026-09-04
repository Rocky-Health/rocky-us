import { NextResponse } from "next/server";
import { normalizeOrderId } from "@/lib/northbeam/orderId";
import { resolveOrderTimeIso } from "@/lib/northbeam/orderTime";
import { NB_WRITE_CONTEXT } from "@/lib/northbeam/writeContext";
import { logger } from "@/utils/devLogger";
import { api as wooApi } from "@/lib/woocommerce";
import { requireSyncApiKey } from "@/lib/northbeam/syncAuth";
import { buildCanonicalOrderTags } from "@/lib/northbeam/orderTags";
import { buildSourceTagsFromOrder } from "@/lib/northbeam/attributionTags";
import {
  classifySyncResponse,
  syncOutcomeMeta,
  NB_SYNC_OUTCOME,
} from "@/lib/northbeam/syncOutcome";
import { checkIfAlreadySynced } from "@/lib/northbeam/orderGuards";
import {
  evaluateAuditWindow,
  normalizeAuditMode,
  NB_AUDIT_MODE,
  NB_AUDIT_INELIGIBLE,
} from "@/lib/northbeam/auditWindow";

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
    // Northbeam dedupes on order_id, so a non primary key here becomes a
    // separate record for the same purchase. String(order?.id) on a
    // missing id yields the string "undefined", which survives a
    // truthiness check downstream, so normalize explicitly.
    order_id: normalizeOrderId(order?.id),
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
    // The Woo REST order carries no product categories, only line item names
    // and ids, so there is nothing here to build categoryTags from. Leaving it
    // out is correct: buildCanonicalOrderTags drops an empty axis rather than
    // inventing one.
    order_tags: buildCanonicalOrderTags({
      status,
      order,
      sourceTags: buildSourceTagsFromOrder(order),
    }),
    products,
    nb_write_context: NB_WRITE_CONTEXT.HISTORICAL_BACKFILL,
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

    // TK-1030: this route is an auditor by default. AUDIT reports a gap and
    // writes and sends nothing; REPAIR is the pre-existing send path and has
    // to be asked for explicitly, because it is a write to the vendor.
    const modeInput = body?.mode ?? req.nextUrl?.searchParams?.get("mode");
    const mode = normalizeAuditMode(modeInput);

    logger.info(`[NB Backfill Auto] Started: ${batchId}`, {
      batch_id: batchId,
      wp_cron_run: wpCronRun,
      order_count: ids.length,
      force_resync: forceResync,
      mode,
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
    let unmarked = 0;
    let skipped = 0;
    let gaps = 0;

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

        // Deduplication checks (skip if force_resync is true). Shared with the
        // manual backfill route via checkIfAlreadySynced so a Relay sync or a
        // prior backfill reads the same way in both routes.
        // force_resync is an operator override for THIS route's own marker. It
        // deliberately does NOT extend to an order the Relay pushed:
        // `handled_by_relay` means the canonical single writer owns that row,
        // and re-sending it is the exact destructive second write TK-1027 made
        // this route stop doing. An override that can undo the cutover is not
        // an override, it is a hole.
        const syncStatusForOverride = checkIfAlreadySynced(order);
        const relayOwnsOrder = syncStatusForOverride.handled_by_relay === true;

        if (!forceResync || relayOwnsOrder) {
          const syncStatus = syncStatusForOverride;
          if (syncStatus.synced) {
            results.push({
              id,
              status: "skipped",
              reason: syncStatus.handled_by_relay ? "handled_by_relay" : "already_backfilled",
              handled_by_relay: syncStatus.handled_by_relay,
            });
            skipped++;
            logger.info(
              `[NB Backfill Auto] Skipped order ${id}: ${
                syncStatus.handled_by_relay ? "handled by Relay plugin" : "already backfilled"
              }`
            );
            continue;
          }

          // A prior run refused this order on a permanent business rule
          // (see lib/northbeam/orderGuards.js). It was never sent, so it must
          // not be counted or reported as a sync, only skipped again.
          if (syncStatus.refused) {
            results.push({ id, status: "skipped", reason: "previously_refused" });
            skipped++;
            logger.info(
              `[NB Backfill Auto] Skipped order ${id}: previously refused (${syncStatus.refused_reason})`
            );
            continue;
          }
        }

        // TK-1030: demote this route to an auditor. An order outside the
        // canonical era proves nothing about the canonical writer's silence,
        // so it is reported as ineligible rather than as a gap, and nothing is
        // sent or written for it either way. See lib/northbeam/auditWindow.js.
        const audit = evaluateAuditWindow(order);
        if (!audit.eligible) {
          results.push({ id, status: "skipped", reason: audit.reason });
          skipped++;
          continue;
        }

        if (mode === NB_AUDIT_MODE.AUDIT) {
          // A true gap: eligible for audit, unsynced, and mode has not opted
          // into REPAIR. Report it and stop. Writing or sending anything here
          // would be exactly the competing-writer behaviour TK-1030 exists to
          // stop.
          results.push({
            id,
            status: "gap",
            reason: "unsynced_post_cutover",
            paid_at: new Date(audit.paidMs).toISOString(),
          });
          gaps++;
          continue;
        }

        // mode REPAIR: a true gap is pushed through the existing send path,
        // completely unchanged below.

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

        // The route answers HTTP 200 for both a genuine delivery and a
        // deliberate refusal (internal coupon, zero value order, and so on),
        // so res.ok alone cannot tell them apart. classifySyncResponse is the
        // one place that makes the call; see lib/northbeam/syncOutcome.js for
        // the defect that collapsing REFUSED into ACCEPTED caused.
        const json = await res.json().catch(() => null);
        const classified = classifySyncResponse({ ok: res.ok, status: res.status, body: json });
        const outcomeTimestamp = new Date().toISOString();

        if (classified.outcome === NB_SYNC_OUTCOME.ACCEPTED) {
          // Mark order as successfully backfilled.
          //
          // The marker write can fail on its own, and swallowing that while
          // still reporting a clean "ok" recreates this ticket's defect from
          // the other direction: Northbeam HAS the order, nothing on our side
          // records it, and a later run writes over a canonical record. The
          // delivery is still a success and is still reported as one; what
          // changes is that a missing marker stops being invisible.
          let markerWritten = true;
          try {
            await wooApi.put(`orders/${id}`, {
              meta_data: [
                ...syncOutcomeMeta(classified, outcomeTimestamp),
                { key: '_northbeam_backfill_batch_id', value: batchId },
              ]
            });
          } catch (metaErr) {
            markerWritten = false;
            logger.error(`[NB Backfill Auto] Order ${id} delivered but the marker was not written:`, metaErr);
            unmarked++;
          }

          results.push({ id, status: "ok", marker_written: markerWritten, northbeam: json });
          succeeded++;

          continue;
        }

        if (classified.outcome === NB_SYNC_OUTCOME.REFUSED) {
          // Never sent, so never the delivery marker. Recorded under its own
          // refusal keys so this order stays distinguishable from one Northbeam
          // actually has, and checkIfAlreadySynced can skip it without lying.
          results.push({ id, status: "refused", reason: classified.reason });
          skipped++;
          logger.info(`[NB Backfill Auto] Order ${id} refused: ${classified.reason}`);

          try {
            await wooApi.put(`orders/${id}`, {
              meta_data: syncOutcomeMeta(classified, outcomeTimestamp),
            });
          } catch (metaErr) {
            logger.error(`[NB Backfill Auto] Failed to record refusal meta for order ${id}:`, metaErr);
          }

          continue;
        }

        // FAILED: no delivery marker, so the order stays retryable on the next run.
        results.push({
          id,
          status: "failed",
          error: `${res.status} ${res.statusText}`,
          reason: classified.reason,
          details: json,
        });
        failed++;

        // Update attempt count
        try {
          const currentAttempts = order?.meta_data?.find(m => m.key === '_northbeam_backfill_attempts')?.value || 0;
          await wooApi.put(`orders/${id}`, {
            meta_data: [
              { key: '_northbeam_backfill_attempts', value: String(Number(currentAttempts) + 1) },
              { key: '_northbeam_last_backfill_attempt', value: outcomeTimestamp },
            ]
          });
        } catch (metaErr) {
          logger.error(`[NB Backfill Auto] Failed to update meta for order ${id}:`, metaErr);
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
      gaps,
      unmarked,
      mode,
      duration_ms: duration,
    });

    return NextResponse.json({
      success: true,
      batch_id: batchId,
      wp_cron_run: wpCronRun,
      mode,
      gaps,
      unmarked,
      stats: {
        total: ids.length,
        succeeded,
        failed,
        skipped,
        gaps,
        unmarked,
        mode,
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

