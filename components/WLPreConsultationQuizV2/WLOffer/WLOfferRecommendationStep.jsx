"use client";
import React, { useEffect, useState, useRef } from "react";
import { logger } from "@/utils/devLogger";
import Variations from "../components/Variations";
import { useRouter } from "next/navigation";
import { wlFlowAddToCart, addToCartDirectly } from "@/utils/flowCartHandler";
import CustomImage from "@/components/utils/CustomImage";
import { addRequiredConsultation } from "@/utils/requiredConsultation";
import Loader from "@/components/Loader";
import { trackMetaProductSelection } from "@/utils/metaQuestionnaireTracking";

// Weight loss product IDs that require consultation
const WEIGHT_LOSS_PRODUCT_IDS = [
  "489523", // Compounded Tirzepatide
  "489798", // Compounded Semaglutide
  "489778", // Compounded Semaglutide (Segmented)
  "142975", // OZEMPIC
  "160468", // MOUNJARO
  "250827", // WEGOVY
  "369618", // RYBELSUS
];

// Isolated recommendation step for wl-offer-pre-consultation
// This is separate from GenericRecommendationStep to allow custom features
const WLOfferRecommendationStep = ({
  recommended,
  alternatives,
  selectedProduct,
  setSelectedProduct,
  onContinue,
  ProductCard, // Product card component to use
  showAlternatives = true,
  variations = [],
  showIncluded = true,
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
        (p) => String(p.id) === String(selectedProduct.id)
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
        (alt) => alt.id === selectedProduct.id
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

    try {
      trackMetaProductSelection({
        flow_id: "weight-loss",
        questionnaire_id: "wl-offer",
        content_id: String(selectedProduct.id || ""),
        selection_type: "product",
        selection_value: selectedProduct.id || "",
      });
    } catch (_) {}

    try {
      setIsCheckoutLoading(true);

      logger.log("Selected Product ->", selectedProduct);
      
      // Check if this is the special offer product (489798)
      // If so, only add the offer product (489780) instead of the selected product
      let mainProductForCheckout;
      const addons = [];
      let useWlFlow = true;
      
      if (String(selectedProduct.id) === "489798") {
        // Replace with offer product instead of adding the selected product
        mainProductForCheckout = {
          id: "489780",
          name: "[GLP-1] Buy 2 Get 1 Free",
          quantity: 1,
          isSubscription: false,
        };
        useWlFlow = false; // Use ED flow to avoid adding Body Optimization Program
        logger.log("🛒 Adding only offer product (489780) for Compounded Semaglutide selection - using ED flow to skip consultation");
      } else {
        // Normal flow: add the selected product
        mainProductForCheckout = {
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
      }

      logger.log(
        "🛒 Starting WL Offer direct cart addition:",
        mainProductForCheckout,
        "with addons:",
        addons,
        "Flow type:",
        useWlFlow ? "wl" : "ed"
      );

      // Use appropriate cart handler based on product type
      const result = useWlFlow
        ? await wlFlowAddToCart(mainProductForCheckout, addons, {
            requireConsultation: true,
          })
        : await addToCartDirectly(mainProductForCheckout, addons, "ed", {
            requireConsultation: false,
            preserveExistingCart: false,
          });

      if (result.success) {
        logger.log(
          "✅ WL Offer cart addition successful, redirecting to:",
          result.redirectUrl
        );

        // Clear all localStorage keys used in WL flow before redirecting
        try {
          if (typeof window !== "undefined" && window.localStorage) {
            // Remove WL flow navigation key (same as bo-pre-consultation)
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
            e
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
        logger.error("❌ WL Offer cart addition failed:", result.error);
        alert("There was an issue processing your checkout. Please try again.");
      }
    } catch (error) {
      logger.error("Error during WL Offer checkout:", error);
      alert("There was an issue processing your checkout. Please try again.");
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const isContinueEnabled = selectedProduct !== null;

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
    <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 flex flex-col min-h-screen relative pb-32">
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
        <h2 className="text-2xl font-semibold text-start text-[#000000] my-6">
          Your treatment plan
        </h2>

        {/* Recommended Product */}
        <div className="mb-6">
          <ProductCard
            product={recommended}
            variations={variations}
            onSelect={(product) => setSelectedProduct(product)}
            isSelected={selectedProduct?.id === recommended?.id}
          />

          {variations.length > 0 && (
            <>
              <Variations
                variations={variations}
                selectedVariation={selectedProduct}
                onSelectVariation={(variation) => {
                  setSelectedProduct(variation);
                }}
              />
            </>
          )}
        </div>

        {/* Alternative Products */}
        {showAlternatives &&
          showMoreOptions &&
          alternatives &&
          alternatives.length > 0 && (
            <div className="space-y-4 mb-6">
              {alternatives.map((product) => (
                <ProductCard
                  key={product.id ?? product.name}
                  product={product}
                  onSelect={(product) => setSelectedProduct(product)}
                  isSelected={selectedProduct?.id === product.id}
                />
              ))}
            </div>
          )}

        {/* What's included section */}
        {showIncluded && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">What's included:</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 border-b border-[#E2E2E1] pt-4 pb-4">
                {/* Icon placeholder */}
                <span className="text-[#B4845A]">
                  <CustomImage
                    src="https://myrocky.b-cdn.net/WP%20Images/bo3/reminder_medical_1.png"
                    width="35"
                    height="35"
                  />
                </span>
                <div>
                  <div className="font-medium text-[14px]">
                    Virtual appointment upon request
                  </div>
                </div>
              </li>
              <li className="flex items-center  gap-3 border-b border-[#E2E2E1] pt-4 pb-4">
                <span className="text-[#B4845A]">
                  <CustomImage
                    src="https://myrocky.b-cdn.net/WP%20Images/bo3/chat1.png"
                    width="24"
                    height="24"
                  />
                </span>
                <div>
                  <div className="font-medium text-[14px]">
                    24/7 Medical Support
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3 border-b border-[#E2E2E1] pt-4 pb-4">
                <span className="text-[#B4845A]">
                  <CustomImage
                    src="https://myrocky.b-cdn.net/WP%20Images/bo3/microscope1.png"
                    width="40"
                    height="40"
                  />
                </span>
                <div>
                  <div className="font-medium text-[14px]">
                    Review of Lab Work
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3 border-b border-[#E2E2E1] pt-4 pb-4">
                <span className="text-[#B4845A]">
                  <CustomImage
                    src="https://myrocky.b-cdn.net/WP%20Images/bo3/stethoscope2.png"
                    width="30"
                    height="30"
                  />
                </span>
                <div>
                  <div className="font-medium text-[14px]">
                    FDA-Approved Treatments
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3 border-b border-[#E2E2E1] pt-4 pb-4">
                <span className="text-[#B4845A]">
                  <CustomImage
                    src="https://myrocky.b-cdn.net/WP%20Images/bo3/ibm1.png"
                    width="30"
                    height="30"
                  />
                </span>
                <div>
                  <div className="font-medium text-[14px]">
                    Health Coaching by Licensed Clinicians
                  </div>
                </div>
              </li>
              <li className="flex items-center gap-3 border-b border-[#E2E2E1] pt-4 pb-4">
                <span className="text-[#B4845A]">
                  <CustomImage
                    src="https://myrocky.b-cdn.net/WP%20Images/bo3/ibm.png"
                    width="24"
                    height="24"
                  />
                </span>
                <div>
                  <div className="font-medium">
                    Nutrition and lifestyle tips
                  </div>
                </div>
              </li>
            </ul>
          </div>
        )}

        {/* Privacy text */}
        <PrivacyText />
      </div>

      {/* Continue Button */}
      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-white">
        <div className="w-[335px] md:w-[520px] max-w-xl flex flex-col gap-3">
          {/* Show more/less options button */}
          {showAlternatives && alternatives && alternatives.length > 0 && (
            <button
              onClick={handleShowMoreOptions}
              className="w-full py-3 px-8 rounded-full border border-gray-300 text-black font-medium bg-transparent"
            >
              {showMoreOptions ? "Show less options" : "Show more options"}
            </button>
          )}
          <button
            className={`w-full py-3 rounded-full font-medium ${
              isContinueEnabled
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
            onClick={isContinueEnabled ? handleCheckout : null}
            disabled={!isContinueEnabled || isCheckoutLoading}
          >
            {isCheckoutLoading
              ? "Processing..."
              : `Proceed - ${selectedProduct?.price || ""} →`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WLOfferRecommendationStep;
