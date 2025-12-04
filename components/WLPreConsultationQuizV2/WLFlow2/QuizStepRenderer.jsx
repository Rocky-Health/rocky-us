import React from "react";
import { quizConfig } from "./config/quizConfig";
import GenericQuestionStep from "../components/GenericQuestionStep";
import GenericRecommendationStep from "../components/GenericRecommendationStep";
import SkincareProductCard from "../components/SkincareProductCard";
import { getProductRecommendation } from "../utils/recommendationEngine";

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
  const stepConfig = quizConfig.steps[currentStep];

  // Handle recommendation step (step 9)
  if (currentStep === 12 ) {
    const recommendation = getProductRecommendation(
      userData,
      quizConfig.recommendationRules
    );

    return (
      <GenericRecommendationStep
        {...recommendation}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        onContinue={handleRecommendationContinue}
        ProductCard={SkincareProductCard}
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

  // Handle regular quiz steps
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
