
import { useStepNavigation } from "../../hooks/useStepNavigation";
import { useQuizData } from "../../hooks/useQuizData";
import { quizConfig } from "../config/quizConfig";
import { logger } from "@/utils/devLogger";
import {
  buildSafeStepId,
  trackQuestionnaireStepComplete,
  trackQuestionnaireSubmit,
} from "@/utils/questionnaireTracking";

const QS_TRACK = {
  questionnaire_id: "wl-flow-two",
  flow_id: "weight-loss",
  step_type: "pre-consultation",
};

export const useWLFlowTwo = () => {
  const {
    currentStep,
    progressPercent,
    goToStep,
    handleContinue: baseHandleContinue,
    handleBack,
    resetQuiz,
  } = useStepNavigation(quizConfig);

  const {
    userData,
    setUserData,
    activePopup,
    selectedProduct,
    setSelectedProduct,
    handleAction: baseHandleAction,
    closePopup,
    handleRecommendationContinue: baseHandleRecommendationContinue,
    clearQuizData,
  } = useQuizData();


  // Prevent repeated popups by tracking which popups have been shown in userData
  const handleContinue = () => {
    // TK-584: the step is validated and advancing -> mark it complete.
    trackQuestionnaireStepComplete({
      ...QS_TRACK,
      step_id: buildSafeStepId(currentStep),
      step_index: currentStep,
    });
    const stepConfig = quizConfig.steps[currentStep];
    // Only show popup if not already shown for this step
    if (stepConfig && stepConfig.showPopupAfterStep && !userData[`popupShown_${currentStep}`]) {
      setUserData({ ...userData, [`popupShown_${currentStep}`]: true });
      baseHandleAction("showPopup", stepConfig.showPopupAfterStep, () => {
         baseHandleContinue(userData);
      });
    } else {
      baseHandleContinue(userData);
    }
  };

  const handleAction = (action, payload) => {
    if (action === "navigate") {
      logger.log("[WLFlowTwo] Navigating from step", currentStep, "to step", payload);
      goToStep(payload);
    } else {
      baseHandleAction(action, payload, handleContinue);
    }
  };

  const handleRecommendationContinue = () => {
    // TK-584: user finished the quiz and locked in a product -> Submit milestone.
    trackQuestionnaireSubmit({
      ...QS_TRACK,
      step_id: buildSafeStepId(currentStep),
      step_index: currentStep,
    });
    baseHandleRecommendationContinue();
    goToStep(15); // Completion step
    // Note: Quiz data is kept in localStorage for checkout process
    // It will be cleared when user starts a new quiz or manually clears browser data
  };

  return {
    currentStep,
    progressPercent,
    userData,
    setUserData,
    selectedProduct,
    setSelectedProduct,
    activePopup,
    handleContinue,
    handleBack,
    handleAction,
    closePopup,
    handleRecommendationContinue,
    clearQuizData,
    resetQuiz,
  };
};