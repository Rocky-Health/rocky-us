"use client";

import { lazy, Suspense } from "react";
import PrEdQuiz2StepFallback from "./PrEdQuiz2StepFallback";

const Ed1QuestionCard = lazy(() =>
  import("@/components/PreLanders/ed-1/Ed1QuestionCard"),
);
const PrEdQuiz2MultiSelectStep = lazy(() => import("./PrEdQuiz2MultiSelectStep"));
const PrEdQuiz2ImageContinueStep = lazy(() => import("./PrEdQuiz2ImageContinueStep"));
const PrEdQuiz2TrustedReviewsStep = lazy(() => import("./PrEdQuiz2TrustedReviewsStep"));
const PrEdQuiz2EligibilityStep = lazy(() => import("./PrEdQuiz2EligibilityStep"));
const PrEdQuiz2StateAvailabilityStep = lazy(() =>
  import("./PrEdQuiz2StateAvailabilityStep"),
);
const PrEdQuiz2HealthInfoIntroStep = lazy(() => import("./PrEdQuiz2HealthInfoIntroStep"));
const PrEdQuiz2SingleSelectQuizStep = lazy(() =>
  import("./PrEdQuiz2SingleSelectQuizStep"),
);
const PrEdQuiz2PatientInfoStep = lazy(() => import("./PrEdQuiz2PatientInfoStep"));
const PrEdQuiz2ProcessingLoaderStep = lazy(() =>
  import("./PrEdQuiz2ProcessingLoaderStep"),
);
const PrEdQuiz2ProductPitchStep = lazy(() => import("./PrEdQuiz2ProductPitchStep"));
const PrEdQuiz2ChartPitchStep = lazy(() => import("./PrEdQuiz2ChartPitchStep"));
const PrEdQuiz2BenefitsPitchStep = lazy(() => import("./PrEdQuiz2BenefitsPitchStep"));
const PrEdQuiz2RecommendationStep = lazy(() =>
  import("./PrEdQuiz2RecommendationStep"),
);
const PrEdQuiz2PlanApprovalStep = lazy(() => import("./PrEdQuiz2PlanApprovalStep"));

function StepBoundary({ children }) {
  return <Suspense fallback={<PrEdQuiz2StepFallback />}>{children}</Suspense>;
}

