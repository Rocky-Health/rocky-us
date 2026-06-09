import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LongevityQuestionStep from "./components/LongevityQuestionStep";
import CompletionStep from "./components/CompletionStep";
import LongevityThankYouStep from "./components/LongevityThankYouStep";
import IdUploadStep from "./components/IdUploadStep";
import { useQuizSequence } from "@/lib/questionnaire/useQuizSequence";
import QuestionnaireIntermission from "@/components/OrderReceived/QuestionnaireIntermission";

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

  const router = useRouter();
  const {
    showIntermission: longevityShowIntermission,
    intermissionProps: longevityIntermissionProps,
    handleQuizComplete: longevityHandleQuizComplete,
  } = useQuizSequence(router);

  // Fire sequence check when Longevity quiz reaches step 99 (completion)
  const longevitySequenceCheckedRef = useRef(false);
  useEffect(() => {
    if (stepIndex === 99 && !longevitySequenceCheckedRef.current) {
      longevitySequenceCheckedRef.current = true;
      longevityHandleQuizComplete();
    }
  }, [stepIndex, longevityHandleQuizComplete]);

  if (stepIndex === 99) {
    // If a sequence is active and we have more quizzes, show the intermission
    if (longevityShowIntermission && longevityIntermissionProps) {
      return (
        <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6 pb-24">
          <QuestionnaireIntermission {...longevityIntermissionProps} />
        </div>
      );
    }

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
