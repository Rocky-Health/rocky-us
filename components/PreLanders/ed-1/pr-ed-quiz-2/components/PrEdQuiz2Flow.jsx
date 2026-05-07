"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  PR_ED_QUIZ2_PATIENT_STORAGE_KEY,
  usePrEdQuiz2Flow,
} from "../hooks/usePrEdQuiz2Flow";
import { prEdQuiz2Config } from "../config/prEdQuiz2Config";
import PrEdQuiz2StepRenderer from "./PrEdQuiz2StepRenderer";
import PrEdQuiz2DisqualificationModal from "./PrEdQuiz2DisqualificationModal";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";

/**
 * Step types that get the wider (1120px) content container.
 * multiSelect is the only type that uses the narrower 976px layout.
 */
const WIDE_STEP_TYPES = new Set([
  "imageContinue",
  "trustedReviews",
  "eligibilityForm",
  "stateAvailability",
  "healthInfoIntro",
  "singleSelectQuiz",
  "patientInfoForm",
  "processingLoader",
  "productPitch",
  "chartPitch",
  "benefitsPitch",
  "recommendationChoice",
  "planApproval",
]);

/**
 * Scans all answers for a patient payload `{ firstName, email|phone }`.
 * Used when the step index shifts or answers are restored from sessionStorage.
 */
function pickPatientPayload(answers) {
  if (!answers || typeof answers !== "object") return undefined;
  for (const v of Object.values(answers)) {
    if (
      v &&
      typeof v === "object" &&
      !Array.isArray(v) &&
      typeof v.firstName === "string" &&
      v.firstName.trim() &&
      (typeof v.email === "string" || typeof v.phone === "string")
    ) {
      return v;
    }
  }
  return undefined;
}

