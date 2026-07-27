import { SITE } from "@/lib/seo/metadata";

// Hosted brand logo (same asset used in the navbar/footer).
const LOGO_URL =
  "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp";

const SAME_AS = [
  "https://www.instagram.com/myrocky/",
  "https://www.facebook.com/people/Rocky-Health-Inc/100084461297628/",
  "https://twitter.com/myrockyca",
];

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.baseUrl,
    logo: LOGO_URL,
    sameAs: SAME_AS,
  };
}

// items: array of { name, path } — path is relative (e.g. "/blog") or absolute.
export function breadcrumbSchema(items = []) {
  const list = items.filter((it) => it && it.name && it.path);
  if (list.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((it, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: it.name,
      item: /^https?:\/\//i.test(it.path)
        ? it.path
        : `${SITE.baseUrl}${it.path.startsWith("/") ? it.path : `/${it.path}`}`,
    })),
  };
}

export function articleSchema({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
} = {}) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: authorName
      ? { "@type": "Person", name: authorName }
      : { "@type": "Organization", name: SITE.name },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      logo: { "@type": "ImageObject", url: LOGO_URL },
    },
  };

  if (description) schema.description = description;
  if (image) schema.image = [image];
  if (datePublished) schema.datePublished = datePublished;
  if (dateModified) schema.dateModified = dateModified;

  return schema;
}
