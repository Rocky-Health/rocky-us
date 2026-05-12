import { useState, useEffect, useRef } from "react";
import { isUserAuthenticated } from "@/utils/crossSellCheckout";

const STORAGE_KEY = "wl_flow2_quiz_data";

// Add isAuthenticated param to control step skipping
export const useStepNavigation = (quizConfig) => {
  const getPageStepIds = (pageOrStepNumber) => {
    const pageConfig = quizConfig.pages?.[pageOrStepNumber];
    return pageConfig?.stepIds?.length ? pageConfig.stepIds : [pageOrStepNumber];
  };

  const getPrimaryStepNumber = (pageOrStepNumber) => {
    return getPageStepIds(pageOrStepNumber)[0];
  };

  const getPrimaryStepConfig = (pageOrStepNumber) => {
    const primaryStepNumber = getPrimaryStepNumber(pageOrStepNumber);
    return quizConfig.steps?.[primaryStepNumber];
  };

  const resolvePageNumber = (stepOrPageNumber) => {
    if (!quizConfig.pages) return stepOrPageNumber;

    const asNumber = Number(stepOrPageNumber);
    for (const [pageNumber, pageConfig] of Object.entries(quizConfig.pages)) {
      if (pageConfig?.stepIds?.includes(asNumber)) {
        return Number(pageNumber);
      }
    }

    return asNumber;
  };

  // Initialize with server-safe defaults; restore from localStorage after mount
  const [currentStep, setCurrentStep] = useState(1);
  const [progressPercent, setProgressPercent] = useState(quizConfig.progressMap[1] || 0);
  // History stack of visited steps to support accurate "Back" behavior
  const [history, setHistory] = useState([]);
  // Prevents the save effect from overwriting localStorage before restore completes
  const hasHydrated = useRef(false);

  useEffect(() => {
    try {
      // URL params take priority over localStorage (allows sharing/bookmarking a page)
      const urlParams = new URLSearchParams(window.location.search);
      const qsParam = urlParams.get("qs");
      if (qsParam) {
        const pageFromUrl = parseInt(qsParam, 10);
        if (!isNaN(pageFromUrl) && pageFromUrl > 0) {
          setCurrentStep(pageFromUrl);
          setProgressPercent(quizConfig.progressMap[pageFromUrl] || 0);
          hasHydrated.current = true;
          return;
        }
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.currentStep) {
          setCurrentStep(parsed.currentStep);
        }
        if (parsed.progressPercent !== undefined) {
          setProgressPercent(parsed.progressPercent);
        } else if (parsed.currentStep) {
          setProgressPercent(quizConfig.progressMap[parsed.currentStep] || 0);
        }
        if (parsed.history) {
          setHistory(parsed.history);
        }
      }
    } catch (e) {
      console.error("Failed to load navigation state from localStorage:", e);
    }
    hasHydrated.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isAuthenticated = isUserAuthenticated();

  // Save to localStorage whenever navigation state changes
  useEffect(() => {
    if (!hasHydrated.current) return;
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
      console.error("Failed to save navigation state to localStorage:", e);
    }
  }, [currentStep, progressPercent, history]);

  // Browser back button support: push history state on step change,
  // intercept popstate to navigate within the quiz instead of leaving the page.
  // Also keep the URL ?qs= param in sync so refreshing restores the correct page.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    url.searchParams.set("qs", currentStep);

    if (currentStep > 1) {
      window.history.pushState({ quizStep: currentStep }, "", url.toString());
    } else {
      // On first page use replaceState to avoid creating an extra history entry
      window.history.replaceState({ quizStep: currentStep }, "", url.toString());
    }
  }, [currentStep]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onPopState = (e) => {
      // Only intercept if we have internal history to go back to
      if (history.length > 0) {
        // Prevent the browser from actually navigating away
        const last = history[history.length - 1];
        setHistory((h) => h.slice(0, -1));
        setCurrentStep(last);
        setProgressPercent(quizConfig.progressMap[last] || 0);
      }
      // If history is empty (step 1), let the browser navigate normally
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [history, quizConfig.progressMap]);




  // Helper to check if a step should be skipped
  const shouldSkipStep = (stepNumber) => {
    const pageStepIds = getPageStepIds(stepNumber);
    const stepConfigs = pageStepIds
      .map((id) => quizConfig.steps?.[id])
      .filter(Boolean);

    if (!stepConfigs.length) return false;

    return stepConfigs.every(
      (step) => step.passIf === "authenticate" && isAuthenticated,
    );
  };

  // Find the next eligible step (forward)
  const findNextStep = (startStep, userData) => {
    let nextStep = startStep;
    while (shouldSkipStep(nextStep)) {
      // Use conditionalNavigation if present
      const stepConfig = getPrimaryStepConfig(nextStep);
      let candidate = quizConfig.navigation[nextStep] || nextStep + 1;
      if (stepConfig?.conditionalNavigation) {
        const userValue = userData?.[stepConfig.field];
        const condNav = stepConfig.conditionalNavigation[userValue];
        if (condNav) candidate = resolvePageNumber(condNav);
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
    const stepConfig = getPrimaryStepConfig(currentStep);

    if (stepConfig?.conditionalNavigation) {
      const userValue = userData[stepConfig.field];
      const nextStep = resolvePageNumber(
        stepConfig.conditionalNavigation[userValue],
      );
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
    // If we have a history stack, pop the last visited step and go there
    if (history.length > 0) {
      const last = history[history.length - 1];
      setHistory((h) => h.slice(0, -1));
      setCurrentStep(last);
      setProgressPercent(quizConfig.progressMap[last] || 0);
      return;
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
        console.error("Failed to reset navigation state in localStorage:", e);
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
