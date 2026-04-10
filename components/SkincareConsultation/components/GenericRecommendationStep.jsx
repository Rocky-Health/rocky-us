import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Variations from "./Variations";
import { addToCartAndRedirect } from "@/utils/crossSellCheckout";
import { skincareFlowAddToCart } from "@/utils/flowCartHandler";
import { logger } from "@/utils/devLogger";
import { trackMetaProductSelection } from "@/utils/metaQuestionnaireTracking";

const GenericRecommendationStep = ({
  recommended,
  alternatives,
  selectedProduct,
  setSelectedProduct,
  onContinue,
  ProductCard, // Product card component to use
  showAlternatives = true,
  variations = [],
  isAddingToCart = false,
}) => {
  const router = useRouter();
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [hasSelectedAlternative, setHasSelectedAlternative] = useState(false);

  // Privacy text component
  const PrivacyText = () => (
    <p className="text-xs text-[#212121] my-1 md:my-4">
      We respect your privacy. All of your information is securely stored on our
      HIPAA Compliant server.
    </p>
  );

  useEffect(() => {
    // Auto-select the recommended product
    if (recommended && !selectedProduct) {
      setSelectedProduct(recommended);
    }
  }, [recommended, setSelectedProduct]);

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

  // Handle direct checkout process
  const handleCheckout = async () => {
    if (!selectedProduct) {
      alert("Please select a product to continue");
      return;
    }

    try {
      trackMetaProductSelection({
        flow_id: "skincare",
        questionnaire_id: "skincare-quiz",
        content_id: String(selectedProduct.id || ""),
        selection_type: "product",
        selection_value: selectedProduct.id || "",
      });
    } catch (_) {}

    try {
      setIsCheckoutLoading(true);

      // Prepare the main product for checkout
      const mainProduct = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        quantity: 1,
        isSubscription: selectedProduct.isSubscription || false,
      };

      logger.log("Proceeding to skincare checkout with:", mainProduct);

      // Use the new direct cart handler
      const result = await skincareFlowAddToCart(mainProduct, [], {
        requireConsultation: true,
      });

      if (result.success) {
        setIsCheckoutLoading(false);
        router.push(result.redirectUrl);

        // Call onContinue if provided (for any additional logic)
        if (typeof onContinue === "function") {
          onContinue();
        }
      } else {
        logger.error("Skincare checkout failed:", result.error);
        setIsCheckoutLoading(false);
        alert("There was an issue processing your checkout. Please try again.");
      }
    } catch (error) {
      logger.error("Error during skincare checkout:", error);
      setIsCheckoutLoading(false);
      alert("There was an issue processing your checkout. Please try again.");
    }
  };

  const isContinueEnabled = selectedProduct !== null;

  // Filter alternatives to show
  const alternativesToShow = () => {
    if (
      !showAlternatives ||
      !showMoreOptions ||
      !alternatives ||
      alternatives.length === 0
    ) {
      return [];
    }

    // If an alternative is selected, only show that one
    if (hasSelectedAlternative) {
      return alternatives.filter((alt) => alt.id === selectedProduct?.id);
    }

    // Otherwise show all alternatives
    return alternatives;
  };

  const shouldShowMore = alternativesToShow().length > 0;

  // Loading overlay
  if (isCheckoutLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
        <div className="bg-white p-8 rounded-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg font-medium">Adding to Cart...</p>
          <p className="text-sm text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

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
    <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 flex flex-col min-h-screen">
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

        {/* Recommended Product - hide when alternative is selected */}
        {!hasSelectedAlternative && (
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
        )}

        {/* Alternative Products */}
        <div
          className="space-y-4 mb-6"
          style={{ display: shouldShowMore ? "block" : "none" }}
        >
          {alternativesToShow().map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onSelect={(product) => setSelectedProduct(product)}
              isSelected={selectedProduct?.id === product.id}
            />
          ))}
        </div>

        {/* Show more/less options button */}
        {showAlternatives && alternatives && alternatives.length > 0 && (
          <button
            onClick={handleShowMoreOptions}
            className="w-full py-3 px-8 rounded-full border border-gray-300 text-black font-medium bg-transparent mb-6"
          >
            {showMoreOptions && !hasSelectedAlternative
              ? "Show less options"
              : "Show more options"}
          </button>
        )}

        {/* Privacy text */}
        <PrivacyText />
      </div>

      {/* Continue Button */}
      <div className="sticky bottom-0 py-4 z-30">
        <button
          className={`w-full py-3 rounded-full font-medium flex items-center justify-center ${
            isContinueEnabled && !isAddingToCart
              ? "bg-black text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={onContinue}
          disabled={!isContinueEnabled || isAddingToCart}
        >
          {isAddingToCart ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Adding to Cart...
            </>
          ) : isCheckoutLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Processing...
            </>
          ) : (
            `Proceed - ${selectedProduct?.price || ""} →`
          )}
        </button>
      </div>
    </div>
  );
};

export default GenericRecommendationStep;
