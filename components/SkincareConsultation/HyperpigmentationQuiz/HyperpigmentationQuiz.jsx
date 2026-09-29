"use client";

import React, { useState, useEffect } from "react";
import { quizConfig } from "./config/quizConfig";
import GenericPopup from "../components/GenericPopup";
import QuizStepRenderer from "./QuizStepRenderer";
import QuestionnaireNavbar from "../../EdQuestionnaire/QuestionnaireNavbar";
import { ProgressBar } from "../../EdQuestionnaire/ProgressBar";
import { useHyperpigmentationQuiz } from "./hooks/useHyperpigmentationQuiz";
import { useAddItemToCart } from "@/lib/cart/cartHooks";
import SkincareQuizLoader from "../components/SkincareQuizLoader";
import StickyQuizContinueButton from "../components/StickyQuizContinueButton";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";
import { logger } from "@/utils/devLogger";

const HyperpigmentationQuiz = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const quizState = useHyperpigmentationQuiz();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const addItemToCart = useAddItemToCart();

  useQuestionnaireStepTracking({
    questionnaireId: "hyperpigmentation-quiz",
    stepId: quizState.stepIndex,
    stepIndex: quizState.stepIndex,
    flowId: "skincare",
    stepType: "quiz",
  });

  useEffect(() => {
    // Show loader briefly while the quiz state is being restored
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleProceed = async () => {
    if (selectedProduct && !isAddingToCart) {
      try {
        setIsAddingToCart(true);

        // Transform product data for cart
        const cartData = {
          productId: selectedProduct.id,
          quantity: 1,
          name: selectedProduct.name || "Hyperpigmentation Treatment",
          price:
            parseFloat(selectedProduct.price?.replace(/[^0-9.]/g, "")) || 0,
          image: selectedProduct.url || selectedProduct.image || "",
          product_type: "skincare",
        };

        // Ensure minimum loading time for better UX
        const startTime = Date.now();

        await addItemToCart(cartData);

        // Refresh the cart in the navbar
        document.getElementById("cart-refresher")?.click();

        // Ensure at least 1 second of loading for better UX
        const elapsedTime = Date.now() - startTime;
        const minLoadingTime = 1000; // 1 second
        if (elapsedTime < minLoadingTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadingTime - elapsedTime)
          );
        }

        quizState.handleRecommendationNext();
      } catch (error) {
        logger.error("Error adding product to cart:", error);
        // Still proceed to avoid blocking the user
        quizState.handleRecommendationNext();
      } finally {
        setIsAddingToCart(false);
      }
    }
  };

  if (isLoading) {
    return <SkincareQuizLoader />;
  }

  return (
    <div className="min-h-screen">
      {/* Full-screen loading overlay for cart operations */}
      {isAddingToCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white p-8 rounded-lg text-center shadow-2xl">
            <div className="flex flex-col items-center">
              {/* Animated spinner */}
              <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-[#C19A6B] border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Adding to Cart
              </h3>
              <p className="text-sm text-gray-600">
                Please wait while we add your selected product...
              </p>
            </div>
          </div>
        </div>
      )}

      <QuestionnaireNavbar
        onBackClick={quizState.handleBack}
        currentPage={quizState.stepIndex}
        hideBackButton={quizState.stepIndex === 18}
      />

      {/* Progress Bar */}
      {quizState.stepIndex !== 16 &&
        quizState.stepIndex !== 17 &&
        quizState.stepIndex !== 18 && (
          <div className="pt-4 pb-6">
            <ProgressBar progress={quizState.progress} />
          </div>
        )}

      {/* Main content */}
      <div className="flex-1">
        <QuizStepRenderer
          {...quizState}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          onProceed={handleProceed}
          isAddingToCart={isAddingToCart}
          submitFormData={quizState.submitFormData}
        />
      </div>

      {/* Popup */}
      <GenericPopup
        isOpen={!!quizState.popupType}
        popupData={quizConfig.popups[quizState.popupType] || {}}
        onClose={quizState.closePopup}
        onAction={quizState.handleAction}
        isSubmitting={quizState.isSubmittingPopupData}
      />

      {/* Sticky Continue Button Component */}
      <StickyQuizContinueButton quizState={quizState} quizConfig={quizConfig} />
    </div>
  );
};

export default HyperpigmentationQuiz;
