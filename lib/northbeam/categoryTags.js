/**
 * Builds Northbeam `item-category-N:VALUE` tags with a deterministic, FIXED N.
 *
 * Northbeam requires this exact syntax and told us in writing that changing the
 * syntax, the value or the numbering breaks comparability with what they already
 * store. So the format is fixed, and N is now the category's own anchored slot
 * number rather than a position computed from whatever else happens to be in
 * the cart.
 *
 * WHY FIXED SLOTS, REPLACING THE ALPHABETICAL SCHEME
 *
 * The alphabetical scheme this replaces sorted the flat union of every
 * category name present across all line items and numbered positionally. That
 * made a category's slot depend on the rest of the cart: QA measured
 * `Prescription Products` landing on slot 2 in an ED order and slot 3 in a
 * NAD+ order. Northbeam segments on the exact tag string, so one category
 * emitting two different strings split its own segment.
 *
 * The ruling: each category holds a FIXED slot number regardless of what else
 * is in the cart. `NB_CATEGORY_SLOTS` below is that assignment. It is frozen
 * and identical in both storefronts (CA, US) and in the WordPress Relay's own
 * copy of the same table. Do not reorder, renumber, or "improve" it here
 * without updating all three in lockstep.
 *
 * An unrecognised category name, a WooCommerce term the registry does not
 * know about, is never allowed to displace a known slot. Instead it goes into
 * a reserved UNKNOWN band starting at 90, assigned in `compareCategoryNames`
 * order among the unknown names present on that cart: first unknown 90,
 * second 91, and so on, with no upper cap. A new term can therefore never
 * collide with the fixed registry, and a slot of 90 or higher is visibly an
 * unknown by its number alone.
 *
 * THE DISCONTINUITY THIS INTRODUCES, STATED PLAINLY
 *
 * Orders written before this change carry cart relative numbering. Orders
 * written after it carry anchored numbering. A Northbeam segment keyed on a
 * numbered `item-category-N` tag therefore has exactly one discontinuity, at
 * the deploy boundary. That is a known, accepted consequence of fixing the
 * underlying defect, not a risk to hedge against.
 *
 * KNOWN LIMITATION, deliberately not fixed here
 *
 * Categories are deduplicated by folded name (case and whitespace
 * insensitive), and two names are not unique on the live store: "Hair" is
 * both a root and a child of Supplements, and so is "Longevity". Those
 * distinct categories therefore collapse into one tag and two verticals are
 * conflated in both directions. Fixing it would mean changing the VALUE,
 * which is the one thing Northbeam said breaks comparability, so it is
 * recorded rather than corrected. The `{id, name, slug}` triple is already
 * available to callers if that trade is ever revisited.
 */

/** The tag prefix Northbeam keys on. Not configurable: they match exact strings. */
export const NB_CATEGORY_TAG_PREFIX = "item-category";

/** Fold a-z to A-Z and nothing else. Deliberately not toUpperCase(): locale free. */
function asciiUpper(value) {
  return String(value).replace(/[a-z]/g, (c) => c.toUpperCase());
}

/**
 * The frozen category to slot registry, ticket TK-1002.
 *
 * These numbers are the internal taxonomy decision (Northbeam confirmed the
 * `item-category-N:VALUE` syntax must stay, and that the slot assignment
 * itself is ours to make). They are identical in both storefronts and in the
 * PHP Relay's own table. Never reorder or renumber an existing entry: that
 * would reproduce the exact defect this fix closes, just moved from
 * cart-composition to code-version. Appending a brand new vertical at the
 * next free number is fine; changing an existing one is not.
 */
export const NB_CATEGORY_SLOTS = Object.freeze([
  { slot: 1, name: "Prescription Products" },
  { slot: 2, name: "ED" },
  { slot: 3, name: "Sex" },
  { slot: 4, name: "Weight Loss" },
  { slot: 5, name: "Body Optimization" },
  { slot: 6, name: "Hair" },
  { slot: 7, name: "Skincare" },
  { slot: 8, name: "Smoking Cessation" },
  { slot: 9, name: "Longevity" },
  { slot: 10, name: "NAD" },
  { slot: 11, name: "Supplements" },
  { slot: 12, name: "Mental Health" },
]);

/** First slot number available to a name the registry above does not recognise. */
const UNKNOWN_CATEGORY_SLOT_START = 90;

/**
 * Lookup from a folded, trimmed registry name to its frozen slot. Built once
 * from `NB_CATEGORY_SLOTS` using the same `asciiUpper` fold callers are
 * matched against, so registry membership and cart-name matching can never
 * disagree with each other.
 */
const KNOWN_SLOT_BY_FOLDED_NAME = new Map(
  NB_CATEGORY_SLOTS.map(({ slot, name }) => [asciiUpper(name.trim()), slot])
);

