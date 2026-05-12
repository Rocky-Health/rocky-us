import "./globals.css";
import { logger } from "@/utils/devLogger";
import { Poppins } from "next/font/google";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer/Footer";
import LoadingOverlay from "@/components/utils/LoadingBar";
import CacheClearer from "@/components/utils/CacheClearer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { shouldUseMinimalLayout } from "@/utils/layoutConfig";
import Script from "next/script";
import ClientLayoutProvider from "@/components/Layout/ClientLayoutProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GlobalQuebecPopup from "@/components/GlobalQuebecPopup";
import ZendeskWidget from "@/components/Layout/ZendeskWidget";
import GoogleOAuthProvider from "@/components/Layout/GoogleOAuthProvider";
import MetaCookieInitializer from "@/components/Layout/MetaCookieInitializer";
import FBPixelLoader from "@/components/FBPixelLoader";
import InactivityTimeoutHandler from "@/components/InactivityTimeoutHandler";
import { Suspense } from "react";

// Layout will use client-side path detection to avoid forcing dynamic rendering

// Configure Google font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Configure local fonts.
// adjustFontFallback: "Arial" tells Next to override Arial's metrics to match
// Fellix's, so the FOUT swap when the Fellix .woff finishes loading produces
// minimal layout shift. preload=true keeps the font in <head>.
const fellixMedium = localFont({
  src: "../fonts/Fellix-Medium.woff",
  variable: "--font-fellix",
  display: "swap",
  adjustFontFallback: "Arial",
  preload: true,
});

const fellixSemiBold = localFont({
  src: "../fonts/Fellix-SemiBold.woff",
  variable: "--font-fellix-bold",
  display: "swap",
  adjustFontFallback: "Arial",
  preload: true,
});

