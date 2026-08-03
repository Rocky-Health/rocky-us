// Routes hashed/hidden in the navbar and redirected to /blocked by middleware.
// Shared by middleware.js (enforcement) and app/sitemap.js (exclusion) so the two
// never drift apart and blocked URLs never leak into the sitemap.
export const BLOCKED_ROUTES = [
  // Mental Health routes
  "/mental-health",
  "/mh-pre-quiz",
  "/mh-quiz",

  // Smoking Cessation routes
  "/zonnic",
  "/product/zonnic",
  "/smoking-consultation",
  "/chewalis",

  // Recovery routes
  "/product/dhm-blend",

  // Merch
  "/merch",

  // Skincare routes
  "/acne-cream",
  "/anti-aging-cream",
  "/hyper-pigmentation-cream",
  "/skincare",

  // Old WL consultation (no longer active)
  "/old-wl-consultation",

  // Mental Health products
  "/product/bupropion",
  "/product/citalopram",
  "/product/escitalopram",
  "/product/fluoxetine",
  "/product/paroxetine",
  "/product/sertraline",
  "/product/trazodone",
  "/product/venlafaxine",
  "/product/essential-mood-balance",
  "/product/essential-night-boost",
];

export function isBlockedRoute(pathname) {
  return BLOCKED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// Compounded weight-loss products. Middleware redirects these to the homepage
// (not /blocked), so they stay separate from BLOCKED_ROUTES, but are shared here
// so sitemap.js can exclude them and the two never drift apart.
export const RESTRICTED_PRODUCT_ROUTES = [
  "/product/compounded-tirzepatide",
  "/product/compounded-terzepatide", // typo variant
  "/product/compounded-semaglutide",
];

export function isRestrictedProductRoute(pathname) {
  return RESTRICTED_PRODUCT_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}
