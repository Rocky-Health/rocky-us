"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initializeAttribution, captureAttribution, getAttributionData } from "@/utils/sourceAttribution";
import { safePush, getOrCreateSessionId } from "@/utils/dataLayerHelper";
import { logger } from "@/utils/devLogger";

/**
 * Push attribution data to dataLayer for GTM visibility.
 * Fires a structured "source_data_captured" event and flattened rk_-prefixed variables.
 * Safe to call on every route change — GTM picks up the latest values.
 */
const pushAttributionToDataLayer = () => {
  if (typeof window === "undefined") return;

  try {
    const data = getAttributionData();
    const sessionId = getOrCreateSessionId();

    // Derive referrer_domain from stored referrer
    let referrerDomain = "";
    if (data.referrer) {
      try {
        referrerDomain = new URL(data.referrer).hostname;
      } catch (_) {}
    }

    // Derive landing_page as path+query (strip origin from full URL)
    let landingPagePath = data.landingPage || "";
    if (landingPagePath) {
      try {
        const lpUrl = new URL(landingPagePath);
        landingPagePath = lpUrl.pathname + lpUrl.search;
      } catch (_) {
        // keep as-is
      }
    }

    // Read individual click IDs from current URL for freshness
    // (these may also be in storage; prefer URL if present)
    const urlParams = new URLSearchParams(window.location.search);

    // Structured event push
    safePush({
      event: "source_data_captured",
      source_attribution: {
        session_id: sessionId,
        landing_page: landingPagePath,
        referrer: data.referrer || "",
        referrer_domain: referrerDomain,
        utm_source: data.source || "",
        utm_medium: data.medium || "",
        utm_campaign: data.campaign || "",
        utm_term: data.term || "",
        utm_content: data.content || "",
        utm_id: data.utmId || "",
        gclid: urlParams.get("gclid") || (data.clickIdType === "Google Ads" ? data.clickId : "") || "",
        fbclid: urlParams.get("fbclid") || (data.clickIdType === "Facebook" ? data.clickId : "") || "",
        ttclid: urlParams.get("ttclid") || (data.clickIdType === "TikTok" ? data.clickId : "") || "",
        msclkid: urlParams.get("msclkid") || (data.clickIdType === "Microsoft Ads" ? data.clickId : "") || "",
        awc: data.awinAwc || "",
        gbraid: data.gbraid || urlParams.get("gbraid") || "",
        wbraid: data.wbraid || urlParams.get("wbraid") || "",
      },
    });

    // Flattened variables push (rk_ prefix to avoid collisions)
    safePush({
      rk_session_id: sessionId,
      rk_landing_page: landingPagePath,
      rk_referrer: data.referrer || "",
      rk_referrer_domain: referrerDomain,
      rk_utm_source: data.source || "",
      rk_utm_medium: data.medium || "",
      rk_utm_campaign: data.campaign || "",
      rk_utm_term: data.term || "",
      rk_utm_content: data.content || "",
      rk_utm_id: data.utmId || "",
      rk_gclid: urlParams.get("gclid") || (data.clickIdType === "Google Ads" ? data.clickId : "") || "",
      rk_fbclid: urlParams.get("fbclid") || (data.clickIdType === "Facebook" ? data.clickId : "") || "",
      rk_ttclid: urlParams.get("ttclid") || (data.clickIdType === "TikTok" ? data.clickId : "") || "",
      rk_msclkid: urlParams.get("msclkid") || (data.clickIdType === "Microsoft Ads" ? data.clickId : "") || "",
      rk_awc: data.awinAwc || "",
      rk_gbraid: data.gbraid || urlParams.get("gbraid") || "",
      rk_wbraid: data.wbraid || urlParams.get("wbraid") || "",
    });

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

