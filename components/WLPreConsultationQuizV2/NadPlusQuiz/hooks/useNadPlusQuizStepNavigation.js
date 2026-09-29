import { useState, useEffect } from "react";
import { isUserAuthenticated } from "@/utils/crossSellCheckout";
import { logger } from "@/utils/devLogger";

// Isolated from WL shared useStepNavigation — this flow uses its own localStorage key.
const STORAGE_KEY = "nad_plus_quiz_flow_data";
const QUIZ_DATA_STORAGE_KEY = "nad-plus-quiz-data";

function readStoredUserData() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(QUIZ_DATA_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.userData ?? null;
  } catch {
    return null;
  }
}

/** Apply passIf (auth) and skipIf (per userData) so saved step matches eligibility. */
function resolveStoredStepNumber(quizConfig, rawStep, isAuthenticatedFlag) {
  let step = rawStep;
  if (isAuthenticatedFlag) {
    while (quizConfig.steps[step]?.passIf === "authenticate") {
      step = quizConfig.navigation[step] || step + 1;
    }
  }
  const ud = readStoredUserData();
  while (true) {
    const st = quizConfig.steps[step];
    if (!st) break;
    let skip = false;
    if (st.skipIf && ud) {
      for (const [k, v] of Object.entries(st.skipIf)) {
        if (ud[k] === v) {
          skip = true;
          break;
        }
      }
    }
    if (!skip) break;
    step = quizConfig.navigation[step] || step + 1;
  }
  return step;
}

