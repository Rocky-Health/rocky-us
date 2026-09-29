"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { getIdentityKey, buildAdvancedMatching } from "@/utils/metaAdvancedMatching";
import { logger } from "@/utils/devLogger";

// US bundle: ED / WL / HL + LONGEVITY (the NAD+ funnel rides the LONGEVITY
// pixel). Smoking, Skincare, and Mental-Health categories are blocked at
// middleware level and must not be present here.
const PIXEL_IDS = {
  ED: process.env.NEXT_PUBLIC_FB_PIXEL_ID_ED || "522677764108011",
  WL: process.env.NEXT_PUBLIC_FB_PIXEL_ID_WL || "1451450365779499",
  HL: process.env.NEXT_PUBLIC_FB_PIXEL_ID_HL || "754893718769214",
  LONGEVITY: process.env.NEXT_PUBLIC_FB_PIXEL_ID_LONGEVITY || "1315116483444151",
};

// Secondary pixels fired in addition to the primary above (browser-side
// dual-fire). Currently used to mirror US WL PageViews onto the new
// US-only dataset 1873491106559002 alongside the legacy shared pixel,
// so the new dataset accumulates a clean per-pixel session record while
// in-flight ad campaigns optimizing on the legacy pixel keep working.
const SECONDARY_PIXEL_IDS = {
  WL: [process.env.NEXT_PUBLIC_FB_PIXEL_ID_WL_US || "1873491106559002"],
};

// Default pixel for non-categorized pages (homepage, blog, FAQ, etc.).
// WL is highest volume on US — confirmed as fallback per spec §5.1.
const FALLBACK_PIXEL_KEY = "WL";

const ROUTE_PREFIXES = {
  ED: ["pre-ed", "ed", "ed-pre", "ed-flow", "ed-consultation", "ed-prequiz", "erectile-dysfunction", "sex"],
  WL: ["pre-wl", "wl", "wl-pre", "wl-consultation", "new-bo-wl", "old-wl", "weight-loss", "body-optimization", "bo", "glp1", "glp2"],
  HL: ["hair", "hairloss", "hair-loss", "hair-main-questionnaire", "hair-pre-consultation", "hair-flow", "hair-products"],
  // NAD+ is merged into LONGEVITY — its LPs/quiz route to the LONGEVITY pixel.
  LONGEVITY: ["nad", "nad-plus", "longevity", "longevity-nad", "bio-age"],
};

const CATEGORY_SLUGS = {
  ED: ["ed", "erectile-dysfunction", "sexual-health"],
  WL: ["weight-loss", "wl", "body-optimization"],
  HL: ["hair-loss", "hair", "hairloss"],
  LONGEVITY: ["longevity", "nad"],
};

const PRODUCT_KEYWORDS = {
  ED: ["cialis", "viagra", "tadalafil", "sildenafil", "variety"],
  WL: ["ozempic", "semaglutide", "tirzepatide", "mounjaro", "wegovy", "rybelsus", "weight-loss", "body-optimization"],
  HL: ["finasteride", "minoxidil", "propecia", "hair", "hair-kit"],
  LONGEVITY: ["nad", "longevity", "bio-age"],
};

// Maps checkout/thank-you query params to pixel categories.
// Checkout URLs carry the flow as ?wl-flow=1, ?ed-flow=1, etc.
const FLOW_QUERY_MAP = {
  "ed-flow": "ED",
  "wl-flow": "WL",
  "hair-flow": "HL",
  // NAD+ checkout arrives as ?longevity-flow=1 → LONGEVITY pixel (merged).
  "longevity-flow": "LONGEVITY",
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
    // NAD+ before WL/ED/HL: NAD products carry the `nad` (+ `longevity`) slug.
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.LONGEVITY)) return "LONGEVITY";
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.ED)) return "ED";
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.WL)) return "WL";
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.HL)) return "HL";
  }

  if (hasPrefixMatch(segments, ROUTE_PREFIXES.LONGEVITY) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.LONGEVITY)) return "LONGEVITY";
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

