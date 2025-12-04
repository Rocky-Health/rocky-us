"use client";
import React, { useEffect, useState } from "react";
import RadioQuestion from "./RadioQuestion";
import CheckboxQuestion from "./CheckboxQuestion";
import RadioTextQuestion from "./RadioTextQuestion";
import InfoIcon from "./InfoIcon";
import RadioImagesQuestion from "./RadioImagesQuestion";
import SelectQuestion from "./SelectQuestion";
import DateQuestion from "./DateQuestion";
import BMICalculatorStep from "./BMICalculatorStep";
import Form from "./Form";
import MessageForQuiz from "./MessageForQuiz";

const GenericQuestionStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onAction,
}) => {
  const [textInput, setTextInput] = useState(
    userData[stepConfig.textField] || ""
  );

  // scroll to top when the page mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.scrollTo(0, 0);
      } catch (e) {
        /* ignore */
      }
    }
  }, []);

  // Handle option selection
  const handleOptionSelect = (value, option) => {
    // Update user data
    setUserData((prev) => ({
      ...prev,
      [stepConfig.field]: value,
    }));

    // Handle special actions
    if (option?.action) {
      onAction(option.action, option.popupType || option);
      return;
    }

    // Handle conditional navigation
    if (stepConfig.conditionalNavigation?.[value]) {
      onAction("navigate", stepConfig.conditionalNavigation[value]);
      return;
    }

    // Handle text input requirement
    if (option?.showTextInput) {
      return; // Don't continue, wait for text input
    }

    // Continue to next step (use wrapped continue so conditionalActions are evaluated)
    handleContinue(value);
  };

  // Handle checkbox toggle (for multi-select)
  const handleCheckboxToggle = (optionId, option) => {
    const currentValues = userData[stepConfig.field] || [];
    let newValues;

    // Handle exclusive options (like "none")
    if (stepConfig.exclusiveOptions?.includes(optionId)) {
      newValues = currentValues.includes(optionId) ? [] : [optionId];
    } else {
      // Remove exclusive options if any other option is selected
      const filteredValues = currentValues.filter(
        (val) => !stepConfig.exclusiveOptions?.includes(val)
      );

      newValues = filteredValues.includes(optionId)
        ? filteredValues.filter((val) => val !== optionId)
        : [...filteredValues, optionId];
    }

    setUserData((prev) => ({
      ...prev,
      [stepConfig.field]: newValues,
    }));

    // Handle special actions
    if (option?.action) {
      onAction(option.action, option.popupType || option);
    }
  };

  // Handle text input submission
  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setUserData((prev) => ({
        ...prev,
        [stepConfig.textField]: textInput.trim(),
      }));
      handleContinue(textInput.trim());
    }
  };

  // Check if step is valid
  const isValid = () => {
    if (!stepConfig.required) return true;

    const fieldValue = userData[stepConfig.field];

    if (stepConfig.type === "checkbox") {
      return fieldValue && fieldValue.length > 0;
    }

    if (stepConfig.type === "radio-text") {
      if (fieldValue === false) return true; // "No" selected
      return fieldValue === true && textInput.trim(); // "Yes" + text
    }

    return fieldValue !== null && fieldValue !== undefined;
  };

  // Wrapped continue: run conditionalActions (if any) when user presses Continue
  // Accept an optional valueToCheck so callers (like radios) can pass the freshly selected value
  const handleContinue = (valueToCheck) => {
    const fieldValue =
      valueToCheck !== undefined ? valueToCheck : userData[stepConfig.field];

    // Helper to trigger action for a matched key
    const triggerForKey = (key) => {
      if (stepConfig.conditionalActions?.[key]) {
        const action = stepConfig.conditionalActions[key];
        onAction(action.action, action.popupType);
        return true;
      }
      return false;
    };

    // If checkbox, fieldValue is an array — check any selected options
    if (Array.isArray(fieldValue)) {
      for (const val of fieldValue) {
        if (triggerForKey(val)) return; // popup opened, stop
      }
      onContinue();
      return;
    }

    // For single-value (radio/select/date/etc.) — if valueToCheck passed as array-like, handle it
    if (fieldValue !== null && fieldValue !== undefined) {
      // If caller passed an array-like single value incorrectly, handle gracefully
      if (Array.isArray(fieldValue)) {
        for (const val of fieldValue) {
          if (triggerForKey(val)) return;
        }
      } else {
        if (triggerForKey(fieldValue)) return; // popup opened
      }
    }

    // Default: continue
    onContinue();
  };

  // Render question based on type
  const renderQuestion = () => {
    const questionProps = {
      config: stepConfig,
      userData,
      onSelect: handleOptionSelect,
      onToggle: handleCheckboxToggle,
      textInput,
      setTextInput,
      onTextSubmit: handleTextSubmit,
      onContinue: handleContinue,
      isValid: isValid(),
    };

    switch (stepConfig.type) {
      case "radio":
        return <RadioQuestion {...questionProps} />;
      case "checkbox":
        return <CheckboxQuestion {...questionProps} />;
      case "radio-text":
        return <RadioTextQuestion {...questionProps} />;
      case "radio-images":
        return <RadioImagesQuestion {...questionProps} />;
      case "select":
        return <SelectQuestion {...questionProps} />;
      case "date":
        return <DateQuestion {...questionProps} setUserData={setUserData} />;
      case "BMICalculator":
        return (
          <BMICalculatorStep
            {...questionProps}
            onAction={onAction}
            setUserData={setUserData}
          />
        );
      case "form":
        return (
          <Form
            {...questionProps}
            setUserData={setUserData}
            onAction={onAction}
          />
        );

      default:
        return <div>Unsupported question type: {stepConfig.type}</div>;
    }
  };

  // Interpolate [LASTNAME] in the title if present
  let stepTitle = stepConfig.title;
  if (stepTitle && stepTitle.includes("[LASTNAME]")) {
    const lastName = userData?.lastName || "";
    stepTitle = stepTitle.replace("[LASTNAME]", lastName);
  }

  return (
    <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 ">
      {stepConfig.showMessage && (
        <MessageForQuiz
          message={stepConfig.showMessage}
          messageStyle={stepConfig.messageStyle}
        />
      )}

      {stepConfig.Qheader && (
        <div className="px-8 md:px-0">
          <h2 className="subheaders-font text-[28px] leading-[140%] tracking-tight text-center text-[#251F20] mb-[24px] font-[450]">
            
            A Slow Metabolism is {" "}
            <span className="text-[#AE7E56] font-[700]"><u>not </u> your choice</span>.
          </h2>
          <p className="text-center mb-[24px] text-[14px] leading-[140%] font-normal">
            GLP-1 medications can help <span className="text-[#AE7E56] font-[500] mb-[50px]">
              regulate appetite and support healthier
            eating habits</span>, so losing weight becomes more manageable.
          </p>
          <hr className="mt-[50px] mb-[24px] border-[#E2E2E1] border-[2px]"/>

        </div>
      )}

      {/* Header - WL style */}

      <div
        className={`${
          stepConfig.hasInfoIcon ? "flex items-center gap-3 mb-4" : "mb-4"
        }`}
      >
        <h1
          className={`subheaders-font ${
            stepConfig.id == "topPriority"
              ? "text-[16px]"
              : "text-[26px] md:text-[32px]"
          } ${
            stepConfig.titleCenter ? "text-center mb-6" : ""
          } font-medium leading-[120%] `}
        >
          {typeof stepTitle === "string" && /<[^>]+>/.test(stepTitle) ? (
            <span dangerouslySetInnerHTML={{ __html: stepTitle }} />
          ) : (
            stepTitle
          )}
        </h1>
        {stepConfig.hasInfoIcon && (
          <InfoIcon infoContent={stepConfig.infoContent} />
        )}
      </div>

      {/* Subtitle */}
      {stepConfig.subtitle &&
        (typeof stepConfig.subtitle === "string" &&
        /<[^>]+>/.test(stepConfig.subtitle) ? (
          <p
            className="text-[14px] text-[#AE7E56] mb-[24px] md:w-full font-medium"
            dangerouslySetInnerHTML={{ __html: stepConfig.subtitle }}
          />
        ) : (
          <p className="text-[14px] text-[#AE7E56] mb-[24px]  md:w-full font-medium">
            {stepConfig.subtitle}
          </p>
        ))}

      {/* Question content */}
      {renderQuestion()}
    </div>
  );
};

export default GenericQuestionStep;
