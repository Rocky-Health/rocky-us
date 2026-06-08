"use client";

import { usePathname } from "next/navigation";
import { logger } from "@/utils/devLogger";
import { useEffect, useState } from "react";
import { shouldUseMinimalLayout, shouldHideZendesk } from "@/utils/layoutConfig";
import { getAwinFromUrlOrStorage } from "@/utils/awin";
import { analyticsService } from "@/utils/analytics/analyticsService";

/**
 * The LayoutDetector component handles dynamic layout changes
 * based on client-side navigation. It updates the DOM directly
 * to show or hide header/footer elements when navigating between
 * minimal and full layout pages.
 */
const LayoutDetector = () => {
  const pathname = usePathname();
  const [isMinimalLayout, setIsMinimalLayout] = useState(false);

  useEffect(() => {
    if (!pathname) return;

    // Normalize the path to match server-side processing
    // Remove query parameters and trailing slashes for consistent matching
    const normalizedPath = pathname.split("?")[0].replace(/\/$/, "");

    // Determine if current path should use minimal layout
    const shouldBeMinimal = shouldUseMinimalLayout(normalizedPath);
    setIsMinimalLayout(shouldBeMinimal);

    // Keep the <html data-layout> flag (set pre-paint by the inline script in
    // app/layout.jsx) in sync on client-side navigation. globals.css hides
    // .navbar-main/.footer-main on [data-layout="minimal"], so updating this
    // synchronously hides/shows them with no layout shift when SPA-navigating
    // between full and minimal routes — before the deferred toggle below runs.
    document.documentElement.setAttribute(
      "data-layout",
      shouldBeMinimal ? "minimal" : "full"
    );

    const hideZendesk = shouldHideZendesk(normalizedPath);

    // Get header and footer elements with more reliable selectors
    const navbarElement = document.querySelector("header.navbar-main");
    const footerElement = document.querySelector("footer.footer-main");

    // Get the section under the footer (LegitScript section)
    const footerUnderElement = document.querySelector(
      ".bg-white.flex.justify-between.items-center.p-4"
    );

    // Use a small delay to ensure DOM is ready
    setTimeout(() => {
      if (navbarElement) {
        // Use classList instead of style for better CSS integration
        if (shouldBeMinimal) {
          navbarElement.classList.add("layout-hidden");
          navbarElement.style.display = "none";
        } else {
          navbarElement.classList.remove("layout-hidden");
          navbarElement.style.display = "";
        }
      }

      if (footerElement) {
        if (shouldBeMinimal) {
          footerElement.classList.add("layout-hidden");
          footerElement.style.display = "none";
        } else {
          footerElement.classList.remove("layout-hidden");
          footerElement.style.display = "";
        }
      }

      // Also hide/show the part under the footer
      if (footerUnderElement) {
        if (shouldBeMinimal) {
          footerUnderElement.classList.add("layout-hidden");
          footerUnderElement.style.display = "none";
        } else {
          footerUnderElement.classList.remove("layout-hidden");
          footerUnderElement.style.display = "";
        }
      }

      const zendeskElement = document.getElementById("zendesk-launcher-placeholder");
      if (zendeskElement) {
        if (hideZendesk) {
          zendeskElement.classList.add("layout-hidden");
          zendeskElement.style.display = "none";
        } else {
          zendeskElement.classList.remove("layout-hidden");
          zendeskElement.style.display = "";
        }
      }

      // Update body data attribute for CSS targeting
      document.body.setAttribute(
        "data-layout",
        shouldBeMinimal ? "minimal" : "full"
      );

      // For debugging - uncomment if needed
      // logger.log(`Client path: ${normalizedPath}, Minimal Layout: ${shouldBeMinimal}`);

      // Fire a global headless_page_view on every client-side route change
      try {
        analyticsService.trackHeadlessPageView({
          page_title: document.title || normalizedPath || "",
          page_path: normalizedPath || window.location.pathname,
        });
      } catch (e) {
        // non-blocking
      }

      // Capture AWIN awc param once per route change if present
      try {
        getAwinFromUrlOrStorage();
      } catch (e) {}
    }, 10);
  }, [pathname]); // Re-run effect when pathname changes

  return null; // This component doesn't render anything visible
};

export default LayoutDetector;
