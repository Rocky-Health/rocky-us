/**
 * Turns the persisted `_nb_*` order meta back into Northbeam source tags.
 *
 * THIS IS THE READER TK-1026 BUILT THE RESERVOIR FOR.
 *
 * TK-1026 persists fourteen `_nb_*` keys onto every checkout order, because utm
 * parameters, click ids, the landing page and the original referrer only ever
 * existed in the shopper's browser session and no server side writer could see
 * them. It shipped, and then nothing read it: a grep for those keys outside the
 * module that writes them returned only that module's own comments. Meanwhile
 * `backfill/route.js` kept sending `order_tags: [status, lifecycle]`, and since
 * the vendor replaces the array on every write and keeps the last one, the
 * hourly sync went on destroying attribution once an hour in both regions.
 *
 * So the reservoir existed and no writer drank from it. This is that reader.
 *
 * TAG SHAPES ARE NOT NEW. They match what `utils/northbeamEvents.js` has always
 * emitted from the browser, character for character, so the cutover changes
 * which writer produces a tag and whether it survives, not what it looks like.
 * The PHP twin of this function is `source_tags()` in the Relay; the two must
 * stay in step.
 */

import { orderMetaValue } from "./orderTags";

/** The utm fields carried through, in the fixed order TK-1026 persists them. */
export const NB_UTM_TAG_FIELDS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
];

/**
 * Build the source half of the canonical tag array from a WooCommerce order.
 *
 * @param {object} order a WooCommerce REST order carrying meta_data
 * @returns {string[]} tags such as `source:google`, `utm_medium:cpc`
 */
export function buildSourceTagsFromOrder(order) {
  const get = (key) => orderMetaValue(order, key);
  const tags = [];

  const sourceName = get("_nb_source_name");
  if (sourceName) tags.push(`source:${sourceName}`);

  for (const field of NB_UTM_TAG_FIELDS) {
    const value = get(`_nb_${field}`);
    if (value) tags.push(`${field}:${value}`);
  }

  const referrerDomain = get("_nb_referrer_domain");
  if (referrerDomain) tags.push(`referrer:${referrerDomain}`);

  // AWIN is an affiliate contract with its own keys and predates the `_nb_*`
  // convention. `source:AWIN` is emitted only when nothing else has claimed the
  // source axis: two conflicting `source:` tags on one order is worse than one
  // imperfect one, and the previous backfill mapper pushed `source:AWIN`
  // unconditionally alongside whatever the browser had already recorded.
  const awinAwc = get("_awin_awc");
  if (awinAwc) {
    if (!sourceName) tags.push("source:AWIN");
    tags.push(`awin_awc:${awinAwc}`);
  }
  const awinChannel = get("_awin_channel");
  if (awinChannel) tags.push(`awin_channel:${awinChannel}`);

  return tags;
}

/**
 * Whether an order carries any persisted attribution at all.
 *
 * Useful for logging the difference between "this order has no attribution"
 * and "this writer did not look", which is the distinction that let the bleed
 * run unnoticed for as long as it did.
 */
export function hasPersistedAttribution(order) {
  if (!Array.isArray(order?.meta_data)) return false;
  return order.meta_data.some(
    (m) => typeof m?.key === "string" && m.key.startsWith("_nb_") && String(m?.value ?? "") !== ""
  );
}
