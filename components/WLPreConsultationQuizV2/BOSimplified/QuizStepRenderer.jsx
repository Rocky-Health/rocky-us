import React from "react";
import { boSimplifiedConfig } from "./config/boSimplifiedConfig";
import GenericQuestionStep from "../components/GenericQuestionStep";
import GenericRecommendationStep from "../components/GenericRecommendationStep";
import SkincareProductCard from "../components/SkincareProductCard";
import { getProductRecommendation } from "../utils/recommendationEngine";
import WLProductCard from "../components/WLProductCard";

const QuizStepRenderer = ({
  currentStep,
  userData,
  setUserData,
  selectedProduct,
  setSelectedProduct,
  handleContinue,
  handleAction,
  handleRecommendationContinue,
}) => {
  const stepConfig = boSimplifiedConfig.steps[currentStep];

  // Handle recommendation step (step 7)
  if (currentStep === 7) {
    const recommendation = getProductRecommendation(
      userData,
      boSimplifiedConfig.recommendationRules,
    );

    return (
      <GenericRecommendationStep
        {...recommendation}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        onContinue={handleRecommendationContinue}
        // ProductCard={SkincareProductCard}
        ProductCard={WLProductCard}
        showAlternatives={true}
      />
    );
  }

  // Handle completion or invalid step
  if (!stepConfig) {
    return (
      <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6">
        <h1 className="mb-4 headers-font text-[26px] font-[450] md:font-medium md:text-[32px] md:leading-[115%] leading-[120%] tracking-[-1%] md:tracking-[-2%] text-[#C19A6B]">
          Thank you for completing the questionnaire!
        </h1>
        <p className="text-gray-600 mb-6">
          Please check your cart or continue shopping.
        </p>
      </div>
    );
  }

  // Handle regular quiz steps (BMI Calculator)
  return (
    <GenericQuestionStep
      stepConfig={stepConfig}
      userData={userData}
      setUserData={setUserData}
      onContinue={handleContinue}
      onAction={handleAction}
    />
  );
};

export default QuizStepRenderer;
