"use client";
import React, { useEffect, useState } from "react";
import RadioQuestion from "../../components/RadioQuestion";
import CheckboxQuestion from "../../components/CheckboxQuestion";
import RadioTextQuestion from "../../components/RadioTextQuestion";
import InfoIcon from "../../components/InfoIcon";
import RadioImagesQuestion from "../../components/RadioImagesQuestion";
import SelectQuestion from "../../components/SelectQuestion";
import DateQuestion from "../../components/DateQuestion";
import Glp2BMICalculatorStep from "./Glp2BMICalculatorStep";
import Glp2BeforeAfterStep from "./Glp2BeforeAfterStep";
import Glp2BeforeAfterStep2 from "./Glp2BeforeAfterStep2";
import Glp2BeforeAfterStep3 from "./Glp2BeforeAfterStep3";
import Glp2PaceQuestionStep from "./Glp2PaceQuestionStep";
import Glp2PaceResultStep from "./Glp2PaceResultStep";
import Glp2SleepStep from "./Glp2SleepStep";
import Glp2WillingnessStep from "./Glp2WillingnessStep";
import Glp2WeightChangedStep from "./Glp2WeightChangedStep";
import Glp2MedicationPriorityStep from "./Glp2MedicationPriorityStep";
import Glp2StateOfMindStep from "./Glp2StateOfMindStep";
import Form from "../../components/Form";
import MessageForQuiz from "../../components/MessageForQuiz";

