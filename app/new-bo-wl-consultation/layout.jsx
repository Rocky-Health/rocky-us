"use client";

export default function BOWeightQuestionnaireLayout({ children }) {
  return (
    <div className="weight-questionnaire-layout">
      <style jsx global>{`
        header:not(.questionnaire-header),
        nav:not(.questionnaire-navbar),
        #site-header, 
        .main-header:not(.questionnaire-header), 
        .default-navbar:not(.questionnaire-navbar),
        #main-menu:not(.questionnaire-menu),
        #off-canvas-menu,
        .site-navigation:not(.questionnaire-navigation),
        #masthead,
        .bg-black.text-white.py-2.text-center,
        [data-trustpilot-widget-id],
        .trustpilot-widget,
        div:has(> .trustpilot-widget),
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
        /* Zendesk Widget - Hide all elements completely */
        #launcher,
        #messenger,
        .zE-launcher,
        .zE-messenger,
        .zendesk-widget,
        .zendesk-chat,
        iframe[title*="Zendesk"],
        iframe[title*="Messenger"],
        iframe[title*="Close message"],
        iframe[title*="Message from company"],
        iframe[id*="zendesk"],
        iframe[id*="messenger"],
        div[id*="zendesk"],
        div[id*="messenger"],
        div[class*="zendesk"],
        div[class*="zE"],
        button[aria-label*="Zendesk"],
        button[aria-label*="Close"],
        button[title*="Close"],
        button[title*="Zendesk"],
        a[aria-label*="Zendesk"],
        a[aria-label*="Close"] {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
      `}</style>
      {children}
    </div>
  );
}
