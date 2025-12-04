"use client";

export default function ZonnicQuestionnaireLayout({ children }) {
  return (
    <div className="zonnic-questionnaire-layout">
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
          #launcher {
            display: none !important;
          }
      `}</style>
      {children}
    </div>
  );
}