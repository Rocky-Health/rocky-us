"use client";

import { useRef } from "react";
import Script from "next/script";

const NETWORK_DOMAINS = {
  rcr73qtl: "www.rcr73qtl.com",
  vyrov30g: "www.vyrov30g.com",
};

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// Imperative fire for conversions whose containing step never renders
// (e.g. quiz-complete events that fire from a checkout handler that redirects
// before a declarative EverFlowScript could mount). Assumes window.EF is
// already on the page — true on every funnel page that previously mounted
// an EverFlowScript Click or Start event.
export function fireEverFlowConversion({ network, offerId, eventId }) {
  if (process.env.NEXT_PUBLIC_EF_ENABLED !== "true") return;
  if (typeof window === "undefined" || !window.EF) return;
  if (!NETWORK_DOMAINS[network]) return;
  if (!offerId) return;

  const stateKey = `ef-fired:${network}:event:${offerId}:${eventId || ""}`;
  try {
    if (sessionStorage.getItem(stateKey)) return;
    sessionStorage.setItem(stateKey, "1");
  } catch (_) {
    // sessionStorage may be unavailable — proceed without guard
  }

  try {
    if (eventId) {
      window.EF.conversion({ offer_id: offerId, event_id: eventId });
    } else {
      window.EF.conversion({ offer_id: offerId });
    }
  } catch (err) {
    console.warn("[EverFlow] imperative fire failed:", err);
  }
}

export default function EverFlowScript({ mode, offerId, eventId, network }) {
  const firedRef = useRef(false);

  if (process.env.NEXT_PUBLIC_EF_ENABLED !== "true") return null;

  const domain = NETWORK_DOMAINS[network];
  if (!domain) return null;
  if (!offerId) return null;
  if (mode === "event" && !eventId) return null;

  const stateKey = `ef-fired:${network}:${mode}:${offerId}:${eventId || ""}`;

  const handleReady = () => {
    if (firedRef.current) return;
    if (typeof window === "undefined" || !window.EF) return;

    try {
      if (sessionStorage.getItem(stateKey)) {
        firedRef.current = true;
        return;
      }
    } catch (_) {
      // sessionStorage may be unavailable (e.g. private mode) — proceed without guard
    }

    firedRef.current = true;
    try {
      sessionStorage.setItem(stateKey, "1");
    } catch (_) {
      // ignore
    }

    try {
      const EF = window.EF;
      if (mode === "click") {
        EF.click({
          offer_id: EF.urlParameter("oid"),
          affiliate_id: EF.urlParameter("affid"),
          source_id: EF.urlParameter("source_id"),
          sub1: EF.urlParameter("sub1"),
          sub2: EF.urlParameter("sub2"),
          sub3: EF.urlParameter("sub3"),
          sub4: EF.urlParameter("sub4"),
          sub5: EF.urlParameter("sub5"),
          uid: EF.urlParameter("uid"),
          transaction_id: EF.urlParameter("_ef_transaction_id"),
        });
        const cookieOid = EF.urlParameter("oid") || offerId;
        document.cookie = `ef_offer_id=${cookieOid}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
      } else if (mode === "conversion") {
        EF.conversion({ offer_id: offerId });
      } else if (mode === "event") {
        EF.conversion({ offer_id: offerId, event_id: eventId });
      }
    } catch (err) {
      console.warn("[EverFlow] event failed:", err);
    }
  };

  return (
    <Script
      id={`ef-${network}-${mode}-${offerId}${eventId ? `-${eventId}` : ""}`}
      src={`https://${domain}/scripts/main.js`}
      strategy="afterInteractive"
      onReady={handleReady}
    />
  );
}
