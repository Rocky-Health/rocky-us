import { useStepNavigation } from "../../hooks/useStepNavigation";
import { useBOQuizData } from "./useBOQuizData";
import { boSimplifiedConfig } from "../config/boSimplifiedConfig";
import { logger } from "@/utils/devLogger";
import { wlFlowAddToCart } from "@/utils/flowCartHandler";
import { addRequiredConsultation } from "@/utils/requiredConsultation";

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

    const handlePlanStepCheckout = async (selectedPlan) => {
        if (!selectedProduct) {
            alert("Please select a product to continue");
            return;
        }

        // Resolve the exact WooCommerce variation ID for this product + plan combo.
        // Same pattern as the ED flow: the variation ID IS sent as both id and variationId,
        // so WooCommerce applies the correct price for the chosen plan.
        const productVariationMap = boSimplifiedConfig.planVariationIds?.[String(selectedProduct.id)] || {};
        const resolvedVariationId = productVariationMap[selectedPlan?.id] || String(selectedProduct.id);

        logger.log(
            `🛒 BOSimplified: product=${selectedProduct.id}, plan=${selectedPlan?.id}, resolvedVariationId=${resolvedVariationId}`
        );

        const mainProductForCheckout = {
            id: resolvedVariationId,
            name: selectedProduct.name,
            price: selectedPlan?.price || selectedProduct.price,
            quantity: 1,
            isSubscription: true,
            subscriptionPeriod: selectedPlan?.subscriptionPeriod || "1_month",
            variationId: resolvedVariationId,
        };
        addRequiredConsultation(selectedProduct.id, "wl-flow");
        logger.log("🛒 BOSimplified Plan checkout:", mainProductForCheckout);
        const result = await wlFlowAddToCart(mainProductForCheckout, [], {
            requireConsultation: true,
            subscriptionPeriod: selectedPlan?.subscriptionPeriod || "1_month",
        });
        if (result.success) {
            try {
                if (typeof window !== "undefined" && window.localStorage) {
                    localStorage.removeItem("wl_flow2_quiz_data");
                }
            } catch (e) {
                logger.error("Error clearing localStorage:", e);
            }
            if (typeof window !== "undefined" && result.redirectUrl) {
                window.location.href = result.redirectUrl;
                return;
            }
        } else {
            logger.error("❌ BOSimplified Plan checkout failed:", result.error);
            alert("There was an issue processing your checkout. Please try again.");
        }
    };

    return {
        currentStep,
        progressPercent,
        goToStep,
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
        handlePlanStepCheckout,
        clearQuizData,
        resetQuiz,
    };
};
