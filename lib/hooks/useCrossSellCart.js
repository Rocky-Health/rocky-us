/**
 * Custom Hook for Cross-Sell Cart Management
 * Handles cart display, addon addition, item removal in cross-sell popups
 * Used across all flow cross-sell popups (ED, Hair, WL, etc.)
 *
 * REFACTORED: Now uses cartService.js for all cart operations
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { logger } from "@/utils/devLogger";
import {
  getCart,
  getLocalCart,
  removeItemFromLocalCart as removeFromLocalCart,
  isAuthenticated as checkIsAuthenticated,
} from "@/lib/cart/cartService";
import {
  removeItemFromCart,
  formatCartForDisplay,
  isCartEmpty,
} from "@/utils/cartManager";
import { addAddonToCart, finalizeFlowCheckout } from "@/utils/flowCartHandler";
import { isUserAuthenticated } from "@/utils/crossSellCheckout";

/**
 * useCrossSellCart Hook
 * @param {String} flowType - Flow type (ed, hair, wl, mh, skincare)
 * @param {Object} selectedProduct - Main product that was selected (optional, for reference)
 * @param {Object} initialCartData - Initial cart data from addToCartEarly (optional)
 * @param {Function} onCartEmpty - Callback when cart becomes empty (optional)
 * @returns {Object} Cart state and methods
 */
