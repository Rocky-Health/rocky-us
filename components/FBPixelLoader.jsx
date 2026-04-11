"use client";

import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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

export default function FBPixelLoader() {
  const pathname = usePathname();
  const currentPixelRef = useRef(null);

  // Synchronous pixel resolution — updates in the same render as pathname,
  // so the PageView effect always sees the correct pixel for the current page.
  const syncPixelId = useMemo(() => {
    if (!pathname) return PIXEL_IDS.OTHERS;
    const pixelKey = getPixelKeyForPath(pathname) || "OTHERS";
    return PIXEL_IDS[pixelKey];
  }, [pathname]);

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

  // Load fbevents.js base code once on mount.
  // GTM or other tools may have already created the fbq stub but loaded
  // fbevents.js from a broken proxy (e.g. sGTM). We always ensure the
  // stub exists AND that fbevents.js is loaded from connect.facebook.net.
  useEffect(() => {
    if (typeof window === "undefined") return;

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

    // With multiple pixels across categories, the built-in pushState listener
    // fires track('PageView') for ALL initialized pixels — causing
    // cross-category contamination. We disable it and fire targeted
    // trackSingle('PageView') manually on each navigation instead.
    // See: https://developers.facebook.com/docs/meta-pixel/guides/track-multiple-events/
    window.fbq.disablePushState = true;

    // Ensure fbevents.js is loaded directly from Meta, even if another tool
    // (e.g. GTM with a broken sGTM proxy) already created the stub.
    const fbScript = document.querySelector(
      'script[src*="connect.facebook.net"][src*="fbevents.js"]'
    );
    if (!fbScript) {
      const t = document.createElement("script");
      t.async = !0;
      t.src = "https://connect.facebook.net/en_US/fbevents.js";
      const s = document.getElementsByTagName("script")[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        document.head.appendChild(t);
      }
    }
  }, []);

  // Init pixel (only when it changes) and fire targeted PageView on every navigation.
  // Both resolvedPixelId and pathname are deps so that same-category navigations
  // (e.g. /ed → /ed-consultation where pixel stays the same) still fire a PageView.
  useEffect(() => {
    if (!resolvedPixelId || typeof window === "undefined") return;
    if (typeof window.fbq !== "function") return;

    if (currentPixelRef.current !== resolvedPixelId) {
      currentPixelRef.current = resolvedPixelId;
      window.fbq("init", resolvedPixelId);
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
