"use client";
import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import Link from "next/link";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { analyticsService } from "@/utils/analytics/analyticsService";
import { isUserAuthenticated } from "@/utils/crossSellCheckout";
import { formatPrice } from "@/utils/priceFormatter";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const CartPopup = ({ isOpen, onClose, productType, onContinueShopping }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isRemoving, setIsRemoving] = useState(null); // item key being removed
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    const fetchCartItems = async () => {
      try {
        const res = await fetch("/api/cart", {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });
        const data = await res.json();
        setCartItems(data.items || []);
      } catch (error) {
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCartItems();
  }, [isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    if (isOpen && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Remove item handler
  const handleRemoveItem = async (item) => {
    if (isRemoving === item.key) return;
    setIsRemoving(item.key);
    try {
      // Determine if cart is local or server
      const cartRes = await fetch("/api/cart", {
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      const cartData = await cartRes.json();
      const isLocalCart = cartData.is_local_cart || false;

      if (isLocalCart) {
        const { removeItemFromLocalCart } = require("@/lib/cart/cartService");
        const result = removeItemFromLocalCart(item.key);
        if (result.error) {
          toast.error(result.error);
          setIsRemoving(null);
          return;
        }
      } else {
        const res = await fetch("/api/cart", {
          headers: { "Content-Type": "application/json" },
          method: "DELETE",
          body: JSON.stringify({ itemKey: item.key }),
        });
        const data = await res.json();
        if (data.error) {
          toast.error(data.error);
          setIsRemoving(null);
          return;
        }
      }
      // Always refresh cart
      const res = await fetch("/api/cart", {
        headers: { "Cache-Control": "no-cache", Pragma: "no-cache" },
      });
      const data = await res.json();
      setCartItems(data.items || []);
    } catch (error) {
      toast.error("Failed to remove item from cart. Please try again.");
    } finally {
      setIsRemoving(null);
    }
  };

  if (!isOpen) return null;

  // Determine the correct checkout URL based on product type
  const getCheckoutUrl = () => {
    if (productType === "hair") {
      return "/checkout?hair-flow=1";
    } else if (productType === "ed") {
      return "/checkout?ed-flow=1";
    } else {
      return "/checkout";
    }
  };

  const checkoutUrl = getCheckoutUrl();

  return (
    <>
      {/* Desktop Modal */}
      <div className="hidden md:flex fixed inset-0 bg-black bg-opacity-50 z-50 items-center justify-center">
        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 relative">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          >
            <span className="text-xl font-bold">&times;</span>
          </button>

          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Item Added to Cart</h3>
            <p className="text-gray-600 mb-6">
              Your item has been added to your cart successfully.
            </p>

            <div className="flex flex-col space-y-3">
              <Link href={checkoutUrl} className="w-full">
                <button
                  className="w-full bg-black text-white py-2.5 px-4 rounded-full hover:bg-gray-900 transition-colors"
                  onClick={(e) => {
                    // If user is not authenticated and this is merch, redirect to login-register with redirect_to
                    if (productType === "merch") {
                      try {
                        const authenticated = isUserAuthenticated();
                        if (!authenticated) {
                          e.preventDefault();
                          const origin = typeof window !== "undefined" ? window.location.origin : "";
                          const redirectTo = encodeURIComponent(`${origin}${checkoutUrl}`);
                          window.location.href = `${origin}/login-register?redirect_to=${redirectTo}&viewshow=register`;
                          return;
                        }
                      } catch (_) {}
                    }

                    try {
                      if (Array.isArray(cartItems) && cartItems.length > 0) {
                        const itemsForAnalytics = cartItems.map((it) => ({
                          product: {
                            id: it.product_id || it.id,
                            sku: it.sku,
                            name: it.name,
                            price:
                              (it.prices?.sale_price ||
                                it.prices?.regular_price ||
                                0) / 100,
                            attributes: it.variation?.length
                              ? it.variation.map((v) => ({
                                  name: v.attribute || v.name,
                                  options: [v.value],
                                }))
                              : [],
                          },
                          quantity: it.quantity || 1,
                        }));
                        analyticsService.trackBeginCheckout(itemsForAnalytics);
                      }
                    } catch (e) {
                      logger.warn(
                        "[Analytics] begin_checkout (popup) skipped:",
                        e
                      );
                    }
                  }}
                >
                  Proceed to Checkout
                </button>
              </Link>

              <button
                onClick={productType === "merch" ? (onContinueShopping || onClose) : onClose}
                className="w-full bg-white text-black py-2.5 px-4 rounded-full border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Sheet */}
      <div className="md:hidden fixed inset-0 z-[9999] flex flex-col justify-end">
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black bg-opacity-30"
          onClick={onClose}
        ></div>
        {/* Bottom Sheet */}
        <div className="relative w-full max-h-[450px] bg-white rounded-t-2xl shadow-lg flex flex-col animate-slideUp">
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-2">
            <span className="font-semibold text-[#454545] text-base">CART</span>
            <button onClick={onClose}>
              <IoClose size={32} />
            </button>
          </div>
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-5 pb-2">
            {isLoading ? (
              <>
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 mb-4 animate-pulse"
                  >
                    <div className="min-w-[60px] min-h-[60px] w-[60px] h-[60px] bg-gray-200 rounded-md" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                    </div>
                    <div className="w-9 h-9 bg-gray-200 rounded-full" />
                  </div>
                ))}
              </>
            ) : cartItems && cartItems.length > 0 ? (
              cartItems.map((item) => (
                <div key={item.key} className="flex items-center gap-3 mb-4">
                  <div className="min-w-[60px] min-h-[60px] w-[60px] h-[60px] bg-gray-100 rounded-md flex items-center justify-center">
                    {item.images && item.images[0]?.thumbnail ? (
                      <img
                        src={item.images[0]?.thumbnail}
                        alt={item.name}
                        className="rounded-md w-full h-full object-cover"
                        width={60}
                        height={60}
                      />
                    ) : (
                      <div className="text-gray-400">No Image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-[#212121] text-sm">
                      <span
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.name) }}
                      ></span>
                    </div>
                    {/* Display quantity and variations only for merch products */}
                    {productType === "merch" && (
                      <div className="mt-1 space-y-1">
                        {/* Display quantity */}
                        <div className="text-[#666666] text-xs">
                          Quantity:{" "}
                          <span className="text-[#212121] font-medium">
                            {item.quantity || 1}
                          </span>
                        </div>
                        {/* Display product variations */}
                        {item.variation && item.variation.length > 0 && (
                          <div className="text-[#666666] text-xs">
                            {item.variation
                              .map((variation, index) => {
                                // Handle different variation data structures
                                const variationName =
                                  variation.name ||
                                  variation.attribute ||
                                  variation.label ||
                                  "";
                                const variationValue =
                                  variation.value ||
                                  variation.options?.[0] ||
                                  "";

                                // Skip if we don't have proper data
                                if (!variationName || !variationValue)
                                  return null;

                                return (
                                  <span key={index}>
                                    {variationName}:{" "}
                                    <span className="text-[#212121] font-medium">
                                      {variationValue}
                                    </span>
                                    {index < item.variation.length - 1
                                      ? " • "
                                      : ""}
                                  </span>
                                );
                              })
                              .filter(Boolean)}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="text-[#212121] text-sm">
                      {item.quantity || 1} × $
                      {item.prices?.sale_price
                        ? formatPrice(item.prices.sale_price / 100)
                        : formatPrice(
                            item.prices?.regular_price / 100 || item.price
                          )}
                    </div>
                    <div className="text-[#212121] text-sm font-semibold">
                      Total: $
                      {item.prices?.sale_price
                        ? formatPrice(
                            (item.prices.sale_price / 100) *
                            (item.quantity || 1)
                          )
                        : formatPrice(
                            (item.prices?.regular_price / 100 || item.price) *
                            (item.quantity || 1)
                          )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item)}
                    className="bg-[#EBEBEB] rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-300 transition-colors disabled:opacity-60"
                    title="Remove item"
                    disabled={isRemoving === item.key}
                  >
                    {isRemoving === item.key ? (
                      <span className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                      <IoClose size={22} />
                    )}
                  </button>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                Your cart is empty
              </div>
            )}
          </div>
          {/* Footer Buttons */}
          <div className="px-5 pb-5 pt-2 flex flex-col gap-3">
            <Link href={checkoutUrl} className="w-full">
              <button
                className="w-full py-3 rounded-full bg-black text-white text-center font-medium text-base disabled:opacity-60"
                disabled={!!isRemoving}
                onClick={(e) => {
                  // If user is not authenticated and this is merch, redirect to login-register with redirect_to
                  if (productType === "merch") {
                    try {
                      const authenticated = isUserAuthenticated();
                      if (!authenticated) {
                        e.preventDefault();
                        const origin = typeof window !== "undefined" ? window.location.origin : "";
                        const redirectTo = encodeURIComponent(`${origin}${checkoutUrl}`);
                        window.location.href = `${origin}/login-register?redirect_to=${redirectTo}&viewshow=register`;
                        return;
                      }
                    } catch (_) {}
                  }

                  try {
                    if (Array.isArray(cartItems) && cartItems.length > 0) {
                      const itemsForAnalytics = cartItems.map((it) => ({
                        product: {
                          id: it.product_id || it.id,
                          sku: it.sku,
                          name: it.name,
                          price:
                            (it.prices?.sale_price ||
                              it.prices?.regular_price ||
                              0) / 100,
                          attributes: it.variation?.length
                            ? it.variation.map((v) => ({
                                name: v.attribute || v.name,
                                options: [v.value],
                              }))
                            : [],
                        },
                        quantity: it.quantity || 1,
                      }));
                      analyticsService.trackBeginCheckout(itemsForAnalytics);
                    }
                  } catch (e) {
                    logger.warn(
                      "[Analytics] begin_checkout (popup mobile) skipped:",
                      e
                    );
                  }
                }}
              >
                Proceed to Checkout
              </button>
            </Link>
            <button
              onClick={productType === "merch" ? (onContinueShopping || onClose) : onClose}
              className="w-full py-3 rounded-full border border-black text-black text-center font-medium text-base"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPopup;
