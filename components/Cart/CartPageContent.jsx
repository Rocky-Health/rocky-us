"use client";
import { logger } from "@/utils/devLogger";
import CartCalculations from "@/components/Cart/CartCalculations";
import CartItems from "@/components/Cart/CartItems";
import EmptyCart from "@/components/Cart/EmptyCart";
import CartSkeleton from "@/components/ui/skeletons/CartSkeleton";
import { useEffect, useState, useCallback } from "react";
import { getCart } from "@/lib/cart/cartService";
import { analyticsService } from "@/utils/analytics/analyticsService";

const CartPageContent = () => {
  const [cartItems, setCartItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Create a callback to fetch cart items that we can reuse
  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);
      logger.log("Fetching cart items...");

      // Use our cartService instead of directly calling the API
      const data = await getCart();
      logger.log("Cart data received:", data);

      // Ensure data has the expected structure before setting state
      if (data && typeof data === "object") {
        // If items is missing or not an array, initialize it as an empty array
        if (!data.items || !Array.isArray(data.items)) {
          logger.warn("Cart data missing items array, initializing empty cart");
          data.items = [];
        }
        setCartItems(data);
      } else {
        logger.error("Invalid cart data structure:", data);
        setCartItems({ items: [], total_items: 0, total_price: 0 });
      }
    } catch (error) {
      logger.error("Error fetching cart items:", error);
      // Provide empty cart as fallback
      setCartItems({ items: [], total_items: 0, total_price: 0 });
      setError(true);
    } finally {
      setLoading(false);
      logger.log("Cart loading complete");
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchCartItems();

    // Add event listener for cart refresher element clicks
    const handleCartRefresh = () => {
      logger.log("Cart refresh event triggered in cart page");
      fetchCartItems();
    };

    // Listen for the custom event
    document.addEventListener("cart-updated", handleCartRefresh);

    // Create a MutationObserver to watch for cart refresh clicks
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-refreshed"
        ) {
          logger.log("Cart refresher clicked, updating cart page");
          fetchCartItems();
        }
      });
    });

    const refresherElement = document.getElementById("cart-refresher");
    if (refresherElement) {
      observer.observe(refresherElement, { attributes: true });
    }

    return () => {
      document.removeEventListener("cart-updated", handleCartRefresh);
      observer.disconnect();
    };
  }, [fetchCartItems]);

  // Fire view_cart when items are present
  useEffect(() => {
    if (
      cartItems &&
      Array.isArray(cartItems.items) &&
      cartItems.items.length > 0
    ) {
      // Map to expected structure for analytics service
      const itemsForAnalytics = cartItems.items.map((it) => ({
        product: {
          id: it.product_id || it.id,
          sku: it.sku,
          name: it.name,
          price: (it.prices?.sale_price || it.prices?.regular_price || 0) / 100,
          attributes: it.variation?.length
            ? it.variation.map((v) => ({
                name: v.attribute || v.name,
                options: [v.value],
              }))
            : [],
        },
        quantity: it.quantity || 1,
      }));
      analyticsService.trackViewCart(itemsForAnalytics);
    }
  }, [cartItems]);

  // Use loading state instead of checking if cartItems is null
  if (loading && !cartItems) {
    logger.log("Showing cart skeleton while loading");
    return <CartSkeleton />;
  }

  // Now we can safely assume cartItems is not null
  if (error || !cartItems.items || cartItems.items.length === 0) {
    logger.log("Showing empty cart");
    return <EmptyCart />;
  }

  logger.log("Rendering cart with items:", cartItems.items.length);
  return (
    <div className="grid lg:grid-cols-2 min-h-[calc(100vh-100px)] border-t">
      <CartItems items={cartItems.items} setCartItems={setCartItems} coupons={cartItems?.coupons || []} />
      <CartCalculations cartItems={cartItems} setCartItems={setCartItems} />
    </div>
  );
};

export default CartPageContent;
