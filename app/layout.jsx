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
import { shouldUseMinimalLayout, layoutExemptRoutes } from "@/utils/layoutConfig";
import Script from "next/script";
import ClientLayoutProvider from "@/components/Layout/ClientLayoutProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import GlobalQuebecPopup from "@/components/GlobalQuebecPopup";
import GeoRedirectPopup from "@/components/Popups/GeoRedirectPopup";
// TK-693: Zendesk disabled on US until the bot's routing/focus-trap is fixed
// (mobile focus-trap kills the quiz + background polling on the funnel). Kept
// in source to re-enable once the Zendesk team ships the fix — do not delete.
// import ZendeskWidget from "@/components/Layout/ZendeskWidget";
import MetaCookieInitializer from "@/components/Layout/MetaCookieInitializer";
import FBPixelLoader from "@/components/FBPixelLoader";
import InactivityTimeoutGate from "@/components/InactivityTimeoutGate";
import { Suspense } from "react";
import { SITE, ogImageUrl } from "@/lib/seo/metadata";
import JsonLd from "@/components/seo/JsonLd";
import { organizationSchema } from "@/lib/seo/schema";

// Layout will use client-side path detection to avoid forcing dynamic rendering

// Configure Google font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

// Configure local fonts.
// WOFF2 + Latin subset: ~29 KB per weight (was 61 KB WOFF, 507 glyphs).
// adjustFontFallback: "Arial" overrides Arial's metrics to match Fellix's, so
// the FOUT swap on font arrival produces minimal layout shift.
// preload=true emits <link rel="preload" as="font"> in <head>.
const fellixMedium = localFont({
  src: "../fonts/Fellix-Medium.woff2",
  variable: "--font-fellix",
  display: "swap",
  adjustFontFallback: "Arial",
  preload: true,
});

