"use client";

import { logger } from "@/utils/devLogger";
import { useGLP1Flow } from "./hooks/useGLP1Flow";
import { quizConfig } from "./config/quizConfig";
import GenericPopup from "../components/GenericPopup";
import { PasswordProvider } from "../contexts/PasswordContext";

import QuizStepRenderer from "./QuizStepRenderer";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";

const getPopupConfigWithChosenValue = (popupKey, userData) => {
  if (popupKey === "YourGoalIs") {
    const popupConfig = quizConfig.popups[popupKey];
    if (!popupConfig) return null;
    let message = popupConfig.message;
    if (userData.weightLossGoal) {
      let chosenLabel = userData.weightLossGoal;
      if (userData.weightLossGoal === "not-sure") {
        chosenLabel = "Weight";
      } else {
        const chosenOption = quizConfig.steps[6].options.find(
          (opt) => opt.id === userData.weightLossGoal,
        );
        if (chosenOption) {
          chosenLabel = chosenOption.label;
        }
      }
      message = message.replace("{chosen}", chosenLabel);
    }
    return { ...popupConfig, message };
  }
  if (popupKey === "potentialWeightLoss") {
    const popupConfig = quizConfig.popups[popupKey];
    if (!popupConfig) return null;
    let heightStr = "";
    if (userData?.height) {
      const { feet, inches } = userData.height;
      heightStr = `${feet}'${inches}″`;
    }
    const weightStr = userData?.weight ? `${userData.weight} lbs` : "";
    const texts = popupConfig.texts
      ? popupConfig.texts.map((t) =>
          t.replace("{height}", heightStr).replace("{weight}", weightStr),
        )
      : [];
    return { ...popupConfig, texts };
  }
  if (popupKey === "YourWeightPopup") {
    const popupConfig = quizConfig.popups[popupKey];
    popupConfig.text = popupConfig.text.replace(
      "{weight}",
      userData.weight || "",
    );
    return popupConfig;
  }

  if (popupKey == "WeightLoss") {
    const base = quizConfig.popups[popupKey];
    if (!base) return null;

    // Compute 25% of user weight safely and format to 1 decimal place when needed
    const rawWeight = Number(userData?.weight);
    const hasValidWeight = !isNaN(rawWeight) && rawWeight > 0;
    let weightToLose = "";
    if (hasValidWeight) {
      // round to 1 decimal (preserves .5 as 37.5 instead of 38)
      const rounded = Math.round(rawWeight * 0.25 * 10) / 10;
      // Convert to string without unnecessary trailing .0
      weightToLose = Number.isInteger(rounded)
        ? String(rounded)
        : String(rounded);
    }

    const message = base.message
      ? base.message.replace("{weightToLose}", weightToLose)
      : base.message;

    return { ...base, message };
  }

  if (popupKey == "WeightLoss") {
    const base = quizConfig.popups[popupKey];
    if (!base) return null;

    // Compute 25% of user weight safely and format to 1 decimal place when needed
    const rawWeight = Number(userData?.weight);
    const hasValidWeight = !isNaN(rawWeight) && rawWeight > 0;
    let weightToLose = "";
    if (hasValidWeight) {
      // round to 1 decimal (preserves .5 as 37.5 instead of 38)
      const rounded = Math.round(rawWeight * 0.25 * 10) / 10;
      // Convert to string without unnecessary trailing .0
      weightToLose = Number.isInteger(rounded)
        ? String(rounded)
        : String(rounded);
    }

    const message = base.message
      ? base.message.replace("{weightToLose}", weightToLose)
      : base.message;

    return { ...base, message };
  }

  return quizConfig.popups[popupKey] || null;
};

import { useEffect, useState } from "react";
import QuestionnaireNavbar from "../components/QuestionnaireNavbar";
import { ProgressBar } from "@/components/EdQuestionnaire/ProgressBar";
import GlpNavbar from "./components/GlpNavbar";

const COUPON_STORAGE_KEY = "pending_coupon_code";

const GLP1Pre = () => {
  const {
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
  } = useGLP1Flow();

  useQuestionnaireStepTracking({
    questionnaireId: "wl-flow-two",
    stepId: currentStep,
    stepIndex: currentStep,
    flowId: "weight-loss",
    stepType: "pre-consultation",
  });

  const [couponBanner, setCouponBanner] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const coupon = params.get("apply_coupon");
      if (coupon && coupon.trim()) {
        localStorage.setItem(COUPON_STORAGE_KEY, coupon.trim());
        setCouponBanner(true);
        setTimeout(() => setCouponBanner(false), 60000);
      }
    } catch (e) {
      logger.error("Error capturing coupon from URL:", e);
    }
  }, []);

  // Ensure hooks run in the same order on every render: place effects immediately after hooks
  useEffect(() => {
    logger.log("[WLFlowTwo] Current step changed:", currentStep);
  }, [currentStep]);

  // Resolve activePopup to a popup config object (string key or already an object)
  const activePopupConfig = (() => {
    if (!activePopup) return null;
    if (typeof activePopup === "string") {
      return getPopupConfigWithChosenValue(activePopup, userData);
    }
    return activePopup; // assume object
  })();

  // Only short-circuit the whole flow when the popup is intended to be a full page
  if (activePopup && (activePopupConfig?.asPage ?? true)) {
    return (
      <PasswordProvider>
        <GenericPopup
          isOpen={!!activePopup}
          onClose={closePopup}
          popupConfig={activePopupConfig}
          asPage={activePopupConfig?.asPage ?? true}
          onAction={handleAction}
          currentPage={currentStep}
          progressBar={progressPercent}
          setUserData={setUserData}
        />
      </PasswordProvider>
    );
  }

  return (
    <PasswordProvider>
      <div className="min-h-screen flex justify-center items-center flex-col bg-[#F7F4F0]">
        <GlpNavbar currentPage={currentStep} onBack={handleBack} />
        {/* Progress Bar - Hide for recommendation step */}
        {/* {currentStep !== 12 && (
          <div className="pt-4 pb-6">
            <ProgressBar progress={progressPercent || 100} />
          </div>
        )} */}

        {/* Main content */}
        <div className="flex-1">
          <QuizStepRenderer
            currentStep={currentStep}
            userData={userData}
            setUserData={setUserData}
            selectedProduct={selectedProduct}
            setSelectedProduct={setSelectedProduct}
            handleContinue={handleContinue}
            handleAction={handleAction}
            handleRecommendationContinue={handleRecommendationContinue}
            handlePlanStepCheckout={handlePlanStepCheckout}
          />
        </div>

        {/* Generic popup */}
        <GenericPopup
          isOpen={!!activePopup}
          onClose={closePopup}
          popupConfig={activePopupConfig}
          asPage={activePopupConfig?.asPage ?? true}
          onAction={handleAction}
          currentPage={currentStep}
          progressBar={progressPercent}
          setUserData={setUserData}
        />
      </div>
    </PasswordProvider>
  );
};

export default GLP1Pre;
