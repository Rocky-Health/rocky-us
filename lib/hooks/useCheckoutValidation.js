import { useState, useCallback } from "react";
import {
  validateCheckoutData,
  formatValidationErrors,
} from "@/utils/checkoutValidation";
import { logger } from "@/utils/devLogger";

/**
 * Custom hook for checkout form validation
 * Provides real-time validation and error handling for checkout forms
 */
export const useCheckoutValidation = () => {
  const [validationErrors, setValidationErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);

  /**
   * Validate checkout data and update error state
   * @param {object} formData - Complete form data object
   * @returns {object} - Validation result
   */
  const validateForm = useCallback((formData) => {
    setIsValidating(true);

    try {
      logger.log("Validating form data, fields present:", {
        billing_address: Boolean(formData.billing_address),
        shipping_address: Boolean(formData.shipping_address),
        card: Boolean(formData.cardNumber),
        useSavedCard: Boolean(formData.useSavedCard),
      });

      const validationResult = validateCheckoutData({
        billing_address: formData.billing_address,
        shipping_address: formData.shipping_address,
        cardNumber: formData.cardNumber,
        cardExpMonth: formData.cardExpMonth,
        cardExpYear: formData.cardExpYear,
        cardCVD: formData.cardCVD,
        useSavedCard: formData.useSavedCard,
      });

      // Convert errors array to object keyed by field name
      const errorsObject = {};
      if (!validationResult.isValid) {
        validationResult.errors.forEach((error) => {
          errorsObject[error.field] = error.message;
        });
      }

      setValidationErrors(errorsObject);

      logger.log("Validation result:", {
        isValid: validationResult.isValid,
        errors: errorsObject,
      });

      const warnings = validationResult.warnings || [];

      return {
        isValid: validationResult.isValid,
        errors: errorsObject,
        formattedMessage: formatValidationErrors(validationResult.errors),
        warnings,
        formattedWarning: formatValidationErrors(warnings),
      };
    } catch (error) {
      logger.error("Error during validation:", error);
      return {
        isValid: false,
        errors: { general: "Validation error occurred" },
        formattedMessage: "Validation error occurred",
      };
    } finally {
      setIsValidating(false);
    }
  }, []);

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field to validate
   * @param {string} value - Value to validate
   * @param {object} context - Additional context for validation
   */
  const validateField = useCallback(
    (fieldName, value, context = {}) => {
      // This could be expanded to provide real-time field validation
      // For now, we'll just clear the error for this field if it exists
      if (validationErrors[fieldName]) {
        setValidationErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[fieldName];
          return newErrors;
        });
      }
    },
    [validationErrors]
  );

  /**
   * Clear all validation errors
   */
  const clearErrors = useCallback(() => {
    setValidationErrors({});
  }, []);

  /**
   * Clear error for a specific field
   * @param {string} fieldName - Name of the field to clear
   */
  const clearFieldError = useCallback((fieldName) => {
    setValidationErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[fieldName];
      return newErrors;
    });
  }, []);

  /**
   * Set error for a specific field
   * @param {string} fieldName - Name of the field
   * @param {string} message - Error message
   */
  const setFieldError = useCallback((fieldName, message) => {
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: message,
    }));
  }, []);

  /**
   * Check if form has any errors
   * @returns {boolean} - Whether form has validation errors
   */
  const hasErrors = useCallback(() => {
    return Object.keys(validationErrors).length > 0;
  }, [validationErrors]);

  /**
   * Get error message for a specific field
   * @param {string} fieldName - Name of the field
   * @returns {string|null} - Error message or null if no error
   */
  const getFieldError = useCallback(
    (fieldName) => {
      return validationErrors[fieldName] || null;
    },
    [validationErrors]
  );

  /**
   * Get all error messages as a formatted string
   * @returns {string} - Formatted error messages
   */
  const getAllErrors = useCallback(() => {
    const errors = Object.values(validationErrors);
    return errors.length > 0 ? errors.join(", ") : "";
  }, [validationErrors]);

  return {
    validationErrors,
    isValidating,
    validateForm,
    validateField,
    clearErrors,
    clearFieldError,
    setFieldError,
    hasErrors,
    getFieldError,
    getAllErrors,
  };
};

export default useCheckoutValidation;