const Glp2GenericQuestionStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onAction,
}) => {
  const [textInput, setTextInput] = useState(
    userData[stepConfig.textField] || "",
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        window.scrollTo(0, 0);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleOptionSelect = (value, option) => {
    setUserData((prev) => ({
      ...prev,
      [stepConfig.field]: value,
    }));

    if (option?.action) {
      onAction(option.action, option.popupType || option);
      return;
    }

    if (stepConfig.conditionalNavigation?.[value]) {
      onAction("navigate", stepConfig.conditionalNavigation[value]);
      return;
    }

    if (option?.showTextInput) {
      return;
    }

    handleContinue(value);
  };

  const handleCheckboxToggle = (optionId, option) => {
    const currentValues = userData[stepConfig.field] || [];
    let newValues;

    if (stepConfig.exclusiveOptions?.includes(optionId)) {
      newValues = currentValues.includes(optionId) ? [] : [optionId];
    } else {
      const filteredValues = currentValues.filter(
        (val) => !stepConfig.exclusiveOptions?.includes(val),
      );

      newValues = filteredValues.includes(optionId)
        ? filteredValues.filter((val) => val !== optionId)
        : [...filteredValues, optionId];
    }

    setUserData((prev) => ({
      ...prev,
      [stepConfig.field]: newValues,
    }));

    if (option?.action) {
      onAction(option.action, option.popupType || option);
    }
  };

  const handleTextSubmit = () => {
    if (textInput.trim()) {
      setUserData((prev) => ({
        ...prev,
        [stepConfig.textField]: textInput.trim(),
      }));
      handleContinue(textInput.trim());
    }
  };

  const isValid = () => {
    if (!stepConfig.required) return true;

    const fieldValue = userData[stepConfig.field];

    if (stepConfig.type === "checkbox") {
      return fieldValue && fieldValue.length > 0;
    }

    if (stepConfig.type === "radio-text") {
      if (fieldValue === false) return true;
      return fieldValue === true && textInput.trim();
    }

    return fieldValue !== null && fieldValue !== undefined;
  };

  const handleContinue = (valueToCheck) => {
    const fieldValue =
      valueToCheck !== undefined ? valueToCheck : userData[stepConfig.field];

    const triggerForKey = (key) => {
      if (stepConfig.conditionalActions?.[key]) {
        const action = stepConfig.conditionalActions[key];
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
      if (Array.isArray(fieldValue)) {
        for (const val of fieldValue) {
          if (triggerForKey(val)) return;
        }
      } else {
        if (triggerForKey(fieldValue)) return;
      }
    }

    onContinue();
  };

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
          <Glp2BMICalculatorStep
            {...questionProps}
            onAction={onAction}
            setUserData={setUserData}
          />
        );
      case "beforeAfter":
        return <Glp2BeforeAfterStep onContinue={handleContinue} />;
      case "beforeAfter2":
        return <Glp2BeforeAfterStep2 onContinue={handleContinue} />;
      case "beforeAfter3":
        return <Glp2BeforeAfterStep3 onContinue={handleContinue} />;
      case "paceQuestion":
        return (
          <Glp2PaceQuestionStep
            userData={userData}
            setUserData={setUserData}
            onContinue={handleContinue}
          />
        );
      case "paceResult":
        return (
          <Glp2PaceResultStep userData={userData} onContinue={handleContinue} />
        );
      case "sleepQuestion":
        return (
          <Glp2SleepStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
          />
        );
      case "willingnessQuestion":
        return (
          <Glp2WillingnessStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
          />
        );
      case "weightChangedQuestion":
        return (
          <Glp2WeightChangedStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
          />
        );
      case "medicationPriorityQuestion":
        return (
          <Glp2MedicationPriorityStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
          />
        );
      case "stateOfMindQuestion":
        return (
          <Glp2StateOfMindStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
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

  let stepTitle = stepConfig.title;
  if (stepTitle && stepTitle.includes("[LASTNAME]")) {
    const lastName = userData?.lastName || "";
    stepTitle = stepTitle.replace("[LASTNAME]", lastName);
  }

  const isBmiStep = stepConfig?.id === "currentWeight";
  const isBeforeAfterStep = stepConfig?.type === "beforeAfter";
  const isBeforeAfterStep2 = stepConfig?.type === "beforeAfter2";
  const isBeforeAfterStep3 = stepConfig?.type === "beforeAfter3";
  const isPaceQuestionStep = stepConfig?.type === "paceQuestion";
  const isPaceResultStep = stepConfig?.type === "paceResult";
  const isSleepQuestionStep = stepConfig?.type === "sleepQuestion";
  const isWillingnessStep = stepConfig?.type === "willingnessQuestion";
  const isWeightChangedStep = stepConfig?.type === "weightChangedQuestion";
  const isMedicationPriorityStep =
    stepConfig?.type === "medicationPriorityQuestion";
  const isStateOfMindStep = stepConfig?.type === "stateOfMindQuestion";
  const isCustomFullLayoutStep =
    isBmiStep ||
    isBeforeAfterStep ||
    isBeforeAfterStep2 ||
    isBeforeAfterStep3 ||
    isPaceQuestionStep ||
    isPaceResultStep ||
    isSleepQuestionStep ||
    isWillingnessStep ||
    isWeightChangedStep ||
    isMedicationPriorityStep ||
    isStateOfMindStep;

  if (
    isBeforeAfterStep ||
    isBeforeAfterStep2 ||
    isBeforeAfterStep3 ||
    isPaceQuestionStep ||
    isPaceResultStep ||
    isSleepQuestionStep ||
    isWillingnessStep ||
    isWeightChangedStep ||
    isMedicationPriorityStep ||
    isStateOfMindStep
  ) {
    return <>{renderQuestion()}</>;
  }

  return (
    <div className="w-full md:w-[580px] mx-auto px-5 md:px-0 ">
      {stepConfig.showMessage && (
        <MessageForQuiz
          message={stepConfig.showMessage}
          messageStyle={stepConfig.messageStyle}
        />
      )}

      {stepConfig.Qheader && (
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

      {!isCustomFullLayoutStep && (
        <>
          <div
            className={`${stepConfig.hasInfoIcon ? "flex items-center gap-3 mb-4" : "mb-4"}`}
          >
            <h1
              className={`subheaders-font ${
                stepConfig.id == "topPriority"
                  ? "text-[16px]"
                  : "text-[26px] md:text-[32px]"
              } ${stepConfig.titleCenter ? "text-center mb-6" : ""} font-medium leading-[120%] `}
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

          {stepConfig.subtitle &&
            (typeof stepConfig.subtitle === "string" &&
            /<[^>]+>/.test(stepConfig.subtitle) ? (
              <p
                className="text-[14px] text-[#AE7E56] mb-[24px] md:w-full font-medium"
                dangerouslySetInnerHTML={{ __html: stepConfig.subtitle }}
              />
            ) : (
              <p className="text-[14px] text-[#AE7E56] mb-[24px] md:w-full font-medium">
                {stepConfig.subtitle}
              </p>
            ))}
        </>
      )}

      {renderQuestion()}
    </div>
  );
};

export default Glp2GenericQuestionStep;
