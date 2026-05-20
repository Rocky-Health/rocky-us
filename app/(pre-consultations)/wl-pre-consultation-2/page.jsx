"use client";

import React from "react";
import BOSimplifiedFlow2 from "@/components/WLPreConsultationQuizV2/BOSimplified2/BOSimplifiedFlow2";

// Dedicated route for BO pre-consultation v2 — clones /wl-pre-consultation but swaps
// step 7's "Choose your treatment" recommendation step + step 8 plan selection for the
// glp2 unified "Select Treatment" combined treatment+plan screen.
export default function BOPreConsultation2Page() {
  return (
    <main>
      <style jsx global>{`
        /* Hide ALL headers by default */
        header,
        nav,
        .header,
        .navbar,
        /* Main navigation */
        #site-header,
        .main-header,
        .default-navbar,
        #main-menu,
        #off-canvas-menu,
        .site-navigation,
        #masthead,
        /* Hide menu navigation */
        div:has(a[href*="Sexual Health"]),
        div:has(a[href*="Hair Loss"]),
        div:has(a[href*="Body Optimization"]),
        /* TrustPilot header */
        div:has(> h1:contains("TrustPilot")),
        div:has(> div:contains("TrustPilot")),
        div:has(> span:contains("TrustPilot")),
        div:contains("TrustPilot"),
        /* TrustPilot widget */
        .bg-black.text-white.py-2.text-center,
        [data-trustpilot-widget-id],
        .trustpilot-widget,
        div:has(> .trustpilot-widget),
        /* Toronto Maple Leafs header */
        div:has(> span:contains("Toronto Maple Leafs")),
        div:has(> span:contains("Proud partner")),
        div[class*="bg-[#003876]"],
        /* MyRocky navigation header */
        .rocky-header,
        .rocky-navbar,
        .rocky-navigation,
        div:has(> img[alt="rocky"]),
        div:has(> a:contains("Sexual Health")),
        div:has(> a:contains("Hair Loss")),
        div:has(> a:contains("Body Optimization")),
        div:has(> a:contains("Mental Health")),
        div:has(> a:contains("Recovery")),
        div:has(> a:contains("Smoking Cessation")),
        /* Footer selectors */
        footer:not(.questionnaire-footer),
        footer.bg-black,
        footer[className*="bg-black"],
        .bg-white.flex.justify-between.items-center.p-4,
        #site-footer,
        .site-footer,
        .main-footer,
        .footer-widgets,
        .footer-bottom,
        #colophon,
        .footer-area,
        .footer-container {
          display: none !important;
        }

        .questionnaire-header {
          display: flex !important;
        }

        .questionnaire-footer {
          display: block !important;
        }

        body {
          padding-top: 0 !important;
          margin-top: 0 !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }

        #launcher {
          display: none !important;
        }
        iframe[title="Close message"] {
          display: none !important;
        }
        iframe[title="Message from company"] {
          display: none !important;
        }
      `}</style>
      <BOSimplifiedFlow2 />
    </main>
  );
}
