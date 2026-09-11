import { describe, it, expect } from "vitest";

import {
  buildCategoryTags,
  buildCategoryTagsFromNames,
  collectCategoryNames,
  compareCategoryNames,
  NB_CATEGORY_SLOTS,
} from "@/lib/northbeam/categoryTags";

/**
 * Acceptance for TK-1002.
 *
 * The defect this module used to have: `item-category-N` was numbered
 * positionally over an alphabetically sorted flat union of every category
 * name in the cart, so N depended on what else was in the cart. QA measured
 * `Prescription Products` landing on slot 2 in an ED order and slot 3 in a
 * NAD+ order. Northbeam segments on the exact tag string, so the same
 * category emitting two different strings split its own segment.
 *
 * The fix: each category holds a FIXED slot from the `NB_CATEGORY_SLOTS`
 * registry, independent of the rest of the cart. An unrecognised name goes
 * into a reserved unknown band starting at 90, ordered by
 * `compareCategoryNames` among the unknown names present.
 */

describe("buildCategoryTagsFromNames: slot is a function of the category, not the cart", () => {
  it("gives Prescription Products the same slot in an ED cart, a NAD+ cart and a mixed cart", () => {
    const edCart = buildCategoryTagsFromNames(["ED", "Prescription Products", "Sex"]);
    const nadCart = buildCategoryTagsFromNames([
      "Longevity",
      "NAD",
      "Prescription Products",
      "Supplements",
    ]);
    const mixedCart = buildCategoryTagsFromNames(["ED", "Hair", "Prescription Products", "Sex"]);

    expect(edCart).toContain("item-category-1:Prescription Products");
    expect(nadCart).toContain("item-category-1:Prescription Products");
    expect(mixedCart).toContain("item-category-1:Prescription Products");
  });

  it("is independent of input order", () => {
    const forward = buildCategoryTagsFromNames(["Sex", "ED", "Prescription Products"]);
    const reversed = buildCategoryTagsFromNames(["Prescription Products", "ED", "Sex"]);
    expect(forward).toEqual(reversed);
  });
});

describe("collectCategoryNames + buildCategoryTags: reversing line items changes no index", () => {
  it("produces the same tags regardless of line item order", () => {
    const itemA = { categories: [{ name: "ED" }] };
    const itemB = { categories: [{ name: "Sex" }, { name: "Prescription Products" }] };

    const forward = buildCategoryTags([itemA, itemB]);
    const reversed = buildCategoryTags([itemB, itemA]);

    expect(forward).toEqual(reversed);
    expect(forward).toEqual([
      "item-category-1:Prescription Products",
      "item-category-2:ED",
      "item-category-3:Sex",
    ]);
  });
});

describe("buildCategoryTagsFromNames: registry slots", () => {
  it("maps every registered name to its documented slot", () => {
    for (const { slot, name } of NB_CATEGORY_SLOTS) {
      expect(buildCategoryTagsFromNames([name])).toEqual([`item-category-${slot}:${name}`]);
    }
  });

  it("matches case and whitespace variants of a known name to the same slot", () => {
    expect(buildCategoryTagsFromNames(["  prescription products  "])).toEqual([
      "item-category-1:prescription products",
    ]);
    expect(buildCategoryTagsFromNames(["PRESCRIPTION PRODUCTS"])).toEqual([
      "item-category-1:PRESCRIPTION PRODUCTS",
    ]);
  });

  it("never lets two case/whitespace variants of one known name collide on the slot", () => {
    const tags = buildCategoryTagsFromNames([
      "Prescription Products",
      "  prescription products  ",
    ]);
    expect(tags).toHaveLength(1);
    expect(tags).toEqual(["item-category-1:Prescription Products"]);
  });
});

describe("buildCategoryTagsFromNames: reserved unknown band starting at 90", () => {
  it("puts a single unrecognised name at 90", () => {
    const tags = buildCategoryTagsFromNames(["Some New Woo Term"]);
    expect(tags).toEqual(["item-category-90:Some New Woo Term"]);
  });

  it("puts two unrecognised names at 90 and 91 in compareCategoryNames order", () => {
    const tags = buildCategoryTagsFromNames(["Zeta Term", "Alpha Term"]);
    expect(tags).toEqual(["item-category-90:Alpha Term", "item-category-91:Zeta Term"]);
  });

  it("leaves the known slots untouched when unknown names are mixed in", () => {
    const tags = buildCategoryTagsFromNames(["Some New Woo Term", "ED", "Sex"]);
    expect(tags).toEqual([
      "item-category-2:ED",
      "item-category-3:Sex",
      "item-category-90:Some New Woo Term",
    ]);
  });
});

describe("buildCategoryTagsFromNames: emitted array is ordered by slot ascending", () => {
  it("orders a mixed known/unknown cart by slot number, not input or alpha order", () => {
    const tags = buildCategoryTagsFromNames([
      "Mental Health",
      "Zeta Term",
      "ED",
      "Prescription Products",
    ]);
    expect(tags).toEqual([
      "item-category-1:Prescription Products",
      "item-category-2:ED",
      "item-category-12:Mental Health",
      "item-category-90:Zeta Term",
    ]);
  });
});