export default function PrEdQuiz2StepRenderer({
  step,
  selectedAnswer,
  onSelect,
  onUpdateSingleSelectFollowUp,
  onToggleMultiSelect,
  onContinueStep,
  onBack,
  canSelectCurrentStep,
  hasSelectionForCurrentStep,
  ctaHref,
  previousStepAnswer,
  eligibilityAnswer,
  patientInfoAnswer,
  recommendationAnswer,
}) {
  if (!step) return null;

  if (step.type === "multiSelect") {
    return (
      <StepBoundary>
        <PrEdQuiz2MultiSelectStep
          step={step}
          selectedValues={Array.isArray(selectedAnswer) ? selectedAnswer : []}
          onToggle={onToggleMultiSelect}
          onContinue={onContinueStep}
          onBack={onBack}
          canContinue={hasSelectionForCurrentStep}
        />
      </StepBoundary>
    );
  }

  if (step.type === "imageContinue") {
    return (
      <StepBoundary>
        <PrEdQuiz2ImageContinueStep
          step={step}
          onContinue={onContinueStep}
          canContinue={canSelectCurrentStep}
        />
      </StepBoundary>
    );
  }

  if (step.type === "trustedReviews") {
    return (
      <StepBoundary>
        <PrEdQuiz2TrustedReviewsStep
          step={step}
          onContinue={onContinueStep}
          canContinue={canSelectCurrentStep}
        />
      </StepBoundary>
    );
  }

  if (step.type === "eligibilityForm") {
    return (
      <StepBoundary>
        <PrEdQuiz2EligibilityStep
          step={step}
          onContinue={onContinueStep}
          onBack={onBack}
          selectedValues={selectedAnswer}
        />
      </StepBoundary>
    );
  }

  if (step.type === "stateAvailability") {
    const stateFromEligibility = eligibilityAnswer?.state;
    return (
      <StepBoundary>
        <PrEdQuiz2StateAvailabilityStep
          step={step}
          selectedStateCode={
            stateFromEligibility ?? previousStepAnswer?.state
          }
          onContinue={onContinueStep}
        />
      </StepBoundary>
    );
  }

  if (step.type === "healthInfoIntro") {
    return (
      <StepBoundary>
        <PrEdQuiz2HealthInfoIntroStep
          step={step}
          onContinue={onContinueStep}
          canContinue={canSelectCurrentStep}
        />
      </StepBoundary>
    );
  }

  if (step.type === "singleSelectQuiz") {
    return (
      <StepBoundary>
        <PrEdQuiz2SingleSelectQuizStep
          step={step}
          selectedAnswer={selectedAnswer}
          onSelect={onSelect}
          onFollowUpChange={onUpdateSingleSelectFollowUp}
          onContinue={onContinueStep}
          onBack={onBack}
          canContinue={hasSelectionForCurrentStep}
        />
      </StepBoundary>
    );
  }

  if (step.type === "patientInfoForm") {
    return (
      <StepBoundary>
        <PrEdQuiz2PatientInfoStep
          step={step}
          selectedValues={
            selectedAnswer &&
            typeof selectedAnswer === "object" &&
            !Array.isArray(selectedAnswer)
              ? selectedAnswer
              : null
          }
          eligibilityAnswer={eligibilityAnswer}
          onContinue={onContinueStep}
          onBack={onBack}
        />
      </StepBoundary>
    );
  }

  if (step.type === "processingLoader") {
    return (
      <StepBoundary>
        <PrEdQuiz2ProcessingLoaderStep
          step={step}
          destinationHref={ctaHref}
          onAdvance={() => onContinueStep()}
        />
      </StepBoundary>
    );
  }

  if (step.type === "productPitch") {
    return (
      <StepBoundary>
        <PrEdQuiz2ProductPitchStep
          step={step}
          onContinue={onContinueStep}
          canContinue={canSelectCurrentStep}
        />
      </StepBoundary>
    );
  }

  if (step.type === "chartPitch") {
    return (
      <StepBoundary>
        <PrEdQuiz2ChartPitchStep
          step={step}
          onContinue={onContinueStep}
          canContinue={canSelectCurrentStep}
        />
      </StepBoundary>
    );
  }

  if (step.type === "benefitsPitch") {
    return (
      <StepBoundary>
        <PrEdQuiz2BenefitsPitchStep
          step={step}
          onContinue={onContinueStep}
          canContinue={canSelectCurrentStep}
        />
      </StepBoundary>
    );
  }

  if (step.type === "recommendationChoice") {
    return (
      <StepBoundary>
        <PrEdQuiz2RecommendationStep
          step={step}
          onContinue={onContinueStep}
          onBack={onBack}
        />
      </StepBoundary>
    );
  }

  if (step.type === "planApproval") {
    return (
      <StepBoundary>
        <PrEdQuiz2PlanApprovalStep
          step={step}
          onContinue={onContinueStep}
          patientInfoAnswer={patientInfoAnswer}
          recommendationAnswer={recommendationAnswer}
        />
      </StepBoundary>
    );
  }

  return (
    <StepBoundary>
      <Ed1QuestionCard
        step={step.cardStep}
        question={{
          title: step.title,
          options: step.options,
        }}
        selected={selectedAnswer}
        onSelect={onSelect}
        disableOptions={!canSelectCurrentStep}
        ctaHref={ctaHref}
        variant={step.cardVariant || "flow"}
        flowDesktopHeightClass={step.flowDesktopHeightClass}
      />
    </StepBoundary>
  );
}
