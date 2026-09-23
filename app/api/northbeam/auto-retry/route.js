import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";
import { api as wooApi } from "@/lib/woocommerce";
import { NB_WRITE_CONTEXT } from "@/lib/northbeam/writeContext";

/**
 * Automatic Northbeam Order Retry Cron Job
 *
 * This endpoint is designed to be called by Vercel Cron to automatically
 * retry sending orders to Northbeam that may have failed.
 *
 * Strategy:
 * - Queries recent WooCommerce orders (last 2 hours)
 * - Filters for completed/processing orders (orders we care about tracking)
 * - Attempts to send them to Northbeam via backfill endpoint
 * - Northbeam will deduplicate if order was already received
 *
 * POST /api/northbeam/auto-retry
 * GET  /api/northbeam/auto-retry
 * Headers: Authorization: Bearer <CRON_SECRET>
 *
 * Vercel Cron invokes this path with GET, so GET performs the same retry
 * work as POST. Pass ?config=1 on a GET request to get the old config echo
 * (no orders are queried or sent in that mode), which is still useful for
 * checking configuration without running a batch.
 */
async function runAutoRetry(req) {
  const startTime = Date.now();

  try {
    // Verify this is a legitimate cron request
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;

    if (!cronSecret) {
      logger.error("[NB Auto-Retry] CRON_SECRET not configured, rejecting request for security");
      return NextResponse.json(
        { error: "Unauthorized - CRON_SECRET must be configured" },
        { status: 401 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      logger.error("[NB Auto-Retry] Unauthorized cron request");
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    logger.log("[NB Auto-Retry] ⏰ Starting automatic retry job");

    // Check if Northbeam is configured
    const clientId = process.env.NB_CLIENT_ID || process.env.NORTHBEAM_CLIENT_ID;
    const apiKey = process.env.NB_API_KEY || process.env.NORTHBEAM_AUTH_TOKEN;

    if (!clientId || !apiKey) {
      logger.warn("[NB Auto-Retry] Northbeam not configured, skipping");
      return NextResponse.json({
        success: true,
        message: "Northbeam not configured, skipped",
        skipped: true,
      });
    }

    // Configuration
    const lookbackMinutes = parseInt(process.env.NB_RETRY_LOOKBACK_MINUTES) || 120; // Default 2 hours
    const maxOrdersToRetry = parseInt(process.env.NB_RETRY_MAX_ORDERS) || 50; // Safety limit
    const afterDate = new Date(Date.now() - lookbackMinutes * 60 * 1000);

    logger.log(`[NB Auto-Retry] Looking for orders modified after ${afterDate.toISOString()}`);

    // Query WooCommerce for recently modified orders. Filtering on creation
    // date missed a failed-payment order that customer service recovers
    // manually, since that recovery usually lands outside the lookback window
    // measured from when the order was first created. Filtering on
    // modification date catches the recovery regardless of when the order
    // was created.
    const { data: orders } = await wooApi.get("orders", {
      modified_after: afterDate.toISOString(),
      status: ["processing", "completed"], // Only retry orders we care about
      per_page: maxOrdersToRetry,
      orderby: "date",
      order: "desc",
    });

    if (!orders || orders.length === 0) {
      logger.log("[NB Auto-Retry] No recent orders found to retry");
      return NextResponse.json({
        success: true,
        message: "No orders to retry",
        orderCount: 0,
        lookbackMinutes,
      });
    }

    logger.log(`[NB Auto-Retry] Found ${orders.length} orders to attempt retry`);

    // Extract order IDs
    const orderIds = orders.map((order) => order.id);

    // Build URL for internal backfill endpoint
    let origin;
    try {
      origin = new URL(req.url).origin;
    } catch (_) {
      origin =
        process.env.NEXT_PUBLIC_SITE_URL ||
        process.env.SITE_URL ||
        "http://localhost:3000";
    }

    // Call the backfill endpoint (which handles deduplication and formatting)
    const backfillUrl = `${origin}/api/northbeam/backfill`;

    logger.log(`[NB Auto-Retry] Calling backfill endpoint with ${orderIds.length} orders`);

    // The backfill endpoint now requires the shared sync secret. Without this
    // header the cron would start receiving 401s the moment TK-1024 deploys.
    const backfillHeaders = { "Content-Type": "application/json" };
    if (process.env.NORTHBEAM_SYNC_API_KEY) {
      backfillHeaders["X-API-Key"] = process.env.NORTHBEAM_SYNC_API_KEY;
    } else {
      logger.error(
        "[NB Auto-Retry] NORTHBEAM_SYNC_API_KEY not configured, the backfill call will be rejected"
      );
    }

    const backfillResponse = await fetch(backfillUrl, {
      method: "POST",
      headers: backfillHeaders,
      body: JSON.stringify({
        order_ids: orderIds,
        dry_run: false,
        // These orders had a pixel fire and failed their live send, so the
        // recovered write still needs the guard, not the historical default.
        write_context: NB_WRITE_CONTEXT.LIVE_PURCHASE,
      }),
    });

    if (!backfillResponse.ok) {
      const errorText = await backfillResponse.text();
      throw new Error(
        `Backfill failed: ${backfillResponse.status} ${errorText}`
      );
    }

    const backfillResult = await backfillResponse.json();

    const duration = Date.now() - startTime;

    logger.log(
      `[NB Auto-Retry] ✅ Completed in ${duration}ms:`,
      `${backfillResult.totals?.ok || 0} succeeded,`,
      `${backfillResult.totals?.refused || 0} refused,`,
      `${backfillResult.totals?.failed || 0} failed`
    );

    return NextResponse.json({
      success: true,
      message: "Auto-retry completed",
      duration: `${duration}ms`,
      lookbackMinutes,
      ordersAttempted: orderIds.length,
      results: {
        succeeded: backfillResult.totals?.ok || 0,
        refused: backfillResult.totals?.refused || 0,
        failed: backfillResult.totals?.failed || 0,
      },
      // Include failed order IDs for monitoring
      failedOrderIds: backfillResult.results
        ?.filter((r) => r.status === "failed" || r.status === "error")
        .map((r) => r.id) || [],
      // A refused order was deliberately never sent, on a permanent business
      // rule. Naming it here stops it from silently vanishing from this
      // report now that totals.refused is no longer folded into succeeded.
      refusedOrderIds: backfillResult.results
        ?.filter((r) => r.status === "refused")
        .map((r) => r.id) || [],
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error("[NB Auto-Retry] Error during auto-retry:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Auto-retry failed",
        details: error.message,
        duration: `${duration}ms`,
      },
      { status: 500 }
    );
  }
}

/**
 * Returns configuration and status info without touching any orders. Kept
 * behind the ?config=1 query param on GET, since checking configuration is
 * still useful without running a batch.
 */
function configEcho(req) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || process.env.VERCEL_CRON_SECRET;

  // Require authentication for the config echo as well
  if (!cronSecret) {
    return NextResponse.json(
      { error: "Unauthorized - CRON_SECRET must be configured" },
      { status: 401 }
    );
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const lookbackMinutes = parseInt(process.env.NB_RETRY_LOOKBACK_MINUTES) || 120;
  const maxOrdersToRetry = parseInt(process.env.NB_RETRY_MAX_ORDERS) || 50;
  const isConfigured = !!(
    (process.env.NB_CLIENT_ID || process.env.NORTHBEAM_CLIENT_ID) &&
    (process.env.NB_API_KEY || process.env.NORTHBEAM_AUTH_TOKEN)
  );

  return NextResponse.json({
    status: "ready",
    configuration: {
      northbeamConfigured: isConfigured,
      lookbackMinutes,
      maxOrdersToRetry,
      afterDate: new Date(Date.now() - lookbackMinutes * 60 * 1000).toISOString(),
    },
    message: "Use GET (or POST) without ?config=1 to trigger the retry, or let Vercel Cron handle it automatically",
  });
}

export async function POST(req) {
  return runAutoRetry(req);
}

/**
 * Vercel Cron calls this path with GET every 10 minutes, so GET now performs
 * the real retry work rather than only echoing configuration. Pass
 * ?config=1 to get the old config echo instead, for checking configuration
 * without running a batch.
 */
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  if (searchParams.get("config") === "1") {
    return configEcho(req);
  }
  return runAutoRetry(req);
}
