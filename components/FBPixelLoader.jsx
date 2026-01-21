"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const PIXEL_IDS = {
  ED: process.env.NEXT_PUBLIC_FB_PIXEL_ID_ED || "522677764108011",
  WL: process.env.NEXT_PUBLIC_FB_PIXEL_ID_WL || "1451450365779499",
  SMOKING: process.env.NEXT_PUBLIC_FB_PIXEL_ID_SMOKING || "1311848663202831",
  HL: process.env.NEXT_PUBLIC_FB_PIXEL_ID_HL || "754893718769214",
  SKINCARE: process.env.NEXT_PUBLIC_FB_PIXEL_ID_SKINCARE || "1843271713209245",
  OTHERS: process.env.NEXT_PUBLIC_FB_PIXEL_ID_OTHERS || "799609076328562",
};

const ROUTE_PREFIXES = {
  ED: ["pre-ed", "ed", "ed-pre", "ed-flow", "ed-consultation", "ed-prequiz", "erectile-dysfunction", "sex"],
  WL: ["pre-wl", "wl", "wl-pre", "wl-consultation", "weight-loss", "body-optimization", "bo"],
  HL: ["hair", "hairloss", "hair-loss", "hair-main-questionnaire", "hair-pre-consultation", "hair-flow", "hair-products"],
  SMOKING: ["smoking", "smoking-consultation", "zonnic"],
  SKINCARE: ["skincare", "skin-care", "acne", "anti-aging", "anti-ageing", "hyperpigmentation", "hyper-pigmentation"],
  OTHERS: ["mental-health", "mh-quiz", "mh-pre-quiz"],
};

const CATEGORY_SLUGS = {
  ED: ["ed", "erectile-dysfunction", "sexual-health"],
  WL: ["weight-loss", "wl", "body-optimization"],
  HL: ["hair-loss", "hair", "hairloss"],
  SMOKING: ["smoking-cessation", "smoking", "zonnic"],
  SKINCARE: ["skincare", "skin-care", "acne", "anti-ageing", "anti-aging", "hyperpigmentation"],
};

const PRODUCT_KEYWORDS = {
  ED: ["cialis", "viagra", "tadalafil", "sildenafil", "variety"],
  WL: ["ozempic", "semaglutide", "tirzepatide", "mounjaro", "wegovy", "rybelsus", "weight-loss", "body-optimization"],
  HL: ["finasteride", "minoxidil", "propecia", "hair", "hair-kit"],
  SMOKING: ["zonnic", "smoking", "nicotine"],
  SKINCARE: ["acne", "anti-aging", "anti-ageing", "hyperpigmentation", "hyper-pigmentation", "skincare", "skin-care"],
};

const hasPrefixMatch = (segments, prefixes) =>
  segments.some((segment) => prefixes.some((prefix) => segment === prefix || segment.startsWith(`${prefix}-`) || segment.startsWith(prefix)));

const hasKeywordMatch = (pathname, keywords) =>
  keywords.some((keyword) => pathname.includes(keyword));

const hasCategoryMatch = (categories, categorySlugs) =>
  categories.some((category) =>
    categorySlugs.some((slug) => category === slug || category.includes(slug))
  );

const getPixelKeyForPath = (pathname, categories = []) => {
  if (!pathname) return null;
  const cleanedPath = pathname.toLowerCase();
  const segments = cleanedPath.split("/").filter(Boolean);
  const productSlug = segments[0] === "product" ? segments.slice(1).join("/") : "";
  const normalizedCategories = categories.map((category) => category.toLowerCase());

  if (normalizedCategories.length > 0) {
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.ED)) return "ED";
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.WL)) return "WL";
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.HL)) return "HL";
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.SMOKING)) return "SMOKING";
    if (hasCategoryMatch(normalizedCategories, CATEGORY_SLUGS.SKINCARE)) return "SKINCARE";
  }

  if (hasPrefixMatch(segments, ROUTE_PREFIXES.ED) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.ED)) return "ED";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.WL) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.WL)) return "WL";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.HL) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.HL)) return "HL";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.SMOKING) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.SMOKING)) return "SMOKING";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.SKINCARE) || hasKeywordMatch(productSlug, PRODUCT_KEYWORDS.SKINCARE)) return "SKINCARE";
  if (hasPrefixMatch(segments, ROUTE_PREFIXES.OTHERS)) return "OTHERS";

  return "OTHERS";
};

export default function FBPixelLoader() {
  const pathname = usePathname();
  const [resolvedPixelId, setResolvedPixelId] = useState("");

  useEffect(() => {
    let isActive = true;

    const resolvePixel = async () => {
      if (!pathname) {
        if (isActive) setResolvedPixelId("");
        return;
      }

      const cleanedPath = pathname.toLowerCase();
      if (cleanedPath.startsWith("/product/")) {
        const slug = cleanedPath.split("/").filter(Boolean)[1];
        if (slug) {
          try {
            const response = await fetch(`/api/products/${slug}/basic`, { cache: "no-store" });
            if (response.ok) {
              const data = await response.json();
              const categorySlugs = (data.categories || [])
                .map((category) => category.slug)
                .filter(Boolean);
              const pixelKey = getPixelKeyForPath(pathname, categorySlugs);
              if (isActive) {
                setResolvedPixelId(pixelKey ? PIXEL_IDS[pixelKey] : "");
              }
              return;
            }
          } catch (error) {
            // Fall back to slug-based matching if product lookup fails.
          }
        }
      }

      const pixelKey = getPixelKeyForPath(pathname);
      if (isActive) setResolvedPixelId(pixelKey ? PIXEL_IDS[pixelKey] : "");
    };

    resolvePixel();
    return () => {
      isActive = false;
    };
  }, [pathname]);

  const pixelId = resolvedPixelId;

  if (!pixelId) return null;

  return (
    <>
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>

      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
