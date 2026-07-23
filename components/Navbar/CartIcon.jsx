"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { logger } from "@/utils/devLogger";
import { IoCartOutline, IoClose } from "react-icons/io5";
import { CiTrash } from "react-icons/ci";
import { emptyCart } from "@/lib/cart/cartService";
import { toast } from "react-toastify";
import { canRemoveItem } from "@/lib/cart/cartService";
import MobileCartPopup from "./MobileCartPopup";
import { IoIosCart } from "react-icons/io";
import { formatPriceUI } from "@/utils/priceFormatter";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const CartIcon = ({ handleToggle }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isLocalCart, setIsLocalCart] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  const [isEmptyingCart, setIsEmptyingCart] = useState(false);

  const getCartItems = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
      });
      const data = await res.json();
      setCartItems(data);
      setIsLocalCart(data.is_local_cart || false);
    } catch (error) {
      logger.error("Error fetching cart items:", error);
    }
  }, []);

  // Initial load of cart items
  useEffect(() => {
    getCartItems();

    // Add event listener for cart refresher element
    const handleCartRefresh = () => {
      getCartItems();
    };

    document.addEventListener("cart-updated", handleCartRefresh);

    // Create a MutationObserver to watch for cart refresh clicks
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-refreshed"
        ) {
          getCartItems();
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
  }, [getCartItems]);

  const handleRefreshCart = () => {
    getCartItems();
    const refresher = document.getElementById("cart-refresher");
    if (refresher) {
      refresher.setAttribute("data-refreshed", Date.now().toString());
    }
  };

  // Remove item handler for mobile popup
  const handleRemoveItemMobile = async (item) => {
    try {
      if (isLocalCart) {
        const { removeItemFromLocalCart } = require("@/lib/cart/cartService");
        const result = removeItemFromLocalCart(item.key);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        getCartItems();
      } else {
        const res = await fetch("/api/cart", {
          headers: { "Content-Type": "application/json" },
          method: "DELETE",
          body: JSON.stringify({ itemKey: item.key }),
        });
        const data = await res.json();
        if (data.error) {
          toast.error(data.error);
          return;
        }
        if (res.ok) getCartItems();
      }
    } catch (error) {
      toast.error("Failed to remove item from cart. Please try again.");
    }
  };

  // Empty cart handler for mobile popup
  const handleEmptyCartMobile = async () => {
    if (isEmptyingCart) return;
    try {
      setIsEmptyingCart(true);
      await emptyCart();
      getCartItems();
    } catch (error) {
      toast.error("Failed to empty cart. Please try again.");
    } finally {
      setIsEmptyingCart(false);
    }
  };

  return (
    <>
      {/* <div className="relative group hidden md:block">
        <span
          id="cart-refresher"
          className="hidden"
          onClick={handleRefreshCart}
        ></span>
        <Link href="/cart" className="block relative">
          <IoIosCart size={24} />
          {cartItems.items && (
            <span className="absolute top-[-40%] right-[-40%] text-[10px] bg-[#A55255] flex items-center justify-center w-5 h-5 text-white rounded-full">
              {cartItems.items?.length}
            </span>
          )}
        </Link>
        {cartItems.items && (
          <div className="hidden group-hover:flex absolute top-[24px] right-[-13px] md:right-0 bg-white rounded-md min-w-[395px] md:min-w-[450px] min-h-[80px] shadow-md p-4 px-8 w-full z-50">
            <CartItems
              items={cartItems.items}
              refreshCart={getCartItems}
              isLocalCart={isLocalCart}
            />
          </div>
        )}
      </div> */}
      <div className="relative group block cursor-pointer p-2 hover:bg-[#F5F4EF] hover:rounded-full">
        <span
          id="cart-refresher"
          className="hidden"
          onClick={handleRefreshCart}
        ></span>
        <div
          className="block relative"
          onClick={() => setIsMobileCartOpen(true)}
        >
          <IoIosCart size={24} />
          {cartItems.items && (
            <span className="absolute top-[-40%] right-[-40%] text-[10px] bg-[#A55255] flex items-center justify-center w-5 h-5 text-white rounded-full">
              {cartItems.items?.length}
            </span>
          )}
        </div>
        <MobileCartPopup
          open={isMobileCartOpen}
          onClose={() => setIsMobileCartOpen(false)}
          cartItems={cartItems.items || []}
          isLocalCart={isLocalCart}
          onRemoveItem={handleRemoveItemMobile}
          onEmptyCart={handleEmptyCartMobile}
          isEmptyingCart={isEmptyingCart}
          handleToggle={handleToggle}
        />
      </div>
    </>
  );
};

export default CartIcon;

