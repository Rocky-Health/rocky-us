"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// US bundle: only ED / WL / HL. Smoking, Skincare, and Mental-Health
// categories are blocked at middleware level and must not be present here.
const PIXEL_IDS = {
  ED: process.env.NEXT_PUBLIC_FB_PIXEL_ID_ED || "522677764108011",
  WL: process.env.NEXT_PUBLIC_FB_PIXEL_ID_WL || "1451450365779499",
  HL: process.env.NEXT_PUBLIC_FB_PIXEL_ID_HL || "754893718769214",
};

// Default pixel for non-categorized pages (homepage, blog, FAQ, etc.).
// WL is highest volume on US — confirmed as fallback per spec §5.1.
const FALLBACK_PIXEL_KEY = "WL";

const ROUTE_PREFIXES = {
  ED: ["pre-ed", "ed", "ed-pre", "ed-flow", "ed-consultation", "ed-prequiz", "erectile-dysfunction", "sex"],
  WL: ["pre-wl", "wl", "wl-pre", "wl-consultation", "new-bo-wl", "old-wl", "weight-loss", "body-optimization", "bo", "glp1", "glp2"],
  HL: ["hair", "hairloss", "hair-loss", "hair-main-questionnaire", "hair-pre-consultation", "hair-flow", "hair-products"],
};

const CATEGORY_SLUGS = {
  ED: ["ed", "erectile-dysfunction", "sexual-health"],
  WL: ["weight-loss", "wl", "body-optimization"],
  HL: ["hair-loss", "hair", "hairloss"],
};

const PRODUCT_KEYWORDS = {
  ED: ["cialis", "viagra", "tadalafil", "sildenafil", "variety"],
  WL: ["ozempic", "semaglutide", "tirzepatide", "mounjaro", "wegovy", "rybelsus", "weight-loss", "body-optimization"],
  HL: ["finasteride", "minoxidil", "propecia", "hair", "hair-kit"],
};

// Maps checkout/thank-you query params to pixel categories.
// Checkout URLs carry the flow as ?wl-flow=1, ?ed-flow=1, etc.
const FLOW_QUERY_MAP = {
  "ed-flow": "ED",
  "wl-flow": "WL",
  "hair-flow": "HL",
};

const hasPrefixMatch = (segments, prefixes) =>
  segments.some((segment) => prefixes.some((prefix) => segment === prefix || segment.startsWith(`${prefix}-`) || segment.startsWith(prefix)));

const hasKeywordMatch = (pathname, keywords) =>
  keywords.some((keyword) => pathname.includes(keyword));

const hasCategoryMatch = (categories, categorySlugs) =>
  categories.some((category) =>
    categorySlugs.some((slug) => category === slug || category.includes(slug))
  );

const getPixelKeyForPath = (pathname, categories = []) => {
  if (!pathname) return null;
  const cleanedPath = pathname.toLowerCase();
  const segments = cleanedPath.split("/").filter(Boolean);
  const productSlug = segments[0] === "product" ? segments.slice(1).join("/") : "";
  const normalizedCategories = categories.map((category) => category.toLowerCase());

  if (normalizedCategories.length > 0) {
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.ED)) return "ED";
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.WL)) return "WL";
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.HL)) return "HL";
  }

  if (hasPrefixMatch(segments, ROUTE_PREFIXES.ED) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.ED)) return "ED";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.WL) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.WL)) return "WL";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.HL) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.HL)) return "HL";

  return FALLBACK_PIXEL_KEY;
};

/* ------------------------------------------------------------------ */
/*  Module-level fbq stub initialization                               */
/*                                                                     */
/*  React fires child useEffects before parent useEffects. Components  */
/*  like useQuestionnaireStepTracking call window.fbq("trackSingle-    */
/*  Custom", ...) in their effects — which run before FBPixelLoader's  */
/*  mount effect. If the stub doesn't exist yet, those calls are       */
/*  silently lost (the "typeof window.fbq === 'function'" guard in     */
/*  emitMetaFunnelEvent fails).                                        */
/*                                                                     */
/*  By creating the stub at module load time, all fbq calls are        */
/*  queued immediately and processed when fbevents.js loads.            */
/*                                                                     */
/*  IMPORTANT: We deliberately do NOT init any pixels at module load.  */
/*  Pixels are init'd lazily inside the PageView effect — once per     */
/*  pixel per session — so that fbevents.js's auto-PageView only fires */
/*  for the pixel that matches the current route, not all of them.     */
/*  See `initializedPixels` below and TK-423.                          */
/* ------------------------------------------------------------------ */

// Tracks pixel IDs already init'd in this client session, so SPA
// navigation between categories doesn't re-init (and re-PageView)
// a previously-active pixel.
const initializedPixels = new Set();

