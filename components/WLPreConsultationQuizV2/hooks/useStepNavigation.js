import { useState, useEffect } from "react";
import { isUserAuthenticated } from "@/utils/crossSellCheckout";
import { logger } from "@/utils/devLogger";

const STORAGE_KEY = "wl_flow2_quiz_data";

// Add isAuthenticated param to control step skipping
export const useStepNavigation = (quizConfig) => {
  // Helper used only inside lazy initializers — resolves the first eligible step
  // for an authenticated user starting from `startStep`.
  const resolveStepForAuth = (startStep) => {
    if (!isUserAuthenticated()) return startStep;
    let step = startStep;
    while (quizConfig.steps[step]?.passIf === "authenticate") {
      step = quizConfig.navigation[step] || step + 1;
    }
    return step;
  };

  // Initialize from localStorage if available
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return resolveStepForAuth(parsed.currentStep || 1);
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
          // Resolve the actual starting step (skip guest-only if authenticated)
          const resolvedStep = resolveStepForAuth(parsed.currentStep || 1);
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
        } while (shouldSkipStep(last) && newHistory.length > 0);

        if (!shouldSkipStep(last)) {
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
  const shouldSkipStep = (pageNumber) => {
    // Page-based config: check all actual step configs within that page
    if (quizConfig.pages) {
      const pageConfig = quizConfig.pages[pageNumber];
      if (pageConfig) {
        const stepIds = pageConfig.stepIds || [];
        if (stepIds.length === 0) return false;
        // Skip the page if any step on it has passIf === "authenticate" and user is authenticated
        return stepIds.some((stepId) => {
          const step = quizConfig.steps[stepId];
          return step?.passIf === "authenticate" && isAuthenticated;
        });
      }
    }
    // Fallback: direct step-id lookup (non-page-based configs)
    const step = quizConfig.steps[pageNumber];
    if (!step) return false;
    if (step.passIf === "authenticate" && isAuthenticated) return true;
    return false;
  };

  // Find the next eligible step (forward)
  const findNextStep = (startStep, userData) => {
    let nextStep = startStep;
    while (shouldSkipStep(nextStep)) {
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
  const findPrevStep = (startStep) => {
    let prevStep = startStep;
    while (shouldSkipStep(prevStep) && prevStep > 1) {
      prevStep = prevStep - 1;
    }
    return prevStep;
  };

  const goToStep = (stepNumber, userData) => {
    if (stepNumber === currentStep) return;
    // push current step to history so Back can return here
    setHistory((h) => [...h, currentStep]);

    const eligibleStep = shouldSkipStep(stepNumber)
      ? findNextStep(stepNumber, userData)
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
      } while (shouldSkipStep(last) && newHistory.length > 0);

      if (!shouldSkipStep(last)) {
        setHistory(newHistory);
        setCurrentStep(last);
        setProgressPercent(quizConfig.progressMap[last] || 0);
        return;
      }
    }

    // Fallback: walk backward to previous non-skipped step
    const prevStep = findPrevStep(currentStep - 1);
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
