import React from "react";
import { boSimplifiedConfig } from "../BOSimplified/config/boSimplifiedConfig";
import GenericQuestionStep from "../components/GenericQuestionStep";
import Glp2TreatmentAndPlanStep from "../Glp2PreConsultation/components/Glp2TreatmentAndPlanStep";
import { getProductRecommendation } from "../utils/recommendationEngine";

const QuizStepRenderer = ({
  currentStep,
  userData,
  setUserData,
  selectedProduct,
  setSelectedProduct,
  handleContinue,
  handleAction,
}) => {
  const stepConfig = boSimplifiedConfig.steps[currentStep];

  // Steps 7 and 8 — combined "Select Treatment" + plan selection.
  // Uses Glp2TreatmentAndPlanStep with NO onContinue, so the component falls
  // through to its built-in glp2 checkout (sends ?glp2-checkout=1 query param,
  // base product ID — matches /glp2-pre-consultation behavior exactly).
  if (currentStep === 7 || currentStep === 8) {
    const recommendation = getProductRecommendation(
      userData,
      boSimplifiedConfig.recommendationRules,
    );

    return (
      <Glp2TreatmentAndPlanStep
        {...recommendation}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        planOptionsByProduct={boSimplifiedConfig.planOptions}
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

  // Handle regular quiz steps (BMI Calculator, forms, etc.)
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
