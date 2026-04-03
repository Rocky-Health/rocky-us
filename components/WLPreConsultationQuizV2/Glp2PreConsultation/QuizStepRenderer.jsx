import React, { useState } from "react";
import { glp2PreConsultationConfig } from "./config/glp2PreConsultationConfig";
import Glp2GenericQuestionStep from "./components/Glp2GenericQuestionStep";
import Glp2PlanSelectionStep from "./components/Glp2PlanSelectionStep";
import Glp2RecommendationStep from "./components/Glp2RecommendationStep";
import Glp2TreatmentAndPlanStep from "./components/Glp2TreatmentAndPlanStep";
import { getProductRecommendation } from "../utils/recommendationEngine";

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
  const stepConfig = glp2PreConsultationConfig.steps[currentStep];

  // Handle plan selection step (step 17) - for Compounded Tirzepatide/Semaglutide
  if (currentStep === 17) {
    // Pick plan options specific to the selected product (Tirz vs Sema pricing differs)
    const productPlanOptions = selectedProduct
      ? glp2PreConsultationConfig.planOptions[String(selectedProduct.id)]
      : null;

    return (
      <Glp2PlanSelectionStep
        product={selectedProduct}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        planOptions={productPlanOptions}
        planInclusions={glp2PreConsultationConfig.planInclusions}
        onBack={handleBack}
        onContinue={handlePlanStepCheckout}
      />
    );
  }

  // Handle recommendation step (step 16)
  if (currentStep === 16) {
    const recommendation = getProductRecommendation(
      userData,
      glp2PreConsultationConfig.recommendationRules,
    );

    return (
      <Glp2TreatmentAndPlanStep
        {...recommendation}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        planOptionsByProduct={glp2PreConsultationConfig.planOptions}
        onContinue={handlePlanStepCheckout}
      />
    );
  }

  // Handle completion or invalid step
  if (!stepConfig) {
    return (
      <div className="w-full md:w-[580px] mx-auto px-5 md:px-0 mt-6">
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
    <Glp2GenericQuestionStep
      stepConfig={stepConfig}
      userData={userData}
      setUserData={setUserData}
      onContinue={handleContinue}
      onAction={handleAction}
    />
  );
};

export default QuizStepRenderer;
