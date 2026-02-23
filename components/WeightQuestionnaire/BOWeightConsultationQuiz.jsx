"use client";

// This is a separate WL Consultation Questionnaire dedicated ONLY for new BO flows
// It includes all standard questions PLUS migrated questions from the pre-quiz
// This component is completely independent from the default WeightConsultationQuiz

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
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";

// Pages 1-5: Migrated pre-quiz questions (moved to start)
// Pages 6-27: Standard WL questionnaire questions (22 pages)
// Page 32: Thank you page
// Total: 32 pages (added allergic reaction question, pen injector question, side effects question, and personalized dose question)
const TOTAL_PAGES = 32;

export default function NewBOWLConsultationQuiz({
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
        const ttl = localStorage.getItem("new-bo-wl-consultation-form-expiry");
        if (ttl && now.getTime() < parseInt(ttl)) {
          const stored = localStorage.getItem("new-bo-wl-consultation-form");
          if (stored) {
            return JSON.parse(stored);
          }
        }
      } catch (e) {
        logger.error("Error loading new BO form data from localStorage:", e);
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
      source_site: "https://myrocky.ca",
      flow_type: "new-bo", // Identify this as new BO flow
      // Standard fields (same as default questionnaire)
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
      "l-617_1": "",
      "l-617_2": "",
      "l-617_3": "",
      618_1: "",
      618_2: "",
      618_3: "",
      619: "",
      606: "",
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
      "624_1": "",
      "624_2": "",
      "624_3": "",
      "624_4": "",
      "624_5": "",
      "624_6": "",
      "623_1": "",
      "623_2": "",
      "623_3": "",
      "623_4": "",
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
      "l-616_1-textarea": "",
      620: "",
      197: "",
      198: "",
      wp_order_id: "",
      product_name: "",
      // Migrated pre-quiz fields (using same field names as pre-quiz)
      sex: "", // Sex assigned at birth (from pre-quiz step 3)
      pregnantOrbreastfeeding: "", // Do any of these apply to you? (from pre-quiz step 4)
      medications: "", // Do you take any of the following medications? (from pre-quiz step 6)
      eatingDisorderDiagnosis: "", // Have you ever been diagnosed with an eating disorder? (from pre-quiz step 7)
      medicalConditions: "", // Do you have any of the following medical conditions? (from pre-quiz step 8)
      // Additional pre-quiz fields that may be used
      accomplishment: "",
      weightImpactStatements: "",
      pre_quiz_q1: "",
      pre_quiz_q2: "",
      pre_quiz_q3: "",
      pre_quiz_q4: "",
      pre_quiz_q5: "",
    };
  };

  const router = useRouter();
  const formRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);

  useQuestionnaireStepTracking({
    questionnaireId: "bo-weight-consultation",
    stepId: currentPage,
    stepIndex: currentPage,
    flowId: "weight-loss",
    stepType: "quiz",
  });

  const [progress, setProgress] = useState(0);
  const [formData, setFormData] = useState(getInitialFormData());
  const [isClient, setIsClient] = useState(false);
  const [isMovingForward, setIsMovingForward] = useState(true);
  const [showPregnancyPopup, setShowPregnancyPopup] = useState(false);
  const [showMedicationPopup, setShowMedicationPopup] = useState(false);
  const [showEatingDisorderPopup, setShowEatingDisorderPopup] = useState(false);
  const [showMedicalConditionPopup, setShowMedicalConditionPopup] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  // Additional state for standard questionnaire pages
  const [photoIdAcknowledged, setPhotoIdAcknowledged] = useState(false);
  const [photoIdFile, setPhotoIdFile] = useState(null);
  const [frontPhotoFile, setFrontPhotoFile] = useState(null);
  const [sidePhotoFile, setSidePhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ front: 0, side: 0, id: 0 });
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showHighBpWarning, setShowHighBpWarning] = useState(false);
  const [showVeryHighBpWarning, setShowVeryHighBpWarning] = useState(false);
  const [showUnknownBpWarning, setShowUnknownBpWarning] = useState(false);
  const [bpWarningAcknowledged, setBpWarningAcknowledged] = useState(false);
  const [
    showNoAppointmentAcknowledgement,
    setShowNoAppointmentAcknowledgement,
  ] = useState(false);
  const [noAppointmentAcknowledged, setNoAppointmentAcknowledged] =
    useState(false);
  const [buttonState, setButtonState] = useState({
    visible: false,
    disabled: false,
    opacity: 1,
  });
  const [question1ButtonVisible, setQuestion1ButtonVisible] = useState(true);
  const fileInputRef = useRef(null);
  const frontPhotoInputRef = useRef(null);
  const sidePhotoInputRef = useRef(null);

  useEffect(() => {
    setIsClient(true);
    // Load from localStorage on mount
    const stored = localStorage.getItem("new-bo-wl-consultation-form");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.page_step) {
          setCurrentPage(parseInt(parsed.page_step) || 1);
          setProgress(Math.ceil((parseInt(parsed.page_step) / TOTAL_PAGES) * 100));
        }
      } catch (e) {
        logger.error("Error loading stored page:", e);
      }
    }

    // Load pre-consultation data from localStorage (same as WeightConsultationQuiz)
    try {
      // Load BMI data from new-bo-preqiz-data
      let storedWeightData = localStorage.getItem("new-bo-preqiz-data");
      if (storedWeightData) {
        const weightData = JSON.parse(storedWeightData);
        const userData = weightData.userData || {};

        if (userData.weight) {
          setFormData((prev) => ({
            ...prev,
            wl_weight: `${userData.weight} lbs`,
          }));
        }

        if (userData.height && userData.height.feet && userData.height.inches) {
          setFormData((prev) => ({
            ...prev,
            wl_height: `${userData.height.feet}ft ${userData.height.inches}in`,
          }));
        }

        if (userData.bmi) {
          setFormData((prev) => ({
            ...prev,
            wl_BMI: userData.bmi,
          }));
        }

        // Load pre_quiz_q fields
        const preQuizUpdates = {};
        Object.keys(weightData).forEach((key) => {
          if (key.startsWith("pre_quiz_q")) {
            preQuizUpdates[key] = weightData[key];
          }
        });

        if (Object.keys(preQuizUpdates).length > 0) {
          setFormData((prev) => ({
            ...prev,
            ...preQuizUpdates,
          }));
        }
      }

      // Load flow2 data from new-bo-essential-consul
      let storedFlow2Data = localStorage.getItem("new-bo-essential-consul");
      if (storedFlow2Data) {
        const flow2Data = JSON.parse(storedFlow2Data);

        const flow2Updates = {};

        if (flow2Data.eatingDisorderDiagnosis) {
          flow2Updates.eatingDisorderDiagnosis =
            flow2Data.eatingDisorderDiagnosis;
        }

        if (flow2Data.medicalConditions) {
          flow2Updates.medicalConditions = flow2Data.medicalConditions;
        }

        if (flow2Data.medications) {
          flow2Updates.medications = flow2Data.medications;
        }

        if (flow2Data.pregnantOrbreastfeeding) {
          flow2Updates.pregnantOrbreastfeeding =
            flow2Data.pregnantOrbreastfeeding;
        }

        if (flow2Data.accomplishment) {
          if (Array.isArray(flow2Data.accomplishment)) {
            flow2Updates.accomplishment =
              flow2Data.accomplishment.join(", ");
          } else {
            flow2Updates.accomplishment = flow2Data.accomplishment;
          }
        }

        if (flow2Data.weightImpactStatements) {
          if (Array.isArray(flow2Data.weightImpactStatements)) {
            flow2Updates.weightImpactStatements =
              flow2Data.weightImpactStatements.join(", ");
          } else {
            flow2Updates.weightImpactStatements =
              flow2Data.weightImpactStatements;
          }
        }

        // Load pre_quiz_q fields from essential-consul
        Object.keys(flow2Data).forEach((key) => {
          if (key.startsWith("pre_quiz_q")) {
            flow2Updates[key] = flow2Data[key];
          }
        });

        if (Object.keys(flow2Updates).length > 0) {
          setFormData((prev) => ({
            ...prev,
            ...flow2Updates,
          }));
        }
      }

      // Load id/token/entrykey from localStorage if available
      const storedForm = localStorage.getItem("new-bo-wl-consultation-form");
      if (storedForm) {
        try {
          const parsed = JSON.parse(storedForm);
          if (parsed.id || parsed.token || parsed.entrykey) {
            setFormData((prev) => ({
              ...prev,
              id: parsed.id || prev.id || "",
              token: parsed.token || prev.token || "",
              entrykey: parsed.entrykey || prev.entrykey || "",
            }));
          }
        } catch (e) {
          logger.error("Error loading stored questionnaire data:", e);
        }
      }
    } catch (error) {
      logger.error("Error loading new BO pre-consultation data:", error);
    }
  }, []);

  // Queue-based submission system (same as default questionnaire)
  const queueFormSubmission = (data) => {
    setPendingSubmissions((prev) => [...prev, { data, timestamp: Date.now() }]);
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

  const updateLocalStorage = (dataToStore = formData) => {
    if (typeof window !== "undefined") {
      const now = new Date();
      const ttl = now.getTime() + 1000 * 60 * 60; // 1 hour
      try {
        const dataToSave = {
          ...dataToStore,
          id: dataToStore.id || formData.id || "",
          token: dataToStore.token || formData.token || "",
          entrykey: dataToStore.entrykey || formData.entrykey || "",
        };
        localStorage.setItem("new-bo-wl-consultation-form", JSON.stringify(dataToSave));
        localStorage.setItem("new-bo-wl-consultation-form-expiry", ttl.toString());
        return true;
      } catch (error) {
        logger.error("Error storing data in local storage:", error);
        return false;
      }
    }
    return false;
  };

  const updateFormDataAndStorage = (updates) => {
    const updated = { ...formData, ...updates };
    setFormData(updated);
    updateLocalStorage(updated);
    return updated;
  };

  // Loader functions for upload feedback
  const showLoader = () => {
    // You can implement a loading overlay here if needed
    // For now, we'll rely on the button disabled state
  };

  const hideLoader = () => {
    // You can hide loading overlay here if needed
  };

  // Collect cumulative data for submission (includes all pages up to currentPage)
  const collectCumulativeData = () => {
    const pageDataMap = {
      // Pages 1-5: Migrated pre-quiz questions (moved to start)
      1: { sex: formData["sex"] },
      2: { pregnantOrbreastfeeding: formData["pregnantOrbreastfeeding"] },
      3: { medications: formData["medications"] },
      4: { eatingDisorderDiagnosis: formData["eatingDisorderDiagnosis"] },
      5: { medicalConditions: formData["medicalConditions"] },
      // Pages 6-27: Standard WL questionnaire questions (22 pages)
      6: { 601: formData["601"] },
      7: { 602: formData["602"] },
      8: { 603: formData["603"] },
      9: {
        "604_1": formData["604_1"],
        "604_2": formData["604_2"],
        "604_3": formData["604_3"],
        "604_4": formData["604_4"],
        "604_5": formData["604_5"],
        "604_6": formData["604_6"],
        "l-604_6-textarea": formData["l-604_6-textarea"],
      },
      10: { 617: formData["617"], "l-617_1-textarea": formData["l-617_1-textarea"] },
      11: {
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
      12: { 606: formData["606"] },
      13: {
        "607_1": formData["607_1"],
        "607_2": formData["607_2"],
        "607_3": formData["607_3"],
        "607_4": formData["607_4"],
        "607_5": formData["607_5"],
        "607_6": formData["607_6"],
        "l-607_5-textarea": formData["l-607_5-textarea"],
      },
      14: {
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
        "l-608_3-textarea": formData["l-608_3-textarea"],
        "l-608_4-textarea": formData["l-608_4-textarea"],
        "l-608_5-textarea": formData["l-608_5-textarea"],
        "l-608_6-textarea": formData["l-608_6-textarea"],
        "l-608_7-textarea": formData["l-608_7-textarea"],
        "l-608_8-textarea": formData["l-608_8-textarea"],
        "l-608_9-textarea": formData["l-608_9-textarea"],
      },
      15: { 609: formData["609"] },
      16: { 610: formData["610"] },
      17: { 611: formData["611"] },
      18: {
        "612_1": formData["612_1"],
        "612_2": formData["612_2"],
        "612_3": formData["612_3"],
        "612_4": formData["612_4"],
        "l-612_4-textarea": formData["l-612_4-textarea"],
      },
      19: { 620: formData["620"] },
      20: {
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
      21: {
        "621_1": formData["621_1"],
        "621_2": formData["621_2"],
        "621_3": formData["621_3"],
        "621_4": formData["621_4"],
      },
      22: {
        "622_1": formData["622_1"],
        "622_2": formData["622_2"],
        "622_3": formData["622_3"],
        "622_4": formData["622_4"],
      },
      23: {
        "624_1": formData["624_1"],
        "624_2": formData["624_2"],
        "624_3": formData["624_3"],
        "624_4": formData["624_4"],
        "624_5": formData["624_5"],
        "624_6": formData["624_6"],
      },
      24: {
        "623_1": formData["623_1"],
        "623_2": formData["623_2"],
        "623_3": formData["623_3"],
        "623_4": formData["623_4"],
      },
      25: { 614: formData["614"], "l-614_1-textarea": formData["l-614_1-textarea"] },
      26: {
        "615_1": formData["615_1"],
        "615_2": formData["615_2"],
        "615_3": formData["615_3"],
        "615_4": formData["615_4"],
        "615_5": formData["615_5"],
        "l-615_2-textarea": formData["l-615_2-textarea"],
        "l-615_3-textarea": formData["l-615_3-textarea"],
      },
      27: { 616: formData["616"], "l-616_1-textarea": formData["l-616_1-textarea"] },
      28: {
        619: formData["619"],
        618_1: formData["618_1"],
        618_2: formData["618_2"],
        618_3: formData["618_3"],
        "l-617_1": formData["l-617_1"],
        "l-617_2": formData["l-617_2"],
        "l-617_3": formData["l-617_3"],
      },
      29: { photo_id_acknowledged: photoIdAcknowledged ? "1" : "" },
      30: { 196: formData["196"] },
      31: {
        // Body photos
        197: formData["197"],
        198: formData["198"],
      },
      32: {}, // Thank you page
    };

    let cumulativeData = {};
    for (let page = 1; page <= currentPage; page++) {
      if (pageDataMap[page]) {
        cumulativeData = { ...cumulativeData, ...pageDataMap[page] };
      }
    }

    const filteredData = {};
    Object.entries(cumulativeData).forEach(([key, value]) => {
      if (key === "_ui" || key === ".ui") return;
      if (value !== undefined && value !== null && value !== "") {
        filteredData[key] = value;
      }
    });

    // Add BMI data if available
    if (formData.wl_weight) filteredData.wl_weight = formData.wl_weight;
    if (formData.wl_height) filteredData.wl_height = formData.wl_height;
    if (formData.wl_BMI) filteredData.wl_BMI = formData.wl_BMI;

    // Add pre-quiz fields (using same field names as pre-quiz)
    const preQuizFields = [
      "sex",
      "pregnantOrbreastfeeding",
      "medications",
      "eatingDisorderDiagnosis",
      "medicalConditions",
      "accomplishment",
      "weightImpactStatements",
    ];
    preQuizFields.forEach((field) => {
      const value = formData[field];
      if (value !== undefined && value !== null && value !== "") {
        if (Array.isArray(value)) {
          filteredData[field] = value.join(", ");
        } else {
          filteredData[field] = value;
        }
      }
    });

    // Check localStorage for new BO pre-quiz data (same pattern as WeightConsultationQuiz)
    try {
      if (typeof window !== "undefined") {
        // First check new-bo-essential-consul
        const storedEssentialConsul = localStorage.getItem("new-bo-essential-consul");
        if (storedEssentialConsul) {
          const essentialData = JSON.parse(storedEssentialConsul);

          // Extract fields starting with "pre_quiz_q"
          Object.keys(essentialData).forEach((key) => {
            if (key.startsWith("pre_quiz_q")) {
              const value = essentialData[key];
              if (value !== undefined && value !== null && value !== "") {
                if (!filteredData[key] || filteredData[key] === "") {
                  filteredData[key] = value;
                }
              }
            }
          });

          // Extract flow2Fields
          preQuizFields.forEach((field) => {
            const value = essentialData[field];
            if (value !== undefined && value !== null && value !== "") {
              if (!filteredData[field] || filteredData[field] === "") {
                if (Array.isArray(value)) {
                  filteredData[field] = value.join(", ");
                } else {
                  filteredData[field] = value;
                }
              }
            }
          });
        }

        // Also check new-bo-preqiz-data for pre_quiz_q fields and BMI data
        const storedWeightData = localStorage.getItem("new-bo-preqiz-data");
        if (storedWeightData) {
          const weightData = JSON.parse(storedWeightData);
          const userData = weightData.userData || {};
          
          // Include BMI data from localStorage if not already in filteredData
          if (userData.weight && (!filteredData.wl_weight || filteredData.wl_weight === "")) {
            filteredData.wl_weight = `${userData.weight} lbs`;
          }
          if (userData.height && userData.height.feet && userData.height.inches && (!filteredData.wl_height || filteredData.wl_height === "")) {
            filteredData.wl_height = `${userData.height.feet}ft ${userData.height.inches}in`;
          }
          if (userData.bmi && (!filteredData.wl_BMI || filteredData.wl_BMI === "")) {
            filteredData.wl_BMI = userData.bmi;
          }
          
          // Include pre_quiz_q fields from userData
          if (userData) {
            Object.keys(userData).forEach((key) => {
              if (key.startsWith("pre_quiz_q")) {
                const value = userData[key];
                if (value !== undefined && value !== null && value !== "") {
                  if (!filteredData[key] || filteredData[key] === "") {
                    filteredData[key] = value;
                  }
                }
              }
            });
          }
        }
      }
    } catch (error) {
      logger.error("Error loading new BO pre-quiz data:", error);
    }

    return filteredData;
  };

  const collectCurrentPageData = () => {
    const pageDataMap = {
      // Pages 1-5: Migrated pre-quiz questions (moved to start)
      1: { sex: formData["sex"] },
      2: { pregnantOrbreastfeeding: formData["pregnantOrbreastfeeding"] },
      3: { medications: formData["medications"] },
      4: { eatingDisorderDiagnosis: formData["eatingDisorderDiagnosis"] },
      5: { medicalConditions: formData["medicalConditions"] },
      // Pages 6-27: Standard WL questionnaire questions (22 pages)
      6: { 601: formData["601"] },
      7: { 602: formData["602"] },
      8: { 603: formData["603"] },
      9: {
        "604_1": formData["604_1"],
        "604_2": formData["604_2"],
        "604_3": formData["604_3"],
        "604_4": formData["604_4"],
        "604_5": formData["604_5"],
        "604_6": formData["604_6"],
        "l-604_6-textarea": formData["l-604_6-textarea"],
      },
      10: { 617: formData["617"], "l-617_1-textarea": formData["l-617_1-textarea"] },
      11: {
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
      12: { 606: formData["606"] },
      13: {
        "607_1": formData["607_1"],
        "607_2": formData["607_2"],
        "607_3": formData["607_3"],
        "607_4": formData["607_4"],
        "607_5": formData["607_5"],
        "607_6": formData["607_6"],
        "l-607_5-textarea": formData["l-607_5-textarea"],
      },
      14: {
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
        "l-608_3-textarea": formData["l-608_3-textarea"],
        "l-608_4-textarea": formData["l-608_4-textarea"],
        "l-608_5-textarea": formData["l-608_5-textarea"],
        "l-608_6-textarea": formData["l-608_6-textarea"],
        "l-608_7-textarea": formData["l-608_7-textarea"],
        "l-608_8-textarea": formData["l-608_8-textarea"],
        "l-608_9-textarea": formData["l-608_9-textarea"],
      },
      15: { 609: formData["609"] },
      16: { 610: formData["610"] },
      17: { 611: formData["611"] },
      18: {
        "612_1": formData["612_1"],
        "612_2": formData["612_2"],
        "612_3": formData["612_3"],
        "612_4": formData["612_4"],
        "l-612_4-textarea": formData["l-612_4-textarea"],
      },
      19: { 620: formData["620"] },
      20: {
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
      21: {
        "621_1": formData["621_1"],
        "621_2": formData["621_2"],
        "621_3": formData["621_3"],
        "621_4": formData["621_4"],
      },
      22: {
        "622_1": formData["622_1"],
        "622_2": formData["622_2"],
        "622_3": formData["622_3"],
        "622_4": formData["622_4"],
      },
      23: {
        "624_1": formData["624_1"],
        "624_2": formData["624_2"],
        "624_3": formData["624_3"],
        "624_4": formData["624_4"],
        "624_5": formData["624_5"],
        "624_6": formData["624_6"],
      },
      24: {
        "623_1": formData["623_1"],
        "623_2": formData["623_2"],
        "623_3": formData["623_3"],
        "623_4": formData["623_4"],
      },
      25: { 614: formData["614"], "l-614_1-textarea": formData["l-614_1-textarea"] },
      26: {
        "615_1": formData["615_1"],
        "615_2": formData["615_2"],
        "615_3": formData["615_3"],
        "615_4": formData["615_4"],
        "615_5": formData["615_5"],
        "l-615_2-textarea": formData["l-615_2-textarea"],
        "l-615_3-textarea": formData["l-615_3-textarea"],
      },
      27: { 616: formData["616"], "l-616_1-textarea": formData["l-616_1-textarea"] },
      28: {
        619: formData["619"],
        618_1: formData["618_1"],
        618_2: formData["618_2"],
        618_3: formData["618_3"],
        "l-617_1": formData["l-617_1"],
        "l-617_2": formData["l-617_2"],
        "l-617_3": formData["l-617_3"],
      },
      29: { photo_id_acknowledged: photoIdAcknowledged ? "1" : "" },
      30: { 196: formData["196"] },
      31: {
        // Body photos
        197: formData["197"],
        198: formData["198"],
      },
      32: {}, // Thank you page
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
        page_step: dataToSubmit.page_step || currentPage,
        completion_state: (dataToSubmit.completion_state && dataToSubmit.completion_state !== "") ? dataToSubmit.completion_state : "Partial",
        completion_percentage: dataToSubmit.completion_percentage !== undefined && dataToSubmit.completion_percentage !== null ? dataToSubmit.completion_percentage : progress,
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

  // Handlers for new pre-quiz questions
  const handleSexSelect = (value) => {
    updateFormDataAndStorage({ sex: value });
    queueFormSubmission({ sex: value });
    moveToNextSlide();
  };

  const handlePregnantBreastfeedingSelect = (value) => {
    updateFormDataAndStorage({ pregnantOrbreastfeeding: value });
    queueFormSubmission({ pregnantOrbreastfeeding: value });
    
    // Show popup if pregnant or breastfeeding
    if (value === "pregnant" || value === "breastfeeding") {
      setShowPregnancyPopup(true);
    } else {
      moveToNextSlide();
    }
  };

  const handleMedicationsSelect = (value) => {
    updateFormDataAndStorage({ medications: value });
    queueFormSubmission({ medications: value });
    
    // Show popup if medication selected (except "none")
    if (value !== "none") {
      setShowMedicationPopup(true);
    } else {
      moveToNextSlide();
    }
  };

  const handleEatingDisorderSelect = (value) => {
    updateFormDataAndStorage({ eatingDisorderDiagnosis: value });
    queueFormSubmission({ eatingDisorderDiagnosis: value });
    
    // Show popup if "yes" or "maybe"
    if (value === "yes" || value === "maybe") {
      setShowEatingDisorderPopup(true);
    } else {
      moveToNextSlide();
    }
  };

  const handlePreQuizMedicalConditionsSelect = (value) => {
    updateFormDataAndStorage({ medicalConditions: value });
    queueFormSubmission({ medicalConditions: value });
    
    // Show popup if condition selected (except "none")
    if (value !== "none") {
      setShowMedicalConditionPopup(true);
    } else {
      moveToNextSlide();
    }
  };

  // Popup handlers
  const handlePregnancyPopupAcknowledge = () => {
    setShowPregnancyPopup(false);
    moveToNextSlide();
  };

  const handleMedicationPopupAcknowledge = () => {
    setShowMedicationPopup(false);
    moveToNextSlide();
  };

  const handleEatingDisorderPopupAcknowledge = () => {
    setShowEatingDisorderPopup(false);
    moveToNextSlide();
  };

  const handleMedicalConditionPopupAcknowledge = () => {
    setShowMedicalConditionPopup(false);
    moveToNextSlide();
  };

  // Standard questionnaire handlers (adapted from WeightConsultationQuiz.jsx)
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

  const moveToNextSlideWithoutValidation = () => {
    moveToNextSlide();
  };

  const handleCurrentMedicationSelect = async (option) => {
    clearError();
    let updates = { 601: option };
    
    if (option === "Yes") {
      // Clear questions 602 and 603 since we're skipping them
      updates = {
        ...updates,
        602: "",
        603: "",
      };
    } else if (option === "No") {
      // Clear medication selection since they're not currently using any
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
    
    setFormData((prev) => ({ ...prev, ...updates }));
    updateFormDataAndStorage(updates);
    queueFormSubmission(updates);
    
    if (option === "Yes") {
      // Navigate directly to medication selection page (page 9 = question 604)
      setTimeout(() => {
        setIsMovingForward(true);
        setCurrentPage(9);
        setFormData((prev) => {
          const updated = {
            ...prev,
            page_step: 9,
            navigation_type: "from_current_medication_yes",
          };
          updateLocalStorage(updated);
          return updated;
        });
        setProgress(Math.ceil((9 / TOTAL_PAGES) * 100));
      }, 10);
    } else {
      // Navigate to next question (page 7 = question 602)
      setTimeout(() => moveToNextSlideWithoutValidation(), 10);
    }
  };

  const handlePreviousMedicationSelect = (option) => {
    clearError();
    let updates = { 602: option };
    
    if (option === "Yes") {
      // Clear question 603 since we're skipping it
      updates = {
        ...updates,
        603: "",
      };
    } else if (option === "No") {
      // Clear medication selection since they haven't used any before
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
    
    setFormData((prev) => ({ ...prev, ...updates }));
    updateFormDataAndStorage(updates);
    queueFormSubmission(updates);
    
    if (option === "Yes") {
      // Navigate directly to medication selection page (page 9 = question 604)
      setTimeout(() => {
        setIsMovingForward(true);
        setCurrentPage(9);
        setFormData((prev) => {
          const updated = {
            ...prev,
            page_step: 9,
            navigation_type: "from_previous_medication_yes",
          };
          updateLocalStorage(updated);
          return updated;
        });
        setProgress(Math.ceil((9 / TOTAL_PAGES) * 100));
      }, 10);
    } else {
      // Navigate to next question (page 8 = question 603)
      setTimeout(() => moveToNextSlideWithoutValidation(), 10);
    }
  };

  const handleHelpOptionSelect = (option) => {
    clearError();
    setFormData((prev) => ({ ...prev, 603: option }));
    updateFormDataAndStorage({ 603: option });
    queueFormSubmission({ 603: option });
    setTimeout(() => moveToNextSlideWithoutValidation(), 10);
  };

  const handleMedicationSelect = (fieldId, option) => {
    clearError();
    const newFormData = { ...formData };
    if (newFormData[fieldId] === option) {
      newFormData[fieldId] = "";
    } else {
      newFormData[fieldId] = option;
    }
    if (fieldId === "604_6" && newFormData[fieldId] !== "Other") {
      newFormData["l-604_6-textarea"] = "";
    }
    setFormData(newFormData);
    updateLocalStorage(newFormData);
    queueFormSubmission(newFormData);
  };

  const handleMedicationTextareaChange = (e) => {
    const value = e.target.value;
    updateFormDataAndStorage({ "l-604_6-textarea": value });
  };

  const handleWeightGoalChange = (e) => {
    const value = e.target.value;
    if (value.includes("-")) return;
    updateFormDataAndStorage({
      "l-617_1-textarea": value,
      617: value,
    });
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
  };

  const handleWeightGainTextChange = (option, e) => {
    const value = e.target.value;
    const newFormData = { ...formData, [`l-${option}-textarea`]: value };
    setFormData(newFormData);
    updateLocalStorage(newFormData);
  };

  const handleBloodPressureSelect = (option) => {
    clearError();
    if (option !== "141/91 to 179/99 (High)") {
      setBpWarningAcknowledged(false);
    }
    const updatedFormData = { ...formData, 606: option };
    setFormData(updatedFormData);
    updateLocalStorage(updatedFormData);
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
  };

  const handleTextAreaChange = (optionId, e) => {
    const value = e.target.value;
    const fieldKey = `l-${optionId}-textarea`;
    const newFormData = { ...formData, [fieldKey]: value };
    setFormData(newFormData);
    updateLocalStorage(newFormData);
    // Queue submission for textarea changes
    queueFormSubmission({ [fieldKey]: value });
  };

  const handleWeightLossMethodSelect = (optionId) => {
    clearError();
    const weightLossMethodsMap = {
      "608_1": "Specialized diet (Paleo or Atkins)",
      "608_2": "Weight loss plans (Weight Watchers)",
      "608_3": "Therapy or counseling",
      "608_4": "Working with a dietitian",
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
  };

  const handleWeightConcernSelect = (option) => {
    clearError();
    setFormData((prev) => ({ ...prev, 609: option }));
    updateFormDataAndStorage({ 609: option });
    queueFormSubmission({ 609: option });
    setTimeout(() => moveToNextSlideWithoutValidation(), 10);
  };

  const handleDietDescriptionSelect = (option) => {
    clearError();
    setFormData((prev) => ({ ...prev, 610: option }));
    updateFormDataAndStorage({ 610: option });
    queueFormSubmission({ 610: option });
    setTimeout(() => moveToNextSlideWithoutValidation(), 10);
  };

  const handleExerciseFrequencySelect = (option) => {
    clearError();
    setFormData((prev) => ({ ...prev, 611: option }));
    updateFormDataAndStorage({ 611: option });
    queueFormSubmission({ 611: option });
    setTimeout(() => moveToNextSlideWithoutValidation(), 10);
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
    setFormData(newFormData);
    updateLocalStorage(newFormData);
    queueFormSubmission(newFormData);
  };

  const handleSideEffectsSelect = (option) => {
    clearError();
    setFormData((prev) => ({ ...prev, 620: option }));
    updateFormDataAndStorage({ 620: option });
    queueFormSubmission({ 620: option });
    setTimeout(() => moveToNextSlideWithoutValidation(), 10);
  };

  const handleMedicalConditionsSelect = (optionId) => {
    clearError();
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
    const newFormData = { ...formData };
    if (newFormData[optionId]) {
      newFormData[optionId] = "";
      if (["613_5", "613_7", "613_10", "613_11"].includes(optionId)) {
        newFormData[`l-${optionId}-textarea`] = "";
      }
    } else {
      newFormData[optionId] = actualValue;
      if (optionId === "613_12") {
        for (let i = 1; i <= 11; i++) {
          newFormData[`613_${i}`] = "";
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
  };

  const handleAllergiesSelect = (option) => {
    clearError();
    if (option === "No") {
      const updates = { 614: option, "l-614_1-textarea": "" };
      setFormData((prev) => ({ ...prev, ...updates }));
      updateFormDataAndStorage(updates);
      queueFormSubmission(updates);
      setTimeout(() => moveToNextSlideWithoutValidation(), 10);
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
      queueFormSubmission(updates);
      // Button state will be updated by useEffect based on checkHasAnswer()
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
          newFormData[`615_${i}`] = "";
        }
        newFormData["l-615_2-textarea"] = "";
        newFormData["l-615_3-textarea"] = "";
      } else {
        newFormData["615_5"] = "";
      }
    }
    setFormData(newFormData);
    updateLocalStorage(newFormData);
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

    setButtonState((state) => ({
      ...state,
      visible: true,
      disabled: !hasSelection,
    }));

    queueFormSubmission(newFormData);
  };

  const handleHealthcareQuestionsSelect = (option) => {
    clearError();
    setFormData((prev) => ({ ...prev, 616: option }));
    updateFormDataAndStorage({ 616: option });
    queueFormSubmission({ 616: option });
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

  const verifyCustomerAndProceed = async () => {
    if (formData["196"] && !photoIdFile) {
      // Photo already uploaded, navigate to body photos page
      const updatedData = updateFormDataAndStorage({
        page_step: 31,
      });
      queueFormSubmission(updatedData);
      setIsMovingForward(true);
      setCurrentPage(31);
      setProgress(Math.ceil((31 / TOTAL_PAGES) * 100));
      return;
    }

    if (!photoIdFile) {
      renderError("Please upload a photo ID");
      return;
    }

    try {
      setIsUploading(true);
      showLoader();

      const uploadedS3Url = await handlePhotoIdUpload();

      // Only queue submission of the photo ID URL, don't re-submit all data
      queueFormSubmission({ 196: uploadedS3Url });

      // Navigate to next page (body photos upload - page 31) after successful upload
      setIsMovingForward(true);
      setCurrentPage(31);
      setFormData((prev) => {
        const updated = {
          ...prev,
          page_step: 31,
        };
        updateLocalStorage(updated);
        return updated;
      });
      setProgress(Math.ceil((31 / TOTAL_PAGES) * 100));
    } catch (error) {
      logger.error("Photo upload error:", error);
      
      let errorMessage = "An error occurred during verification. Please try again.";
      
      if (error.message && error.message.includes("File size exceeds")) {
        errorMessage =
          "The file size exceeds the maximum allowed size of 20MB. Please select a smaller image.";
      } else if (
        error.message &&
        error.message.includes("Only JPG, JPEG, PNG, HEIF, and HEIC")
      ) {
        errorMessage =
          "Only JPG, JPEG, PNG, HEIF, and HEIC images are supported. Please select a different image.";
      } else if (error.message && error.message.includes("presigned")) {
        errorMessage =
          "Failed to get upload permission. Please try again or contact support.";
      } else if (error.message && error.message.includes("CORS")) {
        errorMessage =
          "Upload failed due to security restrictions. Please contact support and mention 'CORS error'.";
      }
      
      renderError(errorMessage);
    } finally {
      setIsUploading(false);
      hideLoader();
    }
  };

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
      const preview = document.getElementById("frontPhotoPreview");
      if (preview) {
        preview.src = "https://myrocky.ca/wp-content/themes/salient-child/img/photo_upload_icon.png";
      }
      setFrontPhotoFile(null);
      return;
    }

    setFrontPhotoFile(file);

    const updateUI = (previewSrc) => {
      const label = document.querySelector("label[for=front_photo_upload]");
      if (label) {
        label.innerHTML = `
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
      }
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
      const preview = document.getElementById("sidePhotoPreview");
      if (preview) {
        preview.src = "https://myrocky.ca/wp-content/themes/salient-child/img/photo_upload_icon.png";
      }
      setSidePhotoFile(null);
      return;
    }

    setSidePhotoFile(file);

    const updateUI = (previewSrc) => {
      const label = document.querySelector("label[for=side_photo_upload]");
      if (label) {
        label.innerHTML = `
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
      }
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

      // Update formData with photo URLs
      const updatedData = {
        ...formData,
        197: frontS3Url,
        198: sideS3Url,
        completion_percentage: 100,
        completion_state: "Full",
        stage: "body-photos-upload",
        page_step: 32,
      };

      setFormData(updatedData);
      updateLocalStorage(updatedData);
      
      // Only queue the new photo URLs, not all form data
      queueFormSubmission({ 
        197: frontS3Url, 
        198: sideS3Url,
        completion_percentage: 100,
        completion_state: "Full",
        stage: "body-photos-upload",
        page_step: 32,
      });

      const frontLabel = document.querySelector("label[for=front_photo_upload]");
      const sideLabel = document.querySelector("label[for=side_photo_upload]");
      if (frontLabel) frontLabel.style.borderColor = "green";
      if (sideLabel) sideLabel.style.borderColor = "green";

      setIsMovingForward(true);
      setCurrentPage(32);
      setProgress(100);
      setUploadSuccess(true);
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

      const frontLabel = document.querySelector("label[for=front_photo_upload]");
      const sideLabel = document.querySelector("label[for=side_photo_upload]");
      if (frontLabel) frontLabel.style.borderColor = "red";
      if (sideLabel) sideLabel.style.borderColor = "red";
    } finally {
      setIsUploadingPhotos(false);
      setUploadProgress({ front: 0, side: 0, id: 0 });
      hideLoader();
    }
  };

  const isValidated = () => {
    const showError = (message) => {
      return renderError(message);
    };

    // Pages 1-5: Pre-quiz questions
    if (currentPage === 1 && !formData["sex"]) {
      return showError("Please select an option");
    }
    if (currentPage === 2 && !formData["pregnantOrbreastfeeding"]) {
      return showError("Please select an option");
    }
    if (currentPage === 3 && !formData["medications"]) {
      return showError("Please select at least one option");
    }
    if (currentPage === 4 && !formData["eatingDisorderDiagnosis"]) {
      return showError("Please select an option");
    }
    if (currentPage === 5 && !formData["medicalConditions"]) {
      return showError("Please select at least one option");
    }

    // Standard questionnaire pages
    if (currentPage === 6 && !formData["601"]) return showError("Please select an option");
    if (currentPage === 7 && !formData["602"]) return showError("Please select an option");
    if (currentPage === 8 && !formData["603"]) return showError("Please select an option");
    
    if (currentPage === 9) {
      const hasSelection = formData["604_1"] || formData["604_2"] || formData["604_3"] || 
                          formData["604_4"] || formData["604_5"] || formData["604_6"];
      if (!hasSelection) return showError("Please select at least one option");
      if (formData["604_6"] === "Other" && !formData["l-604_6-textarea"]?.trim()) {
        return showError("Please provide medication details");
      }
    }
    
    if (currentPage === 10 && (!formData["617"] || !formData["617"].trim())) {
      return showError("Please enter your weight loss goal");
    }
    
    if (currentPage === 11) {
      const hasSelection = formData["605_1"] || formData["605_2"] || formData["605_3"] || 
                          formData["605_4"] || formData["605_5"] || formData["605_6"] || formData["605_7"];
      if (!hasSelection) return showError("Please select at least one option");
      if (formData["605_1"] && !formData["l-605_1-textarea"]?.trim()) return showError("Please specify the medication");
      if (formData["605_2"] && !formData["l-605_2-textarea"]?.trim()) return showError("Please specify the illness or injury");
      if (formData["605_4"] && !formData["l-605_4-textarea"]?.trim()) return showError("Please specify the mental health issue");
      if (formData["605_5"] && !formData["l-605_5-textarea"]?.trim()) return showError("Please specify the procedure");
      if (formData["605_6"] && !formData["l-605_6-textarea"]?.trim()) return showError("Please specify the other reason");
    }
    
    if (currentPage === 12 && !formData["606"]) return showError("Please select an option");
    if (currentPage === 13) {
      const hasSelection = formData["607_1"] || formData["607_2"] || formData["607_3"] || 
                          formData["607_4"] || formData["607_5"] || formData["607_6"];
      if (!hasSelection) return showError("Please select at least one option");
      if (formData["607_5"] && !formData["l-607_5-textarea"]?.trim()) {
        return showError("Please provide details about the other procedure");
      }
    }
    if (currentPage === 14) {
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
    }
    if (currentPage === 15 && !formData["609"]) return showError("Please select an option");
    if (currentPage === 16 && !formData["610"]) return showError("Please select an option");
    if (currentPage === 17 && !formData["611"]) return showError("Please select an option");
    if (currentPage === 18) {
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
    }
    if (currentPage === 19 && !formData["620"]) {
      return showError("Please select an option");
    }
    if (currentPage === 20) {
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
    }
    if (currentPage === 21) {
      const hasSelection =
        formData["621_1"] ||
        formData["621_2"] ||
        formData["621_3"] ||
        formData["621_4"];
      if (!hasSelection) {
        return showError("Please select at least one option");
      }
    }
    if (currentPage === 22) {
      const hasSelection =
        formData["622_1"] ||
        formData["622_2"] ||
        formData["622_3"] ||
        formData["622_4"];
      if (!hasSelection) {
        return showError("Please select at least one option");
      }
    }
    if (currentPage === 23) {
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
    }
    if (currentPage === 24) {
      const hasSelection =
        formData["623_1"] ||
        formData["623_2"] ||
        formData["623_3"] ||
        formData["623_4"];
      if (!hasSelection) {
        return showError("Please select at least one option");
      }
    }
    if (currentPage === 25) {
      if (!formData["614"]) {
        return showError("Please select an option");
      }
      if (formData["614"] === "Yes" && !formData["l-614_1-textarea"]?.trim()) {
        return showError("Please specify your allergies");
      }
    }
    if (currentPage === 26) {
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
    }
    if (currentPage === 27) {
      if (!formData["616"]) {
        return showError("Please select an option");
      }
      if (formData["616"] === "Yes" && !formData["l-616_1-textarea"]?.trim()) {
        return showError("Please enter your questions");
      }
    }
    if (currentPage === 28 && !formData["619"]) {
      return showError("Please make a selection");
    }
    if (currentPage === 28 && formData["619"] === "No" && !formData["618_1"]) {
      setShowNoAppointmentAcknowledgement(true);
      return false;
    }
    if (currentPage === 29 && !photoIdAcknowledged) {
      return showError("Please acknowledge that you will upload your photo ID");
    }
    if (currentPage === 30 && !photoIdFile && !formData["196"]) {
      return showError("Please upload your photo ID to continue");
    }
    if (currentPage === 31) {
      if (!frontPhotoFile && !formData["197"]) {
        return showError("Please upload a front view photo");
      }
      if (!sidePhotoFile && !formData["198"]) {
        return showError("Please upload a side view photo");
      }
    }

    clearError();
    return true;
  };

  const handleContinueClick = () => {
    clearError();
    if (isValidated()) {
      if (currentPage === 28) {
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

      if (currentPage === 30) {
        if (photoIdFile || formData["196"]) {
          verifyCustomerAndProceed();
          return;
        } else {
          renderError("Please upload your photo ID to continue");
          return;
        }
      }

      if (currentPage === 31) {
        handleBodyPhotosUpload();
        return;
      }

      // Special handling for page 11 (question 605 - weight gain contributors)
      // Equivalent to page 6 in standard WeightConsultationQuiz
      if (currentPage === 11) {
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

      // Navigation logic matching WeightConsultationQuiz, adjusted for BO's 5 extra pre-quiz pages
      // Pages 6-8 in BO correspond to pages 1-3 in standard
      if (currentPage === 6 && formData["601"] === "Yes") {
        setIsMovingForward(true);
        setCurrentPage(9);
        setFormData((prev) => {
          const updated = {
            ...prev,
            page_step: 9,
            navigation_type: "from_current_medication_yes",
          };
          updateLocalStorage(updated);
          return updated;
        });
        const newProgress = Math.ceil((9 / TOTAL_PAGES) * 100);
        setProgress(Math.max(0, newProgress));
      } else if (currentPage === 7 && formData["602"] === "Yes") {
        setIsMovingForward(true);
        setCurrentPage(9);
        setFormData((prev) => {
          const updated = {
            ...prev,
            page_step: 9,
            navigation_type: "from_previous_medication_yes",
          };
          updateLocalStorage(updated);
          return updated;
        });
        const newProgress = Math.ceil((9 / TOTAL_PAGES) * 100);
        setProgress(Math.max(0, newProgress));
      } else {
      moveToNextSlide();
      }
    }
  };

  const moveToNextSlide = () => {
    if (currentPage >= TOTAL_PAGES) {
      handleBodyPhotosUpload();
      return;
    }
    setIsMovingForward(true);
    let nextPage = currentPage + 1;
    let navigationType = formData.navigation_type || "";

    // Navigation logic matching WeightConsultationQuiz, adjusted for BO's 5 extra pre-quiz pages
    // In BO: Page 6 = question 601, Page 7 = question 602, Page 8 = question 603, Page 9 = question 604
    // In standard: Page 1 = question 601, Page 2 = question 602, Page 3 = question 603, Page 4 = question 604
    if (currentPage === 6 && formData["601"] === "Yes") {
      // If currently using medication, go directly to medication selection (page 9 = question 604)
      nextPage = 9;
      navigationType = "from_current_medication_yes";
    } else if (currentPage === 7 && formData["602"] === "Yes") {
      // If previously used medication, go directly to medication selection (page 9 = question 604)
      nextPage = 9;
      navigationType = "from_previous_medication_yes";
    } else if (currentPage === 8) {
      // After question 603, skip to page 10 (weight loss goal question 617)
      // In standard flow, page 3 goes to page 5, but in BO we need to account for pre-quiz pages
      nextPage = 10;
    }

    setCurrentPage(nextPage);
    setFormData((prev) => {
      const updated = {
        ...prev,
        page_step: nextPage,
        navigation_type: navigationType,
      };
      updateLocalStorage(updated);
      return updated;
    });
    const newProgress = Math.ceil((nextPage / TOTAL_PAGES) * 100);
    setProgress(Math.max(0, newProgress));
  };

  // Update button visibility based on form data
  useEffect(() => {
    if (!isClient) return;

    const checkHasAnswer = () => {
      // Pages 1-5: Pre-quiz questions
      if (currentPage === 1) return !!formData["sex"];
      if (currentPage === 2) return !!formData["pregnantOrbreastfeeding"];
      if (currentPage === 3) return !!formData["medications"];
      if (currentPage === 4) return !!formData["eatingDisorderDiagnosis"];
      if (currentPage === 5) return !!formData["medicalConditions"];

      // Standard questionnaire pages
      if (currentPage === 6) return !!formData["601"];
      if (currentPage === 7) return !!formData["602"];
      if (currentPage === 8) return !!formData["603"];
      if (currentPage === 9) {
        const hasSelection = formData["604_1"] || formData["604_2"] || formData["604_3"] || 
                            formData["604_4"] || formData["604_5"] || formData["604_6"];
        if (!hasSelection) return false;
        if (formData["604_6"] === "Other") return !!formData["l-604_6-textarea"]?.trim();
        return true;
      }
      if (currentPage === 10) return !!formData["617"]?.trim();
      if (currentPage === 11) {
        const hasSelection = formData["605_1"] || formData["605_2"] || formData["605_3"] || 
                            formData["605_4"] || formData["605_5"] || formData["605_6"] || formData["605_7"];
        if (!hasSelection) return false;
        if (formData["605_1"] && !formData["l-605_1-textarea"]?.trim()) return false;
        if (formData["605_2"] && !formData["l-605_2-textarea"]?.trim()) return false;
        if (formData["605_4"] && !formData["l-605_4-textarea"]?.trim()) return false;
        if (formData["605_5"] && !formData["l-605_5-textarea"]?.trim()) return false;
        if (formData["605_6"] && !formData["l-605_6-textarea"]?.trim()) return false;
        return true;
      }
      if (currentPage === 12) return !!formData["606"];
      if (currentPage === 13) {
        // Weight loss surgery - checkbox question (607_1 through 607_6)
        const hasSelection = formData["607_1"] || formData["607_2"] || formData["607_3"] || 
                            formData["607_4"] || formData["607_5"] || formData["607_6"];
        if (!hasSelection) return false;
        // If "Other procedure" is selected, require textarea
        if (formData["607_5"] && !formData["l-607_5-textarea"]?.trim()) return false;
        return true;
      }
      if (currentPage === 14) {
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

        if (!hasSelection) return false;

        for (let i = 1; i <= 9; i++) {
          const optionId = `608_${i}`;
          if (formData[optionId] && !formData[`l-${optionId}-textarea`]) {
            return false;
          }
        }

        return true;
      }
      if (currentPage === 15) return !!formData["609"];
      if (currentPage === 16) return !!formData["610"];
      if (currentPage === 17) return !!formData["611"];
      if (currentPage === 18) {
        const hasSelection =
          formData["612_1"] ||
          formData["612_2"] ||
          formData["612_3"] ||
          formData["612_4"];

        if (!hasSelection) return false;

        if (formData["612_4"] && !formData["l-612_4-textarea"]) {
          return false;
        }

        return true;
      }
      if (currentPage === 19) return !!formData["620"];
      if (currentPage === 20) {
        let hasSelection = false;
        for (let i = 1; i <= 12; i++) {
          if (formData[`613_${i}`]) {
            hasSelection = true;
            break;
          }
        }

        if (!hasSelection) return false;

        if (formData["613_5"] && !formData["l-613_5-textarea"]) {
          return false;
        }
        if (formData["613_7"] && !formData["l-613_7-textarea"]) {
          return false;
        }
        if (formData["613_10"] && !formData["l-613_10-textarea"]) {
          return false;
        }
        if (formData["613_11"] && !formData["l-613_11-textarea"]) {
          return false;
        }

        return true;
      }
      if (currentPage === 21) {
        const hasSelection =
          formData["621_1"] ||
          formData["621_2"] ||
          formData["621_3"] ||
          formData["621_4"];
        return hasSelection;
      }
      if (currentPage === 22) {
        const hasSelection =
          formData["622_1"] ||
          formData["622_2"] ||
          formData["622_3"] ||
          formData["622_4"];
        return hasSelection;
      }
      if (currentPage === 23) {
        const hasSelection =
          formData["624_1"] ||
          formData["624_2"] ||
          formData["624_3"] ||
          formData["624_4"] ||
          formData["624_5"] ||
          formData["624_6"];
        return hasSelection;
      }
      if (currentPage === 24) {
        const hasSelection =
          formData["623_1"] ||
          formData["623_2"] ||
          formData["623_3"] ||
          formData["623_4"];
        return hasSelection;
      }
      if (currentPage === 25) {
        if (!formData["614"]) return false;
        if (formData["614"] === "Yes" && !formData["l-614_1-textarea"]?.trim()) return false;
        return true;
      }
      if (currentPage === 26) {
        const hasSelection =
          formData["615_1"] ||
          formData["615_2"] ||
          formData["615_3"] ||
          formData["615_4"] ||
          formData["615_5"];

        if (!hasSelection) return false;

        if (formData["615_2"] && !formData["l-615_2-textarea"]) {
          return false;
        }
        if (formData["615_3"] && !formData["l-615_3-textarea"]) {
          return false;
        }

        return true;
      }
      if (currentPage === 27) {
        if (!formData["616"]) return false;
        if (formData["616"] === "Yes" && !formData["l-616_1-textarea"]?.trim()) {
          return false;
        }
        return true;
      }
      if (currentPage === 28) return !!formData["619"];
      if (currentPage === 29) return photoIdAcknowledged;
      if (currentPage === 30) return !!(photoIdFile || formData["196"]);
      if (currentPage === 31) {
        // Show continue button on body photos page when both photos are selected
        return !!(frontPhotoFile && sidePhotoFile);
      }
      
      return true; // Default: show button for other pages
    };

    const hasAnswer = checkHasAnswer();
    
    const continueButton = formRef.current?.querySelector(".quiz-continue-button");
    if (continueButton) {
      continueButton.style.display = "block";
      // For page 30 (Photo ID upload), always show the button (it will be disabled if no photo)
      if (currentPage === 30) {
        continueButton.style.visibility = "visible";
      } else {
        if (currentPage === 1) {
          setQuestion1ButtonVisible(hasAnswer);
        } else {
          continueButton.style.visibility = hasAnswer ? "visible" : "hidden";
        }
      }
    }

    if (currentPage === 29) {
      if (continueButton) {
        continueButton.disabled = !photoIdAcknowledged;
        continueButton.style.opacity = photoIdAcknowledged ? "1" : "0.5";
      }
    } else if (currentPage === 30) {
      const isReady = (photoIdFile && !isUploading) || !!formData["196"];
      if (continueButton) {
        continueButton.disabled = !isReady;
        continueButton.style.opacity = isReady ? "1" : "0.5";
      }
      // Set buttonState to ensure button is visible (disabled state controlled above)
      setButtonState({
        visible: true,
        disabled: !isReady,
        opacity: isReady ? 1 : 0.5,
      });
    } else if (currentPage === 31) {
      // For page 31, show continue button when both photos are selected
      const bothPhotosSelected = !!(frontPhotoFile && sidePhotoFile);
      setButtonState({
        visible: bothPhotosSelected,
        disabled: !bothPhotosSelected || isUploadingPhotos,
        opacity: bothPhotosSelected && !isUploadingPhotos ? 1 : 0.5,
      });
    } else {
      setButtonState({
        visible: hasAnswer,
        disabled: !hasAnswer || isUploadingPhotos,
        opacity: hasAnswer ? 1 : 0.5,
      });
    }
  }, [currentPage, formData, photoIdAcknowledged, photoIdFile, frontPhotoFile, sidePhotoFile, isClient, isUploadingPhotos, isUploading]);

  // Handle photo ID acknowledgment page (page 29) - hide continue button initially
  useEffect(() => {
    if (currentPage === 29) {
      const continueButton = document.querySelector(".quiz-continue-button");
      if (continueButton) {
        continueButton.style.visibility = "hidden";
      }
    }
  }, [currentPage]);

  const moveToPreviousSlide = () => {
    setIsMovingForward(false);

    if (currentPage > 1) {
      let prevPage = currentPage - 1;

      // Navigation logic matching WeightConsultationQuiz, adjusted for BO's 5 extra pre-quiz pages
      // In BO: Page 9 = question 604, Page 10 = question 617
      // In standard: Page 4 = question 604, Page 5 = question 617
      if (currentPage === 9) {
        // If on medication selection page (604), go back to the correct previous question
        if (
          formData["601"] === "Yes" ||
          formData.navigation_type === "from_current_medication_yes"
        ) {
          prevPage = 6; // Go back to question 601 (current medication)
        } else if (
          formData["602"] === "Yes" ||
          formData.navigation_type === "from_previous_medication_yes"
        ) {
          prevPage = 7; // Go back to question 602 (previous medication)
        }
      } else if (currentPage === 10) {
        // If on weight loss goal page (617), go back to the correct previous question
        if (
          formData["601"] === "Yes" ||
          formData.navigation_type === "from_current_medication_yes"
        ) {
          prevPage = 9; // Go back to medication selection (604)
        } else if (
          formData["602"] === "Yes" ||
          formData.navigation_type === "from_previous_medication_yes"
        ) {
          prevPage = 9; // Go back to medication selection (604)
        } else {
          prevPage = 8; // Go back to question 603 (how can we help)
        }
      }

      setCurrentPage(prevPage);
      setFormData((prev) => ({
        ...prev,
        page_step: prevPage,
      }));

      const newProgress = Math.ceil((prevPage / TOTAL_PAGES) * 100);
      setProgress(Math.max(0, newProgress));

      updateLocalStorage();
    }
  };

  const slideVariants = {
    hiddenRight: { x: "100%", opacity: 0 },
    hiddenLeft: { x: "-100%", opacity: 0 },
    visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: "easeInOut" } },
    exitRight: { x: "-100%", opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
    exitLeft: { x: "100%", opacity: 0, transition: { duration: 0.3, ease: "easeInOut" } },
  };

  return (
    <div className="flex flex-col min-h-screen bg-white subheaders-font font-medium">
      {currentPage !== 32 && (
        <>
      <QuestionnaireNavbar
        onBackClick={moveToPreviousSlide}
        currentPage={currentPage}
            isThankYouPage={false}
      />
      <ProgressBar progress={progress} />
        </>
      )}

      <div className="flex-1" ref={formRef}>
        {/* Quiz Pages 1-31 - Inside constrained wrapper */}
        {currentPage !== 32 && (
          <div className="quiz-page-wrapper relative md:container md:w-[768px] mx-auto bg-[#FFFFFF]">
            <div className="relative min-h-[400px] flex items-start md:w-[520px] mx-auto px-5 md:px-0 md:mb-16">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPage}
                  variants={slideVariants}
                  initial={isMovingForward ? "hiddenRight" : "hiddenLeft"}
                  animate="visible"
                  exit={isMovingForward ? "exitRight" : "exitLeft"}
                  className="w-full"
                >
              {/* Pages 1-5: Migrated pre-quiz questions (moved to start) */}
              {/* Page 1: Sex Assigned at Birth */}
              {currentPage === 1 && (
                <QuestionLayout
                  title="Please select your assigned gender at birth"
                  currentPage={currentPage}
                  pageNo={1}
                  questionId="sex"
                >
                  {["Male", "Female"].map((option, index) => (
                    <QuestionOption
                      key={`sex-option-${index}`}
                      id={`sex_${index + 1}`}
                      name="sex"
                      value={option}
                      checked={formData["sex"] === option}
                      onChange={() => handleSexSelect(option)}
                      type="radio"
                    />
                  ))}
                </QuestionLayout>
              )}

              {/* Page 2: Pregnant/Breastfeeding */}
              {currentPage === 2 && (
                <QuestionLayout
                  title="Do any of these apply to you?"
                  currentPage={currentPage}
                  pageNo={2}
                  questionId="pregnantOrbreastfeeding"
                >
                  {[
                    { id: "pregnant", label: "I am pregnant" },
                    { id: "breastfeeding", label: "I am currently breastfeeding" },
                    { id: "none", label: "None of the above" },
                  ].map((option) => (
                    <QuestionOption
                      key={option.id}
                      id={option.id}
                      name="pregnantOrbreastfeeding"
                      value={option.id}
                      label={option.label}
                      checked={formData["pregnantOrbreastfeeding"] === option.id}
                      onChange={() => handlePregnantBreastfeedingSelect(option.id)}
                      type="radio"
                    />
                  ))}
                </QuestionLayout>
              )}

              {/* Page 3: Medications */}
              {currentPage === 3 && (
                <QuestionLayout
                  title="Do you take any of the following medications?"
                  currentPage={currentPage}
                  pageNo={3}
                  questionId="medications"
                >
                  {[
                    { id: "none", label: "None of the below" },
                    {
                      id: "sulfonylureas",
                      label: "Sulfonylureas (i.e. Gliclazide or glimepiride)",
                    },
                    { id: "insulin", label: "Insulin" },
                    { id: "meglitinides", label: "Meglitinides" },
                    { id: "furosemide", label: "Furosemide (Lasix)" },
                    {
                      id: "ssris",
                      label: "SSRIs (fluoxetine, citalopram, sertraline, escitalopram)",
                    },
                  ].map((option) => (
                    <QuestionOption
                      key={option.id}
                      id={option.id}
                      name="medications"
                      value={option.id}
                      label={option.label}
                      checked={formData["medications"] === option.id}
                      onChange={() => handleMedicationsSelect(option.id)}
                      type="radio"
                    />
                  ))}
                </QuestionLayout>
              )}

              {/* Page 4: Eating Disorder Diagnosis */}
              {currentPage === 4 && (
                <QuestionLayout
                  title="Have you ever been diagnosed with an eating disorder?"
                  currentPage={currentPage}
                  pageNo={4}
                  questionId="eatingDisorderDiagnosis"
                >
                  {[
                    { id: "no", label: "No" },
                    { id: "yes", label: "Yes" },
                    { id: "maybe", label: "No, but I think I may have one" },
                  ].map((option) => (
                    <QuestionOption
                      key={option.id}
                      id={option.id}
                      name="eatingDisorderDiagnosis"
                      value={option.id}
                      label={option.label}
                      checked={formData["eatingDisorderDiagnosis"] === option.id}
                      onChange={() => handleEatingDisorderSelect(option.id)}
                      type="radio"
                    />
                  ))}
                </QuestionLayout>
              )}

              {/* Page 5: Medical Conditions */}
              {currentPage === 5 && (
                <QuestionLayout
                  title="Do you have any of the following medical conditions?"
                  currentPage={currentPage}
                  pageNo={5}
                  questionId="medicalConditions"
                >
                  {[
                    { id: "none", label: "None of the below" },
                    {
                      id: "men2",
                      label: "Multiple Endocrine Neoplasia Type 2",
                    },
                    {
                      id: "thyroid",
                      label: "Personal or family history of medullary thyroid cancer",
                    },
                    { id: "retinopathy", label: "Diabetic retinopathy" },
                    {
                      id: "liverKidney",
                      label: "Chronic liver or kidney disease",
                    },
                    {
                      id: "eatingDisorder",
                      label: "Receiving treatment or consultation for an eating disorder",
                    },
                    {
                      id: "schizophrenia",
                      label: "Schizophrenia or mania/bipolar disorder",
                    },
                  ].map((option) => (
                    <QuestionOption
                      key={option.id}
                      id={option.id}
                      name="medicalConditions"
                      value={option.id}
                      label={option.label}
                      checked={formData["medicalConditions"] === option.id}
                      onChange={() => handlePreQuizMedicalConditionsSelect(option.id)}
                      type="radio"
                    />
                  ))}
                </QuestionLayout>
              )}

              {/* Pages 6-27: Standard WL questionnaire questions (22 pages) */}
              {/* Page 6: Currently using weight loss medication */}
              {currentPage === 6 && (
                <QuestionLayout
                  title="Are you currently using weight loss medication?"
                  currentPage={currentPage}
                  pageNo={6}
                  questionId="601"
                >
                  {["Yes", "No"].map((option, index) => (
                    <QuestionOption
                      key={`medication-option-${index}`}
                      id={`601_${index + 1}`}
                      name="601"
                      value={option}
                      checked={formData["601"] === option}
                      onChange={() => handleCurrentMedicationSelect(option)}
                      type="radio"
                    />
                  ))}
                </QuestionLayout>
              )}

              {/* Page 7: Have you ever been on weight loss medication before */}
              {currentPage === 7 && (
                <QuestionLayout
                  title="Have you ever been on weight loss medication before?"
                  currentPage={currentPage}
                  pageNo={7}
                  questionId="602"
                >
                  {["Yes", "No"].map((option, index) => (
                    <QuestionOption
                      key={`past-medication-option-${index}`}
                      id={`602_${index + 1}`}
                      name="602"
                      value={option}
                      checked={formData["602"] === option}
                      onChange={() => handlePreviousMedicationSelect(option)}
                      type="radio"
                    />
                  ))}
                </QuestionLayout>
              )}

              {/* Page 8: How can we help today */}
              {currentPage === 8 && (
                <QuestionLayout
                  title="How can we help today?"
                  currentPage={currentPage}
                  pageNo={8}
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

              {/* Page 9: Which weight loss medication */}
              {currentPage === 9 && (
                <QuestionLayout
                  title="Which weight loss medication are you currently taking?"
                  currentPage={currentPage}
                  pageNo={9}
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
                        handleMedicationSelect(option.id, option.value)
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

              {/* Page 10: How much weight are you hoping to lose */}
              {currentPage === 10 && (
                <QuestionLayout
                  title="How much weight are you hoping to lose?"
                  currentPage={currentPage}
                  pageNo={10}
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

              {/* Page 11: Weight gain contributors */}
              {currentPage === 11 && (
                <QuestionLayout
                  title="Have any of the following contributed to your weight gain?"
                  currentPage={currentPage}
                  pageNo={11}
                  questionId="605"
                  inputType="checkbox"
                >
                  <div className="flex flex-col w-full gap-2">
                    {[
                      {
                        id: "605_1",
                        value: "Medications",
                        addsTextArea: true,
                        placeholder: "Please state the name of the medication",
                      },
                      {
                        id: "605_2",
                        value: "Illness or injury",
                        addsTextArea: true,
                        placeholder: "Please state the illness or injury",
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
                        placeholder: "Please state the procedure you had",
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
                      <div key={option.id} className="option-container">
                        <QuestionOption
                          id={option.id}
                          name={option.id}
                          value={option.value}
                          checked={!!formData[option.id]}
                          onChange={() =>
                            handleWeightGainContributorsSelect(option.id)
                          }
                          type="checkbox"
                          isNoneOption={option.isNoneOption}
                        />{" "}
                        {option.addsTextArea && formData[option.id] && (
                          <QuestionAdditionalInput
                            id={`l-${option.id}-textarea`}
                            name={`l-${option.id}-textarea`}
                            placeholder={option.placeholder}
                            value={
                              formData[`l-${option.id}-textarea`] || ""
                            }
                            onChange={(e) =>
                              handleWeightGainTextChange(option.id, e)
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </QuestionLayout>
              )}

              {/* Page 12: Blood pressure */}
              {currentPage === 12 && (
                <QuestionLayout
                  title="What was your most recent blood pressure reading?"
                  subtitle="Please provide your blood pressure reading taken within the last 6 months."
                  notes="Your blood pressure helps us determine if it is safe for you to use certain types of weight loss medication."
                  currentPage={currentPage}
                  pageNo={12}
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
                      onChange={() => handleBloodPressureSelect(option.value)}
                      type="radio"
                    />
                  ))}
                </QuestionLayout>
              )}

              {/* Page 13: Weight loss surgery */}
              {currentPage === 13 && (
                <QuestionLayout
                  title="Have you ever had weight loss surgery?"
                  currentPage={currentPage}
                  pageNo={13}
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
                      <div key={option.id} className="option-container">
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
                        {option.addsTextArea && formData[option.id] && (
                          <QuestionAdditionalInput
                            id="l-607_5-textarea"
                            name="l-607_5-textarea"
                            placeholder="Please list the procedure done"
                            value={formData["l-607_5-textarea"] || ""}
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

              {/* Page 14: How have you tried to lose weight in the past */}
              {currentPage === 14 && (
                <QuestionLayout
                  title="How have you tried to lose weight in the past?"
                  currentPage={currentPage}
                  pageNo={14}
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
                        value: "I have not tried to lose weight in the past",
                        isNoneOption: true,
                      },
                    ].map((option) => (
                      <div key={option.id} className="option-container">
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

                        {option.addsTextArea && formData[option.id] && (
                          <QuestionAdditionalInput
                            id={`l-${option.id}-textarea`}
                            name={`l-${option.id}-textarea`}
                            placeholder={option.placeholder}
                            value={
                              formData[`l-${option.id}-textarea`] || ""
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

              {/* Page 15: How long have you had concerns about your body weight */}
              {currentPage === 15 && (
                <QuestionLayout
                  title="How long have you had concerns about your body weight?"
                  currentPage={currentPage}
                  pageNo={15}
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
                      <div key={option.id} className="option-container">
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

              {/* Page 16: How would you describe your diet in the past week */}
              {currentPage === 16 && (
                <QuestionLayout
                  title="How would you describe your diet in the past week?"
                  currentPage={currentPage}
                  pageNo={16}
                  questionId="610"
                >
                  <div className="flex flex-col w-full gap-2">
                    {[
                      { id: "610_1", value: "Healthy" },
                      { id: "610_2", value: "Somewhat healthy" },
                      { id: "610_3", value: "Somewhat unhealthy" },
                      { id: "610_4", value: "Very unhealthy" },
                    ].map((option) => (
                      <div key={option.id} className="option-container">
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

              {/* Page 17: How many days per week do you exercise */}
              {currentPage === 17 && (
                <QuestionLayout
                  title="How many days per week do you exercise 30 minutes or more?"
                  currentPage={currentPage}
                  pageNo={17}
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
                      <div key={option.id} className="option-container">
                        <QuestionOption
                          id={option.id}
                          name="611"
                          value={option.value}
                          checked={formData["611"] === option.value}
                          onChange={() =>
                            handleExerciseFrequencySelect(option.value)
                          }
                          type="radio"
                        />
                      </div>
                    ))}
                  </div>
                </QuestionLayout>
              )}

              {/* Page 18: What do you hope to achieve by losing weight */}
              {currentPage === 18 && (
                <QuestionLayout
                  title="What do you hope to achieve by losing weight?"
                  currentPage={currentPage}
                  pageNo={18}
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
                      <div key={option.id} className="option-container">
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

                        {option.addsTextArea && formData[option.id] && (
                          <QuestionAdditionalInput
                            id={`l-${option.id}-textarea`}
                            name={`l-${option.id}-textarea`}
                            placeholder="Please specify..."
                            value={
                              formData[`l-${option.id}-textarea`] || ""
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

              {/* Page 19: Would you prefer a version of this medication */}
              {currentPage === 19 && (
                <QuestionLayout
                  title="Would you prefer a version of this medication that's less likely to cause side effects like nausea, stomach discomfort, or diarrhea?"
                  currentPage={currentPage}
                  pageNo={19}
                  questionId="620"
                >
                  <div className="flex flex-col w-full gap-2">
                    {[
                      { id: "620_1", value: "Yes" },
                      { id: "620_2", value: "No" },
                      { id: "620_3", value: "Not sure" },
                    ].map((option) => (
                      <div key={option.id} className="option-container">
                        <QuestionOption
                          id={option.id}
                          name="620"
                          value={option.value}
                          checked={formData["620"] === option.value}
                          onChange={() => handleSideEffectsSelect(option.value)}
                          type="radio"
                        />
                      </div>
                    ))}
                  </div>
                </QuestionLayout>
              )}

              {/* Page 20: Do you have any of the following medical conditions */}
              {currentPage === 20 && (
                <QuestionLayout
                  title="Do you have any of the following medical conditions"
                  currentPage={currentPage}
                  pageNo={20}
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
                      <div key={option.id} className="option-container">
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
                                formData[`l-${option.id}-textarea`] || ""
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

              {/* Page 21: Have you ever had an allergic reaction to GLP-1 medications */}
              {currentPage === 21 && (
                <QuestionLayout
                  title="Have you ever had an allergic reaction, sensitivity, or intolerance to any ingredient in approved GLP-1 medications?"
                  currentPage={currentPage}
                  pageNo={21}
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
              )}

              {/* Page 22: Do you have difficulty using the standard pen-injector devices */}
              {currentPage === 22 && (
                <QuestionLayout
                  title="Do you have difficulty using the standard pen-injector devices?"
                  currentPage={currentPage}
                  pageNo={22}
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
              )}

              {/* Page 23: Have you previously experienced side effects */}
              {currentPage === 23 && (
                <QuestionLayout
                  title="Have you previously experienced side effects when starting or increasing doses of weight-loss or similar medications?"
                  currentPage={currentPage}
                  pageNo={23}
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
              )}

              {/* Page 24: Would a personalized dose help */}
              {currentPage === 24 && (
                <QuestionLayout
                  title="Would a personalized dose or smaller dose increments help you better tolerate treatment?"
                  currentPage={currentPage}
                  pageNo={24}
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
              )}

              {/* Page 25: Do you have any known allergies */}
              {currentPage === 25 && (
                <QuestionLayout
                  title="Do you have any known allergies?"
                  currentPage={currentPage}
                  pageNo={25}
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
                      <div key={option.id} className="option-container">
                        <QuestionOption
                          id={option.id}
                          name="614"
                          value={option.value}
                          checked={formData["614"] === option.value}
                          onChange={() => handleAllergiesSelect(option.value)}
                          type="radio"
                        />{" "}
                        {option.addsTextArea &&
                          formData["614"] === "Yes" && (
                            <QuestionAdditionalInput
                              id="l-614_1-textarea"
                              name="l-614_1-textarea"
                              placeholder="Please state your allergies"
                              value={formData["l-614_1-textarea"] || ""}
                              onChange={(e) =>
                                handleTextAreaChange("614_1", e)
                              }
                            />
                          )}
                      </div>
                    ))}
                  </div>
                </QuestionLayout>
              )}

              {/* Page 26: Tell us about your lifestyle */}
              {currentPage === 26 && (
                <QuestionLayout
                  title="Tell us about your lifestyle."
                  currentPage={currentPage}
                  pageNo={26}
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
                      <div key={option.id} className="option-container">
                        <QuestionOption
                          id={option.id}
                          name={option.id}
                          value={option.value}
                          checked={!!formData[option.id]}
                          onChange={() => handleLifestyleSelect(option.id)}
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
                                formData[`l-${option.id}-textarea`] || ""
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

              {/* Page 27: Do you have any questions for the healthcare team */}
              {currentPage === 27 && (
                <QuestionLayout
                  title="Do you have any questions for the healthcare team?"
                  currentPage={currentPage}
                  pageNo={27}
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
                      <div key={option.id} className="option-container">
                        <QuestionOption
                          id={option.id}
                          name="616"
                          value={option.value}
                          checked={formData["616"] === option.value}
                          onChange={() =>
                            handleHealthcareQuestionsSelect(option.value)
                          }
                          type="radio"
                        />{" "}
                        {option.addsTextArea &&
                          formData["616"] === "Yes" && (
                            <QuestionAdditionalInput
                              id="l-616_1-textarea"
                              name="l-616_1-textarea"
                              placeholder="What do you want to ask?"
                              value={formData["l-616_1-textarea"] || ""}
                              onChange={(e) =>
                                handleTextAreaChange("616_1", e)
                              }
                            />
                          )}
                      </div>
                    ))}
                  </div>
                </QuestionLayout>
              )}

              {/* Page 28: Would you like to book an appointment */}
              {currentPage === 28 && (
                <QuestionLayout
                  title="Would you like to book an appointment with our health care team?"
                  currentPage={currentPage}
                  pageNo={28}
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
              )}

              {/* Page 29: Upload Photo ID */}
              {currentPage === 29 && (
                <QuestionLayout
                  title="Upload Photo ID"
                  currentPage={currentPage}
                  pageNo={29}
                  questionId="photo_id_acknowledgment"
                  inputType="checkbox"
                >
                  <div className="text-left px-4 mb-6">
                    <p className="text-[#C19A6B] text-lg mb-8">
                      Please note this step is mandatory. If you are unable to
                      complete at this time, email your ID to{" "}
                      <a
                        href="mailto:clinicadmin@myrocky.com"
                        className="underline"
                      >
                        clinicadmin@myrocky.com
                      </a>
                      .
                    </p>
                    <p className="text-lg">
                      Your questionnaire will not be reviewed without this. As
                      per our T&C's a{" "}
                      <span className="font-bold">$45 cancellation fee</span>{" "}
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
                      I hereby understand and acknowledge the above message
                    </label>
                  </div>
                </QuestionLayout>
              )}

              {/* Page 30: Upload Photo ID File */}
              {currentPage === 30 && (
                <div className="w-full">
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
                        className="w-full md:w-[80%] max-w-lg h-40 flex items-center justify-center border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 mb-6 mx-auto relative"
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
                          <>
                            <img
                              id="photo-id-preview"
                              src=""
                              alt="ID Preview"
                              className="max-w-full max-h-36 object-contain"
                            />
                            {isUploading && uploadProgress.id > 0 && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                <div className="text-white text-lg font-medium">
                                  Uploading... {Math.round(uploadProgress.id)}%
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      {photoIdFile && (
                        <div className="mb-6 mt-4 w-full max-w-md mx-auto">
                          <p className="text-center text-xs text-gray-500 mb-4 break-words px-2">
                            Photo selected: {photoIdFile.name}
                          </p>
                        </div>
                      )}
                      {/* Error box under upload box */}
                      <div className="w-full md:w-[80%] max-w-lg mx-auto mb-4">
                        <p className="error-box text-red-500 hidden text-center text-sm"></p>
                      </div>

                      {!photoIdFile && (
                        <div className="w-full max-w-md mx-auto">
                          <p className="text-center text-md font-medium mb-2">
                            Please capture a selfie of yourself holding your ID
                          </p>{" "}
                          <p className="text-center text-sm text-gray-500 mb-8">
                            Only JPG, JPEG, PNG, HEIF, and HEIC images are
                            supported.
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
                </div>
              )}

              {/* Page 31: Please provide full body images */}
              {currentPage === 31 && (
                <QuestionLayout
                  title="Please provide full body images: Front and side views."
                  subtitle="Your body should be clearly visible"
                  currentPage={currentPage}
                  pageNo={31}
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
                            src="https://myrocky.ca/wp-content/themes/salient-child/img/photo_upload_icon.png"
                            id="frontPhotoPreview"
                            alt="Upload icon"
                          />
                          <span className="text-[#C19A6B]">
                            Tap to upload Front View photo
                          </span>
                        </div>
                      </label>
                      <p className="text-center text-sm mt-2 mb-6">
                        Please provide a clear photo of your front view.
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
                            src="https://myrocky.ca/wp-content/themes/salient-child/img/photo_upload_icon.png"
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
                  </div>
              </QuestionLayout>
            )}
                </motion.div>
              </AnimatePresence>
              
              {/* Error Box - matches wl-consultation styling exactly */}
              <p className="error-box text-red-500 hidden m-2 text-center text-sm mx-auto max-w-[90%] md:max-w-md lg:max-w-lg"></p>
              
                <div className="fixed bottom-0 left-0 w-full p-4 z-[9999] bg-white shadow-lg flex items-center justify-center">
                  <button
                    type="button"
                    onClick={handleContinueClick}
                    className={`quiz-continue-button bg-black text-white w-full max-w-md py-4 px-4 rounded-full font-medium text-lg ${
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
                    {isUploadingPhotos
                      ? `Uploading... ${Math.round((uploadProgress.front + uploadProgress.side) / 2)}%`
                      : currentPage === 31
                      ? "Upload and Continue"
                      : "Continue"}
                  </button>
                </div>
            </div>
          </div>
        )}

        {/* Thank You Page - Page 32 - OUTSIDE wrapper for full width */}
        {currentPage === 32 && formData.completion_state === "Full" && (
              <div className="relative min-h-screen w-full bg-[#F5F4EF] overflow-hidden flex flex-col">
                <div className="absolute inset-0 hidden md:block">
                  <img
                    src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/wl-image.png"
                    alt="Background"
                    className="w-full h-full object-contain object-right brightness-110 contrast-105"
                  />
                </div>
                <div className="absolute inset-0 block md:hidden">
                  <img
                    src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/wl-image.png"
                    alt="Background"
                    className="w-full h-[110vh] object-contain object-bottom brightness-110 contrast-105"
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
                      <Logo withLink={false} />
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
                </div>
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
      </div>

      {/* Warning Popups */}
      <WarningPopup
        isOpen={showPregnancyPopup}
        onClose={handlePregnancyPopupAcknowledge}
        title="Please Read"
        message="Our weight loss program wouldn't be a good match for you at this moment."
        showCheckbox={false}
        buttonText="Continue"
        backgroundColor="bg-[#F5F4EF]"
        titleColor="text-[#C19A6B]"
        currentPage={currentPage}
      />
      <WarningPopup
        isOpen={showMedicationPopup}
        onClose={handleMedicationPopupAcknowledge}
        title="Please Read"
        message="Our weight loss program wouldn't be a good match for you at this moment."
        showCheckbox={false}
        buttonText="Continue"
        backgroundColor="bg-[#F5F4EF]"
        titleColor="text-[#C19A6B]"
        currentPage={currentPage}
      />
      <WarningPopup
        isOpen={showEatingDisorderPopup}
        onClose={handleEatingDisorderPopupAcknowledge}
        title="Please Read"
        message="Our weight loss program wouldn't be a good match for you at this moment."
        showCheckbox={false}
        buttonText="Continue"
        backgroundColor="bg-[#F5F4EF]"
        titleColor="text-[#C19A6B]"
        currentPage={currentPage}
      />
      <WarningPopup
        isOpen={showMedicalConditionPopup}
        onClose={handleMedicalConditionPopupAcknowledge}
        title="Please Read"
        message="Our weight loss program wouldn't be a good match for you at this moment."
        showCheckbox={false}
        buttonText="Continue"
        backgroundColor="bg-[#F5F4EF]"
        titleColor="text-[#C19A6B]"
        currentPage={currentPage}
      />
      {/* Blood Pressure Warning Popups */}
      <WarningPopup
        isOpen={showHighBpWarning}
        onClose={() => setShowHighBpWarning(false)}
        title="High Blood Pressure"
        message="This is considered high. We'll be able to give you your prescription but please speak to your doctor to discuss your blood pressure."
        isAcknowledged={bpWarningAcknowledged}
        onAcknowledge={(e) => setBpWarningAcknowledged(e.target.checked)}
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
    </div>
  );
}
