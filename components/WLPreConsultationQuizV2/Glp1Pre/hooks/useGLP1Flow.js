
import { useStepNavigation } from "../../hooks/useStepNavigation";
import { useQuizData } from "../../hooks/useQuizData";
import { quizConfig } from "../config/quizConfig";
import { logger } from "@/utils/devLogger";
import { wlFlowAddToCart } from "@/utils/flowCartHandler";
import { addRequiredConsultation } from "@/utils/requiredConsultation";
import { fireEverFlowConversion } from "@/components/EverFlow/EverFlowScript";

export const useGLP1Flow = () => {
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

  const resolveCurrentStepConfig = () => {
    const pageConfig = quizConfig.pages?.[currentStep];
    const firstStepId = pageConfig?.stepIds?.[0] || currentStep;
    return quizConfig.steps[firstStepId];
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

  // Prevent repeated popups by tracking which popups have been shown in userData
  const handleContinue = () => {
    const stepConfig = resolveCurrentStepConfig();
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
      const targetPage = resolvePageNumber(payload);
      logger.log("[WLFlowTwo] Navigating from step", currentStep, "to step", targetPage);
      goToStep(targetPage);
    } else {
      baseHandleAction(action, payload, handleContinue);
    }
  };

  const handleRecommendationContinue = () => {
    baseHandleRecommendationContinue();
    goToStep(16); // Navigate to plan selection page
  };

  const handlePlanStepCheckout = async (selectedPlan) => {
    if (!selectedProduct) {
      alert("Please select a product to continue");
      return;
    }

    fireEverFlowConversion({
      network: "rcr73qtl",
      offerId: 5094,
      eventId: 6227,
    });

    const productVariationMap =
      quizConfig.planVariationIds?.[String(selectedProduct.id)] || {};
    const resolvedVariationId =
      productVariationMap[selectedPlan?.id] || String(selectedProduct.id);

    logger.log(
      `🛒 GLP1Pre: product=${selectedProduct.id}, plan=${selectedPlan?.id}, resolvedVariationId=${resolvedVariationId}`,
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

    logger.log("🛒 GLP1Pre Plan checkout:", mainProductForCheckout);

    const result = await wlFlowAddToCart(mainProductForCheckout, [], {
      requireConsultation: true,
      subscriptionPeriod: selectedPlan?.subscriptionPeriod || "1_month",
      checkoutQueryParams: { "glp1-checkout": "1" },
    });

    if (result.success) {
      if (typeof window !== "undefined" && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
    } else {
      logger.error("❌ GLP1Pre Plan checkout failed:", result.error);
      alert("There was an issue processing your checkout. Please try again.");
    }
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
    handlePlanStepCheckout,
    clearQuizData,
    resetQuiz,
  };
};