// Tracks pixel IDs that have already had advanced matching applied via a
// re-init call.  Once AM is applied to a pixel we never re-init it again,
// so we don't accidentally fire extra PageViews.
const amAppliedPixels = new Set();

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

  // Synchronous category resolution — updates in the same render as pathname.
  // Query-param flow takes priority (for checkout/thank-you pages).
  const syncPixelKey = useMemo(() => {
    if (flowFromQuery) return flowFromQuery;
    if (!pathname) return FALLBACK_PIXEL_KEY;
    return getPixelKeyForPath(pathname) || FALLBACK_PIXEL_KEY;
  }, [pathname, flowFromQuery]);

  const syncPixelId = useMemo(() => PIXEL_IDS[syncPixelKey], [syncPixelKey]);

  // Advanced matching state.  Populated once identity cookies are present
  // (i.e. after login) and re-evaluated on every navigation so it picks up
  // cookies set during the same page session.  null = no identity yet (pre-login).
  const [advancedMatching, setAdvancedMatching] = useState(null);
  // Tracks the identity key that was last used to compute advancedMatching so
  // we skip redundant async hashing on navigations that don't change identity.
  const lastIdentityKeyRef = useRef('');
  // Mirror of advancedMatching for the PageView/init effect to read without
  // taking advancedMatching as a dependency (which would re-fire PageView).
  const amRef = useRef(null);

  useEffect(() => {
    const key = getIdentityKey();
    if (!key || key === lastIdentityKeyRef.current) return;
    lastIdentityKeyRef.current = key;
    buildAdvancedMatching()
      .then((am) => {
        amRef.current = am || null;
        setAdvancedMatching(am || null);
      })
      .catch(() => {/* AM errors must never surface */});
  }, [pathname]);

  // Async refinement for /product/* pages using server-side category data.
  // Falls back to slug-based matching (syncPixelId) if the lookup fails.
  const [asyncPixelKey, setAsyncPixelKey] = useState(null);
  const [asyncPixelId, setAsyncPixelId] = useState(null);

  useEffect(() => {
    if (!pathname) return;
    const cleanedPath = pathname.toLowerCase();

    if (!cleanedPath.startsWith("/product/")) {
      setAsyncPixelKey(null);
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
        setAsyncPixelKey(pixelKey);
        setAsyncPixelId(PIXEL_IDS[pixelKey]);
      })
      .catch(() => {
        if (isActive) {
          setAsyncPixelKey(null);
          setAsyncPixelId(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [pathname]);

  const resolvedPixelKey = asyncPixelKey || syncPixelKey;
  const resolvedPixelId = asyncPixelId || syncPixelId;

  // Load fbevents.js exactly once per session.
  // Uses a window flag (set before insertion) rather than a DOM query so
  // there is no race window where two callers both see no existing script.
  // If GTM or another tag already injected fbevents.js, the DOM query below
  // catches that and marks the flag, preventing a second insertion.
  // NOTE: if fbevents.js is still loading twice, audit GTM container
  // GTM-K9PC394B for a Meta pixel tag — remove it and rely solely on this
  // component for all pixel SDK loading.
  //
  // Mobile main-thread deferral: the fbevents.js download/parse is one of the
  // heaviest non-critical third-party costs during initial load, yet it is
  // never needed for first paint. We therefore defer the *injection* until the
  // first user interaction (or a requestIdleCallback fallback), mirroring the
  // GTM/TikTok load-on-interaction pattern in app/layout.jsx. This changes only
  // WHEN the SDK loads, never WHAT fires: the module-level window.fbq stub
  // (above) already queues every init/PageView/track call, and that queue is
  // drained in order the moment fbevents.js arrives — so PageView, conversion
  // events, and event de-duplication are all preserved. Bouncers who leave
  // before interacting and before the idle timeout simply never pay the cost.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined") return;
    if (window.__fbSdkInjected) return;

    const injectFbEvents = () => {
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
      t.onerror = (e) => logger.warn("[FBPixelLoader] fbevents.js FAILED to load", e);
      const s = document.getElementsByTagName("script")[0];
      if (s && s.parentNode) {
        s.parentNode.insertBefore(t, s);
      } else {
        document.head.appendChild(t);
      }
    };

    // Load on first interaction; idle fallback (15s) keeps attribution firing
    // for engaged-but-still users, matching the GTM/TikTok bootstraps.
    const events = ["pointerdown", "touchstart", "keydown", "scroll", "mousemove"];
    let idleId;
    const boot = () => {
      events.forEach((ev) => window.removeEventListener(ev, boot, true));
      if (idleId != null) {
        if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
      injectFbEvents();
    };
    events.forEach((ev) =>
      window.addEventListener(ev, boot, { passive: true, capture: true, once: true })
    );
    idleId = window.requestIdleCallback
      ? window.requestIdleCallback(boot, { timeout: 15000 })
      : window.setTimeout(boot, 15000);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, boot, true));
      if (idleId != null) {
        if (window.cancelIdleCallback) window.cancelIdleCallback(idleId);
        else window.clearTimeout(idleId);
      }
    };
  }, []);

  // Lazy-init the resolved pixel (once per session) and fire a targeted
  // PageView. Init must happen here — not at module load — so fbevents.js's
  // auto-PageView only fires for the pixel that actually matches the route.
  //
  // For categories registered in SECONDARY_PIXEL_IDS we ALSO init the
  // mirror pixel(s) and fire PageView to each, so the secondary dataset
  // accumulates the same per-pixel session record as the primary.
  //
  // This effect deliberately does NOT depend on advancedMatching — PageView
  // must fire only on navigation, never just because identity arrived
  // mid-session (that would double-count PageView). On a pixel's first init we
  // attach AM if it's already known (read via amRef to avoid the dependency);
  // otherwise the enrichment effect below applies it without a PageView.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!resolvedPixelId || typeof window === "undefined") return;
    if (typeof window.fbq !== "function") return;

    const secondaryIds = SECONDARY_PIXEL_IDS[resolvedPixelKey] || [];
    const pixelsToFire = [resolvedPixelId, ...secondaryIds];

    for (const pid of pixelsToFire) {
      if (!pid) continue;
      if (!initializedPixels.has(pid)) {
        // First time seeing this pixel — init with AM if it's already known.
        if (amRef.current) {
          window.fbq("init", pid, amRef.current);
          amAppliedPixels.add(pid);
        } else {
          window.fbq("init", pid);
        }
        initializedPixels.add(pid);
      }
      window.fbq("trackSingle", pid, "PageView");
    }
  }, [resolvedPixelKey, resolvedPixelId, pathname]);

  // Advanced-matching enrichment. Runs when advancedMatching becomes available
  // (post-login). For each active pixel already initialized WITHOUT AM, issue a
  // second fbq('init', pid, am) — Meta's supported way to update AM mid-session
  // — and crucially fire NO PageView. Each pixel is AM-updated at most once,
  // tracked via the module-level amAppliedPixels Set.
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!advancedMatching || !resolvedPixelId) return;
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;

    const secondaryIds = SECONDARY_PIXEL_IDS[resolvedPixelKey] || [];
    const pixelsToFire = [resolvedPixelId, ...secondaryIds];

    for (const pid of pixelsToFire) {
      if (!pid) continue;
      if (initializedPixels.has(pid) && !amAppliedPixels.has(pid)) {
        window.fbq("init", pid, advancedMatching);
        amAppliedPixels.add(pid);
      }
    }
  }, [advancedMatching, resolvedPixelKey, resolvedPixelId]);

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
