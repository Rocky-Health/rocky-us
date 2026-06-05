"use client";

import { logger } from "@/utils/devLogger";
import { useNadPlusQuizFlow } from "./hooks/useNadPlusQuizFlow";
import { nadPlusQuizConfig } from "./config/nadPlusQuizConfig";
import GenericPopup from "./components/GenericPopup";
import { PasswordProvider } from "../contexts/PasswordContext";
import QuizStepRenderer from "./QuizStepRenderer";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";

import { useCallback, useEffect, useState } from "react";
import NadPlusQuizNavbar from "./components/NadPlusQuizNavbar";
import NadPlusQuizPhaseProgress from "./components/NadPlusQuizPhaseProgress";

const getPopupConfigWithChosenValue = (popupKey, userData) => {
    if (popupKey === "potentialWeightLoss") {
        const popupConfig = nadPlusQuizConfig.popups[popupKey];
        if (!popupConfig) return null;
        let heightStr = "";
        if (userData?.height) {
            const { feet, inches } = userData.height;
            heightStr = `${feet}'${inches}″`;
        }
        const weightStr = userData?.weight ? `${userData.weight} lbs` : "";
        const texts = popupConfig.texts
            ? popupConfig.texts.map((t) =>
                  t
                      .replace("{height}", heightStr)
                      .replace("{weight}", weightStr),
              )
            : [];
        return { ...popupConfig, texts };
    }

    if (popupKey === "YourWeightPopup") {
        const popupConfig = nadPlusQuizConfig.popups[popupKey];
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

    return nadPlusQuizConfig.popups[popupKey] || null;
};

const NadPlusQuizFlow = () => {
    const {
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
        handleRecommendationContinue,
        handlePlanStepCheckout,
    } = useNadPlusQuizFlow();

    const [hideQuizChrome, setHideQuizChrome] = useState(false);
    const handleQuizChromeVisibilityChange = useCallback((visible) => {
        setHideQuizChrome(!!visible);
    }, []);

    useQuestionnaireStepTracking({
        questionnaireId: "nad-plus-quiz",
        stepId: currentStep,
        stepIndex: currentStep,
        flowId: "nad",
        stepType: "pre-consultation",
    });

    useEffect(() => {
        logger.log(
            "[NadPlusQuizFlow] Current step changed:",
            currentStep,
        );
    }, [currentStep]);

    const activePopupConfig = (() => {
        if (!activePopup) return null;
        if (typeof activePopup === "string") {
            const config = getPopupConfigWithChosenValue(activePopup, userData);
            logger.log(
                "[NadPlusQuizFlow] Popup config for",
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
            logger.log("[NadPlusQuizFlow] Active popup:", activePopup);
            logger.log(
                "[NadPlusQuizFlow] Popup config:",
                activePopupConfig,
            );
            logger.log("[NadPlusQuizFlow] User data:", userData);
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
            <div className="min-h-screen bg-[#F5F4EF] ">
                {!hideQuizChrome && (
                    <>
                        <NadPlusQuizNavbar />
                        <NadPlusQuizPhaseProgress
                            currentStep={currentStep}
                            onBack={() => handleBack(userData)}
                        />
                    </>
                )}

                <div
                    className={
                        hideQuizChrome
                            ? "w-full"
                            : "mx-auto w-full max-w-4xl px-6 sm:px-20 lg:px-6 "
                    }
                >
                    <QuizStepRenderer
                        currentStep={currentStep}
                        userData={userData}
                        setUserData={setUserData}
                        handleContinue={handleContinue}
                        handleAction={handleAction}
                        handleRecommendationContinue={
                            handleRecommendationContinue
                        }
                        handleBack={() => handleBack(userData)}
                        goToStep={goToStep}
                        handlePlanStepCheckout={handlePlanStepCheckout}
                        onQuizChromeVisibilityChange={
                            handleQuizChromeVisibilityChange
                        }
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

export default NadPlusQuizFlow;