const fellixSemiBold = localFont({
  src: "../fonts/Fellix-SemiBold.woff2",
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

const DEFAULT_HOME_TITLE = "MyRocky - Online Healthcare Made For You";
const DEFAULT_OG_IMAGE = ogImageUrl({ title: SITE.name, vertical: "home" });

export const metadata = {
  metadataBase: new URL(SITE.baseUrl),
  // TK-492: optimized local icons, each declared once (previously a 27 KB JPEG
  // declared 3× as icon/shortcut/apple). favicon.ico is <3 KB (16/32/48);
  // apple-touch-icon is a real PNG; PWA icons live in the web manifest.
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  title: {
    template: `%s ${SITE.titleSuffix}`,
    default: DEFAULT_HOME_TITLE,
  },
  description: SITE.defaultDescription,
  openGraph: {
    type: "website",
    siteName: SITE.siteName,
    locale: "en_US",
    title: DEFAULT_HOME_TITLE,
    description: SITE.defaultDescription,
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: SITE.defaultOgAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_HOME_TITLE,
    description: SITE.defaultDescription,
    images: [DEFAULT_OG_IMAGE],
  },
  other: {
    "geo.region": "US",
    "geo.placename": "United States",
  },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en-US" suppressHydrationWarning={true}>
      <head>
        {/* Site-wide Organization structured data (non-visual). */}
        <JsonLd data={organizationSchema()} />
        {/* Minimal-layout pre-paint flag (CLS fix): synchronously tag <html>
            with data-layout BEFORE first paint so the global navbar/footer
            never render visibly on exempt routes (checkout, quizzes,
            prelanders) only to be hidden by JS after hydration. globals.css
            hides .navbar-main/.footer-main on [data-layout="minimal"];
            LayoutDetector keeps the flag in sync on client-side navigation.
            Inline + synchronous (not next/script) so it runs during <head>
            parse, before the body paints. */}
        <script
          id="layout-minimal-flag"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var r=${JSON.stringify(
              layoutExemptRoutes,
            )};var p=location.pathname.split("?")[0].replace(/\\/$/,"");var m=r.some(function(x){return p===x||p.indexOf(x+"/")===0;});document.documentElement.setAttribute("data-layout",m?"minimal":"full");}catch(e){}})();`,
          }}
        />
        {/* Preconnect to critical third-party origins to overlap DNS+TLS with HTML parse.
            Limited to origins fetched on every cold load to avoid wasting handshakes.
            Zendesk/TikTok/Attentive are intentionally NOT here — they're lazy-loaded. */}
        <link rel="preconnect" href="https://myrocky.b-cdn.net" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://cdn-4.convertexperiments.com" />
        <link rel="preconnect" href="https://widget.trustpilot.com" />

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
              {/* AWIN: consent stub stays beforeInteractive (tiny inline, no
                  network cost) so AWIN.Tracking.AdvertiserConsent is guaranteed
                  set before the MasterTag executes. The MasterTag is lazyOnload:
                  awc is captured first-party (AttributionTracker), so the tag
                  doesn't need to race hydration. Conversion tracking fires
                  post-purchase and is unaffected. */}
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
                strategy="lazyOnload"
                src={`https://www.dwin1.com/${
                  process.env.AWIN_MERCHANT_ID || "101159"
                }.js`}
              />
            </>
          );
        })()}
        {/* Google Tag Manager — dataLayer stub installs immediately so dataLayer.push()
            calls keep buffering; the gtm.js fetch (and all 4 downstream gtag scripts it
            injects) waits until first user interaction. Idle fallback at 15s ensures
            attribution still fires for engaged-but-still users. Bouncers who close the
            tab within 15s skip ~2.35 MB of Google tag JS entirely.
            TK-424: the 15s fallback is a real timer now; rIC alone fired at the
            first idle slot and pulled gtm.js into the cold-load window. */}
        <Script id="google-tag-manager" strategy="beforeInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              var __gtmLoaded=false;
              var __gtmEvents=['pointerdown','touchstart','keydown','scroll','mousemove'];
              function __gtmBoot(){
                if(__gtmLoaded)return;
                __gtmLoaded=true;
                w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
                var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
                j.async=true;
                j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
                f.parentNode.insertBefore(j,f);
                __gtmEvents.forEach(function(ev){w.removeEventListener(ev,__gtmBoot,true);});
                w.clearTimeout(__gtmTimer);
              }
              __gtmEvents.forEach(function(ev){w.addEventListener(ev,__gtmBoot,{passive:true,capture:true,once:true});});
              // wait 15s, then boot on the next idle slot
              var __gtmTimer=w.setTimeout(function(){
                if(w.requestIdleCallback){w.requestIdleCallback(__gtmBoot,{timeout:2000});}
                else{__gtmBoot();}
              },15000);
            })(window,document,'script','dataLayer','GTM-K9PC394B');
          `}
        </Script>
        {/* End Google Tag Manager */}
        {/* Start Facebooc Domain Verification */}
        <meta
          name="facebook-domain-verification"
          content="uvvbdeqdbj046v74x0oqaxhl9tyq26"
        />
        {/* End Facebooc Domain Verification */}
        {/* Start Convert Experiences — session-aware bootstrap.
            Anti-flicker runs only on the first full-page load per tab session so
            funnel pages after a hard reload do not flash hidden content. Convert's
            visitor cookie (_conv_v) carries stable assignment across reloads;
            client-side navigation (router.push) keeps the script loaded once.
            Verify in Convert dashboard that bucketing uses the visitor cookie. */}
        <Script id="convert-bootstrap" strategy="beforeInteractive">
          {`
            (function(w,d){
              var KEY='rocky_convert_bootstrapped';
              var SRC='https://cdn-4.convertexperiments.com/v1/js/10045956-10046753.js?environment=production';
              w._conv_q=w._conv_q||[];
              var bootstrapped=false;
              try{bootstrapped=!!w.sessionStorage.getItem(KEY);}catch(e){}
              if(bootstrapped){
                w._conv_prevent_bodyhide=true;
              }else{
                var s=d.createElement('style');
                s.id='__convert-anti-flicker';
                s.appendChild(d.createTextNode('body{opacity:0!important}'));
                (d.head||d.documentElement).appendChild(s);
                function clear(){
                  var n=d.getElementById('__convert-anti-flicker');
                  if(n&&n.parentNode)n.parentNode.removeChild(n);
                }
                setTimeout(clear,500);
                w.__convertClearAntiFlicker=clear;
              }
              if(d.getElementById('convert-experiences'))return;
              var sc=d.createElement('script');
              sc.id='convert-experiences';
              sc.async=true;
              sc.src=SRC;
              sc.onload=function(){
                try{w.sessionStorage.setItem(KEY,'1');}catch(e){}
                if(w.__convertClearAntiFlicker)w.__convertClearAntiFlicker();
              };
              (d.head||d.documentElement).appendChild(sc);
            })(window,document);
          `}
        </Script>
        {/* End Convert Experiences */}
        {/* TikTok Pixel — code owns ttq.load() + PageView (same pattern as
            FBPixelLoader for Meta). SDK loads after first interaction; idle
            fallback at 15s. ttq.load() is idempotent per pixel ID. If
            analytics.tiktok.com still shows two main.*.js bundles, remove the
            TikTok pixel tag from GTM-K9PC394B — do not load from both. */}
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){ttq._i=ttq._i||{};if(ttq._i[e]&&ttq._i[e]._u)return;var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};

              var __ttqId='${
                process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID ||
                "CAFVBSRC77U9MLGRGE10"
              }';
              var __ttqLoaded=false;
              var __ttqEvents=['pointerdown','touchstart','keydown','scroll','mousemove'];
              function __ttqBoot(){
                if(__ttqLoaded)return;
                __ttqLoaded=true;
                if(d.querySelector('script[src*="analytics.tiktok.com/i18n/pixel/events.js"]'))return;
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
        {/* Start Microsoft Clarity — lazyOnload: session replay/telemetry does not
            need to race hydration; queued clarity() calls buffer until load. */}
        <Script id="microsoft-clarity" strategy="lazyOnload">
          {`
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "us5bium5oa");
          `}
        </Script>
        {/* End Microsoft Clarity */}
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
        {/* TK-482: GoogleOAuthProvider removed from the global layout — it
            injected the 258 KB Google Identity Services script on every page.
            The GSI script is now lazy-loaded by GoogleSignInButton when an
            auth surface mounts. Nothing here consumed the OAuth context. */}
        {/* TK-429: gated — mounts only for authenticated users so guests skip
            the activity listeners, polling interval, and modal chunk */}
        <InactivityTimeoutGate />
        <Navbar className="navbar-main" />
        <ClientLayoutProvider>{children}</ClientLayoutProvider>
        <Footer className="footer-main" />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          pauseOnHover={false}
          pauseOnFocusLoss={false}
          style={{ zIndex: 999999 }}
        />
        {/* Global Quebec Popup - Shows after registration redirect */}
        <GlobalQuebecPopup />
        <GeoRedirectPopup />
        {/* TK-693: disabled until Zendesk bot fixed — re-enable, don't delete */}
        {/* <ZendeskWidget /> */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
