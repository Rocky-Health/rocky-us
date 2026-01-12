import { logger } from "@/utils/devLogger";

/**
 * List of restricted states/provinces for sildenafil and tadalafil shipping (full names)
 */
export const ED_RESTRICTED_STATES = [
    "ALASKA",
    "CALIFORNIA",
    "DELAWARE",
    "HAWAII",
    "MASSACHUSETTS",
    "NEW HAMPSHIRE",
    "NEW MEXICO",
    "NORTH CAROLINA",
    "RHODE ISLAND",
    "VERMONT",
];

/**
 * Mapping of state codes to full state names for ED restricted states
 */
export const ED_RESTRICTED_STATE_CODES = {
    AK: "ALASKA",
    CA: "CALIFORNIA",
    DE: "DELAWARE",
    HI: "HAWAII",
    MA: "MASSACHUSETTS",
    NH: "NEW HAMPSHIRE",
    NM: "NEW MEXICO",
    NC: "NORTH CAROLINA",
    RI: "RHODE ISLAND",
    VT: "VERMONT",
};

/**
 * List of restricted states/provinces for Ozempic, Mounjaro, Wegovy, and Rybelsus shipping (full names)
 */
export const WL_RESTRICTED_STATES = [
    "ARKANSAS",
    "INDIANA",
    "MINNESOTA",
    "SOUTH CAROLINA",
];

/**
 * Mapping of state codes to full state names for WL restricted states
 */
export const WL_RESTRICTED_STATE_CODES = {
    AR: "ARKANSAS",
    IN: "INDIANA",
    MN: "MINNESOTA",
    SC: "SOUTH CAROLINA",
};

// Combined list for backward compatibility
export const RESTRICTED_STATES = [...ED_RESTRICTED_STATES, ...WL_RESTRICTED_STATES];
export const RESTRICTED_STATE_CODES = {
    ...ED_RESTRICTED_STATE_CODES,
    ...WL_RESTRICTED_STATE_CODES,
};

/**
 * Check if a state/province is restricted for ED product shipping
 * Handles both state codes (e.g., "MA") and full names (e.g., "MASSACHUSETTS")
 * @param {string} state - State or province name or code (case-insensitive)
 * @returns {boolean} True if the state is restricted for ED products
 */
export const isEdStateRestricted = (state) => {
    if (!state) {
        logger.log("[ED Restriction] No state provided for restriction check");
        return false;
    }

    const normalizedState = state.toUpperCase().trim();

    // Check if it's a state code first
    if (ED_RESTRICTED_STATE_CODES[normalizedState]) {
        logger.log(
            `[ED Restriction] State code "${normalizedState}" is restricted (maps to ${ED_RESTRICTED_STATE_CODES[normalizedState]})`
        );
        return true;
    }

    // Check if it's a full state name
    const isRestricted = ED_RESTRICTED_STATES.includes(normalizedState);
    if (isRestricted) {
        logger.log(
            `[ED Restriction] State "${normalizedState}" is restricted`
        );
    } else {
        logger.log(
            `[ED Restriction] State "${normalizedState}" is NOT restricted`
        );
    }
    return isRestricted;
};

/**
 * Check if a state/province is restricted for WL product (Ozempic/Mounjaro/Wegovy/Rybelsus) shipping
 * Handles both state codes (e.g., "AR") and full names (e.g., "ARKANSAS")
 * @param {string} state - State or province name or code (case-insensitive)
 * @returns {boolean} True if the state is restricted for WL products
 */
export const isWlStateRestricted = (state) => {
    if (!state) {
        logger.log("[WL Restriction] No state provided for restriction check");
        return false;
    }

    const normalizedState = state.toUpperCase().trim();

    // Check if it's a state code first
    if (WL_RESTRICTED_STATE_CODES[normalizedState]) {
        logger.log(
            `[WL Restriction] State code "${normalizedState}" is restricted (maps to ${WL_RESTRICTED_STATE_CODES[normalizedState]})`
        );
        return true;
    }

    // Check if it's a full state name
    const isRestricted = WL_RESTRICTED_STATES.includes(normalizedState);
    if (isRestricted) {
        logger.log(
            `[WL Restriction] State "${normalizedState}" is restricted`
        );
    } else {
        logger.log(
            `[WL Restriction] State "${normalizedState}" is NOT restricted`
        );
    }
    return isRestricted;
};

