import React, { useMemo, useState } from "react";
import CheckboxQuestion from "./CheckboxQuestion";
import RadioImagesQuestion from "./RadioImagesQuestion";
import SelectQuestion from "./SelectQuestion";
import RadioTextQuestion from "./RadioTextQuestion";
import Glp1BMICalculatorStep from "./Glp1BMICalculatorStep";
import Glp1DobStep from "./Glp1DobStep";
import Glp1BeforeAfterStep from "./Glp1BeforeAfterStep";
import Glp1PaceQuestionStep from "./Glp1PaceQuestionStep";
import Glp1PaceResultStep from "./Glp1PaceResultStep";
import Glp1MedicalReviewStep from "./Glp1MedicalReviewStep";
import Glp1ContactIntroStep from "./Glp1ContactIntroStep";
import Form from "./Form";
import Glp1ContactAuthStep from "./Glp1ContactAuthStep";

const MIN_DOB_YEAR = 1920;
const MAX_DOB_YEAR = 2008;

const normalizeDateValue = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return null;

  if (raw.includes("/")) {
    const [m, d, y] = raw.split("/");
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);
    const year = parseInt(y, 10);
    if (
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      Number.isNaN(year) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      String(y || "").length !== 4
    ) {
      return null;
    }
    return new Date(year, month - 1, day);
  }

  if (raw.includes("-")) {
    const [y, m, d] = raw.split("-");
    const year = parseInt(y, 10);
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);
    if (
      Number.isNaN(month) ||
      Number.isNaN(day) ||
      Number.isNaN(year) ||
      month < 1 ||
      month > 12 ||
      day < 1 ||
      day > 31 ||
      String(y || "").length !== 4
    ) {
      return null;
    }
    return new Date(year, month - 1, day);
  }

  return null;
};

const isAllowedDobDate = (value) => {
  const birthDate = normalizeDateValue(value);
  if (!birthDate || Number.isNaN(birthDate.getTime())) return false;

  const year = birthDate.getFullYear();
  if (year < MIN_DOB_YEAR || year > MAX_DOB_YEAR) return false;

  const today = new Date();
  return birthDate < today;
};

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

