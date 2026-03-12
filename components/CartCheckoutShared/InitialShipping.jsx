import { useState } from "react";
import { CiTrash } from "react-icons/ci";
import { logger } from "@/utils/devLogger";
import { DotsLoader } from "react-loaders-kit";
import { toast } from "react-toastify";
import { formatPrice } from "@/utils/priceFormatter";

const InitialShipping = ({
    currencySymbol = "$",
    cartItems,
    setCartItems,
    isUpdatingShipping,
    formData,
}) => {
    const [removingCode, setRemovingCode] = useState(false);
    const rawSubTotal = cartItems?.totals?.total_items
        ? cartItems.totals.total_items / 100
        : 0;
    const rawTotal = cartItems?.totals?.total_price
        ? cartItems.totals.total_price / 100
        : 0;
    const totalTax = cartItems?.totals?.total_tax
        ? cartItems.totals.total_tax / 100
        : 0;

    // WooCommerce prices Body Optimization Program (148515) at $0.
    // When no coupon is applied (multi-month compounded plans), the program
    // should cost $99.  Add the difference so the displayed totals are correct.
    const hasCoupon = cartItems?.coupons && cartItems.coupons.length > 0;
    const hasBodyOptimization = cartItems?.items?.some(
        (item) => item.name === "Body Optimization Program"
    );
    const bodyOptAdjustment = !hasCoupon && hasBodyOptimization ? 99 : 0;
    const subTotalPrice = rawSubTotal + bodyOptAdjustment;
    const totalPrice = rawTotal + bodyOptAdjustment;

    const handleCodeRemove = async (code) => {
        setRemovingCode(true);
        try {
            const res = await fetch("/api/coupons", {
                headers: {
                    "Content-Type": "application/json",
                },
                method: "DELETE",
                body: JSON.stringify({ code }),
            });

            const data = await res.json();

            if (data.error) {
                toast.error("Invalid coupon code.");
            } else {
                setCartItems(data);
            }
        } catch (error) {
            logger.log(error);
            toast.error(error);
        } finally {
            setRemovingCode(false);
        }
    };

    // Get the selected province from form data first, then fallback to cartItems
    // This ensures the displayed province is always in sync with the form
    // Prioritize formData over cartItems so it updates immediately when user selects a state
    // If "Ship to a different address" is checked, ONLY use the shipping address state from formData
    // If NOT checked, billing and shipping are the same, so use billing address from formData first

    const isShipToDifferentAddress = Boolean(
        formData?.shipping_address?.ship_to_different_address
    );

    // Get state code - prioritize formData for immediate updates
    // Display state code directly (e.g., "NY" not "New York")
    const selectedProvince = isShipToDifferentAddress
        ? formData?.shipping_address?.state // ONLY use formData shipping when "ship to different" is checked
        : formData?.billing_address?.state ||
          formData?.shipping_address?.state ||
          cartItems?.shipping_address?.state ||
          cartItems?.billing_address?.state;

    // Debug logging to track province synchronization
    logger.log("🎯 InitialShipping province sync debug:", {
        isShipToDifferentAddress: isShipToDifferentAddress,
        formDataShipping: formData?.shipping_address?.state,
        formDataBilling: formData?.billing_address?.state,
        cartShipping: cartItems?.shipping_address?.state,
        cartBilling: cartItems?.billing_address?.state,
        selectedProvince: selectedProvince,
        ">>> DISPLAYED STATE >>>": selectedProvince,
    });

    // If cartItems is not available, show loading state
    if (!cartItems) {
        return (
            <div className="pt-4">
                <div className="animate-pulse">
                    <div className="flex justify-between items-start mb-3">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="flex justify-between items-start mb-3">
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Skeleton component for loading state
    const ShippingSkeleton = () => (
        <div className="animate-pulse">
            <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-12"></div>
            </div>
            <div className="flex justify-between items-start mb-3">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
        </div>
    );

    return (
        <div className="pt-4">
            <div className="flex justify-between items-start py-[6px] md:py-0 mb-3">
                <p className="font-[500] text-[#4E4E4E] leading-[19.6px]">
                    Subtotal
                </p>
                <p className="leading-[19.6px] text-[#000000]">
                    {currencySymbol}
                    {formatPrice(subTotalPrice)}
                </p>
            </div>
            {cartItems?.coupons && cartItems.coupons.length > 0 && (
                <div className="pb-3 border-b relative">
                    <p className="font-[500] text-[#4E4E4E] leading-[19.6px] mb-3">
                        Coupons
                    </p>
                    {cartItems.coupons.map((coupon) => {
                        const couponDiscount = Number(
                            coupon.totals?.total_discount ?? 0
                        );
                        const cartTotalDiscount = Number(
                            cartItems?.totals?.total_discount ?? 0
                        );
                        const discountAmount =
                            couponDiscount > 0
                                ? couponDiscount
                                : cartItems.coupons.length === 1
                                ? cartTotalDiscount
                                : couponDiscount;
                        return (
                            <div
                                key={coupon.code}
                                className="grid grid-cols-2 justify-between items-start py-[6px] md:py-0 mb-1 relative"
                            >
                                <p className="font-[500] text-[#4E4E4E] leading-[19.6px] text-sm uppercase underline">
                                    {coupon.code}
                                </p>
                                <div className="flex items-center justify-end gap-4">
                                    <p className="leading-[19.6px] text-[#000000] text-sm justify-self-end">
                                        - {currencySymbol}
                                        {formatPrice(discountAmount / 100)}
                                    </p>
                                    <button
                                        className="justify-self-end"
                                        onClick={() =>
                                            handleCodeRemove(coupon.code)
                                        }
                                    >
                                        <CiTrash color="darkred" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {removingCode && (
                        <div className="absolute backdrop-blur-[2px] flex items-center justify-center left-0 right-0 top-0 bottom-0 z-50">
                            <DotsLoader
                                size={25}
                                loading={removingCode}
                                color={"#000000"}
                            />
                        </div>
                    )}
                </div>
            )}

            <div className="flex justify-between items-start"></div>
            {isUpdatingShipping ? (
                <ShippingSkeleton />
            ) : (
                <>
                    {cartItems?.shipping_rates &&
                    cartItems.shipping_rates.length > 0 ? (
                        cartItems.shipping_rates.map((shipping) => {
                            const selectedShipping =
                                shipping.shipping_rates.find(
                                    (rate) => rate.selected
                                );
                            return (
                                <div
                                    key={shipping.name}
                                    className="flex justify-between items-start mb-3 mt-3"
                                >
                                    <p className="font-[500] text-[#4E4E4E] leading-[19.6px]">
                                        {/* {shipping.name} */}
                                        Shipment
                                    </p>
                                    <div className="flex flex-col items-end gap-[2px]">
                                        <p className="leading-[19.6px]">
                                            {selectedShipping ? (
                                                <>
                                                    {selectedShipping.name}
                                                    {selectedShipping.price >
                                                        0 && (
                                                        <span>
                                                            {" "}
                                                            ({currencySymbol}
                                                            {formatPrice(
                                                                Number(
                                                                    selectedShipping.price
                                                                ) / 100
                                                            )}
                                                            )
                                                        </span>
                                                    )}
                                                </>
                                            ) : (
                                                "Free shipping"
                                            )}
                                        </p>
                                        {selectedProvince && (
                                            <p className="text-[12px] font-[400] text-[#212121] leading-[16.8px]">
                                                Shipping to{" "}
                                                <b>
                                                    <span className="font-[600]">
                                                        {selectedProvince}
                                                    </span>
                                                </b>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="flex justify-between items-start mb-3 mt-3">
                            <p className="font-[500] text-[#4E4E4E] leading-[19.6px]">
                                Initial Shipment
                            </p>
                            <div className="flex flex-col items-end gap-[2px]">
                                <p className="leading-[19.6px]">
                                    Free shipping
                                </p>
                                {selectedProvince && (
                                    <p className="text-[12px] font-[400] text-[#212121] leading-[16.8px]">
                                        Shipping to{" "}
                                        <b>
                                            <span className="font-[600]">
                                                {selectedProvince}
                                            </span>
                                        </b>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {isUpdatingShipping ? (
                <div className="animate-pulse">
                    <div className="flex justify-between items-start mb-3">
                        <div className="h-4 bg-gray-200 rounded w-8"></div>
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                    </div>
                    <div className="flex justify-between items-start mb-[24px]">
                        <div className="h-4 bg-gray-200 rounded w-12"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex justify-between items-start mb-3">
                        <p className="font-[500] text-[#4E4E4E] leading-[19.6px]">
                            Tax
                        </p>
                        <p className="leading-[19.6px]">
                            {currencySymbol}
                            {formatPrice(totalTax)}
                        </p>
                    </div>
                    <div className="flex justify-between items-start mb-[24px]">
                        <p className="font-[500] text-[#000000] leading-[19.6px]">
                            Total
                        </p>
                        <p className="font-[500] text-[#000000] leading-[22px]">
                            {currencySymbol}
                            {formatPrice(totalPrice)}
                        </p>
                    </div>
                </>
            )}
        </div>
    );
};

export default InitialShipping;
