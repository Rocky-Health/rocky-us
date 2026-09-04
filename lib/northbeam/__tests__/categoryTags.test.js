import { describe, it, expect } from "vitest";

import {
  buildCategoryTags,
  buildCategoryTagsFromNames,
  collectCategoryNames,
  compareCategoryNames,
} from "@/lib/northbeam/categoryTags";

/**
 * Acceptance for TK-1002.
 *
 * The defect this module exists to close: the previous code walked line items
 * in cart order and added each product's categories to a Set, so on a multi
 * item order the N in item-category-N depended on which product happened to
 * be first in the cart. This module fixes N deterministically by sorting the
 * category names, matching what WooCommerce REST already returns for a single
 * product's own categories.
 */

describe("buildCategoryTagsFromNames: ordering", () => {
  it("is independent of input order", () => {
    const forward = buildCategoryTagsFromNames(["Sex", "ED", "Prescription Products"]);
    const reversed = buildCategoryTagsFromNames(["Prescription Products", "ED", "Sex"]);
    expect(forward).toEqual(reversed);
  });

  it("assigns N=1 to the alphabetically first name", () => {
    const tags = buildCategoryTagsFromNames(["Weight Loss", "ED", "Hair"]);
    expect(tags[0]).toBe("item-category-1:ED");
    expect(tags[1]).toBe("item-category-2:Hair");
    expect(tags[2]).toBe("item-category-3:Weight Loss");
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
      "item-category-1:ED",
      "item-category-2:Prescription Products",
      "item-category-3:Sex",
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
    expect(tags).toEqual(["item-category-1:ED", "item-category-2:Sex"]);
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