/**
 * Check if a state/province is restricted for any product shipping
 * Handles both state codes and full names, checks all restriction lists
 * @param {string} state - State or province name or code (case-insensitive)
 * @returns {boolean} True if the state is restricted
 */
export const isStateRestricted = (state) => {
    if (!state) {
        logger.log("[Restriction] No state provided for restriction check");
        return false;
    }

    const normalizedState = state.toUpperCase().trim();

    // Check if it's a state code first
    if (RESTRICTED_STATE_CODES[normalizedState]) {
        logger.log(
            `[Restriction] State code "${normalizedState}" is restricted (maps to ${RESTRICTED_STATE_CODES[normalizedState]})`
        );
        return true;
    }

    // Check if it's a full state name
    const isRestricted = RESTRICTED_STATES.includes(normalizedState);
    if (isRestricted) {
        logger.log(
            `[Restriction] State "${normalizedState}" is restricted`
        );
    } else {
        logger.log(
            `[Restriction] State "${normalizedState}" is NOT restricted`
        );
    }
    return isRestricted;
};

/**
 * Check if a product name contains sildenafil or tadalafil
 * @param {string} productName - Product name to check
 * @returns {boolean} True if product contains sildenafil or tadalafil
 */
export const isEdRestrictedProduct = (productName) => {
    if (!productName) return false;

    const normalizedName = productName.toUpperCase();

    // Check for sildenafil (including Viagra)
    const hasSildenafil =
        normalizedName.includes("SILDENAFIL") ||
        normalizedName.includes("VIAGRA");

    // Check for tadalafil (including Cialis)
    const hasTadalafil =
        normalizedName.includes("TADALAFIL") ||
        normalizedName.includes("CIALIS");

    return hasSildenafil || hasTadalafil;
};

/**
 * Check if a product name contains Ozempic, Mounjaro, Wegovy, or Rybelsus
 * @param {string} productName - Product name to check
 * @returns {boolean} True if product contains Ozempic, Mounjaro, Wegovy, or Rybelsus
 */
export const isWlRestrictedProduct = (productName) => {
    if (!productName) return false;

    const normalizedName = productName.toUpperCase();

    // Check for Ozempic
    const hasOzempic = normalizedName.includes("OZEMPIC");

    // Check for Mounjaro
    const hasMounjaro = normalizedName.includes("MONJARO") || normalizedName.includes("MOUNJARO");

    // Check for Wegovy
    const hasWegovy = normalizedName.includes("WEGOVY");

    // Check for Rybelsus
    const hasRybelsus = normalizedName.includes("RYBELSUS");

    return hasOzempic || hasMounjaro || hasWegovy || hasRybelsus;
};

/**
 * Check if a product slug indicates sildenafil or tadalafil
 * @param {string} slug - Product slug to check
 * @returns {boolean} True if slug indicates restricted ED product
 */
export const isEdRestrictedSlug = (slug) => {
    if (!slug) return false;

    const normalizedSlug = slug.toLowerCase();
    return (
        normalizedSlug.includes("sildenafil") ||
        normalizedSlug.includes("tadalafil") ||
        normalizedSlug.includes("viagra") ||
        normalizedSlug.includes("cialis")
    );
};

/**
 * Check if a product slug indicates Ozempic, Mounjaro, Wegovy, or Rybelsus
 * @param {string} slug - Product slug to check
 * @returns {boolean} True if slug indicates restricted WL product
 */
export const isWlRestrictedSlug = (slug) => {
    if (!slug) return false;

    const normalizedSlug = slug.toLowerCase();
    return (
        normalizedSlug.includes("ozempic") ||
        normalizedSlug.includes("monjaro") ||
        normalizedSlug.includes("mounjaro") ||
        normalizedSlug.includes("wegovy") ||
        normalizedSlug.includes("rybelsus")
    );
};

/**
 * Check if a cart item is a restricted ED product
 * @param {Object} cartItem - Cart item object with name, sku, or other identifiers
 * @returns {boolean} True if the cart item is a restricted ED product
 */
