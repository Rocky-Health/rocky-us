"use client";

import { logger } from "@/utils/devLogger";
import { useGlp2PreConsultationFlow } from "./hooks/useGlp2PreConsultationFlow";
import { glp2PreConsultationConfig } from "./config/glp2PreConsultationConfig";
import GenericPopup from "./components/GenericPopup"; // Use separate GenericPopup for BO
import { PasswordProvider } from "../contexts/PasswordContext";
import QuizStepRenderer from "./QuizStepRenderer";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";

import { useEffect } from "react";
import QuestionnaireNavbar from "../components/QuestionnaireNavbar";
import { ProgressBar } from "@/components/EdQuestionnaire/ProgressBar";

const getPopupConfigWithChosenValue = (popupKey, userData) => {
  if (popupKey === "potentialWeightLoss") {
    const popupConfig = glp2PreConsultationConfig.popups[popupKey];
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
    const popupConfig = glp2PreConsultationConfig.popups[popupKey];
    if (!popupConfig) return null;

    // Extract numeric weight from userData.weight
    // Weight can be: number (200), string number ("200"), or string with units ("200 lbs")
    let numericWeight = null;
    if (
      userData.weight !== undefined &&
      userData.weight !== null &&
      userData.weight !== ""
    ) {
      if (typeof userData.weight === "number") {
        // Already a number
        numericWeight = userData.weight;
      } else {
        // String - extract number (handles "200 lbs" or "200")
        const weightStr = String(userData.weight);
        const weightMatch = weightStr.match(/(\d+(?:\.\d+)?)/);
        if (weightMatch) {
          numericWeight = parseFloat(weightMatch[1]);
        }
      }
    }

    // Create a new config object to avoid mutating the original
    return {
      ...popupConfig,
      weight: numericWeight, // Pass numeric weight to component
      text: numericWeight ? `${numericWeight} lbs` : "", // For display (backward compatibility)
    };
  }

  return glp2PreConsultationConfig.popups[popupKey] || null;
};

const Glp2PreConsultationFlow = () => {
  const {
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
  } = useGlp2PreConsultationFlow();

  useQuestionnaireStepTracking({
    questionnaireId: "glp2-pre-consultation",
    stepId: currentStep,
    stepIndex: currentStep,
    flowId: "weight-loss",
    stepType: "pre-consultation",
  });

  // Ensure hooks run in the same order on every render
  useEffect(() => {
    logger.log("[Glp2PreConsultationFlow] Current step changed:", currentStep);
  }, [currentStep]);

  // Resolve activePopup to a popup config object
  const activePopupConfig = (() => {
    if (!activePopup) return null;
    if (typeof activePopup === "string") {
      const config = getPopupConfigWithChosenValue(activePopup, userData);
      logger.log(
        "[Glp2PreConsultationFlow] Popup config for",
        activePopup,
        ":",
        config,
      );
      return config;
    }
    return activePopup; // assume object
  })();

  // Debug logging
  useEffect(() => {
    if (activePopup) {
      logger.log("[Glp2PreConsultationFlow] Active popup:", activePopup);
      logger.log("[Glp2PreConsultationFlow] Popup config:", activePopupConfig);
      // Quiz answers are PHI, so log the field names only.
      logger.log("[Glp2PreConsultationFlow] User data fields:", Object.keys(userData || {}));
    }
  }, [activePopup, activePopupConfig, userData]);

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
      <div className="min-h-screen bg-[#F5F4EF]">
        {/* <div className="bg-black text-white text-[14px] leading-[140%] font-medium items-center text-center p-2">
          Lose Weight or Your Money Back
        </div> */}
        {/* QuestionnaireNavbar */}
        <QuestionnaireNavbar
          onBackClick={handleBack}
          currentPage={currentStep}
        />
        {/* Progress Bar - Hide for recommendation step only */}
        {currentStep !== 16 && (
          <div className="pt-4 pb-6">
            <ProgressBar progress={progressPercent || 100} />
          </div>
        )}

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
            handleBack={handleBack}
            goToStep={goToStep}
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

export default Glp2PreConsultationFlow;
