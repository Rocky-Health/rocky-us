import { useStepNavigation } from "../../hooks/useStepNavigation";
import { useBOQuizData } from "./useBOQuizData";
import { boSimplifiedConfig } from "../config/boSimplifiedConfig";
import { logger } from "@/utils/devLogger";

export const useBOSimplifiedFlow = () => {
    const {
        currentStep,
        progressPercent,
        goToStep,
        handleContinue: baseHandleContinue,
        handleBack,
        resetQuiz,
    } = useStepNavigation(boSimplifiedConfig);

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
    } = useBOQuizData();

    // Prevent repeated popups by tracking which popups have been shown in userData
    const handleContinue = () => {
        const stepConfig = boSimplifiedConfig.steps[currentStep];
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
            logger.log("[BOSimplified] Navigating from step", currentStep, "to step", payload);
            goToStep(payload);
        } else {
            baseHandleAction(action, payload, handleContinue);
        }
    };

    const handleRecommendationContinue = () => {
        baseHandleRecommendationContinue();
        // After product selection, route to checkout
        // Data is kept in localStorage for checkout process
        logger.log("[BOSimplified] Product selected, ready for checkout");
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
