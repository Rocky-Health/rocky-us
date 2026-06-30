import localFont from "next/font/local";

// Body copy: Poppins (latin subset, 4 weights). Self-hosted WOFF2 — no runtime
// requests to fonts.googleapis.com / fonts.gstatic.com.
// adjustFontFallback: "Arial" emits a metric-matched fallback @font-face so the
// brief pre-load window is visually indistinguishable from brand typography.
// preload=true → <link rel="preload" as="font" crossorigin> in <head>.
export const poppins = localFont({
  src: [
    {
      path: "../public/fonts/Poppins-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Poppins-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Poppins-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Poppins-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  display: "swap",
  adjustFontFallback: "Arial",
  preload: true,
});

// Display / heading typeface. WOFF2 latin subset (~29 KB per weight).
export const fellixMedium = localFont({
  src: "../public/fonts/Fellix-Medium.woff2",
  variable: "--font-fellix",
  display: "swap",
  adjustFontFallback: "Arial",
  preload: true,
});

export const fellixSemiBold = localFont({
  src: "../public/fonts/Fellix-SemiBold.woff2",
  variable: "--font-fellix-bold",
  display: "swap",
  adjustFontFallback: "Arial",
  preload: true,
});

/** Class string for <html> or <body> — applies all font CSS variables. */
export const fontVariables = `${poppins.variable} ${fellixMedium.variable} ${fellixSemiBold.variable}`;
