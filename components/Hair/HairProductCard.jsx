"use client";

import { useState } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FaCheck } from "react-icons/fa6";
import CustomImage from "../utils/CustomImage";
import { IoInformationCircle } from "react-icons/io5";
import { HairCrossSellPopupWrapper } from "../HairPreConsultationQuiz/popups/CrossSellPopups";
import {
  addToCartEarly,
  finalizeFlowCheckout,
} from "../../utils/flowCartHandler";
import { formatPriceUI } from "@/utils/priceFormatter";

const HairProductCard = ({
  label,
  bestFor,
  benefits,
  image,
  badge,
  title,
  description,
  tooltip,
  supply,
  price,
  addToCartLink,
  regularPrice, // Add support for regularPrice to show sale pricing
  id, // Added product ID for cross-sell
  variationId, // Added variation ID for subscription products
  isSubscription, // Added subscription flag
  subscriptionPeriod, // Added subscription period
  pageType, // Add pageType prop for conditional rendering
}) => {
  // Check if there's a sale price (when regularPrice is provided and higher than price)
  const isOnSale = regularPrice && Number(regularPrice) > Number(price);

  // Next.js router for navigation
  const router = useRouter();

  // State for cross-sell popup
  const [showCrossSellPopup, setShowCrossSellPopup] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [initialCartData, setInitialCartData] = useState(null);

  // Extract the product ID from addToCartLink if not provided directly
  const extractProductId = () => {
    if (id) return id;

    // Try to extract product ID from the addToCartLink
    if (addToCartLink) {
      const match = addToCartLink.match(/onboarding-add-to-cart=(\d+)/);
      if (match && match[1]) {
        return match[1];
      }
    }
    return "";
  };

  // Format the product data for the cross-sell popup
  const formatProductForPopup = () => {
    return {
      id: extractProductId(),
      variationId: variationId, // Pass variation ID if available
      name: title, // Cart handler expects 'name' field
      title,
      description,
      price: parseFloat(price) || 0,
      quantity: 1, // Explicit quantity for cart
      image,
      regularPrice,
      supply,
      isSubscription: isSubscription || supply?.toLowerCase().includes("month"),
      subscriptionPeriod: subscriptionPeriod || "1_month", // Default to 1_month if not specified
      // Add variation data for display
      variation: [
        {
          attribute: "Subscription Type",
          value: supply || frequency || "Monthly Supply",
        },
      ],
    };
  };

  // Handle the add to cart button click - add to cart before showing popup
  const handleAddToCart = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const mainProduct = formatProductForPopup();

      logger.log("🛒 Hair Flow - Adding product to cart early:", mainProduct);

      // Add product to cart early (before cross-sell popup)
      const result = await addToCartEarly(mainProduct, "hair", {
        requireConsultation: true,
        subscriptionPeriod: mainProduct.subscriptionPeriod,
      });

      if (result.success) {
        logger.log("✅ Product added to cart, opening cross-sell popup");
        // Store the cart data to pass to the modal
        if (result.cartData) {
          setInitialCartData(result.cartData);
        }
        setShowCrossSellPopup(true);
      } else {
        logger.error("❌ Failed to add product to cart:", result.error);
        alert(
          result.error || "Failed to add product to cart. Please try again.",
        );
      }
    } catch (error) {
      logger.error("Error adding product to cart:", error);
      alert("There was an issue adding the product to cart. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle checkout from cross-sell popup - Product already in cart, just redirect
  const handleCheckout = async () => {
    setIsCheckoutLoading(true);

    try {
      logger.log(
        "🎯 Hair Flow - Proceeding to checkout (cart already populated)",
      );

      // Product and any addons are already in cart
      // Just generate checkout URL and redirect
      const checkoutUrl = finalizeFlowCheckout("hair", true);

      logger.log("Redirecting to:", checkoutUrl);

      // Close popup and navigate
      setShowCrossSellPopup(false);
      router.push(checkoutUrl);
    } catch (error) {
      logger.error("Error redirecting to checkout:", error);
      alert("There was an issue redirecting to checkout. Please try again.");
      setIsCheckoutLoading(false);
    }
  };

  return (
    <div className="mt-[25px] relative min-w-[280px] mx-auto md:max-w-[384px] rounded-[16px] px-4 py-6 p-[24px] text-center h-full border-[0.5px] border-solid border-[#E2E2E1] shadow-[0px 1px 1px 0px #E2E2E1]">
      {label && (
        <span className="absolute top-[-24px] left-[24px] bg-[#AE7E56] w-[103px] h-[24px] py-[3px] px-[12px] flex items-center justify-center text-[12px] leading-[18px] text-white">
          {label}
        </span>
      )}

      {pageType === "products" ? (
        <h2 className="text-[20px] md:text-[24px] leading-[24px] md:leading-[28.8px] font-[450] mb-[16px]">
          {title}
        </h2>
      ) : (
        <>
          <span className="text-[12px] font-[400] leading-[18px]">
            Best For
          </span>
          <div className="flex items-center justify-center gap-[8px] mt-[8px] mb-[16px]">
            {bestFor.map((item, index) => (
              <p
                key={index}
                className="py-[1.5px] px-[6px] text-[12px] md:text-[14px] bg-[#F5F4EF] rounded-[4px] w-fit h-[24px]"
              >
                {item}
              </p>
            ))}
          </div>
        </>
      )}

      <div className="relative mx-auto mb-[16px]">
        <div className="relative overflow-hidden mx-auto rounded-[16px] h-[140px] w-[200px]">
          <CustomImage src={image} alt={title} fill sizes="200px" />
        </div>

        {badge && (
          <Image
            loading="lazy"
            className="absolute left-0 top-0 h-[72px] md:h-[80px] w-[72px] md:w-[80px] object-contain"
            src={badge}
            alt="badge"
            width={80}
            height={80}
          />
        )}
      </div>

      {pageType !== "products" && (
        <h2 className="text-[20px] md:text-[24px] leading-[24px] md:leading-[28.8px] font-[450] mb-[8px] md:mb-[4px]">
          {title}
        </h2>
      )}

      <div className="relative flex items-start justify-center gap-[8px] md:gap-[6px] border-b border-[#E2E2E1]">
        <p className="text-[14px] leading-[21px] tracking-[-0.02em] text-[#212121] h-[42px] ">
          {description}
        </p>
        {tooltip && (
          <div className=" group mt-1 md:mt-0">
            {/* Info Icon */}

            <IoInformationCircle className="text-[16px] cursor-pointer text-[#E2E2E1]" />

            {/* Tooltip */}
            <div className=" group-hover:block absolute bg-black text-white w-[248px] md:w-[336px] text-sm px-3 py-2 rounded-lg bottom-full mb-3 left-1/2 -translate-x-1/2 hidden transition-opacity duration-300 z-10">
              {tooltip}
            </div>
          </div>
        )}
      </div>

      {pageType !== "products" && (
        <ul className="flex flex-col items-start gap-[8px] py-[16px] h-[195px] md:h-[154.1px] border-b border-[#E2E2E1]">
          {benefits.map((benefit, index) => (
            <li
              key={index}
              className="flex items-start text-left gap-[8px] text-[14px] leading-[21px] font-[400]"
            >
              <FaCheck className="text-[#814b00] text-base min-w-[16px] max-w-[16px]" />
              {benefit}
            </li>
          ))}
        </ul>
      )}

      <p className="text-[#AE7E56] text-center py-[16px] text-[14px]">
        {supply}
      </p>

      <button
        onClick={handleAddToCart}
        className="w-full flex items-center justify-center bg-black text-[#FFFFFF] font-[500] text-center py-[12px] rounded-[64px] cursor-pointer disabled:bg-gray-400 gap-2"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            <span>Adding to cart...</span>
          </>
        ) : isOnSale ? (
          <>
            Add To Cart - ${formatPriceUI(price)}{" "}
            <span className="text-gray-300 line-through text-sm">
              ${formatPriceUI(regularPrice)}
            </span>
          </>
        ) : (
          <>Add To Cart - ${formatPriceUI(price)}</>
        )}
      </button>

      {/* Cross-sell popup */}
      <HairCrossSellPopupWrapper
        isOpen={showCrossSellPopup}
        onClose={() => setShowCrossSellPopup(false)}
        selectedProduct={formatProductForPopup()}
        onCheckout={handleCheckout}
        isLoading={isCheckoutLoading}
        initialCartData={initialCartData}
      />
    </div>
  );
};

export default HairProductCard;
