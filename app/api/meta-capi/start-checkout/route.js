import { NextResponse } from "next/server";
import { getGatewayConfig } from "@/utils/metaCapiConfig";
import { MILESTONES } from "@/utils/metaBrowserEventConfig";
import { hashEmail, hashSHA256 } from "@/utils/analytics/hashServerSide";
import { processMetaParameters } from "@/lib/meta/paramBuilderHelper";
import { toMoney } from "@/utils/priceFormatter";

/**
 * Server-side Meta CAPI mirror for the "Start Checkout" funnel milestone (TK-633).
 *
 * Mirrors the client-side pixel fire from trackMetaStartCheckout()/emitMetaFunnelEvent()
 * so Meta receives both the browser (fbq) and server (CAPI) signal for the same
 * event and DEDUPLICATES them. Dedup requires the two to share BOTH:
 *   - event_name: `${gateway.customEventName}_SC`  (e.g. RKY_FLW_SC), and
 *   - event_id:   the exact id the browser generated (passed in the request body),
 *                 suffixed per secondary pixel the same way the browser does.
 *
 * Intentionally lighter than the Purchase route: there is no order yet, so user
 * matching uses the logged-in email + user id cookies (when present) plus
 * fbp/fbc/ip/ua. Never throws into the caller; failures are logged and returned
 * as JSON. Fires only in production, matching the Purchase route.
 */

const SC_SUFFIX = `_${MILESTONES.START_CHECKOUT}`; // "_SC" — stays in lockstep with the browser config

const isRetryableStatus = (status) => status === 429 || (status >= 500 && status < 600);

const isRetryableError = (error) => {
  const code = error?.code || error?.cause?.code || "";
  if (["ETIMEDOUT", "ECONNRESET", "EAI_AGAIN", "ENOTFOUND", "ECONNREFUSED"].includes(code)) {
    return true;
  }
  const message = (error?.message || "").toLowerCase();
  return (
    message.includes("timeout") || message.includes("network") || message.includes("fetch failed")
  );
};

const parseCookies = (req) => {
  const header = req.headers.get("cookie") || "";
  const out = {};
  header.split(";").forEach((c) => {
    const [k, ...v] = c.split("=");
    if (k && v.length) out[k.trim()] = v.join("=").trim();
  });
  return out;
};

const safeDecode = (v) => {
  if (!v) return "";
  try {
    return decodeURIComponent(v);
  } catch (_) {
    return v;
  }
};

