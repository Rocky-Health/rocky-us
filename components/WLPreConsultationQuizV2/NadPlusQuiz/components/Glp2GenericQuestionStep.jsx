"use client";
import React, { useEffect, useState } from "react";
import { sanitizeHtml } from "@/utils/sanitizeHtml";
import RadioQuestion from "../../components/RadioQuestion";
import CheckboxQuestion from "../../components/CheckboxQuestion";
import RadioTextQuestion from "../../components/RadioTextQuestion";
import InfoIcon from "../../components/InfoIcon";
import RadioImagesQuestion from "../../components/RadioImagesQuestion";
import SelectQuestion from "../../components/SelectQuestion";
import DateQuestion from "../../components/DateQuestion";
import Glp2BMICalculatorStep from "./Glp2BMICalculatorStep";
import Glp1GenderStep from "./Glp1GenderStep";
import Glp1WeightGainEffectsStep from "./Glp1WeightGainEffectsStep";
import Glp1FemaleSafetyFirstStep from "./Glp1FemaleSafetyFirstStep";
import Glp1BodyPriorityStep from "./Glp1BodyPriorityStep";
import Glp1MetabolicScienceStep from "./Glp1MetabolicScienceStep";
import Glp1HowGlp1WorksStep from "./Glp1HowGlp1WorksStep";
import Glp1PrimaryReasonStep from "./Glp1PrimaryReasonStep";
import Glp1RecentGlp1WeightLossStep from "./Glp1RecentGlp1WeightLossStep";
import Glp1PriorWeightLossMedicationDetailsStep from "./Glp1PriorWeightLossMedicationDetailsStep";
import Glp1MedicalContraindicationsStep from "./Glp1MedicalContraindicationsStep";
import Glp1MoreHealthQuestionsStep from "./Glp1MoreHealthQuestionsStep";
import Glp2GoalWeightStep from "./Glp2GoalWeightStep";
import Glp2BeforeAfterStep from "./Glp2BeforeAfterStep";
import Glp2BeforeAfterStep2 from "./Glp2BeforeAfterStep2";
import Glp2BeforeAfterStep3 from "./Glp2BeforeAfterStep3";
import Glp2PaceQuestionStep from "./Glp2PaceQuestionStep";
import Glp2PaceResultStep from "./Glp2PaceResultStep";
import Glp2SleepStep from "./Glp2SleepStep";
import Glp2SleepHoursStep from "./Glp2SleepHoursStep";
import Glp2WillingnessStep from "./Glp2WillingnessStep";
import Glp1WillingnessStep from "./Glp1WillingnessStep";
import Glp2WeightChangedStep from "./Glp2WeightChangedStep";
import Glp1BloodPressureStep from "./Glp1BloodPressureStep";
import Glp1HeartRateStep from "./Glp1HeartRateStep";
import Glp1CurrentMedicationsStep from "./Glp1CurrentMedicationsStep";
import Glp1MedicalTeamAdditionalInfoStep from "./Glp1MedicalTeamAdditionalInfoStep";
import Glp1WeightChangedStep from "./Glp1WeightChangedStep";
import Glp2MedicationPriorityStep from "./Glp2MedicationPriorityStep";
import Glp2StateOfMindStep from "./Glp2StateOfMindStep";
import Glp2DobStep from "./Glp2DobStep";
import Glp1MedicalReviewPersonalStep from "./Glp1MedicalReviewPersonalStep";
import Glp2ContactAuthStep from "./Glp2ContactAuthStep";
import Form from "../../components/Form";
import MessageForQuiz from "../../components/MessageForQuiz";

