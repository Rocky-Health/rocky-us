import { useNadPlusQuizStepNavigation } from "./useNadPlusQuizStepNavigation";
import { useNadPlusQuizData } from "./useNadPlusQuizData";
import { nadPlusQuizConfig } from "../config/nadPlusQuizConfig";
import { logger } from "@/utils/devLogger";
import { addToCartDirectly } from "@/utils/flowCartHandler";
import { addRequiredConsultation } from "@/utils/requiredConsultation";
import {
  fireEverFlowConversion,
  fireEverFlowConversionWhenReady,
} from "@/components/EverFlow/EverFlowScript";

/** Clear stale ED/WL cart markers without removing NAD+ consultation requirements. */
function clearStaleFlowCartMarkers(productIds) {
  if (typeof window === "undefined") return;
  [...new Set(productIds.map(String).filter(Boolean))].forEach((id) => {
    try {
      const raw = localStorage.getItem(`required_consultation_${id}`);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed?.flowType && parsed.flowType !== "longevity-flow") {
        localStorage.removeItem(`required_consultation_${id}`);
      }
    } catch (_) {
      // ignore
    }
  });
  try {
    const raw = localStorage.getItem("flow_cart_products");
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved?.flowType && saved.flowType !== "longevity") {
      localStorage.removeItem("flow_cart_products");
    }
  } catch (_) {
    // ignore
  }
}

export const useNadPlusQuizFlow = () => {
  // TODO: Update EverFlow offer/event IDs for NAD+ quiz
  // useEffect(() => {
  //   return fireEverFlowConversionWhenReady({
  //     network: "vyrov30g",
  //     offerId: XXXX,
  //     eventId: XXXX,
  //   });
  // }, []);

  const {
    currentStep,
    progressPercent,
    goToStep,
    handleContinue: baseHandleContinue,
    handleBack,
    resetQuiz,
  } = useNadPlusQuizStepNavigation(nadPlusQuizConfig);

  const {
    userData,
    setUserData,
    activePopup,
    handleAction: baseHandleAction,
    closePopup: baseClosePopup,
    clearQuizData,
  } = useNadPlusQuizData();

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
    const stepConfig = nadPlusQuizConfig.steps[currentStep];
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
        "[NadPlusQuiz] Navigating from step",
        currentStep,
        "to step",
        payload,
      );
      goToStep(payload, userData);
    } else {
      baseHandleAction(action, payload, handleContinue);
    }
  };

  const handlePlanStepCheckout = async (selectedPlan) => {
    // TODO: Update EverFlow offer/event IDs for NAD+ quiz
    // fireEverFlowConversion({ network: "vyrov30g", offerId: XXXX, eventId: XXXX });

    const variationId = "490785";

    logger.log(
      `🛒 NadPlusQuiz: variationId=${variationId}, plan=${selectedPlan?.id}`,
    );

    clearStaleFlowCartMarkers([
      variationId,
      nadPlusQuizConfig.productId,
    ]);

    addRequiredConsultation(variationId, "longevity-flow");

    const mainProduct = {
      id: variationId,
      name: "NAD+",
      price: selectedPlan?.price || "$99",
      isSubscription: true,
      variationId,
    };

    logger.log("🛒 NadPlusQuiz Plan checkout:", mainProduct);

    const result = await addToCartDirectly(mainProduct, [], "longevity", {
      requireConsultation: true,
      preserveExistingCart: false,
      subscriptionPeriod: selectedPlan?.subscriptionPeriod || "1_month",
    });

    if (result.success) {
      if (typeof window !== "undefined") {
        window.location.href =
          result.redirectUrl || "/checkout?longevity-flow=1";
      }
      return;
    }

    logger.error("❌ NadPlusQuiz Plan checkout failed:", result.error);
    alert("There was an issue processing your checkout. Please try again.");
    throw new Error(result.error || "Checkout failed");
  };

  return {
    currentStep,
    progressPercent,
    goToStep,
    userData,
    setUserData,
    activePopup,
    handleContinue,
    handleBack,
    handleAction,
    closePopup,
    handlePlanStepCheckout,
    clearQuizData,
    resetQuiz,
  };
};
