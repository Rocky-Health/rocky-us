const BASE_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.BASE_URL?.replace(/\/$/, "") ||
  "https://www.myrocky.com";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/checkout/",
          "/my-account",
          "/login-register",
          "/forgot-password",
          "/reset-password",
          "/implied-consent",
          "/blocked",
        ],
      },
    ],
    sitemap: `${BASE_SITE_URL}/sitemap.xml`,
  };
}