export default function PrEdQuiz2Flow({ destinationHref }) {
  const {
    activeStep,
    currentStep,
    totalSteps,
    selectedAnswer,
    canSelectCurrentStep,
    hasSelectionForCurrentStep,
    isFirstStep,
    selectAnswer,
    updateSingleSelectFollowUp,
    toggleMultiSelectAnswer,
    continueStep,
    goBack,
    resolvedDestinationHref,
    answers,
    showDisqualificationModal,
    closeDisqualificationModal,
  } = usePrEdQuiz2Flow(destinationHref);

  // Fire tracking on every step change: URL sync, dataLayer, Clarity, Meta CAPI.
  useQuestionnaireStepTracking({
    questionnaireId: "direct-ed-pre-consultation",
    stepId: activeStep?.id,
    stepIndex: currentStep,
    flowId: "ed",
    stepType: activeStep?.type ?? "other",
  });

  const patientInfoStepIndex = useMemo(
    () => prEdQuiz2Config.steps.findIndex((s) => s.type === "patientInfoForm"),
    [],
  );

  const eligibilityStepIndex = useMemo(
    () => prEdQuiz2Config.steps.findIndex((s) => s.type === "eligibilityForm"),
    [],
  );
  const eligibilityAnswer =
    eligibilityStepIndex >= 0 ? answers[eligibilityStepIndex] : undefined;

  const recommendationStepIndex = useMemo(
    () => prEdQuiz2Config.steps.findIndex((s) => s.type === "recommendationChoice"),
    [],
  );
  const recommendationAnswer =
    recommendationStepIndex >= 0 ? answers[recommendationStepIndex] : undefined;

  // Restore patient info from sessionStorage so plan approval works after refresh.
  const [storedPatient, setStoredPatient] = useState(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PR_ED_QUIZ2_PATIENT_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.firstName) setStoredPatient(parsed);
    } catch (_) {}
  }, []);

  // Resolve patient info from step answers, full scan, or sessionStorage fallback.
  const patientInfoAnswer = useMemo(() => {
    const fromStep =
      patientInfoStepIndex >= 0 ? answers[patientInfoStepIndex] : undefined;
    if (fromStep?.firstName?.trim()) return fromStep;
    const scanned = pickPatientPayload(answers);
    if (scanned?.firstName?.trim()) return scanned;
    return storedPatient?.firstName?.trim() ? storedPatient : undefined;
  }, [answers, patientInfoStepIndex, storedPatient]);

  const hideWizardHeader = activeStep?.hideWizardHeader;
  const isMultiSelectStep = activeStep?.type === "multiSelect";
  const contentMaxWidthClass = WIDE_STEP_TYPES.has(activeStep?.type)
    ? "max-w-[1120px]"
    : "max-w-[976px]";

  const showTopProgress = Boolean(activeStep?.showTopProgress);
  const stepProgress = useMemo(() => {
    if (!showTopProgress) return 0;
    const countable = prEdQuiz2Config.steps.filter(
      (s) => s.showTopProgress && !s.excludeFromProgress,
    );
    if (!countable.length) return 0;
    if (countable.length === 1) return 100;
    const current = prEdQuiz2Config.steps[currentStep];
    const tier = countable.findIndex((s) => s.id === current?.id);
    if (tier < 0) return 0;
    const pct = Math.round((tier / (countable.length - 1)) * 100);
    return tier === 0 ? Math.max(pct, 14) : pct;
  }, [showTopProgress, currentStep]);

  const handleBack = () => {
    if (!isFirstStep) {
      goBack();
    } else {
      window.history.back();
    }
  };

  return (
    <>
    <main className="min-h-screen bg-[#F5F4EF] pb-10 md:pb-16 md:pt-0">
      <div className="flex h-[72px] items-center justify-center bg-[#F5F4EF]">
        <Link
          href="/"
          className="relative block h-[44px] w-[126px]"
          aria-label="myRocky homepage"
        >
          <Image
            src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
            alt="myRocky"
            fill
            className="object-contain"
            sizes="126px"
            priority
          />
        </Link>
      </div>

      {showTopProgress && (
        <div
          className="h-[3px] w-full bg-black/5"
          role="progressbar"
          aria-valuenow={stepProgress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Quiz progress"
        >
          <div
            className="h-full bg-[#AE7E56] transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, stepProgress))}%` }}
          />
        </div>
      )}

      <div className={`mx-auto ${contentMaxWidthClass} px-4`}>
        {totalSteps === 0 ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
            <p className="poppins-font text-base text-black/70">
              No steps configured yet.
            </p>
          </div>
        ) : (
          <>
            {/* Back arrow for multiSelect steps (has its own layout) */}
            {isMultiSelectStep && !hideWizardHeader && (
              <div className="mx-auto max-w-5xl px-6 pt-2">
                <button
                  type="button"
                  onClick={handleBack}
                  className="inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-blue-500"
                  aria-label="Go back"
                >
                  <span className="text-lg">←</span>
                </button>
              </div>
            )}

            {/* Step counter + back button for all other visible-header steps */}
            {!isMultiSelectStep && !hideWizardHeader && (
              <div className="mb-5 flex items-center justify-between">
                <p className="poppins-font text-sm text-black/70">
                  Step {currentStep + 1} of {totalSteps}
                </p>
                {!isFirstStep && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="poppins-font rounded-full border border-black/20 px-4 py-2 text-sm font-medium text-black/80 transition-colors hover:bg-black/5"
                  >
                    Back
                  </button>
                )}
              </div>
            )}

            <PrEdQuiz2StepRenderer
              step={activeStep}
              selectedAnswer={selectedAnswer}
              onSelect={selectAnswer}
              onUpdateSingleSelectFollowUp={updateSingleSelectFollowUp}
              onToggleMultiSelect={toggleMultiSelectAnswer}
              onContinueStep={continueStep}
              onBack={handleBack}
              canSelectCurrentStep={canSelectCurrentStep}
              hasSelectionForCurrentStep={hasSelectionForCurrentStep}
              ctaHref={resolvedDestinationHref}
              previousStepAnswer={answers[currentStep - 1]}
              eligibilityAnswer={eligibilityAnswer}
              patientInfoAnswer={patientInfoAnswer}
              recommendationAnswer={recommendationAnswer}
            />
          </>
        )}
      </div>
    </main>
    <PrEdQuiz2DisqualificationModal
      open={showDisqualificationModal}
      onReviewAnswers={closeDisqualificationModal}
      supportUrl={prEdQuiz2Config.disqualifySupportUrl}
    />
    </>
  );
}
