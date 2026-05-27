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
import { getLongevityQuizRequestContext } from "@/utils/longevityQuizClientContext";

function buildNadPlusCrmFields(userData) {
  const form = {};

  const conditions = userData.medicalConditions || [];
  if (conditions.includes("none")) form["1205_6"] = "No";
  if (conditions.includes("active-cancer")) form["1205_1"] = "Cancer";
  if (conditions.includes("end-stage-liver")) form["1205_2"] = "Liver disease";
  if (conditions.includes("end-stage-kidney")) form["1205_3"] = "Kidney disease";

  if (userData.sex === "female" && userData.femalePregnancySafety) {
    form["1206"] =
      userData.femalePregnancySafety === "female-safety-none" ? "No" : "Yes";
  }

  form["product_name"] = "NAD+";
  form["product.name"] = "NAD+";
  return form;
}

async function submitNadPlusToCrm(userData) {
  const clientContext = getLongevityQuizRequestContext("nad_entrykey");

  if (userData.firstName) clientContext["130_3"] = userData.firstName;
  if (userData.lastName) clientContext["130_6"] = userData.lastName;
  if (userData.email) clientContext["131"] = userData.email;
  if (userData.phone) clientContext["132"] = userData.phone;
  if (userData.province) clientContext["161_4"] = userData.province;

  if (userData.dateOfBirth) {
    const dob = userData.dateOfBirth;
    if (typeof dob === "object" && dob.year && dob.month && dob.day) {
      clientContext["158"] = `${dob.year}-${String(dob.month).padStart(2, "0")}-${String(dob.day).padStart(2, "0")}`;
    } else if (typeof dob === "string") {
      clientContext["158"] = dob;
    }
  }

  if (userData.sex) {
    clientContext.sex = userData.sex === "male" ? "Male" : "Female";
  }

  const formPayload = buildNadPlusCrmFields(userData);

  const requestBody = {
    action: "longevity_nad",
    form_id: 12,
    stage: "consultation-before-checkout",
    page_step: 4,
    completion_state: "Full",
    "completion.state": "Full",
    completion_percentage: 100,
    "completion.percentage": 100,
    source_site: "https://myrocky.com",
    ...clientContext,
    ...formPayload,
  };

  console.log("NAD+ CRM payload:", JSON.stringify(requestBody, null, 2));

  const response = await fetch("/api/nad-plus", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
    credentials: "include",
  });

  const data = await response.json();
  console.log("NAD+ CRM response:", JSON.stringify(data, null, 2));

  if (data.error) {
    throw new Error(data.msg || data.error_message || "CRM submission failed");
  }

  return data;
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

    try {
      await submitNadPlusToCrm(userData);
    } catch (err) {
      console.error("NAD+ CRM submission failed (continuing with checkout):", err);
    }

    const resolvedVariationId = "490785";

    logger.log(
      `🛒 NadPlusQuiz: variationId=${resolvedVariationId}, plan=${selectedPlan?.id}`,
    );

    const mainProduct = {
      id: resolvedVariationId,
      name: "NAD+",
      price: selectedPlan?.price || "$99",
      isSubscription: true,
      variationId: resolvedVariationId,
    };

    addRequiredConsultation(resolvedVariationId, "nad-plus-flow");
    logger.log("🛒 NadPlusQuiz Plan checkout:", mainProduct);

    const result = await addToCartDirectly(mainProduct, [], "ed", {
      requireConsultation: true,
      preserveExistingCart: false,
      subscriptionPeriod: selectedPlan?.subscriptionPeriod || "1_month",
      checkoutQueryParams: { "nad-plus-checkout": "1" },
    });

    if (result.success) {
      if (typeof window !== "undefined" && result.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
    } else {
      logger.error("❌ NadPlusQuiz Plan checkout failed:", result.error);
      alert("There was an issue processing your checkout. Please try again.");
    }
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