describe("collectCategoryNames: duplicates collapse", () => {
  it("dedupes an identical category shared by two line items", () => {
    const items = [{ categories: [{ name: "ED" }] }, { categories: [{ name: "ED" }] }];
    expect(collectCategoryNames(items)).toEqual(["ED"]);
  });

  it("accepts bare string categories as well as {name} objects", () => {
    const items = [{ categories: ["ED", { name: "Sex" }] }];
    const names = collectCategoryNames(items);
    expect(names).toContain("ED");
    expect(names).toContain("Sex");
  });

  it("ignores blank or missing category names", () => {
    const items = [{ categories: [{ name: "" }, { name: "  " }, {}] }];
    expect(collectCategoryNames(items)).toEqual([]);
  });

  it("returns an empty array for no items", () => {
    expect(collectCategoryNames([])).toEqual([]);
    expect(collectCategoryNames(null)).toEqual([]);
  });
});

describe("buildCategoryTagsFromNames: duplicates collapse into one tag", () => {
  it("does not emit the same category name twice", () => {
    const tags = buildCategoryTagsFromNames(["ED", "ED", "Sex"]);
    expect(tags).toHaveLength(2);
    expect(tags).toEqual(["item-category-2:ED", "item-category-3:Sex"]);
  });
});

describe("compareCategoryNames: case-insensitive first, then exact", () => {
  it("sorts case-insensitively as the primary key", () => {
    expect(compareCategoryNames("apple", "Banana")).toBeLessThan(0);
    expect(compareCategoryNames("Banana", "apple")).toBeGreaterThan(0);
  });

  it("breaks a case-insensitive tie with the exact, case-sensitive value", () => {
    // "ED" and "ed" fold to the same key, so the raw string is the tiebreak.
    // Uppercase sorts before lowercase in a plain string comparison.
    expect(compareCategoryNames("ED", "ed")).toBeLessThan(0);
    expect(compareCategoryNames("ed", "ED")).toBeGreaterThan(0);
  });

  it("returns 0 for identical names", () => {
    expect(compareCategoryNames("ED", "ED")).toBe(0);
  });

  it("is a total order usable directly by Array.prototype.sort", () => {
    const names = ["weight loss", "ED", "Hair", "hair"];
    const sorted = [...names].sort(compareCategoryNames);
    // Case-insensitive groups stay together (ED before weight loss before the
    // Hair/hair pair), and the pair itself is ordered by the exact tiebreak.
    expect(sorted).toEqual(["ED", "Hair", "hair", "weight loss"]);
  });
});

describe("buildCategoryTagsFromNames: TK-1002 NAD+ is the live taxonomy name", () => {
  /**
   * The 2026-09-09 QA failure. The registry key was the literal "NAD" while
   * the live Canadian category is "NAD+". The fold is ASCII-only, so "NAD+"
   * folded to "NAD+", matched no registry entry, and fell into the unknown
   * band: Ali found order 812032 stored as item-category-90:NAD+, moving to 91
   * once another unrecognised category sorted ahead of it. These assertions
   * fail against the code before this change.
   */
  it("gives NAD+ slot 10 and keeps the taxonomy spelling as the tag value", () => {
    expect(buildCategoryTagsFromNames(["NAD+"])).toEqual(["item-category-10:NAD+"]);
  });

  it("still gives the bare NAD spelling slot 10, so no historical spelling regresses", () => {
    expect(buildCategoryTagsFromNames(["NAD"])).toEqual(["item-category-10:NAD"]);
  });

  it("keeps NAD+ at slot 10 when an unrecognised category is also present", () => {
    // This is the instability Ali reported: an unknown name used to push NAD+
    // from 90 to 91. A registry slot cannot be pushed by anything.
    const tags = buildCategoryTagsFromNames(["NAD+", "Aardvark Therapy"]);
    expect(tags).toContain("item-category-10:NAD+");
    expect(tags).toContain("item-category-90:Aardvark Therapy");
    expect(tags.join(" ")).not.toContain("item-category-91");
  });

  it("reproduces order 812032's real taxonomy at the slots Ali asked for", () => {
    // Ali's read: Longevity at 1, NAD+ at 2, Prescription Products at 3 under
    // arrival numbering. Under fixed slots they are 9, 10 and 1, and the point
    // is that these never move.
    expect(
      buildCategoryTagsFromNames(["Longevity", "NAD+", "Prescription Products"])
    ).toEqual([
      "item-category-1:Prescription Products",
      "item-category-9:Longevity",
      "item-category-10:NAD+",
    ]);
  });

  it("treats NAD+ and nad+ as one category rather than two slots", () => {
    expect(buildCategoryTagsFromNames(["NAD+", "nad+"])).toEqual([
      "item-category-10:NAD+",
    ]);
  });

  it("does not let the NAD alias leak a slot to an unrelated NAD-prefixed name", () => {
    // Alias matching is on the whole folded name, not a prefix, so a genuinely
    // different category starting with NAD still lands in the unknown band.
    expect(buildCategoryTagsFromNames(["NAD Boosters"])).toEqual([
      "item-category-90:NAD Boosters",
    ]);
  });
});
