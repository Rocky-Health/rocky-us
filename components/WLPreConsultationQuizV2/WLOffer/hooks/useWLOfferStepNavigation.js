import { useState, useEffect } from "react";
import { isUserAuthenticated } from "@/utils/crossSellCheckout";

const STORAGE_KEY = "wl_flow2_quiz_data";

// Step navigation hook for wl-offer flow
// Using same storage key as bo-pre-consultation
export const useWLOfferStepNavigation = (quizConfig) => {
  // Initialize from localStorage if available
  const [currentStep, setCurrentStep] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          return parsed.currentStep || 1;
        }
      } catch (e) {
        console.error("Failed to load currentStep from localStorage:", e);
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
          if (parsed.progressPercent !== undefined) {
            return parsed.progressPercent;
          }
          // Fallback to calculate from currentStep
          if (parsed.currentStep) {
            return quizConfig.progressMap[parsed.currentStep] || 0;
          }
        }
      } catch (e) {
        console.error("Failed to load progressPercent from localStorage:", e);
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
        console.error("Failed to load history from localStorage:", e);
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
        console.error("Failed to save navigation state to localStorage:", e);
      }
    }
  }, [currentStep, progressPercent, history]);

  // Helper to check if a step should be skipped
  const shouldSkipStep = (stepNumber) => {
    const step = quizConfig.steps[stepNumber];
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
