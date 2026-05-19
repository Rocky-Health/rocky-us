import React from "react";
import { glp1PreConsultation3Config } from "./config/glp1PreConsultation3Config";
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
  onQuizChromeVisibilityChange,
}) => {
  const stepConfig = glp1PreConsultation3Config.steps[currentStep];

  if (stepConfig?.type === "glp2Dob") {
    return (
      <Glp2DobStep
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
      />
    );
  }

  if (stepConfig?.type === "glp2ContactAuth") {
    return (
      <Glp2ContactAuthStep
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
      />
    );
  }

  // Recommendation + plan selection (combined component)
  if (
    stepConfig?.type === "recommendation" ||
    stepConfig?.type === "planSelection"
  ) {
    const recommendation = getProductRecommendation(
      userData,
      glp1PreConsultation3Config.recommendationRules,
    );

    // EverFlow Quiz Completed (event 6231) fires from handlePlanStepCheckout
    // in useGlp1PreConsultation3Flow.js, not here — the planSelection step is
    // never mounted because Glp2TreatmentAndPlanStep handles both product +
    // plan inline and its Continue handler redirects straight to checkout.
    return (
      <Glp2TreatmentAndPlanStep
        {...recommendation}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        planOptionsByProduct={glp1PreConsultation3Config.planOptions}
        onContinue={handlePlanStepCheckout}
      />
    );
  }

  // Handle completion or invalid step
  if (!stepConfig) {
    return (
      <div className="w-full mx-auto px-0 mt-6">
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
      onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
    />
  );
};

export default QuizStepRenderer;
