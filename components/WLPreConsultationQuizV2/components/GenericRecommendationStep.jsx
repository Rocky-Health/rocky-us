"use client";
import React, { useEffect, useState, useRef } from "react";
import { logger } from "@/utils/devLogger";
import Variations from "./Variations";
import { useRouter } from "next/navigation";
import { wlFlowAddToCart } from "@/utils/flowCartHandler";
import CustomImage from "@/components/utils/CustomImage";
import { addRequiredConsultation } from "@/utils/requiredConsultation";
import Loader from "@/components/Loader";

// Weight loss product IDs that require consultation
const WEIGHT_LOSS_PRODUCT_IDS = [
  "489523", // Compounded Tirzepatide
  "489798", // Compounded Semaglutide
  //"490537", // ORAL_SEMAGLUTIDE
  "142975", // OZEMPIC
  "160468", // MOUNJARO
  "250827", // WEGOVY
  "369618", // RYBELSUS
];

const GenericRecommendationStep = ({
  recommended,
  alternatives,
  selectedProduct,
  setSelectedProduct,
  onContinue,
  ProductCard, // Product card component to use
  showAlternatives = true,
  variations = [],
  showIncluded = true,
  // Optional: when provided and returns true for selectedProduct, navigate instead of checkout
  onBeforeCheckout,
  onNavigateToPlanStep,
}) => {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const containerRef = useRef(null);
  const [showLoader, setShowLoader] = useState(true);
  const router = useRouter();

  const [hasSelectedAlternative, setHasSelectedAlternative] = useState(false);

  // Privacy text component
  const PrivacyText = () => (
    <p className="text-xs text-[#353535] my-1 md:my-4">
      We respect your privacy. All of your information is securely stored on our
      HIPAA Compliant server.
    </p>
  );

  useEffect(() => {
    if (!recommended) return;

    if (!selectedProduct) {
      // Auto-select the recommended product
      setSelectedProduct(recommended);
    } else {
      // Refresh cached selectedProduct with current data (e.g. updated prices)
      const allProducts = [recommended, ...(alternatives || [])];
      const freshProduct = allProducts.find(
        (p) => String(p.id) === String(selectedProduct.id),
      );
      if (freshProduct && freshProduct.price !== selectedProduct.price) {
        setSelectedProduct(freshProduct);
      }
    }
  }, [recommended, alternatives, setSelectedProduct]);

  // Track when an alternative product is selected
  useEffect(() => {
    if (selectedProduct && alternatives) {
      const isAlternativeSelected = alternatives.some(
        (alt) => alt.id === selectedProduct.id,
      );
      setHasSelectedAlternative(isAlternativeSelected);
    }
  }, [selectedProduct, alternatives]);

  const handleShowMoreOptions = () => {
    if (hasSelectedAlternative) {
      // If an alternative is selected, clicking should show all products
      setHasSelectedAlternative(false);
      setShowMoreOptions(true);
    } else {
      // Normal toggle behavior when no alternative is selected
      setShowMoreOptions(!showMoreOptions);
    }
  };

  // Mount-only: ensure page is at the top immediately when this step loads
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.scrollTo({ top: 0, behavior: "auto" });
    } catch (e) {
      // ignore
    }
  }, []);

  // When this screen opens or recommended becomes available, smooth-scroll it into view

  useEffect(() => {
    if (typeof window === "undefined") return;
    const doScroll = () => {
      try {
        if (containerRef.current && containerRef.current.scrollIntoView) {
          containerRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      } catch (e) {
        // ignore
      }
    };
    const t = setTimeout(doScroll, 50);
    return () => clearTimeout(t);
  }, [recommended]);

  // Show loader for 2 seconds on mount, then hide
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // Prevent body scrolling while the full-screen preloader is visible
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = document.body.style.overflow;
    if (showLoader) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = prev || "";
    }
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [showLoader]);

  // Handle direct checkout process
  const handleCheckout = async () => {
    if (!selectedProduct) {
      alert("Please select a product to continue");
      return;
    }

    // If onBeforeCheckout returns true, navigate to plan step instead of checkout
    if (typeof onBeforeCheckout === "function" && onBeforeCheckout(selectedProduct)) {
      if (typeof onNavigateToPlanStep === "function") {
        onNavigateToPlanStep();
      }
      return;
    }

    try {
      setIsCheckoutLoading(true);

      logger.log("Selected Product ->", selectedProduct);
      // Prepare the main product for checkout
      const mainProductForCheckout = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1,
        isSubscription: selectedProduct.isSubscription || false,
      };

      // Add required consultation for main product if needed
      if (WEIGHT_LOSS_PRODUCT_IDS.includes(String(selectedProduct.id))) {
        addRequiredConsultation(selectedProduct.id, "wl-flow");
      }

      logger.log(
        "🛒 Starting WL direct cart addition:",
        mainProductForCheckout,
      );

      // Use the new direct cart handler for WL flow
      const result = await wlFlowAddToCart(mainProductForCheckout, [], {
        requireConsultation: true,
      });

      if (result.success) {
        logger.log(
          "✅ WL cart addition successful, redirecting to:",
          result.redirectUrl,
        );

        // Clear all localStorage keys used in WL flow before redirecting
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            // Remove WL flow specific key (used by useStepNavigation and useQuizData hooks)
            localStorage.removeItem("wl_flow2_quiz_data");

            logger.log("✓ Cleared WL flow localStorage key before redirect");
          }
        } catch (e) {
          logger.error("Error clearing localStorage:", e);
        }

        // Use a full-page navigation to ensure server-side state (cookies/nonce)
        // is properly established and the next page does a full reload.
        try {
          if (typeof window !== "undefined" && result.redirectUrl) {
            window.location.href = result.redirectUrl;
            return;
          }
        } catch (e) {
          logger.error(
            "window.location.href redirect failed, falling back to router.push:",
            e,
          );
        }

        // Fallback for environments where window is unavailable
        try {
          router.push(result.redirectUrl);
        } catch (e) {
          logger.error("router.push fallback failed:", e);
        }

        // Call onContinue if provided (for any additional logic)
        if (typeof onContinue === "function") {
          onContinue();
        }
      } else {
        logger.error("❌ WL cart addition failed:", result.error);
        alert("There was an issue processing your checkout. Please try again.");
      }
    } catch (error) {
      logger.error("Error during WL checkout:", error);
      alert("There was an issue processing your checkout. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const isContinueEnabled = selectedProduct !== null;
  const isPlanStepProduct =
    selectedProduct &&
    typeof onBeforeCheckout === "function" &&
    onBeforeCheckout(selectedProduct);
  const proceedButtonLabel = isPlanStepProduct
    ? "Continue"
    : `Proceed - ${selectedProduct?.price || ""} →`;

  if (!recommended) {
    return (
      <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6">
        <div className="text-center">
          Loading your personalized recommendations...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full  mx-auto px-[16px] md:px-0 flex flex-col min-h-screen relative pb-32">
      {/* Full-screen loading overlay */}
      {isCheckoutLoading && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}

      {showLoader && (
        <div className="fixed inset-0 z-[20000] bg-white flex justify-center items-center">
          <div className="relative w-20 h-20 flex items-center justify-center">
            {/* Rotating dotted ring */}
            <svg
              className="absolute w-24 h-24 animate-[spin_5.5s_linear_infinite]"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#000"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray="2 10"
                opacity="0.85"
              />
            </svg>

            {/* Center letter - stays still while ring spins */}
            <div className="relative text-2xl font-bold text-black">
              <CustomImage
                src="https://myrocky.b-cdn.net/WP%20Images/convert_test/reloader.png"
                width="30"
                height="30"
              />
            </div>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="w-full md:w-[520px] mx-auto">
          <div className="progress-indicator mb-2 text-[#A7885A] font-medium">
            <span className="text-sm">Here's what we recommended</span>
          </div>
          <div className="progress-bar-wrapper w-full block h-[8px] my-1 rounded-[10px] bg-gray-200">
            <div
              style={{ width: "100%" }}
              className="progress-bar bg-[#A7885A] rounded-[10px] block float-left h-[8px]"
            ></div>
          </div>
        </div>
      </div>

      <div className="flex-grow">
        {/* Title */}
        <h2 className="subheadres-font tracking-tighter leading-[115%] text-[32px] font-[400] text-[#000000] mb-[30px] text-center">
          Choose your treatment
        </h2>
        {/* <h3 className="text-sm w-fit mx-auto font-[500] leading-[140%] tracking-[-2%] text-black mb-6 text-center bg-[#F0EEEA] p-2 rounded-lg">
                    {selectedProduct?.name}
                </h3> */}

        {/* Recommended Product */}
        <div className="mb-8 grid grid-cols-2 sm:gap-4 gap-2 items-start w-fit mx-auto">
          <ProductCard
            product={recommended}
            variations={variations}
            onSelect={(product) => setSelectedProduct(product)}
            isSelected={selectedProduct?.id === recommended?.id}
          />

          {alternatives?.length > 0 &&
            alternatives.map((product) => (
              <ProductCard
                key={product.id ?? product.name}
                product={product}
                onSelect={(product) => setSelectedProduct(product)}
                isSelected={selectedProduct?.id === product.id}
              />
            ))}
        </div>

        {/* What's included section */}

        <div className="flex md:hidden  md:max-w-[565px] items-center mx-auto gap-[10.45px] md:gap-[21px] mb-[30px]">
          <div>
            <CustomImage
              src={`/WL/money.png`}
              width={500}
              height={500}
              className="md:w-[120px] md:h-[120px] w-[60px] h-[60px] object-cover"
            />
          </div>
          <div className="max-w-[280px]">
            <h1 className="subheaders-font md:text-[26px] font-[550] mb-[10px] text-[18px] leading-[100%] tracking-[-0.03em] align-middle">
              180-Day Money-back Guarantee
            </h1>
            <p className=" font-normal md:text-[16px] text-[#000000CC] text-[14px] ">
              You’ll lose weight and feel fully satisfied with our program. Or
              you’ll receive a prompt, full refund.
            </p>
          </div>
        </div>

        {/* Not sure which one is best? card */}
        <div className="flex items-center md:max-w-[565px] mx-auto gap-4 p-4 rounded-2xl bg-[#F5F5F5] shadow-sm overflow-hidden md:mb-[30px]">
          <div className="flex-shrink-0 w-[90px] h-[60px] rounded-xl overflow-hidden">
            <CustomImage
              src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/wl_not_sure.png"
              width="90"
              height="60"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-[500] sm:text-[16px] text-[14px] leading-[140%] tracking-[-2%] text-[#000] mb-1">
              Not sure which one is best?
            </div>
            <div className="sm:text-[14px] text-[12px] font-[400] leading-[140%] tracking-[-2%] text-[#000] ">
              You can review your options with a clinician after checkout
            </div>
          </div>
        </div>

        <div className="hidden md:flex  md:max-w-[565px] items-center mx-auto gap-[10.45px] md:gap-[21px]">
          <div>
            <CustomImage
              src={`/WL/money.png`}
              width={500}
              height={500}
              className="md:w-[120px] md:h-[120px] w-[60px] h-[60px] object-cover"
            />
          </div>
          <div className="md:max-w-[404px]">
            <h1 className="subheaders-font md:text-[26px] font-[550] mb-[10px] text-[18px] leading-[100%] tracking-[-0.03em] align-middle">
              180-Day Money-back Guarantee
            </h1>
            <p className=" font-normal md:text-[16px] text-[#000000CC] text-[14px] ">
              You’ll lose weight and feel fully satisfied with our program. Or
              you’ll receive a prompt, full refund.
            </p>
          </div>
        </div>
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 w-full px-4 py-4 flex items-center justify-center z-50 bg-white">
        <div className="w-[335px] md:w-[520px] max-w-xl flex flex-col gap-3">
          {/* Show more/less options button */}
          {/* {showAlternatives &&
                        alternatives &&
                        alternatives.length > 0 && (
                            <button
                                onClick={handleShowMoreOptions}
                                className="w-full py-3 px-8 rounded-full border border-gray-300 text-black font-medium bg-transparent"
                            >
                                {showMoreOptions
                                    ? "Show less options"
                                    : "Show more options"}
                            </button>
                        )} */}
          <button
            className={`w-full py-3 rounded-full font-medium ${
              isContinueEnabled
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={isContinueEnabled ? handleCheckout : null}
            disabled={!isContinueEnabled || isCheckoutLoading}
          >
            {isCheckoutLoading ? "Processing..." : proceedButtonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenericRecommendationStep;
