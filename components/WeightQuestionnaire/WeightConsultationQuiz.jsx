"use client";

import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter } from "next/navigation";
import { WarningPopup } from "../EdQuestionnaire/WarningPopup";
import { QuestionLayout } from "../EdQuestionnaire/QuestionLayout";
import { QuestionOption } from "../EdQuestionnaire/QuestionOption";
import { QuestionAdditionalInput } from "../EdQuestionnaire/QuestionAdditionalInput";
import { motion, AnimatePresence } from "framer-motion";
import QuestionnaireNavbar from "../EdQuestionnaire/QuestionnaireNavbar";
import { ProgressBar } from "../EdQuestionnaire/ProgressBar";
import Logo from "../Navbar/Logo";
import Link from "next/link";
import BMICalculatorStep from "../WLPreConsultationQuiz/steps/BMICalculatorStep";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";

const SINGLE_CHOICE_PAGES = [1, 2, 3, 7, 10, 11, 12, 14];

export default function WeightLossConsultationQuiz({
  pn,
  userName,
  userEmail,
  province,
  dob,
}) {
  const getInitialFormData = () => {
    if (typeof window !== "undefined") {
      try {
        const now = new Date();
        const ttl = localStorage.getItem("wl-quiz-form-expiry");
        if (ttl && now.getTime() < parseInt(ttl)) {
          const stored = localStorage.getItem("wl-quiz-form");
          if (stored) {
            return JSON.parse(stored);
          }
        }
      } catch (e) {
        logger.error("Error loading form data from localStorage:", e);
      }
    }
    const nameParts = userName ? userName.split(" ") : [];
    const fname = nameParts[0] || "";
    const lname = nameParts[1] || "";
    return {
      form_id: 6,
      action: "wl_questionnaire_data_upload",
      entrykey: "",
      id: "",
      token: "",
      stage: "consultation-before-checkout",
      page_step: 1,
      completion_state: "Partial",
      completion_percentage: 0,
      source_site: "https://myrocky.com",
      "130_3": fname || "",
      "130_6": lname || "",
      131: userEmail || "@w3mg.in",
      132: pn || "",
      158: dob || "",
      "161_4": province || "",
      wl_weight: "",
      wl_height: "",
      wl_BMI: "",
      601: "",
      602: "",
      603: "",
      "604_1": "",
      "604_2": "",
      "604_3": "",
      "604_4": "",
      "604_5": "",
      "604_6": "",
      "l-604_6-textarea": "",
      617: "",
      "l-617_1-textarea": "",
      618_1: "",
      618_2: "",
      618_3: "",
      619: "",
      605: "",
      "605-textarea": "",
      606: "",
      607: "",
      "l-607_5-textarea": "",
      608: "",
      "608-textarea": "",
      "607_1": "",
      "607_2": "",
      "607_3": "",
      "607_4": "",
      "607_5": "",
      "607_6": "",
      "l-607_5-textarea": "",
      "608_1": "",
      "608_2": "",
      "608_3": "",
      "608_4": "",
      "608_5": "",
      "608_6": "",
      "608_7": "",
      "608_8": "",
      "608_9": "",
      "608_11": "",
      "l-608_1-textarea": "",
      "l-608_3-textarea": "",
      "l-608_4-textarea": "",
      "l-608_5-textarea": "",
      "l-608_6-textarea": "",
      "l-608_7-textarea": "",
      "l-608_8-textarea": "",
      "l-608_9-textarea": "",
      609: "",
      610: "",
      611: "",
      "612_1": "",
      "612_2": "",
      "612_3": "",
      "612_4": "",
      "l-612_4-textarea": "",
      "613_1": "",
      "613_2": "",
      "613_3": "",
      "613_4": "",
      "613_5": "",
      "613_6": "",
      "613_7": "",
      "613_8": "",
      "613_9": "",
      "613_10": "",
      "613_11": "",
      "613_12": "",
      "l-613_5-textarea": "",
      "l-613_7-textarea": "",
      "l-613_10-textarea": "",
      "l-613_11-textarea": "",
      "621_1": "",
      "621_2": "",
      "621_3": "",
      "621_4": "",
      "622_1": "",
      "622_2": "",
      "622_3": "",
      "622_4": "",
      "623_1": "",
      "623_2": "",
      "623_3": "",
      "623_4": "",
      "624_1": "",
      "624_2": "",
      "624_3": "",
      "624_4": "",
      "624_5": "",
      "624_6": "",
      614: "",
      "l-614_1-textarea": "",
      "615_1": "",
      "615_2": "",
      "615_3": "",
      "615_4": "",
      "615_5": "",
      "l-615_2-textarea": "",
      "l-615_3-textarea": "",
      616: "",
      "616-textarea": "",
      620: "",
      197: "",
      198: "",
      wp_order_id: "",
      product_name: "",
      pre_quiz_q1: "",
      pre_quiz_q2: "",
      pre_quiz_q3: "",
      pre_quiz_q4: "",
      pre_quiz_q5: "",
    };
  };

  const nameParts = userName ? userName.split(" ") : [];
  const fname = nameParts[0] || "";
  const lname = nameParts[1] || "";
  const router = useRouter();
  const formRef = useRef(null);

  const [nameUpdateOption, setNameUpdateOption] = useState("");
  const [showPhotoIdPopup, setShowPhotoIdPopup] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [frontPhotoFile, setFrontPhotoFile] = useState(null);
  const [sidePhotoFile, setSidePhotoFile] = useState(null);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    front: 0,
    side: 0,
    id: 0,
  });
  const frontPhotoInputRef = useRef(null);
  const sidePhotoInputRef = useRef(null);
  const [photoIdFile, setPhotoIdFile] = useState(null);
  const [isMovingForward, setIsMovingForward] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useQuestionnaireStepTracking({
    questionnaireId: "weight-consultation",
    stepId: currentPage,
    stepIndex: currentPage,
    flowId: "weight-loss",
    stepType: "quiz",
  });

  const [progress, setProgress] = useState(0);
  const [photoIdAcknowledged, setPhotoIdAcknowledged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [frontUploadProgress, setFrontUploadProgress] = useState(0);
  const [sideUploadProgress, setSideUploadProgress] = useState(0);
  const [idUploadProgress, setIdUploadProgress] = useState(0);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const fileInputRef = useRef(null);
  const [showHighBpWarning, setShowHighBpWarning] = useState(false);
  const [showVeryHighBpWarning, setShowVeryHighBpWarning] = useState(false);
  const [showUnknownBpWarning, setShowUnknownBpWarning] = useState(false);
  const [bpWarningAcknowledged, setBpWarningAcknowledged] = useState(false);
  const [buttonState, setButtonState] = useState({
    visible: false,
    disabled: false,
    opacity: 1,
  });
  const [question1ButtonVisible, setQuestion1ButtonVisible] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [isHandlingPopState, setIsHandlingPopState] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showBMICalculator, setShowBMICalculator] = useState(false);
  const [bmiUserData, setBmiUserData] = useState({
    weight: "",
    height: { feet: "", inches: "" },
    bmi: "",
  });
  const [bmiValidationState, setBmiValidationState] = useState({
    bmiContinueEnabled: false,
  });
  const [
    showNoAppointmentAcknowledgement,
    setShowNoAppointmentAcknowledgement,
  ] = useState(false);
  const [noAppointmentAcknowledged, setNoAppointmentAcknowledged] =
    useState(false);
  const [formData, setFormData] = useState(getInitialFormData());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

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
  const handleTextInputChange = (fieldKey, e) => {
    const value = e.target.value;

    const updatedFormData = {
      ...formData,
      [fieldKey]: value,
    };

    setFormData(updatedFormData);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = value.trim() !== "" ? "" : "hidden";
    }

    setTimeout(() => {
      updateLocalStorage(updatedFormData);
      queueFormSubmission(updatedFormData);
    }, 100);
  };

  useEffect(() => {
    const processQueue = async () => {
      if (pendingSubmissions.length === 0 || isSyncing) return;

      setIsSyncing(true);

      try {
        const submission = pendingSubmissions[0];
        await submitFormData(submission.data);

        setPendingSubmissions((prev) => prev.slice(1));
      } catch (error) {
        logger.error("Background sync error:", error);
        setPendingSubmissions((prev) => prev.slice(1));
      } finally {
        setIsSyncing(false);
      }
    };

    processQueue();
  }, [pendingSubmissions, isSyncing]);
  const queueFormSubmission = (data) => {
    setPendingSubmissions((prev) => [...prev, { data, timestamp: Date.now() }]);
  };

  const useDebounce = (callback, delay) => {
    const timeoutRef = useRef(null);

    return (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    };
  };

  const debouncedQueueSubmission = useDebounce((data) => {
    queueFormSubmission(data);
  }, 1000);
  const checkBMIDataExists = (dataToCheck = formData) => {
    const hasFormDataBMI =
      dataToCheck.wl_BMI && dataToCheck.wl_height && dataToCheck.wl_weight;

    if (hasFormDataBMI) {
      return true;
    }

    let hasStoredBMI = false;
    try {
      const storedWeightData = localStorage.getItem("wl_flow2_quiz_data");
      if (storedWeightData) {
        const weightData = JSON.parse(storedWeightData);
        hasStoredBMI = !!(
          weightData.userData?.bmi &&
          weightData.userData?.weight &&
          weightData.userData?.height?.feet &&
          weightData.userData?.height?.inches
        );
      }
    } catch (error) {
      logger.error("Error checking stored BMI data:", error);
    }

    if (hasStoredBMI) {
      return true;
    }

    try {
      const essentialConsulData = localStorage.getItem("essential-consul");
      if (essentialConsulData) {
        const parsed = JSON.parse(essentialConsulData);
        const hasEssentialConsulBMI = !!(
          parsed.weight &&
          parsed.height &&
          parsed.height.feet &&
          parsed.height.inches !== undefined &&
          parsed.bmi
        );
        if (hasEssentialConsulBMI) {
          return true;
        }
      }
    } catch (error) {
      logger.error("Error checking essential-consul BMI data:", error);
    }

    return false;
  };

  const handleBMIComplete = () => {
    const bmiData = bmiUserData;

    setFormData((prev) => ({
      ...prev,
      wl_weight: `${bmiData.weight} lbs`,
      wl_height: `${bmiData.height.feet}ft ${bmiData.height.inches}in`,
      wl_BMI: bmiData.bmi,
    }));

    try {
      const existingData = JSON.parse(
        localStorage.getItem("wl_pre_quiz_data") || "{}"
      );

      const quizData = {
        ...existingData,
        weightPounds: bmiData.weight,
        feetValue: bmiData.height.feet,
        inchesValue: bmiData.height.inches,
        bmi_result: bmiData.bmi,
      };
      localStorage.setItem("wl_pre_quiz_data", JSON.stringify(quizData));
    } catch (error) {
      logger.error("Error storing BMI data:", error);
    }

    setShowBMICalculator(false);
    setCurrentPage(1);
  };

  const updateContinueButtonState = (show = true) => {
    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      if (show) {
        continueButton.style.display = "block";
        continueButton.style.visibility = "visible";
        continueButton.disabled = false;
      } else {
        continueButton.style.visibility = "hidden";
        continueButton.disabled = true;
      }
    }
  };

  const extractPreQuizAttributes = (essentialConsulData) => {
    const attributes = {};
    
    if (essentialConsulData.accomplishment) {
      if (Array.isArray(essentialConsulData.accomplishment)) {
        attributes.accomplishment = essentialConsulData.accomplishment.join(", ");
      } else if (typeof essentialConsulData.accomplishment === "string") {
        attributes.accomplishment = essentialConsulData.accomplishment;
      }
    }
    
    if (essentialConsulData.pregnantOrbreastfeeding) {
      attributes.pregnantOrbreastfeeding = essentialConsulData.pregnantOrbreastfeeding;
    }
    
    if (essentialConsulData.weightImpactStatements) {
      if (Array.isArray(essentialConsulData.weightImpactStatements)) {
        attributes.weightImpactStatements = essentialConsulData.weightImpactStatements.join(", ");
      } else if (typeof essentialConsulData.weightImpactStatements === "string") {
        attributes.weightImpactStatements = essentialConsulData.weightImpactStatements;
      }
    }
    
    if (essentialConsulData.medications) {
      attributes.medications = essentialConsulData.medications;
    } else if (essentialConsulData.medicalConditions) {
      attributes.medications = essentialConsulData.medicalConditions;
    }
    
    if (essentialConsulData.eatingDisorderDiagnosis) {
      attributes.eatingDisorderDiagnosis = essentialConsulData.eatingDisorderDiagnosis;
    }
    
    return attributes;
  };

  const mergeEssentialConsulData = (formDataToMerge) => {
    try {
      const essentialConsulData = localStorage.getItem("essential-consul");
      if (essentialConsulData) {
        const parsed = JSON.parse(essentialConsulData);
        const merged = { ...formDataToMerge };
        if (parsed["601"] && !merged["601"]) {
          merged["601"] = parsed["601"];
        }
        if (parsed["602"] && !merged["602"]) {
          merged["602"] = parsed["602"];
        }
        if (parsed["603"] && !merged["603"]) {
          merged["603"] = parsed["603"];
        }
        
        if (parsed.weight && parsed.height && parsed.bmi) {
          const weight = parsed.weight;
          const height = parsed.height;
          const bmi = parsed.bmi;
          
          if (!merged.wl_weight && weight) {
            merged.wl_weight = `${weight} lbs`;
          }
          
          if (!merged.wl_height && height && height.feet && height.inches !== undefined) {
            merged.wl_height = `${height.feet}ft ${height.inches}in`;
          }
          
          if (!merged.wl_BMI && bmi) {
            merged.wl_BMI = typeof bmi === "number" ? bmi.toString() : bmi;
          }
        }
        
        const preQuizAttributes = extractPreQuizAttributes(parsed);
        Object.assign(merged, preQuizAttributes);
        
        if (Object.keys(preQuizAttributes).length > 0) {
          try {
            const existingAttributes = localStorage.getItem("wl_pre_quiz_attributes");
            const storedAttributes = existingAttributes ? JSON.parse(existingAttributes) : {};
            const updatedAttributes = { ...storedAttributes, ...preQuizAttributes };
            localStorage.setItem("wl_pre_quiz_attributes", JSON.stringify(updatedAttributes));
          } catch (storageError) {
            logger.error("Error storing pre-quiz attributes:", storageError);
          }
        }
        
        return merged;
      }
    } catch (error) {
      logger.error("Error reading essential-consul data:", error);
    }
    return formDataToMerge;
  };

  useEffect(() => {
    const initializeForm = async () => {
      try {
        const storedData = readLocalStorage();
        let storedQuizData = null;

        if (storedData) {
          try {
            storedQuizData = JSON.parse(storedData);
          } catch (error) {
            logger.error("Error parsing stored quiz data:", error);
          }
        } else {
        }

        const response = await fetch("/api/wl");
        const data = await response.json();
        const serverEntrykey = data.entrykey;

        if (storedQuizData) {
          let updatedFormData = {
            ...storedQuizData,
            entrykey: storedQuizData.entrykey || serverEntrykey,
          };

          updatedFormData = mergeEssentialConsulData(updatedFormData);

          setFormData(updatedFormData);

          if (updatedFormData._ui) {
            setButtonState((state) => ({
              ...state,
              visible: true,
              disabled: false,
              opacity: 1,
            }));
            if (updatedFormData._ui.currentPage) {
              setCurrentPage(updatedFormData._ui.currentPage);
            }
          }

          if (updatedFormData.page_step) {
            const storedPage = parseInt(updatedFormData.page_step);

            if (!checkBMIDataExists(updatedFormData)) {
              setShowBMICalculator(true);
              return;
            }

            if (updatedFormData.completion_state === "Full") {
              const hasFrontPhoto =
                updatedFormData["197"] && updatedFormData["197"].trim() !== "";
              const hasSidePhoto =
                updatedFormData["198"] && updatedFormData["198"].trim() !== "";
              const hasPhotoId =
                updatedFormData["196"] && updatedFormData["196"].trim() !== "";

              if (hasFrontPhoto && hasSidePhoto && hasPhotoId) {
                setCurrentPage(23);
                setProgress(100);
                setFormData((prev) => ({
                  ...prev,
                  page_step: 23,
                }));
              } else {
                setCurrentPage(21);
                const newProgress = Math.ceil((21 / 26) * 100);
                setProgress(newProgress);
                setFormData((prev) => ({
                  ...prev,
                  page_step: 21,
                }));
              }
            } else {
              setCurrentPage(storedPage);
              const calculatedProgress = Math.max(
                0,
                Math.ceil((storedPage / 26) * 100)
              );
              setProgress(calculatedProgress);
            }

            const singleChoicePages = [1, 2, 3, 7, 10, 11, 12, 14];
            if (singleChoicePages.includes(storedPage)) {
              const hasAnswer = (() => {
                switch (storedPage) {
                  case 1:
                    return !!updatedFormData["601"];
                  case 2:
                    return !!updatedFormData["602"];
                  case 3:
                    return !!updatedFormData["603"];
                  case 7:
                    return !!updatedFormData["606"];
                  case 10:
                    return !!updatedFormData["609"];
                  case 11:
                    return !!updatedFormData["610"];
                  case 12:
                    return !!updatedFormData["611"];
                  case 14:
                    return !!updatedFormData["620"];
                  default:
                    return false;
                }
              })();
              setTimeout(() => updateContinueButtonState(hasAnswer), 100);
            }
          }
        } else {
          let initialFormData = {};
          if (serverEntrykey) {
            initialFormData.entrykey = serverEntrykey;
          }

          initialFormData = mergeEssentialConsulData(initialFormData);

          setFormData((prev) => ({
            ...prev,
            ...initialFormData,
          }));

          if (!checkBMIDataExists(initialFormData)) {
            setShowBMICalculator(true);
            return;
          }
        }
      } catch (error) {
        logger.error("Error initializing form:", error);

        let fallbackFormData = getInitialFormData();
        fallbackFormData = mergeEssentialConsulData(fallbackFormData);
        
        if (!checkBMIDataExists(fallbackFormData)) {
          setShowBMICalculator(true);
          return;
        }

        const storedData = readLocalStorage();
        if (!storedData) return;

        try {
          let quizFormData = JSON.parse(storedData);
          quizFormData = mergeEssentialConsulData(quizFormData);
          setFormData(quizFormData);
          
          if (!checkBMIDataExists(quizFormData)) {
            setShowBMICalculator(true);
            return;
          }

          if (!quizFormData.page_step) return;

          const storedPage = parseInt(quizFormData.page_step);
          if (quizFormData.completion_state === "Full") {
            const hasFrontPhoto =
              quizFormData["197"] && quizFormData["197"].trim() !== "";
            const hasSidePhoto =
              quizFormData["198"] && quizFormData["198"].trim() !== "";
            const hasPhotoId =
              quizFormData["196"] && quizFormData["196"].trim() !== "";

            if (hasFrontPhoto && hasSidePhoto && hasPhotoId) {
              setCurrentPage(23);
              setProgress(100);
              setFormData((prev) => ({
                ...prev,
                page_step: 23,
              }));
            } else {
              setCurrentPage(21);
              const newProgress = Math.ceil((21 / 26) * 100);
              setProgress(newProgress);
              setFormData((prev) => ({
                ...prev,
                page_step: 21,
              }));
            }
          } else {
            setCurrentPage(storedPage);
            const calculatedProgress = Math.max(
              0,
              Math.ceil((storedPage / 26) * 100)
            );
            setProgress(calculatedProgress);
          }
        } catch (error) {
          logger.error("Error parsing stored quiz data:", error);
        }
      }
    };

    initializeForm();
    try {
      let storedWeightData = localStorage.getItem("wl_pre_quiz_data");
      if (storedWeightData) {
        const weightData = JSON.parse(storedWeightData);

        setBmiUserData({
          weight: weightData.weightPounds || "",
          height: {
            feet: weightData.feetValue || "",
            inches: weightData.inchesValue || "",
          },
          bmi: weightData.bmi_result || "",
        });

        if (weightData.weightPounds) {
          setFormData((prev) => ({
            ...prev,
            wl_weight: `${weightData.weightPounds} lbs`,
          }));
        }

        if (weightData.feetValue && weightData.inchesValue) {
          setFormData((prev) => ({
            ...prev,
            wl_height: `${weightData.feetValue}ft ${weightData.inchesValue}in`,
          }));
        }

        if (weightData.bmi_result) {
          setFormData((prev) => ({
            ...prev,
            wl_BMI: weightData.bmi_result,
          }));
        }

        if (weightData.pre_quiz_q1) {
          setFormData((prev) => ({
            ...prev,
            pre_quiz_q1: weightData.pre_quiz_q1,
          }));
        }

        if (weightData.pre_quiz_q2) {
          setFormData((prev) => ({
            ...prev,
            pre_quiz_q2: weightData.pre_quiz_q2,
          }));
        }

        if (weightData.pre_quiz_q3) {
          setFormData((prev) => ({
            ...prev,
            pre_quiz_q3: weightData.pre_quiz_q3,
          }));
        }

        if (weightData.pre_quiz_q4) {
          setFormData((prev) => ({
            ...prev,
            pre_quiz_q4: weightData.pre_quiz_q4,
          }));
        }

        if (weightData.pre_quiz_q5) {
          setFormData((prev) => ({
            ...prev,
            pre_quiz_q5: weightData.pre_quiz_q5,
          }));
        }
      }
    } catch (error) {
      logger.error("Error loading weight data:", error);
    }
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return e.returnValue;
    };

    const isThankYouPage = currentPage === 23 && formData.completion_state === "Full";
    
    if (currentPage >= 1 && currentPage <= 26 && !isThankYouPage) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentPage, formData.completion_state]);

  useEffect(() => {
    try {
      let storedWeightData = localStorage.getItem("wl_pre_quiz_data");
      if (storedWeightData) {
        const weightData = JSON.parse(storedWeightData);

        if (weightData.weightPounds) {
          setFormData((prev) => ({
            ...prev,
            wl_weight: `${weightData.weightPounds} lbs`,
          }));
        }

        if (weightData.feetValue && weightData.inchesValue) {
          setFormData((prev) => ({
            ...prev,
            wl_height: `${weightData.feetValue}ft ${weightData.inchesValue}in`,
          }));
        }

        if (weightData.bmi_result) {
          setFormData((prev) => ({
            ...prev,
            wl_BMI: weightData.bmi_result,
          }));
        }

        if (weightData.pre_quiz_q1) {
          setFormData((prev) => ({
            ...prev,
            pre_quiz_q1: weightData.pre_quiz_q1,
          }));
        }

        if (weightData.pre_quiz_q2) {
          setFormData((prev) => ({
            ...prev,
            pre_quiz_q2: weightData.pre_quiz_q2,
          }));
        }

        if (weightData.pre_quiz_q3) {
          setFormData((prev) => ({
            ...prev,
            pre_quiz_q3: weightData.pre_quiz_q3,
          }));
        }

        if (weightData.pre_quiz_q4) {
          setFormData((prev) => ({
            ...prev,
            pre_quiz_q4: weightData.pre_quiz_q4,
          }));
        }

        if (weightData.pre_quiz_q5) {
          setFormData((prev) => ({
            ...prev,
            pre_quiz_q5: weightData.pre_quiz_q5,
          }));
        }
      }
    } catch (error) {
      logger.error("Error loading weight data:", error);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedData = readLocalStorage();
      if (!storedData) {
        const initialData = getInitialFormData();
        updateLocalStorage(initialData);
        logger.log("Weight quiz: Initial form data saved to localStorage");
      }
      
      try {
        const storedAttributes = localStorage.getItem("wl_pre_quiz_attributes");
        if (storedAttributes) {
          const attributes = JSON.parse(storedAttributes);
          setFormData((prev) => ({
            ...prev,
            ...attributes,
          }));
        }
      } catch (error) {
        logger.error("Error loading pre-quiz attributes from localStorage:", error);
      }
    }
  }, []);

  const sanitizeProductName = (productName) => {
    if (!productName) return "";

    return productName
      .replace(/[^\w\s-]/g, "")
      .toLowerCase()
      .trim();
  };

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    const orderId = searchParams.get("order-id");
    const purchasedProduct = searchParams.get("purchased_product");

    if (orderId || purchasedProduct) {
      logger.log("Extracted URL parameters:", { orderId, purchasedProduct });

      const urlParamUpdates = {};

      if (orderId) {
        urlParamUpdates.wp_order_id = orderId;
      }

      if (purchasedProduct) {
        const decodedProduct = decodeURIComponent(purchasedProduct);
        urlParamUpdates.product_name = sanitizeProductName(decodedProduct);
        logger.log("Sanitized product name:", {
          original: decodedProduct,
          sanitized: urlParamUpdates.product_name,
        });
      }

      setFormData((prev) => ({
        ...prev,
        ...urlParamUpdates,
      }));

      updateLocalStorage({
        ...formData,
        ...urlParamUpdates,
      });

      logger.log("Updated form data with URL parameters:", urlParamUpdates);
    }
  }, []);

  useEffect(() => {
    if (!formRef.current) return;

    const backButton = formRef.current.querySelector(".quiz-back-button");
    if (backButton) {
      if (currentPage > 1) {
        backButton.classList.remove("hidden");
      } else {
        backButton.classList.add("hidden");
      }
    }

    const continueButton = formRef.current.querySelector(
      ".quiz-continue-button"
    );
    if (!continueButton) return;
    continueButton.style.display = "block";

    const singleChoicePages = [1, 2, 3, 7, 10, 11, 12, 14];

    const isRadioAnswered = () => {
      switch (currentPage) {
        case 1:
          return !!formData["601"];
        case 2:
          return !!formData["602"];
        case 3:
          return !!formData["603"];
        case 7:
          return !!formData["606"];
        case 10:
          return !!formData["609"];
        case 11:
          return !!formData["610"];
        case 12:
          return !!formData["611"];
        case 14:
          return !!formData["620"];
        default:
          return false;
      }
    };

    const isRadioPage = singleChoicePages.includes(currentPage);

    if (isRadioPage) {
      const hasAnswer = isRadioAnswered();
      if (currentPage === 1) {
        setQuestion1ButtonVisible(hasAnswer);
      } else {
        continueButton.style.visibility = hasAnswer ? "visible" : "hidden";
      }
    } else {
      const showButton = () => {
        switch (currentPage) {
          case 4:
            const hasSelection = [
              "604_1",
              "604_2",
              "604_3",
              "604_4",
              "604_5",
              "604_6",
            ].some((id) => formData[id]);

            const needsTextarea =
              formData["604_6"] === "Other" && !formData["l-604_6-textarea"];
            return hasSelection && !needsTextarea;
          default:
            return true;
        }
      };

      continueButton.style.visibility = showButton() ? "visible" : "hidden";
    }

    if (currentPage === 24) {
      continueButton.disabled = !photoIdAcknowledged;
      continueButton.style.opacity = photoIdAcknowledged ? "1" : "0.5";
    } else if (currentPage === 25) {
      const isReady = (photoIdFile && !isUploading) || !!formData["196"];
      continueButton.disabled = !isReady;
      continueButton.style.opacity = isReady ? "1" : "0.5";
    } else if (currentPage === 26) {
      if (frontPhotoFile && sidePhotoFile) {
        const uploadButton = document.querySelector(".upload-button");
        if (uploadButton) {
          uploadButton.classList.remove("hidden");
        }
      }
    }
  }, [
    currentPage,
    formData,
    photoIdAcknowledged,
    photoIdFile,
    isUploading,
    frontPhotoFile,
    sidePhotoFile,
  ]);

  const moveToNextSlideWithoutValidation = () => {
    setIsMovingForward(true);
    let nextPage = currentPage + 1;
    let navigationType = "";

    if (currentPage === 1 && formData["601"] === "Yes") {
      nextPage = 4;
      navigationType = "from_current_medication_yes";
    } else if (currentPage === 2 && formData["602"] === "Yes") {
      nextPage = 4;
      navigationType = "from_previous_medication_yes";
    } else if (currentPage === 3) {
      nextPage = 5;
    }

    if (nextPage < 1) nextPage = 1;
    if (nextPage > 26) nextPage = 26;

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        page_step: nextPage,
        navigation_type: navigationType || prev.navigation_type,
      };

      updateLocalStorage(updatedFormData);
      return updatedFormData;
    });
    const newProgress = Math.ceil((nextPage / 26) * 100);
    setProgress(Math.max(0, newProgress));

    setCurrentPage(nextPage);
  };

  const readLocalStorage = () => {
    if (typeof window !== "undefined") {
      const now = new Date();
      const ttl = localStorage.getItem("wl-quiz-form-expiry");

      if (ttl && now.getTime() < parseInt(ttl)) {
        return localStorage.getItem("wl-quiz-form");
      } else {
        localStorage.removeItem("wl-quiz-form");
        localStorage.removeItem("wl-quiz-form-expiry");
      }
    }
    return null;
  };

  useEffect(() => {
    if (currentPage === 24) {
      const continueButton = document.querySelector(".quiz-continue-button");
      if (continueButton) {
        continueButton.style.visibility = "hidden";
      }

      if (frontPhotoFile && sidePhotoFile) {
        const uploadButton = document.querySelector(".upload-button");
        if (uploadButton) {
          uploadButton.classList.remove("hidden");
        }
      }
    }
  }, [currentPage, frontPhotoFile, sidePhotoFile]);

  const handleFrontPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      document.getElementById("frontPhotoPreview").src =
        "https://myrocky.com/wp-content/themes/salient-child/img/photo_upload_icon.png";
      setFrontPhotoFile(null);
      toggleUploadButton();
      return false;
    }

    setFrontPhotoFile(file);

    const updateUI = (previewSrc) => {
      document.querySelector("label[for=front_photo_upload]").innerHTML = `
        <div class="flex w-full flex-col">
          <div class="flex items-center mb-2">
            <img
              class="w-16 h-16 object-contain mr-4 flex-shrink-0"
              src="${previewSrc}"
              id="frontPhotoPreview"
              alt="Upload icon"
            />
            <div class="flex-1 min-w-0">
              <div class="break-words text-[#C19A6B]">
                ${file.name}
                <span class="text-xs block font-light text-gray-400 mt-1">Tap again to change</span>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    const reader = new FileReader();
    reader.onload = function (e) {
      const previewSrc = e.target?.result;
      updateUI(previewSrc);
      const preview = document.getElementById("frontPhotoPreview");
      if (preview) {
        preview.src = previewSrc;
      }
    };
    reader.readAsDataURL(file);

    if (file && sidePhotoFile) {
      const uploadButton = document.querySelector(".upload-button");
      if (uploadButton) {
        uploadButton.classList.remove("hidden");
      }
      setButtonState((state) => ({
        ...state,
        visible: true,
      }));
    }
  };

  const showLoader = () => {
    const loader = document.getElementById("please-wait-loader-overlay");
    if (loader) {
      loader.classList.remove("hidden");
    }
  };

  const hideLoader = () => {
    const loader = document.getElementById("please-wait-loader-overlay");
    if (loader) {
      loader.classList.add("hidden");
    }
  };

  const handleSidePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      document.getElementById("sidePhotoPreview").src =
        "https://myrocky.com/wp-content/themes/salient-child/img/photo_upload_icon.png";
      setSidePhotoFile(null);
      toggleUploadButton();
      return false;
    }

    setSidePhotoFile(file);

    const updateUI = (previewSrc) => {
      document.querySelector("label[for=side_photo_upload]").innerHTML = `
        <div class="flex w-full flex-col">
          <div class="flex items-center mb-2">
            <img
              class="w-16 h-16 object-contain mr-4 flex-shrink-0"
              src="${previewSrc}"
              id="sidePhotoPreview"
              alt="Upload icon"
            />
            <div class="flex-1 min-w-0">
              <div class="break-words text-[#C19A6B]">
                ${file.name}
                <span class="text-xs block font-light text-gray-400 mt-1">Tap again to change</span>
              </div>
            </div>
          </div>
        </div>
      `;
    };

    const reader = new FileReader();
    reader.onload = function (e) {
      const previewSrc = e.target?.result;
      updateUI(previewSrc);
      const preview = document.getElementById("sidePhotoPreview");
      if (preview) {
        preview.src = previewSrc;
      }
    };
    reader.readAsDataURL(file);

    if (file && frontPhotoFile) {
      const uploadButton = document.querySelector(".upload-button");
      if (uploadButton) {
        uploadButton.classList.remove("hidden");
      }

      setButtonState((state) => ({
        ...state,
        visible: true,
      }));
    }
  };

  const toggleUploadButton = () => {
    const uploadButton = document.querySelector(".upload-button");

    if (frontPhotoFile && sidePhotoFile) {
      if (uploadButton) {
        uploadButton.classList.remove("hidden");
      }
      setButtonState((state) => ({
        ...state,
        visible: true,
      }));
    } else {
      if (uploadButton) {
        uploadButton.classList.add("hidden");
      }
      setButtonState((state) => ({
        ...state,
        visible: true,
      }));
    }
  };

  const handleBodyPhotosUpload = async () => {
    if (!frontPhotoFile || !sidePhotoFile) {
      throw new Error("Photo files not selected");
    }

    setIsUploadingPhotos(true);
    setUploadProgress({ front: 0, side: 0, id: 0 });

    try {
      showLoader();

      const { uploadFileToS3WithProgress } = await import(
        "@/utils/s3/frontend-upload"
      );

      const frontS3Url = await uploadFileToS3WithProgress(
        frontPhotoFile,
        "questionnaire/weight-loss-body-photos",
        "wl",
        (progress) => {
          setUploadProgress((prev) => ({ ...prev, front: progress }));
        }
      );

      const sideS3Url = await uploadFileToS3WithProgress(
        sidePhotoFile,
        "questionnaire/weight-loss-body-photos",
        "wl",
        (progress) => {
          setUploadProgress((prev) => ({ ...prev, side: progress }));
        }
      );

      const updatedData = {
        ...formData,
        197: frontS3Url,
        198: sideS3Url,
        completion_percentage: 100,
        completion_state: "Full",
        stage: "body-photos-upload",
      };

      const finalData = {
        ...updatedData,
        page_step: 23,
      };
      
      setFormData(finalData);
      updateLocalStorage(finalData);
      queueFormSubmission(finalData);

      document.querySelector(
        "label[for=front_photo_upload]"
      ).style.borderColor = "green";
      document.querySelector("label[for=side_photo_upload]").style.borderColor =
        "green";
      document.querySelector(".upload-button").classList.add("hidden");

      setUploadSuccess(true);
      setIsUploadingPhotos(false);
      hideLoader();
      
      setTimeout(() => {
        setCurrentPage(23);
        setProgress(100);
      }, 100);
    } catch (error) {
      logger.error("Error uploading photos:", error);

      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");

        if (error.message && error.message.includes("File size exceeds")) {
          errorBox.textContent =
            "One or more files exceed the maximum size of 5MB. Please select smaller images.";
        } else if (
          error.message &&
          error.message.includes("Only JPG, JPEG, PNG, HEIF, and HEIC")
        ) {
          errorBox.textContent =
            "Only JPG, JPEG, PNG, HEIF, and HEIC images are supported. Please select different images.";
        } else if (error.message && error.message.includes("presigned")) {
          errorBox.textContent =
            "Failed to get upload permission. Please try again or contact support.";
        } else {
          errorBox.textContent = error.message || "Error uploading photos";
        }
      }

      document.querySelector(
        "label[for=front_photo_upload]"
      ).style.borderColor = "red";
      document.querySelector("label[for=side_photo_upload]").style.borderColor =
        "red";
    } finally {
      setIsUploadingPhotos(false);
      setUploadProgress({ front: 0, side: 0, id: 0 });
      hideLoader();
    }
  };

  useEffect(() => {
    if (currentPage === 13) {
      const hasSelection = Object.keys(formData).some(
        (key) => key.startsWith("612_") && formData[key]
      );
      setButtonState((state) => ({
        ...state,
        visible: hasSelection,
        disabled: false,
        opacity: 1,
      }));
    } else {
      const shouldShowButton = determineButtonVisibility(formData, currentPage);
      setButtonState((state) => ({
        ...state,
        visible: shouldShowButton,
        disabled: false,
        opacity: 1,
      }));
    }
  }, [formData, currentPage]);

  const determineButtonVisibility = (data, page) => {
    if (!data) return false;

    switch (page) {
      case 6:
        return Object.keys(data).some(
          (key) => key.startsWith("605_") && data[key]
        );
      case 7:
        return !!data[606];
      case 13:
        return Object.keys(data).some(
          (key) => key.startsWith("613_") && data[key]
        );
      case 8:
        return Object.keys(data).some(
          (key) => (key.startsWith("608_") && data[key]) || key === "608_11"
        );
      default:
        return true;
    }
  };

  useEffect(() => {
    return () => {
      const continueButton = document.querySelector(".quiz-continue-button");
      if (continueButton) {
        continueButton.style.visibility = "";
        continueButton.style.display = "";
      }
    };
  }, []);

  useEffect(() => {
    if (formData.wl_weight && formData.wl_height && formData.wl_BMI) {
      const weightMatch = formData.wl_weight.match(/(\d+)/);
      const heightMatch = formData.wl_height.match(/(\d+)ft\s*(\d+)in/);

      if (weightMatch && heightMatch) {
        setBmiUserData({
          weight: weightMatch[1],
          height: {
            feet: parseInt(heightMatch[1]),
            inches: parseInt(heightMatch[2]),
          },
          bmi: formData.wl_BMI,
        });
      }
    }
  }, [formData.wl_weight, formData.wl_height, formData.wl_BMI]);

  const handlePhotoIdAcknowledgeContinue = () => {
    if (!photoIdAcknowledged) return;

    const updatedData = updateFormDataAndStorage({
      "204_1": "1",
      "204_2": "I hereby understand and acknowledge the above message",
      "204_3": "33",
    });

    queueFormSubmission(updatedData);

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 100);
  };

  const handlePhotoIdUpload = async () => {
    if (!photoIdFile) {
      throw new Error("No photo file selected");
    }

    try {
      setIsUploading(true);
      setUploadProgress((prev) => ({ ...prev, id: 0 }));
      showLoader();

      const { uploadFileToS3WithProgress } = await import(
        "@/utils/s3/frontend-upload"
      );

      const s3Url = await uploadFileToS3WithProgress(
        photoIdFile,
        "questionnaire/wl-photo-ids",
        "wl",
        (progress) => {
          setUploadProgress((prev) => ({ ...prev, id: progress }));
        }
      );

      const updatedData = {
        ...formData,
        196: s3Url,
        completion_state: "Partial",
        stage: "photo-id-upload",
      };

      setFormData(updatedData);
      updateLocalStorage(updatedData);

      setIsUploading(false);

      setTimeout(() => {
        hideLoader();
      }, 100);

      return s3Url;
    } catch (error) {
      logger.error("Error uploading photo:", error);
      setIsUploading(false);
      hideLoader();
      throw error;
    }
  };

  const handleHealthcareQuestionsSelect = (option) => {
    clearError();

    if (option === "No") {
      const updates = { 616: option, "l-616_1-textarea": "" };

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));
      updateFormDataAndStorage(updates);
      setTimeout(() => {
        moveToNextSlideWithoutValidation();
      }, 10);
    } else {
      const existingTextarea = formData["l-616_1-textarea"] || "";

      const updates = {
        616: option,
        "l-616_1-textarea": existingTextarea,
      };
      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));
      updateFormDataAndStorage(updates);
      updateContinueButtonState(existingTextarea.trim() !== "");
    }
  };

  const handleBookAppointmentSelect = (option) => {
    clearError();

    if (option === "Clinician") {
      option = "Doctor";
    }

    let updates = {
      619: option,
    };
    if (option === "Pharmacist" || option === "Doctor") {
      updates["618_1"] = "";
      updates["618_2"] = "";
      updates["618_3"] = "";
    }

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateFormDataAndStorage(updates);
    queueFormSubmission({ ...formData, ...updates });

    if (option === "Doctor" || option === "Pharmacist") {
      setTimeout(() => {
        moveToNextSlideWithoutValidation();
      }, 10);
    } else if (option === "No") {
      setShowNoAppointmentAcknowledgement(true);
      setNoAppointmentAcknowledged(false);
    }
  };

  const handleNoAppointmentAcknowledgement = (e) => {
    const isChecked = e.target.checked;
    setNoAppointmentAcknowledged(isChecked);

    const updates = {
      "618_1": isChecked ? "1" : "",
      "618_2": isChecked
        ? "I hereby understand and consent to the above waiver"
        : "",
      "618_3": isChecked ? "33" : "",
    };

    const updatedData = {
      ...formData,
      ...updates,
    };

    setFormData((prev) => ({ ...prev, ...updates }));
    updateFormDataAndStorage(updatedData);

    queueFormSubmission(updates);
  };

  const handleRequestAppointmentInstead = () => {
    setShowNoAppointmentAcknowledgement(false);

    const updates = {
      619: "Clinician",
      "618_1": "",
      "618_2": "",
      "618_3": "",
    };

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateFormDataAndStorage({
      ...formData,
      ...updates,
    });

    queueFormSubmission(updates);

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 10);
  };

  const handleNoAppointmentContinue = (proceed = true) => {
    if (!proceed) {
      setShowNoAppointmentAcknowledgement(false);
      setNoAppointmentAcknowledged(false);

      const updates = {
        619: "",
        "618_1": "",
        "618_2": "",
        "618_3": "",
      };

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      updateFormDataAndStorage({
        ...formData,
        ...updates,
      });

      queueFormSubmission(updates);
      return;
    }

    if (!noAppointmentAcknowledged) return;
    setShowNoAppointmentAcknowledgement(false);

    const updates = {
      "l-617_1": "1",
      "l-617_2": "I hereby understand and consent to the above waiver",
      "l-617_3": "33",
    };

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateFormDataAndStorage({
      ...formData,
      ...updates,
    });

    queueFormSubmission(updates);

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 10);
  };

  const updateLocalStorage = (dataToStore = formData) => {
    if (typeof window !== "undefined") {
      const now = new Date();
      const ttl = now.getTime() + 1000 * 60 * 60;

      try {
        const dataToSave = {
          ...dataToStore,
          id: dataToStore.id || formData.id || "",
          token: dataToStore.token || formData.token || "",
          entrykey: dataToStore.entrykey || formData.entrykey || "",
          _ui: {
            buttonState,
            currentPage: currentPage,
          },
        };

        localStorage.setItem("wl-quiz-form", JSON.stringify(dataToSave));
        localStorage.setItem("wl-quiz-form-expiry", ttl.toString());
        return true;
      } catch (error) {
        logger.error("Error storing data in local storage:", error);
        return false;
      }
    }
    return false;
  };

  const submitFormData = async (specificData = null) => {
    try {
      let dataToSubmit;

      if (specificData) {
        const cumulativeData = collectCumulativeData();

        const textareaFields = {};
        Object.entries(formData).forEach(([key, value]) => {
          if (key.includes("-textarea")) {
            textareaFields[key] = value || "";
            if (!key.startsWith("l-")) {
              const correctKey = `l-${key}`;
              textareaFields[correctKey] = value || "";
            }
          }
        });

        dataToSubmit = {
          ...cumulativeData,
          ...specificData,
          ...textareaFields,
        };
        delete dataToSubmit._ui;
        delete dataToSubmit[".ui"];
      } else {
        dataToSubmit = collectCumulativeData();
        delete dataToSubmit._ui;
        delete dataToSubmit[".ui"];
      }
      const logTextareaFields = (data) => {
        const textareaFields = Object.entries(data)
          .filter(([key]) => key.includes("-textarea"))
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});

        if (Object.keys(textareaFields).length > 0) {
          logger.log("Submitting textarea fields:", textareaFields);
        }
      };
      const completeData = {
        ...dataToSubmit,
        form_id: 6,
        action: "wl_questionnaire_data_upload",
        entrykey: formData.entrykey || "",
        id: formData.id || "",
        token: formData.token || "",
        stage: dataToSubmit.stage || "consultation-before-checkout",
        page_step: currentPage,
        completion_state: dataToSubmit.completion_state || "Partial",
        completion_percentage: dataToSubmit.completion_percentage || progress,
        source_site: "https://myrocky.com",
      };

      logTextareaFields(completeData);

      const response = await fetch("/api/wl", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeData),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setFormData((prev) => {
        const updated = {
          ...prev,
          id: data.id || prev.id || "",
          token: data.token || prev.token || "",
          entrykey: data.entrykey || prev.entrykey || "",
        };

        updateLocalStorage(updated);

        return updated;
      });

      return data;
    } catch (error) {
      logger.error("Error submitting form:", error);
      return null;
    }
  };

  const handlePhotoIdFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
      const preview = document.getElementById("photo-id-preview");
      if (preview) {
        preview.src = "";
      }
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

  const handleTapToUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePreviousMedicationSelect = (option) => {
    clearError();

    let updates = {
      602: option,
      navigation_type: option === "Yes" ? "from_previous_medication_yes" : "",
    };

    if (option === "No") {
      updates = {
        ...updates,
        "604_1": "",
        "604_2": "",
        "604_3": "",
        "604_4": "",
        "604_5": "",
        "604_6": "",
        "l-604_6-textarea": "",
      };
    }

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
    const updatedData = updateFormDataAndStorage(updates);

    queueFormSubmission(updatedData);
    updateContinueButtonState(true);

    if (option === "Yes") {
      setTimeout(() => {
        setIsMovingForward(true);
        setCurrentPage(4);
        setFormData((prev) => {
          const updatedFormData = {
            ...prev,
            page_step: 4,
            navigation_type: "from_previous_medication_yes",
          };
          updateLocalStorage(updatedFormData);
          return updatedFormData;
        });

        const newProgress = Math.ceil((4 / 26) * 100);
        setProgress(Math.max(0, newProgress));
      }, 10);
    } else {
      setTimeout(() => {
        moveToNextSlideWithoutValidation();
      }, 10);
    }
  };

  const handleHelpOptionSelect = (option) => {
    clearError();
    setFormData((prev) => ({
      ...prev,
      603: option,
    }));
    const updatedData = updateFormDataAndStorage({
      603: option,
    });

    queueFormSubmission(updatedData);
    updateContinueButtonState(true);

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 10);
  };

  const handleMedicationSelect = (fieldId, option) => {
    clearError();

    const newFormData = { ...formData };

    if (newFormData[fieldId] === option) {
      newFormData[fieldId] = "";
    } else {
      newFormData[fieldId] = option;
    }

    if (fieldId === "604_6") {
      if (newFormData[fieldId] !== "Other") {
        newFormData["l-604_6-textarea"] = "";
      }
    }

    setFormData(newFormData);
    updateLocalStorage(newFormData);
    queueFormSubmission(newFormData);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.display = "block";

      const needsTextarea =
        newFormData["604_6"] === "Other" && !newFormData["l-604_6-textarea"];

      continueButton.style.visibility = !needsTextarea ? "" : "hidden";
    }
  };

  const handleBloodPressureSelect = (option) => {
    clearError();

    if (option !== "141/91 to 179/99 (High)") {
      setBpWarningAcknowledged(false);
    }

    const updatedFormData = {
      ...formData,
      606: option,
      WLBloodPressureWarning: "",
    };
    setFormData(updatedFormData);
    updateLocalStorage(updatedFormData);
    setButtonState((state) => ({
      ...state,
      visible: true,
      disabled: false,
      opacity: 1,
    }));

    if (option === "141/91 to 179/99 (High)") {
      setShowHighBpWarning(true);
    } else if (option === ">180/100 (Higher)") {
      setShowVeryHighBpWarning(true);
    } else if (option === "I don't know my blood pressure") {
      setShowUnknownBpWarning(true);
    } else {
      setTimeout(() => {
        queueFormSubmission(updatedFormData);
        moveToNextSlideWithoutValidation();
      }, 10);
    }
  };

  const handleExerciseFrequencySelect = (option) => {
    clearError();
    setFormData((prev) => ({
      ...prev,
      611: option,
    }));
    const updatedData = updateFormDataAndStorage({
      611: option,
    });

    queueFormSubmission(updatedData);
    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "visible";
    }

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 10);
  };

  const handleWeightLossGoalsSelect = (optionId) => {
    clearError();

    const weightLossGoalsMap = {
      "612_1": "Have more energy",
      "612_2": "Feel healthier",
      "612_3": "See changes in my body",
      "612_4": "Other",
    };

    const actualValue = weightLossGoalsMap[optionId] || "";

    const isSelected = !!formData[optionId];
    const updates = { [optionId]: isSelected ? "" : actualValue };

    if (isSelected) {
      updates[`l-${optionId}-textarea`] = "";
    }

    const newFormData = { ...formData, ...updates };

    const hasAnySelection = Object.keys(newFormData).some(
      (key) => key.startsWith("612_") && newFormData[key]
    );

    setFormData(newFormData);
    updateLocalStorage(newFormData);
    queueFormSubmission(newFormData);

    if (hasAnySelection || Object.keys(updates).length > 0) {
      setButtonState((state) => ({
        ...state,
        visible: hasAnySelection,
        disabled: false,
        opacity: 1,
      }));
    }
  };

  const handleMedicalConditionsSelect = (optionId) => {
    clearError();

    const newFormData = { ...formData };
    const medicalConditionsMap = {
      "613_1": "Heart failure",
      "613_2": "Tinea Infections (fungal skin infections)",
      "613_3": "Obstructive Sleep Apnea",
      "613_4": "Gout",
      "613_5": "Diabetes",
      "613_6": "Gallbladder disease",
      "613_7": "Gastrointestinal problems",
      "613_8": "High blood pressure",
      "613_9": "Depression",
      "613_10": "Have you had any surgeries",
      "613_11": "Other",
      "613_12": "None of the above.",
    };

    const actualValue = medicalConditionsMap[optionId] || "";

    if (newFormData[optionId]) {
      newFormData[optionId] = "";
      if (["613_5", "613_7", "613_10", "613_11"].includes(optionId)) {
        newFormData[`l-${optionId}-textarea`] = "";
      }
    } else {
      newFormData[optionId] = actualValue;

      if (optionId === "613_12") {
        const textareaFields = {};
        ["613_5", "613_7", "613_10", "613_11"].forEach((key) => {
          const textareaKey = `l-${key}-textarea`;
          if (newFormData[textareaKey]) {
            textareaFields[textareaKey] = newFormData[textareaKey];
          }
        });

        for (let i = 1; i <= 11; i++) {
          const key = `613_${i}`;
          newFormData[key] = "";
        }

        ["613_5", "613_7", "613_10", "613_11"].forEach((key) => {
          newFormData[`l-${key}-textarea`] = "";
        });
      } else {
        newFormData["613_12"] = "";
      }
    }

    setFormData(newFormData);
    updateLocalStorage(newFormData);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleAllergiesSelect = (option) => {
    clearError();

    if (option === "No") {
      const updates = { 614: option, "l-614_1-textarea": "" };
      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));
      updateFormDataAndStorage(updates);

      setTimeout(() => {
        moveToNextSlideWithoutValidation();
      }, 10);
    } else {
      const existingTextarea = formData["l-614_1-textarea"] || "";
      const updates = {
        614: option,
        "l-614_1-textarea": existingTextarea,
      };

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      updateFormDataAndStorage(updates);

      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.display = "block";
        continueButton.style.visibility =
          existingTextarea.trim() !== "" ? "" : "hidden";
      }
    }
  };

  const handleGLP1AllergySelect = (optionId, textValue, questionPrefix) => {
    clearError();
    const newFormData = { ...formData };
    const isNoOrUnsure = optionId.endsWith("_3") || optionId.endsWith("_4");
    
    if (isNoOrUnsure) {
      if (newFormData[optionId]) {
        newFormData[optionId] = "";
      } else {
        for (let i = 1; i <= 4; i++) {
          newFormData[`${questionPrefix}_${i}`] = "";
        }
        newFormData[optionId] = textValue;
      }
    } else {
      if (newFormData[optionId]) {
        newFormData[optionId] = "";
      } else {
        newFormData[`${questionPrefix}_3`] = "";
        newFormData[`${questionPrefix}_4`] = "";
        newFormData[optionId] = textValue;
      }
    }

    setFormData(newFormData);
    updateLocalStorage(newFormData);

    const hasSelection = newFormData[`${questionPrefix}_1`] || 
                        newFormData[`${questionPrefix}_2`] || 
                        newFormData[`${questionPrefix}_3`] || 
                        newFormData[`${questionPrefix}_4`];

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = hasSelection ? "" : "hidden";
    }
  };

  const handleSideEffectsSelect624 = (optionId) => {
    clearError();
    const sideEffectsMap = {
      "624_1": "Nausea, vomiting, diarrhea, or other GI symptoms",
      "624_2": "Abdominal pain or cramping",
      "624_3": "Fatigue or low energy",
      "624_4": "Dizziness",
      "624_5": "Other side effects that made dose increases difficult",
      "624_6": "No, I tolerate dose increases normally",
    };

    const actualValue = sideEffectsMap[optionId] || "";
    const newFormData = { ...formData };

    if (newFormData[optionId]) {
      newFormData[optionId] = "";
    } else {
      newFormData[optionId] = actualValue;

      if (optionId === "624_6") {
        for (let i = 1; i <= 5; i++) {
          const key = `624_${i}`;
          newFormData[key] = "";
        }
      } else {
        newFormData["624_6"] = "";
      }
    }

    setFormData(newFormData);
    updateLocalStorage(newFormData);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleLifestyleSelect = (optionId) => {
    clearError();
    const lifestyleOptionsMap = {
      "615_1": "I am a smoker (tobacco)",
      "615_2": "I drink alcohol",
      "615_3": "I use recreational drugs",
      "615_4": "I get less than 7 hours of sleep per night",
      "615_5": "None of the above.",
    };

    const actualValue = lifestyleOptionsMap[optionId] || "";

    const newFormData = { ...formData };

    if (newFormData[optionId]) {
      newFormData[optionId] = "";
      if (["615_2", "615_3"].includes(optionId)) {
        newFormData[`l-${optionId}-textarea`] = "";
      }
    } else {
      newFormData[optionId] = actualValue;

      if (optionId === "615_5") {
        for (let i = 1; i <= 4; i++) {
          const key = `615_${i}`;
          newFormData[key] = "";
        }
        newFormData["l-615_2-textarea"] = "";
        newFormData["l-615_3-textarea"] = "";
      } else {
        newFormData["615_5"] = "";
      }
    }
    setFormData(newFormData);
    updateLocalStorage(newFormData);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleTextAreaChange = (optionId, e) => {
    const value = e.target.value;
    const fieldKey = `l-${optionId}-textarea`;

    const newFormData = { ...formData, [fieldKey]: value };
    setFormData(newFormData);
    updateLocalStorage(newFormData);
    const relatedFields = {};
    if (optionId.includes("_")) {
      const [questionId, optionIndex] = optionId.split("_");
      relatedFields[`${questionId}_${optionIndex}`] =
        formData[`${questionId}_${optionIndex}`] || "";
    }
    const updates = {
      [fieldKey]: value,
      ...relatedFields,
    };

    setButtonState((state) => ({
      ...state,
      visible: value.trim() !== "",
    }));
  };

  const handleWeightLossMethodSelect = (optionId) => {
    clearError();

    const weightLossMethodsMap = {
      "608_1": "Specialized diet (Paleo or Atkins)",
      "608_2": "Weight loss plans (Weight Watchers)",
      "608_3": "Therapy or counseling",
      "608_4": "Working with a dietitian ",
      "608_5": "Exercise",
      "608_6": "Prescription weight loss medication",
      "608_7": "Laxatives or diuretics",
      "608_8": "Weight loss supplements",
      "608_9": "Other",
      "608_11": "I have not tried to lose weight in the past",
    };

    const actualValue = weightLossMethodsMap[optionId] || "";

    const newFormData = { ...formData };
    if (newFormData[optionId]) {
      newFormData[optionId] = "";
      newFormData[`l-${optionId}-textarea`] = "";
    } else {
      newFormData[optionId] = actualValue;

      if (optionId === "608_11") {
        for (let i = 1; i <= 9; i++) {
          const key = `608_${i}`;
          newFormData[key] = "";
          newFormData[`l-${key}-textarea`] = "";
        }
      } else {
        newFormData["608_11"] = "";
      }
    }

    setFormData(newFormData);
    updateLocalStorage(newFormData);

    setButtonState((state) => ({
      ...state,
      visible: true,
    }));
  };

  const handleWeightConcernSelect = (option) => {
    clearError();

    setFormData((prev) => ({
      ...prev,
      609: option,
    }));

    const updatedData = updateFormDataAndStorage({
      609: option,
    });
    queueFormSubmission(formData);
    setButtonState((state) => ({
      ...state,
      visible: true,
    }));

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 10);
  };

  const handleDietDescriptionSelect = (option) => {
    clearError();

    const valueToStore =
      option === "I don't exercise" ? "I don't exercise" : option;
    setFormData((prev) => ({
      ...prev,
      610: valueToStore,
    }));

    const updatedData = updateFormDataAndStorage({
      610: option,
    });

    queueFormSubmission(updatedData);
    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "visible";
    }
    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 10);
  };

  const handleSideEffectsSelect = (option) => {
    clearError();

    setFormData((prev) => ({
      ...prev,
      620: option,
    }));

    const updatedData = updateFormDataAndStorage({
      620: option,
    });

    queueFormSubmission(updatedData);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "visible";
    }

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 10);
  };

  const handleWeightLossSurgerySelect = (optionId) => {
    clearError();

    const surgeryOptionsMap = {
      "607_1": "Sleeve gastrectomy",
      "607_2": "Laparoscopic adjustable gastric band (Lap-Band)",
      "607_3": "Roux-en-Y gastric bypass",
      "607_4": "Gastric balloon",
      "607_5": "Other procedure",
      "607_6": "None of the above",
    };

    const actualValue = surgeryOptionsMap[optionId] || "";

    const newFormData = { ...formData };

    if (newFormData[optionId]) {
      newFormData[optionId] = "";
      if (optionId === "607_5") {
        newFormData["l-607_5-textarea"] = "";
      }
    } else {
      newFormData[optionId] = actualValue;

      if (optionId === "607_6") {
        const textareaValue = newFormData["l-607_5-textarea"];
        ["607_1", "607_2", "607_3", "607_4", "607_5"].forEach((opt) => {
          newFormData[opt] = "";
        });

        newFormData["l-607_5-textarea"] = "";
      } else {
        newFormData["607_6"] = "";
      }
    }

    setFormData(newFormData);
    updateLocalStorage(newFormData);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handlePhotoIdAcknowledgement = (e) => {
    const isChecked = e.target.checked;
    setPhotoIdAcknowledged(isChecked);

    const updatedData = updateFormDataAndStorage({
      "204_1": isChecked ? "1" : "",
      "204_2": isChecked
        ? "I hereby understand and acknowledge the above message"
        : "",
      "204_3": isChecked ? "33" : "",
    });

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.disabled = !isChecked;
      continueButton.style.opacity = isChecked ? "1" : "0.5";
    }

    queueFormSubmission(updatedData);
  };

  const verifyCustomerAndProceed = async () => {
    if (formData["196"] && !photoIdFile) {
      const updatedData = updateFormDataAndStorage({
        page_step: currentPage + 1,
      });
      queueFormSubmission(updatedData);
      setTimeout(() => {
        moveToNextSlideWithoutValidation();
      }, 100);
      return;
    }

    if (!photoIdFile) {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent = "Please upload a photo ID";
      }
      return;
    }

    try {
      setIsUploading(true);
      showLoader();

      const uploadedS3Url = await handlePhotoIdUpload();

      const cumulativeData = collectCumulativeData();

      const completeSubmissionData = {
        ...cumulativeData,
        196: uploadedS3Url,
        completion_state: "Partial",
        stage: "photo-id-upload",
      };

      await submitFormData(completeSubmissionData).catch((error) => {
        logger.error("Error submitting form data:", error);
      });

      // Navigate to next page after successful upload and submission
      setTimeout(() => {
        moveToNextSlideWithoutValidation();
      }, 100);
    } catch (error) {
      logger.error("Photo upload error:", error);
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");

        if (error.message && error.message.includes("File size exceeds")) {
          errorBox.textContent =
            "The file size exceeds the maximum allowed size of 20MB. Please select a smaller image.";
        } else if (
          error.message &&
          error.message.includes("Only JPG, JPEG, PNG, HEIF, and HEIC")
        ) {
          errorBox.textContent =
            "Only JPG, JPEG, PNG, HEIF, and HEIC images are supported. Please select a different image.";
        } else if (error.message && error.message.includes("presigned")) {
          errorBox.textContent =
            "Failed to get upload permission. Please try again or contact support.";
        } else if (error.message && error.message.includes("CORS")) {
          errorBox.textContent =
            "Upload failed due to security restrictions. Please contact support and mention 'CORS error'.";
        } else {
          errorBox.textContent =
            "An error occurred during verification. Please try again.";
        }
      }
    } finally {
      setIsUploading(false);
      hideLoader();
    }
  };

  const handleContinueClick = () => {
    setValidationAttempted(true);
    if (isValidated()) {
      setValidationAttempted(false);

      if (currentPage === 22) {
        const currentPageData = collectCurrentPageData();
        const updates = {
          ...currentPageData,
          page_step: currentPage + 1,
        };
        updateFormDataAndStorage(updates);
        queueFormSubmission(updates);
        setTimeout(() => {
          moveToNextSlideWithoutValidation();
        }, 100);
        return;
      }

      if (currentPage === 24) {
        const currentPageData = collectCurrentPageData();
        const updates = {
          ...currentPageData,
          page_step: currentPage + 1,
        };
        updateFormDataAndStorage(updates);
        queueFormSubmission(updates);
        setTimeout(() => {
          moveToNextSlideWithoutValidation();
        }, 100);
        return;
      }

      if (currentPage === 25) {
        if (photoIdFile || formData["196"]) {
          verifyCustomerAndProceed();
          return;
        } else {
          const errorBox = formRef.current?.querySelector(".error-box");
          if (errorBox) {
            errorBox.classList.remove("hidden");
            errorBox.textContent = "Please upload your photo ID to continue";
          }
          return;
        }
      }

      if (currentPage === 26) {
        handleBodyPhotosUpload();
        return;
      }

      if (currentPage === 6) {
        const weightGainData = {
          "605_1": formData["605_1"],
          "605_2": formData["605_2"],
          "605_3": formData["605_3"],
          "605_4": formData["605_4"],
          "605_5": formData["605_5"],
          "605_6": formData["605_6"],
          "605_7": formData["605_7"],
          "l-605_1-textarea": formData["l-605_1-textarea"],
          "l-605_2-textarea": formData["l-605_2-textarea"],
          "l-605_3-textarea": formData["l-605_3-textarea"],
          "l-605_4-textarea": formData["l-605_4-textarea"],
          "l-605_5-textarea": formData["l-605_5-textarea"],
          "l-605_6-textarea": formData["l-605_6-textarea"],
        };
        queueFormSubmission(weightGainData);
      } else {
        queueFormSubmission(collectCumulativeData());
      }

      if (currentPage === 1 && formData["601"] === "Yes") {
        setIsMovingForward(true);
        setCurrentPage(4);
        setFormData((prev) => {
          const updatedFormData = {
            ...prev,
            page_step: 4,
          };
          updateLocalStorage(updatedFormData);
          return updatedFormData;
        });
        const newProgress = Math.ceil((4 / 26) * 100);
        setProgress(Math.max(0, newProgress));
      } else if (currentPage === 2 && formData["602"] === "Yes") {
        setIsMovingForward(true);
        setCurrentPage(4);
        setFormData((prev) => {
          const updatedFormData = {
            ...prev,
            page_step: 4,
          };
          updateLocalStorage(updatedFormData);
          return updatedFormData;
        });
        const newProgress = Math.ceil((4 / 26) * 100);
        setProgress(Math.max(0, newProgress));
      } else {
        moveToNextSlide();
      }
    }
  };

  const handleWeightGainContributorsSelect = (optionId) => {
    clearError();
    const weightGainOptionsMap = {
      "605_1": "Medications",
      "605_2": "Illness or injury",
      "605_3": "Unhealthy diet",
      "605_4": "Mental Health issues",
      "605_5": "Surgery",
      "605_6": "Other",
      "605_7": "None of the above",
    };

    const actualValue = weightGainOptionsMap[optionId] || "";

    const isSelected = !!formData[optionId];
    const updates = { [optionId]: isSelected ? "" : actualValue };
    if (isSelected) {
      updates[`l-${optionId}-textarea`] = "";
    }

    if (optionId === "605_7" && !isSelected) {
      const textareaValues = {};
      ["605_1", "605_2", "605_3", "605_4", "605_5", "605_6"].forEach((opt) => {
        const textareaKey = `l-${opt}-textarea`;
        if (formData[textareaKey]) {
          textareaValues[textareaKey] = formData[textareaKey];
        }
      });
      ["605_1", "605_2", "605_3", "605_4", "605_5", "605_6"].forEach((opt) => {
        updates[opt] = "";
        updates[`l-${opt}-textarea`] = "";
      });
    } else if (optionId !== "605_7" && !isSelected) {
      updates["605_7"] = "";
    }
    const newFormData = { ...formData, ...updates };
    setFormData(newFormData);
    updateLocalStorage(newFormData);

    setButtonState((state) => ({
      ...state,
      visible: Object.keys(newFormData).some(
        (key) => key.startsWith("605_") && newFormData[key]
      ),
      disabled: false,
      opacity: 1,
    }));
  };

  const handleWeightGainTextChange = (option, e) => {
    const value = e.target.value;
    const newFormData = { ...formData, [`l-${option}-textarea`]: value };
    setFormData(newFormData);
    updateLocalStorage(newFormData);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      let isVisible = true;
      if (formData["605_1"] && !newFormData["l-605_1-textarea"])
        isVisible = false;
      if (formData["605_2"] && !newFormData["l-605_2-textarea"])
        isVisible = false;
      if (formData["605_4"] && !newFormData["l-605_4-textarea"])
        isVisible = false;
      if (formData["605_5"] && !newFormData["l-605_5-textarea"])
        isVisible = false;
      if (formData["605_6"] && !newFormData["l-605_6-textarea"])
        isVisible = false;

      updateContinueButtonState(isVisible);
    }
  };

  const updateFormDataAndStorage = (updates) => {
    const newFormData = {
      ...formData,
      ...updates,
      id: updates.id || formData.id || "",
      token: updates.token || formData.token || "",
      entrykey: updates.entrykey || formData.entrykey || "",
    };

    setFormData(newFormData);
    updateLocalStorage(newFormData);
    return newFormData;
  };

  const collectCumulativeData = () => {
    let essentialConsulData = {};
    try {
      const essentialConsul = localStorage.getItem("essential-consul");
      if (essentialConsul) {
        essentialConsulData = JSON.parse(essentialConsul);
      }
    } catch (error) {
      logger.error("Error reading essential-consul in collectCumulativeData:", error);
    }

    let storedAttributes = {};
    try {
      const attributesData = localStorage.getItem("wl_pre_quiz_attributes");
      if (attributesData) {
        storedAttributes = JSON.parse(attributesData);
      }
    } catch (error) {
      logger.error("Error reading stored pre-quiz attributes:", error);
    }

    const getValue = (key) => {
      return formData[key] || essentialConsulData[key] || "";
    };

    const pageDataMap = {
      1: { 601: getValue("601") },
      2: { 602: getValue("602") },
      3: { 603: getValue("603") },
      4: {
        "604_1": formData["604_1"],
        "604_2": formData["604_2"],
        "604_3": formData["604_3"],
        "604_4": formData["604_4"],
        "604_5": formData["604_5"],
        "604_6": formData["604_6"],
        "l-604_6-textarea": formData["l-604_6-textarea"],
      },
      5: {
        617: formData["617"],
        "l-617_1-textarea": formData["l-617_1-textarea"],
      },
      6: {
        "605_1": formData["605_1"],
        "605_2": formData["605_2"],
        "605_3": formData["605_3"],
        "605_4": formData["605_4"],
        "605_5": formData["605_5"],
        "605_6": formData["605_6"],
        "605_7": formData["605_7"],
        "l-605_1-textarea": formData["l-605_1-textarea"],
        "l-605_2-textarea": formData["l-605_2-textarea"],
        "l-605_3-textarea": formData["l-605_3-textarea"],
        "l-605_4-textarea": formData["l-605_4-textarea"],
        "l-605_5-textarea": formData["l-605_5-textarea"],
        "l-605_6-textarea": formData["l-605_6-textarea"],
      },
      7: { 606: formData["606"] },
      8: {
        "607_1": formData["607_1"],
        "607_2": formData["607_2"],
        "607_3": formData["607_3"],
        "607_4": formData["607_4"],
        "607_5": formData["607_5"],
        "607_6": formData["607_6"],
        "l-607_5-textarea": formData["l-607_5-textarea"],
      },
      9: {
        "608_1": formData["608_1"],
        "608_2": formData["608_2"],
        "608_3": formData["608_3"],
        "608_4": formData["608_4"],
        "608_5": formData["608_5"],
        "608_6": formData["608_6"],
        "608_7": formData["608_7"],
        "608_8": formData["608_8"],
        "608_9": formData["608_9"],
        "608_11": formData["608_11"],
        "l-608_1-textarea": formData["l-608_1-textarea"],
        "l-608_1-textarea": formData["l-608_1-textarea"],
        "l-608_3-textarea": formData["l-608_3-textarea"],
        "l-608_4-textarea": formData["l-608_4-textarea"],
        "l-608_5-textarea": formData["l-608_5-textarea"],
        "l-608_6-textarea": formData["l-608_6-textarea"],
        "l-608_7-textarea": formData["l-608_7-textarea"],
        "l-608_8-textarea": formData["l-608_8-textarea"],
        "l-608_9-textarea": formData["l-608_9-textarea"],
      },
      10: { 609: formData["609"] },
      11: { 610: formData["610"] },
      12: { 611: formData["611"] },
      13: {
        "612_1": formData["612_1"],
        "612_2": formData["612_2"],
        "612_3": formData["612_3"],
        "612_4": formData["612_4"],
        "l-612_4-textarea": formData["l-612_4-textarea"],
      },
      14: { 620: formData["620"] },
      15: {
        "613_1": formData["613_1"],
        "613_2": formData["613_2"],
        "613_3": formData["613_3"],
        "613_4": formData["613_4"],
        "613_5": formData["613_5"],
        "613_6": formData["613_6"],
        "613_7": formData["613_7"],
        "613_8": formData["613_8"],
        "613_9": formData["613_9"],
        "613_10": formData["613_10"],
        "613_11": formData["613_11"],
        "613_12": formData["613_12"],
        "l-613_5-textarea": formData["l-613_5-textarea"],
        "l-613_7-textarea": formData["l-613_7-textarea"],
        "l-613_10-textarea": formData["l-613_10-textarea"],
        "l-613_11-textarea": formData["l-613_11-textarea"],
      },
      16: {
        "621_1": formData["621_1"],
        "621_2": formData["621_2"],
        "621_3": formData["621_3"],
        "621_4": formData["621_4"],
      },
      17: {
        "622_1": formData["622_1"],
        "622_2": formData["622_2"],
        "622_3": formData["622_3"],
        "622_4": formData["622_4"],
      },
      18: {
        "624_1": formData["624_1"],
        "624_2": formData["624_2"],
        "624_3": formData["624_3"],
        "624_4": formData["624_4"],
        "624_5": formData["624_5"],
        "624_6": formData["624_6"],
      },
      19: {
        "623_1": formData["623_1"],
        "623_2": formData["623_2"],
        "623_3": formData["623_3"],
        "623_4": formData["623_4"],
      },
      20: {
        614: formData["614"],
        "l-614_1-textarea": formData["l-614_1-textarea"],
      },
      21: {
        "615_1": formData["615_1"],
        "615_2": formData["615_2"],
        "615_3": formData["615_3"],
        "615_4": formData["615_4"],
        "615_5": formData["615_5"],
        "l-615_2-textarea": formData["l-615_2-textarea"],
        "l-615_3-textarea": formData["l-615_3-textarea"],
      },
      22: {
        616: formData["616"],
        "l-616_1-textarea": formData["l-616_1-textarea"],
      },
      23: {
        619: formData["619"],
        618_1: formData["618_1"],
        618_2: formData["618_2"],
        618_3: formData["618_3"],
      },
      24: {
        photo_id_acknowledged: formData["photo_id_acknowledged"],
      },
      25: {
        196: formData["196"],
      },
      26: {
        197: formData["197"],
        198: formData["198"],
      },
    };

    let cumulativeData = {};
    for (let page = 1; page <= currentPage; page++) {
      if (pageDataMap[page]) {
        cumulativeData = { ...cumulativeData, ...pageDataMap[page] };
      }
    }

    const filteredData = {};
    Object.entries(cumulativeData).forEach(([key, value]) => {
      if (key === "_ui" || key === ".ui") {
        return;
      }

      const isCheckboxOptionKey = /^\d+_\d+$/.test(key);

      if (value === undefined || value === null) {
        return;
      }
      if (value === "" && !isCheckboxOptionKey) {
        return;
      }

      filteredData[key] = value;
    });

    if (formData.wl_weight) {
      filteredData.wl_weight = formData.wl_weight;
    }
    if (formData.wl_height) {
      filteredData.wl_height = formData.wl_height;
    }
    if (formData.wl_BMI) {
      filteredData.wl_BMI = formData.wl_BMI;
    }

   const preQuizAttributes = extractPreQuizAttributes(essentialConsulData);
    
    if (formData.accomplishment) {
      filteredData.accomplishment = formData.accomplishment;
    } else if (preQuizAttributes.accomplishment) {
      filteredData.accomplishment = preQuizAttributes.accomplishment;
    } else if (storedAttributes.accomplishment) {
      filteredData.accomplishment = storedAttributes.accomplishment;
    }
    
    if (formData.pregnantOrbreastfeeding) {
      filteredData.pregnantOrbreastfeeding = formData.pregnantOrbreastfeeding;
    } else if (preQuizAttributes.pregnantOrbreastfeeding) {
      filteredData.pregnantOrbreastfeeding = preQuizAttributes.pregnantOrbreastfeeding;
    } else if (storedAttributes.pregnantOrbreastfeeding) {
      filteredData.pregnantOrbreastfeeding = storedAttributes.pregnantOrbreastfeeding;
    }
    
    if (formData.weightImpactStatements) {
      filteredData.weightImpactStatements = formData.weightImpactStatements;
    } else if (preQuizAttributes.weightImpactStatements) {
      filteredData.weightImpactStatements = preQuizAttributes.weightImpactStatements;
    } else if (storedAttributes.weightImpactStatements) {
      filteredData.weightImpactStatements = storedAttributes.weightImpactStatements;
    }
    
    if (formData.medications) {
      filteredData.medications = formData.medications;
    } else if (preQuizAttributes.medications) {
      filteredData.medications = preQuizAttributes.medications;
    } else if (storedAttributes.medications) {
      filteredData.medications = storedAttributes.medications;
    }
    
    if (formData.eatingDisorderDiagnosis) {
      filteredData.eatingDisorderDiagnosis = formData.eatingDisorderDiagnosis;
    } else if (preQuizAttributes.eatingDisorderDiagnosis) {
      filteredData.eatingDisorderDiagnosis = preQuizAttributes.eatingDisorderDiagnosis;
    } else if (storedAttributes.eatingDisorderDiagnosis) {
      filteredData.eatingDisorderDiagnosis = storedAttributes.eatingDisorderDiagnosis;
    }

    return filteredData;
  };

  const collectCurrentPageData = () => {
    const pageDataMap = {
      1: { 601: formData["601"] },
      2: { 602: formData["602"] },
      3: { 603: formData["603"] },
      4: {
        "604_1": formData["604_1"],
        "604_2": formData["604_2"],
        "604_3": formData["604_3"],
        "604_4": formData["604_4"],
        "604_5": formData["604_5"],
        "604_6": formData["604_6"],
        "l-604_6-textarea": formData["l-604_6-textarea"],
      },
      5: {
        617: formData["617"],
        "l-617_1-textarea": formData["l-617_1-textarea"],
      },
      6: {
        "605_1": formData["605_1"],
        "605_2": formData["605_2"],
        "605_3": formData["605_3"],
        "605_4": formData["605_4"],
        "605_5": formData["605_5"],
        "605_6": formData["605_6"],
        "605_7": formData["605_7"],
        "l-605_1-textarea": formData["l-605_1-textarea"],
        "l-605_2-textarea": formData["l-605_2-textarea"],
        "l-605_3-textarea": formData["l-605_3-textarea"],
        "l-605_4-textarea": formData["l-605_4-textarea"],
        "l-605_5-textarea": formData["l-605_5-textarea"],
        "l-605_6-textarea": formData["l-605_6-textarea"],
      },
      7: { 606: formData["606"] },
      8: {
        "607_1": formData["607_1"],
        "607_2": formData["607_2"],
        "607_3": formData["607_3"],
        "607_4": formData["607_4"],
        "607_5": formData["607_5"],
        "607_6": formData["607_6"],
        "l-607_5-textarea": formData["l-607_5-textarea"],
      },
      9: {
        "608_1": formData["608_1"],
        "608_2": formData["608_2"],
        "608_3": formData["608_3"],
        "608_4": formData["608_4"],
        "608_5": formData["608_5"],
        "608_6": formData["608_6"],
        "608_7": formData["608_7"],
        "608_8": formData["608_8"],
        "608_9": formData["608_9"],
        "608_11": formData["608_11"],
        "l-608_1-textarea": formData["l-608_1-textarea"],
        "l-608_1-textarea": formData["l-608_1-textarea"],
        "l-608_3-textarea": formData["l-608_3-textarea"],
        "l-608_4-textarea": formData["l-608_4-textarea"],
        "l-608_5-textarea": formData["l-608_5-textarea"],
        "l-608_6-textarea": formData["l-608_6-textarea"],
        "l-608_7-textarea": formData["l-608_7-textarea"],
        "l-608_8-textarea": formData["l-608_8-textarea"],
        "l-608_9-textarea": formData["l-608_9-textarea"],
      },
      10: { 609: formData["609"] },
      11: { 610: formData["610"] },
      12: { 611: formData["611"] },
      13: {
        "612_1": formData["612_1"],
        "612_2": formData["612_2"],
        "612_3": formData["612_3"],
        "612_4": formData["612_4"],
        "l-612_4-textarea": formData["l-612_4-textarea"],
      },
      14: { 620: formData["620"] },
      15: {
        "613_1": formData["613_1"],
        "613_2": formData["613_2"],
        "613_3": formData["613_3"],
        "613_4": formData["613_4"],
        "613_5": formData["613_5"],
        "613_6": formData["613_6"],
        "613_7": formData["613_7"],
        "613_8": formData["613_8"],
        "613_9": formData["613_9"],
        "613_10": formData["613_10"],
        "613_11": formData["613_11"],
        "613_12": formData["613_12"],
        "l-613_5-textarea": formData["l-613_5-textarea"],
        "l-613_7-textarea": formData["l-613_7-textarea"],
        "l-613_10-textarea": formData["l-613_10-textarea"],
        "l-613_11-textarea": formData["l-613_11-textarea"],
      },
      16: {
        "621_1": formData["621_1"],
        "621_2": formData["621_2"],
        "621_3": formData["621_3"],
        "621_4": formData["621_4"],
      },
      17: {
        "622_1": formData["622_1"],
        "622_2": formData["622_2"],
        "622_3": formData["622_3"],
        "622_4": formData["622_4"],
      },
      18: {
        "624_1": formData["624_1"],
        "624_2": formData["624_2"],
        "624_3": formData["624_3"],
        "624_4": formData["624_4"],
        "624_5": formData["624_5"],
        "624_6": formData["624_6"],
      },
      19: {
        "623_1": formData["623_1"],
        "623_2": formData["623_2"],
        "623_3": formData["623_3"],
        "623_4": formData["623_4"],
      },
      20: {
        614: formData["614"],
        "l-614_1-textarea": formData["l-614_1-textarea"],
      },
      21: {
        "615_1": formData["615_1"],
        "615_2": formData["615_2"],
        "615_3": formData["615_3"],
        "615_4": formData["615_4"],
        "615_5": formData["615_5"],
        "l-615_2-textarea": formData["l-615_2-textarea"],
        "l-615_3-textarea": formData["l-615_3-textarea"],
      },
      22: {
        616: formData["616"],
        "l-616_1-textarea": formData["l-616_1-textarea"],
      },
      23: {
        619: formData["619"],
        618_1: formData["618_1"],
        618_2: formData["618_2"],
        618_3: formData["618_3"],
      },
      24: {
        photo_id_acknowledged: formData["photo_id_acknowledged"],
      },
      25: {
        196: formData["196"],
      },
      26: {
        197: formData["197"],
        198: formData["198"],
      },
    };

    const pageData = pageDataMap[currentPage] || {};
    const dataWithBMI = { ...pageData };
    if (formData.wl_weight) {
      dataWithBMI.wl_weight = formData.wl_weight;
    }
    if (formData.wl_height) {
      dataWithBMI.wl_height = formData.wl_height;
    }
    if (formData.wl_BMI) {
      dataWithBMI.wl_BMI = formData.wl_BMI;
    }

    return dataWithBMI;
  };

  const handleBackClick = () => {
    moveToPreviousSlide();
  };

  const moveToNextSlide = () => {
    if (!isValidated()) return;

    setIsMovingForward(true);
    let nextPage = currentPage + 1;
    let navigationType = formData.navigation_type || "";

    if (currentPage === 1 && formData["601"] === "Yes") {
      nextPage = 4;
      navigationType = "from_current_medication_yes";
    } else if (currentPage === 2 && formData["602"] === "Yes") {
      nextPage = 4;
      navigationType = "from_previous_medication_yes";
    } else if (currentPage === 3) {
      nextPage = 5;
    }

    setCurrentPage(nextPage);

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        page_step: nextPage,
        navigation_type: navigationType,
      };

      updateLocalStorage(updatedFormData);
      return updatedFormData;
    });
    const newProgress = Math.ceil((nextPage / 26) * 100);
    setProgress(Math.max(0, newProgress));
  };

  const HandleChangeBpWarningAcknowledged = (option) => {
    logger.log(option);
    if (option === true) {
      setBpWarningAcknowledged(option);

      setFormData((prev) => ({
        ...prev,
        WLBloodPressureWarning: "on",
      }));
      updateLocalStorage({
        ...formData,
        WLBloodPressureWarning: "on",
      });

      queueFormSubmission({
        ...formData,
        WLBloodPressureWarning: "on",
      });

      moveToNextSlideWithoutValidation();
    }
  };

  const moveToPreviousSlide = () => {
    setIsMovingForward(false);

    if (currentPage > 1) {
      let prevPage = currentPage - 1;

      if (currentPage === 4) {
        if (
          formData["601"] === "Yes" ||
          formData.navigation_type === "from_current_medication_yes"
        ) {
          prevPage = 1;
        } else if (
          formData["602"] === "Yes" ||
          formData.navigation_type === "from_previous_medication_yes"
        ) {
          prevPage = 2;
        }
      } else if (currentPage === 5) {
        if (
          formData["601"] === "Yes" ||
          formData.navigation_type === "from_current_medication_yes"
        ) {
          prevPage = 4;
        } else if (
          formData["602"] === "Yes" ||
          formData.navigation_type === "from_previous_medication_yes"
        ) {
          prevPage = 4;
        } else {
          prevPage = 3;
        }
      }

      setCurrentPage(prevPage);
      setFormData((prev) => ({
        ...prev,
        page_step: prevPage,
      }));

      const newProgress = Math.ceil((prevPage / 26) * 100);
      setProgress(Math.max(0, newProgress));

      if (prevPage === 1 && formData["601"]) {
        setQuestion1ButtonVisible(true);
      }

      updateLocalStorage();
    }
  };

  const handleCurrentMedicationSelect = async (option) => {
    clearError();

    setQuestion1ButtonVisible(false);

    const hasBackendSession =
      formData.entrykey && formData.token && formData.id;
    const isFirstSelection = !formData["601"];
    const shouldShowLoader = !hasBackendSession && isFirstSelection;

    if (shouldShowLoader) {
      showLoader();
    }

    try {
      let updates = { 601: option };

      if (option === "Yes") {
        updates = {
          ...updates,
          602: "",
          603: "",
        };
      } else if (option === "No") {
        updates = {
          ...updates,
          "604_1": "",
          "604_2": "",
          "604_3": "",
          "604_4": "",
          "604_5": "",
          "604_6": "",
          "l-604_6-textarea": "",
        };
      }

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));
      const updatedData = updateFormDataAndStorage(updates);

      if (isFirstSelection) {
        await submitFormData({ ...formData, ...updates });
      } else {
        submitFormData({ ...formData, ...updates }).catch((error) => {
          logger.error("Error submitting form data:", error);
        });
      }

      if (option === "Yes") {
        setIsMovingForward(true);
        setCurrentPage(4);
        setFormData((prev) => {
          const updatedFormData = {
            ...prev,
            page_step: 4,
            navigation_type: "from_current_medication_yes",
          };
          updateLocalStorage(updatedFormData);
          return updatedFormData;
        });

        const newProgress = Math.ceil((4 / 26) * 100);
        setProgress(Math.max(0, newProgress));
      } else if (option === "No") {
        setIsMovingForward(true);
        setCurrentPage(2);
        setFormData((prev) => {
          const updatedFormData = {
            ...prev,
            page_step: 2,
            navigation_type: "",
          };
          updateLocalStorage(updatedFormData);
          return updatedFormData;
        });
        const newProgress = Math.ceil((2 / 26) * 100);
        setProgress(Math.max(0, newProgress));
      }
    } catch (error) {
      logger.error("Error submitting form:", error);
    } finally {
      if (shouldShowLoader) {
        hideLoader();
      }
    }
  };

  const handleMedicationTextareaChange = (e) => {
    const value = e.target.value;
    const updatedData = updateFormDataAndStorage({
      "l-604_6-textarea": value,
    });

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = value.trim() !== "" ? "" : "hidden";
    }
  };

  const handleWeightGoalChange = (e) => {
    const value = e.target.value;

    if (value.includes("-")) {
      return;
    }

    const updatedData = updateFormDataAndStorage({
      "l-617_1-textarea": value,
      617: value,
    });

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.display = "block";
      continueButton.style.visibility = value.trim() !== "" ? "" : "hidden";
    }
  };

  const clearError = () => {
    if (formRef.current) {
      const errorBox = formRef.current.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.add("hidden");
        errorBox.textContent = "";
      }
    }
  };

  const renderError = (message) => {
    const errorBox = formRef.current?.querySelector(".error-box");
    if (errorBox) {
      errorBox.classList.remove("hidden");
      errorBox.textContent = message;
    }
    return false;
  };

  const handleAutoNavigateOption = async (option, value, targetPage) => {
    clearError();

    const updatedData = updateFormDataAndStorage({
      [option]: value,
    });

    await submitFormData();

    setIsMovingForward(true);
    setCurrentPage(targetPage);
    const newProgress = Math.ceil((targetPage / 26) * 100);
    setProgress(Math.max(0, newProgress));
  };

  const isValidated = () => {
    const showError = (message) => {
      return renderError(message);
    };

    const validationRules = [
      {
        page: 1,
        validate: () => {
          if (!formData["601"]) {
            return showError("Please select an option");
          }
          return true;
        },
      },
      {
        page: 2,
        validate: () => {
          if (!formData["602"]) {
            return showError("Please select an option");
          }
          return true;
        },
      },
      {
        page: 3,
        validate: () => {
          if (!formData["603"]) {
            return showError("Please select an option");
          }
          return true;
        },
      },
      {
        page: 4,
        validate: () => {
          const hasSelection =
            formData["604_1"] ||
            formData["604_2"] ||
            formData["604_3"] ||
            formData["604_4"] ||
            formData["604_5"] ||
            formData["604_6"];

          if (!hasSelection) {
            return showError("Please select at least one option");
          }

          if (formData["604_6"] === "Other" && !formData["l-604_6-textarea"]) {
            return showError("Please provide medication details");
          }

          return true;
        },
      },
      {
        page: 5,
        validate: () => {
          if (
            !formData["l-617_1-textarea"] ||
            !formData["l-617_1-textarea"].trim()
          ) {
            return showError("Please enter your weight loss goal");
          }
          return true;
        },
      },
      {
        page: 6,
        validate: () => {
          const hasSelection =
            formData["605_1"] ||
            formData["605_2"] ||
            formData["605_3"] ||
            formData["605_4"] ||
            formData["605_5"] ||
            formData["605_6"] ||
            formData["605_7"];

          if (!hasSelection) {
            return showError("Please select at least one option");
          }

          if (formData["605_1"] && !formData["l-605_1-textarea"]) {
            return showError("Please specify the medication");
          }
          if (formData["605_2"] && !formData["l-605_2-textarea"]) {
            return showError("Please specify the illness or injury");
          }
          if (formData["605_4"] && !formData["l-605_4-textarea"]) {
            return showError("Please specify the mental health issue");
          }
          if (formData["605_5"] && !formData["l-605_5-textarea"]) {
            return showError("Please specify the procedure");
          }
          if (formData["605_6"] && !formData["l-605_6-textarea"]) {
            return showError("Please explain");
          }

          return true;
        },
      },
      {
        page: 7,
        validate: () => {
          if (!formData["606"]) {
            return showError("Please select an option");
          }

          if (
            formData["606"] === "141/91 to 179/99 (High)" &&
            !bpWarningAcknowledged
          ) {
            return false;
          }

          if (
            formData["606"] === ">180/100 (Higher)" ||
            formData["606"] === "I don't know my blood pressure"
          ) {
            formData["606"] === ">180/100 (Higher)"
              ? setShowVeryHighBpWarning(true)
              : setShowUnknownBpWarning(true);
            return false;
          }

          return true;
        },
      },
      {
        page: 8,
        validate: () => {
          const hasSelection =
            formData["607_1"] ||
            formData["607_2"] ||
            formData["607_3"] ||
            formData["607_4"] ||
            formData["607_5"] ||
            formData["607_6"];

          if (!hasSelection) {
            return showError("Please select at least one option");
          }
          if (formData["607_5"] && !formData["l-607_5-textarea"]) {
            return showError("Please list the procedure");
          }

          return true;
        },
      },
      {
        page: 9,
        validate: () => {
          const hasSelection =
            formData["608_1"] ||
            formData["608_2"] ||
            formData["608_3"] ||
            formData["608_4"] ||
            formData["608_5"] ||
            formData["608_6"] ||
            formData["608_7"] ||
            formData["608_8"] ||
            formData["608_9"] ||
            formData["608_11"];

          if (!hasSelection) {
            return showError("Please select at least one option");
          }

          for (let i = 1; i <= 9; i++) {
            const optionId = `608_${i}`;
            if (formData[optionId] && !formData[`l-${optionId}-textarea`]) {
              let errorMsg = "Please provide additional information";
              if (optionId === "608_9") {
                errorMsg = "Please specify your weight loss method";
              }
              return showError(errorMsg);
            }
          }

          return true;
        },
      },
      {
        page: 10,
        validate: () => {
          if (!formData["609"]) {
            return showError("Please select an option");
          }
          return true;
        },
      },
      {
        page: 11,
        validate: () => {
          if (!formData["610"]) {
            return showError("Please select an option");
          }
          return true;
        },
      },
      {
        page: 12,
        validate: () => {
          if (!formData["611"]) {
            return showError("Please select an option");
          }
          return true;
        },
      },
      {
        page: 13,
        validate: () => {
          const hasSelection =
            formData["612_1"] ||
            formData["612_2"] ||
            formData["612_3"] ||
            formData["612_4"];

          if (!hasSelection) {
            return showError("Please select at least one option");
          }

          if (formData["612_4"] && !formData["l-612_4-textarea"]) {
            return showError("Please specify your goal");
          }

          return true;
        },
      },
      {
        page: 14,
        validate: () => {
          if (!formData["620"]) {
            return showError("Please select an option");
          }
          return true;
        },
      },
      {
        page: 15,
        validate: () => {
          let hasSelection = false;
          for (let i = 1; i <= 12; i++) {
            if (formData[`613_${i}`]) {
              hasSelection = true;
              break;
            }
          }

          if (!hasSelection) {
            return showError("Please select at least one option");
          }

          if (formData["613_5"] && !formData["l-613_5-textarea"]) {
            return showError("Please list your diabetes medications");
          }
          if (formData["613_7"] && !formData["l-613_7-textarea"]) {
            return showError("Please specify your gastrointestinal problems");
          }
          if (formData["613_10"] && !formData["l-613_10-textarea"]) {
            return showError("Please specify your surgeries");
          }
          if (formData["613_11"] && !formData["l-613_11-textarea"]) {
            return showError("Please specify your other medical conditions");
          }

          return true;
        },
      },
      {
        page: 16,
        validate: () => {
          const hasSelection =
            formData["621_1"] ||
            formData["621_2"] ||
            formData["621_3"] ||
            formData["621_4"];

          if (!hasSelection) {
            return showError("Please select an option");
          }
          return true;
        },
      },
      {
        page: 17,
        validate: () => {
          const hasSelection =
            formData["622_1"] ||
            formData["622_2"] ||
            formData["622_3"] ||
            formData["622_4"];

          if (!hasSelection) {
            return showError("Please select an option");
          }
          return true;
        },
      },
      {
        page: 18,
        validate: () => {
          const hasSelection =
            formData["624_1"] ||
            formData["624_2"] ||
            formData["624_3"] ||
            formData["624_4"] ||
            formData["624_5"] ||
            formData["624_6"];

          if (!hasSelection) {
            return showError("Please select at least one option");
          }
          return true;
        },
      },
      {
        page: 19,
        validate: () => {
          const hasSelection =
            formData["623_1"] ||
            formData["623_2"] ||
            formData["623_3"] ||
            formData["623_4"];

          if (!hasSelection) {
            return showError("Please select an option");
          }
          return true;
        },
      },
      {
        page: 20,
        validate: () => {
          if (!formData["614"]) {
            return showError("Please select an option");
          }

          if (formData["614"] === "Yes" && !formData["l-614_1-textarea"]) {
            return showError("Please specify your allergies");
          }

          return true;
        },
      },
      {
        page: 21,
        validate: () => {
          const hasSelection =
            formData["615_1"] ||
            formData["615_2"] ||
            formData["615_3"] ||
            formData["615_4"] ||
            formData["615_5"];

          if (!hasSelection) {
            return showError("Please select at least one option");
          }

          if (formData["615_2"] && !formData["l-615_2-textarea"]) {
            return showError(
              "Please specify how many drinks you have per week"
            );
          }
          if (formData["615_3"] && !formData["l-615_3-textarea"]) {
            return showError("Please list the recreational drugs you use");
          }

          return true;
        },
      },
      {
        page: 22,
        validate: () => {
          if (!formData["616"]) {
            return showError("Please select an option");
          }

          if (formData["616"] === "Yes" && !formData["l-616_1-textarea"]) {
            return showError("Please enter your questions");
          }

          return true;
        },
      },
      {
        page: 23,
        validate: () => {
          if (!formData["619"]) {
            return showError("Please make a selection");
          }
          if (formData["619"] === "No" && !formData["618_1"]) {
            setShowNoAppointmentAcknowledgement(true);
            return false;
          }
          return true;
        },
      },
      {
        page: 24,
        validate: () => {
          if (!photoIdAcknowledged) {
            return showError("Please acknowledge the message");
          }
          return true;
        },
      },
      {
        page: 25,
        validate: () => {
          if (!photoIdFile && !formData["196"]) {
            return showError("Please upload your photo ID to continue");
          }
          return true;
        },
      },
      {
        page: 26,
        validate: () => {
          if (!frontPhotoFile && !formData["197"]) {
            return showError("Please upload a front view photo");
          }
          if (!sidePhotoFile && !formData["198"]) {
            return showError("Please upload a side view photo");
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

  useEffect(() => {
    const formKeys = Object.keys(formData);
    formKeys.forEach((key) => {
      if (key.includes("-textarea") && !key.startsWith("l-")) {
        const correctKey = `l-${key}`;
        if (formData[key] && !formData[correctKey]) {
          const newFormData = { ...formData };
          newFormData[correctKey] = formData[key];
          newFormData[key] = "";
          setFormData(newFormData);
          updateLocalStorage(newFormData);
          logger.log(`Corrected form field format: ${key} -> ${correctKey}`);
        }
      }
    });
  }, []);
  return (
    <div
      className="flex flex-col min-h-screen bg-white subheaders-font font-medium"
      suppressHydrationWarning={true}
    >
      {" "}
      {showBMICalculator && (
        <div className="min-h-screen">
          <BMICalculatorStep
            userData={bmiUserData}
            setUserData={setBmiUserData}
            onContinue={handleBMIComplete}
            validationState={bmiValidationState}
            setValidationState={setBmiValidationState}
            showBmiPopup={false}
          />
        </div>
      )}
      {!showBMICalculator && (
        <>
          {currentPage <= 26 && !(currentPage === 23 && formData.completion_state === "Full") && (
            <>
              <QuestionnaireNavbar
                onBackClick={handleBackClick}
                currentPage={currentPage}
                isThankYouPage={currentPage === 23 && formData.completion_state === "Full"}
              />

              <ProgressBar progress={progress} />
            </>
          )}

          {currentPage <= 26 && !(currentPage === 23 && formData.completion_state === "Full") && (
            <div className="flex-1">
              <div
                className="quiz-page-wrapper relative md:container md:w-[768px] mx-auto bg-[#FFFFFF]"
                ref={formRef}
              >
                <form
                  id="wl-quiz-form"
                  method="post"
                  action="https://myrocky.com/wp-admin/admin-ajax.php"
                >
                  <input type="hidden" name="form_id" value="6" />
                  <input
                    type="hidden"
                    name="action"
                    value="wl_questionnaire_data_upload"
                  />
                  <input
                    type="hidden"
                    name="entrykey"
                    value={formData.entrykey || ""}
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
                    value="consultation-before-checkout"
                  />
                  <input type="hidden" name="page_step" value={currentPage} />
                  <input
                    type="hidden"
                    name="completion_state"
                    value="Partial"
                  />
                  <input
                    type="hidden"
                    name="completion_percentage"
                    value={progress}
                  />
                  <input
                    type="hidden"
                    name="source_site"
                    value="https://myrocky.com"
                  />

                  <input
                    type="hidden"
                    name="130_3"
                    value={formData["130_3"] || "Omkar"}
                  />
                  <input
                    type="hidden"
                    name="130_6"
                    value={formData["130_6"] || "Test"}
                  />
                  <input
                    type="hidden"
                    name="131"
                    value={formData["131"] || "omkar@w3mg.in"}
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

                  {/* Weight specific fields */}
                  <input
                    type="hidden"
                    id="wl_weight"
                    name="wl_weight"
                    value={formData["wl_weight"] || ""}
                  />
                  <input
                    type="hidden"
                    id="wl_height"
                    name="wl_height"
                    value={formData["wl_height"] || ""}
                  />
                  <input
                    type="hidden"
                    id="wl_BMI"
                    name="wl_BMI"
                    value={formData["wl_BMI"] || ""}
                  />

                  <div
                    className="relative min-h-[400px] flex items-start md:w-[520px] mx-auto px-5 md:px-0 md:mb-16"
                    suppressHydrationWarning={true}
                  >
                    <AnimatePresence mode="wait" custom={isMovingForward}>
                      <motion.div
                        key={currentPage}
                        variants={slideVariants}
                        initial={isMovingForward ? "hiddenRight" : "hiddenLeft"}
                        animate="visible"
                        exit={isMovingForward ? "exitRight" : "exitLeft"}
                        className="w-full"
                      >
                        {/* Question 1: Currently using weight loss medication */}
                        {currentPage === 1 && (
                          <QuestionLayout
                            title="Are you currently using weight loss medication?"
                            currentPage={currentPage}
                            pageNo={1}
                            questionId="601"
                          >
                            {["Yes", "No"].map((option, index) => (
                              <QuestionOption
                                key={`medication-option-${index}`}
                                id={`601_${index + 1}`}
                                name="601"
                                value={option}
                                checked={formData["601"] === option}
                                onChange={() =>
                                  handleCurrentMedicationSelect(option)
                                }
                                type="radio"
                              />
                            ))}
                          </QuestionLayout>
                        )}
                        {/* Question 2: Have you ever been on weight loss medication before */}
                        {currentPage === 2 && (
                          <QuestionLayout
                            title="Have you ever been on weight loss medication before?"
                            currentPage={currentPage}
                            pageNo={2}
                            questionId="602"
                          >
                            {["Yes", "No"].map((option, index) => (
                              <QuestionOption
                                key={`past-medication-option-${index}`}
                                id={`602_${index + 1}`}
                                name="602"
                                value={option}
                                checked={formData["602"] === option}
                                onChange={() =>
                                  handlePreviousMedicationSelect(option)
                                }
                                type="radio"
                              />
                            ))}
                          </QuestionLayout>
                        )}
                        {/* Question 3: How can we help today */}
                        {currentPage === 3 && (
                          <QuestionLayout
                            title="How can we help today?"
                            currentPage={currentPage}
                            pageNo={3}
                            questionId="603"
                          >
                            {[
                              "I want to start treatment",
                              "I want to change my medication",
                            ].map((option, index) => (
                              <QuestionOption
                                key={`help-option-${index}`}
                                id={`603_${index + 1}`}
                                name="603"
                                value={option}
                                checked={formData["603"] === option}
                                onChange={() => handleHelpOptionSelect(option)}
                                type="radio"
                              />
                            ))}
                          </QuestionLayout>
                        )}
                        {/* Question 4: Which weight loss medication */}
                        {currentPage === 4 && (
                          <QuestionLayout
                            title="Which weight loss medication are you currently taking?"
                            currentPage={currentPage}
                            pageNo={4}
                            questionId="604"
                            inputType="checkbox"
                          >
                            {[
                              { id: "604_1", value: "Ozempic" },
                              { id: "604_2", value: "Contrave" },
                              { id: "604_3", value: "Mounjaro" },
                              { id: "604_4", value: "Orlistat" },
                              { id: "604_5", value: "Saxenda" },
                              { id: "604_6", value: "Other" },
                            ].map((option) => (
                              <QuestionOption
                                key={option.id}
                                id={option.id}
                                name={option.id}
                                value={option.value}
                                checked={!!formData[option.id]}
                                onChange={() =>
                                  handleMedicationSelect(
                                    option.id,
                                    option.value
                                  )
                                }
                                type="checkbox"
                              />
                            ))}

                            {formData["604_6"] === "Other" && (
                              <QuestionAdditionalInput
                                id="l-604_6-textarea"
                                name="l-604_6-textarea"
                                placeholder="Please state the name of the medication and how effective it was"
                                value={formData["l-604_6-textarea"] || ""}
                                onChange={handleMedicationTextareaChange}
                                disabled={formData["604_6"] !== "Other"}
                              />
                            )}
                          </QuestionLayout>
                        )}
                        {/* Question 5: How much weight are you hoping to lose */}
                        {currentPage === 5 && (
                          <QuestionLayout
                            title="How much weight are you hoping to lose?"
                            currentPage={currentPage}
                            pageNo={5}
                            questionId="617"
                          >
                            <QuestionAdditionalInput
                              id="l-617_1-textarea"
                              name="l-617_1-textarea"
                              placeholder="e.g. 20lbs"
                              value={formData["l-617_1-textarea"] || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (/^\d*$/.test(val)) {
                                  handleWeightGoalChange(e);
                                }
                              }}
                              type="text"
                            />
                          </QuestionLayout>
                        )}
                        {/* Question 6: Weight gain contributors */}
                        {currentPage === 6 && (
                          <QuestionLayout
                            title="Have any of the following contributed to your weight gain?"
                            currentPage={currentPage}
                            pageNo={6}
                            questionId="605"
                            inputType="checkbox"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                {
                                  id: "605_1",
                                  value: "Medications",
                                  addsTextArea: true,
                                  placeholder:
                                    "Please state the name of the medication",
                                },
                                {
                                  id: "605_2",
                                  value: "Illness or injury",
                                  addsTextArea: true,
                                  placeholder:
                                    "Please state the illness or injury",
                                },
                                { id: "605_3", value: "Unhealthy diet" },
                                {
                                  id: "605_4",
                                  value: "Mental Health issues",
                                  addsTextArea: true,
                                  placeholder: "Please state the issue",
                                },
                                {
                                  id: "605_5",
                                  value: "Surgery",
                                  addsTextArea: true,
                                  placeholder:
                                    "Please state the procedure you had",
                                },
                                {
                                  id: "605_6",
                                  value: "Other",
                                  addsTextArea: true,
                                  placeholder: "Please explain...",
                                },
                                {
                                  id: "605_7",
                                  value: "None of the above",
                                  isNoneOption: true,
                                },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name={option.id}
                                    value={option.value}
                                    checked={!!formData[option.id]}
                                    onChange={() =>
                                      handleWeightGainContributorsSelect(
                                        option.id
                                      )
                                    }
                                    type="checkbox"
                                    isNoneOption={option.isNoneOption}
                                  />{" "}
                                  {option.addsTextArea &&
                                    formData[option.id] && (
                                      <QuestionAdditionalInput
                                        id={`l-${option.id}-textarea`}
                                        name={`l-${option.id}-textarea`}
                                        placeholder={option.placeholder}
                                        value={
                                          formData[`l-${option.id}-textarea`] ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleWeightGainTextChange(
                                            option.id,
                                            e
                                          )
                                        }
                                      />
                                    )}
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}
                        {/* Question 7: Blood pressure */}
                        {currentPage === 7 && (
                          <QuestionLayout
                            title="What was your most recent blood pressure reading?"
                            subtitle="Please provide your blood pressure reading taken within the last 6 months."
                            notes="Your blood pressure helps us determine if it is safe for you to use certain types of weight loss medication."
                            currentPage={currentPage}
                            pageNo={7}
                            questionId="606"
                          >
                            {[
                              {
                                id: "606_1",
                                value: "120/80 or lower (Normal)",
                              },
                              {
                                id: "606_2",
                                value: "121/81 to 140/90 (Above Normal)",
                              },
                              { id: "606_3", value: "141/91 to 179/99 (High)" },
                              {
                                id: "606_4",
                                value: ">180/100 (Higher)",
                                label: "≥180/100 (Higher)",
                              },
                              {
                                id: "606_5",
                                value: "I don't know my blood pressure",
                              },
                            ].map((option) => (
                              <QuestionOption
                                key={option.id}
                                id={option.id}
                                name="606"
                                value={option.value}
                                label={option.label || option.value}
                                checked={formData["606"] === option.value}
                                onChange={() =>
                                  handleBloodPressureSelect(option.value)
                                }
                                type="radio"
                              />
                            ))}
                          </QuestionLayout>
                        )}
                        {/* Question 8: Weight loss surgery */}
                        {currentPage === 8 && (
                          <QuestionLayout
                            title="Have you ever had weight loss surgery?"
                            currentPage={currentPage}
                            pageNo={8}
                            questionId="607"
                            inputType="checkbox"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                { id: "607_1", value: "Sleeve gastrectomy" },
                                {
                                  id: "607_2",
                                  value:
                                    "Laparoscopic adjustable gastric band (Lap-Band)",
                                },
                                {
                                  id: "607_3",
                                  value: "Roux-en-Y gastric bypass",
                                },
                                { id: "607_4", value: "Gastric balloon" },
                                {
                                  id: "607_5",
                                  value: "Other procedure",
                                  addsTextArea: true,
                                },
                                {
                                  id: "607_6",
                                  value: "None of the above",
                                  isNoneOption: true,
                                },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name={option.id}
                                    value={option.value}
                                    checked={!!formData[option.id]}
                                    onChange={() =>
                                      handleWeightLossSurgerySelect(option.id)
                                    }
                                    type="checkbox"
                                    isNoneOption={option.isNoneOption}
                                  />{" "}
                                  {option.addsTextArea &&
                                    formData[option.id] && (
                                      <QuestionAdditionalInput
                                        id="l-607_5-textarea"
                                        name="l-607_5-textarea"
                                        placeholder="Please list the procedure done"
                                        value={
                                          formData["l-607_5-textarea"] || ""
                                        }
                                        onChange={(e) =>
                                          handleTextAreaChange("607_5", e)
                                        }
                                      />
                                    )}
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}
                        {currentPage === 9 && (
                          <QuestionLayout
                            title="How have you tried to lose weight in the past?"
                            currentPage={currentPage}
                            pageNo={9}
                            questionId="608"
                            inputType="checkbox"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                {
                                  id: "608_1",
                                  value: "Specialized diet (Paleo or Atkins)",
                                  addsTextArea: true,
                                  placeholder:
                                    "How effective was this for losing weight?",
                                },
                                {
                                  id: "608_2",
                                  value: "Weight loss plans (Weight Watchers)",
                                  addsTextArea: true,
                                  placeholder:
                                    "How effective was this for losing weight?",
                                },
                                {
                                  id: "608_3",
                                  value: "Therapy or counseling",
                                  addsTextArea: true,
                                  placeholder:
                                    "How effective was this for losing weight?",
                                },
                                {
                                  id: "608_4",
                                  value: "Working with a dietitian",
                                  addsTextArea: true,
                                  placeholder:
                                    "How effective was this for losing weight?",
                                },
                                {
                                  id: "608_5",
                                  value: "Exercise",
                                  addsTextArea: true,
                                  placeholder:
                                    "How effective was this for losing weight?",
                                },
                                {
                                  id: "608_6",
                                  value: "Prescription weight loss medication",
                                  addsTextArea: true,
                                  placeholder:
                                    "How effective was this for losing weight?",
                                },
                                {
                                  id: "608_7",
                                  value: "Laxatives or diuretics",
                                  addsTextArea: true,
                                  placeholder:
                                    "How effective was this for losing weight?",
                                },
                                {
                                  id: "608_8",
                                  value: "Weight loss supplements",
                                  addsTextArea: true,
                                  placeholder:
                                    "How effective was this for losing weight?",
                                },
                                {
                                  id: "608_9",
                                  value: "Other",
                                  addsTextArea: true,
                                  placeholder:
                                    "Please specify and share how effective it was",
                                },
                                {
                                  id: "608_11",
                                  value:
                                    "I have not tried to lose weight in the past",
                                  isNoneOption: true,
                                },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name={option.id}
                                    value={option.value}
                                    checked={!!formData[option.id]}
                                    onChange={() =>
                                      handleWeightLossMethodSelect(option.id)
                                    }
                                    type="checkbox"
                                    isNoneOption={option.isNoneOption}
                                  />

                                  {option.addsTextArea &&
                                    formData[option.id] && (
                                      <QuestionAdditionalInput
                                        id={`l-${option.id}-textarea`}
                                        name={`l-${option.id}-textarea`}
                                        placeholder={option.placeholder}
                                        value={
                                          formData[`l-${option.id}-textarea`] ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleTextAreaChange(option.id, e)
                                        }
                                      />
                                    )}
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}
                        {currentPage === 10 && (
                          <QuestionLayout
                            title="How long have you had concerns about your body weight?"
                            currentPage={currentPage}
                            pageNo={10}
                            questionId="609"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                { id: "609_1", value: "Less than 3 months" },
                                { id: "609_2", value: "Less than 6 months" },
                                { id: "609_3", value: "6-12 months" },
                                { id: "609_4", value: "1-5 years" },
                                { id: "609_5", value: "More than 5 years" },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name="609"
                                    value={option.value}
                                    checked={formData["609"] === option.value}
                                    onChange={() =>
                                      handleWeightConcernSelect(option.value)
                                    }
                                    type="radio"
                                  />
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}
                        {currentPage === 11 && (
                          <QuestionLayout
                            title="How would you describe your diet in the past week?"
                            currentPage={currentPage}
                            pageNo={11}
                            questionId="610"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                { id: "610_1", value: "Healthy" },
                                { id: "610_2", value: "Somewhat healthy" },
                                { id: "610_3", value: "Somewhat unhealthy" },
                                { id: "610_4", value: "Very unhealthy" },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name="610"
                                    value={option.value}
                                    checked={formData["610"] === option.value}
                                    onChange={() =>
                                      handleDietDescriptionSelect(option.value)
                                    }
                                    type="radio"
                                  />
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}
                        {currentPage === 12 && (
                          <QuestionLayout
                            title="How many days per week do you exercise 30 minutes or more?"
                            currentPage={currentPage}
                            pageNo={12}
                            questionId="611"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                { id: "611_1", value: "1 day per week" },
                                { id: "611_2", value: "2 days per week" },
                                { id: "611_3", value: "3 days per week" },
                                {
                                  id: "611_4",
                                  value: "4 or more days per week",
                                },
                                { id: "611_5", value: "I don't exercise" },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name="611"
                                    value={option.value}
                                    checked={formData["611"] === option.value}
                                    onChange={() =>
                                      handleExerciseFrequencySelect(
                                        option.value
                                      )
                                    }
                                    type="radio"
                                  />
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}
                        {currentPage === 13 && (
                          <QuestionLayout
                            title="What do you hope to achieve by losing weight?"
                            currentPage={currentPage}
                            pageNo={13}
                            questionId="612"
                            inputType="checkbox"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                { id: "612_1", value: "Have more energy" },
                                { id: "612_2", value: "Feel healthier" },
                                {
                                  id: "612_3",
                                  value: "See changes in my body",
                                },
                                {
                                  id: "612_4",
                                  value: "Other",
                                  addsTextArea: true,
                                },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name={option.id}
                                    value={option.value}
                                    checked={!!formData[option.id]}
                                    onChange={() =>
                                      handleWeightLossGoalsSelect(option.id)
                                    }
                                    type="checkbox"
                                  />

                                  {option.addsTextArea &&
                                    formData[option.id] && (
                                      <QuestionAdditionalInput
                                        id={`l-${option.id}-textarea`}
                                        name={`l-${option.id}-textarea`}
                                        placeholder="Please specify..."
                                        value={
                                          formData[`l-${option.id}-textarea`] ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleTextAreaChange(option.id, e)
                                        }
                                      />
                                    )}
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}
                        {currentPage === 14 && (
                          <QuestionLayout
                            title="Would you prefer a version of this medication that's less likely to cause side effects like nausea, stomach discomfort, or diarrhea?"
                            currentPage={currentPage}
                            pageNo={14}
                            questionId="620"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                { id: "620_1", value: "Yes" },
                                { id: "620_2", value: "No" },
                                { id: "620_3", value: "Not sure" },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name="620"
                                    value={option.value}
                                    checked={formData["620"] === option.value}
                                    onChange={() =>
                                      handleSideEffectsSelect(option.value)
                                    }
                                    type="radio"
                                  />
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}
                        {currentPage === 15 && (
                          <QuestionLayout
                            title="Do you have any of the following medical conditions"
                            currentPage={currentPage}
                            pageNo={15}
                            questionId="613"
                            inputType="checkbox"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                { id: "613_1", value: "Heart failure" },
                                {
                                  id: "613_2",
                                  value:
                                    "Tinea Infections (fungal skin infections)",
                                },
                                {
                                  id: "613_3",
                                  value: "Obstructive Sleep Apnea",
                                },
                                { id: "613_4", value: "Gout" },
                                {
                                  id: "613_5",
                                  value: "Diabetes",
                                  addsTextArea: true,
                                  placeholder:
                                    "Please list all medications you take for this",
                                },
                                { id: "613_6", value: "Gallbladder disease" },
                                {
                                  id: "613_7",
                                  value: "Gastrointestinal problems",
                                  addsTextArea: true,
                                  placeholder: "Please specify",
                                },
                                { id: "613_8", value: "High blood pressure" },
                                { id: "613_9", value: "Depression" },
                                {
                                  id: "613_10",
                                  value: "Have you had any surgeries",
                                  addsTextArea: true,
                                  placeholder: "Please specify",
                                },
                                {
                                  id: "613_11",
                                  value: "Other",
                                  addsTextArea: true,
                                  placeholder: "Please specify",
                                },
                                {
                                  id: "613_12",
                                  value: "None of the above.",
                                  isNoneOption: true,
                                },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  {" "}
                                  <QuestionOption
                                    id={option.id}
                                    name={option.id}
                                    value={option.value}
                                    checked={!!formData[option.id]}
                                    onChange={() =>
                                      handleMedicalConditionsSelect(option.id)
                                    }
                                    type="checkbox"
                                    isNoneOption={option.isNoneOption}
                                  />
                                  {option.addsTextArea &&
                                    formData[option.id] && (
                                      <QuestionAdditionalInput
                                        id={`l-${option.id}-textarea`}
                                        name={`l-${option.id}-textarea`}
                                        placeholder={option.placeholder}
                                        value={
                                          formData[`l-${option.id}-textarea`] ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleTextAreaChange(option.id, e)
                                        }
                                      />
                                    )}
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}{" "}
                        {currentPage === 16 && (
                          <QuestionLayout
                            title="Have you ever had an allergic reaction, sensitivity, or intolerance to any ingredient in approved GLP-1 medications?"
                            currentPage={currentPage}
                            pageNo={16}
                            questionId="621"
                            inputType="checkbox"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                {
                                  id: "621_1",
                                  value: "Yes, reaction or intolerance to an ingredient/excipient",
                                  optionValue: "1",
                                },
                                {
                                  id: "621_2",
                                  value: "Yes, issues with the injector pen device",
                                  optionValue: "2",
                                },
                                {
                                  id: "621_3",
                                  value: "No",
                                  optionValue: "3",
                                },
                                {
                                  id: "621_4",
                                  value: "Unsure",
                                  optionValue: "4",
                                },
                              ].map((option) => {
                                const isChecked = !!formData[option.id];
                                
                                return (
                                  <div
                                    key={option.id}
                                    className="option-container"
                                  >
                                    <QuestionOption
                                      id={option.id}
                                      name={option.id}
                                      value={option.value}
                                      checked={isChecked}
                                      onChange={() =>
                                        handleGLP1AllergySelect(option.id, option.value, "621")
                                      }
                                      type="checkbox"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </QuestionLayout>
                        )}{" "}
                        {currentPage === 17 && (
                          <QuestionLayout
                            title="Do you have difficulty using the standard pen-injector devices?"
                            currentPage={currentPage}
                            pageNo={17}
                            questionId="622"
                            inputType="checkbox"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                {
                                  id: "622_1",
                                  value: "Yes, due to dexterity, vision, or functional limitations",
                                  optionValue: "1",
                                },
                                {
                                  id: "622_2",
                                  value: "Yes, I require a different delivery format for safe use",
                                  optionValue: "2",
                                },
                                {
                                  id: "622_3",
                                  value: "No",
                                  optionValue: "3",
                                },
                                {
                                  id: "622_4",
                                  value: "Unsure",
                                  optionValue: "4",
                                },
                              ].map((option) => {
                                const isChecked = !!formData[option.id];
                                
                                return (
                                  <div
                                    key={option.id}
                                    className="option-container"
                                  >
                                    <QuestionOption
                                      id={option.id}
                                      name={option.id}
                                      value={option.value}
                                      checked={isChecked}
                                      onChange={() =>
                                        handleGLP1AllergySelect(option.id, option.value, "622")
                                      }
                                      type="checkbox"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </QuestionLayout>
                        )}{" "}
                        {currentPage === 18 && (
                          <QuestionLayout
                            title="Have you previously experienced side effects when starting or increasing doses of weight-loss or similar medications?"
                            currentPage={currentPage}
                            pageNo={18}
                            questionId="624"
                            inputType="checkbox"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                {
                                  id: "624_1",
                                  value: "Nausea, vomiting, diarrhea, or other GI symptoms",
                                },
                                {
                                  id: "624_2",
                                  value: "Abdominal pain or cramping",
                                },
                                {
                                  id: "624_3",
                                  value: "Fatigue or low energy",
                                },
                                {
                                  id: "624_4",
                                  value: "Dizziness",
                                },
                                {
                                  id: "624_5",
                                  value: "Other side effects that made dose increases difficult",
                                },
                                {
                                  id: "624_6",
                                  value: "No, I tolerate dose increases normally",
                                  isNoneOption: true,
                                },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name={option.id}
                                    value={option.value}
                                    checked={!!formData[option.id]}
                                    onChange={() =>
                                      handleSideEffectsSelect624(option.id)
                                    }
                                    type="checkbox"
                                    isNoneOption={option.isNoneOption}
                                  />
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}{" "}
                        {currentPage === 19 && (
                          <QuestionLayout
                            title="Would a personalized dose or smaller dose increments help you better tolerate treatment?"
                            currentPage={currentPage}
                            pageNo={19}
                            questionId="623"
                            inputType="checkbox"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                {
                                  id: "623_1",
                                  value: "Yes, I have difficulty with the standard dose steps",
                                  optionValue: "1",
                                },
                                {
                                  id: "623_2",
                                  value: "Yes, I need smaller or more gradual titration than commercial pens provide",
                                  optionValue: "2",
                                },
                                {
                                  id: "623_3",
                                  value: "No",
                                  optionValue: "3",
                                },
                                {
                                  id: "623_4",
                                  value: "Unsure",
                                  optionValue: "4",
                                },
                              ].map((option) => {
                                const isChecked = !!formData[option.id];
                                
                                return (
                                  <div
                                    key={option.id}
                                    className="option-container"
                                  >
                                    <QuestionOption
                                      id={option.id}
                                      name={option.id}
                                      value={option.value}
                                      checked={isChecked}
                                      onChange={() =>
                                        handleGLP1AllergySelect(option.id, option.value, "623")
                                      }
                                      type="checkbox"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </QuestionLayout>
                        )}{" "}
                        {currentPage === 20 && (
                          <QuestionLayout
                            title="Do you have any known allergies?"
                            currentPage={currentPage}
                            pageNo={20}
                            questionId="614"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                {
                                  id: "614_1",
                                  value: "Yes",
                                  addsTextArea: true,
                                },
                                { id: "614_2", value: "No" },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name="614"
                                    value={option.value}
                                    checked={formData["614"] === option.value}
                                    onChange={() =>
                                      handleAllergiesSelect(option.value)
                                    }
                                    type="radio"
                                  />{" "}
                                  {option.addsTextArea &&
                                    formData["614"] === "Yes" && (
                                      <QuestionAdditionalInput
                                        id="l-614_1-textarea"
                                        name="l-614_1-textarea"
                                        placeholder="Please state your allergies"
                                        value={
                                          formData["l-614_1-textarea"] || ""
                                        }
                                        onChange={(e) =>
                                          handleTextAreaChange("614_1", e)
                                        }
                                      />
                                    )}
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}{" "}
                        {currentPage === 21 && (
                          <QuestionLayout
                            title="Tell us about your lifestyle."
                            currentPage={currentPage}
                            pageNo={21}
                            questionId="615"
                            inputType="checkbox"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                {
                                  id: "615_1",
                                  value: "I am a smoker (tobacco)",
                                },
                                {
                                  id: "615_2",
                                  value: "I drink alcohol",
                                  addsTextArea: true,
                                  placeholder:
                                    "How many drinks do you have per week?",
                                },
                                {
                                  id: "615_3",
                                  value: "I use recreational drugs",
                                  addsTextArea: true,
                                  placeholder: "Please list all drugs used",
                                },
                                {
                                  id: "615_4",
                                  value:
                                    "I get less than 7 hours of sleep per night",
                                },
                                {
                                  id: "615_5",
                                  value: "None of the above.",
                                  isNoneOption: true,
                                },
                              ].map((option) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name={option.id}
                                    value={option.value}
                                    checked={!!formData[option.id]}
                                    onChange={() =>
                                      handleLifestyleSelect(option.id)
                                    }
                                    type="checkbox"
                                    isNoneOption={option.isNoneOption}
                                  />

                                  {option.addsTextArea &&
                                    formData[option.id] && (
                                      <QuestionAdditionalInput
                                        id={`l-${option.id}-textarea`}
                                        name={`l-${option.id}-textarea`}
                                        placeholder={option.placeholder}
                                        value={
                                          formData[`l-${option.id}-textarea`] ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleTextAreaChange(option.id, e)
                                        }
                                      />
                                    )}
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}
                        {currentPage === 22 && (
                          <QuestionLayout
                            title="Do you have any questions for the healthcare team?"
                            currentPage={currentPage}
                            pageNo={22}
                            questionId="616"
                          >
                            <div className="flex flex-col w-full gap-2">
                              {[
                                {
                                  id: "616_1",
                                  value: "Yes",
                                  addsTextArea: true,
                                },
                                { id: "616_2", value: "No" },
                              ].map((option, index) => (
                                <div
                                  key={option.id}
                                  className="option-container"
                                >
                                  <QuestionOption
                                    id={option.id}
                                    name="616"
                                    value={option.value}
                                    checked={formData["616"] === option.value}
                                    onChange={() =>
                                      handleHealthcareQuestionsSelect(
                                        option.value
                                      )
                                    }
                                    type="radio"
                                  />{" "}
                                  {option.addsTextArea &&
                                    formData["616"] === "Yes" && (
                                      <QuestionAdditionalInput
                                        id="l-616_1-textarea"
                                        name="l-616_1-textarea"
                                        placeholder="What do you want to ask?"
                                        value={
                                          formData["l-616_1-textarea"] || ""
                                        }
                                        onChange={(e) =>
                                          handleTextAreaChange("616_1", e)
                                        }
                                      />
                                    )}
                                </div>
                              ))}
                            </div>
                          </QuestionLayout>
                        )}{" "}
                        {currentPage === 23 && (
                          <QuestionLayout
                            title="Would you like to book an appointment with our health care team?"
                            currentPage={currentPage}
                            pageNo={23}
                            questionId="619"
                          >
                            {[
                              { id: "617_2", value: "Clinician" },
                              { id: "617_3", value: "Pharmacist" },
                              { id: "617_1", value: "No", label: "No" },
                            ].map((option) => (
                              <QuestionOption
                                key={option.id}
                                id={option.id}
                                name="619"
                                value={option.value}
                                label={option.label || option.value}
                                checked={formData["619"] === option.value}
                                onChange={() =>
                                  handleBookAppointmentSelect(option.value)
                                }
                                type="radio"
                              />
                            ))}
                          </QuestionLayout>
                        )}{" "}
                        {currentPage === 24 && (
                          <QuestionLayout
                            title="Upload Photo ID"
                            currentPage={currentPage}
                            pageNo={24}
                            questionId="photo_id_acknowledgment"
                            inputType="checkbox"
                          >
                            <div className="text-left px-4 mb-6">
                              <p className="text-[#C19A6B] text-lg mb-8">
                                Please note this step is mandatory. If you are
                                unable to complete at this time, email your ID
                                to{" "}
                                <a
                                  href="mailto:clinicadmin@myrocky.com"
                                  className="underline"
                                >
                                  clinicadmin@myrocky.com
                                </a>
                                .
                              </p>
                              <p className="text-lg">
                                Your questionnaire will not be reviewed without
                                this. As per our T&C's a{" "}
                                <span className="font-bold">
                                  $45 cancellation fee
                                </span>{" "}
                                will be charged if we are unable to verify you.
                              </p>
                            </div>

                            <div className="border-b border-gray-300 mt-4 mb-8 h-[1px] w-full"></div>

                            <div className="flex items-start mb-6 w-full px-4">
                              <input
                                id="photo-id-acknowledge"
                                type="checkbox"
                                className="w-6 h-6 border border-gray-300 rounded mt-0.5"
                                checked={photoIdAcknowledged}
                                onChange={handlePhotoIdAcknowledgement}
                              />
                              <label
                                htmlFor="photo-id-acknowledge"
                                className="ml-3 text-md font-medium text-[#000000]"
                              >
                                I hereby understand and acknowledge the above
                                message
                              </label>
                            </div>
                          </QuestionLayout>
                        )}
                        {currentPage === 25 && (
                          <motion.div
                            key={currentPage}
                            variants={slideVariants}
                            initial={
                              isMovingForward ? "hiddenRight" : "hiddenLeft"
                            }
                            animate="visible"
                            exit={isMovingForward ? "exitRight" : "exitLeft"}
                            className="w-full"
                          >
                            <div className="px-4 pt-6 pb-4">
                              <h1 className="text-3xl text-center text-[#AE7E56] font-bold mb-6">
                                Upload Photo ID
                              </h1>
                              <h3 className="text-lg text-center font-medium mb-1">
                                Please upload a photo of your ID
                              </h3>

                              <div className="flex flex-col items-center justify-center mb-6">
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  id="photo-id-file"
                                  accept="image/jpeg,image/jpg,image/png,image/heif,image/heic"
                                  className="hidden"
                                  onChange={handlePhotoIdFileSelect}
                                />

                                <div
                                  onClick={handleTapToUpload}
                                  className="w-full md:w-[80%] max-w-lg h-40 flex items-center justify-center border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-6 mx-auto"
                                >
                                  {!photoIdFile ? (
                                    <div className="flex flex-col items-center">
                                      <div className="w-20 h-20 flex items-center justify-center mb-2">
                                        <img
                                          src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/ID-icon.png"
                                          alt="ID"
                                          className="w-20 h-20"
                                        />
                                      </div>
                                      <span className="text-[#C19A6B] text-lg">
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
                                </div>
                                {photoIdFile && (
                                  <div className="mb-6 mt-4 w-full max-w-md mx-auto">
                                    <p className="text-center text-xs text-gray-500 mb-4 break-words px-2">
                                      Photo selected: {photoIdFile.name}
                                    </p>
                                  </div>
                                )}

                                {!photoIdFile && (
                                  <div className="w-full max-w-md mx-auto">
                                    <p className="text-center text-md font-medium mb-2">
                                      Please capture a selfie of yourself
                                      holding your ID
                                    </p>{" "}
                                    <p className="text-center text-sm text-gray-500 mb-8">
                                      Only JPG, JPEG, PNG, HEIF, and HEIC images
                                      are supported.
                                      <br />
                                      Maximum file size per image is 20MB
                                    </p>
                                  </div>
                                )}
                              </div>

                              <input
                                type="hidden"
                                name="196"
                                value={formData["196"] || ""}
                              />
                            </div>
                          </motion.div>
                        )}{" "}
                        {currentPage === 26 && (
                          <QuestionLayout
                            title="Provide images from the waist up: Front and Side Views"
                            subtitle="Your body should be clearly visible"
                            currentPage={currentPage}
                            pageNo={26}
                            questionId="body_photos"
                            inputType="upload"
                          >
                            <div className="w-full space-y-8">
                              {" "}
                              <input
                                type="hidden"
                                id="197"
                                name="197"
                                value={formData["197"] || ""}
                              />
                              <input
                                type="hidden"
                                id="198"
                                name="198"
                                value={formData["198"] || ""}
                              />
                              {/* Front Photo Upload */}
                              <div className="w-full md:w-4/5 mx-auto">
                                <input
                                  id="front_photo_upload"
                                  className="hidden"
                                  type="file"
                                  name="front_photo_upload"
                                  accept="image/*"
                                  ref={frontPhotoInputRef}
                                  onChange={handleFrontPhotoSelect}
                                />
                                <label
                                  htmlFor="front_photo_upload"
                                  className="flex items-center cursor-pointer p-5 border-2 border-gray-300 rounded-lg shadow-md hover:bg-gray-50"
                                >
                                  <div className="flex w-full items-center">
                                    <img
                                      className="w-16 h-16 object-contain mr-4"
                                      src="https://myrocky.com/wp-content/themes/salient-child/img/photo_upload_icon.png"
                                      id="frontPhotoPreview"
                                      alt="Upload icon"
                                    />
                                    <span className="text-[#C19A6B]">
                                      Tap to upload Front View photo
                                    </span>
                                  </div>
                                </label>
                                <p className="text-center text-sm mt-2 mb-6">
                                  Please provide a clear photo of your front
                                  view.
                                </p>
                              </div>
                              {/* Side Photo Upload */}
                              <div className="w-full md:w-4/5 mx-auto">
                                <input
                                  id="side_photo_upload"
                                  className="hidden"
                                  type="file"
                                  name="side_photo_upload"
                                  accept="image/*"
                                  ref={sidePhotoInputRef}
                                  onChange={handleSidePhotoSelect}
                                />
                                <label
                                  htmlFor="side_photo_upload"
                                  className="flex items-center cursor-pointer p-5 border-2 border-gray-300 rounded-lg shadow-md hover:bg-gray-50"
                                >
                                  <div className="flex w-full items-center">
                                    <img
                                      className="w-16 h-16 object-contain mr-4"
                                      src="https://myrocky.com/wp-content/themes/salient-child/img/photo_upload_icon.png"
                                      id="sidePhotoPreview"
                                      alt="Upload icon"
                                    />
                                    <span className="text-[#C19A6B]">
                                      Tap to upload Side View photo
                                    </span>
                                  </div>
                                </label>
                                <p className="text-center text-sm mt-2">
                                  Please provide a clear photo of your side view
                                </p>
                                <p className="text-center text-xs mt-1 text-gray-500">
                                  It helps to use a mirror
                                </p>
                              </div>{" "}
                              <div className="text-center text-xs text-gray-400 mt-6">
                                <p>
                                  Only JPG, JPEG, PNG, HEIF, and HEIC images are
                                  supported.
                                </p>
                                <p>Max allowed file size per image is 20MB</p>
                              </div>
                              <div className="text-center mt-6 hidden">
                                <button
                                  type="button"
                                  onClick={handleBodyPhotosUpload}
                                  className="upload-button bg-gray-300 hover:bg-gray-400 text-black font-medium py-3 px-6 rounded-full w-full max-w-md"
                                  disabled={isUploadingPhotos}
                                >
                                  {isUploadingPhotos ? (
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
                                      {`Uploading... ${Math.round(
                                        (uploadProgress.front +
                                          uploadProgress.side) /
                                          2
                                      )}%`}
                                    </span>
                                  ) : (
                                    "Upload and Continue"
                                  )}
                                </button>
                              </div>
                            </div>
                          </QuestionLayout>
                        )}
                        {/* Warning Popups */}
                        <WarningPopup
                          isOpen={showPhotoIdPopup}
                          onClose={() => {
                            if (photoIdAcknowledged) {
                              setShowPhotoIdPopup(false);
                            }
                          }}
                          title="Upload Photo ID"
                          message={
                            <>
                              <p className="mb-5 text-md text-left">
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
                              <p className="mb-5 text-md text-left">
                                Your questionnaire will not be reviewed without
                                this. As per our T&C's a{" "}
                                <span className="font-medium">
                                  $45 cancellation fee
                                </span>{" "}
                                will be charged if we are unable to verify you.
                              </p>
                            </>
                          }
                          isAcknowledged={photoIdAcknowledged}
                          onAcknowledge={(e) =>
                            setPhotoIdAcknowledged(e.target.checked)
                          }
                          buttonText="I Acknowledge"
                          backgroundColor="bg-white"
                          titleColor="text-orange-500"
                        />
                        <WarningPopup
                          isOpen={showHighBpWarning}
                          onClose={() => setShowHighBpWarning(false)}
                          title="High Blood Pressure"
                          message="This is considered high. We'll be able to give you your prescription but please speak to your doctor to discuss your blood pressure."
                          isAcknowledged={bpWarningAcknowledged}
                          onAcknowledge={
                            (e) =>
                              HandleChangeBpWarningAcknowledged(
                                e.target.checked
                              )
                            //
                          }
                          currentPage={currentPage}
                        />
                        <WarningPopup
                          isOpen={showVeryHighBpWarning}
                          onClose={() => setShowVeryHighBpWarning(false)}
                          title="Very High Blood Pressure"
                          message="This is considered very high and we would not be able to provide you with a prescription today. We strongly advise you seek immediate medical attention."
                          showCheckbox={false}
                          backgroundColor="bg-[#F5F4EF]"
                          currentPage={currentPage}
                        />
                        <WarningPopup
                          isOpen={showUnknownBpWarning}
                          onClose={() => setShowUnknownBpWarning(false)}
                          title="Unknown Blood Pressure"
                          message="Unfortunately it would not be safe to give you a prescription without knowing your blood pressure."
                          showCheckbox={false}
                          backgroundColor="bg-[#F5F4EF]"
                          currentPage={currentPage}
                        />
                        {/* No Appointment Acknowledgement Popup */}
                        <WarningPopup
                          isOpen={showNoAppointmentAcknowledgement}
                          onClose={handleNoAppointmentContinue}
                          title="Acknowledgement"
                          message="I hereby acknowledge that by foregoing an appointment with a licensed physician or pharmacist, it is my sole responsibility to ensure I am aware of how to appropriately use the medication requested, furthermore I hereby confirm that I am aware of any potential side effects that may occur through the use of the aforementioned medication and hereby confirm that I do not have any medical questions to ask. I will ensure I have read the relevant product page and FAQ prior to use of the prescribed medication. Should I have any questions to ask, I am aware of how to contact the clinical team at Rocky or get a hold of my primary care provider."
                          isAcknowledged={noAppointmentAcknowledged}
                          onAcknowledge={handleNoAppointmentAcknowledgement}
                          backgroundColor="bg-[#F5F4EF]"
                          additionalContent={null}
                          buttonText="OK"
                          currentPage={currentPage}
                          afterButtonContent={
                            <p className="mt-4 text-center font-medium text-md text-[#000000]">
                              <button
                                onClick={handleRequestAppointmentInstead}
                                className="underline hover:text-gray-900"
                              >
                                I would like to request the appointment instead
                              </button>
                            </p>
                          }
                        />
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </form>

                <p className="error-box text-red-500 hidden m-2 text-center text-sm mx-auto max-w-[90%] md:max-w-md lg:max-w-lg"></p>

                <div className="fixed bottom-0 left-0 w-full p-4 z-[9999] bg-white shadow-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleContinueClick}
                    className={`bg-black text-white w-full max-w-md py-4 px-4 rounded-full font-medium text-lg ${
                      !isClient ||
                      (currentPage === 1
                        ? !question1ButtonVisible
                        : !buttonState.visible)
                        ? "invisible"
                        : "visible"
                    }`}
                    disabled={buttonState.disabled}
                    style={{ opacity: buttonState.opacity }}
                    suppressHydrationWarning={true}
                  >
                    Continue
                  </button>
                </div>

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
                  }}
                >
                  <div
                    className="text-center p-5 pb-[100px]"
                    style={{ position: "relative", top: "25%" }}
                  >
                    <div className="mb-4">
                      {uploadProgress.id > 0 && (
                        <div className="text-lg font-medium text-gray-700">
                          Uploading... {Math.round(uploadProgress.id)}%
                        </div>
                      )}
                      {uploadProgress.front > 0 && (
                        <div className="text-lg font-medium text-gray-700">
                          Uploading front photo...{" "}
                          {Math.round(uploadProgress.front)}%
                        </div>
                      )}
                      {uploadProgress.side > 0 && (
                        <div className="text-lg font-medium text-gray-700">
                          Uploading side photo...{" "}
                          {Math.round(uploadProgress.side)}%
                        </div>
                      )}
                      {!uploadProgress.id &&
                        !uploadProgress.front &&
                        !uploadProgress.side && (
                          <div className="text-lg font-medium text-gray-700">
                            Processing... <br />
                            Please do not refresh or close the page
                          </div>
                        )}
                    </div>
                    <img
                      src="https://myrocky.com/wp-content/themes/salient-child/img/please_wait_animation.gif"
                      alt=""
                      style={{ margin: "0 auto" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentPage === 23 && formData.completion_state === "Full" && (
            <div className="relative min-h-screen w-full bg-[#F5F4EF] overflow-hidden flex flex-col">
              <div className="absolute inset-0 hidden md:block">
                <img
                  src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/wl-web.png"
                  alt="Background"
                  className="w-full h-full object-cover object-right brightness-110 contrast-105"
                />
              </div>
              <div className="absolute inset-0 block md:hidden">
                <img
                  src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/wl-m.png"
                  alt="Background"
                  className="w-full h-[110vh] object-cover object-bottom brightness-110 contrast-105"
                />
              </div>
              <div className="relative w-full text-center pt-5 pb-3 z-10">
                <Link
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push("/");
                  }}
                  className="inline-block cursor-pointer mx-auto"
                >
                  <div className="scale-125">
                    <Logo />
                  </div>
                </Link>
              </div>
              <div className="relative flex-1 flex flex-col items-center justify-start px-6 z-10 pt-8 md:pt-16">
                <div className="text-center max-w-md md:max-w-xl mx-auto">
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#C19A6B] mb-2">
                    Thank you for
                  </h2>
                  <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-[#C19A6B] mb-10">
                    filling the form!
                  </h2>

                  <div className="mt-4 mb-10">
                    <p className="text-xl md:text-2xl text-gray-800 mb-4 md:mb-6">
                      Follow us
                    </p>

                    <div className="flex items-center justify-center space-x-6 md:space-x-8">
                      <a
                        href="https://www.facebook.com/people/Rocky-Health-Inc/100084461297628/"
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          className="md:w-7 md:h-7"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                        </svg>
                      </a>
                      <a
                        href="https://www.instagram.com/myrocky/"
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          className="md:w-7 md:h-7"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </a>
                      <a
                        href="https://twitter.com/myrockyca"
                        className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-200 flex items-center justify-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          className="md:w-7 md:h-7"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </div>
              </div>{" "}
              <div className="relative w-full px-6 z-10 pb-6 md:pb-8 mt-4 md:mt-auto">
                <div className="max-w-md md:max-w-lg mx-auto">
                  <button
                    onClick={() => (window.location.href = "/")}
                    className="w-full bg-white text-black py-4 md:py-5 px-6 rounded-full text-base md:text-xl font-medium shadow-md hover:bg-gray-100 transition-colors"
                  >
                    Go back home
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
