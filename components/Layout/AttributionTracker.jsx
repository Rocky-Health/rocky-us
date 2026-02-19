"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initializeAttribution, captureAttribution, getAttributionData } from "@/utils/sourceAttribution";
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
 * Safe to call on every route change — GTM picks up the latest values.
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

/**
 * AttributionTracker Component
 * Initializes and captures traffic source attribution data
 * Tracks UTM parameters, click IDs, AWIN affiliate tracking, and referrers
 * Surfaces attribution data to GTM via dataLayer on every route change
 */
export default function AttributionTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  // Initialize attribution tracking on mount
  useEffect(() => {
    try {
      initializeAttribution();
      logger.log("[Attribution] Tracker initialized");
      // Push attribution to dataLayer on first mount
      pushAttributionToDataLayer();
      initialized.current = true;
    } catch (error) {
      logger.error("[Attribution] Failed to initialize:", error);
    }
  }, []);

  // Capture attribution on route changes (for SPA navigation)
  useEffect(() => {
    try {
      captureAttribution();
      // Re-push attribution on every route change so GTM always has fresh data
      if (initialized.current) {
        pushAttributionToDataLayer();
      }
    } catch (error) {
      logger.error("[Attribution] Failed to capture on navigation:", error);
    }
  }, [pathname, searchParams]);

  // This component doesn't render anything
  return null;
}

