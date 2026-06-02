"use client";

export default function NadConsultationQuizLayout({ children }) {
  return (
    <div className="longevity-questionnaire-layout">
      <style jsx global>{`
        .fixed.inset-0.flex.items-center.justify-center.bg-black.bg-opacity-50.z-50 {
          display: none !important;
        }

        header,
        nav,
        .header,
        .navbar,
        #site-header,
        .main-header,
        .default-navbar,
        #main-menu,
        #off-canvas-menu,
        .site-navigation,
        #masthead,
        .rocky-header,
        .rocky-navbar,
        .rocky-navigation,
        header.navbar-main,
        footer.footer-main,
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
      {children}
    </div>
  );
}