if (typeof window !== "undefined") {
  if (!window.fbq) {
    const n = (window.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    });
    if (!window._fbq) window._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = "2.0";
    n.queue = [];
  }

  window.fbq.disablePushState = true;
}

export default function FBPixelLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Query-param flow detection for checkout / thank-you / order pages.
  // These pages carry the flow as ?wl-flow=1, ?ed-flow=1, etc.
  const flowFromQuery = useMemo(() => {
    if (!searchParams) return null;
    for (const [param, category] of Object.entries(FLOW_QUERY_MAP)) {
      if (searchParams.get(param) === "1") return category;
    }
    if (searchParams.get("glp2-checkout") === "1") return "WL";
    return null;
  }, [searchParams]);

  // Synchronous pixel resolution — updates in the same render as pathname.
  // Query-param flow takes priority (for checkout/thank-you pages).
  const syncPixelId = useMemo(() => {
    if (flowFromQuery) return PIXEL_IDS[flowFromQuery];
    if (!pathname) return PIXEL_IDS[FALLBACK_PIXEL_KEY];
    const pixelKey = getPixelKeyForPath(pathname) || FALLBACK_PIXEL_KEY;
    return PIXEL_IDS[pixelKey];
  }, [pathname, flowFromQuery]);

  // Async refinement for /product/* pages using server-side category data.
  // Falls back to slug-based matching (syncPixelId) if the lookup fails.
  const [asyncPixelId, setAsyncPixelId] = useState(null);

  useEffect(() => {
    if (!pathname) return;
    const cleanedPath = pathname.toLowerCase();

    if (!cleanedPath.startsWith("/product/")) {
      setAsyncPixelId(null);
      return;
    }

    let isActive = true;
    const slug = cleanedPath.split("/").filter(Boolean)[1];
    if (!slug) return;

    fetch(`/api/products/${slug}/basic`, { cache: "no-store" })
      .then((res) => {
        if (!res.ok) throw new Error("not found");
        return res.json();
      })
      .then((data) => {
        if (!isActive) return;
        const categorySlugs = (data.categories || [])
          .map((c) => c.slug)
          .filter(Boolean);
        const pixelKey = getPixelKeyForPath(pathname, categorySlugs) || FALLBACK_PIXEL_KEY;
        setAsyncPixelId(PIXEL_IDS[pixelKey]);
      })
      .catch(() => {
        if (isActive) setAsyncPixelId(null);
      });

    return () => {
      isActive = false;
    };
  }, [pathname]);

  const resolvedPixelId = asyncPixelId || syncPixelId;

  // Load fbevents.js exactly once per session.
  // Uses a window flag (set before insertion) rather than a DOM query so
  // there is no race window where two callers both see no existing script.
  // If GTM or another tag already injected fbevents.js, the DOM query below
  // catches that and marks the flag, preventing a second insertion.
  // NOTE: if fbevents.js is still loading twice, audit GTM container
  // GTM-K9PC394B for a Meta pixel tag — remove it and rely solely on this
  // component for all pixel SDK loading.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (window.__fbSdkInjected) return;

    // If another party (e.g. GTM) already inserted the script, claim the
    // flag and exit without inserting a duplicate.
    const existing = document.querySelector(
      'script[src*="connect.facebook.net"][src*="fbevents.js"]'
    );
    if (existing) {
      window.__fbSdkInjected = true;
      return;
    }

    window.__fbSdkInjected = true;
    const t = document.createElement("script");
    t.async = true;
    t.src = "https://connect.facebook.net/en_US/fbevents.js";
    t.onerror = (e) => console.warn("[FBPixelLoader] fbevents.js FAILED to load", e);
    const s = document.getElementsByTagName("script")[0];
    if (s && s.parentNode) {
      s.parentNode.insertBefore(t, s);
    } else {
      document.head.appendChild(t);
    }
  }, []);

  // Lazy-init the resolved pixel (once per session) and fire a targeted
  // PageView. Init must happen here — not at module load — so fbevents.js's
  // auto-PageView only fires for the pixel that actually matches the route.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!resolvedPixelId || typeof window === "undefined") return;
    if (typeof window.fbq !== "function") return;

    if (!initializedPixels.has(resolvedPixelId)) {
      window.fbq("init", resolvedPixelId);
      initializedPixels.add(resolvedPixelId);
    }

    window.fbq("trackSingle", resolvedPixelId, "PageView");
  }, [resolvedPixelId, pathname]);

  if (!resolvedPixelId) return null;

  return (
    <noscript>
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        src={`https://www.facebook.com/tr?id=${resolvedPixelId}&ev=PageView&noscript=1`}
        alt=""
      />
    </noscript>
  );
}
