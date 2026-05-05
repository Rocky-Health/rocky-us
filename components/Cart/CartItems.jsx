import { CiTrash } from "react-icons/ci";
import CustomImage from "../utils/CustomImage";
import { logger } from "@/utils/devLogger";
import { DotsLoader } from "react-loaders-kit";
import { useState } from "react";
import { useEmptyCart } from "@/lib/cart/cartHooks";
import { toast } from "react-toastify";
import { canRemoveItem } from "@/lib/cart/cartService";
import { analyticsService } from "@/utils/analytics/analyticsService";
import { formatPriceUI } from "@/utils/priceFormatter";

const COMPOUNDED_ORIGINAL_PRICES = {
  tirzepatide: "$389",
  semaglutide: "$279",
};

const PLAN_LABEL_BY_INTERVAL = {
  1:  "Monthly Auto-Refill",
  3:  "3 Month Supply",
  6:  "6 Month Supply",
  12: "Annual Supply",
};

function getCompoundedPlanInfo(item) {
  const name = (item.name || "").toLowerCase();
  const isTirz = name.includes("tirzepatide");
  const isSema = name.includes("semaglutide") && !name.includes("oral") && !name.includes("sublingual");

  if (!isTirz && !isSema) return null;

  const subscription = item.extensions?.subscriptions;
  const billingInterval = parseInt(subscription?.billing_interval || "1", 10);
  const billingPeriod = (subscription?.billing_period || "month").toLowerCase();

  // Convert subscription schedule to a month-equivalent divisor for "/mo" display.
  // Example: every 1 year should divide by 12, not 1.
  let normalizedMonthInterval = billingInterval;
  if (billingPeriod === "year") {
    normalizedMonthInterval = billingInterval * 12;
  } else if (billingPeriod === "week") {
    normalizedMonthInterval = billingInterval <= 5 ? 1 : Math.max(1, Math.round(billingInterval / 4));
  } else if (billingPeriod === "day") {
    normalizedMonthInterval = billingInterval <= 31 ? 1 : Math.max(1, Math.round(billingInterval / 30));
  }

  return {
    plan: PLAN_LABEL_BY_INTERVAL[normalizedMonthInterval] || "Monthly Auto-Refill",
    originalPrice: isTirz
      ? COMPOUNDED_ORIGINAL_PRICES.tirzepatide
      : COMPOUNDED_ORIGINAL_PRICES.semaglutide,
    months: normalizedMonthInterval,
  };
}

