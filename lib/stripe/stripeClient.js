"use client";

import { useCallback, useRef, useState } from "react";
// TK-506: MUST be the /pure entry. The default "@stripe/stripe-js" import
// injects Stripe.js at module-evaluation time as a side effect (fraud
// signals), which defeats any deferral: the checkout chunk importing this
// file was enough to pull clover/stripe.js at page load. /pure only loads
// when loadStripe() is actually called.
import { loadStripe } from "@stripe/stripe-js/pure";
import { logger } from "@/utils/devLogger";

let stripePromise;

/**
 * Get or initialize Stripe client with publishable key
 * @returns {Promise} Stripe instance
 */
export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      logger.error("Stripe publishable key is not configured");
      return null;
    }

    stripePromise = loadStripe(publishableKey);
  }

  return stripePromise;
};

/**
 * TK-506: defer Stripe.js (which pulls in Google Pay and hCaptcha) until the
 * visitor actually REACHES the payment section, not merely interacts with the
 * page. Returns { stripePromise, paymentRegionRef }.
 *
 * Attach paymentRegionRef to the payment container. Arming rules:
 * - Region NOT in the initial viewport (mobile, most desktops): an
 *   IntersectionObserver arms when the region scrolls into view.
 * - Region already visible at load (tall desktop viewports): only direct
 *   engagement with the region arms it (pointerenter, pointerdown, focusin,
 *   touchstart), so a cold load stays at zero payment-SDK requests and typing
 *   in the address form never triggers it.
 * No idle-timer fallback on purpose: no reach, no SDK.
 */
export function useDeferredStripe() {
  const [deferredPromise, setDeferredPromise] = useState(null);
  const armedRef = useRef(false);
  const cleanupRef = useRef(null);

  const arm = useCallback(() => {
    if (armedRef.current) return;
    armedRef.current = true;
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setDeferredPromise(getStripe());
  }, []);

  // Callback ref so listeners attach the moment the payment region mounts,
  // however deep in the tree it lives.
  const paymentRegionRef = useCallback(
    (node) => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      if (!node || armedRef.current) return;

      const events = ["pointerenter", "pointerdown", "focusin", "touchstart"];
      events.forEach((e) => node.addEventListener(e, arm, { passive: true }));

      const rect = node.getBoundingClientRect();
      const initiallyVisible =
        rect.top < window.innerHeight && rect.bottom > 0;

      let observer = null;
      if (!initiallyVisible && typeof IntersectionObserver !== "undefined") {
        observer = new IntersectionObserver(
          (entries) => {
            if (entries.some((entry) => entry.isIntersecting)) arm();
          },
          { threshold: 0.1 },
        );
        observer.observe(node);
      }

      cleanupRef.current = () => {
        events.forEach((e) => node.removeEventListener(e, arm));
        if (observer) observer.disconnect();
      };
    },
    [arm],
  );

  return { stripePromise: deferredPromise, paymentRegionRef };
}
