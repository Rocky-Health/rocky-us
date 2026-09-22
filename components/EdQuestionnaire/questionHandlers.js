import { logger } from "@/utils/devLogger";

export const createQuestionHandlers = (
  formData,
  setFormData,
  setShowPopup,
  updateLocalStorage,
  moveToNextSlide,
  handlerMapping
) => {
  const handleOptionSelect = (questionId, option) => {
    if (handlerMapping[questionId]) {
      return handlerMapping[questionId](option.value);
    }

    setFormData((prev) => ({
      ...prev,
      [questionId]: option.value,
    }));

    updateLocalStorage();

    if (option.autoProceed) {
      logger.log("Auto-proceeding to next question...");
      setTimeout(() => {
        moveToNextSlide();
      }, 100);
    }
  };

  const handleNoneOption = (questionId, option) => {
    const noneOptionHandlers = {
      23: () => handleDrugNoneOptionSelect(),
      5: () => handleMedicalNoneOptionSelect(),
      27: () => handleMedicationNoneOptionSelect(),
      49: () => handleCardioNoneOptionSelect(),
    };

    if (noneOptionHandlers[questionId]) {
      return noneOptionHandlers[questionId]();
    }

    if (formData[option.name] === option.value) {
      setFormData((prev) => ({
        ...prev,
        [option.name]: "",
      }));
    } else {
      const fieldPrefix = option.name.split("_")[0];
      const updatedFormData = { ...formData };

      Object.keys(formData).forEach((key) => {
        if (key.startsWith(fieldPrefix + "_")) {
          updatedFormData[key] = "";
        }
      });

      updatedFormData[option.name] = option.value;

      setFormData(updatedFormData);
    }

    setTimeout(updateLocalStorage, 100);
  };

  const handleOtherOption = (questionId, option) => {
    const otherOptionHandlers = {
      5: () => handleMedicalOtherOptionSelect(),
      27: () => handleMedicationOtherOptionSelect(),
    };

    if (otherOptionHandlers[questionId]) {
      return otherOptionHandlers[questionId]();
    }

    const newValue = formData[option.name] === option.value ? "" : option.value;

    setFormData((prev) => {
      const newState = {
        ...prev,
        [option.name]: newValue,
      };

      if (newValue === "" && option.otherField) {
        const conditionalFieldId = getConditionalFieldId(option.otherField);
        if (conditionalFieldId) {
          newState[conditionalFieldId] = "";
        }
      }

      return newState;
    });

    setTimeout(updateLocalStorage, 100);
  };

  const handleConsentOption = (questionId, option) => {
    logger.log("Handling consent option for question:", questionId);

    setFormData((prev) => ({
      ...prev,
      [questionId]: option.value,
    }));

    updateLocalStorage();

    if (option.consentPopupContent) {
      logger.log("Setting up popup for consent option");

      setPopupConfig({
        title: option.consentPopupContent.title || "Please Read",
        message:
          option.consentPopupContent.message ||
          "Please note this selection requires special attention.",
        acknowledgementRequired:
          !!option.consentPopupContent.acknowledgementRequired,
        acknowledgementField:
          option.consentPopupContent.acknowledgementField || "",
        blocksProceed: !!option.consentPopupContent.blocksProceed,
        alternativeOption: option.consentPopupContent.alternativeOption || "",
        onAlternativeOptionClick:
          option.consentPopupContent.onAlternativeOptionClick,
        buttonText: option.consentPopupContent.buttonText || "Continue",
        backgroundColor:
          option.consentPopupContent.backgroundColor || "bg-[#F5F4EF]",
        titleColor: option.consentPopupContent.titleColor || "text-[#C19A6B]",
      });

      if (option.consentPopupContent.acknowledgementRequired) {
        setPopupAcknowledged(false);
      } else {
        setPopupAcknowledged(true);
      }

      setShowPopup(true);
      logger.log("Popup should be visible now");
    } else {
      if (option.autoProceed) {
        moveToNextSlide();
      }
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));

    setTimeout(updateLocalStorage, 100);
  };

  const getConditionalFieldId = (otherFieldId) => {
    const fieldMap = {
      "allergies-field": "31",
      "other-medical-conditions-field": "56",
      "other-medicine-dropdown-field": "28",
      "your-questions-field": "181",
    };

    return fieldMap[otherFieldId];
  };

  const handleCheckboxSelect = (questionId, option) => {
    const fieldName = option.name || questionId;
    const currentValue = formData[fieldName];
    const newValue = currentValue === option.value ? "" : option.value;

    logger.log("Checkbox selection", { fieldName, hasValue: Boolean(newValue) });

    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));

    setTimeout(updateLocalStorage, 50);
  };

  const handleDrugNoneOptionSelect = () => {
    logger.log("Drug none option selected");

    if (formData["23_5"] === "None of these apply") {
      setFormData((prev) => ({
        ...prev,
        "23_5": "",
      }));
    } else {
      setFormData((prev) => {
        const updated = { ...prev };

        for (let i = 1; i <= 6; i++) {
          updated[`23_${i}`] = "";
        }

        updated["23_5"] = "None of these apply";

        return updated;
      });
    }

    setTimeout(updateLocalStorage, 50);
  };

  const handleMedicalNoneOptionSelect = () => {
    logger.log("Medical none option selected");

    if (formData["5_1"] === "No Medical Issues") {
      setFormData((prev) => ({
        ...prev,
        "5_1": "",
      }));
    } else {
      setFormData((prev) => {
        const updated = { ...prev };

        for (let i = 1; i <= 13; i++) {
          updated[`5_${i}`] = "";
        }
        updated["56"] = "";

        updated["5_1"] = "No Medical Issues";

        return updated;
      });
    }

    setTimeout(updateLocalStorage, 50);
  };

  const handleMedicationNoneOptionSelect = () => {
    logger.log("Medication none option selected");

    if (formData["27_7"] === "None of these apply") {
      setFormData((prev) => ({
        ...prev,
        "27_7": "",
      }));
    } else {
      setFormData((prev) => {
        const updated = { ...prev };

        for (let i = 1; i <= 7; i++) {
          updated[`27_${i}`] = "";
        }
        updated["28"] = "";

        updated["27_7"] = "None of these apply";

        return updated;
      });
    }

    setTimeout(updateLocalStorage, 50);
  };

  const handleCardioNoneOptionSelect = () => {
    logger.log("Cardio none option selected");

    if (formData["49_6"] === "None of these apply to me") {
      setFormData((prev) => ({
        ...prev,
        "49_6": "",
      }));
    } else {
      setFormData((prev) => {
        const updated = { ...prev };

        for (let i = 1; i <= 6; i++) {
          updated[`49_${i}`] = "";
        }
        updated["81"] = "";

        updated["49_6"] = "None of these apply to me";

        return updated;
      });
    }

    setTimeout(updateLocalStorage, 50);
  };

  const handleSpecificMedicationSelect = (
    fieldName,
    value,
    showWarning = false
  ) => {
    if (formData["27_7"] === "None of these apply") {
      setFormData((prev) => ({
        ...prev,
        "27_7": "",
      }));
    }

    const currentValue = formData[fieldName];
    const newValue = currentValue === value ? "" : value;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: newValue,
    }));

    if (showWarning && newValue !== "") {
      const popupConfig = {
        title: "Sorry",
        message:
          "As much as we would love to help, ED medications are not considered safe when taken with this medication. It may cause your blood pressure to drop leading to a possible faint or collapse. We are therefore unable to provide you with a prescription on this occasion and would encourage you to speak to your regular doctor.",
        blocksProceed: true,
      };

      setShowPopup(popupConfig);
    }

    setTimeout(updateLocalStorage, 100);
  };

  return {
    handleOptionSelect,
    handleNoneOption,
    handleOtherOption,
    handleConsentOption,
    handleInputChange,
    handleCheckboxSelect,
    handleSpecificMedicationSelect,
    ...handlerMapping,
  };
};
