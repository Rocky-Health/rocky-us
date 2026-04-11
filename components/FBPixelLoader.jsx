"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const PIXEL_IDS = {
  ED: process.env.NEXT_PUBLIC_FB_PIXEL_ID_ED || "522677764108011",
  WL: process.env.NEXT_PUBLIC_FB_PIXEL_ID_WL || "1451450365779499",
  SMOKING: process.env.NEXT_PUBLIC_FB_PIXEL_ID_SMOKING || "1311848663202831",
  HL: process.env.NEXT_PUBLIC_FB_PIXEL_ID_HL || "754893718769214",
  SKINCARE: process.env.NEXT_PUBLIC_FB_PIXEL_ID_SKINCARE || "1843271713209245",
  OTHERS: process.env.NEXT_PUBLIC_FB_PIXEL_ID_OTHERS || "799609076328562",
};

const ROUTE_PREFIXES = {
  ED: ["pre-ed", "ed", "ed-pre", "ed-flow", "ed-consultation", "ed-prequiz", "erectile-dysfunction", "sex"],
  WL: ["pre-wl", "wl", "wl-pre", "wl-consultation", "new-bo-wl", "old-wl", "weight-loss", "body-optimization", "bo", "glp1", "glp2"],
  HL: ["hair", "hairloss", "hair-loss", "hair-main-questionnaire", "hair-pre-consultation", "hair-flow", "hair-products"],
  SMOKING: ["smoking", "smoking-consultation", "zonnic"],
  SKINCARE: ["skincare", "skin-care", "acne", "anti-aging", "anti-ageing", "hyperpigmentation", "hyper-pigmentation"],
  OTHERS: ["mental-health", "mh-quiz", "mh-pre-quiz"],
};

const CATEGORY_SLUGS = {
  ED: ["ed", "erectile-dysfunction", "sexual-health"],
  WL: ["weight-loss", "wl", "body-optimization"],
  HL: ["hair-loss", "hair", "hairloss"],
  SMOKING: ["smoking-cessation", "smoking", "zonnic"],
  SKINCARE: ["skincare", "skin-care", "acne", "anti-ageing", "anti-aging", "hyperpigmentation"],
};

const PRODUCT_KEYWORDS = {
  ED: ["cialis", "viagra", "tadalafil", "sildenafil", "variety"],
  WL: ["ozempic", "semaglutide", "tirzepatide", "mounjaro", "wegovy", "rybelsus", "weight-loss", "body-optimization"],
  HL: ["finasteride", "minoxidil", "propecia", "hair", "hair-kit"],
  SMOKING: ["zonnic", "smoking", "nicotine"],
  SKINCARE: ["acne", "anti-aging", "anti-ageing", "hyperpigmentation", "hyper-pigmentation", "skincare", "skin-care"],
};

// Maps checkout/thank-you query params to pixel categories.
// Checkout URLs carry the flow as ?wl-flow=1, ?ed-flow=1, etc.
const FLOW_QUERY_MAP = {
  "ed-flow": "ED",
  "wl-flow": "WL",
  "hair-flow": "HL",
  "smoking-flow": "SMOKING",
  "skincare-flow": "SKINCARE",
  "mh-flow": "OTHERS",
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
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.SMOKING)) return "SMOKING";
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.SKINCARE)) return "SKINCARE";
  }

  if (hasPrefixMatch(segments, ROUTE_PREFIXES.ED) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.ED)) return "ED";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.WL) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.WL)) return "WL";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.HL) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.HL)) return "HL";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.SMOKING) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.SMOKING)) return "SMOKING";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.SKINCARE) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.SKINCARE)) return "SKINCARE";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.OTHERS)) return "OTHERS";

  return "OTHERS";
};

const ALL_PIXEL_IDS = [...new Set(Object.values(PIXEL_IDS))];

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
/* ------------------------------------------------------------------ */
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

  ALL_PIXEL_IDS.forEach((id) => {
    window.fbq("init", id);
  });
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
    if (!pathname) return PIXEL_IDS.OTHERS;
    const pixelKey = getPixelKeyForPath(pathname) || "OTHERS";
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
        const pixelKey = getPixelKeyForPath(pathname, categorySlugs) || "OTHERS";
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

  // Load fbevents.js once on mount.
  // The fbq stub and pixel inits are already set up at module level,
  // so this effect only needs to inject the SDK script.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fbScript = document.querySelector(
      'script[src*="connect.facebook.net"][src*="fbevents.js"]'
    );
    if (!fbScript) {
      const t = document.createElement("script");
      t.async = !0;
      t.src = "https://connect.facebook.net/en_US/fbevents.js";
      t.onerror = (e) => console.warn("[FBPixelLoader] fbevents.js FAILED to load", e);
      const s = document.getElementsByTagName("script")[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        document.head.appendChild(t);
      }
    }
  }, []);

  // Fire a targeted PageView on every navigation.
  // All pixels are pre-initialized at module level, so we only need trackSingle here.
  useEffect(() => {
    if (!resolvedPixelId || typeof window === "undefined") return;
    if (typeof window.fbq !== "function") return;

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
