import React, { useState } from "react";
import { boSimplifiedConfig } from "./config/boSimplifiedConfig";
import GenericQuestionStep from "../components/GenericQuestionStep";
import GenericRecommendationStep from "../components/GenericRecommendationStep";
import BOSimplifiedPlanSelectionStep from "./components/BOSimplifiedPlanSelectionStep";
import { getProductRecommendation } from "../utils/recommendationEngine";
import WLProductCard from "../components/WLProductCard";

const COMPOUNDED_PRODUCT_IDS = ["489523", "489798"];

const QuizStepRenderer = ({
  currentStep,
  userData,
  setUserData,
  selectedProduct,
  setSelectedProduct,
  handleContinue,
  handleBack,
  handleAction,
  handleRecommendationContinue,
  goToStep,
  handlePlanStepCheckout,
}) => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const stepConfig = boSimplifiedConfig.steps[currentStep];

  // Handle plan selection step (step 8) - for Compounded Tirzepatide/Semaglutide
  if (currentStep === 8) {
    return (
      <BOSimplifiedPlanSelectionStep
        product={selectedProduct}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        planOptions={boSimplifiedConfig.planOptions}
        planInclusions={boSimplifiedConfig.planInclusions}
        onBack={handleBack}
        onContinue={handlePlanStepCheckout}
      />
    );
  }

  // Handle recommendation step (step 7)
  if (currentStep === 7) {
    const recommendation = getProductRecommendation(
      userData,
      boSimplifiedConfig.recommendationRules,
    );

    const shouldShowPlanStep = (product) =>
      product && COMPOUNDED_PRODUCT_IDS.includes(String(product.id));

    return (
      <GenericRecommendationStep
        {...recommendation}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        onContinue={handleRecommendationContinue}
        ProductCard={WLProductCard}
        showAlternatives={true}
        onBeforeCheckout={shouldShowPlanStep}
        onNavigateToPlanStep={() => goToStep(8)}
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
