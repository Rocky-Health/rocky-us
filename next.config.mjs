const ONE_YEAR_IMMUTABLE = "public, max-age=31536000, immutable";
const THIRTY_DAYS = "public, max-age=2592000, stale-while-revalidate=86400";

// Security headers (TK-651).
// CSP is Report-Only for now so we can collect violations before enforcing.
// Allowlist = our hosts + everything we load directly or via GTM.
// unsafe-inline/unsafe-eval needed for GTM, Convert and Next inline scripts.
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.myrocky.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://www.googleadservices.com https://googleads.g.doubleclick.net https://js.stripe.com https://connect.facebook.net https://analytics.tiktok.com https://*.tiktok.com https://www.redditstatic.com https://s.pinimg.com https://ct.pinterest.com https://bat.bing.com https://*.clarity.ms https://www.dwin1.com https://*.awin1.com https://widget.trustpilot.com https://*.zdassets.com https://*.convertexperiments.com https://libs.na.bambora.com https://www.beanstream.com https://maps.googleapis.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://widget.trustpilot.com https://*.zdassets.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.myrocky.com https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://stats.g.doubleclick.net https://api.stripe.com https://js.stripe.com https://www.beanstream.com https://libs.na.bambora.com https://graph.facebook.com https://connect.facebook.net https://business-api.tiktok.com https://analytics.tiktok.com https://*.tiktok.com https://*.reddit.com https://api.pinterest.com https://ct.pinterest.com https://bat.bing.com https://*.clarity.ms https://www.dwin1.com https://*.awin1.com https://api.northbeam.io https://oauth2.googleapis.com https://places.googleapis.com https://maps.googleapis.com https://widget.trustpilot.com https://*.zdassets.com wss://*.zdassets.com",
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://www.googletagmanager.com https://www.facebook.com https://www.instagram.com https://*.trustpilot.com https://*.zdassets.com https://www.beanstream.com https://www.youtube.com https://www.youtube-nocookie.com https://player.vimeo.com",
  "media-src 'self' blob: https:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "upgrade-insecure-requests",
].join("; ");

const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Expose the WordPress backend URL to the client bundle so client components
  // (image src, form actions, etc.) can build asset/endpoint URLs from a single
  // source of truth. Inlined at build time — set BASE_URL in the build env.
  env: {
    BASE_URL: process.env.BASE_URL,
  },
  // Disable streaming metadata for all user agents. With async generateMetadata
  // (e.g. blog [slug] fetching from WordPress), Next.js otherwise injects
  // <link rel="canonical"> into <body> after the page streams. Google ignores
  // body-level canonicals, which caused GSC to report "User-declared canonical: None"
  // on blog URLs despite the tag being present in the HTML.
  htmlLimitedBots: /.*/,
  experimental: {
    // Tree-shake icon imports (295 import sites across 232 files).
    optimizePackageImports: ["react-icons"],
  },
  images: {
    // AVIF first (~20-30% smaller than WebP), WebP fallback for older browsers.
    // Format negotiation is automatic via the Accept header — same source files,
    // no code changes, no visual difference.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "myrocky.b-cdn.net",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "myrocky.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mycdn.myrocky.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "wpbe.myrocky.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "myrocky-ca-wp-media.s3.ca-central-1.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "rh-staging.etk-tech.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "myrocky-dev.etk-tech.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "mycdn.myrocky.ca",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "static.legitscript.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "myrocky.ca",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "myrocky.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.vectorstock.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "stg-1.rocky.health",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.shutterstock.com",
        pathname: "/**",
      },
    ],
  },
  async headers() {
    const immutable = [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }];
    const thirtyDays = [{ key: "Cache-Control", value: THIRTY_DAYS }];
    const fontExts = ["woff", "woff2", "ttf", "otf", "eot"];
    const mediaExts = [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "avif",
      "svg",
      "ico",
      "mp4",
      "webm",
      "m4v",
      "mov",
    ];

    return [
      { source: "/:path*", headers: SECURITY_HEADERS },
      { source: "/_next/static/:path*", headers: immutable },
      { source: "/_next/image", headers: thirtyDays },
      ...fontExts.map((ext) => ({
        source: `/:path*.${ext}`,
        headers: immutable,
      })),
      ...mediaExts.map((ext) => ({
        source: `/:path*.${ext}`,
        headers: thirtyDays,
      })),
    ];
  },
};

export default nextConfig;
