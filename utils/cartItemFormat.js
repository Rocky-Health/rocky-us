/**
 * Helpers for normalizing data before it is handed to the cart service.
 *
 * The cart stores and displays prices in **cents** (minor units): the guest
 * cart readers (`/cart` page via localStorage, and the cart drawers via the
 * `localCart` cookie) all divide stored prices by 100, and `flowCartHandler`
 * already stores cents. Product pages work in **dollars**, so prices must be
 * converted to cents before being added to the cart.
 */

/**
 * Convert a dollar price to integer cents for the cart service.
 * @param {number|string} price - Price in dollars (number or numeric string)
 * @returns {number} Integer cents (e.g. 600 -> 60000, "29.99" -> 2999)
 */
export const toCartCents = (price) =>
  Math.round((parseFloat(price) || 0) * 100);
