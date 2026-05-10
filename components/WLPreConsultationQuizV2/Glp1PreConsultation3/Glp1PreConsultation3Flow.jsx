"use client";

import { logger } from "@/utils/devLogger";
import { useGlp1PreConsultation3Flow } from "./hooks/useGlp1PreConsultation3Flow";
import { glp1PreConsultation3Config } from "./config/glp1PreConsultation3Config";
import GenericPopup from "./components/GenericPopup";
import { PasswordProvider } from "../contexts/PasswordContext";
import QuizStepRenderer from "./QuizStepRenderer";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";

import { useCallback, useEffect, useState } from "react";
import Glp1PreConsultation3Navbar from "./components/Glp1PreConsultation3Navbar";
import Glp1PreConsultation3PhaseProgress from "./components/Glp1PreConsultation3PhaseProgress";

const getPopupConfigWithChosenValue = (popupKey, userData) => {
    if (popupKey === "potentialWeightLoss") {
        const popupConfig = glp1PreConsultation3Config.popups[popupKey];
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
        const popupConfig = glp1PreConsultation3Config.popups[popupKey];
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

    return glp1PreConsultation3Config.popups[popupKey] || null;
};

const Glp1PreConsultation3Flow = () => {
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
    } = useGlp1PreConsultation3Flow();

    const [hideQuizChrome, setHideQuizChrome] = useState(false);
    const handleQuizChromeVisibilityChange = useCallback((visible) => {
        setHideQuizChrome(!!visible);
    }, []);

    useQuestionnaireStepTracking({
        questionnaireId: "glp1-pre-consultation-3",
        stepId: currentStep,
        stepIndex: currentStep,
        flowId: "weight-loss",
        stepType: "pre-consultation",
    });

    useEffect(() => {
        logger.log(
            "[Glp1PreConsultation3Flow] Current step changed:",
            currentStep,
        );
    }, [currentStep]);

    const activePopupConfig = (() => {
        if (!activePopup) return null;
        if (typeof activePopup === "string") {
            const config = getPopupConfigWithChosenValue(activePopup, userData);
            logger.log(
                "[Glp1PreConsultation3Flow] Popup config for",
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
            logger.log("[Glp1PreConsultation3Flow] Active popup:", activePopup);
            logger.log(
                "[Glp1PreConsultation3Flow] Popup config:",
                activePopupConfig,
            );
            logger.log("[Glp1PreConsultation3Flow] User data:", userData);
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
            <div className="min-h-screen bg-[#F5F4EF]">
                {!hideQuizChrome && (
                    <>
                        <Glp1PreConsultation3Navbar />
                        <Glp1PreConsultation3PhaseProgress
                            currentStep={currentStep}
                            onBack={() => handleBack(userData)}
                        />
                    </>
                )}

                <div
                    className={
                        hideQuizChrome
                            ? "w-full"
                            : "mx-auto w-full max-w-4xl px-4 md:px-6"
                    }
                >
                    <QuizStepRenderer
                        currentStep={currentStep}
                        userData={userData}
                        setUserData={setUserData}
                        selectedProduct={selectedProduct}
                        setSelectedProduct={setSelectedProduct}
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

export default Glp1PreConsultation3Flow;
