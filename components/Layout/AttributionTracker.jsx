"use client";

import { useEffect } from "react";
import { initializeAttribution, getAttributionData } from "@/utils/sourceAttribution";
import { safePush, getOrCreateSessionId } from "@/utils/dataLayerHelper";
import { logger } from "@/utils/devLogger";

/**
 * Derive a human-readable source name for the dataLayer.
 * Priority: clickIDs > AWIN > UTM source > referrer domain > "Direct"
 */
const deriveDataLayerSourceName = (fields) => {
  if (fields.gclid || fields.gbraid || fields.wbraid) return "Google Ads";
  if (fields.fbclid) return "Facebook";
  if (fields.ttclid) return "TikTok";
  if (fields.msclkid) return "Microsoft Ads";
  if (fields.li_fat_id) return "LinkedIn";
  if (fields.twclid) return "Twitter";
  if (fields.awin_awc) return "AWIN";
  if (fields.utm_source) {
    const s = fields.utm_source.toLowerCase();
    if (s.includes("google")) return "Google Ads";
    if (s.includes("facebook") || s.includes("fb") || s.includes("instagram") || s.includes("ig")) return "Facebook";
    if (s.includes("tiktok")) return "TikTok";
    if (s.includes("bing") || s.includes("microsoft")) return "Microsoft Ads";
    return fields.utm_source;
  }
  if (fields.referrer_domain) return fields.referrer_domain;
  return "Direct";
};

/**
 * Push attribution data to dataLayer for GTM visibility.
 * Fires a structured "source_data_captured" event and flattened persistent variables.
 */
const pushAttributionToDataLayer = () => {
  if (typeof window === "undefined") return;

  try {
    const data = getAttributionData();
    const sessionId = getOrCreateSessionId();
    const capturedAt = new Date().toISOString();

    let referrerDomain = "";
    if (data.referrer) {
      try {
        referrerDomain = new URL(data.referrer).hostname;
      } catch (_) {}
    }

    let landingPagePath = data.landingPage || "";
    if (landingPagePath) {
      try {
        const lpUrl = new URL(landingPagePath);
        landingPagePath = lpUrl.pathname + lpUrl.search;
      } catch (_) {}
    }

    const urlParams = new URLSearchParams(window.location.search);

    const gclid = urlParams.get("gclid") || (data.clickIdType === "Google Ads" ? data.clickId : "") || "";
    const fbclid = urlParams.get("fbclid") || (data.clickIdType === "Facebook" ? data.clickId : "") || "";
    const ttclid = urlParams.get("ttclid") || (data.clickIdType === "TikTok" ? data.clickId : "") || "";
    const msclkid = urlParams.get("msclkid") || (data.clickIdType === "Microsoft Ads" ? data.clickId : "") || "";
    const li_fat_id = urlParams.get("li_fat_id") || (data.clickIdType === "LinkedIn" ? data.clickId : "") || "";
    const twclid = urlParams.get("twclid") || (data.clickIdType === "Twitter" ? data.clickId : "") || "";
    const gbraid = data.gbraid || urlParams.get("gbraid") || "";
    const wbraid = data.wbraid || urlParams.get("wbraid") || "";
    const awin_awc = data.awinAwc || "";
    const awin_channel = awin_awc ? "aw" : "other";

    const fields = {
      awin_awc,
      awin_channel,
      utm_source: data.source || "",
      utm_medium: data.medium || "",
      utm_campaign: data.campaign || "",
      utm_term: data.term || "",
      utm_content: data.content || "",
      utm_id: data.utmId || "",
      referrer: data.referrer || "",
      referrer_domain: referrerDomain,
      landing_page: landingPagePath,
      gclid,
      fbclid,
      msclkid,
      ttclid,
      li_fat_id,
      twclid,
      gbraid,
      wbraid,
      session_id: sessionId,
      captured_at: capturedAt,
    };

    fields.source_name = deriveDataLayerSourceName(fields);

    // Push 1: structured event
    safePush({
      event: "source_data_captured",
      source_attribution: { ...fields },
    });

    // Push 2: flattened persistent GTM variables (no event key)
    safePush({ ...fields });

    logger.log("[Attribution] source_data_captured pushed to dataLayer");
  } catch (error) {
    logger.error("[Attribution] Failed to push to dataLayer:", error);
  }
};

// Window-scoped guard so the push fires exactly once per browser session,
// surviving React 18 Strict Mode double-mount and any future component remounts.
const SESSION_FLAG = "__rk_attribution_pushed";

/**
 * AttributionTracker Component
 * Captures traffic source attribution data once per session and surfaces it to
 * GTM via dataLayer. First-touch attribution is captured on session entry
 * (full-page load) — mid-session SPA navigations intentionally do not re-push,
 * to avoid inflating GA4 event counts and overwriting first-touch data.
 */
export default function AttributionTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window[SESSION_FLAG]) return;
    window[SESSION_FLAG] = true;

    try {
      initializeAttribution();
      logger.log("[Attribution] Tracker initialized");
      pushAttributionToDataLayer();
    } catch (error) {
      logger.error("[Attribution] Failed to initialize:", error);
    }
  }, []);

  return null;
}
