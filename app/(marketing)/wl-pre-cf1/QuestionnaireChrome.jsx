"use client";

// Global chrome-hiding styles for the wl-pre-cf1 questionnaire flow.
// Kept in a client component because styled-jsx requires the client runtime;
// this lets the route's layout stay a server component that owns metadata.
export default function QuestionnaireChrome() {
  return (
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
    `}</style>
  );
}
