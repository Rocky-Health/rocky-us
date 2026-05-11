import Link from "next/link";
import { logger } from "@/utils/devLogger";
import CouponApply from "../CartCheckoutShared/CouponApply";
import InitialShipping from "../CartCheckoutShared/InitialShipping";
import { analyticsService } from "@/utils/analytics/analyticsService";
import { formatPriceUI } from "@/utils/priceFormatter";

const CartCalculations = ({ cartItems, setCartItems }) => {
    const currencySymbol = cartItems.totals.currency_symbol || "$";

    // Check if subscriptions data exists before rendering RecurringShipping
    const hasSubscriptions =
        cartItems.extensions &&
        cartItems.extensions.subscriptions &&
        cartItems.extensions.subscriptions.length > 0;

    return (
        <div className="bg-[#f7f7f7] h-full justify-self-start w-full px-4 mt-8 lg:mt-0 lg:pl-[80px] lg:pt-[50px] pb-10">
            <div className="bg-white lg:w-[384px] p-4 md:p-6 rounded-[16px] shadow-[0px_1px_1px_0px_#E2E2E1] border border-[#E2E2E1] mt-8 lg:mt-0 ">
                <h2 className="border-b border-[#E2E2E1] text-[18px] md:text-[20px] font-[500] pb-[12px] text-[#251F20] leading-[21.6px] md:leading-[24px]">
                    Cart Totals
                </h2>

                <CouponApply setCartItems={setCartItems} />

                {hasSubscriptions && (
                    <RecurringShipping
                        currencySymbol={currencySymbol}
                        cartItems={cartItems}
                    />
                )}

                <InitialShipping
                    currencySymbol={currencySymbol}
                    cartItems={cartItems}
                    setCartItems={setCartItems}
                    formData={null}
                />

                <Link
                    href="/checkout"
                    className="flex items-center justify-center gap-3 bg-black text-white px-5 py-[12px] md:py-4 h-[44px] md:h-[52px] rounded-[64px] hover:bg-gray-800 transition"
                    onClick={() => {
                        try {
                            if (
                                cartItems &&
                                Array.isArray(cartItems.items) &&
                                cartItems.items.length > 0
                            ) {
                                const itemsForAnalytics = cartItems.items.map(
                                    (it) => ({
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
                                                      name:
                                                          v.attribute || v.name,
                                                      options: [v.value],
                                                  }))
                                                : [],
                                        },
                                        quantity: it.quantity || 1,
                                    }),
                                );
                                analyticsService.trackBeginCheckout(
                                    itemsForAnalytics,
                                );
                            }
                        } catch (e) {
                            logger.warn(
                                "[Analytics] begin_checkout tracking skipped:",
                                e,
                            );
                        }
                    }}
                >
                    <span className="text-[14px] font-[500] text-[#FFFFFF] leading-[19.6px] poppins-font">
                        Proceed to checkout
                    </span>
                    <svg
                        width="12"
                        height="11"
                        viewBox="0 0 12 11"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M7 0.5L6.285 1.1965L10.075 5H0V6H10.075L6.285 9.7865L7 10.5L12 5.5L7 0.5Z"
                            fill="white"
                        ></path>
                    </svg>
                </Link>
            </div>
        </div>
    );
};

export default CartCalculations;

const RecurringShipping = ({ currencySymbol, cartItems }) => {
    // Add safety checks to prevent errors if subscriptions data is incomplete
    const subscriptions = cartItems.extensions?.subscriptions || [];

    const subTotalPrice =
        subscriptions.reduce((acc, sub) => {
            return acc + Number(sub.totals?.total_items || 0);
        }, 0) / 100;

    const totalPrice =
        subscriptions.reduce((acc, sub) => {
            return acc + Number(sub.totals?.total_price || 0);
        }, 0) / 100;

    const totalTax =
        subscriptions.reduce((acc, sub) => {
            return acc + Number(sub.totals?.total_tax || 0);
        }, 0) / 100;

    // If no shipping rates exist, don't try to render them
    const hasShippingRates =
        Array.isArray(cartItems.shipping_rates) &&
        cartItems.shipping_rates.length > 0;

    return (
        <div className="border-b border-[#E2E2E1] ">
            <h3 className="text-[20px] font-[500] leading-[24px] text-[#251F20] border-b border-[#E2E2E1] py-3">
                Recurring Totals
            </h3>
            <hr className="pb-4" />
            <div className="flex justify-between items-start py-[6px] md:py-0 mb-3">
                <p className="font-[500] text-[#4E4E4E] leading-[19.6px]">
                    Subtotal
                </p>
                <p className="leading-[19.6px] text-[#000000]">
                    {currencySymbol}
                    {formatPriceUI(subTotalPrice)}
                </p>
            </div>
            <div className="flex justify-between items-start cart-discount coupon-"></div>
            {hasShippingRates &&
                cartItems.shipping_rates.map((shipping) => {
                    const selectedShipping = shipping.shipping_rates?.find(
                        (rate) => rate.selected,
                    );

                    if (!selectedShipping) return null;

                    return (
                        <div
                            key={shipping.name}
                            className="flex justify-between items-start mb-3 mt-2"
                        >
                            <p className="font-[500] text-[#4E4E4E] leading-[19.6px]">
                                Shipping
                            </p>
                            <div className="flex flex-col items-end gap-[2px]">
                                <p className="leading-[19.6px]">
                                    {selectedShipping.name}
                                    {selectedShipping &&
                                        selectedShipping.price && (
                                            <span>
                                                {" "}
                                                ({currencySymbol}
                                                {formatPriceUI(
                                                    Number(
                                                        selectedShipping.price,
                                                    ) / 100,
                                                )}
                                                )
                                            </span>
                                        )}
                                </p>
                            </div>
                        </div>
                    );
                })}

            <div className="flex justify-between items-start mb-3">
                <p className="font-[500] text-[#4E4E4E] leading-[19.6px]">
                    Tax
                </p>
                <p className="leading-[19.6px]">
                    {currencySymbol}
                    {formatPriceUI(totalTax)}
                </p>
            </div>
            <div className="flex justify-between items-start mb-[24px]">
                <p className="font-[500] text-[#000000] leading-[19.6px]">
                    Recurring Total
                </p>
                <p className="font-[500] text-[#000000] leading-[22px]">
                    {currencySymbol}
                    {formatPriceUI(totalPrice)}
                </p>
            </div>
        </div>
    );
};
