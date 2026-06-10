import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";

/**
 * Custom hook to manage questionnaire form state and operations
 *
 * @param {Object} initialFormData - Default form data structure
 * @param {String} storageKey - Key used to store form data in localStorage
 * @param {String} storageExpiryKey - Key used to store expiry time in localStorage
 * @param {String} apiEndpoint - API endpoint for form submission
 * @param {String} formType - Type of form (e.g. 'hair' or 'ed')
 * @returns {Object} - Form state and related functions
 */
export function useQuestionnaireForm({
  initialFormData,
  storageKey,
  storageExpiryKey,
  apiEndpoint,
  formType,
}) {
  const [formData, setFormData] = useState(initialFormData);
  const [progress, setProgress] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const storedData = readLocalStorage();
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        if (!parsedData || typeof parsedData !== 'object') {
          logger.warn(`Invalid ${formType} form data structure, clearing localStorage`);
          localStorage.removeItem(storageKey);
          localStorage.removeItem(storageExpiryKey);
          return;
        }
        
        setFormData(parsedData);

        if (parsedData.page_step) {
          const pageStep = parseInt(parsedData.page_step);
          const maxPages = formType === "hair" ? 20 : 22;
          if (isNaN(pageStep) || pageStep < 1 || pageStep > maxPages) {
            logger.warn(`Invalid page number ${pageStep} for ${formType}, resetting to page 1`);
            setCurrentPage(1);
            setProgress(0);
            return;
          }
          
          setCurrentPage(pageStep);
          setProgress(parseInt(parsedData.completion_percentage || 0));
        }
      } catch (error) {
        logger.error(`Error parsing stored ${formType} data:`, error);
        localStorage.removeItem(storageKey);
        localStorage.removeItem(storageExpiryKey);
      }
    }
  }, [formType, storageKey, storageExpiryKey]);

  /**
   * Read form data from localStorage with expiry check
   * @returns {String|null} Stored form data or null if expired/not found
   */
  const readLocalStorage = () => {
    if (typeof window === "undefined") return null;

    const now = new Date();
    const ttl = localStorage.getItem(storageExpiryKey);

    if (ttl && now.getTime() < parseInt(ttl)) {
      return localStorage.getItem(storageKey);
    } else {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(storageExpiryKey);
    }

    return null;
  };

  /**
   * Save form data to localStorage with expiry time
   * @param {Object} dataToStore - Data to store (defaults to current formData)
   * @returns {Boolean} Success indicator
   */
  const updateLocalStorage = (dataToStore = formData) => {
    if (typeof window === "undefined") return false;

    const now = new Date();
    const ttl = now.getTime() + 1000 * 60 * 60;

    try {
      localStorage.setItem(storageKey, JSON.stringify(dataToStore));
      localStorage.setItem(storageExpiryKey, ttl.toString());
      return true;
    } catch (error) {
      logger.error(`Error storing ${formType} data in local storage:`, error);
      return false;
    }
  };

  /**
   * Update form data and save to localStorage
   * @param {Object} updates - Object containing fields to update
   * @returns {Object} Updated form data
   */
  const updateFormData = (updates) => {
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    updateLocalStorage(newFormData);
    return newFormData;
  };

  /**
   * Submit form data to API
   * @param {Object} specificData - Specific data to submit (optional)
   * @returns {Object|null} API response or null on error
   */
  const submitFormData = async (specificData = null) => {
    try {
      const essentialData = {
        form_id: formData.form_id,
        action:
          formType === "hair"
            ? "hair_questionnaire_data_upload"
            : "ed_questionnaire_data_upload",
        [formType === "hair" ? "hair_entrykey" : "entrykey"]:
          formData[formType === "hair" ? "hair_entrykey" : "entrykey"] || "",
        id: formData.id || "",
        token: formData.token || "",
        stage: formData.stage || "consultation-after-checkout",
        page_step: currentPage,
        completion_state: formData.completion_state || "Partial",
        completion_percentage: progress,
        source_site: formData.source_site || process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com",
      };

      const userInfo = {
        "130_3": formData["130_3"] || "",
        "130_6": formData["130_6"] || "",
        131: formData["131"] || "",
        132: formData["132"] || "",
        158: formData["158"] || "",
        "161_4": formData["161_4"] || "",
        "selected-dosage": formData["selected-dosage"] || "",
      };

      const allFormData = {};
      for (const [key, value] of Object.entries(formData)) {
        if (value !== undefined && value !== null && value !== "") {
          allFormData[key] = value;
        }
      }

      const dataToSubmit = specificData
        ? { ...allFormData, ...specificData }
        : allFormData;

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...essentialData,
          ...userInfo,
          ...dataToSubmit,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data.error) {
        logger.error("Form submission error:", data.msg || data.error_message);

        if (data.data_not_found) {
          alert(
            "An error has been encountered while processing your data. If your session has expired, you will be asked to login again."
          );
          const redirectStage = data.redirect_to_stage || "consultation-after-checkout";
          window.location.href = `/${
            formType === "hair"
              ? "hair-main-questionnaire"
              : "ed-consultation-quiz"
          }/?stage=${redirectStage}`;
        }

        return null;
      }

      const updatedFormData = {
        ...formData,
        id: data.id || formData.id,
        token: data.token || formData.token,
        [formType === "hair" ? "hair_entrykey" : "entrykey"]:
          data[formType === "hair" ? "hair_entrykey" : "entrykey"] ||
          formData[formType === "hair" ? "hair_entrykey" : "entrykey"],
      };

      setFormData(updatedFormData);
      updateLocalStorage(updatedFormData);

      if (formData.completion_state === "Full") {
        setCurrentPage(formType === "hair" ? 20 : 22);
        setProgress(100);
      }

      return data;
    } catch (error) {
      logger.error("Error submitting form:", error);
      return null;
    }
  };

  /**
   * Update progress based on current page
   * @param {Number} totalPages - Total number of pages in the questionnaire
   * @returns {Object} Success indicator
   */
  const updateProgressData = async (totalPages) => {
    const newProgress = Math.ceil((currentPage / totalPages) * 100);
    const progressValue = newProgress < 10 ? 10 : newProgress;

    const updatedData = {
      ...formData,
      completion_percentage: progressValue,
      page_step: currentPage,
    };

    setFormData(updatedData);
    setProgress(progressValue);
    updateLocalStorage(updatedData);

    return { success: true };
  };

  return {
    formData,
    setFormData,
    updateFormData,
    progress,
    setProgress,
    currentPage,
    setCurrentPage,
    readLocalStorage,
    updateLocalStorage,
    submitFormData,
    updateProgressData,
  };
}
