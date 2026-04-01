import { useStepNavigation } from "../../hooks/useStepNavigation";
import { useGlp2QuizData } from "./useGlp2QuizData";
import { glp2PreConsultationConfig } from "../config/glp2PreConsultationConfig";
import { logger } from "@/utils/devLogger";
import { wlFlowAddToCart } from "@/utils/flowCartHandler";
import { addRequiredConsultation } from "@/utils/requiredConsultation";

export const useGlp2PreConsultationFlow = () => {
    const {
        currentStep,
        progressPercent,
        goToStep,
        handleContinue: baseHandleContinue,
        handleBack,
        resetQuiz,
    } = useStepNavigation(glp2PreConsultationConfig);

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
    } = useGlp2QuizData();

    // Prevent repeated popups by tracking which popups have been shown in userData
    const handleContinue = () => {
        const stepConfig = glp2PreConsultationConfig.steps[currentStep];
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
            logger.log("[Glp2PreConsultation] Navigating from step", currentStep, "to step", payload);
            goToStep(payload);
        } else {
            baseHandleAction(action, payload, handleContinue);
        }
    };

    const handleRecommendationContinue = () => {
        baseHandleRecommendationContinue();
        // After product selection, route to checkout
        // Data is kept in localStorage for checkout process
        logger.log("[Glp2PreConsultation] Product selected, ready for checkout");
    };

    const handlePlanStepCheckout = async (selectedPlan) => {
        if (!selectedProduct) {
            alert("Please select a product to continue");
            return;
        }

        // Resolve the exact WooCommerce variation ID for this product + plan combo.
        // Same pattern as the ED flow: the variation ID IS sent as both id and variationId,
        // so WooCommerce applies the correct price for the chosen plan.
        const productVariationMap = glp2PreConsultationConfig.planVariationIds?.[String(selectedProduct.id)] || {};
        const resolvedVariationId = productVariationMap[selectedPlan?.id] || String(selectedProduct.id);

        logger.log(
            `🛒 Glp2PreConsultation: product=${selectedProduct.id}, plan=${selectedPlan?.id}, resolvedVariationId=${resolvedVariationId}`
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
        logger.log("🛒 Glp2PreConsultation Plan checkout:", mainProductForCheckout);
        const result = await wlFlowAddToCart(mainProductForCheckout, [], {
            requireConsultation: true,
            subscriptionPeriod: selectedPlan?.subscriptionPeriod || "1_month",
        });
        if (result.success) {
            if (typeof window !== "undefined" && result.redirectUrl) {
                window.location.href = result.redirectUrl;
                return;
            }
        } else {
            logger.error("❌ Glp2PreConsultation Plan checkout failed:", result.error);
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
