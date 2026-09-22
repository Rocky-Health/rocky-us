"use client";

import { useEffect } from "react";
import { logger } from "@/utils/devLogger";

const NETWORK_DOMAINS = {
  rcr73qtl: "www.rcr73qtl.com",
  vyrov30g: "www.vyrov30g.com",
};

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

// Idempotently inject the EF SDK script tag. We previously relied on
// next/script's onReady callback, but onReady does not re-fire on SPA-mounted
// <Script> elements whose src is already loaded. On Stripe-redirect storefronts
// where order-received is reached via router.push (CA side), this silently
// dropped the Conversion event. US side keeps the same pattern in sync.
function ensureSdkLoaded(network) {
  if (typeof document === "undefined") return;
  const domain = NETWORK_DOMAINS[network];
  if (!domain) return;
  const sdkUrl = `https://${domain}/scripts/main.js`;
  if (document.querySelector(`script[src="${sdkUrl}"]`)) return;
  const s = document.createElement("script");
  s.src = sdkUrl;
  s.async = true;
  document.head.appendChild(s);
}

// Run onReady once `window.EF` is available. If the SDK isn't on the page yet
// (e.g. direct-nav or refresh on the post-payment quiz), inject it ourselves.
// Returns a cancellation fn so callers in useEffect cleanups can abort.
function whenEfReady(
  { network, timeoutMs = 10000, intervalMs = 250 },
  onReady,
) {
  const noop = () => {};
  if (typeof window === "undefined") return noop;
  if (window.EF) {
    onReady();
    return noop;
  }
  ensureSdkLoaded(network);
  const start = Date.now();
  const interval = setInterval(() => {
    if (typeof window !== "undefined" && window.EF) {
      try {
        onReady();
      } finally {
        clearInterval(interval);
      }
    } else if (Date.now() - start >= timeoutMs) {
      clearInterval(interval);
    }
  }, intervalMs);
  return () => clearInterval(interval);
}

// Imperative fire for events whose containing step never renders long enough
// for a declarative EverFlowScript to mount (e.g. quiz-complete fires from a
// handler that redirects). Assumes window.EF is already available — true once
// the user has been past any route that mounted EverFlowScript.
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
    logger.warn("[EverFlow] imperative fire failed:", err);
  }
}

// Quiz-Start events fire from inside the SPA quiz hook on mount, which can
// race the EF SDK load — window.EF may not exist yet. Poll briefly and fire as
// soon as it's ready; self-loads the SDK if no upstream route mounted it.
export function fireEverFlowConversionWhenReady({
  network,
  offerId,
  eventId,
  timeoutMs = 10000,
  intervalMs = 250,
}) {
  const noop = () => {};
  if (process.env.NEXT_PUBLIC_EF_ENABLED !== "true") return noop;
  if (typeof window === "undefined") return noop;
  if (!NETWORK_DOMAINS[network]) return noop;
  if (!offerId) return noop;

  return whenEfReady({ network, timeoutMs, intervalMs }, () => {
    fireEverFlowConversion({ network, offerId, eventId });
  });
}

export default function EverFlowScript({
  mode,
  offerId,
  eventId,
  network,
  adv1,
  orderId,
  amount,
}) {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_EF_ENABLED !== "true") return;
    if (!NETWORK_DOMAINS[network]) return;
    if (!offerId) return;
    if (mode === "event" && !eventId) return;

    const stateKey = `ef-fired:${network}:${mode}:${offerId}:${eventId || ""}`;

    return whenEfReady({ network }, () => {
      try {
        if (sessionStorage.getItem(stateKey)) return;
      } catch (_) {
        // sessionStorage may be unavailable — proceed without guard
      }

      try {
        const EF = window.EF;
        if (mode === "click") {
          // Tightened from the prior implementation: gate on `oid` URL param.
          // Organic visitors (no `oid`) skip both the click fire and the
          // cookie write so they can't be misattributed downstream. Previously
          // the cookie fell back to the component's `offerId` prop, which
          // tagged organic NAD+ / WL traffic as affiliate-driven.
          const oid = EF.urlParameter("oid");
          if (!oid) return;

          try {
            sessionStorage.setItem(stateKey, "1");
          } catch (_) {
            // ignore
          }

          EF.click({
            offer_id: oid,
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
          document.cookie = `ef_offer_id=${oid}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
          return;
        }

        try {
          sessionStorage.setItem(stateKey, "1");
        } catch (_) {
          // ignore
        }

        // Carry the WC order number so the affiliate can reconcile EverFlow
        // conversions against real orders: sent in both the native `order_id`
        // field and `adv1` (sub-id fallback). `amount` is optional revenue. All
        // only attached when present, so quiz-milestone events stay identical.
        if (mode === "conversion") {
          const conversion = { offer_id: offerId };
          if (adv1) conversion.adv1 = adv1;
          if (orderId) conversion.order_id = orderId;
          if (amount) conversion.amount = amount;
          logger.info("[EverFlow] sale conversion", conversion);
          EF.conversion(conversion);
        } else if (mode === "event") {
          EF.conversion({ offer_id: offerId, event_id: eventId });
        }
      } catch (err) {
        logger.warn("[EverFlow] event failed:", err);
      }
    });
  }, [mode, offerId, eventId, network, adv1, orderId, amount]);

  return null;
}
