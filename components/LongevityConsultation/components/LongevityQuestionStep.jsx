import React from "react";
import LongevityCheckboxQuestion from "./LongevityCheckboxQuestion";
import LongevityRadioQuestion from "./LongevityRadioQuestion";
import LongevityRadioTextQuestion from "./LongevityRadioTextQuestion";
import LongevityTextareaQuestion from "./LongevityTextareaQuestion";

const LongevityQuestionStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onAction,
  onScreeningRiskPersist,
}) => {
  // ─── Radio handler ───────────────────────────────────────────────────────────

  const handleOptionSelect = (value, option) => {
    setUserData((prev) => ({ ...prev, [stepConfig.field]: value }));

    // Trigger conditional actions (e.g. show popup on "Yes")
    if (stepConfig.conditionalActions?.[value]) {
      const { action, popupType } = stepConfig.conditionalActions[value];
      onAction(action, popupType);
    }

    // Single-choice screening radios: risk option → eligibility popup (same as old checkbox flow)
    const isScreeningRisk =
      stepConfig.type === "radio" &&
      stepConfig.crmSubfieldRadio &&
      stepConfig.showPopupOnNonExclusiveSelect &&
      stepConfig.exclusiveOptions?.length &&
      !stepConfig.exclusiveOptions.includes(value);

    if (
      stepConfig.showPopupOnNonExclusiveSelect &&
      stepConfig.exclusiveOptions?.length
    ) {
      const isNonExclusive = !stepConfig.exclusiveOptions.includes(value);
      if (isNonExclusive) {
        onAction("showPopup", stepConfig.showPopupOnNonExclusiveSelect);
      }
    }

    const isBlockContinueSelection =
      stepConfig.type === "radio" &&
      stepConfig.blockContinueOnValues?.includes(value);

    // Continue is hidden for screening risks or blockContinue (e.g. allergy Yes) — POST partial so CRM still gets the answer
    if (
      (isScreeningRisk || isBlockContinueSelection) &&
      onScreeningRiskPersist
    ) {
      const merged = { ...userData, [stepConfig.field]: value };
      void onScreeningRiskPersist(merged);
    }
  };

  // ─── Checkbox handler ────────────────────────────────────────────────────────

  const handleCheckboxToggle = (optionId) => {
    const currentValues = userData[stepConfig.field] || [];
    let newValues;

    if (stepConfig.exclusiveOptions?.includes(optionId)) {
      // "None of the above" — clear all others or deselect itself
      newValues = currentValues.includes(optionId) ? [] : [optionId];
    } else {
      // Remove exclusive options, then toggle this one
      const filtered = currentValues.filter(
        (v) => !stepConfig.exclusiveOptions?.includes(v)
      );
      newValues = filtered.includes(optionId)
        ? filtered.filter((v) => v !== optionId)
        : [...filtered, optionId];
    }

    setUserData((prev) => ({ ...prev, [stepConfig.field]: newValues }));

    // Show popup when a non-exclusive option is being ADDED (not removed)
    const isBeingAdded = !currentValues.includes(optionId);
    const isNonExclusive = !stepConfig.exclusiveOptions?.includes(optionId);

    if (
      stepConfig.showPopupOnNonExclusiveSelect &&
      isNonExclusive &&
      isBeingAdded
    ) {
      onAction("showPopup", stepConfig.showPopupOnNonExclusiveSelect);
    }
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  const renderQuestion = () => {
    switch (stepConfig.type) {
      case "textarea":
        return (
          <LongevityTextareaQuestion
            config={stepConfig}
            userData={userData}
            setUserData={setUserData}
          />
        );
      case "checkbox":
        return (
          <LongevityCheckboxQuestion
            config={stepConfig}
            userData={userData}
            onToggle={handleCheckboxToggle}
          />
        );
      case "radio":
        return (
          <LongevityRadioQuestion
            config={stepConfig}
            userData={userData}
            onSelect={handleOptionSelect}
          />
        );
      case "radio-text":
        return (
          <LongevityRadioTextQuestion
            config={stepConfig}
            userData={userData}
            setUserData={setUserData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6 pb-24 opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]">
      <div className="mb-6">
        <h1 className="headers-font text-[26px] font-[450] md:font-medium md:text-[32px] md:leading-[115%] leading-[120%] tracking-[-1%] md:tracking-[-2%]">
          {stepConfig.title}
        </h1>
        {stepConfig.subtitle && (
          <p className="text-[14px] md:text-[16px] text-gray-600 mt-2">
            {stepConfig.subtitle}
          </p>
        )}
      </div>

      {renderQuestion()}

      <div className="text-[10px] my-6 text-[#00000059] text-left font-[400] leading-[140%] tracking-[0%]">
        We respect your privacy. All of your information is securely stored on
        our PIPEDA Compliant server.
      </div>
    </div>
  );
};

export default LongevityQuestionStep;
