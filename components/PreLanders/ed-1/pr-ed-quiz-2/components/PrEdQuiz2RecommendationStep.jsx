"use client";

import { useMemo, useState } from "react";
import EdProductCards from "@/components/EDPreConsultationQuiz/EdProductCards";
import {
  cialisProduct,
  viagraProduct,
  varietyPackProduct,
} from "@/components/EDPreConsultationQuiz/productData";

function ArrowIcon() {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
}

export default function PrEdQuiz2RecommendationStep({
  step,
  onContinue,
  onBack,
}) {
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProductOptions, setSelectedProductOptions] = useState(null);

  const recommendedProductName = step.recommendedProductName || "Cialis + Viagra";
  const allProducts = useMemo(
    () => [cialisProduct, viagraProduct, varietyPackProduct],
    [],
  );
  const recommendedProduct =
    allProducts.find((p) => p.name === recommendedProductName) || varietyPackProduct;
  const canContinue = Boolean(selectedProduct && selectedProductOptions);

  const handleProductSelect = (product, options) => {
    setSelectedProduct(product);
    setSelectedProductOptions(options);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    onContinue?.({
      label: selectedProduct?.name || "",
      subtitle: selectedProductOptions?.preference
        ? `${selectedProductOptions.preference} / ${selectedProductOptions.pillCount || ""} pills`
        : "",
      product: selectedProduct,
      productOptions: selectedProductOptions,
    });
  };

  return (
    <section className="wizard-content mx-auto w-full max-w-6xl px-4 pb-16">
      <div className="mx-auto max-w-xl pt-2">
        <button
          type="button"
          onClick={() => onBack?.()}
          className="inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-[#AE7E56]"
          aria-label="Go back"
        >
          <span className="text-lg">←</span>
        </button>
      </div>

      <div className="mx-auto mt-6 max-w-xl">
        <div className="w-full px-0">
          <div className="mb-2 text-[#A7885A]">
            <span className="poppins-font text-sm font-medium">
              {step.eyebrow || "Here's what we recommended"}
            </span>
          </div>
          <div className="mb-5 h-[8px] w-full rounded-[10px] bg-gray-200">
            <div className="h-[8px] w-full rounded-[10px] bg-[#A7885A]" />
          </div>
        </div>

        <div className="text-center">
          <h2 className="headers-font my-4 text-[26px] md:text-[32px]">
            {step.headline || "Your treatment plan"}
          </h2>
        </div>

        <div className="flex flex-col items-center">
          <div className="relative w-full md:w-[380px]">
            <div className="absolute left-0 right-0 top-0 z-0 h-10 rounded-t-xl bg-[#AE7E56] py-1 text-center text-white">
              <span className="inline-block -translate-y-1 text-[12px] leading-[140%]">
                Recommended
              </span>
            </div>
            <div className="relative z-10 mt-[20px] w-full rounded-lg">
              <EdProductCards
                product={recommendedProduct}
                isRecommended
                onSelect={handleProductSelect}
                isSelected={selectedProduct?.name === recommendedProduct.name}
              />
            </div>
          </div>

          {showMoreOptions ? (
            <div className="my-6 flex w-full flex-col gap-4 md:w-[380px]">
              {recommendedProduct.name !== "Cialis" ? (
                <EdProductCards
                  product={cialisProduct}
                  onSelect={handleProductSelect}
                  isSelected={selectedProduct?.name === cialisProduct.name}
                />
              ) : null}
              {recommendedProduct.name !== "Viagra" ? (
                <EdProductCards
                  product={viagraProduct}
                  onSelect={handleProductSelect}
                  isSelected={selectedProduct?.name === viagraProduct.name}
                />
              ) : null}
              {recommendedProduct.name !== "Cialis + Viagra" ? (
                <EdProductCards
                  product={varietyPackProduct}
                  onSelect={handleProductSelect}
                  isSelected={selectedProduct?.name === varietyPackProduct.name}
                />
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex w-full justify-center">
            <button
              type="button"
              onClick={() => setShowMoreOptions((v) => !v)}
              className="poppins-font w-full rounded-full border border-gray-300 bg-transparent px-8 py-3 font-medium text-black md:w-[380px]"
            >
              {showMoreOptions ? "Show less options" : "Show more options"}
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="headers-font relative mt-10 flex w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#2d2c2a] to-[#141312] px-6 py-4 text-base font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span>{step.ctaLabel || "Continue"}</span>
          <span className="ml-3 inline-flex" aria-hidden>
            <ArrowIcon />
          </span>
        </button>
      </div>
    </section>
  );
}
