import React from "react";
import { glp2PreConsultationConfig } from "./config/glp2PreConsultationConfig";
import Glp2GenericQuestionStep from "./components/Glp2GenericQuestionStep";
import Glp2TreatmentAndPlanStep from "./components/Glp2TreatmentAndPlanStep";
import Glp2DobStep from "./components/Glp2DobStep";
import Glp2ContactAuthStep from "./components/Glp2ContactAuthStep";
import { getProductRecommendation } from "../utils/recommendationEngine";

const QuizStepRenderer = ({
  currentStep,
  userData,
  setUserData,
  selectedProduct,
  setSelectedProduct,
  handleContinue,
  handleAction,
  handlePlanStepCheckout,
}) => {
  const stepConfig = glp2PreConsultationConfig.steps[currentStep];

  // Handle DOB step (step 12)
  if (currentStep === 12 && stepConfig?.type === "glp2Dob") {
    return (
      <Glp2DobStep
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
      />
    );
  }

  // Handle Contact/Auth step (step 14)
  if (currentStep === 14 && stepConfig?.type === "glp2ContactAuth") {
    return (
      <Glp2ContactAuthStep
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
      />
    );
  }

  // Handle recommendation + plan selection in one combined step
  if (currentStep === 16 || currentStep === 17) {
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
