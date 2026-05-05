import React, { useEffect } from "react";
import WLProductCard from "../WLProductCard";
import { formatPriceUI } from "@/utils/priceFormatter";

const ProductRecommendationsStep = ({
  products,
  selectedProduct,
  setSelectedProduct,
  showMoreOptions,
  setShowMoreOptions,
  onContinue,
  isLoading = false,
}) => {
  const PrivacyText = () => (
    <p className="text-xs text-[#212121] my-1 md:my-4">
      We respect your privacy. All of your information is securely stored on our
      HIPAA Compliant server.
    </p>
  );

  useEffect(() => {
    setSelectedProduct(products.COMPOUNDED_TIRZEPATIDE);
  }, [products.COMPOUNDED_TIRZEPATIDE]);

  const handleShowMoreOptions = () => {
    if (showMoreOptions) {
      setSelectedProduct(products.COMPOUNDED_TIRZEPATIDE);
    }
    setShowMoreOptions(!showMoreOptions);
  };

  const isContinueEnabled = selectedProduct !== null;

  return (
    <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 flex flex-col min-h-screen">
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
        <h2 className="text-2xl font-semibold text-start text-[#000000] my-6">
          Your treatment plan
        </h2>

        <div className="mb-6">
          <WLProductCard
            product={products.COMPOUNDED_TIRZEPATIDE}
            isRecommended={true}
            onSelect={(product) => setSelectedProduct(product)}
            isSelected={selectedProduct?.id === products.COMPOUNDED_TIRZEPATIDE.id}
          />
        </div>

        {showMoreOptions && (
          <div className="space-y-4 mb-6">
            <WLProductCard
              product={products.COMPOUNDED_SEMAGLUTIDE}
              onSelect={(product) => setSelectedProduct(product)}
              isSelected={selectedProduct?.id === products.COMPOUNDED_SEMAGLUTIDE.id}
            />
            <WLProductCard
              product={products.OZEMPIC}
              onSelect={(product) => setSelectedProduct(product)}
              isSelected={selectedProduct?.id === products.OZEMPIC.id}
            />
            <WLProductCard
              product={products.MOUNJARO}
              onSelect={(product) => setSelectedProduct(product)}
              isSelected={selectedProduct?.id === products.MOUNJARO.id}
            />
            <WLProductCard
              product={products.WEGOVY}
              onSelect={(product) => setSelectedProduct(product)}
              isSelected={selectedProduct?.id === products.WEGOVY.id}
            />
            <WLProductCard
              product={products.RYBELSUS}
              onSelect={(product) => setSelectedProduct(product)}
              isSelected={selectedProduct?.id === products.RYBELSUS.id}
            />
          </div>
        )}

        <button
          onClick={handleShowMoreOptions}
          className="w-full py-3 px-8 rounded-full border border-gray-300 text-black font-medium bg-transparent mb-6"
        >
          {showMoreOptions ? "Show less options" : "Show more options"}
        </button>
        <PrivacyText />
      </div>

      <div className="sticky bottom-0 py-4 z-30">
        <button
          className={`w-full py-3 rounded-full font-medium flex items-center justify-center gap-2 ${
            isContinueEnabled
              ? "bg-black text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={isContinueEnabled ? onContinue : null}
          disabled={!isContinueEnabled || isLoading}
          title={
            !isContinueEnabled ? "Please select a product to continue" : ""
          }
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Adding to cart...</span>
            </>
          ) : (
            <>Proceed - ${selectedProduct ? formatPriceUI(selectedProduct.price) : ""} →</>
          )}
        </button>
        {!isContinueEnabled && (
          <p className="text-center text-sm text-red-500 mt-2">
            Please select a product to continue
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductRecommendationsStep;
