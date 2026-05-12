const ONE_YEAR_IMMUTABLE = "public, max-age=31536000, immutable";
const THIRTY_DAYS = "public, max-age=2592000, stale-while-revalidate=86400";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        source: "/_next/image:path*",
        headers: [{ key: "Cache-Control", value: THIRTY_DAYS }],
      },
      {
        source: "/:path(.+\\.(?:woff|woff2|ttf|otf|eot))",
        headers: [{ key: "Cache-Control", value: ONE_YEAR_IMMUTABLE }],
      },
      {
        source:
          "/:path(.+\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|mp4|webm|m4v|mov))",
        headers: [{ key: "Cache-Control", value: THIRTY_DAYS }],
      },
    ];
  },
};

export default nextConfig;
