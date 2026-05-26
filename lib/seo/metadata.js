const DEFAULT_BASE_URL = "https://www.myrocky.com";

function resolveBaseUrl() {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.BASE_URL?.replace(/\/$/, "") ||
    DEFAULT_BASE_URL;
  return raw.replace(/\/$/, "");
}

export const SITE = {
  name: "MyRocky",
  siteName: "MyRocky",
  titleSuffix: "| MyRocky",
  defaultDescription:
    "MyRocky is your online men's health clinic — discreet treatment for ED, hair loss, weight management, mental health and more, prescribed by licensed clinicians and delivered across the US.",
  defaultOgAlt: "MyRocky - Your Health Partner",
  baseUrl: resolveBaseUrl(),
};

const VERTICAL_KEYS = new Set([
  "home",
  "ed",
  "wl",
  "hair",
  "mental-health",
  "skincare",
  "smoking",
  "blog",
  "longevity",
]);

const CATEGORY_TO_VERTICAL = [
  { match: ["erectile", "ed", "sildenafil", "tadalafil", "viagra", "cialis"], vertical: "ed" },
  { match: ["weight", "glp", "semaglutide", "wegovy", "ozempic", "tirzepatide", "mounjaro"], vertical: "wl" },
  { match: ["hair", "finasteride", "minoxidil"], vertical: "hair" },
  { match: ["mental", "anxiety", "depression", "ssri", "therapy"], vertical: "mental-health" },
  { match: ["skin", "acne", "tretinoin", "anti-aging", "pigmentation"], vertical: "skincare" },
  { match: ["smoking", "nicotine", "zonnic"], vertical: "smoking" },
  { match: ["longevity", "nad", "metformin", "rapamycin"], vertical: "longevity" },
];

export function deriveVertical(categories) {
  if (!Array.isArray(categories) || categories.length === 0) return "home";
  const haystack = categories
    .map((c) => (typeof c === "string" ? c : c?.slug || c?.name || ""))
    .join(" ")
    .toLowerCase();
  for (const { match, vertical } of CATEGORY_TO_VERTICAL) {
    if (match.some((m) => haystack.includes(m))) return vertical;
  }
  return "home";
}

export function ogImageUrl({ title, vertical = "home", subtitle } = {}) {
  const params = new URLSearchParams();
  if (title) params.set("title", title);
  if (vertical && VERTICAL_KEYS.has(vertical)) params.set("vertical", vertical);
  if (subtitle) params.set("subtitle", subtitle);
  const qs = params.toString();
  return qs ? `/api/og?${qs}` : "/api/og";
}

function normalizeImage(image, title) {
  if (!image) return null;
  if (typeof image === "string") {
    return { url: image, width: 1200, height: 630, alt: title || SITE.defaultOgAlt };
  }
  return {
    width: 1200,
    height: 630,
    alt: title || SITE.defaultOgAlt,
    ...image,
  };
}

function stripHtml(input, max = 160) {
  if (!input) return "";
  const text = String(input)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return text.slice(0, max - 1).trimEnd() + "…";
}

function resolveCanonical({ canonicalUrl, path }) {
  if (canonicalUrl && /^https?:\/\//i.test(canonicalUrl)) {
    return canonicalUrl;
  }
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${SITE.baseUrl}${suffix}`;
}

export function buildMetadata({
  title,
  description,
  path,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  vertical,
  type = "website",
  noindex = false,
  publishedTime,
  authors,
} = {}) {
  const resolvedTitle =
    typeof title === "string" ? title : title?.absolute || title?.default || SITE.name;
  const resolvedOgTitle = ogTitle || resolvedTitle;
  const resolvedDescription = description || SITE.defaultDescription;
  const resolvedOgDescription = ogDescription || resolvedDescription;
  const resolvedImage = normalizeImage(
    ogImage || ogImageUrl({ title: resolvedOgTitle, vertical }),
    resolvedOgTitle,
  );

  const canonical = resolveCanonical({ canonicalUrl, path });

  const meta = {
    title,
    description: resolvedDescription,
    openGraph: {
      type,
      siteName: SITE.siteName,
      locale: "en_US",
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      images: [resolvedImage],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedOgTitle,
      description: resolvedOgDescription,
      images: [resolvedImage.url],
    },
    other: {
      "geo.region": "US",
      "geo.placename": "United States",
    },
  };

  if (canonical) {
    meta.alternates = { canonical };
    meta.openGraph.url = canonical;
  }

  if (type === "article") {
    if (publishedTime) meta.openGraph.publishedTime = publishedTime;
    if (authors && authors.length) meta.openGraph.authors = authors;
  }

  if (noindex) {
    meta.robots = { index: false, follow: false };
  }

  return meta;
}

export { stripHtml };
