"use client";

import React from "react";
import { useLongevityQuiz } from "./hooks/useLongevityQuiz";
import QuestionnaireNavbar from "@/components/EdQuestionnaire/QuestionnaireNavbar";
import { ProgressBar } from "@/components/EdQuestionnaire/ProgressBar";
import LongevityQuizStepRenderer from "./LongevityQuizStepRenderer";
import LongevityContinueButton from "./components/LongevityContinueButton";
import LongevityPopup from "./components/LongevityPopup";

const LongevityQuiz = ({ config }) => {
    const quizState = useLongevityQuiz(config);
    const isComplete = quizState.stepIndex === 99;
    const isIdUploadStep = quizState.stepIndex === 98;

    return (
        <div className="min-h-screen">
            <QuestionnaireNavbar
                onBackClick={quizState.handleBack}
                currentPage={quizState.stepIndex}
                hideBackButton={isComplete}
                isThankYouPage={isComplete}
            />

            {
                <div className="pt-4 pb-6">
                    <ProgressBar progress={quizState.progress} />
                </div>
            }

            <div className="flex-1">
                <LongevityQuizStepRenderer
                    quizState={quizState}
                    quizConfig={config}
                />
            </div>

            <LongevityPopup
                isOpen={!!quizState.popupType}
                popupData={config.popups[quizState.popupType] || {}}
                onClose={quizState.closePopup}
                onAction={quizState.handleAction}
            />

            {!isComplete && !isIdUploadStep && (
                <LongevityContinueButton
                    quizState={quizState}
                    quizConfig={config}
                />
            )}
        </div>
    );
};

export default LongevityQuiz;
