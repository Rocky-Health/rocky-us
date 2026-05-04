"use client";

import { logger } from "@/utils/devLogger";
import { useBOSimplifiedFlow } from "../BOSimplified/hooks/useBOSimplifiedFlow";
import { boSimplifiedConfig } from "../BOSimplified/config/boSimplifiedConfig";
import GenericPopup from "../BOSimplified/components/GenericPopup";
import { PasswordProvider } from "../contexts/PasswordContext";
import QuizStepRenderer from "./QuizStepRenderer";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";

import { useEffect } from "react";
import QuestionnaireNavbar from "../components/QuestionnaireNavbar";
import { ProgressBar } from "@/components/EdQuestionnaire/ProgressBar";


const getPopupConfigWithChosenValue = (popupKey, userData) => {
  if (popupKey === "potentialWeightLoss") {
    const popupConfig = boSimplifiedConfig.popups[popupKey];
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
    const popupConfig = boSimplifiedConfig.popups[popupKey];
    if (!popupConfig) return null;

    let numericWeight = null;
    if (
      userData.weight !== undefined &&
      userData.weight !== null &&
      userData.weight !== ""
    ) {
      if (typeof userData.weight === "number") {
        numericWeight = userData.weight;
      } else {
        const weightStr = String(userData.weight);
        const weightMatch = weightStr.match(/(\d+(?:\.\d+)?)/);
        if (weightMatch) {
          numericWeight = parseFloat(weightMatch[1]);
        }
      }
    }

    return {
      ...popupConfig,
      weight: numericWeight,
      text: numericWeight ? `${numericWeight} lbs` : "",
    };
  }

  return boSimplifiedConfig.popups[popupKey] || null;
};

const BOSimplifiedFlow2 = () => {
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
  } = useBOSimplifiedFlow();

  useQuestionnaireStepTracking({
    questionnaireId: "bo-simplified-2",
    stepId: currentStep,
    stepIndex: currentStep,
    flowId: "weight-loss",
    stepType: "pre-consultation",
  });


  useEffect(() => {
    logger.log("[BOSimplifiedFlow2] Current step changed:", currentStep);
  }, [currentStep]);

  const activePopupConfig = (() => {
    if (!activePopup) return null;
    if (typeof activePopup === "string") {
      const config = getPopupConfigWithChosenValue(activePopup, userData);
      logger.log(
        "[BOSimplifiedFlow2] Popup config for",
        activePopup,
        ":",
        config,
      );
      return config;
    }
    return activePopup;
  })();

  useEffect(() => {
    if (activePopup) {
      logger.log("[BOSimplifiedFlow2] Active popup:", activePopup);
      logger.log("[BOSimplifiedFlow2] Popup config:", activePopupConfig);
      logger.log("[BOSimplifiedFlow2] User data:", userData);
    }
  }, [activePopup, activePopupConfig, userData]);

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
      <div className="min-h-screen">
        <div className="bg-black text-white text-[14px] leading-[140%] font-medium items-center text-center p-2">
          Lose Weight or Your Money Back
        </div>
        <QuestionnaireNavbar
          onBackClick={handleBack}
          currentPage={currentStep}
        />
        {currentStep !== 7 && currentStep !== 8 && (
          <div className="pt-4 pb-6">
            <ProgressBar progress={progressPercent || 100} />
          </div>
        )}

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
          />
        </div>

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

export default BOSimplifiedFlow2;
