import { wooApiGet } from "@/lib/woocommerce";
import axios from "axios";
import { logger } from "@/utils/devLogger";
import {
  isBlockedRoute,
  isRestrictedProductRoute,
} from "@/lib/constants/blockedRoutes";

const BASE_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.BASE_URL?.replace(/\/$/, "") ||
  "https://www.myrocky.com";

// WP/WC return GMT dates without a timezone marker (e.g. "2026-06-04T20:59:24").
// Google's sitemap spec requires a timezone on <lastmod>, so normalize to UTC ISO.
function toSitemapDate(...candidates) {
  for (const value of candidates) {
    if (!value) continue;
    // Treat tz-less WP/WC strings as UTC by appending Z before parsing.
    const normalized = /[Z+]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`;
    const date = new Date(normalized);
    if (!isNaN(date.getTime())) return date.toISOString();
  }
  return new Date().toISOString();
}

// Static routes – main pages, policies, and landing pages.
// US-only, 200-status URLs only. Excluded: blocked routes (mental-health, merch,
// zonnic – redirect to /blocked), CA-only pages (service-across-canada
// and its cities), and dead/non-indexable URLs (/blog/all 500, /cart auth
// redirect, /podcast 404).
const staticRoutes = [
  { url: "", priority: 1.0, changeFrequency: "daily" },
  { url: "/about-us", priority: 0.8, changeFrequency: "monthly" },
  { url: "/contact-us", priority: 0.8, changeFrequency: "monthly" },
  { url: "/assistance-center", priority: 0.7, changeFrequency: "monthly" },
  { url: "/help-center", priority: 0.7, changeFrequency: "monthly" },
  { url: "/how-it-works", priority: 0.8, changeFrequency: "monthly" },
  { url: "/faqs", priority: 0.7, changeFrequency: "monthly" },
  { url: "/privacy-policy", priority: 0.5, changeFrequency: "yearly" },
  { url: "/terms-of-use", priority: 0.5, changeFrequency: "yearly" },
  { url: "/reviews", priority: 0.7, changeFrequency: "weekly" },
  { url: "/blog", priority: 0.9, changeFrequency: "daily" },
  { url: "/search", priority: 0.6, changeFrequency: "always" },
  { url: "/product-faq", priority: 0.6, changeFrequency: "monthly" },
  { url: "/body-optimization", priority: 0.8, changeFrequency: "monthly" },
  { url: "/body-optimization-trim", priority: 0.7, changeFrequency: "monthly" },
  { url: "/ed", priority: 0.8, changeFrequency: "monthly" },
  { url: "/hair", priority: 0.8, changeFrequency: "monthly" },
  { url: "/hair-products", priority: 0.8, changeFrequency: "monthly" },
  { url: "/hairloss", priority: 0.8, changeFrequency: "monthly" },
  { url: "/sex", priority: 0.8, changeFrequency: "monthly" },
  { url: "/service-coverage", priority: 0.7, changeFrequency: "monthly" },
  { url: "/my-rocky-combo-pack", priority: 0.7, changeFrequency: "monthly" },
];

async function getAllProducts() {
  const products = [];
  let page = 1;
  const perPage = 100;

  try {
    while (true) {
      const response = await wooApiGet("products", {
        status: "publish",
        per_page: perPage,
        page,
        _fields: "slug,date_modified,date_modified_gmt",
      });

      if (!response.ok) {
        logger.error(
          "[Sitemap] WooCommerce products fetch failed:",
          response.status
        );
        break;
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) break;

      products.push(...data);

      const totalPages = response.headers.get("x-wp-totalpages");
      if (!totalPages || page >= parseInt(totalPages, 10)) break;
      page++;
    }
  } catch (error) {
    logger.error("[Sitemap] Error fetching products:", error.message);
  }

  return products;
}

async function getAllBlogPosts() {
  const posts = [];
  let page = 1;
  const perPage = 100;

  const baseUrl = process.env.BASE_URL?.replace(/\/$/, "");
  if (!baseUrl || !process.env.ADMIN_TOKEN) {
    logger.error("[Sitemap] BASE_URL or ADMIN_TOKEN not configured for blogs");
    return posts;
  }

  try {
    while (true) {
      const { data, headers } = await axios.get(
        `${baseUrl}/wp-json/wp/v2/posts`,
        {
          params: {
            per_page: perPage,
            page,
            status: "publish",
            _fields: "slug,modified,modified_gmt",
          },
          headers: {
            Authorization: process.env.ADMIN_TOKEN,
          },
          timeout: 15000,
        }
      );

      if (!Array.isArray(data) || data.length === 0) break;
      posts.push(...data);

      const totalPages =
        headers["x-wp-totalpages"] || headers["X-WP-TotalPages"] || "1";
      if (page >= parseInt(totalPages, 10)) break;
      page++;
    }
  } catch (error) {
    logger.error("[Sitemap] Error fetching blog posts:", error.message);
  }

  return posts;
}

export default async function sitemap() {
  const currentDate = new Date().toISOString();

  const sitemapEntries = [];

  // 1) Static routes (guarded against the shared blocklist as a safety net)
  for (const route of staticRoutes) {
    if (isBlockedRoute(route.url)) continue;
    sitemapEntries.push({
      url: `${BASE_SITE_URL}${route.url || "/"}`,
      lastModified: currentDate,
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  // 2) Product URLs (WooCommerce) – skip blocked products (mental-health,
  // smoking, etc.) that middleware redirects to /blocked, and compounded
  // weight-loss products that middleware redirects to the homepage.
  try {
    const products = await getAllProducts();
    for (const product of products) {
      const productPath = product?.slug ? `/product/${product.slug}` : null;
      if (
        productPath &&
        !isBlockedRoute(productPath) &&
        !isRestrictedProductRoute(productPath)
      ) {
        sitemapEntries.push({
          url: `${BASE_SITE_URL}${productPath}`,
          lastModified: toSitemapDate(
            product.date_modified_gmt,
            product.date_modified,
            currentDate
          ),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    logger.error("[Sitemap] Failed to add products:", error.message);
  }

  // 3) Blog post URLs (WordPress)
  try {
    const blogs = await getAllBlogPosts();
    for (const blog of blogs) {
      if (blog?.slug) {
        sitemapEntries.push({
          url: `${BASE_SITE_URL}/blog/${blog.slug}`,
          lastModified: toSitemapDate(blog.modified_gmt, blog.modified, currentDate),
          changeFrequency: "monthly",
          priority: 0.7,
        });
      }
    }
  } catch (error) {
    logger.error("[Sitemap] Failed to add blog posts:", error.message);
  }

  return sitemapEntries;
}
