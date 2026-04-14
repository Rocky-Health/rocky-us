/**
 * Centralized logout utility
 * Handles logout process including API call, localStorage cleanup, and redirect
 */

import { logger } from "@/utils/devLogger";

/**
 * Logout the user and redirect to login page
 * @param {Object} options - Configuration options
 * @param {string} options.reason - Reason for logout (e.g., 'inactivity', 'manual', 'session_expired')
 * @param {boolean} options.redirect - Whether to redirect to login page (default: true)
 * @param {string} options.redirectUrl - Custom redirect URL (default: /login-register)
 * @param {boolean} options.preserveCurrentUrl - Whether to preserve current URL as redirect_to parameter (default: false)
 * @returns {Promise<Object>} Result of logout operation
 */
export async function logout(options = {}) {
  const {
    reason = "manual",
    redirect = true,
    redirectUrl = null,
    preserveCurrentUrl = false,
  } = options;

  try {
    logger.log(`Logging out user, reason: ${reason}`);

    // Call logout API endpoint
    await fetch("/api/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Clear localStorage items
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        // Clear activity tracking
        localStorage.removeItem("lastActivityTime");

        // Clear user data
        localStorage.removeItem("userDetails");
        localStorage.removeItem("userProfileData");

        // Clear cart items
        localStorage.removeItem("cartItems");
        localStorage.removeItem("cartData");
        localStorage.removeItem("savedCards");

        // Clear any other session-related data
        localStorage.removeItem("checkoutFormData");

        logger.log("localStorage cleared");
      } catch (error) {
        logger.error("Error clearing localStorage:", error);
      }
    }

    // Trigger cart updated event to refresh cart display
    if (typeof document !== "undefined") {
      const cartUpdatedEvent = new CustomEvent("cart-updated");
      document.dispatchEvent(cartUpdatedEvent);
    }

    // Handle redirect
    if (redirect && typeof window !== "undefined") {
      let targetUrl = redirectUrl;

      if (!targetUrl) {
        // Build default redirect URL with appropriate query parameters
        const params = new URLSearchParams();
        params.set("session_expired", "1");

        if (reason && reason !== "manual") {
          params.set("reason", reason);
        }

        // Preserve current URL if requested (for flow continuity)
        if (preserveCurrentUrl) {
          const currentUrl = window.location.pathname + window.location.search;
          if (currentUrl && currentUrl !== "/login-register") {
            params.set("redirect_to", encodeURIComponent(currentUrl));
            logger.log(`Preserving current URL for redirect: ${currentUrl}`);
          }
        }

        targetUrl = `/login-register?${params.toString()}`;
      }

      logger.log(`Redirecting to: ${targetUrl}`);
      window.location.href = targetUrl;
    }

    return {
      success: true,
      redirected: redirect,
    };
  } catch (error) {
    logger.error("Error during logout:", error);

    // Even if API call fails, still clear local data and redirect
    if (typeof window !== "undefined") {
      if (window.localStorage) {
        try {
          localStorage.removeItem("lastActivityTime");
          localStorage.removeItem("userDetails");
          localStorage.removeItem("userProfileData");
          localStorage.removeItem("cartItems");
        } catch (e) {
          logger.error("Error clearing localStorage after failed logout:", e);
        }
      }

      // Still redirect even if API fails
      if (redirect) {
        const params = new URLSearchParams();
        params.set("session_expired", "1");
        if (reason && reason !== "manual") {
          params.set("reason", reason);
        }

        // Preserve current URL if requested (for flow continuity)
        if (preserveCurrentUrl && typeof window !== "undefined") {
          const currentUrl = window.location.pathname + window.location.search;
          if (currentUrl && currentUrl !== "/login-register") {
            params.set("redirect_to", encodeURIComponent(currentUrl));
            logger.log(`Preserving current URL for redirect: ${currentUrl}`);
          }
        }

        window.location.href = `/login-register?${params.toString()}`;
      }
    }

    return {
      success: false,
      error: error.message,
      redirected: redirect,
    };
  }
}

/**
 * Check if user is currently logged in
 * @returns {boolean} True if user is authenticated
 */
export function isLoggedIn() {
  if (typeof document === "undefined") return false;

  // Check for auth cookies
  const cookies = document.cookie.split(";");
  const hasAuthToken = cookies.some((cookie) =>
    cookie.trim().startsWith("authToken=")
  );
  const hasUserId = cookies.some((cookie) =>
    cookie.trim().startsWith("userId=")
  );

  return hasAuthToken && hasUserId;
}

/**
 * Clear last activity time from localStorage
 * Useful when user manually logs out
 */
export function clearActivityTracking() {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.removeItem("lastActivityTime");
      logger.log("Activity tracking cleared");
    } catch (error) {
      logger.error("Error clearing activity tracking:", error);
    }
  }
}
