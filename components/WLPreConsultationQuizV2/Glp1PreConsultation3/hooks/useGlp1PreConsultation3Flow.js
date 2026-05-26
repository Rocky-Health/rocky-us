import { useEffect } from "react";
import { useGlp1PreConsultation3StepNavigation } from "./useGlp1PreConsultation3StepNavigation";
import { useGlp1PreConsultation3QuizData } from "./useGlp1PreConsultation3QuizData";
import { glp1PreConsultation3Config } from "../config/glp1PreConsultation3Config";
import { logger } from "@/utils/devLogger";
import { wlFlowAddToCart } from "@/utils/flowCartHandler";
import { addRequiredConsultation } from "@/utils/requiredConsultation";
import {
  fireEverFlowConversion,
  fireEverFlowConversionWhenReady,
} from "@/components/EverFlow/EverFlowScript";

export const useGlp1PreConsultation3Flow = () => {
  // EverFlow Start Quiz (event 6230). See useGLP1Flow for rationale —
  // static EverFlowScript misses SPA entries; this fires once on mount
  // and shares the sessionStorage idempotency key with the static fire.
  useEffect(() => {
    return fireEverFlowConversionWhenReady({
      network: "vyrov30g",
      offerId: 5096,
      eventId: 6230,
    });
  }, []);

  const {
    currentStep,
    progressPercent,
    goToStep,
    handleContinue: baseHandleContinue,
    handleBack,
    resetQuiz,
  } = useGlp1PreConsultation3StepNavigation(glp1PreConsultation3Config);

  const {
    userData,
    setUserData,
    activePopup,
    selectedProduct,
    setSelectedProduct,
    handleAction: baseHandleAction,
    closePopup: baseClosePopup,
    handleRecommendationContinue: baseHandleRecommendationContinue,
    clearQuizData,
  } = useGlp1PreConsultation3QuizData();

  const closePopup = () => {
    if (activePopup === "pregnancy") {
      setUserData((prev) => {
        const next = { ...prev };
        delete next.femalePregnancySafety;
        delete next.glp1MedicalContraindications;
        delete next.glp1AdditionalHealthQuestions;
        return next;
      });
    }
    baseClosePopup();
  };

  const handleContinue = (freshUserData) => {
    const data =
      freshUserData &&
      typeof freshUserData === "object" &&
      !Array.isArray(freshUserData)
        ? freshUserData
        : userData;
    const stepConfig = glp1PreConsultation3Config.steps[currentStep];
    if (
      stepConfig &&
      stepConfig.showPopupAfterStep &&
      !data[`popupShown_${currentStep}`]
    ) {
      setUserData({ ...data, [`popupShown_${currentStep}`]: true });
      baseHandleAction("showPopup", stepConfig.showPopupAfterStep, () => {
        baseHandleContinue(data);
      });
    } else {
      baseHandleContinue(data);
    }
  };

  const handleAction = (action, payload) => {
    if (action === "navigate") {
      logger.log(
        "[Glp1PreConsultation3] Navigating from step",
        currentStep,
        "to step",
        payload,
      );
      goToStep(payload, userData);
    } else {
      baseHandleAction(action, payload, handleContinue);
    }
  };

  const handleRecommendationContinue = () => {
    baseHandleRecommendationContinue();
    logger.log("[Glp1PreConsultation3] Product selected, ready for checkout");
  };

  const handlePlanStepCheckout = async (selectedPlan) => {
    if (!selectedProduct) {
      alert("Please select a product to continue");
      return;
    }

    fireEverFlowConversion({
      network: "vyrov30g",
      offerId: 5096,
      eventId: 6231,
    });

    const productVariationMap =
      glp1PreConsultation3Config.planVariationIds?.[
        String(selectedProduct.id)
      ] || {};
    const resolvedVariationId =
      productVariationMap[selectedPlan?.id] || String(selectedProduct.id);

    logger.log(
      `🛒 Glp1PreConsultation3: product=${selectedProduct.id}, plan=${selectedPlan?.id}, resolvedVariationId=${resolvedVariationId}`,
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
    logger.log(
      "🛒 Glp1PreConsultation3 Plan checkout:",
      mainProductForCheckout,
    );
    const result = await wlFlowAddToCart(mainProductForCheckout, [], {
      requireConsultation: true,
      subscriptionPeriod: selectedPlan?.subscriptionPeriod || "1_month",
      checkoutQueryParams: { "glp1-pc3-checkout": "1" },
    });
    if (result.success) {
      if (typeof window !== "undefined" && result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
    } else {
      logger.error(
        "❌ Glp1PreConsultation3 Plan checkout failed:",
        result.error,
      );
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