const CartItems = ({ items, refreshCart, isLocalCart }) => {
  const [isEmptyingCart, setIsEmptyingCart] = useState(false);

  const handleEmptyCart = async () => {
    if (isEmptyingCart) return; // Prevent multiple clicks

    try {
      setIsEmptyingCart(true);
      await emptyCart();

      // Refresh cart after emptying
      refreshCart();

      // Trigger cart refresher for other components
      const refresher = document.getElementById("cart-refresher");
      if (refresher) {
        refresher.setAttribute("data-refreshed", Date.now().toString());
      }
    } catch (error) {
      logger.error("Error emptying cart:", error);
    } finally {
      setIsEmptyingCart(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex items-center w-full">
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {isLocalCart && (
        <div className="mb-3 text-sm bg-blue-50 p-2 rounded">
          <p>Sign in to save your cart items and complete checkout.</p>
        </div>
      )}
      <div className="max-h-[300px] overflow-y-auto pr-1">
        {items.map((item) => (
          <div key={item.key}>
            <CartItem
              item={item}
              refreshCart={refreshCart}
              isLocalCart={isLocalCart}
              allItems={items}
            />
            <hr />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <Link
          className="flex-1 py-2 text-center bg-gray-200 rounded-full text-sm font-semibold"
          href="/cart"
          onClick={handleToggle}
        >
          View Cart
        </Link>
        <button
          onClick={handleEmptyCart}
          disabled={isEmptyingCart}
          className="flex-1 py-2 text-center bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors rounded-full text-sm font-semibold flex items-center justify-center"
        >
          {isEmptyingCart ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Emptying...
            </>
          ) : (
            <>
              <CiTrash className="mr-1" /> Empty Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
};

const CartItem = ({ item, refreshCart, isLocalCart, allItems }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  // Handle local cart items which have a different structure
  const itemPrice = isLocalCart
    ? item.price / 100
    : (item.prices?.sale_price || item.prices?.regular_price) / 100;

  const quantity = item.quantity;
  const currencySymbol = item.prices?.currency_symbol || "$"; // Default to $

  // For local cart items, these might not exist
  const subscription = !isLocalCart ? item.extensions?.subscriptions : null;
  const isSubscription = subscription && subscription.billing_period;

  let supply = "";
  if (subscription && subscription.billing_interval === 1) {
    supply = "Monthly Supply";
  }
  if (subscription && subscription.billing_interval === 3) {
    supply = "Quarterly Supply";
  }

  const intervalText = isSubscription ? `${supply}` : "";

  // Check if this item can be removed (for UI purposes)
  const itemCanBeRemoved = canRemoveItem(allItems || [], item.key);

  const handleRemoveItem = async () => {
    try {
      setIsRemoving(true);

      if (isLocalCart) {
        // Import directly to avoid dynamic import error
        const { removeItemFromLocalCart } = require("@/lib/cart/cartService");

        // Remove the item from local cart
        const result = removeItemFromLocalCart(item.key);

        // Check if there was an error (like Body Optimization Program restriction)
        if (result.error) {
          toast.error(result.error);
          return;
        }

        // Refresh cart display
        refreshCart();
      } else {
        // For server cart, use the DELETE API endpoint for proper removal
        const res = await fetch("/api/cart", {
          headers: {
            "Content-Type": "application/json",
          },
          method: "DELETE", // Use DELETE method instead of PUT with quantity 0
          body: JSON.stringify({
            itemKey: item.key,
          }),
        });

        const data = await res.json();

        // Check if there was an error (like Body Optimization Program restriction)
        if (data.error) {
          toast.error(data.error);
          return;
        }

        if (res.ok) {
          // Refresh cart after successful removal
          refreshCart();
        }
      }

      // Trigger cart refresher for other components
      const refresher = document.getElementById("cart-refresher");
      if (refresher) {
        refresher.click();
      }
    } catch (error) {
      logger.error("Error removing item from cart:", error);
      toast.error("Failed to remove item from cart. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="flex gap-4 py-4 w-full relative">
      <div className="min-w-[65px] min-h-[65px] w-[65px] h-[65px] bg-gray-100 rounded-md flex items-center justify-center">
        {item.images && item.images[0]?.thumbnail ? (
          <Image
            width={65}
            height={65}
            src={item.images[0]?.thumbnail}
            alt={item.name}
            className="rounded-md"
          />
        ) : (
          <div className="text-gray-400">No Image</div>
        )}
      </div>
      <div className="text-sm font-semibold flex-grow">
        <h5 className="text-wrap max-w-[150px]">
          <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(item.name) }}></span>{" "}
          {!isSubscription &&
            !isLocalCart &&
            item.variation &&
            item.variation[0] &&
            `(${item.variation[0]?.value})`}
        </h5>
        <p className="text-[12px] font-normal">
          {isSubscription && intervalText}
          {!isSubscription &&
            !isLocalCart &&
            item.variation &&
            item.variation[1] &&
            item.variation[1]?.value}
        </p>
        {item.name === "Body Optimization Program" ? <p className="mt-1 text-xs text-green-500">
          FREE
        </p> : <>
          <p className="mt-1 text-xs">
          {quantity} × {currencySymbol}
          {typeof itemPrice === "number"
            ? formatPriceUI(itemPrice)
            : formatPriceUI(itemPrice)}
        </p>
        <p className="mt-1 text-xs font-semibold">
          Total: {currencySymbol}
          {typeof itemPrice === "number"
            ? formatPriceUI(itemPrice * quantity)
            : formatPriceUI(parseFloat(itemPrice || 0) * quantity)}
        </p></>}
        {item.name === "Body Optimization Program" && (
          <div className="flex flex-col">
            <p className="text-[12px] font-[500] text-[#212121] underline text-nowrap">
              Monthly membership:
            </p>
            <p className="text-[12px] text-[#212121]">
              Initial fee $99 | Monthly fee $99
            </p>
            <p className="text-[12px] font-[500] text-[#212121] mt-2 underline">
              Includes:
            </p>
            <ul className="text-[12px] text-[#212121] list-none pl-5">
              <li className="text-nowrap">- Monthly prescription</li>
              <li className="text-nowrap">- Follow-ups with clinicians</li>
              <li className="text-nowrap">- Pharmacist counselling</li>
            </ul>
          </div>
        )}
      </div>
      {itemCanBeRemoved ? (
        <button
          onClick={handleRemoveItem}
          disabled={isRemoving}
          className="self-start hover:text-red-700 transition-colors"
          title="Remove item"
        >
          <CiTrash size={18} />
        </button>
      ) : (
        <div
          className="w-[18px] h-[18px] self-start flex items-center justify-center"
          title="This item cannot be removed while Weight Loss products are in your cart"
        >
          <CiTrash size={18} className="text-gray-300 cursor-not-allowed" />
        </div>
      )}
      {isRemoving && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};
