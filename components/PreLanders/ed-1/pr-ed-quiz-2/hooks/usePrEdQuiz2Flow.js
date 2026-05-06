"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { prEdQuiz2Config } from "../config/prEdQuiz2Config";
import { shouldDisqualifyOnAnswer } from "../utils/prEdQuiz2Disqualify";

/** Key on `history.state` so browser Back/Forward maps to quiz steps. */
const PR_ED_QUIZ2_HISTORY_STEP_KEY = "prEdQuiz2Step";

/** Survives refresh so plan approval can still read `firstName`. */
export const PR_ED_QUIZ2_PATIENT_STORAGE_KEY = "prEdQuiz2Patient";

function isReactSyntheticEvent(payload) {
  return (
    payload !== null &&
    typeof payload === "object" &&
    typeof payload.preventDefault === "function" &&
    "nativeEvent" in payload
  );
}

function mergeHistoryState(patch) {
  if (typeof window === "undefined") return patch;
  const cur = window.history.state;
  const base =
    cur && typeof cur === "object" && !Array.isArray(cur) ? { ...cur } : {};
  return { ...base, ...patch };
}

function readQsiFromUrl() {
  try {
    const qsi = new URLSearchParams(window.location.search).get("qsi");
    if (qsi !== null) {
      const n = Number(qsi);
      if (Number.isFinite(n)) return n;
    }
  } catch (_) {}
  return null;
}

