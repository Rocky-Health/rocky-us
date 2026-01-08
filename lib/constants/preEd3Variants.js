/**
 * A/B Testing Variants Configuration for /pre-ed3
 *
 * This file defines all 6 variations (3 taglines × 2 images)
 * Each variation object contains the tagline, image URLs, and layout type
 *
 * Layout types:
 * - "centered": Desktop text centered, mobile text top (for Hero1 images)
 * - "left": Desktop text left, mobile text top (for Hero2 images)
 */

export const PRE_ED3_VARIANTS = [
  {
    id: 1,
    titleLine1: "Make Her Fall In Love With Your......",
    titleLine2: "You Know",
    desktopImage: "https://myrocky.b-cdn.net/WP%20Images/Hero1Desktop.jpg",
    mobileImage: "https://myrocky.b-cdn.net/WP%20Images/Hero1Mobile.jpg",
    layout: "centered",
  },
  {
    id: 2,
    titleLine1: "Make Her Fall In Love With Your......",
    titleLine2: "You Know",
    desktopImage: "https://myrocky.b-cdn.net/WP%20Images/Hero2Desktop.jpg",
    mobileImage: "https://myrocky.b-cdn.net/WP%20Images/Hero2Mobile.jpg",
    layout: "left",
  },
  {
    id: 3,
    titleLine1: "Get Hard & Make Her Fall in Love",
    titleLine2: "Even More",
    desktopImage: "https://myrocky.b-cdn.net/WP%20Images/Hero1Desktop.jpg",
    mobileImage: "https://myrocky.b-cdn.net/WP%20Images/Hero1Mobile.jpg",
    layout: "centered",
  },
  {
    id: 4,
    titleLine1: "Get Hard & Make Her Fall in Love",
    titleLine2: "Even More",
    desktopImage: "https://myrocky.b-cdn.net/WP%20Images/Hero2Desktop.jpg",
    mobileImage: "https://myrocky.b-cdn.net/WP%20Images/Hero2Mobile.jpg",
    layout: "left",
  },
  {
    id: 5,
    titleLine1: "Not Feeling As Hard?",
    titleLine2: "Let Rocky Help.",
    desktopImage: "https://myrocky.b-cdn.net/WP%20Images/Hero1Desktop.jpg",
    mobileImage: "https://myrocky.b-cdn.net/WP%20Images/Hero1Mobile.jpg",
    layout: "centered",
  },
  {
    id: 6,
    titleLine1: "Not Feeling As Hard?",
    titleLine2: "Let Rocky Help.",
    desktopImage: "https://myrocky.b-cdn.net/WP%20Images/Hero2Desktop.jpg",
    mobileImage: "https://myrocky.b-cdn.net/WP%20Images/Hero2Mobile.jpg",
    layout: "left",
  },
];

/**
 * Get a variant by ID
 * @param {number} id - Variant ID (1-6)
 * @returns {Object|null} Variant object or null if not found
 */
export function getVariantById(id) {
  return PRE_ED3_VARIANTS.find((variant) => variant.id === id) || null;
}

/**
 * Get total number of variants
 * @returns {number} Total number of variants
 */
export function getVariantCount() {
  return PRE_ED3_VARIANTS.length;
}
