import React from "react";
import { quizConfig } from "./config/quizConfig";
import Glp2DobStep from "../Glp2PreConsultation/components/Glp2DobStep";
import Glp2ContactAuthStep from "../Glp2PreConsultation/components/Glp2ContactAuthStep";
import Glp2TreatmentAndPlanStep from "../Glp2PreConsultation/components/Glp2TreatmentAndPlanStep";
import Glp1GenericQuestionStep from "./components/Glp1GenericQuestionStep";
import { getProductRecommendation } from "../utils/recommendationEngine";
import EverFlowScript from "@/components/EverFlow/EverFlowScript";

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
  const pageConfig = quizConfig.pages?.[currentStep];
  const pageStepIds = pageConfig?.stepIds || [currentStep];
  const pageQuestions = pageStepIds
    .map((stepId) => quizConfig.steps[stepId])
    .filter(Boolean);
  const stepConfig = pageQuestions[0];

  // Handle DOB step
  if (stepConfig?.type === "glp2Dob") {
    return (
      <Glp2DobStep
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
      />
    );
  }

  // Handle Contact/Auth step
  if (stepConfig?.type === "glp2ContactAuth") {
    return (
      <Glp2ContactAuthStep
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
      />
    );
  }

  // Handle recommendation + plan selection in one combined step
  if (
    stepConfig?.type === "recommendation" ||
    stepConfig?.type === "planSelection"
  ) {
    const recommendation = getProductRecommendation(
      userData,
      quizConfig.recommendationRules,
    );

    return (
      <>
        {stepConfig?.type === "planSelection" && (
          <EverFlowScript
            mode="event"
            offerId={5094}
            eventId={6227}
            network="rcr73qtl"
          />
        )}
        <Glp2TreatmentAndPlanStep
          {...recommendation}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          planOptionsByProduct={quizConfig.planOptions}
          onContinue={handlePlanStepCheckout}
        />
      </>
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
    <Glp1GenericQuestionStep
      stepConfig={stepConfig}
      questions={pageQuestions}
      userData={userData}
      setUserData={setUserData}
      onContinue={handleContinue}
      onAction={handleAction}
    />
  );
};

export default QuizStepRenderer;