const Page = ({
  questionConfig,
  questions,
  userData,
  setUserData,
  onContinue,
  onAction,
  questionProps,
  sharedStepProps,
}) => {
  const [textInputs, setTextInputs] = useState({});
  const [attemptedContinue, setAttemptedContinue] = useState(false);
  const isCombinedPage = Array.isArray(questions) && questions.length > 1;

  const validateQuestion = (configToValidate) => {
    if (!configToValidate?.required) return true;

    if (configToValidate.type === "form") {
      const requiredFields = (configToValidate.fields || []).filter(
        (f) => f.required === true,
      );
      return requiredFields.every((f) => {
        const val = userData?.[f.id];
        if (Array.isArray(val)) return val.length > 0;
        if (typeof val === "string") return val.trim() !== "";
        return !!val;
      });
    }

    if (configToValidate.type === "BMICalculator") {
      const feet = parseFloat(userData?.height?.feet);
      const inches = parseFloat(userData?.height?.inches);
      const weight = parseFloat(userData?.weight);
      const goalWeight = parseFloat(userData?.goalWeight || userData?.goal);
      const bmi = parseFloat(userData?.bmi);

      return (
        !Number.isNaN(feet) &&
        !Number.isNaN(inches) &&
        !Number.isNaN(weight) &&
        !Number.isNaN(goalWeight) &&
        !Number.isNaN(bmi) &&
        feet > 0 &&
        inches >= 0 &&
        inches < 12 &&
        weight > 0 &&
        goalWeight > 0 &&
        bmi >= 20
      );
    }

    if (
      configToValidate.type === "DOBGLp1" ||
      configToValidate.type === "glp2Dob" ||
      configToValidate.type === "date"
    ) {
      const dobValue =
        userData?.[configToValidate.field] ||
        userData?.dateOfBirth ||
        userData?.DOB;
      return isAllowedDobDate(dobValue);
    }

    const value = userData?.[configToValidate.field];

    if (
      configToValidate.type === "radio" ||
      configToValidate.type === "radio-text" ||
      configToValidate.type === "select" ||
      configToValidate.type === "radio-images"
    ) {
      const selectedOption = (configToValidate.options || []).find(
        (option) => option.id === value,
      );

      if (!selectedOption) return false;
      if (!selectedOption.showTextInput) return true;

      const textField = getTextFieldForConfig(configToValidate, value);
      const details = textField
        ? (textInputs[textField] ?? userData?.[textField] ?? "")
        : "";
      return String(details || "").trim() !== "";
    }

    if (configToValidate.type === "checkbox") {
      return Array.isArray(value) && value.length > 0;
    }

    if (Array.isArray(value)) {
      return value.length > 0;
    }

    if (value === null || value === undefined) return false;
    if (typeof value === "string") return value.trim() !== "";
    return true;
  };

  const allCombinedQuestionsValid = useMemo(() => {
    if (!isCombinedPage) return true;
    return questions.every((question) => validateQuestion(question));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCombinedPage, questions, userData, textInputs]);

  const handleCombinedSelect = (configToRender, value, option) => {
    setUserData((prev) => ({
      ...prev,
      [configToRender.field]: value,
    }));

    if (option?.showTextInput) {
      return;
    }

    if (option?.action) {
      onAction(option.action, option.popupType || option);
      return;
    }

    if (configToRender.conditionalNavigation?.[value]) {
      onAction("navigate", configToRender.conditionalNavigation[value]);
    }
  };

  const handleCombinedToggle = (configToRender, optionId, option) => {
    const currentValues = userData?.[configToRender.field] || [];
    let nextValues;

    if (configToRender.exclusiveOptions?.includes(optionId)) {
      nextValues = currentValues.includes(optionId) ? [] : [optionId];
    } else {
      const filteredValues = currentValues.filter(
        (value) => !configToRender.exclusiveOptions?.includes(value),
      );

      nextValues = filteredValues.includes(optionId)
        ? filteredValues.filter((value) => value !== optionId)
        : [...filteredValues, optionId];
    }

    setUserData((prev) => ({
      ...prev,
      [configToRender.field]: nextValues,
    }));

    if (option?.action) {
      onAction(option.action, option.popupType || option);
    }
  };

  const handleCombinedContinue = () => {
    const nextUserData = { ...userData };

    (questions || []).forEach((configToRender) => {
      const selectedValue = nextUserData?.[configToRender?.field];
      const selectedOption = (configToRender.options || []).find(
        (option) => option.id === selectedValue,
      );

      if (!selectedOption?.showTextInput) return;

      const textField = getTextFieldForConfig(configToRender, selectedValue);
      if (!textField) return;

      const textValue = String(
        textInputs[textField] ?? nextUserData?.[textField] ?? "",
      ).trim();

      if (textValue) {
        nextUserData[textField] = textValue;
      }
    });

    setUserData(nextUserData);
    onContinue();
  };

  const renderQuestionByType = (configToRender) => {
    const isCombined = isCombinedPage;
    const selectedValue = userData?.[configToRender?.field];
    const textField = getTextFieldForConfig(configToRender, selectedValue);
    const scopedTextInput = textField
      ? (textInputs[textField] ?? userData?.[textField] ?? "")
      : "";

    const scopedQuestionProps = {
      ...questionProps,
      config: configToRender,
      onSelect: isCombined
        ? (value, option) => handleCombinedSelect(configToRender, value, option)
        : questionProps.onSelect,
      onToggle: isCombined
        ? (optionId, option) =>
            handleCombinedToggle(configToRender, optionId, option)
        : questionProps.onToggle,
      textInput: isCombined ? scopedTextInput : questionProps.textInput,
      setTextInput: isCombined
        ? (value) => {
            if (!textField) return;
            setTextInputs((prev) => ({
              ...prev,
              [textField]: value,
            }));
          }
        : questionProps.setTextInput,
      // In combined mode, hide the inline Continue button — page-level button handles it
      onTextSubmit: isCombined ? null : questionProps.onTextSubmit,
      onContinue: isCombined ? undefined : questionProps.onContinue,
      isValid: isCombined
        ? validateQuestion(configToRender)
        : questionProps.isValid,
    };

    const scopedSharedProps = {
      ...sharedStepProps,
      config: configToRender,
      onContinue: isCombined ? undefined : sharedStepProps.onContinue,
    };

    switch (configToRender.type) {
      case "DOBGLp1":
      case "glp2Dob":
        return (
          <Glp1DobStep
            {...scopedSharedProps}
            hideContinueButton={isCombinedPage}
          />
        );
      case "glp1ContactAuth":
        return (
          <Glp1ContactAuthStep
            {...scopedSharedProps}
            handleCombinedContinue={handleCombinedContinue}
            hideContinueButton={isCombinedPage}
          />
        );
      case "title":
        return (
          <div>
            <h1 key={configToRender.id} className={configToRender.styleClasses}>
              <div
                dangerouslySetInnerHTML={{ __html: configToRender.title }}
              ></div>
            </h1>
            {configToRender.description && (
              <p className={configToRender.descriptionStyleClasses}>
                {configToRender.description}
              </p>
            )}
          </div>
        );
      case "form":
        return <Form {...scopedQuestionProps} {...scopedSharedProps} />;
      case "radio":
      case "radio-text":
        return <RadioTextQuestion {...scopedQuestionProps} />;
      case "checkbox":
        return <CheckboxQuestion {...scopedQuestionProps} />;
      case "radio-images":
        return <RadioImagesQuestion {...scopedQuestionProps} />;
      case "select":
        return <SelectQuestion {...scopedQuestionProps} />;
      case "BMICalculator":
        return (
          <Glp1BMICalculatorStep
            userData={userData}
            setUserData={setUserData}
            onContinue={onContinue}
            config={configToRender}
            onAction={onAction}
          />
        );
      case "beforeAfter":
        return <Glp1BeforeAfterStep onContinue={onContinue} />;
      case "paceQuestion":
        return (
          <Glp1PaceQuestionStep
            userData={userData}
            setUserData={setUserData}
            onContinue={onContinue}
          />
        );
      case "paceResult":
        return (
          <Glp1PaceResultStep userData={userData} onContinue={onContinue} />
        );
      case "data":
        return (
          <Glp1MedicalReviewStep userData={userData} onContinue={onContinue} />
        );
      case "contactIntro":
        return (
          <Glp1ContactIntroStep userData={userData} onContinue={onContinue} />
        );
      default:
        return <div>Unsupported question type: {configToRender.type}</div>;
    }
  };

  return (
    <>
      {isCombinedPage
        ? questions.map((configToRender, index) => (
            <div key={configToRender?.id || index}>
              {index > 0 && (
                <div className="w-full h-[1px] bg-gray-300 mb-4"></div>
              )}
              {renderQuestionByType(configToRender)}
            </div>
          ))
        : renderQuestionByType(questionConfig)}

      {isCombinedPage &&
        !questions.some(
          (q) =>
            q?.type === "form" ||
            q?.type === "contactIntro" ||
            q?.type === "glp1ContactAuth",
        ) && (
          <div className="w-full px-4 pb-4 flex items-center justify-center z-50 ">
            <div className="w-full  md:max-w-[665px]">
              {attemptedContinue && !allCombinedQuestionsValid && (
                <p className="text-red-500 text-sm mb-2 text-center">
                  Please answer all required questions before continuing.
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setAttemptedContinue(true);
                  if (allCombinedQuestionsValid) {
                    handleCombinedContinue();
                  }
                }}
                className={`w-full py-3 rounded-full h-[52px] font-medium border-none focus:outline-none focus:ring-0 transition-colors ${
                  allCombinedQuestionsValid
                    ? "bg-black text-white"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
              >
                Continue
              </button>
            </div>
          </div>
        )}

      {/* External "Next" button for single steps that use imperative submit (e.g. glp1ContactAuth).
          The component exposes { submit(), isDisabled } via useImperativeHandle so this button
          can trigger its internal async logic (login / register) without coupling. */}
    </>
  );
};

export default Page;