// Prevent iOS Safari from auto-zooming when focusing on form inputs.
// Setting maximumScale=1 stops the zoom while keeping user-initiated pinch
// zoom functional on most modern iOS versions.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.BASE_URL?.replace(/\/$/, "") ||
      "https://www.myrocky.com"
  ),
  title: "MyRocky - Your Health Partner",
  description: "Get professional healthcare advice and treatment online",
  openGraph: {
    title: "MyRocky - Your Health Partner",
    description: "Get professional healthcare advice and treatment online",
    siteName: "MyRocky Health",
    images: [
      {
        url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp",
        width: 1200,
        height: 630,
        alt: "MyRocky - Your Health Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyRocky - Your Health Partner",
    description: "Get professional healthcare advice and treatment online",
    images: [
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Rocky.webp",
    ],
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* AWIN Consent and MasterTag - only load if tracking is enabled */}
        {(() => {
          const awinEnabled = process.env.NEXT_PUBLIC_AWIN_ENABLED;
          const isEnabled =
            awinEnabled === undefined ||
            awinEnabled === "" ||
            awinEnabled === "true" ||
            awinEnabled === "1";
          if (!isEnabled) return null;
          return (
            <>
              <Script id="awin-consent" strategy="beforeInteractive">
                {`
                  window.AWIN = window.AWIN || {};
                  AWIN.Tracking = AWIN.Tracking || {};
                  if (typeof AWIN.Tracking.AdvertiserConsent === 'undefined') {
                    AWIN.Tracking.AdvertiserConsent = true;
                  }
                `}
              </Script>
              <Script
                id="awin-mastertag"
                strategy="beforeInteractive"
                src={`https://www.dwin1.com/${
                  process.env.AWIN_MERCHANT_ID || "101159"
                }.js`}
              />
            </>
          );
        })()}
        {/* Google Tag Manager - Changed to beforeInteractive for earlier loading */}
        {
          <Script id="google-tag-manager" strategy="beforeInteractive">
            {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-K9PC394B');
          `}
          </Script>
        }
        {/* End Google Tag Manager */}
        {/* Start Facebooc Domain Verification */}
        <meta
          name="facebook-domain-verification"
          content="uvvbdeqdbj046v74x0oqaxhl9tyq26"
        />
        {/* End Facebooc Domain Verification */}
        {/* Start Convert Experiences — async load.
            Inline anti-flicker hides body for up to 500ms while Convert downloads,
            so the page reveals fast even when Convert is slow. */}
        <Script id="convert-anti-flicker" strategy="beforeInteractive">
          {`
            (function(){
              var s=document.createElement('style');
              s.id='__convert-anti-flicker';
              s.appendChild(document.createTextNode('body{opacity:0!important}'));
              (document.head||document.documentElement).appendChild(s);
              function clear(){
                var n=document.getElementById('__convert-anti-flicker');
                if(n&&n.parentNode)n.parentNode.removeChild(n);
              }
              setTimeout(clear,500);
              window.__convertClearAntiFlicker=clear;
            })();
          `}
        </Script>
        <Script
          id="convert-experiences"
          strategy="beforeInteractive"
          async
          src="https://cdn-4.convertexperiments.com/v1/js/10045956-10046753.js?environment=production"
        />
        {/* End Convert Experiences */}
        {/* Start TikTok Pixel — stub installs immediately so ttq.track() calls queue;
            the SDK (events.js + chunks + /inter polling) only loads after first user
            interaction. Idle fallback ensures pageview attribution still fires for bouncers. */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

              var __ttqId='${
                process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ||
                "CAFVBSRC77U9MLGRGE10"
              }';
              var __ttqLoaded=false;
              var __ttqEvents=['pointerdown','touchstart','keydown','scroll','mousemove'];
              function __ttqBoot(){
                if(__ttqLoaded)return;
                __ttqLoaded=true;
                try{ttq.load(__ttqId);ttq.page();}catch(e){}
                __ttqEvents.forEach(function(ev){w.removeEventListener(ev,__ttqBoot,true);});
                if(__ttqIdle&&w.cancelIdleCallback){w.cancelIdleCallback(__ttqIdle);}
                else if(__ttqIdle){w.clearTimeout(__ttqIdle);}
              }
              __ttqEvents.forEach(function(ev){w.addEventListener(ev,__ttqBoot,{passive:true,capture:true,once:true});});
              var __ttqIdle=w.requestIdleCallback
                ? w.requestIdleCallback(__ttqBoot,{timeout:15000})
                : w.setTimeout(__ttqBoot,15000);
            }(window, document, 'ttq');
          `}
        </Script>
        {/* End TikTok Pixel */}
        {/* Start Microsoft Clarity */}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "us5bium5oa");
          `}
        </Script>
        {/* End Microsoft Clarity */}
        {/* Start Heatmap.com */}
        <Script id="heatmap-tracking" strategy="beforeInteractive">
          {`/* >> Heatmap.com :: Snippet << */(function (h,e,a,t,m,ap) { (h._heatmap_paq = []).push([ 'setTrackerUrl', (h.heatUrl = e) + a]); h.hErrorLogs=h.hErrorLogs || []; ap=t.createElement('script');  ap.src=h.heatUrl+'preprocessor.min.js?sid='+m;  ap.defer=true; t.head.appendChild(ap); ['error', 'unhandledrejection'].forEach(function (ty) {     h.addEventListener(ty, function (et) { h.hErrorLogs.push({ type: ty, event: et }); }); });})(window,'https://dashboard.heatmap.com/','heatmap.php',document,5229);`}
        </Script>
        {/* End Heatmap.com */}
      </head>
      <body
        className={`${poppins.variable} ${fellixMedium.variable} ${fellixSemiBold.variable}`}
        suppressHydrationWarning={true}
      >
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-K9PC394B"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {/* End Google Tag Manager (noscript) */} <CacheClearer />
        <Suspense fallback={null}>
          <MetaCookieInitializer />
        </Suspense>
        <LoadingOverlay />
        <Suspense fallback={null}>
          <FBPixelLoader />
        </Suspense>
        {/* <CronHitHandler /> */}
        <GoogleOAuthProvider>
          <InactivityTimeoutHandler />
          <Navbar className="navbar-main" />
          <ClientLayoutProvider>{children}</ClientLayoutProvider>
          <Footer className="footer-main" />
        </GoogleOAuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          style={{ zIndex: 999999 }}
        />
        {/* Global Quebec Popup - Shows after registration redirect */}
        <GlobalQuebecPopup />
        <ZendeskWidget />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
