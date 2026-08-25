"use client";

import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter } from "next/navigation";
import { QuestionLayout } from "../EdQuestionnaire/QuestionLayout";
import { QuestionOption } from "../EdQuestionnaire/QuestionOption";
import { QuestionAdditionalInput } from "../EdQuestionnaire/QuestionAdditionalInput";
import { motion, AnimatePresence } from "framer-motion";
import QuestionnaireNavbar from "../EdQuestionnaire/QuestionnaireNavbar";
import { ProgressBar } from "../EdQuestionnaire/ProgressBar";
import { WarningPopup } from "../EdQuestionnaire/WarningPopup";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";
import { getQuizUserInfoError } from "@/utils/quizUserValidation";
const { uploadFileToS3WithProgress } = await import(
  "@/utils/s3/frontend-upload"
);

export default function ZonnicConsultationQuiz({
  phone,
  firstName,
  lastName,
  userEmail,
  dob,
  province,
  pn,
  userName,
}) {
  const router = useRouter();
  const formRef = useRef(null);

  const [nameUpdateOption, setNameUpdateOption] = useState("");
  const [showNameDifferencePopup, setShowNameDifferencePopup] = useState(false);
  const [isMovingForward, setIsMovingForward] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  useQuestionnaireStepTracking({
    questionnaireId: "zonnic-consultation",
    stepId: currentPage,
    stepIndex: currentPage,
    flowId: "smoking",
    stepType: "quiz",
    isPostPurchaseConsultation: true,
  });

  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);
  const [showPhotoIdPopup, setShowPhotoIdPopup] = useState(false);
  const [photoIdAcknowledged, setPhotoIdAcknowledged] = useState(false);
  const [showHighBpWarning, setShowHighBpWarning] = useState(false);
  const [showVeryHighBpWarning, setShowVeryHighBpWarning] = useState(false);
  const [showUnknownBpWarning, setShowUnknownBpWarning] = useState(false);
  const [photoIdFile, setPhotoIdFile] = useState(null);
  const fileInputRef = useRef(null);
  const [questionsStack, setQuestionsStack] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const processPropsToFormData = () => {
    let processedFirstName = firstName;
    let processedLastName = lastName;

    if (userName && !firstName && !lastName) {
      const nameParts = userName.trim().split(" ");
      processedFirstName = nameParts[0] || "";
      processedLastName = nameParts.slice(1).join(" ") || "";
    }

    const finalPhone = pn || phone || "";
    const finalUserEmail = userEmail || "";
    const finalDob = dob || "";
    const finalProvince = province || "";

    return {
      firstName: processedFirstName || "",
      lastName: processedLastName || "",
      phone: finalPhone,
      userEmail: finalUserEmail,
      dob: finalDob,
      province: finalProvince,
    };
  };

  const processedProps = processPropsToFormData();

  const [formData, setFormData] = useState({
    form_id: 7,
    action: "smoking_questionnaire_data_upload",
    smoking_entrykey: "",
    id: "",
    token: "",
    stage: "consultation-after-checkout",
    page_step: 0,
    completion_state: "Partial",
    completion_percentage: 0,
    source_site: process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com",
    "130_3": processedProps.firstName,
    "130_6": processedProps.lastName,
    131: processedProps.userEmail,
    132: processedProps.phone,
    158: processedProps.dob,
    "161_4": processedProps.province,
    701: "",
    702: "",
    703: "",
    704: "",
    705: "",
    706: "",
    707: "",
    "last-question-index": 0,
    196: "",
    legal_first_name: "",
    legal_last_name: "",
  });

  const questionList = [
    // Question => 1
    {
      questionId: "701",
      type: "single-choice",
      questionHeader:
        "Are you currently using any other nicotine replacement products or smoking cessation medications (e.g., patches, gum, inhalers, or bupropion)?",
      answers: [
        {
          body: "Yes",
          addsTextArea:
            "Please specify which products and how much you are using.",
          addsContinue: "702",
        },
        {
          body: "No",
        },
      ],
    },
    // Question => 2
    {
      questionId: "702",
      type: "single-choice",
      questionHeader:
        "Do you have any medical conditions or health concerns, such as heart disease, high blood pressure, or pregnancy, that may affect the use of nicotine products?",
      answers: [
        {
          body: "Yes",
          addsTextArea: "Please provide details",
          addsContinue: "703",
        },
        {
          body: "No",
        },
      ],
    },
    // Question => 3
    {
      questionId: "703",
      type: "single-choice",
      questionHeader:
        "How many cigarettes or tobacco products do you currently use daily?",
      answers: [
        {
          body: "Less than 10 per day.",
        },
        {
          body: "10–20 per day.",
        },
        {
          body: "More than 20 per day.",
        },
      ],
    },
    // Question => 3-2
    {
      questionId: "707",
      type: "single-choice",
      questionHeader:
        "Do you find it difficult to refrain from smoking in forbidden places?",
      answers: [
        {
          body: "Yes",
        },
        {
          body: "No",
        },
      ],
    },
    // Question => 4
    {
      questionId: "704",
      type: "single-choice",
      questionHeader:
        "Have you experienced any serious side effects or allergic reactions to nicotine products in the past?",
      answers: [
        {
          body: "Yes",
          addsTextArea: "Please provide details",
          addsContinue: "705",
        },
        {
          body: "No",
        },
        {
          body: "N/A",
        },
      ],
    },
    // Question => 5
    {
      questionId: "705",
      type: "single-choice",
      questionHeader:
        "What is your primary goal with nicotine replacement therapy?",
      answers: [
        {
          body: "Quit smoking entirely.",
        },
        {
          body: "Reduce daily tobacco usage.",
        },
        {
          body: "Other",
          addsTextArea: "Please provide details",
          addsContinue: "706",
        },
      ],
    },
    // Question => 6
    {
      questionId: "706",
      type: "multi-choice",
      questionHeader:
        "In a typical week, which of the following best describes your habits? (Select all that apply)",
      answers: [
        {
          body: "I consume caffeinated beverages (e.g., coffee, tea, energy drinks).",
        },
        {
          body: "I engage in regular physical activity or exercise.",
        },
        {
          body: "I consume alcohol.",
        },
        {
          body: "None of the above.",
        },
      ],
    },
  ];

  const slideVariants = {
    hiddenRight: { x: "100%", opacity: 0 },
    hiddenLeft: { x: "-100%", opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exitRight: {
      x: "-100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exitLeft: {
      x: "100%",
      opacity: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  };

  useEffect(() => {
    let isMounted = true;
    const processQueue = async () => {
      if (pendingSubmissions.length === 0 || isSyncing) return;

      setIsSyncing(true);

      try {
        const submission = pendingSubmissions[0];

        const result = await submitFormData(submission.data);

        if (isMounted) {
          setPendingSubmissions((prev) => prev.slice(1));
        }
      } catch (error) {
        logger.error("Background sync error:", error);
        if (isMounted) {
          setPendingSubmissions((prev) => prev.slice(1));
        }
      } finally {
        if (isMounted) {
          setIsSyncing(false);
        }
      }
    };

    processQueue();

    return () => {
      isMounted = false;
    };
  }, [pendingSubmissions, isSyncing]);

  const queueFormSubmission = (data) => {
    const hasNonEmptyValues = Object.values(data).some(
      (val) => val !== "" && val !== null && val !== undefined
    );
    if (!hasNonEmptyValues) return;

    setPendingSubmissions((prev) => {
      const isDuplicate = prev.some(
        (submission) => JSON.stringify(submission.data) === JSON.stringify(data)
      );

      if (!isDuplicate) {
        return [...prev, { data, timestamp: Date.now() }];
      }

      return prev;
    });
  };

  useEffect(() => {
    if (dataLoaded) return;

    const storedData = readLocalStorage();
    if (!storedData) {
      const initialData = {
        "130_3": processedProps.firstName || "",
        "130_6": processedProps.lastName || "",
        131: processedProps.userEmail || "",
        132: processedProps.phone || "",
        158: processedProps.dob || "",
        "161_4": processedProps.province || "",
      };

      const filteredData = Object.fromEntries(
        Object.entries(initialData).filter(
          ([_, value]) => value != null && value !== ""
        )
      );

      setFormData((prev) => ({ ...prev, ...filteredData }));
      setDataLoaded(true);
      return;
    }

    try {
      const quizFormData = JSON.parse(storedData);
      if (!quizFormData || typeof quizFormData !== 'object') {
        logger.warn("Invalid Zonnic form data structure, clearing localStorage");
        localStorage.removeItem("smoking-quiz-form-data");
        localStorage.removeItem("smoking-quiz-form-data-expiry");
        setDataLoaded(true);
        return;
      }
      
      const mergedData = {
        ...quizFormData,
        158: processedProps.dob || quizFormData["158"],
        131: processedProps.userEmail || quizFormData["131"],
        132: processedProps.phone || quizFormData["132"],
        "161_4": processedProps.province || quizFormData["161_4"],
        "130_3": processedProps.firstName || quizFormData["130_3"],
        "130_6": processedProps.lastName || quizFormData["130_6"],
      };

      setFormData(mergedData);

      if (quizFormData.page_step) {
        const storedPage = parseInt(quizFormData.page_step);
        if (isNaN(storedPage) || storedPage < 1 || storedPage > 20) {
          logger.warn(`Invalid page number ${storedPage} for Zonnic, resetting to page 1`);
          setCurrentPage(1);
          setProgress(0);
        } else {
          setCurrentPage(storedPage);
          setProgress(parseInt(quizFormData.completion_percentage || 0));
        }
      }

      if (quizFormData["196"]) {
      }

      if (quizFormData.completion_state === "Full") {
        setProgress(100);
      }

      setDataLoaded(true);
    } catch (error) {
      logger.error("Error parsing stored quiz data:", error);
      localStorage.removeItem("smoking-quiz-form-data");
      localStorage.removeItem("smoking-quiz-form-data-expiry");
      setDataLoaded(true);
    }
  }, [
    dataLoaded,
    router,
    processedProps.firstName,
    processedProps.lastName,
    processedProps.userEmail,
    processedProps.phone,
    processedProps.dob,
    processedProps.province,
    pn,
    userName,
  ]);

  useEffect(() => {
    if (!formRef.current) return;

    const backButton = formRef.current.querySelector(".quiz-back-button");
    if (backButton) {
      if (currentPage > 0) {
        backButton.classList.remove("hidden");
      } else {
        backButton.classList.add("hidden");
      }
    }

    const setContinueButtonVisibility = (isVisible) => {
      const continueButton = formRef.current.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = isVisible ? "" : "hidden";
      }
    };
    const buttonRules = [
      {
        page: 0,
        isVisible: () => !!formData["701"],
      },
      {
        page: 1,
        isVisible: () => !!formData["702"],
      },
      {
        page: 2,
        isVisible: () => !!formData["703"],
      },
      {
        page: 3,
        isVisible: () => !!formData["707"],
      },
      {
        page: 4,
        isVisible: () => !!formData["704"],
      },
      {
        page: 5,
        isVisible: () => !!formData["705"],
      },
      {
        page: 6,
        isVisible: () => {
          const hasSelection =
            formData["706_1"] ||
            formData["706_2"] ||
            formData["706_3"] ||
            formData["706_4"];
          return hasSelection;
        },
      },
      {
        page: 7,
        isVisible: () => photoIdAcknowledged,
      },
    ];

    const rule = buttonRules.find((rule) => rule.page === currentPage);
    if (rule) {
      setContinueButtonVisibility(rule.isVisible());
    } else {
      setContinueButtonVisibility(true);
    }
  }, [currentPage, formData]);
  useEffect(() => {
    if (currentPage === 8 && (photoIdFile || formData["196"])) {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.disabled = false;
        continueButton.style.opacity = "1";
      }
    }
  }, [currentPage, photoIdFile, formData]);

  useEffect(() => {
    if (currentPage === questionList.length + 2) {
      const updatedFormData = {
        ...formData,
        page_step: currentPage,
        completion_percentage: 100,
        completion_state: "Full",
      };
      updateLocalStorage(updatedFormData);
    }
  }, [currentPage, formData, questionList.length]);

  const readLocalStorage = () => {
    if (typeof window !== "undefined") {
      const now = new Date();
      const ttl = localStorage.getItem("smoking-quiz-form-data-expiry");

      if (ttl && now.getTime() < parseInt(ttl)) {
        return localStorage.getItem("smoking-quiz-form-data");
      } else {
        localStorage.removeItem("smoking-quiz-form-data");
        localStorage.removeItem("smoking-quiz-form-data-expiry");
      }
    }
    return null;
  };

  const updateLocalStorage = (dataToStore = formData) => {
    if (typeof window !== "undefined") {
      const now = new Date();
      const ttl = now.getTime() + 1000 * 60 * 60;

      try {
        localStorage.setItem(
          "smoking-quiz-form-data",
          JSON.stringify(dataToStore)
        );
        localStorage.setItem("smoking-quiz-form-data-expiry", ttl.toString());
        return true;
      } catch (error) {
        logger.error("Error storing data in local storage:", error);
        return false;
      }
    }
    return false;
  };
  const updateFormDataAndStorage = (updates) => {
    const newData = { ...formData, ...updates };
    setFormData({
      ...newData,
      _skipAutoUpdate: true,
    });
    updateLocalStorage(newData);
    // queueFormSubmission(updates);
    return newData;
  };

  const batchUpdatesForSubmission = (updates) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        ...updates,
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const updateLocalStorageOnly = (data) => {
    updateLocalStorage(data);
  };

  const showLoader = () => {
    setUploadProgress(0);
    const loader = document.getElementById("please-wait-loader-overlay");
    if (loader) {
      loader.classList.remove("hidden");
    }
  };

  const hideLoader = () => {
    setUploadProgress(0);
    const loader = document.getElementById("please-wait-loader-overlay");
    if (loader) {
      loader.classList.add("hidden");
    }
  };

  const handleStandardOptionSelect = (
    fieldName,
    value,
    autoAdvance = false,
    additionalUpdates = {}
  ) => {
    if (formRef.current) {
      const errorBox = formRef.current.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.add("hidden");
        errorBox.textContent = "";
      }
    }

    let updates = {
      [fieldName]: value,
      ...additionalUpdates,
    };

    if (fieldName === "701" && value === "No") {
      updates["l-701_1-textarea"] = "";
    }
    if (fieldName === "702" && value === "No") {
      updates["l-702_1-textarea"] = "";
    }
    if (fieldName === "704" && (value === "No" || value === "N/A")) {
      updates["l-704_1-textarea"] = "";
    }

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        ...updates,
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });

    setTimeout(() => {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "visible";
        continueButton.style.display = "block";
      }
    }, 100);
  };

  const handleBackClick = () => {
    moveToPreviousSlide();
  };
  const handleOptionSelect = (questionId, value, hasTextArea = false) => {
    handleStandardOptionSelect(questionId, value, !hasTextArea);
  };
  const handleMultiOptionSelect = (questionId, value, index) => {
    if (formRef.current) {
      const errorBox = formRef.current.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.add("hidden");
        errorBox.textContent = "";
      }
    }

    const fieldName = `${questionId}_${index + 1}`;

    setFormData((prevData) => {
      const currentValue = prevData[fieldName];
      let updatedData;

      if (questionId == "706" && index == 3) {
        updatedData = {
          ...prevData,
          "706_1": null,
          "706_2": null,
          "706_3": null,
          [fieldName]: currentValue === value ? "" : value,
        };
      } else if (questionId == "706" && index !== 3) {
        updatedData = {
          ...prevData,
          "706_4": null,
          [fieldName]: currentValue === value ? "" : value,
        };
      } else {
        updatedData = {
          ...prevData,
          [fieldName]: currentValue === value ? "" : value,
        };
      }

      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const compareStoredNames = () => {
    if (!firstName || !lastName) return;

    try {
      const storedData = localStorage.getItem("smoking-quiz-form-data");
      if (!storedData) return;

      const parsedData = JSON.parse(storedData);
      const storedFirstName = parsedData["130_3"] || "";
      const storedLastName = parsedData["130_6"] || "";

      if (
        (storedFirstName && storedFirstName !== firstName) ||
        (storedLastName && storedLastName !== lastName)
      ) {
        if (!nameUpdateOption) {
          setShowNameDifferencePopup(true);
        }
      }
    } catch (error) {
      logger.error("Error comparing stored names:", error);
    }
  };
  const handleTextAreaChange = (fieldName, value) => {
    const updates = { [fieldName]: value };
    updateFormDataAndStorage(updates);
  };
  const handlePhotoIdAcknowledgement = (e) => {
    const isChecked = e.target.checked;
    setPhotoIdAcknowledged(isChecked);

    const updates = { photo_id_acknowledgement: isChecked ? "1" : "" };
    updateFormDataAndStorage(updates);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.disabled = !isChecked;
    }
  };

  const handlePhotoIdFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const clearError = () => {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.add("hidden");
        errorBox.textContent = "";
      }
    };
    clearError();

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    const supportedTypes = ["image/jpeg", "image/jpg", "image/png"];

    if (!supportedTypes.includes(fileType)) {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent = "Only JPG, JPEG, and PNG images are supported";
      }
      e.target.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent = "Maximum file size is 20MB";
      }
      e.target.value = "";
      document.getElementById("photo-id-preview").src = "";
      setPhotoIdFile(null);
      return;
    }

    setPhotoIdFile(file);

    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById("photo-id-preview");
      if (preview) {
        preview.src = e.target?.result;
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoIdUpload = async () => {
    if (!photoIdFile) {
      throw new Error("No photo file selected");
    }

    try {
      setIsUploading(true);
      showLoader();
      const s3Url = await uploadFileToS3WithProgress(
        photoIdFile,
        "questionnaire/smoking-photo-ids",
        "smoking",
        (progress) => {
          setUploadProgress(progress);
        }
      );

      const submissionData = {
        ...formData,
        196: s3Url,
        completion_state: "Full",
        stage: "photo-id-upload",
        action: "smoking_questionnaire_data_upload",
        form_id: 7,
      };

      const response = await fetch("/api/smoking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.msg || "Failed to submit questionnaire data");
      }

      const updates = {
        196: s3Url,
        completion_state: "Full",
        stage: "photo-id-upload",
        id: data.id || formData.id,
        token: data.token || formData.token,
        smoking_entrykey: data.smoking_entrykey || formData.smoking_entrykey,
      };
      updateFormDataAndStorage(updates);

      setTimeout(() => {
        hideLoader();
      }, 100);

      return true;
    } catch (error) {
      logger.error("Error uploading photo:", error);
      hideLoader();
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const submitFormData = async (specificData = null) => {
    try {
      if (currentPage === 0 && formData.id) {
        return {
          id: formData.id,
          token: formData.token,
          smoking_entrykey: formData.smoking_entrykey,
        };
      }

      const essentialData = {
        form_id: formData.form_id || 7,
        action: "smoking_questionnaire_data_upload",
        smoking_entrykey: formData.smoking_entrykey || "",
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
        132: formData["132"] || "(000) 000-0000",
        158: formData["158"] || "2000-01-01",
        "161_4": formData["161_4"] || "Ontario",
      };

      const allAnswers = {
        ...formData,
        page_step: currentPage,
        completion_percentage: progress,
      };

      const finalData = {
        ...allAnswers,
        ...(specificData || {}),
      };

      Object.keys(finalData).forEach(
        (key) =>
          (finalData[key] === undefined || finalData[key] === null) &&
          delete finalData[key]
      );

      if (Object.keys(finalData).length === 0) {
        return null;
      }

      const response = await fetch("/api/smoking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...essentialData,
          ...userInfo,
          ...finalData,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (data) {
        setFormData((prev) => {
          const updates = {};
          if (data.id) updates.id = data.id;
          if (data.token) updates.token = data.token;
          if (data.smoking_entrykey)
            updates.smoking_entrykey = data.smoking_entrykey;

          return Object.keys(updates).length > 0
            ? { ...prev, ...updates }
            : prev;
        });

        updateLocalStorage();
      }

      return data;
    } catch (error) {
      logger.error("Error submitting form:", error);
      return null;
    }
  };

  const collectCurrentPageData = () => {
    const pageFieldMap = {
      0: ["701", "l-701_1-textarea"],
      1: ["702", "l-702_1-textarea"],
      2: ["703"],
      3: ["707"],
      4: ["704", "l-704_1-textarea"],
      5: ["705", "l-705_3-textarea"],
      6: ["706_1", "706_2", "706_3", "706_4"],
      7: ["photo_id_acknowledgement"],
    };

    const relevantFields = pageFieldMap[currentPage] || [];

    const pageData = {};
    relevantFields.forEach((field) => {
      if (formData[field]) {
        pageData[field] = formData[field];
      }
    });

    return pageData;
  };
  const moveToNextSlide = async () => {
    if (!isValidated()) return;

    if (currentPage === 8) {
      try {
        if (!photoIdFile) {
          return showError("Please upload a photo ID");
        }

        setIsUploading(true);

        const uploadFormData = new FormData();
        uploadFormData.append("photo_id_upload", photoIdFile);
        uploadFormData.append("action", "questionnaire_file_upload");
        uploadFormData.append("id", formData.id || "");
        uploadFormData.append("token", formData.token || "");
        uploadFormData.append("form_id", "7");

        const response = await fetch("/api/smoking", {
          method: "POST",
          body: uploadFormData,
        });

        const data = await response.json();

        if (data.photo_id_upload?.error) {
          throw new Error(data.photo_id_upload.error);
        }

        const updatedFormData = {
          ...formData,
          196: data.photo_id_upload.url,
          completion_state: "Full",
          stage: "photo-id-upload",
          id: data.id || formData.id,
          token: data.token || formData.token,
          smoking_entrykey: data.smoking_entrykey || formData.smoking_entrykey,
        };

        setFormData(updatedFormData);
        updateLocalStorage(updatedFormData);

        await submitFormData({
          ...updatedFormData,
          196: data.photo_id_upload.url,
          completion_state: "Full",
        });
        setCurrentPage(questionList.length + 1);
        setProgress(100);
      } catch (error) {
        logger.error("Photo upload error:", error);
        const errorBox = formRef.current?.querySelector(".error-box");
        if (errorBox) {
          errorBox.classList.remove("hidden");
          errorBox.textContent =
            "An error occurred during verification. Please try again.";
        }
      } finally {
        setIsUploading(false);
      }
      return;
    }

    setIsMovingForward(true);
    setQuestionsStack((prev) => [...prev, currentPage]);
    const nextPage = currentPage + 1;
    const totalPages = 9;
    const newProgress = Math.min(Math.ceil((nextPage / totalPages) * 100), 100);

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        page_step: nextPage,
        last_question_index: nextPage,
        completion_percentage: newProgress,
      };
      updateLocalStorage(updatedFormData);
      return updatedFormData;
    });
    setCurrentPage(nextPage);
    setProgress(newProgress);

    submitFormData();
  };

  const moveToNextSlideWithoutValidation = async (previousUpdates = {}) => {
    setIsMovingForward(true);

    const shouldShowLoader = currentPage === 0 && !formData.token;
    if (shouldShowLoader) {
      showLoader();
    }

    setQuestionsStack((prev) => [...prev, currentPage]);

    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);

    const currentPageData = collectCurrentPageData();

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        ...previousUpdates,
        ...currentPageData,
        page_step: nextPage,
        last_question_index: nextPage,
      };

      updateLocalStorage(updatedFormData);
      return updatedFormData;
    });
    const newProgress = Math.min(Math.ceil((nextPage / 9) * 100), 100);
    setProgress(newProgress);
    try {
      await submitFormData();
    } catch (error) {
      logger.error("Error during form submission:", error);
    } finally {
      if (shouldShowLoader) {
        hideLoader();
      }
    }
  };

  const moveToPreviousSlide = () => {
    setIsMovingForward(false);

    if (questionsStack.length > 0) {
      const prevPage = questionsStack[questionsStack.length - 1];
      setCurrentPage(prevPage);
      setQuestionsStack((prev) => prev.slice(0, -1));

      setFormData((prev) => ({
        ...prev,
        page_step: prevPage,
      }));
      const newProgress = Math.min(Math.ceil((prevPage / 9) * 100), 100);
      setProgress(newProgress);

      updateLocalStorage();
    }
  };
  const isValidated = () => {
    const showError = (message) => {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent = message;
      }
      return false;
    };

    const clearError = () => {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.add("hidden");
        errorBox.textContent = "";
      }
    };

    const validationRules = [
      {
        page: 0,
        validate: () => {
          if (!formData["701"]) {
            return showError("Please make a selection 0");
          }
          if (formData["701"] === "Yes" && !formData["l-701_1-textarea"]) {
            return showError(
              "Please provide details about the products you are using"
            );
          }

          return true;
        },
      },
      {
        page: 1,
        validate: () => {
          if (!formData["702"]) {
            return showError("Please make a selection");
          }
          if (formData["702"] === "Yes" && !formData["l-702_1-textarea"]) {
            return showError(
              "Please provide details about your medical conditions"
            );
          }

          return true;
        },
      },
      {
        page: 2,
        validate: () => {
          if (!formData["703"]) {
            return showError("Please make a selection 1");
          }
          return true;
        },
      },
      {
        page: 3,
        validate: () => {
          if (!formData["707"]) {
            return showError("Please make a selection");
          }
          return true;
        },
      },
      {
        page: 4,
        validate: () => {
          if (!formData["704"]) {
            return showError("Please make a selection");
          }
          if (formData["704"] === "Yes" && !formData["l-704_1-textarea"]) {
            return showError(
              "Please provide details about your side effects or allergic reactions"
            );
          }

          return true;
        },
      },
      {
        page: 5,
        validate: () => {
          if (!formData["705"]) {
            return showError("Please make a selection");
          }

          if (formData["705"] === "Other" && !formData["l-705_3-textarea"]) {
            return showError("Please provide details about your goal");
          }

          return true;
        },
      },
      {
        page: 6,
        validate: () => {
          const hasSelection =
            formData["706_1"] ||
            formData["706_2"] ||
            formData["706_3"] ||
            formData["706_4"];

          if (!hasSelection) {
            return showError("Please select at least one option");
          }
          return true;
        },
      },
      {
        page: 7,
        validate: () => {
          if (!photoIdAcknowledged) {
            return showError(
              "Please acknowledge the ID verification requirement"
            );
          }
          return true;
        },
      },
      {
        page: 8,
        validate: () => {
          if (!photoIdFile && !formData["196"]) {
            return showError("Please upload a photo ID");
          }

          return true;
        },
      },
    ];
    const rule = validationRules.find((rule) => rule.page === currentPage);
    if (rule) {
      const isValid = rule.validate();
      if (isValid) {
        clearError();
      }
      return isValid;
    }

    clearError();
    return true;
  };

  const renderWarning = (title, message, onClose, buttonText = "OK") => {
    return (
      <WarningPopup
        isOpen={showWarning}
        onClose={onClose}
        title={title}
        message={message}
        isAcknowledged={warningAcknowledged}
        onAcknowledge={(e) => setWarningAcknowledged(e.target.checked)}
        buttonText={buttonText}
        backgroundColor="bg-white"
        titleColor="text-[#AE7E56]"
      />
    );
  };
  const handleContinueClick = async () => {
    if (currentPage === questionList.length + 2) {
      router.push("/");
      return;
    }
    if (
      currentPage === 0 ||
      currentPage === 1 ||
      currentPage === 4 ||
      currentPage === 5 ||
      currentPage === 6 ||
      currentPage === 7
    ) {
      if (!isValidated()) return;

      const currentPageData = collectCurrentPageData();
      const updates = {
        ...currentPageData,
        page_step: currentPage + 1,
      };

      updateFormDataAndStorage(updates);

      setTimeout(() => {
        moveToNextSlideWithoutValidation(currentPageData);
      }, 100);
      return;
    }
    if (currentPage === 8 && photoIdFile) {
      try {
        if (!isValidated()) {
          logger.log("Validation failed");
          return;
        }

        await handlePhotoIdUpload();

        const thankYouPage = questionList.length + 2;
        setCurrentPage(thankYouPage);
        setProgress(100);
        const updatedFormData = {
          ...formData,
          page_step: thankYouPage,
          completion_percentage: 100,
        };
        updateLocalStorage(updatedFormData);
      } catch (error) {
        logger.error("Photo upload error:", error);
        const errorBox = formRef.current?.querySelector(".error-box");
        if (errorBox) {
          errorBox.classList.remove("hidden");
          errorBox.textContent = `Upload failed: ${error.message}`;
        }
      }
      return;
    }

    if (isValidated()) {
      moveToNextSlide();
    }
  };

  const verifyCustomerAndProceed = async () => {
    const userInfoError = getQuizUserInfoError(formData);
    if (userInfoError) {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent = userInfoError;
      }
      return;
    }

    try {
      setIsUploading(true);

      if (!photoIdFile && !formData["196"]) {
        throw new Error("Please upload a photo ID first");
      }

      if (photoIdFile) {
        await handlePhotoIdUpload();
      }

      const updatedFormData = {
        ...formData,
        legal_first_name: firstName || formData["130_3"],
        legal_last_name: lastName || formData["130_6"],
        opted_to_update_legal_name: nameUpdateOption === "update",
        customer_is_ordering_for_some_one_else:
          nameUpdateOption === "someone_else",
        completion_state: "Full",
        stage: "photo-id-upload",
      };

      setFormData(updatedFormData);
      updateLocalStorage(updatedFormData);

      await submitFormData(updatedFormData);
      setNameUpdateOption("");
      setShowNameDifferencePopup(false);
      const thankYouPage = questionList.length + 2;
      setCurrentPage(thankYouPage);
      setProgress(100);
      const finalFormData = {
        ...updatedFormData,
        page_step: thankYouPage,
        completion_percentage: 100,
      };
      updateLocalStorage(finalFormData);
    } catch (error) {
      logger.error("Customer verification error:", error);
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent =
          "An error occurred during verification. Please try again.";
      }
    } finally {
      setIsUploading(false);
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {!dataLoaded ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AE7E56] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading questionnaire...</p>
          </div>
        </div>
      ) : (
        <>
          <QuestionnaireNavbar
            onBackClick={handleBackClick}
            currentPage={currentPage + 1}
          />

          <div className="flex-1">
            <div
              className="quiz-page-wrapper relative md:container md:w-[520px] mx-auto bg-[#FFFFFF]"
              ref={formRef}
            >
              {/* Hide progress bar on thank you page */}
              {currentPage !== questionList.length + 2 && (
                <ProgressBar progress={progress} />
              )}

              <form id="smoking-quiz-form">
                <input type="hidden" name="form_id" value="7" />
                <input
                  type="hidden"
                  name="action"
                  value="smoking_questionnaire_data_upload"
                />
                <input
                  type="hidden"
                  name="smoking_entrykey"
                  value={formData.smoking_entrykey || ""}
                />
                <input type="hidden" name="id" value={formData.id || ""} />
                <input
                  type="hidden"
                  name="token"
                  value={formData.token || ""}
                />
                <input
                  type="hidden"
                  name="stage"
                  value="consultation-after-checkout"
                />
                <input type="hidden" name="page_step" value={currentPage} />
                <input type="hidden" name="completion_state" value="Partial" />
                <input
                  type="hidden"
                  name="completion_percentage"
                  value={progress}
                />
                <input
                  type="hidden"
                  name="source_site"
                  value={process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com"}
                />
                <input
                  type="hidden"
                  name="last-question-index"
                  value={currentPage}
                />

                <input
                  type="hidden"
                  name="130_3"
                  value={formData["130_3"] || ""}
                />
                <input
                  type="hidden"
                  name="130_6"
                  value={formData["130_6"] || ""}
                />
                <input
                  type="hidden"
                  name="131"
                  value={formData["131"] || ""}
                />
                <input
                  type="hidden"
                  name="132"
                  value={formData["132"] || "(000) 000-0000"}
                />
                <input
                  type="hidden"
                  name="158"
                  value={formData["158"] || "2000-01-01"}
                />
                <input
                  type="hidden"
                  name="161_4"
                  value={formData["161_4"] || "Ontario"}
                />

                <div className="relative min-h-[400px] flex items-start">
                  <div>
                    <AnimatePresence mode="wait" custom={isMovingForward}>
                      <motion.div
                        key={currentPage}
                        variants={slideVariants}
                        initial={isMovingForward ? "hiddenRight" : "hiddenLeft"}
                        animate="visible"
                        exit={isMovingForward ? "exitRight" : "exitLeft"}
                        className="w-full"
                      >
                        {/* Question 1 */}
                        {currentPage === 0 && (
                          <QuestionLayout
                            title={questionList[0].questionHeader}
                            currentPage={currentPage + 1}
                            pageNo={1}
                            questionId="701"
                          >
                            <QuestionOption
                              id="701_1"
                              name="701"
                              value="Yes"
                              checked={formData["701"] === "Yes"}
                              onChange={() =>
                                handleOptionSelect("701", "Yes", true)
                              }
                              type="radio"
                            />

                            {formData["701"] === "Yes" && (
                              <QuestionAdditionalInput
                                id="l-701_1-textarea"
                                name="l-701_1-textarea"
                                placeholder="Please specify which products and how much you are using."
                                value={formData["l-701_1-textarea"] || ""}
                                onChange={(e) =>
                                  handleTextAreaChange(
                                    "l-701_1-textarea",
                                    e.target.value
                                  )
                                }
                                type="textarea"
                              />
                            )}

                            <QuestionOption
                              id="701_2"
                              name="701"
                              value="No"
                              checked={formData["701"] === "No"}
                              onChange={() => handleOptionSelect("701", "No")}
                              type="radio"
                            />
                          </QuestionLayout>
                        )}
                        {/* Question 2 */}
                        {currentPage === 1 && (
                          <QuestionLayout
                            title={questionList[1].questionHeader}
                            currentPage={currentPage + 1}
                            pageNo={2}
                            questionId="702"
                          >
                            <QuestionOption
                              id="702_1"
                              name="702"
                              value="Yes"
                              checked={formData["702"] === "Yes"}
                              onChange={() =>
                                handleOptionSelect("702", "Yes", true)
                              }
                              type="radio"
                            />

                            {formData["702"] === "Yes" && (
                              <QuestionAdditionalInput
                                id="l-702_1-textarea"
                                name="l-702_1-textarea"
                                placeholder="Please provide details"
                                value={formData["l-702_1-textarea"] || ""}
                                onChange={(e) =>
                                  handleTextAreaChange(
                                    "l-702_1-textarea",
                                    e.target.value
                                  )
                                }
                                type="textarea"
                              />
                            )}

                            <QuestionOption
                              id="702_2"
                              name="702"
                              value="No"
                              checked={formData["702"] === "No"}
                              onChange={() => handleOptionSelect("702", "No")}
                              type="radio"
                            />
                          </QuestionLayout>
                        )}
                        {/* Question 3 */}
                        {currentPage === 2 && (
                          <QuestionLayout
                            title={questionList[2].questionHeader}
                            currentPage={currentPage + 1}
                            pageNo={3}
                            questionId="703"
                          >
                            <QuestionOption
                              id="703_1"
                              name="703"
                              value="Less than 10 per day."
                              checked={
                                formData["703"] === "Less than 10 per day."
                              }
                              onChange={() =>
                                handleOptionSelect(
                                  "703",
                                  "Less than 10 per day."
                                )
                              }
                              type="radio"
                            />

                            <QuestionOption
                              id="703_2"
                              name="703"
                              value="10–20 per day."
                              checked={formData["703"] === "10–20 per day."}
                              onChange={() =>
                                handleOptionSelect("703", "10–20 per day.")
                              }
                              type="radio"
                            />

                            <QuestionOption
                              id="703_3"
                              name="703"
                              value="More than 20 per day."
                              checked={
                                formData["703"] === "More than 20 per day."
                              }
                              onChange={() =>
                                handleOptionSelect(
                                  "703",
                                  "More than 20 per day."
                                )
                              }
                              type="radio"
                            />
                          </QuestionLayout>
                        )}
                        {/* Question 4 - Difficulty refraining from smoking */}
                        {currentPage === 3 && (
                          <QuestionLayout
                            title={questionList[3].questionHeader}
                            currentPage={currentPage + 1}
                            pageNo={4}
                            questionId="707"
                          >
                            <QuestionOption
                              id="707_1"
                              name="707"
                              value="Yes"
                              checked={formData["707"] === "Yes"}
                              onChange={() => handleOptionSelect("707", "Yes")}
                              type="radio"
                            />

                            <QuestionOption
                              id="707_2"
                              name="707"
                              value="No"
                              checked={formData["707"] === "No"}
                              onChange={() => handleOptionSelect("707", "No")}
                              type="radio"
                            />
                          </QuestionLayout>
                        )}
                        {/* Question 5 - Side effects */}
                        {currentPage === 4 && (
                          <QuestionLayout
                            title={questionList[4].questionHeader}
                            currentPage={currentPage + 1}
                            pageNo={5}
                            questionId="704"
                          >
                            <QuestionOption
                              id="704_1"
                              name="704"
                              value="Yes"
                              checked={formData["704"] === "Yes"}
                              onChange={() =>
                                handleOptionSelect("704", "Yes", true)
                              }
                              type="radio"
                            />

                            {formData["704"] === "Yes" && (
                              <QuestionAdditionalInput
                                id="l-704_1-textarea"
                                name="l-704_1-textarea"
                                placeholder="Please provide details"
                                value={formData["l-704_1-textarea"] || ""}
                                onChange={(e) =>
                                  handleTextAreaChange(
                                    "l-704_1-textarea",
                                    e.target.value
                                  )
                                }
                                type="textarea"
                              />
                            )}

                            <QuestionOption
                              id="704_2"
                              name="704"
                              value="No"
                              checked={formData["704"] === "No"}
                              onChange={() => handleOptionSelect("704", "No")}
                              type="radio"
                            />

                            <QuestionOption
                              id="704_3"
                              name="704"
                              value="N/A"
                              checked={formData["704"] === "N/A"}
                              onChange={() => handleOptionSelect("704", "N/A")}
                              type="radio"
                            />
                          </QuestionLayout>
                        )}
                        {/* Question 6 - Goal */}
                        {currentPage === 5 && (
                          <QuestionLayout
                            title={questionList[5].questionHeader}
                            currentPage={currentPage + 1}
                            pageNo={6}
                            questionId="705"
                          >
                            <QuestionOption
                              id="705_1"
                              name="705"
                              value="Quit smoking entirely."
                              checked={
                                formData["705"] === "Quit smoking entirely."
                              }
                              onChange={() =>
                                handleOptionSelect(
                                  "705",
                                  "Quit smoking entirely."
                                )
                              }
                              type="radio"
                            />

                            <QuestionOption
                              id="705_2"
                              name="705"
                              value="Reduce daily tobacco usage."
                              checked={
                                formData["705"] ===
                                "Reduce daily tobacco usage."
                              }
                              onChange={() =>
                                handleOptionSelect(
                                  "705",
                                  "Reduce daily tobacco usage."
                                )
                              }
                              type="radio"
                            />

                            <QuestionOption
                              id="705_3"
                              name="705"
                              value="Other"
                              checked={formData["705"] === "Other"}
                              onChange={() =>
                                handleOptionSelect("705", "Other", true)
                              }
                              type="radio"
                            />

                            {formData["705"] === "Other" && (
                              <QuestionAdditionalInput
                                id="l-705_3-textarea"
                                name="l-705_3-textarea"
                                placeholder="Please provide details"
                                value={formData["l-705_3-textarea"] || ""}
                                onChange={(e) =>
                                  handleTextAreaChange(
                                    "l-705_3-textarea",
                                    e.target.value
                                  )
                                }
                                type="textarea"
                              />
                            )}
                          </QuestionLayout>
                        )}
                        {/* Question 7 - Habits */}
                        {currentPage === 6 && (
                          <QuestionLayout
                            title={questionList[6].questionHeader}
                            currentPage={currentPage + 1}
                            pageNo={7}
                            questionId="706"
                            inputType="checkbox"
                          >
                            <QuestionOption
                              id="706_1"
                              name="706_1"
                              value="I consume caffeinated beverages (e.g., coffee, tea, energy drinks)."
                              checked={!!formData["706_1"]}
                              onChange={() =>
                                handleMultiOptionSelect(
                                  "706",
                                  "I consume caffeinated beverages (e.g., coffee, tea, energy drinks).",
                                  0
                                )
                              }
                              type="checkbox"
                            />

                            <QuestionOption
                              id="706_2"
                              name="706_2"
                              value="I engage in regular physical activity or exercise."
                              checked={!!formData["706_2"]}
                              onChange={() =>
                                handleMultiOptionSelect(
                                  "706",
                                  "I engage in regular physical activity or exercise.",
                                  1
                                )
                              }
                              type="checkbox"
                            />

                            <QuestionOption
                              id="706_3"
                              name="706_3"
                              value="I consume alcohol."
                              checked={!!formData["706_3"]}
                              onChange={() =>
                                handleMultiOptionSelect(
                                  "706",
                                  "I consume alcohol.",
                                  2
                                )
                              }
                              type="checkbox"
                            />

                            <QuestionOption
                              id="706_4"
                              name="706_4"
                              value="None of the above."
                              checked={!!formData["706_4"]}
                              onChange={() =>
                                handleMultiOptionSelect(
                                  "706",
                                  "None of the above.",
                                  3
                                )
                              }
                              type="checkbox"
                              isNoneOption={true}
                            />
                          </QuestionLayout>
                        )}{" "}
                        {/* Photo ID Acknowledgment Page */}
                        {currentPage === 7 && (
                          <QuestionLayout
                            title="Identity Verification Required"
                            subtitle="Before we can complete your consultation, we need to verify your identity"
                            currentPage={currentPage + 1}
                            pageNo={8}
                            questionId="photo_id_acknowledgment"
                            inputType="checkbox"
                          >
                            <div className="w-full px-4 space-y-6">
                              <div className="text-center space-y-4">
                                <p className="text-md text-gray-700">
                                  Please note this step is mandatory. If you are
                                  unable to complete at this time, email your ID
                                  to{" "}
                                  <a
                                    className="text-gray-600 underline"
                                    href="mailto:clinicadmin@myrocky.com"
                                  >
                                    clinicadmin@myrocky.com
                                  </a>
                                  .
                                </p>
                                <p className="text-md text-gray-700">
                                  Your questionnaire will not be reviewed
                                  without this. As per our T&C's a{" "}
                                  <span className="font-medium">
                                    $45 cancellation fee
                                  </span>{" "}
                                  will be charged if we are unable to verify
                                  you.
                                </p>

                                <div className="flex items-center justify-center mt-6">
                                  <label className="flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={photoIdAcknowledged}
                                      onChange={(e) => {
                                        setPhotoIdAcknowledged(
                                          e.target.checked
                                        );
                                        const updates = {
                                          photo_id_acknowledgement: e.target
                                            .checked
                                            ? "1"
                                            : "",
                                        };
                                        updateFormDataAndStorage(updates);
                                      }}
                                      className="mr-3 h-4 w-4 text-[#AE7E56] focus:ring-[#AE7E56] border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">
                                      I acknowledge the ID verification
                                      requirement
                                    </span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          </QuestionLayout>
                        )}{" "}
                        {/* Photo ID Upload */}
                        {currentPage === 8 && (
                          <QuestionLayout
                            title="Verify your Identity"
                            subtitle="Take a picture of you holding your ID (health card or drivers license)"
                            currentPage={currentPage + 1}
                            pageNo={9}
                            questionId="photo_id"
                            inputType="upload"
                          >
                            <div className="w-full px-4 space-y-6">
                              <input
                                type="file"
                                ref={fileInputRef}
                                id="photo-id-file"
                                accept="image/jpeg,image/jpg,image/png"
                                className="hidden"
                                onChange={handlePhotoIdFileSelect}
                              />
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full border-2 border-gray-300 rounded-lg h-40 flex items-center justify-center cursor-pointer hover:bg-gray-50 overflow-hidden"
                              >
                                {!photoIdFile ? (
                                  <div className="flex flex-row items-center w-full justify-center px-4">
                                    <div className="w-14 h-14 md:w-20 md:h-20 flex items-center justify-center">
                                      <img
                                        src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/ID-icon.png"
                                        alt="ID"
                                        className="w-14 h-14 md:w-20 md:h-20"
                                      />
                                    </div>
                                    <span className="text-[#C19A6B] text-base md:text-lg ml-3 md:ml-5 break-words">
                                      Tap to upload the ID photo
                                    </span>
                                  </div>
                                ) : (
                                  <img
                                    id="photo-id-preview"
                                    src=""
                                    alt="ID Preview"
                                    className="max-w-full max-h-36 object-contain"
                                  />
                                )}
                              </div>{" "}
                              <div className="w-full max-w-md mx-auto">
                                {" "}
                                {photoIdFile ? (
                                  <div className="text-center text-xs text-gray-500 mb-4 px-2 overflow-hidden">
                                    <p
                                      className="break-words overflow-hidden whitespace-normal"
                                      style={{
                                        wordWrap: "break-word",
                                        overflowWrap: "anywhere",
                                      }}
                                    >
                                      Photo selected: {photoIdFile.name}
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <p className="text-center text-md font-medium mb-2">
                                      Please capture a selfie of yourself
                                      holding your ID
                                    </p>{" "}
                                    <p className="text-center text-sm text-gray-500 mb-8">
                                      Only JPG, JPEG, and PNG images are
                                      supported.
                                      <br />
                                      Max allowed file size per image is 20MB
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </QuestionLayout>
                        )}
                        <WarningPopup
                          isOpen={showNameDifferencePopup}
                          onClose={() => setShowNameDifferencePopup(false)}
                          title="Name Difference Detected"
                          message="The name you've entered is different from your account information."
                          showCheckbox={false}
                          showButton={false}
                          additionalContent={
                            <div className="w-full space-y-4 my-6">
                              <div
                                className="p-4 border-2 rounded-lg cursor-pointer hover:border-[#AE7E56] transition-all duration-300"
                                onClick={() => {
                                  setNameUpdateOption("update");
                                  setShowNameDifferencePopup(false);
                                  verifyCustomerAndProceed();
                                }}
                              >
                                <p className="font-medium text-lg">
                                  Update my legal name
                                </p>
                                <p className="text-sm text-gray-500">
                                  Your account information will be updated with
                                  your new legal name.
                                </p>
                              </div>

                              <div
                                className="p-4 border-2 rounded-lg cursor-pointer hover:border-[#AE7E56] transition-all duration-300"
                                onClick={() => {
                                  setNameUpdateOption("someone_else");
                                  setShowNameDifferencePopup(false);
                                  verifyCustomerAndProceed();
                                }}
                              >
                                <p className="font-medium text-lg">
                                  I'm ordering for someone else
                                </p>
                                <p className="text-sm text-gray-500">
                                  The prescription will be issued for this
                                  person instead of you.
                                </p>
                              </div>
                            </div>
                          }
                        />{" "}
                        {/* Thank You Page */}
                        {currentPage === questionList.length + 2 && (
                          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                            <h1 className="text-3xl font-bold text-[#AE7E56] mb-4">
                              Thank You!
                            </h1>
                            <p className="text-lg mb-6">
                              Your information has been submitted successfully.
                              Our healthcare provider will review your answers
                              and contact you shortly.
                            </p>
                            {/* Remove the button from here as we'll show it in the fixed bottom bar */}
                          </div>
                        )}
                        <div className="mb-28">
                          <p className="error-box text-red-500 hidden m-2  text-center text-sm"></p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
              </form>

              <div className="fixed bottom-0 left-0 w-full p-4 z-[1] bg-white shadow-lg flex items-center justify-center">
                {currentPage === questionList.length + 2 ? (
                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="bg-black text-white w-full max-w-md py-4 px-4 rounded-full font-medium text-lg"
                  >
                    Return to Home
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleContinueClick}
                    className="bg-black text-white w-full max-w-md py-4 px-4 rounded-full font-medium text-lg quiz-continue-button"
                    style={{
                      visibility:
                        currentPage > questionList.length + 1 ? "hidden" : "",
                      opacity:
                        (currentPage === 8 && !photoIdFile) || isUploading
                          ? "0.5"
                          : "1",
                    }}
                    disabled={
                      (currentPage === 8 && !photoIdFile) || isUploading
                    }
                  >
                    {currentPage === 8 && photoIdFile ? (
                      isUploading ? (
                        <span className="flex items-center justify-center">
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </span>
                      ) : (
                        "Upload and Finish"
                      )
                    ) : (
                      "Continue"
                    )}
                  </button>
                )}{" "}
              </div>
            </div>
          </div>

          {/* High BP Warning Popup */}
          {showHighBpWarning && (
            <WarningPopup
              isOpen={showHighBpWarning}
              onClose={() => setShowHighBpWarning(false)}
              title="Very High!"
              message="This is considered high, we'll be able to give you your prescription but please speak to your doctor to discuss your blood pressure."
              isAcknowledged={warningAcknowledged}
              onAcknowledge={(e) => setWarningAcknowledged(e.target.checked)}
              buttonText="Continue"
              backgroundColor="bg-white"
              titleColor="text-[#AE7E56]"
            />
          )}

          {/* Very High BP Warning Popup */}
          {showVeryHighBpWarning && (
            <WarningPopup
              isOpen={showVeryHighBpWarning}
              onClose={() => setShowVeryHighBpWarning(false)}
              title="Very High!"
              message="This is considered very high and we would not be able to provide you with a prescription today. We strongly advise you seek immediate medical attention."
              showCheckbox={false}
              buttonText="Back"
              backgroundColor="bg-white"
              titleColor="text-[#AE7E56]"
            />
          )}

          {/* Unknown BP Warning Popup */}
          {showUnknownBpWarning && (
            <WarningPopup
              isOpen={showUnknownBpWarning}
              onClose={() => setShowUnknownBpWarning(false)}
              title="Ohh.. no :("
              message="Unfortunately it would not be safe to give you a prescription without knowing your blood pressure."
              showCheckbox={false}
              buttonText="Back"
              backgroundColor="bg-white"
              titleColor="text-[#AE7E56]"
            />
          )}

          {/* Photo ID Popup */}
          <WarningPopup
            isOpen={showPhotoIdPopup}
            onClose={() => {
              if (photoIdAcknowledged) {
                setShowPhotoIdPopup(false);
                moveToNextSlideWithoutValidation();
              }
            }}
            title="Upload Photo ID"
            message={
              <>
                <p className="mb-5 text-md text-left">
                  Please note this step is mandatory. If you are unable to
                  complete at this time, email your ID to{" "}
                  <a
                    className="text-gray-600 underline"
                    href="mailto:clinicadmin@myrocky.com"
                  >
                    clinicadmin@myrocky.com
                  </a>
                  .
                </p>
                <p className="mb-5 text-md text-left">
                  Your questionnaire will not be reviewed without this. As per
                  our T&C's a{" "}
                  <span className="font-medium">$45 cancellation fee</span> will
                  be charged if we are unable to verify you.
                </p>
              </>
            }
            isAcknowledged={photoIdAcknowledged}
            onAcknowledge={(e) => setPhotoIdAcknowledged(e.target.checked)}
            buttonText="I Acknowledge"
            backgroundColor="bg-white"
            titleColor="text-[#AE7E56]"
          />
        </>
      )}

      {/* Loader Overlay */}
      <div
        id="please-wait-loader-overlay"
        className="hidden"
        style={{
          height: "100%",
          width: "100%",
          position: "fixed",
          top: 0,
          left: 0,
          background: "rgba(255,255,255,0.9)",
          zIndex: 9999,
        }}
      >
        <p
          className="text-center p-5 pb-[100px]"
          style={{ position: "relative", top: "25%" }}
        >
          <img
            src={`${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/preloader-wheel.svg`}
            className="block w-[100px] h-auto m-auto pt-6"
            style={{ marginBottom: "10px" }}
            alt="Preloader Wheel"
          />
          {uploadProgress === 0
            ? "Preparing upload..."
            : `${uploadProgress}% uploaded`}
          <br />
          <small style={{ color: "#999", letterSpacing: 0 }}>
            If this takes longer than 20 seconds, please refresh the page.
          </small>
        </p>
      </div>
    </div>
  );
}
