// Route configuration for layout customization
// Add any routes that should not show the default header and footer

export const layoutExemptRoutes = [
    "/ed-prelander",
    "/ed-prelander2",
    "/ed-prelander5",
    "/checkout",
    "/ed-pre-consultation-quiz",
    "/wl-pre-consultation",
    "/wl-pre-consultation-2",
    "/glp2-pre-consultation",
    "/wl-offer-pre-consultation",
    "/ed-consultation-quiz",
    "/nad-consultation-quiz",
    "/hair-pre-consultation-quiz", // Added hair pre-consultation quiz
    "/hair-main-questionnaire", // Added hair main questionnaire
    "/mh-pre-quiz", // Added mental health pre-quiz
    "/mh-quiz", // Added mental health quiz
    "/pre-ed1",
    "/pre-ed2",
    "/pre-ed3",
    "/pre-ed4",
    "/pre-ed5",
    "/pre-wl1",
    "/pre-wl2",
    "/pre-wl3",
    "/pre-wl4",
    "/pre-wl5",
    "/ed-5",
    "/wl-pre-cf1",

    "/bo3_v2",
    "/quiz_wl",
    "/quiz_wl2",
    "/quiz_wl3",
    "/quiz-ed1",
    "/quiz-ed2",
    "/wl-checkout-flow1",
    "/wl-checkout-flow2",
    "/hyperpigmentation-consultation-quiz",
    "/anti-aging-consultation-quiz",
    "/acne-consultation-quiz",
    "/listicle",
    "/ed-checkout-flow1",
    "/ed-checkout-flow2",
    "/almost",
    "/payment",
    "/checkoutFlow",
    "/ed-simple-quiz1",
    "/ed-simple-quiz2",
    "/checkout2",
    "/login-register",
    "/bo4",
    "/bo5",
    "/glp2-offer-hero",
    "/glp1-offer-hero",
    "/wl-tt9-v1",
    "/glp2-pre-consultation-2",
    "/glp1-pre-consultation-3",
];

// Routes where the Zendesk chat widget should be hidden
export const zendeskHiddenRoutes = [
    "/wl-tt9-v2",
    "/glp1-pre-consultation-3",
    "/nad-consultation-quiz",
    "/cart",
    "/checkout",
];

/**
 * Checks if the Zendesk widget should be hidden on the current path
 * @param {string} path - The current path
 * @returns {boolean}
 */
export function shouldHideZendesk(path) {
    if (!path) return false;
    const normalizedPath = path.split("?")[0].replace(/\/$/, "");

    return zendeskHiddenRoutes.some(
        (route) =>
            normalizedPath === route || normalizedPath.startsWith(`${route}/`),
    );
}

/**
 * Checks if the current path should use a minimal layout without header/footer
 * @param {string} path - The current path
 * @returns {boolean} - True if the path should have a minimal layout
 */
export function shouldUseMinimalLayout(path) {
    // If path is empty, return false
    if (!path) return false;

    // Normalize the path - remove trailing slash and query params
    const normalizedPath = path.split("?")[0].replace(/\/$/, "");

    // Check if the normalized path matches any of the exempt routes
    return layoutExemptRoutes.some(
        (route) =>
            normalizedPath === route || normalizedPath.startsWith(`${route}/`),
    );
}
