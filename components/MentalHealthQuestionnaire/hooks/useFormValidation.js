import { useState, useRef } from "react";
import { VALIDATION_RULES } from "../constants";

export const useFormValidation = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [inputFieldsValid, setInputFieldsValid] = useState(true);
  const formRef = useRef(null);
  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setShowError(true);
    
    const errorBox = document.querySelector(".error-box");
    if (errorBox) {
      errorBox.textContent = message;
      errorBox.classList.remove("hidden");
    }

    setTimeout(() => {
      setShowError(false);
      if (errorBox) {
        errorBox.classList.add("hidden");
        errorBox.textContent = "";
      }
    }, 3000);

    return false;
  };

  const hideErrorMessage = () => {
    setShowError(false);
  };

  const clearError = () => {
    const errorBox = document.querySelector(".error-box");
    if (errorBox) {
      errorBox.classList.add("hidden");
      errorBox.textContent = "";
    }
  };
  const validateMedicationFields = (page, formData) => {
    if (page !== 1) return true;

    const currentSituation = formData["501"];

    if (
      currentSituation ===
      "I'm currently on medications and want to get it from MyRocky"
    ) {
      const hasMedicationName = formData["l-501_1-input"] || formData["l-501-1-input"];
      const hasPrescriberInfo = formData["l-501_1-textarea"] || formData["l-501-1-textarea"];
      
      if (!hasMedicationName || !hasPrescriberInfo) {
        return false;
      }
    }

    if (
      currentSituation ===
      "I am not on medication for mental health but have been in the past"
    ) {
      const hasMedicationName = formData["l-501_3-input"] || formData["l-501-3-input"];
      const hasPrescriberInfo = formData["l-501_3-textarea"] || formData["l-501-3-textarea"];
      
      if (!hasMedicationName || !hasPrescriberInfo) {
        return false;
      }
    }

    return true;
  };
  const isPageValidated = (
    currentPage,
    formData,
    photoIdFile = null,
    isUploading = false,
    photoIdAcknowledged = false
  ) => {
    // For health care team questions page
    if (currentPage === 34) {
      const validationRule = VALIDATION_RULES[currentPage];
      if (validationRule && !validationRule(formData)) {
        return showErrorMessage("Please complete all required fields");
      }
      return true;
    }

    // For photo ID upload page
    if (currentPage === 36) {
      if (!photoIdFile) {
        return showErrorMessage("Please upload a photo ID");
      }
      if (isUploading) {
        return false;
      }
      return true;
    }

    if (currentPage === 35) {
      if (!photoIdAcknowledged) {
        return showErrorMessage(
          "Please acknowledge the ID verification requirement"
        );
      }
      return true;
    }

    if (currentPage === 37) {
      return true;
    }

    if (VALIDATION_RULES[currentPage]) {
      const isValid = VALIDATION_RULES[currentPage](formData);

      if (!isValid) {
        return showErrorMessage("Please complete all required fields");
      }
    }

    if (currentPage === 1) {
      const isMedicationValid = validateMedicationFields(currentPage, formData);
      if (!isMedicationValid) {
        return showErrorMessage("Please complete the medication information");
      }
    }

    return true;
  };

  return {
    formRef,
    inputFieldsValid,
    setInputFieldsValid,
    validateMedicationFields,
    showError: showErrorMessage,
    hideError: hideErrorMessage,
    clearError,
    isValidated: isPageValidated,
    errorMessage,
    showErrorState: showError,
  };
};