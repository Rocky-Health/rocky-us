"use client";

import React from "react";
import Glp2PreV2SinglePage from "@/components/WLPreConsultationQuizV2/Glp2PreV2/Glp2PreV2SinglePage";

export default function Glp2PreV2Page() {
  return (
    <main>
      <style jsx global>{`
        /* ── Hide site navigation and footer during the quiz ─────────────── */
        header:not(.glp2-v2-header),
        nav,
        .site-header,
        .main-header,
        #site-header,
        #main-menu,
        #off-canvas-menu,
        .site-navigation,
        #masthead,
        .rocky-header,
        .rocky-navbar,
        .rocky-navigation,
        div:has(a[href*="Sexual Health"]),
        div:has(a[href*="Hair Loss"]),
        div:has(a[href*="Body Optimization"]),
        div:has(a[href*="Mental Health"]),
        .bg-black.text-white.py-2.text-center,
        [data-trustpilot-widget-id],
        .trustpilot-widget,
        div:has(> .trustpilot-widget),
        div:has(> span:contains("Toronto Maple Leafs")),
        div:has(> span:contains("Proud partner")),
        footer:not(.questionnaire-footer),
        footer.bg-black,
        #site-footer,
        .site-footer,
        .main-footer,
        .footer {
          display: none !important;
        }

        .glp2-v2-header {
          display: flex !important;
        }
      `}</style>

      <Glp2PreV2SinglePage />
    </main>
  );
}