export async function POST(req) {
  try {
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: "Non-production environment",
      });
    }

    const payload = await req.json();
    const { gateway, event_id, value, currency, content_id, rky_cat, event_source_url } = payload || {};

    // event_id is required — without it the server event can't dedup against the
    // browser fire and would double-count.
    if (!event_id) {
      return NextResponse.json({ error: "Missing event_id" }, { status: 400 });
    }

    let gatewayConfig;
    try {
      gatewayConfig = getGatewayConfig(gateway);
    } catch (_) {
      return NextResponse.json({ error: `Unknown gateway: ${gateway}` }, { status: 400 });
    }
    if (!gatewayConfig?.accessToken) {
      console.error(
        `[Meta CAPI SC] gateway "${gateway}" has no access token (FB_ACCESS_TOKEN_${gateway} empty/missing).`
      );
      return NextResponse.json(
        { error: `Missing access token for gateway: ${gateway}` },
        { status: 400 }
      );
    }

    // --- User matching (pre-order: cookies + fbp/fbc/ip/ua) ---
    const cookies = parseCookies(req);
    const userEmail = safeDecode(cookies.userEmail);
    const userId = safeDecode(cookies.userId);

    const em = userEmail ? hashEmail(userEmail) : "";
    const external_id = userId ? hashSHA256(String(userId)) : "";

    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "";
    const userAgent = req.headers.get("user-agent") || "";
    const metaParams = await processMetaParameters(req, payload.meta_params || {});

    const userData = {
      client_ip_address: clientIP,
      client_user_agent: userAgent,
    };
    if (em) userData.em = [em];
    if (external_id) userData.external_id = [external_id];
    if (metaParams.fbp) userData.fbp = metaParams.fbp;
    if (metaParams.fbc) userData.fbc = metaParams.fbc;

    const resolvedCurrency = currency || "USD";
    const customData = {
      value: toMoney(value || 0),
      currency: resolvedCurrency,
      content_ids: content_id ? [String(content_id)] : [],
      content_type: "item",
      rky_cat: rky_cat || gateway,
    };

    const eventSourceUrl = event_source_url || "https://www.myrocky.com/checkout";
    const eventTime = Math.floor(Date.now() / 1000);

    const buildEventPayload = (eventName, perPixelEventId) => ({
      event_name: eventName,
      event_time: eventTime,
      event_id: perPixelEventId,
      event_source_url: eventSourceUrl,
      action_source: "website",
      user_data: userData,
      custom_data: customData,
    });

    // Primary + secondary pixels, mirroring the Purchase route fan-out. Event
    // names get the _SC milestone suffix; secondary event_ids are suffixed with
    // the secondary's event name to match the browser's dedup namespaces.
    const targets = [
      {
        pixelId: gatewayConfig.pixelId,
        eventName: `${gatewayConfig.customEventName}${SC_SUFFIX}`,
        eventId: event_id,
        label: gateway,
        isPrimary: true,
      },
      ...(gatewayConfig.secondaryPixels || []).map((sec) => ({
        pixelId: sec.pixelId,
        eventName: `${sec.customEventName}${SC_SUFFIX}`,
        eventId: `${event_id}_${sec.customEventName}`,
        label: `${gateway}/${sec.customEventName}${SC_SUFFIX}`,
        isPrimary: false,
      })),
    ];

    const sendOneTarget = async (target, attempt = 1) => {
      const url = `https://graph.facebook.com/v18.0/${target.pixelId}/events`;
      const eventPayload = buildEventPayload(target.eventName, target.eventId);
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: gatewayConfig.accessToken,
            data: [eventPayload],
          }),
        });

        if (!response.ok) {
          const text = await response.text();
          if (attempt === 1 && isRetryableStatus(response.status)) {
            await new Promise((r) => setTimeout(r, 1000));
            return sendOneTarget(target, 2);
          }
          throw new Error(`Meta API ${response.status}: ${text.substring(0, 200)}`);
        }

        const data = await response.json();
        if (data.error) throw new Error(data.error.message || "Meta API error");

        console.log(`[Meta CAPI SC] ✅ ${target.label}:`, {
          event_name: target.eventName,
          event_id: target.eventId,
          events_received: data.events_received || 0,
          fbtrace_id: data.fbtrace_id,
        });
        return {
          success: true,
          pixel_id: target.pixelId,
          event_name: target.eventName,
          event_id: target.eventId,
          events_received: data.events_received || 0,
          fbtrace_id: data.fbtrace_id,
        };
      } catch (error) {
        if (attempt === 1 && isRetryableError(error)) {
          await new Promise((r) => setTimeout(r, 1000));
          return sendOneTarget(target, 2);
        }
        console.error(`[Meta CAPI SC] ❌ ${target.label}:`, error?.message);
        return {
          success: false,
          pixel_id: target.pixelId,
          event_name: target.eventName,
          event_id: target.eventId,
          error: error?.message || "unknown error",
        };
      }
    };

    const results = await Promise.all(targets.map((t) => sendOneTarget(t)));
    const primaryResult = results[0];
    const secondaryResults = results.slice(1);

    if (!primaryResult.success) {
      return NextResponse.json(
        {
          success: false,
          gateway,
          primary: primaryResult,
          secondaries: secondaryResults,
          error: primaryResult.error || "Primary CAPI fire failed",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      gateway,
      event_id: primaryResult.event_id,
      events_received: primaryResult.events_received,
      fbtrace_id: primaryResult.fbtrace_id,
      primary: primaryResult,
      secondaries: secondaryResults,
    });
  } catch (error) {
    console.error("[Meta CAPI SC] System Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