export const useCrossSellCart = (
  flowType = "ed",
  selectedProduct = null,
  initialCartData = null,
  onCartEmpty = null
) => {
  // Cart state
  const [cartData, setCartData] = useState({
    items: [],
    subtotal: 0,
    total: 0,
    itemCount: 0,
  });

  // Loading states
  const [cartLoading, setCartLoading] = useState(!initialCartData);
  const [addingAddonIds, setAddingAddonIds] = useState(new Set());
  const [removingItemKeys, setRemovingItemKeys] = useState(new Set());

  // Error state
  const [error, setError] = useState(null);

  // Operation queue to prevent race conditions
  const operationQueueRef = useRef(Promise.resolve());

  /**
   * Queue an async operation to prevent race conditions
   * Operations are executed sequentially but tracked independently for UI
   */
  const queueOperation = useCallback(async (operation) => {
    // Chain the operation to the queue
    const previousOperation = operationQueueRef.current;

    // Create a new promise that waits for the previous one
    operationQueueRef.current = previousOperation
      .then(async () => {
        // Execute the operation
        return await operation();
      })
      .catch((error) => {
        // Log but don't block the queue
        logger.error("Queued operation failed:", error);
        throw error;
      });

    // Wait for this specific operation to complete
    return await operationQueueRef.current;
  }, []);

  /**
   * Load cart on mount (or use initial cart data if provided)
   */
  useEffect(() => {
    if (initialCartData) {
      // Use provided cart data instead of fetching
      logger.log(
        "🛒 useCrossSellCart - Using initial cart data, item count:",
        initialCartData.items?.length ?? 0
      );
      const formatted = formatCartForDisplay(initialCartData);
      setCartData(formatted);
      setCartLoading(false);
    } else {
      // Fetch cart from server
      loadCart();
    }
  }, [initialCartData]);

  /**
   * Remove item from localStorage cart using cartService
   */
  const removeItemFromLocalStorage = useCallback(
    async (itemKey) => {
      try {
        logger.log(
          "🗑️ Removing item from localStorage via cartService:",
          itemKey
        );

        // Use cartService to remove item
        const updatedCart = removeFromLocalCart(itemKey);

        // Format updated cart for display
        const formatted = formatCartForDisplay(updatedCart);
        setCartData(formatted);

        // Check if cart is now empty and call callback
        if (isCartEmpty(formatted) && onCartEmpty) {
          logger.log("🔔 Cart is now empty, closing popup...");
          setTimeout(() => {
            onCartEmpty();
          }, 300);
        }

        return true;
      } catch (error) {
        logger.error("❌ Error removing item from localStorage:", error);
        setError(error.message);
        return false;
      }
    },
    [onCartEmpty]
  );

  /**
   * Fetch and format cart data using cartService
   */
  const loadCart = useCallback(async () => {
    try {
      setCartLoading(true);
      setError(null);

      logger.log("🛒 useCrossSellCart - Loading cart via cartService...");

      // Use cartService to get cart (handles both auth and non-auth)
      const cartServiceData = await getCart();

      const formatted = formatCartForDisplay(cartServiceData);
      setCartData(formatted);
      logger.log("✅ Cart loaded:", formatted);
    } catch (err) {
      logger.error("❌ Error loading cart:", err);
      setError(err.message);
      // Set empty cart on error
      setCartData({
        items: [],
        subtotal: 0,
        total: 0,
        itemCount: 0,
      });
    } finally {
      setCartLoading(false);
    }
  }, []);

  /**
   * Add addon to cart
   * @param {Object} addon - Addon product data
   * @returns {Promise<Boolean>} Success status
   */
  const addAddon = useCallback(
    async (addon) => {
      const addonId = String(addon.id || addon.dataAddToCart);

      // Add to loading set immediately for UI feedback
      setAddingAddonIds((prev) => new Set([...prev, addonId]));
      setError(null);

      try {
        // Queue the operation to prevent race conditions
        const result = await queueOperation(async () => {
          logger.log("🛒 useCrossSellCart - Adding addon:", addon);

          const addResult = await addAddonToCart(addon, flowType, {
            subscriptionPeriod: addon.subscriptionPeriod || addon.dataVar,
          });

          if (addResult.success) {
            logger.log("✅ Addon added successfully");

            // Update cart data with new cart state
            if (addResult.cartData) {
              const formatted = formatCartForDisplay(addResult.cartData);
              setCartData(formatted);
            } else {
              // Fallback: reload cart
              await loadCart();
            }

            return true;
          } else {
            throw new Error(addResult.error || "Failed to add addon");
          }
        });

        return result;
      } catch (err) {
        logger.error("❌ Error adding addon:", err);
        setError(err.message);
        return false;
      } finally {
        // Remove from loading set
        setAddingAddonIds((prev) => {
          const next = new Set(prev);
          next.delete(addonId);
          return next;
        });
      }
    },
    [flowType, loadCart, queueOperation]
  );

  /**
   * Remove item from cart (handles both authenticated and unauthenticated)
   * @param {String} itemKey - Cart item key
   * @returns {Promise<Boolean>} Success status
   */
  const removeItem = useCallback(
    async (itemKey) => {
      // Add to loading set immediately for UI feedback
      setRemovingItemKeys((prev) => new Set([...prev, itemKey]));
      setError(null);

      try {
        // Queue the operation to prevent race conditions
        const result = await queueOperation(async () => {
          logger.log("🗑️ useCrossSellCart - Removing item:", itemKey);

          // Check if this is a localStorage cart (for unauthenticated users)
          if (itemKey.startsWith("local_")) {
            // Handle localStorage removal
            const localResult = await removeItemFromLocalStorage(itemKey);
            return localResult;
          }

          // Handle authenticated cart removal via API
          const apiResult = await removeItemFromCart(itemKey);

          if (apiResult.success) {
            logger.log("✅ Item removed successfully");

            // Update cart data with new cart state
            let updatedCartData;
            if (apiResult.cart) {
              updatedCartData = formatCartForDisplay(apiResult.cart);
              setCartData(updatedCartData);
            } else {
              // Fallback: reload cart
              await loadCart();
            }

            // Check if cart is now empty and call callback
            if (
              updatedCartData &&
              isCartEmpty(updatedCartData) &&
              onCartEmpty
            ) {
              logger.log("🔔 Cart is now empty, closing popup...");
              setTimeout(() => {
                onCartEmpty();
              }, 300); // Small delay for smooth UX
            }

            return true;
          } else {
            throw new Error(apiResult.error || "Failed to remove item");
          }
        });

        return result;
      } catch (err) {
        logger.error("❌ Error removing item:", err);
        setError(err.message);
        return false;
      } finally {
        // Remove from loading set
        setRemovingItemKeys((prev) => {
          const next = new Set(prev);
          next.delete(itemKey);
          return next;
        });
      }
    },
    [loadCart, removeItemFromLocalStorage, onCartEmpty, queueOperation]
  );

  /**
   * Refresh cart (re-fetch from server)
   */
  const refreshCart = useCallback(async () => {
    await loadCart();
  }, [loadCart]);

  /**
   * Proceed to checkout
   * Cart already has all products, just generate redirect URL
   * @returns {String} Checkout URL
   */
  const checkout = useCallback(() => {
    logger.log("🎯 useCrossSellCart - Proceeding to checkout");

    // Check if cart is empty
    if (isCartEmpty(cartData)) {
      logger.warn("⚠️ Cannot checkout with empty cart");
      setError("Your cart is empty. Please add products to continue.");
      return null;
    }

    // Check authentication
    const isAuthenticated = isUserAuthenticated();

    // Generate checkout URL
    const checkoutUrl = finalizeFlowCheckout(flowType, isAuthenticated);

    return checkoutUrl;
  }, [flowType, cartData]);

  /**
   * Check if specific addon is being added
   */
  const isAddingAddon = useCallback(
    (addonId) => {
      return addingAddonIds.has(String(addonId));
    },
    [addingAddonIds]
  );

  /**
   * Check if specific item is being removed
   */
  const isRemovingItem = useCallback(
    (itemKey) => {
      return removingItemKeys.has(itemKey);
    },
    [removingItemKeys]
  );

  /**
   * Check if addon is already in cart
   */
  const isAddonInCart = useCallback(
    (addonId) => {
      return cartData.items.some((item) => String(item.id) === String(addonId));
    },
    [cartData.items]
  );

  return {
    // Cart data
    cartData,
    cartItems: cartData.items,
    cartSubtotal: cartData.subtotal,
    cartTotal: cartData.total,
    cartItemCount: cartData.itemCount,
    isCartEmpty: isCartEmpty(cartData),

    // Loading states
    cartLoading,
    addingAddonIds,
    removingItemKeys,
    // Backwards compatibility - deprecated, use isAddingAddon() instead
    addingAddonId:
      addingAddonIds.size > 0 ? Array.from(addingAddonIds)[0] : null,
    removingItemKey:
      removingItemKeys.size > 0 ? Array.from(removingItemKeys)[0] : null,

    // Error state
    error,
    clearError: () => setError(null),

    // Methods
    addAddon,
    removeItem,
    refreshCart,
    checkout,

    // Helper methods
    isAddingAddon,
    isRemovingItem,
    isAddonInCart,
  };
};

export default useCrossSellCart;
