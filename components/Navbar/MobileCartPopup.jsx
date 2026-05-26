import Image from "next/image";
import Link from "next/link";
import { IoClose } from "react-icons/io5";
import { useState, useEffect } from "react";
import { formatPriceUI } from "@/utils/priceFormatter";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import { SEMA_PRICING } from "@/lib/constants/subscriptionPricing";

export default function MobileCartPopup({
  open,
  onClose,
  cartItems,
  isLocalCart,
  onRemoveItem,
  onEmptyCart,
  isEmptyingCart,
  handleToggle,
}) {
  const [isRemoving, setIsRemoving] = useState(null);
  const [cartVisible, setCartVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setCartVisible(true);
    } else {
      setTimeout(() => setCartVisible(false), 500); // Match transition duration
    }
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.innerWidth < 768;
    if (open && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Only unmount when both open and cartVisible are false
  if (!open && !cartVisible) return null;

  const isLoading = cartItems === undefined || cartItems === null;

  return (
    <>
      <div
        className={` fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-500 ease-in-out will-change-opacity ${
          open && cartVisible ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={onClose}
      ></div>
      <div
        className={`cursor-auto fixed top-0 right-0 w-full h-full bg-white shadow-lg z-[9999] flex flex-col transition-transform duration-500 ease-in-out transform will-change-transform ${
          open && cartVisible ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-6 md:p-10">
          <span className="headers-font md:text-[32px]">CART</span>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="p-2 hover:bg-[#F5F4EF] hover:rounded-full"
          >
            <IoClose size={32} />
          </button>
        </div>
        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-5 pb-4 md:px-10">
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
                    <Image
                      width={60}
                      height={60}
                      src={item.images[0]?.thumbnail}
                      alt={item.name}
                      className="rounded-md"
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
                  {item.name === "Body Optimization Program" ? (
                    <div className="text-green-500 text-sm">FREE</div>
                  ) : (
                    <>
                      {(() => {
                        const semaName = (item.name || "").toLowerCase();
                        const nameIsSema =
                          semaName.includes("semaglutide") &&
                          !semaName.includes("oral") &&
                          !semaName.includes("sublingual");
                        const subscription = !isLocalCart
                          ? item.extensions?.subscriptions
                          : null;
                        const authBilling =
                          subscription?.billing_interval == 1 &&
                          (subscription?.billing_period || "").toLowerCase() === "month";
                        const isSemaMonthly =
                          nameIsSema &&
                          (authBilling || String(item.variation_id) === "489799");

                        if (isSemaMonthly) {
                          const quantity = item.quantity || 1;
                          return (
                            <>
                              <div className="text-[#212121] text-sm">
                                {quantity} × ${SEMA_PRICING.firstMonthAmount}.00
                              </div>
                              <div className="text-[#212121] text-sm font-semibold">
                                Total: ${formatPriceUI(SEMA_PRICING.firstMonthAmount * quantity)}
                              </div>
                              <div className="text-[#212121] text-xs">every 1 month</div>
                              <div className="text-[#212121] text-xs">{SEMA_PRICING.recurringTagline}</div>
                            </>
                          );
                        }

                        // Normalize price: server cart uses cents in prices.*, local cart often stores cents in item.price
                        const rawUnitPrice =
                          (isLocalCart
                            ? item.price ??
                              item.prices?.sale_price ??
                              item.prices?.regular_price
                            : item.prices?.sale_price ??
                              item.prices?.regular_price ??
                              item.price) || 0;

                        const unitPrice = rawUnitPrice / 100;
                        const quantity = item.quantity || 1;

                        return (
                          <>
                            <div className="text-[#212121] text-sm">
                              {quantity} × ${formatPriceUI(unitPrice)}
                            </div>
                            <div className="text-[#212121] text-sm font-semibold">
                              Total: ${formatPriceUI(unitPrice * quantity)}
                            </div>
                          </>
                        );
                      })()}
                    </>
                  )}
                </div>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    setIsRemoving(item.key);
                    await onRemoveItem(item);
                    setIsRemoving(null);
                  }}
                  className="bg-[#EBEBEB] rounded-full w-9 h-9 flex items-center justify-center hover:bg-gray-300 transition-colors"
                  title="Remove item"
                  disabled={isRemoving === item.key || isEmptyingCart}
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
        {/* Buttons */}
        <div className="px-5 md:px-10 py-4 flex flex-col gap-3">
          <Link
            href="/cart"
            className="w-full py-3 rounded-full bg-black text-white text-center font-medium text-sm disabled:opacity-60"
            onClick={() => {
              onClose();
              if (handleToggle) {
                handleToggle();
              }
            }}
          >
            <button disabled={isEmptyingCart || !!isRemoving}>View Cart</button>
          </Link>
          <button
            className="w-full py-3 rounded-full border border-black text-black text-center font-semibold text-sm flex items-center justify-center disabled:opacity-60"
            onClick={onEmptyCart}
            disabled={
              isEmptyingCart ||
              !!isRemoving ||
              !cartItems ||
              cartItems.length === 0
            }
          >
            {isEmptyingCart ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                Emptying...
              </>
            ) : (
              "Empty Cart"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