const Glp2GenericQuestionStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onAction,
  onQuizChromeVisibilityChange,
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

    if (
      stepConfig.type === "medicationPriorityQuestion" &&
      stepConfig.secondaryQuestion?.field
    ) {
      const sec = userData[stepConfig.secondaryQuestion.field];
      return (
        fieldValue !== null &&
        fieldValue !== undefined &&
        fieldValue !== "" &&
        sec !== null &&
        sec !== undefined &&
        sec !== ""
      );
    }

    if (
      (stepConfig.type === "glp1CurrentMedicationsQuestion" ||
        stepConfig.type === "glp1MedicalTeamAdditionalInfoQuestion") &&
      stepConfig.detailsField
    ) {
      if (fieldValue !== "yes" && fieldValue !== "no") return false;
      if (fieldValue === "yes") {
        const d = userData[stepConfig.detailsField];
        return typeof d === "string" && d.trim().length > 0;
      }
      return true;
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

    if (
      stepConfig.type === "medicationPriorityQuestion" &&
      stepConfig.secondaryQuestion?.field
    ) {
      const secVal = userData[stepConfig.secondaryQuestion.field];
      if (
        fieldValue === null ||
        fieldValue === undefined ||
        fieldValue === "" ||
        secVal === null ||
        secVal === undefined ||
        secVal === ""
      ) {
        return;
      }
    }

    if (
      (stepConfig.type === "glp1CurrentMedicationsQuestion" ||
        stepConfig.type === "glp1MedicalTeamAdditionalInfoQuestion") &&
      stepConfig.detailsField
    ) {
      const choice = userData[stepConfig.field];
      if (choice !== "yes" && choice !== "no") return;
      if (choice === "yes") {
        const d = userData[stepConfig.detailsField];
        if (typeof d !== "string" || !d.trim()) return;
      }
    }

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
            onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
          />
        );
      case "glp1Gender":
        return (
          <Glp1GenderStep
            userData={userData}
            setUserData={setUserData}
            onContinue={handleContinue}
          />
        );
      case "glp1WeightGainEffects":
        return (
          <Glp1WeightGainEffectsStep
            userData={userData}
            setUserData={setUserData}
            onContinue={handleContinue}
          />
        );
      case "glp1FemaleSafetyFirst":
        return (
          <Glp1FemaleSafetyFirstStep
            userData={userData}
            setUserData={setUserData}
            onContinue={handleContinue}
            onAction={onAction}
          />
        );
      case "glp1BodyPriority":
        return (
          <Glp1BodyPriorityStep
            stepConfig={stepConfig}
            userData={userData}
            setUserData={setUserData}
            onContinue={handleContinue}
            onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
          />
        );
      case "glp1MetabolicScience":
        return (
          <Glp1MetabolicScienceStep
            onContinue={handleContinue}
            onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
          />
        );
      case "glp1HowGlp1Works":
        return (
          <Glp1HowGlp1WorksStep
            onContinue={handleContinue}
            onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
          />
        );
      case "glp1PrimaryReason":
        return (
          <Glp1PrimaryReasonStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={onContinue}
          />
        );
      case "glp1RecentGlp1WeightLoss":
        return (
          <Glp1RecentGlp1WeightLossStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={onContinue}
          />
        );
      case "glp1PriorWeightLossMedicationDetails":
        return (
          <Glp1PriorWeightLossMedicationDetailsStep
            userData={userData}
            setUserData={setUserData}
            onContinue={onContinue}
          />
        );
      case "goalWeight":
        return (
          <Glp2GoalWeightStep
            userData={userData}
            setUserData={setUserData}
            onContinue={handleContinue}
          />
        );
      case "beforeAfter":
        return (
          <Glp2BeforeAfterStep
            userData={userData}
            invertGenderTestimonial={!!stepConfig.invertGenderTestimonial}
            onContinue={handleContinue}
            onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
          />
        );
      case "beforeAfter2":
        return (
          <Glp2BeforeAfterStep2
            onContinue={handleContinue}
            onQuizChromeVisibilityChange={onQuizChromeVisibilityChange}
          />
        );
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
      case "sleepHoursQuestion":
        return (
          <Glp2SleepHoursStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
          />
        );
      case "glp1MedicalContraindications":
        return (
          <Glp1MedicalContraindicationsStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
            onAction={onAction}
          />
        );
      case "glp1MoreHealthQuestions":
        return (
          <Glp1MoreHealthQuestionsStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
            onAction={onAction}
          />
        );
      case "glp1WillingnessQuestion":
        return (
          <Glp1WillingnessStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={onContinue}
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
      case "glp1WeightChangedQuestion":
        return (
          <Glp1WeightChangedStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={onContinue}
          />
        );
      case "glp1BloodPressureQuestion":
        return (
          <Glp1BloodPressureStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
          />
        );
      case "glp1HeartRateQuestion":
        return (
          <Glp1HeartRateStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
          />
        );
      case "glp1CurrentMedicationsQuestion":
        return (
          <Glp1CurrentMedicationsStep
            userData={userData}
            setUserData={setUserData}
            config={stepConfig}
            onContinue={handleContinue}
          />
        );
      case "glp1MedicalTeamAdditionalInfoQuestion":
        return (
          <Glp1MedicalTeamAdditionalInfoStep
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
      case "glp2Dob":
        return (
          <Glp2DobStep
            userData={userData}
            setUserData={setUserData}
            onContinue={handleContinue}
          />
        );
      case "glp1MedicalReviewPersonal":
        return (
          <Glp1MedicalReviewPersonalStep
            config={stepConfig}
            userData={userData}
            setUserData={setUserData}
            onContinue={handleContinue}
          />
        );
      case "glp2ContactAuth":
        return (
          <Glp2ContactAuthStep
            userData={userData}
            setUserData={setUserData}
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
  const isGoalWeightStep = stepConfig?.type === "goalWeight";
  const isBeforeAfterStep = stepConfig?.type === "beforeAfter";
  const isBeforeAfterStep2 = stepConfig?.type === "beforeAfter2";
  const isBeforeAfterStep3 = stepConfig?.type === "beforeAfter3";
  const isGlp1GenderStep = stepConfig?.type === "glp1Gender";
  const isGlp1WeightGainEffectsStep =
    stepConfig?.type === "glp1WeightGainEffects";
  const isGlp1FemaleSafetyFirstStep =
    stepConfig?.type === "glp1FemaleSafetyFirst";
  const isGlp1BodyPriorityStep = stepConfig?.type === "glp1BodyPriority";
  const isGlp1MetabolicScienceStep =
    stepConfig?.type === "glp1MetabolicScience";
  const isGlp1PrimaryReasonStep = stepConfig?.type === "glp1PrimaryReason";
  const isGlp1RecentGlp1WeightLossStep =
    stepConfig?.type === "glp1RecentGlp1WeightLoss";
  const isGlp1PriorWeightLossMedicationDetailsStep =
    stepConfig?.type === "glp1PriorWeightLossMedicationDetails";
  const isPaceQuestionStep = stepConfig?.type === "paceQuestion";
  const isPaceResultStep = stepConfig?.type === "paceResult";
  const isSleepQuestionStep = stepConfig?.type === "sleepQuestion";
  const isSleepHoursQuestionStep = stepConfig?.type === "sleepHoursQuestion";
  const isGlp1MedicalContraindicationsStep =
    stepConfig?.type === "glp1MedicalContraindications";
  const isGlp1MoreHealthQuestionsStep =
    stepConfig?.type === "glp1MoreHealthQuestions";
  const isWillingnessStep =
    stepConfig?.type === "willingnessQuestion" ||
    stepConfig?.type === "glp1WillingnessQuestion";
  const isWeightChangedStep =
    stepConfig?.type === "weightChangedQuestion" ||
    stepConfig?.type === "glp1WeightChangedQuestion";
  const isGlp1BloodPressureStep =
    stepConfig?.type === "glp1BloodPressureQuestion";
  const isGlp1HeartRateStep =
    stepConfig?.type === "glp1HeartRateQuestion";
  const isGlp1CurrentMedicationsStep =
    stepConfig?.type === "glp1CurrentMedicationsQuestion";
  const isGlp1MedicalTeamAdditionalInfoStep =
    stepConfig?.type === "glp1MedicalTeamAdditionalInfoQuestion";
  const isMedicationPriorityStep =
    stepConfig?.type === "medicationPriorityQuestion";
  const isStateOfMindStep = stepConfig?.type === "stateOfMindQuestion";
  const isGlp2DobStep = stepConfig?.type === "glp2Dob";
  const isGlp1MedicalReviewPersonalStep =
    stepConfig?.type === "glp1MedicalReviewPersonal";
  const isGlp2ContactAuthStep = stepConfig?.type === "glp2ContactAuth";
  const isCustomFullLayoutStep =
    isBmiStep ||
    isGoalWeightStep ||
    isGlp1GenderStep ||
    isGlp1WeightGainEffectsStep ||
    isGlp1FemaleSafetyFirstStep ||
    isGlp1BodyPriorityStep ||
    isGlp1MetabolicScienceStep ||
    isGlp1PrimaryReasonStep ||
    isGlp1RecentGlp1WeightLossStep ||
    isGlp1PriorWeightLossMedicationDetailsStep ||
    isBeforeAfterStep ||
    isBeforeAfterStep2 ||
    isBeforeAfterStep3 ||
    isPaceQuestionStep ||
    isPaceResultStep ||
    isSleepQuestionStep ||
    isSleepHoursQuestionStep ||
    isGlp1MedicalContraindicationsStep ||
    isGlp1MoreHealthQuestionsStep ||
    isWillingnessStep ||
    isWeightChangedStep ||
    isGlp1BloodPressureStep ||
    isGlp1HeartRateStep ||
    isGlp1CurrentMedicationsStep ||
    isGlp1MedicalTeamAdditionalInfoStep ||
    isMedicationPriorityStep ||
    isStateOfMindStep ||
    isGlp2DobStep ||
    isGlp1MedicalReviewPersonalStep ||
    isGlp2ContactAuthStep;

  if (
    isGoalWeightStep ||
    isGlp1GenderStep ||
    isGlp1WeightGainEffectsStep ||
    isGlp1FemaleSafetyFirstStep ||
    isGlp1BodyPriorityStep ||
    isGlp1MetabolicScienceStep ||
    isGlp1PrimaryReasonStep ||
    isGlp1RecentGlp1WeightLossStep ||
    isGlp1PriorWeightLossMedicationDetailsStep ||
    isBeforeAfterStep ||
    isBeforeAfterStep2 ||
    isBeforeAfterStep3 ||
    isPaceQuestionStep ||
    isPaceResultStep ||
    isSleepQuestionStep ||
    isSleepHoursQuestionStep ||
    isGlp1MedicalContraindicationsStep ||
    isGlp1MoreHealthQuestionsStep ||
    isWillingnessStep ||
    isWeightChangedStep ||
    isGlp1BloodPressureStep ||
    isGlp1HeartRateStep ||
    isGlp1CurrentMedicationsStep ||
    isGlp1MedicalTeamAdditionalInfoStep ||
    isMedicationPriorityStep ||
    isStateOfMindStep ||
    isGlp2DobStep ||
    isGlp1MedicalReviewPersonalStep ||
    isGlp2ContactAuthStep
  ) {
    return <>{renderQuestion()}</>;
  }

  return (
    <div className="w-full mx-auto px-0 ">
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
                <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(stepTitle) }} />
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
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(stepConfig.subtitle) }}
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
