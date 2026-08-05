/**
 * TikTok content privacy helpers.
 * Never send clinical / prescription / condition / medication labels to TikTok.
 *
 * Aligns with Meta purchase custom_data:
 *   - omit content_name + content_category
 *   - keep content_ids / content_id only
 *   - Purchase description allowed only as "Order #<id>"
 *   - vertical split uses internal gateway codes (ED/WL/HL/…), not WC cat.name
 *
 * Same scheme as CA rocky-headless. Local notes also in
 * docs/ad-platform-content-obfuscation.md (docs/ is gitignored in this repo).
 */

const SAFE_DESCRIPTION = /^Order #\d+$/i;

/** Fields that must never reach TikTok (browser or CAPI). */
export const TIKTOK_BLOCKED_CONTENT_KEYS = [
  'content_category',
  'content_name',
];

/**
 * Strip clinical content labels from a TikTok browser / dataLayer payload.
 * Allows description only when it is a neutral Order #N string.
 */
export function sanitizeTikTokEventData(eventData = {}) {
  const cleaned = { ...eventData };

  for (const key of TIKTOK_BLOCKED_CONTENT_KEYS) {
    delete cleaned[key];
  }

  if (
    cleaned.description != null &&
    !SAFE_DESCRIPTION.test(String(cleaned.description))
  ) {
    delete cleaned.description;
  }

  return cleaned;
}

/**
 * Strip content_name (and any other blocked keys) from CAPI contents[].
 */
export function sanitizeTikTokContents(contents = []) {
  if (!Array.isArray(contents)) return [];

  return contents.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const cleaned = { ...item };
    for (const key of TIKTOK_BLOCKED_CONTENT_KEYS) {
      delete cleaned[key];
    }
    delete cleaned.description;
    return cleaned;
  });
}
