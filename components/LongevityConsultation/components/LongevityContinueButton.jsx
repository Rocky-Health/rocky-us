import React, { useState, useEffect } from "react";

const LongevityContinueButton = ({ quizState, quizConfig }) => {
  const [showButton, setShowButton] = useState(false);

  const shouldShow = () => {
    const { stepIndex, answers, entrykeyPrimed } = quizState;
    if (entrykeyPrimed === false) return false;
    const stepConfig = quizConfig.steps[stepIndex];

    if (!stepConfig) return false;

    // Textarea: hide Continue until the user has typed something (all three longevity quizzes)
    if (stepConfig.type === "textarea") {
      const text = answers[stepConfig.field];
      return String(text ?? "").trim().length > 0;
    }

    // Non-required steps always show Continue
    if (!stepConfig.required) return true;

    const fieldValue = answers[stepConfig.field];

    if (stepConfig.type === "checkbox") {
      if (!fieldValue || fieldValue.length === 0) return false;

      // If popup fires on non-exclusive select, only allow Continue when
      // the ONLY selected options are the exclusive ones (e.g. "None of the above")
      if (stepConfig.showPopupOnNonExclusiveSelect) {
        const hasNonExclusive = fieldValue.some(
          (v) => !stepConfig.exclusiveOptions?.includes(v)
        );
        return !hasNonExclusive;
      }

      return true;
    }

    if (stepConfig.type === "radio") {
      if (!fieldValue) return false;

      // Screening radios: only "None of the above" allows Continue (risk opens popup)
      if (
        stepConfig.exclusiveOptions?.length &&
        stepConfig.showPopupOnNonExclusiveSelect
      ) {
        return stepConfig.exclusiveOptions.includes(fieldValue);
      }

      if (stepConfig.blockContinueOnValues?.includes(fieldValue)) {
        return false;
      }

      return true;
    }

    // Combined radio + conditional textarea (e.g. "Do you take any
    // medications?" → Yes reveals a textarea). Continue is gated on the
    // radio always, and additionally on non-empty text when the selected
    // option opted into the textarea.
    if (stepConfig.type === "radio-text") {
      if (!fieldValue) return false;
      const selectedOption = (stepConfig.options || []).find(
        (opt) => opt.id === fieldValue
      );
      if (selectedOption?.showTextInput) {
        const text = answers[stepConfig.textField];
        return String(text ?? "").trim().length > 0;
      }
      return true;
    }

    return !!fieldValue;
  };

  useEffect(() => {
    setShowButton(shouldShow());
  }, [
    quizState.stepIndex,
    quizState.answers,
    quizState.entrykeyPrimed,
  ]);

  if (!showButton) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg"
      style={{ zIndex: 99999 }}
    >
      <div className="max-w-md mx-auto space-y-2">
        {quizState.submitError && (
          <p className="text-sm text-red-600 text-center px-1">
            {quizState.submitError}
          </p>
        )}
        <button
          type="button"
          onClick={() => quizState.handleContinue()}
          disabled={quizState.isSubmitting}
          className="w-full py-3 rounded-full font-medium bg-black text-white hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {quizState.isSubmitting ? "Saving…" : "Continue"}
        </button>
      </div>
    </div>
  );
};

export default LongevityContinueButton;
