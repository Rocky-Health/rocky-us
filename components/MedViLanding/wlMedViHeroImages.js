/**
 * Hero mosaic — set `src` to your CDN/local paths when assets are ready.
 *
 * Layout (desktop): CSS Grid `repeat(5, 1fr)`
 * - Row 1: leftTop | checklist + CTA (cols 2–4) | rightTop
 * - Row 2: leftBottom | centerSmall | centerTall | centerVeryTall | rightBottom
 *
 * @typedef {"tall"|"wide"|"square"|"tallMid"|"veryTall"|"small"} WlMedViHeroImageVariant
 * @typedef {{ id: string, src: string, alt: string, variant: WlMedViHeroImageVariant }} WlMedViHeroImage
 */

/** @type {WlMedViHeroImage[]} */
export const WL_MEDVI_HERO_IMAGES = [
  {
    id: "leftTop",
    src: "/medvi/hero-grid-9.jpg",
    alt: "MyRocky weight loss patient",
    variant: "tall",
  },
  {
    id: "leftBottom",
    src: "/medvi/reviews-img-4.jpg",
    alt: "MyRocky weight loss patient",
    variant: "wide",
  },
  {
    id: "centerSmall",
    src: "/medvi/hero-grid-4.jpg",
    alt: "MyRocky weight loss patient",
    variant: "square",
  },
  {
    id: "centerTall",
    src: "/medvi/hero-grid-3.jpg",
    alt: "MyRocky weight loss patient",
    variant: "tallMid",
  },
  {
    id: "centerVeryTall",
    src: "/medvi/hero-grid-8.jpg",
    alt: "MyRocky weight loss patient",
    variant: "veryTall",
  },
  {
    id: "rightTop",
    src: "/medvi/hero-grid-6b.jpg",
    alt: "MyRocky weight loss patient",
    variant: "tall",
  },
  {
    id: "rightBottom",
    src: "/medvi/change-grid-4_1.jpg",
    alt: "MyRocky weight loss patient",
    variant: "small",
  },
];

/** @param {WlMedViHeroImage[]} [images] */
export function wlMedViHeroImageMap(images = WL_MEDVI_HERO_IMAGES) {
  return Object.fromEntries(images.map((item) => [item.id, item]));
}

/** Mobile grid order (two-column masonry-style read order). */
export const WL_MEDVI_HERO_MOBILE_ORDER = [
  "leftTop",
  "rightTop",
  "leftBottom",
  "centerSmall",
  "centerTall",
  "centerVeryTall",
  "rightBottom",
];
