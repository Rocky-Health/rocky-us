import React, { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";

const StickyQuizContinueButton = ({ quizState, quizConfig, onContinue }) => {
  const [showButton, setShowButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to check if current step is valid and button should be shown
  const shouldShowContinueButton = () => {
    // Only show for regular question steps (1-13)
    if (quizState.stepIndex > 13) return false;

    const stepConfig = quizConfig.steps[quizState.stepIndex];
    if (!stepConfig || !stepConfig.required) return true;

    const fieldValue = quizState.answers[stepConfig.field];

    // Basic validation logic
    if (stepConfig.type === "checkbox") {
      return fieldValue && fieldValue.length > 0;
    }

    if (stepConfig.type === "radio" || stepConfig.type === "radio-image") {
      return fieldValue !== null && fieldValue !== undefined;
    }

    if (stepConfig.type === "radio-text") {
      if (!fieldValue) return false; // No option selected

      // Find the selected option
      const selectedOption = stepConfig.options.find(
        (opt) => opt.id === fieldValue
      );
      if (!selectedOption) return false;

      // If the selected option requires text input, check if text is provided
      if (selectedOption.showTextInput) {
        const textValue = quizState.answers[stepConfig.textField];
        // Log the shape of the answer, never the answer itself
        logger.log("Radio-text validation:", {
          textField: stepConfig.textField,
          hasText: Boolean(textValue && textValue.trim().length > 0),
        });
        return textValue && textValue.trim().length > 0;
      }

      // If no text input required (like "No" option), it's valid
      return true;
    }

    return fieldValue !== null && fieldValue !== undefined;
  };

  // Update button visibility when quiz state changes
  useEffect(() => {
    const shouldShow = shouldShowContinueButton();
    logger.log("Button visibility check:", {
      stepIndex: quizState.stepIndex,
      answerCount: Object.keys(quizState.answers || {}).length,
      shouldShow,
    });
    setShowButton(shouldShow);
  }, [quizState.stepIndex, quizState.answers]);

  // Handle continue button click
  const handleContinue = async () => {
    if (!isSubmitting) {
      setIsSubmitting(true);
      try {
        // Submit current step data and continue
        if (quizState.submitCurrentStepData) {
          await quizState.submitCurrentStepData();
        }
        if (onContinue) {
          onContinue();
        } else {
          quizState.handleNext();
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Don't render if button shouldn't be shown
  if (!showButton) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg"
      style={{
        position: "fixed",
        bottom: "0",
        left: "0",
        right: "0",
        zIndex: 99999,
      }}
    >
      <div className="max-w-md mx-auto">
        <button
          onClick={handleContinue}
          disabled={isSubmitting}
          className={`w-full py-3 rounded-full font-medium ${
            isSubmitting
              ? "bg-gray-400 text-gray-200 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800"
          }`}
        >
          {isSubmitting ? "Submitting..." : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default StickyQuizContinueButton;
