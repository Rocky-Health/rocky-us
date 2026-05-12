"use client";
import React, { useEffect, useState } from "react";
import MessageForQuiz from "../../components/MessageForQuiz";
import InfoIcon from "../../components/InfoIcon";
import Page from "./Page";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const Glp1GenericQuestionStep = ({
  stepConfig,
  questions,
  userData,
  setUserData,
  onContinue,
  onAction,
}) => {
  const pageQuestions =
    Array.isArray(questions) && questions.length > 0
      ? questions
      : [stepConfig].filter(Boolean);
  const pageQuestionIds = pageQuestions.map((q) => q?.id || "").join("|");
  const isMultiQuestionPage = pageQuestions.length > 1;

  // Always use the first question for type-checking and single-page logic
  const activeStepConfig = pageQuestions[0] || stepConfig;

  const getTextFieldForConfig = (config, selectedValue) => {
    if (!config) return "";

    const selectedOption = (config.options || []).find(
      (option) => option.id === selectedValue,
    );

    if (selectedOption?.showTextInput) {
      return (
        selectedOption.textField || config.textField || `${config.field}Details`
      );
    }

    return config.textField || "";
  };

  const activeTextField = getTextFieldForConfig(
    activeStepConfig,
    userData[activeStepConfig?.field],
  );

  const [textInput, setTextInput] = useState(userData[activeTextField] || "");

  useEffect(() => {
    setTextInput(userData[activeTextField] || "");
  }, [activeTextField, userData]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.scrollTo(0, 0);
      } catch (e) {
        // ignore
      }
    }
  }, [pageQuestionIds]);

  const handleOptionSelect = (value, option) => {
    setUserData((prev) => ({
      ...prev,
      [activeStepConfig.field]: value,
    }));

    if (option?.action) {
      onAction(option.action, option.popupType || option);
      return;
    }

    if (activeStepConfig.conditionalNavigation?.[value]) {
      onAction("navigate", activeStepConfig.conditionalNavigation[value]);
      return;
    }

    if (option?.showTextInput) {
      return;
    }

    handleContinue(value);
  };

  const handleCheckboxToggle = (optionId, option) => {
    const currentValues = userData[activeStepConfig.field] || [];
    let newValues;

    if (activeStepConfig.exclusiveOptions?.includes(optionId)) {
      newValues = currentValues.includes(optionId) ? [] : [optionId];
    } else {
      const filteredValues = currentValues.filter(
        (val) => !activeStepConfig.exclusiveOptions?.includes(val),
      );

      newValues = filteredValues.includes(optionId)
        ? filteredValues.filter((val) => val !== optionId)
        : [...filteredValues, optionId];
    }

    setUserData((prev) => ({
      ...prev,
      [activeStepConfig.field]: newValues,
    }));

    if (option?.action) {
      onAction(option.action, option.popupType || option);
    }
  };

  const handleTextSubmit = () => {
    const textField = getTextFieldForConfig(
      activeStepConfig,
      userData[activeStepConfig?.field],
    );

    if (!textField) {
      handleContinue();
      return;
    }

    if (textInput.trim()) {
      setUserData((prev) => ({
        ...prev,
        [textField]: textInput.trim(),
      }));
      handleContinue(textInput.trim());
    }
  };

  const isValid = () => {
    if (!activeStepConfig.required) return true;

    const fieldValue = userData[activeStepConfig.field];

    if (activeStepConfig.type === "checkbox") {
      return fieldValue && fieldValue.length > 0;
    }

    if (
      activeStepConfig.type === "radio-text" ||
      activeStepConfig.type === "radio"
    ) {
      const selectedOption = (activeStepConfig.options || []).find(
        (option) => option.id === fieldValue,
      );

      if (!selectedOption?.showTextInput) {
        return fieldValue !== null && fieldValue !== undefined;
      }

      return textInput.trim() !== "";
    }

    return fieldValue !== null && fieldValue !== undefined;
  };

  const handleContinue = (valueToCheck) => {
    const fieldValue =
      valueToCheck !== undefined
        ? valueToCheck
        : userData[activeStepConfig.field];

    const triggerForKey = (key) => {
      if (activeStepConfig.conditionalActions?.[key]) {
        const action = activeStepConfig.conditionalActions[key];
        onAction(action.action, action.popupType);
        return true;
      }
      return false;
    };

    if (Array.isArray(fieldValue)) {
      for (const val of fieldValue) {
        if (triggerForKey(val)) return;
      }
      onContinue();
      return;
    }

    if (fieldValue !== null && fieldValue !== undefined) {
      if (triggerForKey(fieldValue)) return;
    }

    onContinue();
  };

  const renderQuestion = () => {
    const questionProps = {
      config: activeStepConfig,
      userData,
      onSelect: handleOptionSelect,
      onToggle: handleCheckboxToggle,
      textInput,
      setTextInput,
      onTextSubmit: handleTextSubmit,
      onContinue: handleContinue,
      isValid: isValid(),
    };

    const sharedStepProps = {
      userData,
      setUserData,
      config: activeStepConfig,
      onContinue: handleContinue,
      onAction,
    };

    return (
      <Page
        key={pageQuestionIds}
        questionConfig={activeStepConfig}
        questions={pageQuestions}
        userData={userData}
        setUserData={setUserData}
        onContinue={isMultiQuestionPage ? onContinue : handleContinue}
        onAction={onAction}
        questionProps={questionProps}
        sharedStepProps={sharedStepProps}
      />
    );
  };

  let stepTitle = activeStepConfig.title;
  if (stepTitle && stepTitle.includes("[LASTNAME]")) {
    const lastName = userData?.lastName || "";
    stepTitle = stepTitle.replace("[LASTNAME]", lastName);
  }

  const isBmiStep = activeStepConfig?.id === "currentWeight";
  const isBeforeAfterStep = activeStepConfig?.type === "beforeAfter";
  const isGlp2DobStep = activeStepConfig?.type === "glp2Dob";
  const isGlp2ContactAuthStep = activeStepConfig?.type === "glp2ContactAuth";
  const isGlp1ContactAuthStep = activeStepConfig?.type === "glp1ContactAuth";
  const isCustomFullLayoutStep =
    isBmiStep ||
    isBeforeAfterStep ||
    isGlp2DobStep ||
    isGlp2ContactAuthStep ||
    isGlp1ContactAuthStep;

  if (
    isBeforeAfterStep ||
    isGlp2DobStep ||
    isGlp2ContactAuthStep ||
    isGlp1ContactAuthStep
  ) {
    return <>{renderQuestion()}</>;
  }

  return (
    <div className="w-full  md:max-w-[665px] mx-auto px-5 md:px-0 ">
      {activeStepConfig.showMessage && (
        <MessageForQuiz
          message={activeStepConfig.showMessage}
          messageStyle={activeStepConfig.messageStyle}
        />
      )}

      {activeStepConfig.Qheader && (
        <div className="px-8 md:px-0">
          <h2 className="subheaders-font text-[28px] leading-[140%] tracking-tight text-center text-[#251F20] mb-[24px] font-[450]">
            A Slow Metabolism is{" "}
            <span className="text-[#AE7E56] font-[700]">
              <u>not </u> your choice
            </span>
            .
          </h2>
          <p className="text-center mb-[24px] text-[14px] leading-[140%] font-normal">
            GLP-1 medications can help{" "}
            <span className="text-[#AE7E56] font-[500] mb-[50px]">
              regulate appetite and support healthier eating habits
            </span>
            , so losing weight becomes more manageable.
          </p>
          <hr className="mt-[50px] mb-[24px] border-[#E2E2E1] border-[2px]" />
        </div>
      )}

      {/* Only show external title for single-question pages without custom full layout */}
      {!isCustomFullLayoutStep && !isMultiQuestionPage && (
        <>
          <div
            className={`${activeStepConfig.hasInfoIcon ? "flex items-center gap-3 mb-4" : "mb-4"}`}
          >
            <h1
              className={`subheaders-font ${
                activeStepConfig.id == "topPriority"
                  ? "text-[16px]"
                  : "text-[26px] md:text-[32px]"
              } ${activeStepConfig.titleCenter ? "text-center mb-6" : ""} font-medium leading-[120%] `}
            >
              {typeof stepTitle === "string" && /<[^>]+>/.test(stepTitle) ? (
                <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(stepTitle) }} />
              ) : (
                stepTitle
              )}
            </h1>
            {activeStepConfig.hasInfoIcon && (
              <InfoIcon infoContent={activeStepConfig.infoContent} />
            )}
          </div>

          {activeStepConfig.subtitle &&
            (typeof activeStepConfig.subtitle === "string" &&
            /<[^>]+>/.test(activeStepConfig.subtitle) ? (
              <p
                className="text-[14px] text-[#AE7E56] mb-[24px] md:w-full font-medium"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(activeStepConfig.subtitle) }}
              />
            ) : (
              <p className="text-[14px] text-[#AE7E56] mb-[24px] md:w-full font-medium">
                {activeStepConfig.subtitle}
              </p>
            ))}
        </>
      )}

      {renderQuestion()}
    </div>
  );
};

export default Glp1GenericQuestionStep;
