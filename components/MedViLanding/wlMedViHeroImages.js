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
        src: "https://myrocky.b-cdn.net/WP%20Images/wl-med/Hero%20-%2002.jpg",
        alt: "MyRocky weight loss patient",
        variant: "tall",
    },
    {
        id: "leftBottom",
        src: "https://myrocky.b-cdn.net/WP%20Images/wl-med/Hero%20-%2004.jpg",
        alt: "MyRocky weight loss patient",
        variant: "wide",
    },
    {
        id: "centerSmall",
        src: "https://myrocky.b-cdn.net/WP%20Images/wl-med/Hero%20-%2005.jpg",
        alt: "MyRocky weight loss patient",
        variant: "square",
    },
    {
        id: "centerTall",
        src: "https://myrocky.b-cdn.net/WP%20Images/wl-med/Hero%20-%2006.jpg",
        alt: "MyRocky weight loss patient",
        variant: "tallMid",
    },
    {
        id: "centerVeryTall",
        src: "https://myrocky.b-cdn.net/WP%20Images/wl-med/Hero%20-%2007.jpg",
        alt: "MyRocky weight loss patient",
        variant: "veryTall",
    },
    {
        id: "rightTop",
        src: "https://myrocky.b-cdn.net/WP%20Images/wl-med/Hero%20-%2003.jpg",
        alt: "MyRocky weight loss patient",
        variant: "tall",
    },
    {
        id: "rightBottom",
        src: "https://myrocky.b-cdn.net/WP%20Images/wl-med/Hero%20-%2008.jpg",
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
