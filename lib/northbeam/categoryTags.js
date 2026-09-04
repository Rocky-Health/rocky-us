/**
 * Builds Northbeam `item-category-N:VALUE` tags with a deterministic N.
 *
 * Northbeam requires this exact syntax and told us in writing that changing the
 * syntax, the value or the numbering breaks comparability with what they already
 * store. So the format is fixed and the only thing in play is how N is assigned.
 *
 * WHY ALPHABETICAL, PROVEN RATHER THAN ASSUMED
 *
 * Inspection of the live Canadian taxonomy and thirty live products on
 * 2026-09-02 established four things:
 *
 * 1. The category hierarchy is real but only TWO levels deep, 13 roots and 27
 *    children. There is no grandparent level, so the "parent, subcategory,
 *    child" chain of three does not exist in the data.
 * 2. The several categories on one product are NOT an ancestor chain. Twelve of
 *    thirty products carry more than one ROOT category, so the usual shape is a
 *    child plus its own parent plus one or more unrelated roots. Northbeam's own
 *    example, ED then Prescription Products then Sex, is exactly that: ED is a
 *    child of Sex, and Prescription Products is a separate root cutting across.
 * 3. WooCommerce REST already returns a product's categories SORTED BY NAME. Of
 *    24 parent/child pairs sharing a product, 21 had the child before its
 *    parent. So a single line item order is already deterministic today, and
 *    already alphabetical.
 * 4. Nothing can be treating N as hierarchy depth, because the existing order
 *    has never been hierarchical.
 *
 * The instability this fixes therefore comes only from the union across line
 * items: the previous code walked line items in order and added each product's
 * categories to a Set, so on a multi item order N depended on which product
 * happened to be first in the cart.
 *
 * Sorting by name is consequently not an arbitrary choice, it is the rule
 * WooCommerce itself already applies. It leaves single item orders byte
 * identical and changes only the multi item orders that were broken. A
 * hierarchy aware ordering would have been worse on the ticket's own terms: it
 * would have to move the parent in front of the child in 21 of those 24 pairs,
 * rewriting tag positions on orders that are currently stable and correct.
 *
 * KNOWN LIMITATION, deliberately not fixed here
 *
 * Categories are deduplicated by NAME, and two names are not unique on the live
 * store: "Hair" is both a root and a child of Supplements, and so is
 * "Longevity". Those distinct categories therefore collapse into one tag and two
 * verticals are conflated in both directions. Fixing it would mean changing the
 * VALUE, which is the one thing Northbeam said breaks comparability, so it is
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
 * Case insensitive first, then exact, so the order is total.
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
 * Orders category names deterministically and renders the Northbeam tags.
 *
 * Same taxonomy input always produces the same tag strings, which is the whole
 * point of the ticket. N is 1 based to match what is already stored.
 *
 * @param {string[]} names distinct category names
 * @returns {string[]} tags such as `item-category-1:ED`
 */
export function buildCategoryTagsFromNames(names) {
  if (!Array.isArray(names)) return [];
  const distinct = [...new Set(names.map((n) => String(n).trim()).filter(Boolean))];
  distinct.sort(compareCategoryNames);
  return distinct.map(
    (name, index) => `${NB_CATEGORY_TAG_PREFIX}-${index + 1}:${name}`
  );
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