export function usePrEdQuiz2Flow(destinationHref) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showDisqualificationModal, setShowDisqualificationModal] = useState(false);
  const currentStepRef = useRef(0);

  useLayoutEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const steps = prEdQuiz2Config.steps;
  const totalSteps = steps.length;
  const activeStep = steps[currentStep];
  const resolvedDestinationHref =
    destinationHref || prEdQuiz2Config.defaultDestinationHref;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  /**
   * Init: resolve starting step from history.state, then ?qsi= URL param,
   * then default to 0. This covers refresh, browser back, and direct links.
   */
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    // 1. history.state is most reliable after refresh or back navigation.
    const fromState = window.history.state?.[PR_ED_QUIZ2_HISTORY_STEP_KEY];
    if (
      typeof fromState === "number" &&
      fromState >= 0 &&
      fromState < totalSteps
    ) {
      setCurrentStep(fromState);
      return;
    }

    // 2. ?qsi= written by tracking (syncQuestionnaireStepToUrl).
    const fromUrl = readQsiFromUrl();
    if (fromUrl !== null && fromUrl >= 0 && fromUrl < totalSteps) {
      window.history.replaceState(
        mergeHistoryState({ [PR_ED_QUIZ2_HISTORY_STEP_KEY]: fromUrl }),
        "",
        window.location.href,
      );
      setCurrentStep(fromUrl);
      return;
    }

    // 3. Default: start at step 0.
    window.history.replaceState(
      mergeHistoryState({ [PR_ED_QUIZ2_HISTORY_STEP_KEY]: 0 }),
      "",
      window.location.href,
    );
  }, [totalSteps]);

  /**
   * Browser Back/Forward: read step from history.state, fall back to ?qsi=.
   * The ?qsi= fallback is needed because tracking's syncQuestionnaireStepToUrl
   * uses router.replace which may overwrite history.state.
   */
  useEffect(() => {
    const onPopState = (event) => {
      let step = event.state?.[PR_ED_QUIZ2_HISTORY_STEP_KEY];

      if (typeof step !== "number") {
        const fromUrl = readQsiFromUrl();
        if (fromUrl !== null) step = fromUrl;
      }

      if (
        typeof step === "number" &&
        Number.isFinite(step) &&
        step >= 0 &&
        step < prEdQuiz2Config.steps.length
      ) {
        setCurrentStep(step);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const canSelectCurrentStep = useMemo(() => {
    if (activeStep?.type !== "multiSelect") return true;
    if (currentStep === 0) return true;
    return Boolean(answers[currentStep - 1]);
  }, [activeStep, answers, currentStep]);

  const selectedAnswer = answers[currentStep] ?? null;

  const requiresSelection =
    activeStep?.type === "multiSelect" ||
    activeStep?.type === "singleSelectQuiz";

  const hasSelectionForCurrentStep = useMemo(() => {
    if (!requiresSelection) return true;
    if (activeStep?.type === "multiSelect") {
      // At least one option required; steps with `solePassValue` show the DQ popup on Continue
      // if the selection is not exactly the pass value (see shouldDisqualifyOnAnswer).
      return Array.isArray(selectedAnswer) && selectedAnswer.length > 0;
    }
    if (activeStep?.type === "singleSelectQuiz") {
      if (!selectedAnswer) return false;
      if (typeof selectedAnswer === "string") return true;
      if (
        typeof selectedAnswer === "object" &&
        selectedAnswer !== null &&
        typeof selectedAnswer.value === "string"
      ) {
        if (
          activeStep.followUpWhenValue &&
          selectedAnswer.value === activeStep.followUpWhenValue
        ) {
          return Boolean(String(selectedAnswer.followUp || "").trim());
        }
        return true;
      }
      return false;
    }
    return Boolean(selectedAnswer);
  }, [requiresSelection, activeStep, selectedAnswer]);

  const selectAnswer = (option) => {
    if (!canSelectCurrentStep || !activeStep) return;

    if (
      activeStep.type === "singleSelectQuiz" &&
      activeStep.followUpWhenValue
    ) {
      if (option === activeStep.followUpWhenValue) {
        setAnswers((prev) => {
          const prevAns = prev[currentStep];
          const preserved =
            typeof prevAns === "object" &&
            prevAns !== null &&
            "value" in prevAns &&
            prevAns.value === option
              ? (prevAns.followUp ?? "")
              : "";
          return {
            ...prev,
            [currentStep]: { value: option, followUp: preserved },
          };
        });
      } else {
        setAnswers((prev) => ({
          ...prev,
          [currentStep]: { value: option },
        }));
      }
      return;
    }

    setAnswers((prev) => ({ ...prev, [currentStep]: option }));
  };

  const updateSingleSelectFollowUp = (text) => {
    if (!activeStep?.followUpWhenValue) return;
    setAnswers((prev) => {
      const cur = prev[currentStep];
      const base =
        typeof cur === "object" &&
        cur !== null &&
        typeof cur.value === "string"
          ? cur
          : { value: activeStep.followUpWhenValue, followUp: "" };
      return { ...prev, [currentStep]: { ...base, followUp: text } };
    });
  };

  const toggleMultiSelectAnswer = (option) => {
    if (!canSelectCurrentStep || !activeStep) return;
    if (
      activeStep.type === "multiSelect" &&
      typeof activeStep.solePassValue === "string"
    ) {
      const sole = activeStep.solePassValue;
      setAnswers((prev) => {
        const existing = Array.isArray(prev[currentStep])
          ? [...prev[currentStep]]
          : [];
        if (option === sole) {
          if (existing.includes(sole)) {
            return { ...prev, [currentStep]: existing.filter((x) => x !== sole) };
          }
          return { ...prev, [currentStep]: [sole] };
        }
        const withoutSole = existing.filter((x) => x !== sole);
        if (withoutSole.includes(option)) {
          return { ...prev, [currentStep]: withoutSole.filter((x) => x !== option) };
        }
        return { ...prev, [currentStep]: [...withoutSole, option] };
      });
      return;
    }

    setAnswers((prev) => {
      const existing = Array.isArray(prev[currentStep])
        ? prev[currentStep]
        : [];
      const next = existing.includes(option)
        ? existing.filter((item) => item !== option)
        : [...existing, option];
      return { ...prev, [currentStep]: next };
    });
  };

  const closeDisqualificationModal = useCallback(() => {
    setShowDisqualificationModal(false);
  }, []);

  const continueStep = (stepPayload) => {
    if (!hasSelectionForCurrentStep) return;

    const stepIndex = currentStepRef.current;
    const stepsCount = prEdQuiz2Config.steps.length;
    const stepDef = prEdQuiz2Config.steps[stepIndex];

    let valueForStep = answers[stepIndex];
    if (
      !isReactSyntheticEvent(stepPayload) &&
      typeof stepPayload !== "undefined"
    ) {
      valueForStep = stepPayload;
    }

    if (shouldDisqualifyOnAnswer(stepDef, valueForStep)) {
      setShowDisqualificationModal(true);
      return;
    }

    if (
      !isReactSyntheticEvent(stepPayload) &&
      typeof stepPayload !== "undefined"
    ) {
      setAnswers((prev) => ({ ...prev, [stepIndex]: stepPayload }));

      // Persist patient info across refreshes for the plan approval step.
      if (
        typeof stepPayload === "object" &&
        stepPayload !== null &&
        typeof stepPayload.firstName === "string" &&
        stepPayload.firstName.trim()
      ) {
        try {
          sessionStorage.setItem(
            PR_ED_QUIZ2_PATIENT_STORAGE_KEY,
            JSON.stringify(stepPayload),
          );
        } catch (_) {}
      }
    }

    if (stepIndex === stepsCount - 1) {
      window.location.href = resolvedDestinationHref;
      return;
    }

    const nextStep = Math.min(stepIndex + 1, stepsCount - 1);
    window.history.pushState(
      mergeHistoryState({ [PR_ED_QUIZ2_HISTORY_STEP_KEY]: nextStep }),
      "",
      window.location.href,
    );
    setCurrentStep(nextStep);
  };

  const goBack = () => {
    if (currentStepRef.current > 0) window.history.back();
  };

  return {
    activeStep,
    currentStep,
    totalSteps,
    selectedAnswer,
    hasSelectionForCurrentStep,
    canSelectCurrentStep,
    isFirstStep,
    isLastStep,
    selectAnswer,
    updateSingleSelectFollowUp,
    toggleMultiSelectAnswer,
    continueStep,
    goBack,
    resolvedDestinationHref,
    answers,
    showDisqualificationModal,
    closeDisqualificationModal,
  };
}
