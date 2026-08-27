import React from "react";
import dynamic from "next/dynamic";
import { nadPlusQuizConfig } from "./config/nadPlusQuizConfig";

const NadPlusPlanStep = dynamic(() => import("./components/NadPlusPlanStep"));
const Glp2DobStep = dynamic(() => import("./components/Glp2DobStep"));
const Glp2ContactAuthStep = dynamic(() =>
  import("./components/Glp2ContactAuthStep")
);
const Glp1MedicalReviewPersonalStep = dynamic(() =>
  import("./components/Glp1MedicalReviewPersonalStep")
);
const NadPlusPriorityStep = dynamic(() =>
  import("./components/NadPlusPriorityStep")
);
const NadPlusEnergyStep = dynamic(() =>
  import("./components/NadPlusEnergyStep")
);
const NadPlusMentalPerformanceStep = dynamic(() =>
  import("./components/NadPlusMentalPerformanceStep")
);
const NadPlusCellularScienceStep = dynamic(() =>
  import("./components/NadPlusCellularScienceStep")
);
const NadPlusTestimonialStep = dynamic(() =>
  import("./components/NadPlusTestimonialStep")
);
const NadPlusGenderHeightWeightStep = dynamic(() =>
  import("./components/NadPlusGenderHeightWeightStep")
);
const NadPlusMedicalConditionsStep = dynamic(() =>
  import("./components/NadPlusMedicalConditionsStep")
);
const Glp1FemaleSafetyFirstStep = dynamic(() =>
  import("./components/Glp1FemaleSafetyFirstStep")
);
const NadPlusAgingEffectsStep = dynamic(() =>
  import("./components/NadPlusAgingEffectsStep")
);
const NadPlusWeightChangedStep = dynamic(() =>
  import("./components/NadPlusWeightChangedStep")
);
const NadPlusLastQuestionStep = dynamic(() =>
  import("./components/NadPlusLastQuestionStep")
);
const NadPlusPersonalInfoStep = dynamic(() =>
  import("./components/NadPlusPersonalInfoStep")
);
const QuizStepRenderer = ({
  currentStep,
  userData,
  setUserData,
  handleContinue,
  handleAction,
  handlePlanStepCheckout,
  onQuizChromeVisibilityChange,
}) => {
  const stepConfig = nadPlusQuizConfig.steps[currentStep];

  if (stepConfig?.type === "nadPlusPriority") {
    return (
      <NadPlusPriorityStep
        stepConfig={stepConfig}
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "nadPlusEnergy") {
    return (
      <NadPlusEnergyStep
        stepConfig={stepConfig}
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "nadPlusMentalPerformance") {
    return (
      <NadPlusMentalPerformanceStep
        stepConfig={stepConfig}
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "nadPlusCellularScience") {
    return (
      <NadPlusCellularScienceStep
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "nadPlusTestimonial") {
    return (
      <NadPlusTestimonialStep
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "nadPlusGenderHeightWeight") {
    return (
      <NadPlusGenderHeightWeightStep
        stepConfig={stepConfig}
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "nadPlusFemaleSafety") {
    return (
      <Glp1FemaleSafetyFirstStep
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
        onAction={handleAction}
      />
    );
  }

  if (stepConfig?.type === "nadPlusMedicalConditions") {
    return (
      <NadPlusMedicalConditionsStep
        stepConfig={stepConfig}
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "nadPlusAgingEffects") {
    return (
      <NadPlusAgingEffectsStep
        stepConfig={stepConfig}
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "nadPlusWeightChanged") {
    return (
      <NadPlusWeightChangedStep
        stepConfig={stepConfig}
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "nadPlusLastQuestion") {
    return (
      <NadPlusLastQuestionStep
        stepConfig={stepConfig}
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "nadPlusPersonalInfo") {
    return (
      <NadPlusPersonalInfoStep
        stepConfig={stepConfig}
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
        onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
      />
    );
  }

  if (stepConfig?.type === "glp2Dob") {
    return (
      <Glp2DobStep
        userData={userData}
        setUserData={setUserData}
        onContinue={handleContinue}
      />
    );
  }

  if (stepConfig?.type === "glp1MedicalReviewPersonal") {
    return (
      <Glp1MedicalReviewPersonalStep
        stepConfig={stepConfig}
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

  if (
    stepConfig?.type === "recommendation" ||
    stepConfig?.type === "planSelection"
  ) {
    return <NadPlusPlanStep onContinue={handlePlanStepCheckout} />;
  }

  if (!stepConfig) {
    return (
      <div className="w-full mx-auto px-0 mt-6">
        <h1 className="mb-4 headers-font text-[26px] font-[450] md:font-medium md:text-[32px] md:leading-[115%] leading-[120%] tracking-[-1%] md:tracking-[-2%] text-[#A7885A]">
          Thank you for completing the questionnaire!
        </h1>
        <p className="text-gray-600 mb-6">
          Please check your cart or continue shopping.
        </p>
      </div>
    );
  }

  return null;
};

export default QuizStepRenderer;