// Add isAuthenticated param to control step skipping
export const useNadPlusQuizStepNavigation = (quizConfig) => {
  // Initialize from localStorage if available
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return resolveStoredStepNumber(
            quizConfig,
            parsed.currentStep || 1,
            isUserAuthenticated(),
          );
        }
      } catch (e) {
        logger.error("Failed to load currentStep from localStorage:", e);
      }
    }
    return 1;
  });

  const [progressPercent, setProgressPercent] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          const resolvedStep = resolveStoredStepNumber(
            quizConfig,
            parsed.currentStep || 1,
            isUserAuthenticated(),
          );
          return quizConfig.progressMap[resolvedStep] || 0;
        }
      } catch (e) {
        logger.error("Failed to load progressPercent from localStorage:", e);
      }
    }
    return quizConfig.progressMap[1] || 0;
  });

  // History stack of visited steps to support accurate "Back" behavior
  const [history, setHistory] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.history || [];
        }
      } catch (e) {
        logger.error("Failed to load history from localStorage:", e);
      }
    }
    return [];
  });
 
  const isAuthenticated = isUserAuthenticated();

  // Save to localStorage whenever navigation state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const existing = stored ? JSON.parse(stored) : {};
        
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            ...existing,
            currentStep,
            progressPercent,
            history,
          })
        );
      } catch (e) {
        logger.error("Failed to save navigation state to localStorage:", e);
      }
    }
  }, [currentStep, progressPercent, history]);

  // Browser back button support: push history state on step change,
  // intercept popstate to navigate within the quiz instead of leaving the page.
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Push a new browser history entry whenever the step advances beyond 1.
    // We only push (not replace) so each step gets its own entry.
    if (currentStep > 1) {
      window.history.pushState({ quizStep: currentStep }, "");
    }
  }, [currentStep]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPopState = (e) => {
      // Only intercept if we have internal history to go back to
      if (history.length > 0) {
        // Walk back through history skipping guest-only steps
        let newHistory = [...history];
        let last;
        do {
          last = newHistory[newHistory.length - 1];
          newHistory = newHistory.slice(0, -1);
        } while (shouldSkipStep(last, readStoredUserData()) && newHistory.length > 0);

        if (!shouldSkipStep(last, readStoredUserData())) {
          setHistory(newHistory);
          setCurrentStep(last);
          setProgressPercent(quizConfig.progressMap[last] || 0);
        }
      }
      // If history is empty (step 1), let the browser navigate normally
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [history, quizConfig.progressMap]);




  // Helper to check if a step should be skipped
  const shouldSkipStep = (stepNumber, userDataOverride) => {
    const step = quizConfig.steps[stepNumber];
    if (!step) return false;
    if (step.passIf === "authenticate" && isAuthenticated) return true;
    const ud = userDataOverride ?? readStoredUserData();
    if (step.skipIf && ud) {
      for (const [key, val] of Object.entries(step.skipIf)) {
        if (ud[key] === val) return true;
      }
    }
    return false;
  };

  // Find the next eligible step (forward)
  const findNextStep = (startStep, userData) => {
    let nextStep = startStep;
    while (shouldSkipStep(nextStep, userData)) {
      // Use conditionalNavigation if present
      const stepConfig = quizConfig.steps[nextStep];
      let candidate = quizConfig.navigation[nextStep] || nextStep + 1;
      if (stepConfig?.conditionalNavigation) {
        const userValue = userData?.[stepConfig.field];
        const condNav = stepConfig.conditionalNavigation[userValue];
        if (condNav) candidate = condNav;
      }
      nextStep = candidate;
    }
    return nextStep;
  };

  // Find the previous eligible step (backward)
  const findPrevStep = (startStep, userData) => {
    let prevStep = startStep;
    while (shouldSkipStep(prevStep, userData) && prevStep > 1) {
      prevStep = prevStep - 1;
    }
    return prevStep;
  };

  const goToStep = (stepNumber, userData) => {
    if (stepNumber === currentStep) return;
    // push current step to history so Back can return here
    setHistory((h) => [...h, currentStep]);

    const eligibleStep = shouldSkipStep(
      stepNumber,
      userData ?? readStoredUserData(),
    )
      ? findNextStep(stepNumber, userData ?? readStoredUserData())
      : stepNumber;

    setCurrentStep(eligibleStep);
    setProgressPercent(quizConfig.progressMap[eligibleStep] || 0);
  };

  const getNextStep = (userData) => {
    const stepConfig = quizConfig.steps[currentStep];

    if (stepConfig?.conditionalNavigation) {
      const userValue = userData[stepConfig.field];
      const nextStep = stepConfig.conditionalNavigation[userValue];
      if (nextStep) return findNextStep(nextStep, userData);
    }

    const candidate = quizConfig.navigation[currentStep] || currentStep + 1;
    return findNextStep(candidate, userData);
  };

  const handleContinue = (userData) => {
    const nextStep = getNextStep(userData);
    if (nextStep === currentStep) return;
    // record current step so Back returns here
    setHistory((h) => [...h, currentStep]);
    setCurrentStep(nextStep);
    setProgressPercent(quizConfig.progressMap[nextStep] || 0);
  };

  const handleBack = (userData) => {
    // If we have a history stack, pop steps until we find one that shouldn't be skipped
    if (history.length > 0) {
      let newHistory = [...history];
      let last;
      do {
        last = newHistory[newHistory.length - 1];
        newHistory = newHistory.slice(0, -1);
      } while (shouldSkipStep(last, userData) && newHistory.length > 0);

      if (!shouldSkipStep(last, userData)) {
        setHistory(newHistory);
        setCurrentStep(last);
        setProgressPercent(quizConfig.progressMap[last] || 0);
        return;
      }
    }

    // Fallback: walk backward to previous non-skipped step
    const prevStep = findPrevStep(currentStep - 1, userData);
    setCurrentStep(prevStep);
    setProgressPercent(quizConfig.progressMap[prevStep] || 0);
  };

  // Reset quiz to initial state
  const resetQuiz = () => {
    setCurrentStep(1);
    setProgressPercent(quizConfig.progressMap[1] || 0);
    setHistory([]);
    
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const existing = JSON.parse(stored);
          // Clear navigation state but keep userData for now
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({
              ...existing,
              currentStep: 1,
              progressPercent: quizConfig.progressMap[1] || 0,
              history: [],
            })
          );
        }
      } catch (e) {
        logger.error("Failed to reset navigation state in localStorage:", e);
      }
    }
  };

  return {
    currentStep,
    progressPercent,
    goToStep,
    handleContinue,
    handleBack,
    resetQuiz,
  };
};
