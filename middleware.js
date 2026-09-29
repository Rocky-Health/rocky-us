import { NextResponse } from "next/server";
import { logger } from "@/utils/devLogger";
import { layoutExemptRoutes } from "./utils/layoutConfig";
import {
  isBlockedRoute,
  isRestrictedProductRoute,
} from "@/lib/constants/blockedRoutes";
import { resolveCountry } from "./utils/geo";

export function middleware(req) {
  try {
    const { pathname } = req.nextUrl;

    // Skip middleware for static files
    if (pathname.startsWith("/_next/") || pathname.includes(".")) {
      return NextResponse.next();
    }

    // API route tracing: log session + request IDs, then pass through
    if (pathname.startsWith("/api/")) {
      const sessionId =
        req.headers.get("x-session-id") ??
        req.cookies.get("rk_session_id")?.value ??
        "unknown";
      const requestId =
        req.headers.get("x-request-id") ?? crypto.randomUUID();

      console.log(
        `[API] ${req.method} ${pathname} | session=${sessionId} | request=${requestId}`
      );

      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-session-id", sessionId);
      requestHeaders.set("x-request-id", requestId);

      const response = NextResponse.next({
        request: { headers: requestHeaders },
      });

      if (!response.headers.has("x-request-id")) {
        response.headers.set("x-request-id", requestId);
      }

      return response;
    }

    // Resolve visitor country (cf-ipcountry primary, x-vercel-ip-country
    // fallback - see utils/geo.js). The ?geo query param remains a last-resort
    // override for local testing.
    const geoCountry =
      resolveCountry(req) || req.nextUrl.searchParams.get("geo") || "";

    // Handle redirects for old blog structure to new blog structure
    if (pathname.startsWith("/old-blog/")) {
      // Extract the slug from the old blog URL
      const slug = pathname.replace("/old-blog/", "");

      // If it's just "/old-blog" (without slug), redirect to "/blog"
      if (slug === "") {
        return NextResponse.redirect(new URL("/blog", req.url));
      }

      // If it has a slug, redirect to the new blog structure
      return NextResponse.redirect(new URL(`/blog/${slug}`, req.url));
    }

    // Redirect compounded weight loss product pages to homepage
    if (isRestrictedProductRoute(pathname)) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Check if the path is blocked (hashed in navbar)
    if (isBlockedRoute(pathname)) {
      const blockedUrl = new URL("/blocked", req.url);
      blockedUrl.searchParams.set("path", pathname);
      return NextResponse.redirect(blockedUrl);
    }

    const authToken = req.cookies.get("authToken")?.value;
    const isLoginPage = pathname === "/login-register";
    const isPatientPortalLogout =
      req.nextUrl.searchParams.get("pp-logout") === "1";

    // Add the current pathname to the request headers for use in the layout
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", pathname);

    // Check if there are cart parameters in the URL
    const hasCartParams = req.nextUrl.searchParams.has(
      "onboarding-add-to-cart"
    );
    const isEdFlow = req.nextUrl.searchParams.get("ed-flow") === "1";
    const isWlFlow = req.nextUrl.searchParams.get("wl-flow") === "1";
    const isHairFlow = req.nextUrl.searchParams.get("hair-flow") === "1";
    const isMhFlow = req.nextUrl.searchParams.get("mh-flow") === "1";
    const isSkincareFlow =
      req.nextUrl.searchParams.get("skincare-flow") === "1";
    const isOnboarding = req.nextUrl.searchParams.get("onboarding") === "1";

    // Case 1: If this is the login page and user is already authenticated AND has cart parameters,
    // redirect directly to checkout instead of home page
    if (isLoginPage && authToken && hasCartParams) {
      // Preserve the onboarding-add-to-cart parameters and flow indicators in the redirect
      const checkoutUrl = new URL("/checkout", req.url);

      // Transfer all relevant parameters to the checkout URL
      if (hasCartParams) {
        const cartItems = req.nextUrl.searchParams.get(
          "onboarding-add-to-cart"
        );
        checkoutUrl.searchParams.set("onboarding-add-to-cart", cartItems);
      }

      if (isEdFlow) {
        checkoutUrl.searchParams.set("ed-flow", "1");
      }

      if (isWlFlow) {
        checkoutUrl.searchParams.set("wl-flow", "1");
      }

      if (isHairFlow) {
        checkoutUrl.searchParams.set("hair-flow", "1");
      }

      if (isMhFlow) {
        checkoutUrl.searchParams.set("mh-flow", "1");
      }

      if (isSkincareFlow) {
        checkoutUrl.searchParams.set("skincare-flow", "1");
      }

      if (isOnboarding) {
        checkoutUrl.searchParams.set("onboarding", "1");
      }
      return NextResponse.redirect(checkoutUrl);
    }

    // Special Case: If this is the login page with patient portal logout parameter,
    // allow access regardless of authentication status to process the logout
    if (isLoginPage && isPatientPortalLogout) {
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // Case 2: If this is the login page, user is authenticated, and there are NO cart parameters,
    // proceed with the normal redirect to home or to redirect_to if present
    if (isLoginPage && authToken && !hasCartParams) {
      const redirectTo = req.nextUrl.searchParams.get("redirect_to");
      if (redirectTo) {
        try {
          const decoded = decodeURIComponent(redirectTo);
          const isPathOnly = decoded.startsWith("/");
          if (!isPathOnly) {
            const redirectUrl = new URL(decoded);
            const sameOrigin = redirectUrl.origin === req.nextUrl.origin;
            const portalHost = process.env.PORTAL_HOST || "";
            let portalOrigin = null;
            try {
              portalOrigin = portalHost ? new URL(portalHost).origin : null;
            } catch (_) {
              portalOrigin = null;
            }
            const isPortalUrl =
              portalOrigin && redirectUrl.origin === portalOrigin;
            if (!sameOrigin && isPortalUrl) {
              // Portal deep link: bounce through /my-account so the auto-login
              // link is generated before landing on the requested portal page
              const pathAndSearch = redirectUrl.pathname + redirectUrl.search;
              const myAccountUrl = new URL("/my-account", req.nextUrl.origin);
              myAccountUrl.searchParams.set(
                "redirectPath",
                pathAndSearch.startsWith("/")
                  ? pathAndSearch
                  : "/" + pathAndSearch
              );
              return NextResponse.redirect(myAccountUrl);
            }
            if (!sameOrigin) {
              // Only same-origin or portal URLs are allowed
              return NextResponse.redirect(new URL("/", req.url));
            }
          }
          if (isPathOnly) {
            return NextResponse.redirect(new URL(decoded, req.url));
          }
          return NextResponse.redirect(new URL(decoded));
        } catch (e) {
          // fallback: use as-is if decode fails, but keep it same-origin
          try {
            const fallbackUrl = new URL(redirectTo, req.url);
            if (fallbackUrl.origin === req.nextUrl.origin) {
              return NextResponse.redirect(fallbackUrl);
            }
            return NextResponse.redirect(new URL("/", req.url));
          } catch (fallbackError) {
            // If all else fails, redirect to home
            logger.error("Failed to redirect to:", redirectTo, fallbackError);
            return NextResponse.redirect(new URL("/", req.url));
          }
        }
      }
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Allow unauthenticated access to pay-for-order links (email payment links)
    if (
      pathname.startsWith("/checkout/order-pay/") &&
      req.nextUrl.searchParams.get("pay_for_order") === "true" &&
      req.nextUrl.searchParams.get("key")
    ) {
      return NextResponse.next({
        request: { headers: requestHeaders },
      });
    }

    // Case 3: If user is not authenticated and trying to access protected routes, redirect to register
    // Patient portal links carry id, token and patient-token; let them reach the questionnaire directly
    const patientPortalId = req.nextUrl.searchParams.get("id");
    const patientPortalToken = req.nextUrl.searchParams.get("token");
    const patientToken = req.nextUrl.searchParams.get("patient-token");
    const hasPatientPortalTokens = !!(
      patientPortalId &&
      patientPortalToken &&
      patientToken
    );
    const isQuestionnaireRoute = [
      "/ed-consultation-quiz",
      "/hair-main-questionnaire",
      "/wl-consultation",
      "/nad-consultation-quiz",
    ].some((route) => pathname === route || pathname.startsWith(`${route}/`));

    if (
      !authToken &&
      !isLoginPage &&
      shouldProtectRoute(pathname) &&
      !(hasPatientPortalTokens && isQuestionnaireRoute)
    ) {
      // Create login URL with register view
      const loginUrl = new URL("/login-register", req.nextUrl.origin);

      // Set viewshow to register for all consultations and flows
      loginUrl.searchParams.set("viewshow", "register");

      // Preserve all query parameters in the redirect_to URL
      const redirectUrl = new URL(req.nextUrl.pathname, req.nextUrl.origin);
      // Copy all search params to the redirect URL
      req.nextUrl.searchParams.forEach((value, key) => {
        redirectUrl.searchParams.set(key, value);
      });

      // Set the redirect_to parameter with the full URL including all query params
      loginUrl.searchParams.set("redirect_to", redirectUrl.toString());

      return NextResponse.redirect(loginUrl);
    }

    // Return the response with the modified headers
    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    if (geoCountry) {
      // Non-sensitive value the client reads to decide the geo popup, so
      // httpOnly:false is required. No `secure` so it also works over http in
      // local dev; SameSite=Lax is sufficient. opts kept in sync with the CA
      // middleware (maxAge lowered from 86400 to 3600 for consistency; the
      // cookie is re-derived every request, so a shorter TTL only self-heals
      // stale values faster and does not affect prompt frequency, which the
      // popup gates via sessionStorage).
      response.cookies.set("geo-country", geoCountry, {
        path: "/",
        maxAge: 3600,
        sameSite: "lax",
        httpOnly: false,
      });
    } else {
      // No valid country → clear any stale value so it can't persist.
      response.cookies.delete("geo-country");
    }

    return response;
  } catch (error) {
    // Log the error for debugging
    logger.error("Middleware error:", error);

    // Return a safe fallback response
    return NextResponse.next();
  }
}

// Helper function to determine which routes should be protected
function shouldProtectRoute(pathname) {
  // List of routes that require authentication
  const protectedRoutes = [
    "/checkout",
    "/cart",
    "/profile",
    "/ed-consultation-quiz",
    "/nad-consultation-quiz",
    "/hair-main-questionnaire",
    "/wl-consultation",
    "/mh-quiz",
    "/my-account",
    // "/smoking-consultation",
    // "/acne-consultation-quiz",
    // "/anti-aging-consultation-quiz",
    // "/hyperpigmentation-consultation-quiz",
    //"/ed-pre-consultation-quiz",
    //"/wl-pre-consultation",
    //"/hair-pre-consultation-quiz"

    // Add other routes that should require authentication
  ];

  // Check if the current path should be protected
  return protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// Create a simpler, statically analyzable config export
export const config = {
  matcher: [
    "/checkout/:path*",
    "/cart/:path*",
    "/login-register/:path*",
    "/profile/:path*",
    "/acne-consultation-quiz/:path*",
    "/anti-aging-consultation-quiz/:path*",
    "/hyperpigmentation-consultation-quiz/:path*",
    "/api/:path*",
    "/((?!_next/static|_next/image|_next/data|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|woff2?|ttf|map)$).*)",
  ],
};
