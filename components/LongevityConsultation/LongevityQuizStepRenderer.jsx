import React from "react";
import LongevityQuestionStep from "./components/LongevityQuestionStep";
import CompletionStep from "./components/CompletionStep";
import LongevityThankYouStep from "./components/LongevityThankYouStep";
import IdUploadStep from "./components/IdUploadStep";

const LongevityQuizStepRenderer = ({ quizState, quizConfig }) => {
  const {
    stepIndex,
    answers,
    setAnswers,
    handleNext,
    handleAction,
    handleBack,
    handleIdUploadComplete,
    submitFinalConsultation,
    isSubmitting,
    submitError,
    persistScreeningRiskSelection,
  } = quizState;

  if (stepIndex === 99) {
    if (quizConfig.submitOnThankYou) {
      return (
        <LongevityThankYouStep
          onSubmitFinal={submitFinalConsultation}
          submitError={submitError}
        />
      );
    }
    return <CompletionStep onBack={handleBack} />;
  }

  if (stepIndex === 98) {
    return (
      <IdUploadStep
        onComplete={handleIdUploadComplete}
        isSubmitting={isSubmitting}
      />
    );
  }

  const stepConfig = quizConfig.steps[stepIndex];
  if (!stepConfig) return null;

  return (
    <LongevityQuestionStep
      key={stepIndex}
      stepConfig={stepConfig}
      userData={answers}
      setUserData={setAnswers}
      onContinue={handleNext}
      onAction={handleAction}
      onScreeningRiskPersist={persistScreeningRiskSelection}
    />
  );
};

export default LongevityQuizStepRenderer;