/**
 * Orders names within the reserved UNKNOWN band. Case insensitive first, then
 * exact, so the order is total.
 *
 * Before the fixed-slot ruling this comparator ordered the WHOLE category set
 * and its output position was N itself. It no longer does that: a known
 * category gets its slot from the `NB_CATEGORY_SLOTS` registry above, and
 * this comparator's only remaining job is to give a deterministic order to
 * whichever unrecognised names are present, so the first one seen (in this
 * order) gets 90, the second 91, and so on. It stays exported and its
 * behaviour is unchanged; only what it gets used FOR has narrowed.
 *
 * WHY NOT localeCompare, WHICH IS WHAT THIS USED TO DO.
 *
 * The tags this produces are now built in TWO languages: here, and in
 * `source_tags()`/`compare_category_names()` inside the WordPress Relay, which
 * is the canonical writer. Northbeam replaces `order_tags` as a whole array and
 * keeps the last write, so if the two comparators disagree about any pair of
 * names the tag indices flip on every alternate write and the vendor sees an
 * order whose categories renumber themselves.
 *
 * `localeCompare` resolves through ICU, which treats punctuation and spacing as
 * ignorable at the primary strength. No PHP comparator reproduces that without
 * pulling in the intl extension, which is not guaranteed on the WordPress host.
 * So the comparator is defined as the thing both languages can implement
 * identically: fold a-z to A-Z, compare, then compare raw as the tiebreak.
 *
 * The trade is deliberate and worth stating. This is no longer exactly MySQL's
 * `utf8mb4` case insensitive collation, which is what WooCommerce itself sorts
 * by. For the live taxonomy it makes no difference: the 13 roots and 27
 * children are ASCII, and the original finding that single line item orders
 * were already alphabetical still holds. A non-ASCII category name would sort
 * by UTF-16 code units here and by UTF-8 bytes in PHP; those agree for the
 * Basic Multilingual Plane below U+10000 and this comment is the record that
 * they are not guaranteed to agree above it.
 *
 * Cross-language determinism beats collation fidelity here, because a wrong
 * order is stable and a disagreeing order is not.
 */
export function compareCategoryNames(a, b) {
  const left = String(a);
  const right = String(b);

  const foldedLeft = asciiUpper(left);
  const foldedRight = asciiUpper(right);
  if (foldedLeft !== foldedRight) return foldedLeft < foldedRight ? -1 : 1;

  return left < right ? -1 : left > right ? 1 : 0;
}

/**
 * Collects the distinct category names from a set of line items.
 *
 * Accepts either shape the callers use: a line item already enriched with a
 * `categories` array, or a fetched product with the same. Entries may be
 * `{ name }` objects or bare strings, matching what the existing code tolerated.
 *
 * @param {Array} items line items or products carrying `categories`
 * @returns {string[]} distinct names, unordered
 */
export function collectCategoryNames(items) {
  const names = new Set();
  if (!Array.isArray(items)) return [];

  for (const item of items) {
    const categories = item && Array.isArray(item.categories) ? item.categories : [];
    for (const category of categories) {
      const name =
        typeof category === "string"
          ? category
          : category && typeof category.name === "string"
            ? category.name
            : "";
      const trimmed = name.trim();
      if (trimmed) names.add(trimmed);
    }
  }

  return [...names];
}

/**
 * Assigns each name its fixed registry slot, or, for a name the registry does
 * not recognise, the next free slot in the reserved unknown band starting at
 * 90, and renders the Northbeam tags in slot order.
 *
 * Same taxonomy input always produces the same tag strings, which is the
 * whole point of the ticket. A known name always resolves to its registry
 * slot. An unknown name always resolves to the same slot as any other run
 * over the same cart, because the unknown band is assigned in
 * `compareCategoryNames` order, not arrival order.
 *
 * Two names that fold to the same identity (case and/or whitespace only
 * apart) are the same category and must never occupy two slots, so they are
 * deduped by that folded identity before slots are assigned, the same way
 * the previous code deduped before numbering, just keyed on the fold instead
 * of the exact string. The first-seen (trimmed) spelling is kept as the tag
 * VALUE.
 *
 * @param {string[]} names distinct-or-not category names
 * @returns {string[]} tags such as `item-category-1:ED`, ordered by slot ascending
 */
export function buildCategoryTagsFromNames(names) {
  if (!Array.isArray(names)) return [];

  const seenFolded = new Set();
  const distinct = [];
  for (const raw of names) {
    const trimmed = String(raw).trim();
    if (!trimmed) continue;
    const folded = asciiUpper(trimmed);
    if (seenFolded.has(folded)) continue;
    seenFolded.add(folded);
    distinct.push(trimmed);
  }

  const unknownNamesInOrder = distinct
    .filter((name) => !KNOWN_SLOT_BY_FOLDED_NAME.has(asciiUpper(name)))
    .sort(compareCategoryNames);

  const unknownSlotByFoldedName = new Map(
    unknownNamesInOrder.map((name, index) => [
      asciiUpper(name),
      UNKNOWN_CATEGORY_SLOT_START + index,
    ])
  );

  const withSlots = distinct.map((name) => {
    const folded = asciiUpper(name);
    const slot = KNOWN_SLOT_BY_FOLDED_NAME.get(folded) ?? unknownSlotByFoldedName.get(folded);
    return { name, slot };
  });

  withSlots.sort((left, right) => left.slot - right.slot);

  return withSlots.map(({ name, slot }) => `${NB_CATEGORY_TAG_PREFIX}-${slot}:${name}`);
}

/**
 * The whole path in one call, for a caller holding line items.
 *
 * @param {Array} items line items or products carrying `categories`
 * @returns {string[]} ordered Northbeam category tags
 */
export function buildCategoryTags(items) {
  return buildCategoryTagsFromNames(collectCategoryNames(items));
}