const CartItems = ({ items, setCartItems, coupons = [] }) => {
  const emptyCart = useEmptyCart();
  const [isEmptyingCart, setIsEmptyingCart] = useState(false);
  const hasCoupon = coupons.length > 0;

  const handleEmptyCart = async () => {
    try {
      setIsEmptyingCart(true);
      await emptyCart();

      // Create a synthetic cart update event to refresh the cart
      document.dispatchEvent(new Event("cart-updated"));

      // Alternatively, if you have a cart refresher element:
      const refresherElement = document.getElementById("cart-refresher");
      if (refresherElement) {
        refresherElement.setAttribute("data-refreshed", Date.now().toString());
      }
    } catch (error) {
      logger.error("Error emptying cart:", error);
    } finally {
      setIsEmptyingCart(false);
    }
  };

  return (
    <div className="w-full lg:max-w-[640px] h-full justify-self-end px-4 mt-8 lg:mt-0 lg:pr-[40px] lg:pt-[50px]">
      <h1 className="text-[24px] md:text-[32px] leading-[33.6px] md:leading-[44.8px] tracking-[-0.01em] md:tracking-[-0.02em] text-[#251F20] font-[450] pb-[16px] headers-font border-b border-[#E2E2E1] md:border-none">
        My Cart
      </h1>
      <div className="hidden md:grid grid-cols-4 items-center justify-between border-b border-[#E2E2E1] py-4 pl-8 text-[12px] font-[500] pr-[16px]">
        <div className="col-span-2">PRODUCT</div>
        <div className="justify-self-end pr-7">QUANTITY</div>
        <div className="justify-self-end">TOTAL</div>
      </div>

      {items.map((item) => (
        <div key={item.key}>
          <CartItem item={item} setCartItems={setCartItems} allItems={items} hasCoupon={hasCoupon} />
          <hr />
        </div>
      ))}

      {/* Empty Cart Button */}
      <div className="my-6">
        <button
          onClick={handleEmptyCart}
          disabled={isEmptyingCart}
          className="flex items-center justify-center gap-3 bg-gray-200 text-black px-5 py-[12px] h-[44px] md:h-[52px] rounded-[64px] hover:bg-gray-300 transition w-full md:w-auto"
        >
          <span className="text-[14px] font-[500] leading-[19.6px] poppins-font">
            {isEmptyingCart ? "Emptying..." : "Empty Cart"}
          </span>
          {isEmptyingCart ? (
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              ></path>
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 4H3.33333H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M5.33331 4.00004V2.66671C5.33331 2.31309 5.47379 1.97395 5.7238 1.72391C5.97381 1.4739 6.31296 1.33337 6.66665 1.33337H9.33331C9.687 1.33337 10.0261 1.4739 10.2762 1.72391C10.5262 1.97395 10.6666 2.31309 10.6666 2.66671V4.00004M12.6666 4.00004V13.3334C12.6666 13.687 12.5262 14.0261 12.2761 14.2762C12.0261 14.5262 11.687 14.6667 11.3333 14.6667H4.66665C4.31302 14.6667 3.97388 14.5262 3.72384 14.2762C3.47379 14.0261 3.33331 13.687 3.33331 13.3334V4.00004H12.6666Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6.66669 7.33337V11.3334"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9.33331 7.33337V11.3334"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default CartItems;

const CartItem = ({ item, setCartItems, allItems, hasCoupon = false }) => {
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const itemPrice = (item.prices.sale_price || item.prices.regular_price) / 100;
  const quantity = item.quantity;
  const currencySymbol = item.prices.currency_symbol || "$";
  const itemTotalPrice = item.totals.line_subtotal / 100;
  const subscription = item.extensions?.subscriptions;
  const isSubscription = subscription && subscription.billing_interval;

  // Special handling for Sublingual Semaglutide product (ID: 490537)
  // This product should be treated as a monthly subscription even if WooCommerce metadata is missing
  const isOralSemaglutide = item.id === 490537 || item.product_id === 490537;
  const isSubscriptionWithFallback = isSubscription || isOralSemaglutide;

  const compoundedPlanInfo = getCompoundedPlanInfo(item);

  let supply = "";
  if (
    subscription &&
    subscription.billing_interval &&
    subscription.billing_period
  ) {
    const interval = subscription.billing_interval;
    const period = subscription.billing_period;

    // Pluralize the period if interval > 1
    const pluralPeriod = interval > 1 ? `${period}s` : period;
    supply = `every ${interval} ${pluralPeriod}`;
  } else if (isOralSemaglutide) {
    // Default to monthly for Sublingual Semaglutide if no subscription data
    supply = "every 4 weeks";
  }

  const intervalText = isSubscriptionWithFallback ? `${supply}` : "";

  // Check if this item can be removed (for UI purposes)
  const itemCanBeRemoved = canRemoveItem(allItems || [], item.key);

  // Handle quantity updates (increment/decrement)
  const handleQuantityEdit = async (quantity) => {
    if (loading) return; // Prevent multiple concurrent requests

    try {
      setLoading(true);
      // Track delta before updating
      const prevQty = item.quantity;
      const newQty = quantity;
      const delta = (newQty || 0) - (prevQty || 0);
      const productForTracking = {
        id: item.product_id || item.id,
        sku: item.sku,
        name: item.name,
        price:
          (item.prices?.sale_price || item.prices?.regular_price || 0) / 100 ||
          (item.totals?.line_subtotal && prevQty
            ? item.totals.line_subtotal / 100 / prevQty
            : 0),
        attributes: item.variation?.length
          ? item.variation.map((v) => ({
              name: v.attribute || v.name,
              options: [v.value],
            }))
          : [],
      };
      if (delta > 0) {
        analyticsService.trackAddToCart(productForTracking, delta);
      } else if (delta < 0) {
        analyticsService.trackRemoveFromCart(
          productForTracking,
          Math.abs(delta)
        );
      }

      const res = await fetch("/api/cart", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({
          itemKey: item.key,
          quantity,
        }),
      });

      const data = await res.json();
      setCartItems(data);
    } catch (error) {
      logger.error("Error updating item quantity:", error);
    } finally {
      setLoading(false);
      document.getElementById("cart-refresher")?.click();
    }
  };

  // Handle item deletion - now uses the proper DELETE endpoint
  const handleDeleteItem = async () => {
    if (deleteLoading) return; // Prevent multiple clicks

    try {
      setDeleteLoading(true);
      // Track full removal
      try {
        const productForTracking = {
          id: item.product_id || item.id,
          sku: item.sku,
          name: item.name,
          price:
            (item.prices?.sale_price || item.prices?.regular_price || 0) /
              100 ||
            (item.totals?.line_subtotal && item.quantity
              ? item.totals.line_subtotal / 100 / item.quantity
              : 0),
          attributes: item.variation?.length
            ? item.variation.map((v) => ({
                name: v.attribute || v.name,
                options: [v.value],
              }))
            : [],
        };
        analyticsService.trackRemoveFromCart(
          productForTracking,
          item.quantity || 1
        );
      } catch (e) {
        logger.warn("[Analytics] remove_from_cart tracking skipped:", e);
      }

      // Item-specific loading state allows other items to be deleted in parallel
      const res = await fetch("/api/cart", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE", // Use DELETE method to properly remove the item
        body: JSON.stringify({
          itemKey: item.key,
        }),
      });

      const data = await res.json();

      // Check if there was an error (like Body Optimization Program restriction)
      if (data.error) {
        // Show error message to user using toast
        toast.error(data.error);
        return;
      }

      setCartItems(data);
    } catch (error) {
      logger.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart. Please try again.");
    } finally {
      setDeleteLoading(false);
      document.getElementById("cart-refresher")?.click();
    }
  };

  return (
    <>
      <div className="grid grid-cols-4 md:items-center justify-between border-b border-[#E2E2E1] py-4 md:py-[24px] md:pr-[16px] relative">
        {loading && (
          <div className="absolute backdrop-blur-[2px] flex items-center justify-center left-0 right-0 top-0 bottom-0 z-50">
            <DotsLoader size={25} loading={loading} color={"#000000"} />
          </div>
        )}
        <div className="flex items-center gap-[14px] col-span-3 md:col-span-2">
          <div className="hidden md:flex">
            {itemCanBeRemoved ? (
              <>
                <CiTrash
                  size={20}
                  className={`cursor-pointer ${
                    deleteLoading ? "opacity-50" : ""
                  }`}
                  onClick={handleDeleteItem}
                />
                {deleteLoading && (
                  <span className="w-3 h-3 border-t-2 border-r-2 border-black rounded-full animate-spin absolute ml-1 mt-[-12px]"></span>
                )}
              </>
            ) : (
              <div
                className="w-[20px] h-[20px] flex items-center justify-center"
                title="This item cannot be removed while Weight Loss products are in your cart"
              >
                <CiTrash
                  size={20}
                  className="text-gray-300 cursor-not-allowed"
                />
              </div>
            )}
          </div>
          <div className="flex items-start gap-3">
            <div className="relative min-w-[70px] min-h-[70px] object-cover rounded-[12px] bg-[#F3F3F3] overflow-hidden">
              <CustomImage
                src={item.images[0]?.thumbnail}
                alt={item.name}
                fill
              />
            </div>
            <div>
              <p className="text-[14px] font-[500] leading-[19.6px] mb-[2px]">
                <span dangerouslySetInnerHTML={{ __html: item.name }}></span>{" "}
                {!isSubscriptionWithFallback &&
                  item.variation[0] &&
                  `(${item.variation[0]?.value})`}
              </p>

              {item.name != "Body Optimization Program" && !compoundedPlanInfo && (
                <>
                  <p className="text-[12px] font-[400] text-[#212121] inline">
                    {currencySymbol}
                    {formatPriceUI(itemPrice)}{" "}
                  </p>
                  <p className="text-[12px] font-[400] text-[#212121] inline">
                    / {isSubscriptionWithFallback && intervalText}
                    {!isSubscriptionWithFallback &&
                      item.variation[1] &&
                      item.variation[1]?.value}
                    {item.name?.toLowerCase().includes("zonnic") &&
                      item.variation?.find(
                        (v) => v.attribute?.toLowerCase() === "flavors"
                      )?.value && (
                        <>
                          {" / "}
                          <span className="text-[12px] font-[400] text-[#212121]">
                            {
                              item.variation.find(
                                (v) => v.attribute?.toLowerCase() === "flavors"
                              )?.value
                            }
                          </span>
                        </>
                      )}
                  </p>
                </>
              )}
              {compoundedPlanInfo && (
                <div className="mt-1">
                  <p className="text-[12px] font-[400] text-[#212121]">
                    {currencySymbol}{formatPriceUI(itemTotalPrice)} / {intervalText}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] text-[#999999] line-through">
                      {compoundedPlanInfo.originalPrice}/mo
                    </span>
                    <span className="text-[11px] font-[600] text-[#212121]">
                      {currencySymbol}{formatPriceUI(itemTotalPrice / compoundedPlanInfo.months)}/mo
                    </span>
                  </div>
                </div>
              )}
              {item.name === "Body Optimization Program" && (
                <div className="flex flex-col">
                  <p className="text-sm md:text-base font-[500] text-[#212121] underline text-nowrap">
                    Monthly membership:
                  </p>
                  {/* <p className="text-sm md:text-base text-[#212121]">
                    Initial fee $99 | <br className="hidden md:block" /> Monthly
                    fee $99
                  </p> */}
                  <p className="text-sm md:text-base font-[500] text-[#212121] mt-2 underline">
                    Includes:
                  </p>
                  <ul className="text-sm md:text-base text-[#212121] list-none pl-5">
                    <li className="text-nowrap">- Monthly prescription</li>
                    <li className="text-nowrap">
                      - Follow-ups with clinicians
                    </li>
                    <li className="text-nowrap">- Pharmacist counselling</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="hidden md:flex justify-self-end  items-center justify-between p-2 w-[104px] h-[40px] rounded-full border border-[#E2E2E1]">
          <button
            className={`quantity-minus w-[20px] h-[20px] ${
              item.quantity === 1 && "cursor-not-allowed"
            }`}
            disabled={item.quantity === 1 || loading}
            onClick={() => handleQuantityEdit(item.quantity - 1)}
          >
            -
          </button>
          <span className="quantity-value font-medium">{quantity}</span>
          <button
            className="quantity-plus w-[20px] h-[20px] relative"
            disabled={loading}
            onClick={() => handleQuantityEdit(item.quantity + 1)}
          >
            +
          </button>
        </div>

        <div className="text-[14px] font-[500] leading-[19.6px] justify-self-end product-sub-total">
          <span className="woocommerce-Price-amount amount">
            <bdi>
              {item.name === "Body Optimization Program" ? (
                <span className="text-green-500">FREE</span>
              ) : (
                <><span className="woocommerce-Price-currencySymbol">
                  {currencySymbol}
                </span>
                {formatPriceUI(itemTotalPrice)}</>
              )}
            </bdi>
          </span>
        </div>

        <div className="md:hidden flex items-center gap-2 mt-4">
          <div className="min-w-[104px] justify-self-end flex items-center justify-between p-2 w-[104px] h-[40px] rounded-full border border-[#E2E2E1]">
            <button
              className={`quantity-minus w-[20px] h-[20px] ${
                item.quantity === 1 && "cursor-not-allowed"
              }`}
              disabled={item.quantity === 1 || loading}
              onClick={() => handleQuantityEdit(item.quantity - 1)}
            >
              -
            </button>
            <span className="quantity-value font-medium">{quantity}</span>
            <button
              className="quantity-plus w-[20px] h-[20px] relative"
              disabled={loading}
              onClick={() => handleQuantityEdit(item.quantity + 1)}
            >
              +
            </button>
          </div>
          <div className="">
            {itemCanBeRemoved ? (
              <>
                <CiTrash
                  size={20}
                  className={`cursor-pointer ${
                    deleteLoading ? "opacity-50" : ""
                  }`}
                  onClick={handleDeleteItem}
                />
                {deleteLoading && (
                  <span className="w-3 h-3 border-t-2 border-r-2 border-black rounded-full animate-spin absolute ml-1 mt-[-12px]"></span>
                )}
              </>
            ) : (
              <div
                className="w-[20px] h-[20px] flex items-center justify-center"
                title="This item cannot be removed while Weight Loss products are in your cart"
              >
                <CiTrash
                  size={20}
                  className="text-gray-300 cursor-not-allowed"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