export const isRestrictedEdCartItem = (cartItem) => {
    if (!cartItem) return false;

    // Check product name
    if (cartItem.name && isEdRestrictedProduct(cartItem.name)) {
        return true;
    }

    // Check SKU if available
    if (cartItem.sku) {
        const skuUpper = cartItem.sku.toUpperCase();
        if (
            skuUpper.includes("SILDENAFIL") ||
            skuUpper.includes("TADALAFIL") ||
            skuUpper.includes("VIAGRA") ||
            skuUpper.includes("CIALIS")
        ) {
            return true;
        }
    }

    // Check product slug if available
    if (cartItem.slug && isEdRestrictedSlug(cartItem.slug)) {
        return true;
    }

    return false;
};

/**
 * Check if a cart item is a restricted WL product (Ozempic/Mounjaro/Wegovy/Rybelsus)
 * @param {Object} cartItem - Cart item object with name, sku, or other identifiers
 * @returns {boolean} True if the cart item is a restricted WL product
 */
export const isRestrictedWlCartItem = (cartItem) => {
    if (!cartItem) return false;

    // Check product name
    if (cartItem.name && isWlRestrictedProduct(cartItem.name)) {
        return true;
    }

    // Check SKU if available
    if (cartItem.sku) {
        const skuUpper = cartItem.sku.toUpperCase();
        if (
            skuUpper.includes("OZEMPIC") ||
            skuUpper.includes("MONJARO") ||
            skuUpper.includes("MOUNJARO") ||
            skuUpper.includes("WEGOVY") ||
            skuUpper.includes("RYBELSUS")
        ) {
            return true;
        }
    }

    // Check product slug if available
    if (cartItem.slug && isWlRestrictedSlug(cartItem.slug)) {
        return true;
    }

    return false;
};

/**
 * Check if a cart item is a restricted product (ED or WL)
 * @param {Object} cartItem - Cart item object with name, sku, or other identifiers
 * @returns {boolean} True if the cart item is a restricted product
 */
export const isRestrictedCartItem = (cartItem) => {
    return isRestrictedEdCartItem(cartItem) || isRestrictedWlCartItem(cartItem);
};

/**
 * Check if user's state/province is restricted for ED products and if product is a restricted ED product
 * @param {string} state - User's state or province
 * @param {Object|string} product - Product object or product name
 * @returns {boolean} True if both state and product are restricted
 */
export const checkEdShippingRestriction = (state, product) => {
    // Check if state is restricted for ED products
    if (!isEdStateRestricted(state)) {
        return false;
    }

    // Check if product is a restricted ED product
    let productName = "";
    if (typeof product === "string") {
        productName = product;
    } else if (product && product.name) {
        productName = product.name;
    } else if (product && product.slug) {
        // If we only have slug, check it
        return isEdRestrictedSlug(product.slug);
    }

    if (!productName) {
        return false;
    }

    return isEdRestrictedProduct(productName);
};

/**
 * Check if user's state/province is restricted for WL products and if product is a restricted WL product
 * @param {string} state - User's state or province
 * @param {Object|string} product - Product object or product name
 * @returns {boolean} True if both state and product are restricted
 */
export const checkWlShippingRestriction = (state, product) => {
    // Check if state is restricted for WL products
    if (!isWlStateRestricted(state)) {
        return false;
    }

    // Check if product is a restricted WL product
    let productName = "";
    if (typeof product === "string") {
        productName = product;
    } else if (product && product.name) {
        productName = product.name;
    } else if (product && product.slug) {
        // If we only have slug, check it
        return isWlRestrictedSlug(product.slug);
    }

    if (!productName) {
        return false;
    }

    return isWlRestrictedProduct(productName);
};

/**
 * Check if user's state/province is restricted for a product (ED or WL)
 * @param {string} state - User's state or province
 * @param {Object|string} product - Product object or product name
 * @returns {boolean} True if both state and product are restricted
 */
export const checkShippingRestriction = (state, product) => {
    return (
        checkEdShippingRestriction(state, product) ||
        checkWlShippingRestriction(state, product)
    );
};

/**
 * Get user's state/province from profile data
 * @param {Object} profileData - User profile data
 * @returns {string} State or province name
 */
export const getUserState = (profileData) => {
    if (!profileData) return "";

    // Priority: shipping_state > billing_state > province
    return (
        profileData.shipping_state ||
        profileData.billing_state ||
        profileData.province ||
        ""
    );
};

