"use client";

import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { QuestionLayout } from "../EdQuestionnaire/QuestionLayout";
import { QuestionOption } from "../EdQuestionnaire/QuestionOption";
import { QuestionAdditionalInput } from "../EdQuestionnaire/QuestionAdditionalInput";
import { motion, AnimatePresence } from "framer-motion";
import QuestionnaireNavbar from "../EdQuestionnaire/QuestionnaireNavbar";
import { ProgressBar } from "../EdQuestionnaire/ProgressBar";
import { WarningPopup } from "../EdQuestionnaire/WarningPopup";
import hairQuestionList from "./hairQuestion";
import Logo from "../Navbar/Logo";
import DOBInput from "../shared/DOBInput";
import Link from "next/link";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";
import { useQuizSequence } from "@/lib/questionnaire/useQuizSequence";
import QuestionnaireIntermission from "@/components/OrderReceived/QuestionnaireIntermission";
import {
  getPrefillStorageKey,
  mapCrmResponseToFormData,
} from "@/lib/questionnairePrefillConfig";
import { getQuizUserInfoError } from "@/utils/quizUserValidation";

const { uploadFileToS3WithProgress } = await import(
  "@/utils/s3/frontend-upload"
);

const HAIR_PREFILL_KEY = getPrefillStorageKey("/hair-main-questionnaire");

export default function HairConsultationQuiz({
  pn,
  userName,
  userEmail,
  province,
  dob,
}) {
  const nameParts = userName ? userName.split(" ") : [];
  const fname = nameParts[0] || "";
  const lname = nameParts[1] || "";
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef(null);

  // Multi-questionnaire sequence
  const {
    showIntermission: hairShowIntermission,
    intermissionProps: hairIntermissionProps,
    handleQuizComplete: hairHandleQuizComplete,
  } = useQuizSequence(router);

  //   date Picker
  const [datePickerValue, setDatePickerValue] = useState("");
  const [intentionalReload, setIntentionalReload] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [prefillCheckDone, setPrefillCheckDone] = useState(false);
  const [isLoadingQuestionnairePrefill, setIsLoadingQuestionnairePrefill] =
    useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isMovingForward, setIsMovingForward] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useQuestionnaireStepTracking({
    questionnaireId: "hair-consultation",
    stepId: currentPage,
    stepIndex: currentPage,
    flowId: "hair",
    stepType: "quiz",
    isPostPurchaseConsultation: true,
  });

  // Fire sequence check when Hair quiz reaches the completion screen (page 22)
  const hairSequenceCheckedRef = useRef(false);
  useEffect(() => {
    if (currentPage === 22 && !hairSequenceCheckedRef.current) {
      hairSequenceCheckedRef.current = true;
      hairHandleQuizComplete();
    }
  }, [currentPage, hairHandleQuizComplete]);

  const [progress, setProgress] = useState(10);
  const [showPopup, setShowPopup] = useState(false);
  const [showUnder18Popup, setShowUnder18Popup] = useState(false);
  const [showFemaleWarning, setShowFemaleWarning] = useState(false);
  const [showLiverWarning, setShowLiverWarning] = useState(false);
  const [liverWarningAcknowledged, setLiverWarningAcknowledged] =
    useState(false);
  const [showBreastCancerWarning, setShowBreastCancerWarning] = useState(false);
  const [breastCancerWarningAcknowledged, setBreastCancerWarningAcknowledged] =
    useState(false);
  const [showProstateCancerWarning, setShowProstateCancerWarning] =
    useState(false);
  const [
    prostateCancerWarningAcknowledged,
    setProstateCancerWarningAcknowledged,
  ] = useState(false);
  const [showScalpSymptomsWarning, setShowScalpSymptomsWarning] =
    useState(false);
  const [scalpSymptomsAcknowledged, setScalpSymptomsAcknowledged] =
    useState(false);
  const [showNameDifferencePopup, setShowNameDifferencePopup] = useState(false);
  const [nameUpdateOption, setNameUpdateOption] = useState("");
  const [selectedScalpSymptoms, setSelectedScalpSymptoms] = useState({
    "23_1": "", // Burning or pain
    "23_2": "", // Patches of rough, scaly skin or scarring
    "23_3": "", // Pustules or crusting
    "23_4": "", // None of these
  });
  const [showMedicalConditionPopup, setShowMedicalConditionPopup] =
    useState(false);
  const [showConditionActivePopup, setShowConditionActivePopup] =
    useState(false);
  const [selectedConditions, setSelectedConditions] = useState({
    "24_1": "", // Scalp psoriasis
    "24_2": "", // Eczema of the scalp
    "24_3": "", // Ringworm infection
    "24_4": "", // Alopecia areata
    "24_5": "", // None of the above
  });
  const [isConditionActive, setIsConditionActive] = useState("");
  const [conditionActiveAcknowledged, setConditionActiveAcknowledged] =
    useState(false);
  const [selectedSexualIssues, setSelectedSexualIssues] = useState({
    "26_1": "", // Premature ejaculation
    "26_2": "", // Low sex drive
    "26_3": "", // Trouble getting or maintaining erections
    "26_4": "", // None of the above
  });
  const [showMentalHealthWarning, setShowMentalHealthWarning] = useState(false);
  const [mentalHealthWarningType, setMentalHealthWarningType] = useState(""); // 'psychosis' or 'suicidal'
  const [mentalHealthWarningAcknowledged, setMentalHealthWarningAcknowledged] =
    useState(false);
  const [selectedMentalHealthConditions, setSelectedMentalHealthConditions] =
    useState({
      "27_1": "", // Depression
      "27_2": "", // Anxiety
      "27_3": "", // Psychosis
      "27_4": "", // Current or past suicidal ideation
      "27_5": "", // Other
      "27_6": "", // None of these
    });
  const [showMedicationInput, setShowMedicationInput] = useState(false);
  const [showOtherMedicalConditionsInput, setShowOtherMedicalConditionsInput] =
    useState(false);
  const [showAllergiesInput, setShowAllergiesInput] = useState(false);
  const [file_data_1, setFileData1] = useState(null);

  const [file_data_2, setFileData2] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const [photoIdFile, setPhotoIdFile] = useState(null);
  const [photoIdAcknowledged, setPhotoIdAcknowledged] = useState(false);
  const [showPhotoIdPopup, setShowPhotoIdPopup] = useState(false);
  const [showNoCallAcknowledgement, setShowNoCallAcknowledgement] =
    useState(false);
  const [noCallAcknowledged, setNoCallAcknowledged] = useState(false);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    form_id: 1,
    action: "hair_questionnaire_data_upload",
    hair_entrykey: "",
    id: "",
    token: "",
    stage: "consultation-after-checkout",
    page_step: 1,
    completion_state: "Partial",
    completion_percentage: 10,
    source_site: process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com",
    131: userEmail || "",
    132: pn || "(000) 000-0000",
    158: dob,
    "161_4": province || "Ontario",
    "130_3": fname || "",
    "130_6": lname || "",
    "selected-dosage": "",
    137: "",
    138: "",
    1: "",
    25: "",
    39: "",
    22: "",
    "23_1": "",
    "23_2": "",
    "23_3": "",
    "23_4": "",
    "24_1": "",
    "24_2": "",
    "24_3": "",
    "24_4": "",
    "24_5": "",
    40: "", // For the "Is it currently active?" question
    "26_1": "",
    "26_2": "",
    "26_3": "",
    "26_4": "",
    "27_1": "",
    "27_2": "",
    "27_3": "",
    "27_4": "",
    "27_5": "",
    "27_6": "",
    36: "", // For the "Other" text input
    28: "", // Yes/No radio selection
    29: "", // Medication details
    30: "", // Yes/No radio selection for other medical conditions
    41: "", // Other medical conditions details
    31: "", // Yes/No radio selection for allergies
    32: "", // Allergies details
    33: "", // Front hairline photo URL
    34: "", // Top of head photo URL
    203: "",
    "35_choice": "", // Store Yes/No choice for display
    35: "",
    37: "",
    "182_1": "",
    "182_2": "",
    "182_3": "",
    "204_1": "",
    "204_2": "",
    "204_3": "",
  });

  const [showThankYou, setShowThankYou] = useState(false);
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);

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

  const calculateAge = (dobString) => {
    if (!dobString) return null;

    const today = new Date();
    const birthDate = new Date(dobString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const shouldSkipDOBPage = () => {
    const dobValue = formData["158"];

    if (!dobValue) {
      logger.log("shouldSkipDOBPage - no DOB value, not skipping");
      return false;
    }

    const age = calculateAge(dobValue);
    const shouldSkip = age !== null && age >= 18;

    return shouldSkip;
  };

  // First unanswered question decides where a portal prefill resumes.
  // Page numbers follow the US flow: question 40 is asked via a popup on
  // page 9, so there is no page 10 here.
  const getTargetPageFromPrefill = (data) => {
    const has = (keys) => {
      if (Array.isArray(keys)) {
        return keys.some(
          (k) => data[k] != null && String(data[k]).trim() !== ""
        );
      }
      return data[keys] != null && String(data[keys]).trim() !== "";
    };
    if (!has("137")) return 1;
    if (!has("138")) return 2;
    if (!has("158")) return 3;
    if (!has("1")) return 4;
    if (!has("25")) return 5;
    if (!has("39")) return 6;
    if (!has("22")) return 7;
    if (!has(["23_1", "23_2", "23_3", "23_4"])) return 8;
    if (!has(["24_1", "24_2", "24_3", "24_4", "24_5"])) return 9;
    if (!has("24_5") && !has("40")) return 9;
    if (!has(["26_1", "26_2", "26_3", "26_4"])) return 11;
    if (!has(["27_1", "27_2", "27_3", "27_4", "27_5", "27_6", "36"])) return 12;
    if (!has("28")) return 13;
    if (!has(["30", "41"])) return 14;
    if (!has(["31", "32"])) return 15;
    if (!has(["33", "34"])) return 16;
    if (!has("203")) return 17;
    if (!has("35")) return 18;
    if (!has("37")) return 19;
    if (!has(["182_1", "182_2", "182_3"])) return 20;
    if (!has(["204_1", "204_2", "204_3"])) return 21;
    return 22;
  };

  useEffect(() => {
    if (!searchParams || prefillCheckDone) return;
    const id = searchParams.get("id");
    const token = searchParams.get("token");
    const patientToken = searchParams.get("patient-token");
    // Portal recovery link arrived with patient-token but missing id/token.
    // Starting a fresh quiz here would create a new CRM entry and orphan
    // the original record, so stop and ask for a new link.
    if (patientToken && (!id || !token)) {
      toast.error(
        "This recovery link is incomplete. Please request a new link from your account."
      );
      return;
    }
    if (!id || !token || !patientToken) {
      setPrefillCheckDone(true);
      return;
    }

    const loadPrefill = async () => {
      setIsLoadingQuestionnairePrefill(true);
      try {
        let answersData = null;
        const cached =
          typeof window !== "undefined" &&
          localStorage.getItem(HAIR_PREFILL_KEY);
        if (cached) {
          try {
            const { id: cachedId, data } = JSON.parse(cached);
            if (cachedId === id && data?.data) {
              answersData = data.data;
              logger.log(
                "[HairConsultationQuiz] Using cached questionnaire-filled-answers"
              );
            }
          } catch {}
        }
        if (!answersData) {
          const res = await fetch("/api/questionnaire-filled-answers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              wp_entry_id: id,
              token,
              patient_token: patientToken,
            }),
          });
          const data = await res.json();
          logger.log("[HairConsultationQuiz] questionnaire-filled-answers:", {
            status: res.status,
            data,
          });
          if (data?.data) {
            answersData = data.data;
            if (typeof window !== "undefined") {
              localStorage.setItem(
                HAIR_PREFILL_KEY,
                JSON.stringify({ id, token, data })
              );
            }
          }
        }
        if (answersData) {
          const mapped = mapCrmResponseToFormData(answersData);
          const merged = { ...formData, id, token, ...mapped };
          const targetPage = getTargetPageFromPrefill(merged);
          const newProgress = Math.max(
            10,
            Math.min(100, Math.ceil((targetPage / 22) * 100))
          );
          const dataToStore = {
            ...merged,
            page_step: targetPage,
            completion_percentage: newProgress,
          };
          setFormData(dataToStore);
          setCurrentPage(targetPage);
          setProgress(newProgress);
          // The load effect below re-reads this draft and restores the
          // checkbox group states from it.
          updateLocalStorage(dataToStore);
        }
      } catch (err) {
        logger.error(
          "[HairConsultationQuiz] questionnaire-filled-answers error:",
          err
        );
      } finally {
        setIsLoadingQuestionnairePrefill(false);
        setPrefillCheckDone(true);
      }
    };
    loadPrefill();
  }, [searchParams, prefillCheckDone]);

  useEffect(() => {
    if (dataLoaded || !prefillCheckDone) return;
    const storedData = readLocalStorage();

    if (!storedData) {
      const initialData = {
        158: dob,
        131: userEmail,
        132: pn,
        "161_4": province,
        "130_3": fname,
        "130_6": lname,
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
      const parsedData = JSON.parse(storedData);
      const mergedData = {
        ...parsedData,
        158: dob || parsedData["158"],
        131: userEmail || parsedData["131"],
        132: pn || parsedData["132"],
        "161_4": province || parsedData["161_4"],
        "130_3": fname || parsedData["130_3"],
        "130_6": lname || parsedData["130_6"],
      };
      setFormData(mergedData);

      if (parsedData.page_step) {
        let savedPage = parseInt(parsedData.page_step);
        if (savedPage === 3) {
          const dobValue = mergedData["158"];
          if (dobValue) {
            const today = new Date();
            const birthDate = new Date(dobValue);
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();

            if (
              monthDiff < 0 ||
              (monthDiff === 0 && today.getDate() < birthDate.getDate())
            ) {
              age--;
            }

            if (age >= 18) {
              savedPage = 4;
            }
          }
        }

        setCurrentPage(savedPage);

        const calculatedProgress = Math.ceil((savedPage / 22) * 100);
        const progressValue = calculatedProgress < 10 ? 10 : calculatedProgress;

        setProgress(progressValue);
      }
      if (parsedData["130_3"]) {
      }
      if (parsedData["130_6"]) {
      }
      setSelectedScalpSymptoms({
        "23_1": parsedData["23_1"] || "",
        "23_2": parsedData["23_2"] || "",
        "23_3": parsedData["23_3"] || "",
        "23_4": parsedData["23_4"] || "",
      });
      setSelectedConditions({
        "24_1": parsedData["24_1"] || "",
        "24_2": parsedData["24_2"] || "",
        "24_3": parsedData["24_3"] || "",
        "24_4": parsedData["24_4"] || "",
        "24_5": parsedData["24_5"] || "",
      });
      setSelectedMentalHealthConditions({
        "27_1": parsedData["27_1"] || "",
        "27_2": parsedData["27_2"] || "",
        "27_3": parsedData["27_3"] || "",
        "27_4": parsedData["27_4"] || "",
        "27_5": parsedData["27_5"] || "",
        "27_6": parsedData["27_6"] || "",
      });
      if (parsedData["204_1"]) {
        setPhotoIdAcknowledged(true);
      }
      if (parsedData["33"]) setFileData1(parsedData["33"]);
      if (parsedData["34"]) setFileData2(parsedData["34"]);
      if (parsedData.completion_state === "Full") {
        setProgress(100);
        const hasFrontHairlineImage =
          parsedData["33"] && parsedData["33"].trim() !== "";
        const hasTopHeadImage =
          parsedData["34"] && parsedData["34"].trim() !== "";
        const hasPhotoId = parsedData["38"] && parsedData["38"].trim() !== "";

        if (hasFrontHairlineImage && hasTopHeadImage && hasPhotoId) {
          setCurrentPage(22);
          setProgress(100);
          setFormData((prev) => ({
            ...prev,
            page_step: 22,
          }));
        } else {
          setCurrentPage(16);
          const newProgress = Math.ceil((16 / 22) * 100);
          setProgress(newProgress);
          setFormData((prev) => ({
            ...prev,
            page_step: 16,
          }));
        }
      }
      setDataLoaded(true);
    } catch (error) {
      logger.error("Error parsing stored quiz data:", error);
    }
  }, [dataLoaded, prefillCheckDone]);

  useEffect(() => {
    if (!dataLoaded) return;
    if (currentPage === 3 && shouldSkipDOBPage()) {
      setCurrentPage(4);
      const newProgress = Math.ceil((4 / 22) * 100);
      const progressValue = newProgress < 10 ? 10 : newProgress;
      setProgress(progressValue);
      setFormData((prev) => ({
        ...prev,
        page_step: 4,
        completion_percentage: progressValue,
      }));
      return;
    }

    if (dob && formData["158"] && currentPage <= 3) {
      try {
        const date = new Date(formData["158"]);
        if (!isNaN(date.getTime())) {
          setDatePickerValue({
            startDate: formData["158"],
            endDate: formData["158"],
          });
        }
      } catch (error) {
        logger.error("Error setting initial date picker value:", error);
      }
    }
  }, [dataLoaded, dob, formData, currentPage]);

  const getPageMainField = (page) => {
    const pageFieldMap = {
      1: "137", // Hair loss treatments
      2: "138", // Finasteride usage
      3: "158", // Date of birth
      4: "1", // Gender
      5: "25", // Age
      6: "39", // Hair loss pattern
      7: "22", // Hair loss duration
      8: "40", // Is condition active
      9: "26_1", // Sexual health issues
      10: "27_1", // Mental health conditions
      11: "28", // Medications
      12: "30", // Other medical conditions
      13: "31", // Allergies
      14: "137", // Hair loss treatments
      15: "138", // Finasteride usage
      16: "33", // Photos (front hairline)
      17: "203", // Medication acknowledgment
      18: "35", // Provider message
      19: "37", // Book call
      20: "182_1", // No call acknowledgment
      21: "204_1", // Photo ID acknowledgment
    };
    return pageFieldMap[page] || "";
  };

  useEffect(() => {
    if (!dataLoaded) return;

    if (currentPage === 22) {
      const hasFrontHairlineImage =
        formData["33"] && formData["33"].trim() !== "";
      const hasTopHeadImage = formData["34"] && formData["34"].trim() !== "";
      const hasPhotoId = formData["38"] && formData["38"].trim() !== "";
      const isCompletionStateFull = formData.completion_state === "Full";

      if (
        !hasFrontHairlineImage ||
        !hasTopHeadImage ||
        !hasPhotoId ||
        !isCompletionStateFull
      ) {
        let lastCompletedPage = 16;
        for (let i = 1; i <= 21; i++) {
          const mainField = getPageMainField(i);
          if (formData[mainField] && formData[mainField].trim() !== "") {
            lastCompletedPage = i;
          }
        }
        setCurrentPage(lastCompletedPage);
        const newProgress = Math.ceil((lastCompletedPage / 22) * 100);
        setProgress(newProgress < 10 ? 10 : newProgress);
        setFormData((prev) => ({
          ...prev,
          page_step: lastCompletedPage,
        }));
      }
    }
  }, [dataLoaded, currentPage, formData]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
      return e.returnValue;
    };

    if (currentPage >= 1 && currentPage <= 21) {
      window.addEventListener("beforeunload", handleBeforeUnload);
    }

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [currentPage]);

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

    const singleChoicePages = [1, 2, 4, 5, 6, 7, 13, 14, 15, 17, 19];
    const isBirthDatePage = currentPage === 3;
    const continueButton = formRef.current.querySelector(
      ".quiz-continue-button"
    );

    if (continueButton) {
      continueButton.style.visibility = "";

      const isAnswered = (() => {
        switch (currentPage) {
          case 1:
            return !!formData["137"];
          case 2:
            return !!formData["138"];
          case 4:
            return !!formData["1"];
          case 5:
            return !!formData["25"];
          case 6:
            return !!formData["39"];
          case 7:
            return !!formData["22"];
          case 13:
            return !!formData["28"];
          case 14:
            return !!formData["30"];
          case 15:
            return !!formData["31"];
          case 17:
            return !!formData["203"];
          case 19:
            return !!formData["37"];
          default:
            return false;
        }
      })();

      if (singleChoicePages.includes(currentPage)) {
        if (isAnswered) {
          continueButton.style.display = "block";
        } else {
          continueButton.style.display = "none";
        }
      } else {
        continueButton.style.display = "block";

        if (isBirthDatePage && !formData["158"]) {
          continueButton.style.visibility = "hidden";
        } else if (currentPage === 16 && file_data_1 && file_data_2) {
          continueButton.style.visibility = "hidden";
        } else if (currentPage === 20) {
          continueButton.disabled = !photoIdAcknowledged;
          continueButton.style.opacity = photoIdAcknowledged ? "1" : "0.5";
        } else if (currentPage === 21) {
          const isReady = photoIdFile && !isUploading;
          continueButton.disabled = !isReady;
          continueButton.style.opacity = isReady ? "1" : "0.5";
        }
      }
    }
  }, [
    currentPage,
    formData,
    photoIdAcknowledged,
    photoIdFile,
    isUploading,
    file_data_1,
    file_data_2,
  ]);

  useEffect(() => {
    const processQueue = async () => {
      if (pendingSubmissions.length === 0 || isSyncing) return;

      setIsSyncing(true);

      try {
        const sortedSubmissions = [...pendingSubmissions].sort(
          (a, b) => a.timestamp - b.timestamp
        );

        const submission = sortedSubmissions[0];
        const dataToSubmit = JSON.parse(JSON.stringify(submission.data));

        const nonEmptyData = Object.fromEntries(
          Object.entries(dataToSubmit).filter(
            ([_, v]) => v !== "" && v !== undefined && v !== null
          )
        );

        if (Object.keys(nonEmptyData).length > 0) {
          const result = await submitFormData(nonEmptyData);

          if (result && result.id) {
            setFormData((prev) => ({
              ...prev,
              id: result.id,
              token: result.token || prev.token,
              hair_entrykey: result.hair_entrykey || prev.hair_entrykey,
            }));
            updateLocalStorage({
              ...formData,
              id: result.id,
              token: result.token || formData.token,
              hair_entrykey: result.hair_entrykey || formData.hair_entrykey,
            });
          }
        }

        setPendingSubmissions((prev) => prev.slice(1));
      } catch (error) {
        logger.error("Background sync error:", error);
        setSyncError(error.message || "Failed to sync data");
        setPendingSubmissions((prev) => prev.slice(1));
      } finally {
        setIsSyncing(false);
      }
    };

    processQueue();
  }, [pendingSubmissions, isSyncing, formData]);

  useEffect(() => {
    if (formData._skipAutoUpdate) {
      const { _skipAutoUpdate, ...cleanData } = formData;
      setFormData(cleanData);
      return;
    }

    const now = new Date();
    const ttl = now.getTime() + 1000 * 60 * 60;

    localStorage.setItem("quiz-form-data-hair", JSON.stringify(formData));
    localStorage.setItem("quiz-form-data-hair-expiry", ttl.toString());
  }, [formData]);

  const queueFormSubmission = (data, forceSubmit = false) => {
    const shouldSubmit =
      forceSubmit ||
      Object.keys(data).filter((key) => data[key] !== "").length > 0;

    if (shouldSubmit) {
      const dataToSubmit = { ...formData, ...data };
      setPendingSubmissions((prev) => {
        const isDuplicate = prev.some(
          (submission) =>
            JSON.stringify(submission.data) === JSON.stringify(dataToSubmit)
        );

        if (isDuplicate) {
          return prev;
        }
        return [...prev, { data: dataToSubmit, timestamp: Date.now() }];
      });
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

  const readLocalStorage = () => {
    if (typeof window !== "undefined") {
      const now = new Date();
      const ttl = localStorage.getItem("quiz-form-data-hair-expiry");

      if (ttl && now.getTime() < parseInt(ttl)) {
        return localStorage.getItem("quiz-form-data-hair");
      } else {
        localStorage.removeItem("quiz-form-data-hair");
        localStorage.removeItem("quiz-form-data-hair-expiry");
      }
    }
    return null;
  };

  const updateLocalStorage = (data = null) => {
    try {
      const dataToStore = data || formData;
      if (!dataToStore.page_step) {
        dataToStore.page_step = currentPage;
      }

      const now = new Date();
      const ttl = now.getTime() + 1000 * 60 * 60;

      localStorage.setItem("quiz-form-data-hair", JSON.stringify(dataToStore));
      localStorage.setItem("quiz-form-data-hair-expiry", ttl.toString());
    } catch (error) {
      logger.error("Error updating local storage:", error);
    }
  };

  const updateFormDataAndStorage = (updates) => {
    const newData = { ...formData, ...updates };
    setFormData({
      ...newData,
      _skipAutoUpdate: true,
    });
    if (typeof window !== "undefined") {
      try {
        const now = new Date();
        const ttl = now.getTime() + 1000 * 60 * 60;
        localStorage.setItem("quiz-form-data-hair", JSON.stringify(newData));
        localStorage.setItem("quiz-form-data-hair-expiry", ttl.toString());
      } catch (error) {
        logger.error("Error updating local storage:", error);
      }
    }

    queueFormSubmission(updates);

    return newData;
  };

  const handleBackClick = () => {
    moveToPreviousSlide();
  };

  let debouncedSubmitTimeout;

  const compareStoredNames = () => {
    if (!firstName || !lastName) return;

    try {
      const storedData = localStorage.getItem("quiz-form-data-hair");
      if (!storedData) return;

      const parsedData = JSON.parse(storedData);
      const storedFirstName = parsedData["130_3"] || "";
      const storedLastName = parsedData["130_6"] || "";

      if (
        (storedFirstName && storedFirstName !== firstName) ||
        (storedLastName && storedLastName !== lastName)
      ) {
        setShowNameDifferencePopup(true);
      }
    } catch (error) {
      logger.error("Error comparing stored names:", error);
    }
  };

  const handlePhotoIdAcknowledgement = async (e) => {
    const isChecked = e.target.checked;
    setPhotoIdAcknowledged(isChecked);

    const updates = {
      "204_1": isChecked ? "1" : "",
      "204_2": isChecked
        ? "I hereby understand and acknowledge the above message"
        : "",
      "204_3": isChecked ? "33" : "",
    };
    updateFormDataAndStorage(updates);
    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.disabled = !isChecked;
    }
  };

  const handlePhotoIdAcknowledgeContinue = async () => {
    if (!photoIdAcknowledged) return;

    const updates = {
      "204_1": "1",
      "204_2": "I hereby understand and acknowledge the above message",
      "204_3": "33",
    };

    updateFormDataAndStorage(updates);

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 100);
  };

  const handleTapToUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleStandardOptionSelect = (
    fieldName,
    value,
    autoAdvance = false,
    additionalUpdates = {}
  ) => {
    clearError();

    let updates = {
      [fieldName]: value,
      ...additionalUpdates,
    };

    const isSingleSelectionPage = [
      1, 2, 4, 5, 6, 7, 13, 14, 15, 17, 19,
    ].includes(currentPage);

    if (autoAdvance || isSingleSelectionPage) {
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          ...updates,
        };

        const now = new Date();
        const ttl = now.getTime() + 1000 * 60 * 60;
        localStorage.setItem(
          "quiz-form-data-hair",
          JSON.stringify(updatedData)
        );
        localStorage.setItem("quiz-form-data-hair-expiry", ttl.toString());
        setTimeout(() => {
          moveToNextSlideWithoutValidation(updates);
        }, 10);

        return updatedData;
      });
    } else {
      batchUpdatesForSubmission(updates);
    }
  };

  const handlePhotoIdFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError();

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    const supportedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heif",
      "image/heic",
    ];

    const supportedExtensions = ["jpg", "jpeg", "png", "heif", "heic"];

    const isSupportedMimeType = supportedMimeTypes.includes(fileType);
    const isSupportedExtension = supportedExtensions.includes(fileExtension);

    if (!isSupportedMimeType && !isSupportedExtension) {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent =
          "Only JPG, JPEG, PNG, HEIF, and HEIC images are supported";
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
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.disabled = true;
        continueButton.style.opacity = "0.5";
      }
      return;
    }
    setPhotoIdFile(file);

    const isHeifFile = fileExtension === "heif" || fileExtension === "heic";
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    if (isHeifFile && !isSafari) {
      const preview = document.getElementById("photo-id-preview");
      if (preview) {
        preview.src =
          `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/photo_upload_icon.png`;
      }
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        const preview = document.getElementById("photo-id-preview");
        if (preview) {
          preview.src = e.target?.result;
        }
      };
      reader.readAsDataURL(file);
    }

    setTimeout(() => {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.disabled = false;
        continueButton.style.opacity = "1";
      }
    }, 100);
  };

  const validateFile = (file) => {
    if (!file) {
      throw new Error("No file selected");
    }

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    const supportedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heif",
      "image/heic",
    ];

    const supportedExtensions = ["jpg", "jpeg", "png", "heif", "heic"];

    const isSupportedMimeType = supportedMimeTypes.includes(fileType);
    const isSupportedExtension = supportedExtensions.includes(fileExtension);

    if (!isSupportedMimeType && !isSupportedExtension) {
      throw new Error(
        "Only JPG, JPEG, PNG, HEIF, and HEIC images are supported"
      );
    }

    if (file.size > 20 * 1024 * 1024) {
      throw new Error("Maximum file size is 20MB");
    }

    return true;
  };
  const handlePhotoIdUpload = async () => {
    if (!photoIdFile) {
      throw new Error("No photo file selected");
    }

    try {
      setIsUploading(true);

      validateFile(photoIdFile);

      const s3Url = await uploadFileToS3WithProgress(
        photoIdFile,
        "questionnaire/hair-photo-ids",
        "hair"
        // (progress) => {
        //   logger.log(`Upload progress: ${progress}%`);
        // }
      );

      const submissionData = {
        ...formData,
        38: s3Url,
        196: s3Url,
        completion_state: "Partial",
        stage: "photo-id-upload",
        action: "hair_questionnaire_data_upload",
        form_id: 1,
      };

      const response = await fetch("/api/hair", {
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

      setFormData((prev) => ({
        ...prev,
        38: s3Url,
        196: s3Url,
        completion_state: "Partial",
        stage: "photo-id-upload",
        id: data.id || prev.id,
        token: data.token || prev.token,
        hair_entrykey: data.hair_entrykey || prev.hair_entrykey,
      }));

      updateLocalStorage();
      return s3Url;
    } catch (error) {
      logger.error("Error uploading photo:", error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  const verifyCustomerAndProceed = async () => {
    const userInfoError = getQuizUserInfoError(formData);
    if (userInfoError) {
      alert(userInfoError);
      return;
    }

    if (!photoIdFile && !formData["38"]) {
      alert("Please upload a photo ID");
      return;
    }

    try {
      setIsUploading(true);
      showLoader();

      let photoIdUrl = formData["38"];

      if (photoIdFile && !photoIdUrl) {
        try {
          photoIdUrl = await handlePhotoIdUpload();

          if (!photoIdUrl) {
            throw new Error("Photo upload returned no URL");
          }
        } catch (uploadError) {
          logger.error("Photo upload error:", uploadError);
          hideLoader();
          setIsUploading(false);
          alert("An error occurred during photo upload. Please try again.");
          return;
        }
      }

      if (!photoIdUrl) {
        hideLoader();
        setIsUploading(false);
        alert("Photo ID URL not available. Please try uploading again.");
        return;
      }

      try {
        const updatedFormData = {
          ...formData,
          38: photoIdUrl,
          196: photoIdUrl,
          completion_state: "Full",
        };

        setFormData(updatedFormData);

        const submissionResult = await submitFormData({
          completion_state: "Full",
          38: photoIdUrl,
          196: photoIdUrl,
        });

        setCurrentPage(22);
        setProgress(100);
        setFormData((prev) => ({
          ...prev,
          page_step: 22,
        }));
        setIsUploading(false);

        setTimeout(() => {
          hideLoader();
        }, 100);
      } catch (error) {
        logger.error("Form submission error:", error);
        hideLoader();
        setIsUploading(false);
        alert("An error occurred during verification. Please try again.");
      }
    } catch (error) {
      logger.error("Customer verification error:", error);
      hideLoader();
      setIsUploading(false);
      alert("An error occurred during verification. Please try again.");
    }
  };

  const handleBookCallSelect = (option) => {
    clearError();

    const backendOption = option === "Clinician" ? "Doctor" : option;
    const updates = { 37: backendOption };
    if (option === "Pharmacist" || option === "Clinician") {
      updates["182_1"] = "";
      updates["182_2"] = "";
      updates["182_3"] = "";
      setShowNoCallAcknowledgement(false);
      setNoCallAcknowledged(false);
    } else if (option === "No") {
      setShowNoCallAcknowledgement(true);
      setNoCallAcknowledged(false);
      updateFormDataAndStorage(updates);
      return;
    }

    updateFormDataAndStorage(updates);
  };

  const handleNoCallAcknowledgement = (e) => {
    const isChecked = e.target.checked;
    setNoCallAcknowledged(isChecked);

    const updates = {
      "182_1": isChecked ? "1" : "",
      "182_2": isChecked
        ? "I hereby understand and consent to the above waiver"
        : "",
      "182_3": isChecked ? "33" : "",
    };

    updateFormDataAndStorage(updates);
  };

  const handleNoCallContinue = (proceed = true) => {
    if (!proceed) {
      setShowNoCallAcknowledgement(false);
      setNoCallAcknowledged(false);

      const updates = {
        37: "",
        "182_1": "",
        "182_2": "",
        "182_3": "",
      };

      updateFormDataAndStorage(updates);
      return;
    }

    if (!noCallAcknowledged) return;
    setShowNoCallAcknowledgement(false);

    const updates = {
      "182_1": "1",
      "182_2": "I hereby understand and consent to the above waiver",
      "182_3": "33",
    };

    updateFormDataAndStorage(updates);

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 100);
  };

  const handleRequestCallInstead = () => {
    setShowNoCallAcknowledgement(false);

    const updates = {
      37: "Doctor",
      "182_1": "",
      "182_2": "",
      "182_3": "",
    };

    updateFormDataAndStorage(updates);

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 10);
  };

  const handleHealthcareQuestionsSelect = (option) => {
    clearError();

    let updates = { "35_choice": option };

    if (option === "No") {
      updates["35"] = "none";
    } else if (option === "Yes") {
      if (formData["35"] === "none") {
        updates["35"] = "";
      }
    }

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        ...updates,
      };
      updateLocalStorage(updatedData);
      queueFormSubmission(updatedData);
      return updatedData;
    });

    if (option === "No") {
      setTimeout(() => {
        moveToNextSlideWithoutValidation();
      }, 10);
    }
  };

  const handleProviderMessageChange = (e) => {
    const value = e.target.value;
    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        35: value,
      };
      updateLocalStorageOnly(updatedData);
      return updatedData;
    });
    debouncedQueueSubmission({ 35: value });
    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
      continueButton.style.display = "block";
    }
  };

  const handleMedicationAcknowledgment = (option) => {
    clearError();

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        203: option,
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });

    queueFormSubmission({ ...formData, 203: option });

    // if (option === "I have questions and will book a phone call") {
    //   setFormData((prevData) => ({
    //     ...prevData,
    //     37: "Clinician",
    //   }));
    // }

    setTimeout(() => {
      moveToNextSlideWithoutValidation();
    }, 10);
  };
  const handleFrontHairlinePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError();

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    const supportedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heif",
      "image/heic",
    ];

    const supportedExtensions = ["jpg", "jpeg", "png", "heif", "heic"];

    const isSupportedMimeType = supportedMimeTypes.includes(fileType);
    const isSupportedExtension = supportedExtensions.includes(fileExtension);

    if (!isSupportedMimeType && !isSupportedExtension) {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent =
          "Only JPG, JPEG, PNG, HEIF, and HEIC images are supported";
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
      document.getElementById("output1").src =
        `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/photo_upload_icon.png`;
      setFileData1(null);
      toggleUploadButton();
      return false;
    }

    setFileData1(file);

    const isHeifFile = fileExtension === "heif" || fileExtension === "heic";
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const updateUI = (previewSrc) => {
      document.querySelector("label[for=photo_upload_1]").innerHTML = `
        <div class="flex w-full flex-col">
          <div class="flex items-center mb-2">
            <img
              class="w-16 h-16 object-contain mr-4 flex-shrink-0"
              src="${previewSrc}"
              id="output1"
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

    if (isHeifFile && !isSafari) {
      const placeholderSrc =
        `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/photo_upload_icon.png`;
      updateUI(placeholderSrc);
      const preview = document.getElementById("output1");
      if (preview) {
        preview.src = placeholderSrc;
      }
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewSrc = e.target?.result;
        updateUI(previewSrc);
        const preview = document.getElementById("output1");
        if (preview) {
          preview.src = previewSrc;
        }
      };
      reader.readAsDataURL(file);
    }

    const file2 = document.getElementById("photo_upload_2").files?.[0];
    if (file && file2) {
      const uploadButton = document.querySelector(".upload-button");
      if (uploadButton) {
        uploadButton.classList.remove("hidden");
      }

      const continueButton = document.querySelector(".quiz-continue-button");
      if (continueButton) {
        continueButton.style.visibility = "hidden";
      }
    }
  };
  const handleTopHeadPhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    clearError();

    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.split(".").pop();

    const supportedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/heif",
      "image/heic",
    ];

    const supportedExtensions = ["jpg", "jpeg", "png", "heif", "heic"];

    const isSupportedMimeType = supportedMimeTypes.includes(fileType);
    const isSupportedExtension = supportedExtensions.includes(fileExtension);

    if (!isSupportedMimeType && !isSupportedExtension) {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent =
          "Only JPG, JPEG, PNG, HEIF, and HEIC images are supported";
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
      document.getElementById("output2").src =
        `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/photo_upload_icon.png`;
      setFileData2(null);
      toggleUploadButton();
      return false;
    }

    setFileData2(file);

    const isHeifFile = fileExtension === "heif" || fileExtension === "heic";
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

    const updateUI = (previewSrc) => {
      document.querySelector("label[for=photo_upload_2]").innerHTML = `
        <div class="flex w-full flex-col">
          <div class="flex items-center mb-2">
            <img
              class="w-16 h-16 object-contain mr-4 flex-shrink-0"
              src="${previewSrc}"
              id="output2"
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

    if (isHeifFile && !isSafari) {
      const placeholderSrc =
        `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/photo_upload_icon.png`;
      updateUI(placeholderSrc);
      const preview = document.getElementById("output2");
      if (preview) {
        preview.src = placeholderSrc;
      }
    } else {
      const reader = new FileReader();
      reader.onload = function (e) {
        const previewSrc = e.target?.result;
        updateUI(previewSrc);
        const preview = document.getElementById("output2");
        if (preview) {
          preview.src = previewSrc;
        }
      };
      reader.readAsDataURL(file);
    }

    const file1 = document.getElementById("photo_upload_1").files?.[0];
    if (file && file1) {
      const uploadButton = document.querySelector(".upload-button");
      if (uploadButton) {
        uploadButton.classList.remove("hidden");
      }

      const continueButton = document.querySelector(".quiz-continue-button");
      if (continueButton) {
        continueButton.style.visibility = "hidden";
      }
    }
  };

  const toggleUploadButton = () => {
    if (file_data_1 && file_data_2) {
      document.querySelector(".upload-button").classList.remove("hidden");
      if (document.querySelector(".quiz-continue-button")) {
        document.querySelector(".quiz-continue-button").style.visibility =
          "hidden";
      }
    } else {
      document.querySelector(".upload-button").classList.add("hidden");
    }
  };
  const handlePhotoUpload = async () => {
    if (!file_data_1 || !file_data_2) {
      throw new Error("Photo files not selected");
    }

    setIsUploading(true);

    try {
      const frontHairlineUrl = await uploadFileToS3WithProgress(
        file_data_1,
        "questionnaire/hair-photos/front-hairline",
        "hair"
        // (progress) => {
        //   logger.log(`Front hairline upload progress: ${progress}%`);
        // }
      );

      const topHeadUrl = await uploadFileToS3WithProgress(
        file_data_2,
        "questionnaire/hair-photos/top-head",
        "hair"
        // (progress) => {
        //   logger.log(`Top head upload progress: ${progress}%`);
        // }
      );

      const submissionData = {
        ...formData,
        33: frontHairlineUrl,
        34: topHeadUrl,
        completion_state: "Full",
        stage: "hair-photos-upload",
        action: "hair_questionnaire_data_upload",
        form_id: 1,
      };

      const response = await fetch("/api/hair", {
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

      setFormData((prev) => ({
        ...prev,
        33: frontHairlineUrl,
        34: topHeadUrl,
        id: data.id || prev.id,
        token: data.token || prev.token,
        hair_entrykey: data.hair_entrykey || prev.hair_entrykey,
      }));

      document.querySelector("label[for=photo_upload_1]").style.borderColor =
        "green";
      document.querySelector("label[for=photo_upload_2]").style.borderColor =
        "green";

      updateLocalStorage();
      document.querySelector(".upload-button").classList.add("hidden");
      moveToNextSlideWithoutValidation();
    } catch (error) {
      logger.error("Error uploading photos:", error);
      alert(error.message || "Error uploading photos");

      document.querySelector("label[for=photo_upload_1]").style.borderColor =
        "red";
      document.querySelector("label[for=photo_upload_2]").style.borderColor =
        "red";
    } finally {
      setIsUploading(false);
    }
  };

  const handleAllergiesSelect = (option) => {
    clearError();

    if (option === "No") {
      const updates = { 31: option, 32: "" };
      updateFormDataAndStorage(updates);
      setTimeout(() => {
        moveToNextSlideWithoutValidation();
      }, 10);
    } else {
      const updates = { 31: option };
      updateFormDataAndStorage(updates);

      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleAllergiesChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        32: value,
      };
      updateLocalStorageOnly(updatedData);
      return updatedData;
    });
    debouncedQueueSubmission({ 32: value });
    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleOtherMedicalConditionsSelect = (option) => {
    clearError();

    if (option === "No") {
      const updates = { 30: option, 41: "" };
      updateFormDataAndStorage(updates);

      setTimeout(() => {
        moveToNextSlideWithoutValidation();
      }, 10);
    } else {
      const updates = { 30: option };
      updateFormDataAndStorage(updates);
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleOtherMedicalConditionsChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        41: value,
      };
      updateLocalStorageOnly(updatedData);
      return updatedData;
    });
    debouncedQueueSubmission({ 41: value });

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleMedicationsSelect = (option) => {
    clearError();

    if (option === "No") {
      const updates = { 28: option, 29: "" };
      updateFormDataAndStorage(updates);
      setTimeout(() => {
        moveToNextSlideWithoutValidation();
      }, 10);
    } else {
      setFormData((prev) => {
        const updatedData = {
          ...prev,
          28: option,
        };

        updateLocalStorageOnly(updatedData);
        return updatedData;
      });

      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleMedicationDetailsChange = (e) => {
    const value = e.target.value;

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        29: value,
      };

      if (typeof window !== "undefined") {
        try {
          const now = new Date();
          const ttl = now.getTime() + 1000 * 60 * 60;
          localStorage.setItem(
            "quiz-form-data-hair",
            JSON.stringify(updatedData)
          );
          localStorage.setItem("quiz-form-data-hair-expiry", ttl.toString());
        } catch (error) {
          logger.error("Error updating local storage:", error);
        }
      }

      return updatedData;
    });

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const updateLocalStorageOnly = (data) => {
    if (typeof window !== "undefined") {
      try {
        const now = new Date();
        const ttl = now.getTime() + 1000 * 60 * 60;
        localStorage.setItem("quiz-form-data-hair", JSON.stringify(data));
        localStorage.setItem("quiz-form-data-hair-expiry", ttl.toString());
      } catch (error) {
        logger.error("Error updating local storage:", error);
      }
    }
  };

  const submitOnBlur = (fieldName, value) => {
    const updates = { [fieldName]: value };
    queueFormSubmission(updates);
  };

  const handleMentalHealthOtherChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        36: value,
      };
      updateLocalStorageOnly(updatedData);
      return updatedData;
    });
    debouncedQueueSubmission({ 36: value });

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
      continueButton.style.display = "block";
    }
  };

  const handleSexualIssueSelect = (fieldName, value) => {
    clearError();

    const newSelectedIssues = { ...selectedSexualIssues };

    if (fieldName === "26_4") {
      if (newSelectedIssues[fieldName] === "") {
        Object.keys(newSelectedIssues).forEach((key) => {
          newSelectedIssues[key] = key === "26_4" ? value : "";
        });
      } else {
        newSelectedIssues[fieldName] = "";
      }
    } else {
      newSelectedIssues["26_4"] = "";
      newSelectedIssues[fieldName] =
        newSelectedIssues[fieldName] === value ? "" : value;
    }

    setSelectedSexualIssues(newSelectedIssues);

    const updates = {};
    Object.keys(newSelectedIssues).forEach((key) => {
      updates[key] = newSelectedIssues[key];
    });
    setFormData((prevData) => ({
      ...prevData,
      ...updates,
    }));

    updateLocalStorage();

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleConditionSelect = (fieldName, value) => {
    clearError();

    const newSelectedConditions = { ...selectedConditions };

    if (fieldName === "24_5") {
      if (selectedConditions[fieldName] === "") {
        Object.keys(newSelectedConditions).forEach((key) => {
          newSelectedConditions[key] = key === "24_5" ? value : "";
        });

        setIsConditionActive("");
        setFormData((prev) => ({
          ...prev,
          40: "",
        }));
      } else {
        newSelectedConditions[fieldName] = "";
      }
    } else {
      newSelectedConditions["24_5"] = "";
      newSelectedConditions[fieldName] =
        newSelectedConditions[fieldName] === value ? "" : value;
    }

    setSelectedConditions(newSelectedConditions);

    const updates = {};
    Object.keys(newSelectedConditions).forEach((key) => {
      updates[key] = newSelectedConditions[key];
    });

    if (fieldName === "24_5" && newSelectedConditions[fieldName] !== "") {
      updates["40"] = "";
    }

    setFormData((prevData) => ({
      ...prevData,
      ...updates,
    }));

    updateLocalStorage();

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleBirthDateChange = (e) => {
    setDatePickerValue(e);
    const date = new Date(e.startDate);
    const birthDate = `${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
    const updates = { 158: birthDate };
    updateFormDataAndStorage(updates);

    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      age--;
    }

    if (age < 18) {
      setShowUnder18Popup(true);
    }
  };

  const handleHairTypeSelect = async (option) => {
    showLoader();

    setFormData((prev) => ({
      ...prev,
      137: option,
    }));
    updateLocalStorage();

    try {
      await submitFormData({ 137: option });

      hideLoader();

      moveToNextSlideWithoutValidation({ 137: option });
    } catch (error) {
      hideLoader();
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent = "An error occurred. Please try again.";
      }
    }
  };

  const handleMedicalConditionsTextChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => {
      const updatedData = {
        ...prev,
        56: value,
      };
      updateLocalStorageOnly(updatedData);
      return updatedData;
    });

    debouncedQueueSubmission({ 56: value });

    if (value.trim() !== "") {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleLiverDiseaseSelect = (option) => {
    if (option === "Yes") {
      setFormData((prev) => ({
        ...prev,
        25: option,
      }));
      updateLocalStorage();
      queueFormSubmission({ 25: option });
      setShowLiverWarning(true);
    } else {
      if (formData["25"] === option) {
        moveToNextSlide();
        return;
      }

      handleStandardOptionSelect("25", option);
    }
  };

  const handleLiverWarningClose = (proceed = true) => {
    setShowLiverWarning(false);

    if (!proceed) {
      setFormData((prev) => ({
        ...prev,
        25: "",
      }));
      updateLocalStorage();
      return;
    }

    if (!liverWarningAcknowledged) {
      setFormData((prev) => ({
        ...prev,
        25: "",
      }));
      updateLocalStorage();
    }
  };

  const handleBreastCancerSelect = (option) => {
    if (option === "Yes") {
      const updates = { 39: option };
      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));
      updateLocalStorage();
      queueFormSubmission(updates);
      setShowBreastCancerWarning(true);
    } else {
      if (formData["39"] === option) {
        moveToNextSlide();
        return;
      }

      handleStandardOptionSelect("39", option);
    }
  };

  const handleBreastCancerWarningClose = (proceed = true) => {
    setShowBreastCancerWarning(false);

    if (!proceed) {
      setFormData((prev) => ({
        ...prev,
        39: "",
      }));
      updateLocalStorage();
      return;
    }

    if (!breastCancerWarningAcknowledged) {
      setFormData((prev) => ({
        ...prev,
        39: "",
      }));
      updateLocalStorage();
    }
  };

  const handleProstateCancerSelect = (option) => {
    if (option === "Yes") {
      const updates = { 22: option };
      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));
      updateLocalStorage();
      queueFormSubmission(updates);
      setShowProstateCancerWarning(true);
      setProstateCancerWarningAcknowledged(false);
    } else {
      if (formData["22"] === option) {
        moveToNextSlide();
        return;
      }

      setShowProstateCancerWarning(false);
      setProstateCancerWarningAcknowledged(false);

      handleStandardOptionSelect("22", option);
    }
  };

  const handleProstateCancerWarningClose = (proceed = true) => {
    setShowProstateCancerWarning(false);

    if (!proceed) {
      setFormData((prev) => ({
        ...prev,
        22: "",
      }));
      updateLocalStorage();
      return;
    }

    if (!prostateCancerWarningAcknowledged) {
      setFormData((prev) => ({
        ...prev,
        22: "",
      }));
      updateLocalStorage();
    }
  };

  const handleLiverWarningAcknowledge = (e) => {
    setLiverWarningAcknowledged(e.target.checked);
  };

  const handleBreastCancerWarningAcknowledge = (e) => {
    setBreastCancerWarningAcknowledged(e.target.checked);
  };

  const handleProstateCancerWarningAcknowledge = (e) => {
    setProstateCancerWarningAcknowledged(e.target.checked);
  };

  const handleMentalHealthConditionSelect = (fieldName, value) => {
    clearError();

    const newSelectedConditions = { ...selectedMentalHealthConditions };

    if (fieldName === "27_6") {
      if (selectedMentalHealthConditions[fieldName] === "") {
        Object.keys(newSelectedConditions).forEach((key) => {
          newSelectedConditions[key] = key === "27_6" ? value : "";
        });
        setFormData((prev) => ({
          ...prev,
          36: "",
        }));
      } else {
        newSelectedConditions[fieldName] = "";
      }
    } else {
      newSelectedConditions["27_6"] = "";
      newSelectedConditions[fieldName] =
        newSelectedConditions[fieldName] === value ? "" : value;
    }

    setSelectedMentalHealthConditions(newSelectedConditions);

    const updates = {};
    Object.keys(newSelectedConditions).forEach((key) => {
      updates[key] = newSelectedConditions[key];
    });

    if (fieldName === "27_6" && newSelectedConditions[fieldName] !== "") {
      updates["36"] = "";
    }

    if (fieldName === "27_5" && newSelectedConditions[fieldName] === "") {
      updates["36"] = "";
      setFormData((prev) => ({
        ...prev,
        36: "",
      }));
    }

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        ...updates,
      };
      return updatedData;
    });

    updateLocalStorage();

    queueFormSubmission(updates);

    if (fieldName !== "27_3" && fieldName !== "27_4") {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleMentalHealthWarningClose = (proceed = true) => {
    setShowMentalHealthWarning(false);

    if (!proceed) {
      const resetSelections = {
        "27_3": "",
        "27_4": "",
      };

      setFormData((prev) => ({
        ...prev,
        ...resetSelections,
      }));

      setSelectedMentalHealthConditions((prev) => {
        const updated = { ...prev };
        if (mentalHealthWarningType === "psychosis") {
          updated["27_3"] = "";
        } else if (mentalHealthWarningType === "suicidal") {
          updated["27_4"] = "";
        }
        return updated;
      });

      updateLocalStorage();
      return;
    }

    if (mentalHealthWarningAcknowledged) {
      const updatedData = {
        mental_health_warning_acknowledged: true,
        mental_health_warning_type: mentalHealthWarningType,
      };

      submitFormData(updatedData).catch((error) => {
        logger.error(
          "Error submitting mental health warning acknowledgment:",
          error
        );
      });

      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    } else {
      setFormData((prev) => {
        const updatedData = { ...prev };
        if (mentalHealthWarningType === "psychosis") {
          updatedData["27_3"] = "";
        } else if (mentalHealthWarningType === "suicidal") {
          updatedData["27_4"] = "";
        }
        return updatedData;
      });

      setSelectedMentalHealthConditions((prev) => {
        const updated = { ...prev };
        if (mentalHealthWarningType === "psychosis") {
          updated["27_3"] = "";
        } else if (mentalHealthWarningType === "suicidal") {
          updated["27_4"] = "";
        }
        return updated;
      });

      updateLocalStorage();

      const resetData =
        mentalHealthWarningType === "psychosis"
          ? { "27_3": "" }
          : { "27_4": "" };

      submitFormData(resetData).catch((error) => {
        logger.error("Error resetting mental health selection:", error);
      });
    }
  };

  const handleMentalHealthWarningAcknowledge = (e) => {
    const isChecked = e.target.checked;
    setMentalHealthWarningAcknowledged(isChecked);

    if (isChecked) {
      const acknowledgmentData = {
        mental_health_warning_acknowledged: true,
        mental_health_warning_type: mentalHealthWarningType,
      };

      submitFormData(acknowledgmentData).catch((error) => {
        logger.error(
          "Error submitting mental health warning acknowledgment:",
          error
        );
      });
    }
  };

  const handleScalpSymptomSelect = (fieldName, value) => {
    clearError();

    const newSelectedSymptoms = { ...selectedScalpSymptoms };

    if (fieldName === "23_4") {
      if (selectedScalpSymptoms[fieldName] === "") {
        Object.keys(newSelectedSymptoms).forEach((key) => {
          newSelectedSymptoms[key] = key === "23_4" ? value : "";
        });
      } else {
        newSelectedSymptoms[fieldName] = "";
      }
    } else {
      newSelectedSymptoms["23_4"] = "";
      newSelectedSymptoms[fieldName] =
        newSelectedSymptoms[fieldName] === value ? "" : value;
    }

    setSelectedScalpSymptoms(newSelectedSymptoms);

    const updates = {};
    Object.keys(newSelectedSymptoms).forEach((key) => {
      updates[key] = newSelectedSymptoms[key];
    });

    setFormData((prevData) => {
      const updatedData = {
        ...prevData,
        ...updates,
      };
      updateLocalStorage(updatedData);
      return updatedData;
    });

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleScalpSymptomsWarningClose = (proceed = true) => {
    setShowScalpSymptomsWarning(false);

    if (!proceed) {
      setFormData((prev) => ({
        ...prev,
        "23_1": "",
        "23_2": "",
        "23_3": "",
      }));

      setSelectedScalpSymptoms((prev) => {
        const updated = { ...prev };
        updated["23_1"] = "";
        updated["23_2"] = "";
        updated["23_3"] = "";
        return updated;
      });

      updateLocalStorage();
      return;
    }
    const currentSelections = {
      "23_1": formData["23_1"] || "",
      "23_2": formData["23_2"] || "",
      "23_3": formData["23_3"] || "",
      "23_4": formData["23_4"] || "",
    };

    submitFormData(currentSelections).catch((error) => {
      logger.error("Error submitting scalp symptoms:", error);
    });
    setFormData((prev) => ({
      ...prev,
      "23_1": "",
      "23_2": "",
      "23_3": "",
    }));

    setSelectedScalpSymptoms((prev) => {
      const updated = { ...prev };
      updated["23_1"] = "";
      updated["23_2"] = "";
      updated["23_3"] = "";
      return updated;
    });
    updateLocalStorage();
  };

  const handleConditionActiveSelect = (option) => {
    if (formRef.current) {
      const errorBox = formRef.current.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.add("hidden");
        errorBox.textContent = "";
      }
    }

    setIsConditionActive(option);

    const updatedData = {
      ...formData,
      40: option,
    };

    setFormData(updatedData);
    updateLocalStorage(updatedData);

    submitFormData({
      40: option,
      "24_1": formData["24_1"] || "",
      "24_2": formData["24_2"] || "",
      "24_3": formData["24_3"] || "",
      "24_4": formData["24_4"] || "",
      "24_5": formData["24_5"] || "",
    }).catch((error) => {
      logger.error("Error submitting condition active status:", error);
    });

    if (option === "No, my scalp is clear") {
      setShowConditionActivePopup(false);
      setCurrentPage(11);
      setFormData((prev) => ({
        ...prev,
        page_step: 11,
      }));

      const newProgress = Math.ceil((11 / 20) * 100);
      setProgress(newProgress < 10 ? 10 : newProgress);

      updateLocalStorage();
      submitFormData();
    } else if (option === "Yes") {
      setShowMedicalConditionPopup(true);
    }
  };

  const handleMedicalConditionPopupClose = (proceed = true) => {
    setShowMedicalConditionPopup(false);

    if (!proceed) {
      setFormData((prev) => ({
        ...prev,
        40: "",
      }));
      setIsConditionActive("");
      updateLocalStorage();
      return;
    }

    submitFormData({
      40: formData["40"] || "",
      "24_1": formData["24_1"] || "",
      "24_2": formData["24_2"] || "",
      "24_3": formData["24_3"] || "",
      "24_4": formData["24_4"] || "",
      "24_5": formData["24_5"] || "",
    }).catch((error) => {
      logger.error("Error submitting medical condition data:", error);
    });

    setFormData((prev) => ({
      ...prev,
      40: "",
    }));

    setIsConditionActive("");
    updateLocalStorage();
  };

  const handleConditionActiveAcknowledge = (e) => {
    setConditionActiveAcknowledged(e.target.checked);
  };

  const handleBiologicalSexSelect = (option) => {
    if (option === "Female") {
      setFormData((prev) => ({
        ...prev,
        1: option,
      }));
      updateLocalStorage();
      queueFormSubmission({ 1: option });
      setShowFemaleWarning(true);
    } else {
      if (formData["1"] === option) {
        moveToNextSlide();
        return;
      }

      handleStandardOptionSelect("1", option);
    }
  };

  const submitFormData = async (specificData = null) => {
    try {
      const essentialData = {
        form_id: formData.form_id || 1,
        action: "hair_questionnaire_data_upload",
        hair_entrykey: formData.hair_entrykey || "",
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

      const currentFormData = { ...formData };
      delete currentFormData._skipAutoUpdate;
      const dataToSubmit = {
        ...essentialData,
        ...userInfo,
        ...currentFormData,
        ...(specificData || {}),
      };

      const response = await fetch("/api/hair", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
        credentials: "include",
      });

      const data = await response.json();

      if (data.error) {
        logger.error("Form submission error:", data.msg || data.error_message);

        if (data.data_not_found) {
          alert(
            "An error has been encountered while processing your data. If your session has expired, you will be asked to login again."
          );
          const redirectStage =
            data.redirect_to_stage || "consultation-after-checkout";
          window.location.href = `/hair-consultation-quiz/?stage=${redirectStage}`;
          return null;
        }

        return null;
      }

      setFormData((prev) => ({
        ...prev,
        id: data.id || prev.id,
        token: data.token || prev.token,
        hair_entrykey: data.hair_entrykey || prev.hair_entrykey,
      }));

      updateLocalStorage({
        ...formData,
        id: data.id || formData.id,
        token: data.token || formData.token,
        hair_entrykey: data.hair_entrykey || formData.hair_entrykey,
      });

      if (formData.completion_state === "Full") {
        setCurrentPage(22);
        setProgress(100);
        setFormData((prev) => ({
          ...prev,
          page_step: 22,
        }));
      }

      return data;
    } catch (error) {
      logger.error("Error submitting form:", error);
      return null;
    }
  };

  const handleFemaleWarningClose = (proceed = true) => {
    setShowFemaleWarning(false);

    if (!proceed) {
      setFormData((prev) => ({
        ...prev,
        1: "",
      }));
      updateLocalStorage();
      setCurrentPage(4);
    } else {
      setShowFemaleWarning(false);
    }
  };

  const updateProgressData = async () => {
    const newProgress = Math.ceil((currentPage / 20) * 100);
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

  const collectCurrentPageData = () => {
    const pageDataMap = {
      1: { 1: formData["1"] },
      2: { 25: formData["25"] },
      3: { 158: formData["158"] },
      4: { 39: formData["39"] },
      5: { 22: formData["22"] },
      6: {
        "23_1": formData["23_1"],
        "23_2": formData["23_2"],
        "23_3": formData["23_3"],
        "23_4": formData["23_4"],
      }, // Scalp symptoms
      7: {
        "24_1": formData["24_1"],
        "24_2": formData["24_2"],
        "24_3": formData["24_3"],
        "24_4": formData["24_4"],
        "24_5": formData["24_5"],
      }, // Medical conditions
      8: { 40: formData["40"] }, // Is condition active
      9: {
        "26_1": formData["26_1"],
        "26_2": formData["26_2"],
        "26_3": formData["26_3"],
        "26_4": formData["26_4"],
      }, // Sexual health issues
      10: {
        "27_1": formData["27_1"],
        "27_2": formData["27_2"],
        "27_3": formData["27_3"],
        "27_4": formData["27_4"],
        "27_5": formData["27_5"],
        "27_6": formData["27_6"],
        36: formData["36"], // Other mental health condition
      }, // Mental health conditions
      11: { 28: formData["28"], 29: formData["29"] }, // Medications
      12: { 30: formData["30"], 41: formData["41"] }, // Other medical conditions
      13: { 31: formData["31"], 32: formData["32"] }, // Allergies
      14: { 137: formData["137"] }, // Hair loss treatments
      15: { 138: formData["138"] }, // Finasteride usage
      16: { 33: formData["33"], 34: formData["34"] }, // Photos
      17: { 203: formData["203"] }, // Medication acknowledgment
      18: { 35: formData["35"] }, // Healthcare questions (text or "none")
      19: { 37: formData["37"] }, // Book call
      20: {
        "182_1": formData["182_1"],
        "182_2": formData["182_2"],
        "182_3": formData["182_3"],
      }, // No call acknowledgment
      21: {
        "204_1": formData["204_1"],
        "204_2": formData["204_2"],
        "204_3": formData["204_3"],
      }, // Photo ID acknowledgment
    };
    return pageDataMap[currentPage] || {};
  };

  const handleResultsTypeSelect = (option) => {
    if (formData["138"] === option) {
      moveToNextSlide();
      return;
    }

    handleStandardOptionSelect("138", option);
  };

  const updateStateAndLocalStorage = (updates) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        ...updates,
      };
      if (typeof window !== "undefined") {
        try {
          const now = new Date();
          const ttl = now.getTime() + 1000 * 60 * 60;
          localStorage.setItem(
            "quiz-form-data-hair",
            JSON.stringify(updatedData)
          );
          localStorage.setItem("quiz-form-data-hair-expiry", ttl.toString());
        } catch (error) {
          logger.error("Error updating local storage:", error);
        }
      }

      return updatedData;
    });
  };
  const moveToNextSlide = () => {
    if (!isValidated()) return;
    setIsMovingForward(true);

    let nextPage = currentPage + 1;
    if (currentPage === 2 && shouldSkipDOBPage()) {
      nextPage = 4;
    }

    const actualNextPage =
      currentPage === 9 && formData["24_5"] ? 11 : nextPage;

    const newProgress = Math.ceil((actualNextPage / 22) * 100);
    const progressValue = newProgress < 10 ? 10 : newProgress;

    const currentPageData = collectCurrentPageData();
    const updatedData = {
      ...currentPageData,
      page_step: actualNextPage,
      completion_percentage: progressValue,
    };

    setFormData((prev) => ({
      ...prev,
      ...updatedData,
    }));
    setProgress(progressValue);
    queueFormSubmission(updatedData, true);

    setCurrentPage(actualNextPage);
  };

  const shouldShowContinueButton = (page) => {
    const hideContinueButtonPages = [1, 2, 4, 5, 6, 7, 13, 14, 15, 17, 19];

    if (page === 16 && file_data_1 && file_data_2) {
      return false;
    }

    return !hideContinueButtonPages.includes(page);
  };
  const moveToNextSlideWithoutValidation = (previousUpdates = {}) => {
    setIsMovingForward(true);
    let nextPage = currentPage + 1;
    if (currentPage === 2 && shouldSkipDOBPage()) {
      nextPage = 4;
    }

    if (currentPage === 9) {
      nextPage = 11;
    } else if (nextPage === 10) {
      nextPage = 11;
    }

    const newProgress = Math.ceil((nextPage / 22) * 100);
    const progressValue = newProgress < 10 ? 10 : newProgress;

    setProgress(progressValue);
    const updatedData = {
      ...previousUpdates,
      page_step: nextPage,
      completion_percentage: progressValue,
    };

    setFormData((prev) => ({
      ...prev,
      ...updatedData,
    }));
    updateLocalStorage();
    queueFormSubmission(updatedData, true);
    setCurrentPage(nextPage);
  };
  const moveToPreviousSlide = () => {
    setIsMovingForward(false);

    if (currentPage > 1) {
      let prevPage = currentPage - 1;
      if (currentPage === 4 && shouldSkipDOBPage()) {
        prevPage = 2;
      }

      if (prevPage === 10) {
        prevPage = 9;
      }

      setCurrentPage(prevPage);

      const newProgress = Math.ceil((prevPage / 22) * 100);
      const progressValue = newProgress < 10 ? 10 : newProgress;

      setFormData((prev) => ({
        ...prev,
        page_step: prevPage,
        completion_percentage: progressValue,
      }));

      setProgress(progressValue);
      updateLocalStorage();
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
  }, 3000);
  const isValidated = () => {
    const showError = (message) => {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent = message;
      }

      if ([12, 13, 14, 15, 18].includes(currentPage)) {
        const continueButton = formRef.current?.querySelector(
          ".quiz-continue-button"
        );
        if (continueButton) {
          continueButton.style.visibility = "";
          continueButton.style.display = "block";
        }
      }

      return false;
    };

    clearError();
    switch (currentPage) {
      case 1: // Hair type
        if (!formData["137"]) {
          return showError("Please make a selection");
        }
        return true;

      case 2: // Results type
        if (!formData["138"]) {
          return showError("Please make a selection");
        }
        return true;

      case 3: // Birth date
        if (shouldSkipDOBPage()) {
          return true;
        }

        if (!formData["158"]) {
          return showError("Please enter your birth date");
        }

        const today = new Date();
        const userBirthDate = new Date(formData["158"]);
        let age = today.getFullYear() - userBirthDate.getFullYear();
        const monthDiff = today.getMonth() - userBirthDate.getMonth();

        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < userBirthDate.getDate())
        ) {
          age--;
        }

        if (age < 18) {
          return showError(
            "You must be at least 18 years old to use this service."
          );
        }

        return true;

      case 4: // Biological sex
        if (!formData["1"]) {
          return showError("Please make a selection");
        }

        if (formData["1"] === "Female") {
          setShowFemaleWarning(true);
          return false;
        }
        return true;

      case 5: // Liver problem
        if (!formData["25"]) {
          return showError("Please make a selection");
        }

        if (formData["25"] === "Yes") {
          setShowLiverWarning(true);
          return false;
        }
        return true;

      case 6: // Breast cancer
        if (!formData["39"]) {
          return showError("Please make a selection");
        }

        if (formData["39"] === "Yes") {
          setShowBreastCancerWarning(true);
          return false;
        }
        return true;

      case 7: // Prostate cancer
        if (!formData["22"]) {
          return showError("Please make a selection");
        }

        if (formData["22"] === "Yes") {
          setShowProstateCancerWarning(true);
          return false;
        }
        return true;

      case 8: // Scalp symptoms
        const hasScalpSelection =
          formData["23_1"] ||
          formData["23_2"] ||
          formData["23_3"] ||
          formData["23_4"];
        if (!hasScalpSelection) {
          return showError("Please make a selection");
        }

        if (
          (formData["23_1"] || formData["23_2"] || formData["23_3"]) &&
          !formData["23_4"]
        ) {
          setShowScalpSymptomsWarning(true);
          return false;
        }

        return true;

      case 9: // Scalp conditions
        const hasConditionSelection =
          formData["24_1"] ||
          formData["24_2"] ||
          formData["24_3"] ||
          formData["24_4"] ||
          formData["24_5"];
        if (!hasConditionSelection) {
          return showError("Please make a selection");
        }

        if (formData["24_5"]) {
          setTimeout(() => {
            setCurrentPage(11);
            setFormData((prev) => ({
              ...prev,
              page_step: 11,
            }));
            const newProgress = Math.ceil((11 / 20) * 100);
            setProgress(newProgress < 10 ? 10 : newProgress);
            updateLocalStorage();
          }, 100);
          return true;
        }

        setShowConditionActivePopup(true);
        return false;

      case 10: // Is condition active
        if (!formData["40"]) {
          return showError("Please make a selection");
        }

        if (formData["40"] === "Yes") {
          setShowMedicalConditionPopup(true);
          return false;
        }

        return true;

      case 11: // Sexual issues
        const hasSexualIssueSelection =
          formData["26_1"] ||
          formData["26_2"] ||
          formData["26_3"] ||
          formData["26_4"];
        if (!hasSexualIssueSelection) {
          return showError("Please make a selection");
        }
        return true;

      case 12: // Mental health conditions
        const hasMentalHealthSelection =
          formData["27_1"] ||
          formData["27_2"] ||
          formData["27_3"] ||
          formData["27_4"] ||
          formData["27_5"] ||
          formData["27_6"];

        if (!hasMentalHealthSelection) {
          return showError("Please make a selection");
        }

        if (formData["27_5"] && !formData["36"]) {
          const continueButton = formRef.current?.querySelector(
            ".quiz-continue-button"
          );
          if (continueButton) {
            continueButton.style.visibility = "";
            continueButton.style.display = "block";
          }
          return showError("Please specify your other medical condition");
        }

        if (formData["27_3"] || formData["27_4"]) {
          const mentalHealthData = {
            "27_1": formData["27_1"] || "",
            "27_2": formData["27_2"] || "",
            "27_3": formData["27_3"] || "",
            "27_4": formData["27_4"] || "",
            "27_5": formData["27_5"] || "",
            "27_6": formData["27_6"] || "",
            36: formData["36"] || "",
          };

          submitFormData(mentalHealthData).catch((error) => {
            logger.error("Error submitting mental health data:", error);
          });
        }

        if (formData["27_3"]) {
          setMentalHealthWarningType("psychosis");
          setShowMentalHealthWarning(true);
          return false;
        }

        if (formData["27_4"]) {
          setMentalHealthWarningType("suicidal");
          setShowMentalHealthWarning(true);
          return false;
        }

        return true;

      case 13: // Medications
        if (!formData["28"]) {
          return showError("Please make a selection");
        }

        if (formData["28"] === "Yes" && !formData["29"]) {
          const continueButton = formRef.current?.querySelector(
            ".quiz-continue-button"
          );
          if (continueButton) {
            continueButton.style.visibility = "";
            continueButton.style.display = "block";
          }
          return showError("Please enter your medication details");
        }
        return true;

      case 14: // Other medical conditions
        if (!formData["30"]) {
          return showError("Please make a selection");
        }

        if (formData["30"] === "Yes" && !formData["41"]) {
          const continueButton = formRef.current?.querySelector(
            ".quiz-continue-button"
          );
          if (continueButton) {
            continueButton.style.visibility = "";
            continueButton.style.display = "block";
          }
          return showError("Please specify your other medical conditions");
        }
        return true;

      case 15: // Allergies
        if (!formData["31"]) {
          return showError("Please make a selection");
        }

        if (formData["31"] === "Yes") {
          if (!formData["32"] || formData["32"].trim() === "") {
            const continueButton = formRef.current?.querySelector(
              ".quiz-continue-button"
            );
            if (continueButton) {
              continueButton.style.display = "block";
              continueButton.style.visibility = "visible";
              continueButton.style.opacity = "1";
            }
            return showError("Please specify your allergies");
          }
        }
        return true;

      case 16: // Photo upload
        if (!file_data_1 || !file_data_2) {
          return showError("Please upload both photos");
        }
        return true;

      case 17: // Medication acknowledgment
        if (!formData["203"]) {
          return showError("Please make a selection");
        }
        return true;

      case 18: // Healthcare questions
        if (!formData["35_choice"]) {
          return showError("Please make a selection");
        }
        if (formData["35_choice"] === "Yes" && !formData["35"]) {
          return showError("Please enter your questions");
        }
        return true;

      case 19: // Book call
        if (!formData["37"]) {
          return showError("Please make a selection");
        }
        if (formData["37"] === "No" && !formData["182_1"]) {
          setShowNoCallAcknowledgement(true);
          return false;
        }
        return true;

      case 20: // Photo ID acknowledgment
        if (!formData["204_1"]) {
          return showError("Please acknowledge the message");
        }
        return true;
      case 21:
        if (!photoIdFile && !formData["38"]) {
          return showError("Please upload a photo ID");
        }
        return true;

      default:
        return true;
    }
  };

  const goBackHome = () => {
    router.push("/");
  };

  const HairOption = ({ id, value, imageSrc, checked, onChange }) => {
    return (
      <div
        className={`quiz-option text-left block w-full mb-4 cursor-pointer`}
        onClick={() => onChange(value)}
      >
        <div
          className={`quiz-option-label cursor-pointer text-left p-4 border-2 
                        ${checked ? "border-[#A7885A]" : "border-gray-300"} 
                        rounded-[12px] block w-full shadow-md flex items-center`}
        >
          <span className="mr-4">
            <img className="w-[40px] h-auto" src={imageSrc} alt={value} />
          </span>
          <span className="flex-grow">{value}</span>
          {checked && (
            <svg
              className="w-6 h-6 text-[#A7885A]"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              ></path>
            </svg>
          )}
        </div>
      </div>
    );
  };

  if (isLoadingQuestionnairePrefill) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#AE7E56] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questionnaire...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-white pb-16"
      suppressHydrationWarning={true}
    >
      {currentPage <= 21 && (
        <QuestionnaireNavbar
          onBackClick={handleBackClick}
          currentPage={currentPage}
        />
      )}
      {currentPage <= 21 && (
        <div className="flex-1">
          <div
            className="quiz-page-wrapper relative md:container md:w-[768px] mx-auto bg-[#FFFFFF]"
            ref={formRef}
          >
            <ProgressBar progress={progress} />

            <form id="quiz-form">
              <input type="hidden" name="form_id" value="1" />
              <input
                type="hidden"
                name="action"
                value="hair_questionnaire_data_upload"
              />
              <input
                type="hidden"
                name="hair_entrykey"
                value={formData.hair_entrykey || ""}
              />
              <input type="hidden" name="id" value={formData.id || ""} />
              <input type="hidden" name="token" value={formData.token || ""} />
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
              <input
                type="hidden"
                name="selected-dosage"
                value={formData["selected-dosage"] || ""}
              />

              <div className="relative min-h-[400px] flex items-start px-4 md:px-0 md:w-[520px] mx-auto">
                <AnimatePresence mode="wait" custom={isMovingForward}>
                  <motion.div
                    key={currentPage}
                    variants={slideVariants}
                    initial={isMovingForward ? "hiddenRight" : "hiddenLeft"}
                    animate="visible"
                    exit={isMovingForward ? "exitRight" : "exitLeft"}
                    className="w-full"
                  >
                    {/* First Question - What best describes your hair? */}
                    {currentPage === 1 && (
                      <QuestionLayout
                        title={hairQuestionList[0].questionHeader}
                        currentPage={currentPage}
                        pageNo={1}
                        questionId={hairQuestionList[0].questionId}
                      >
                        {hairQuestionList[0].answers.map((answer, index) => (
                          <HairOption
                            key={`${hairQuestionList[0].questionId}_${
                              index + 1
                            }`}
                            id={`${hairQuestionList[0].questionId}_${
                              index + 1
                            }`}
                            value={answer.body}
                            imageSrc={answer.imageSrc}
                            checked={
                              formData[hairQuestionList[0].questionId] ===
                              answer.body
                            }
                            onChange={() => handleHairTypeSelect(answer.body)}
                          />
                        ))}
                      </QuestionLayout>
                    )}

                    {currentPage === 2 && (
                      <QuestionLayout
                        title={hairQuestionList[1].questionHeader}
                        currentPage={currentPage}
                        pageNo={2}
                        questionId={hairQuestionList[1].questionId}
                      >
                        {hairQuestionList[1].answers.map((answer, index) => (
                          <QuestionOption
                            key={`${hairQuestionList[1].questionId}_${
                              index + 1
                            }`}
                            id={`${hairQuestionList[1].questionId}_${
                              index + 1
                            }`}
                            name={hairQuestionList[1].questionId}
                            value={answer.body}
                            checked={
                              formData[hairQuestionList[1].questionId] ===
                              answer.body
                            }
                            onChange={() =>
                              handleResultsTypeSelect(answer.body)
                            }
                            type="radio"
                          />
                        ))}
                      </QuestionLayout>
                    )}
                    {currentPage === 3 && !shouldSkipDOBPage() && (
                      <QuestionLayout
                        title={hairQuestionList[2].questionHeader}
                        subtitle={hairQuestionList[2].subtitle}
                        currentPage={currentPage}
                        pageNo={3}
                        questionId={hairQuestionList[2].questionId}
                        inputType="date"
                      >
                        <div className="w-full">
                          {/* <input
                                                        type="text"
                                                        placeholder="mm/dd/yyyy"
                                                        className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[#A7885A] focus:outline-none"
                                                        value={formData[hairQuestionList[2].questionId]}
                                                        onChange={handleBirthDateChange}
                                                        onBlur={handleBirthDateChange}
                                                        required
                                                    /> */}
                          <DOBInput
                            value={formData["158"]}
                            onChange={(value) => {
                              const updatedData = { ...formData, 158: value };
                              setFormData(updatedData);
                              updateLocalStorage(updatedData);
                            }}
                            className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[#A7885A] focus:outline-none"
                            placeholder="MM/DD/YYYY"
                            minAge={18}
                            required
                          />
                          <WarningPopup
                            isOpen={showUnder18Popup}
                            onClose={() => setShowUnder18Popup(false)}
                            // title="Age Restriction"
                            message="Sorry, but we are not able to service you as this service is for adults only."
                            buttonText="OK"
                            showCheckbox={false}
                            titleColor="text-[#C19A6B]"
                            backgroundColor="bg-white"
                          />
                        </div>
                      </QuestionLayout>
                    )}

                    {currentPage === 4 && (
                      <QuestionLayout
                        title={hairQuestionList[3].questionHeader}
                        subtitle={hairQuestionList[3].subtitle}
                        currentPage={currentPage}
                        pageNo={4}
                        questionId={hairQuestionList[3].questionId}
                      >
                        {hairQuestionList[3].answers.map((answer, index) => (
                          <QuestionOption
                            key={`${hairQuestionList[3].questionId}_${
                              index + 1
                            }`}
                            id={`${hairQuestionList[3].questionId}_${
                              index + 1
                            }`}
                            name={hairQuestionList[3].questionId}
                            value={answer.body}
                            checked={
                              formData[hairQuestionList[3].questionId] ===
                              answer.body
                            }
                            onChange={() =>
                              handleBiologicalSexSelect(answer.body)
                            }
                            type="radio"
                          />
                        ))}
                      </QuestionLayout>
                    )}

                    {currentPage === 5 && (
                      <QuestionLayout
                        title={hairQuestionList[4].questionHeader}
                        currentPage={currentPage}
                        pageNo={5}
                        questionId={hairQuestionList[4].questionId}
                      >
                        {hairQuestionList[4].answers.map((answer, index) => (
                          <QuestionOption
                            key={`${hairQuestionList[4].questionId}_${
                              index + 1
                            }`}
                            id={`${hairQuestionList[4].questionId}_${
                              index + 1
                            }`}
                            name={hairQuestionList[4].questionId}
                            value={answer.body}
                            checked={
                              formData[hairQuestionList[4].questionId] ===
                              answer.body
                            }
                            onChange={() =>
                              handleLiverDiseaseSelect(answer.body)
                            }
                            type="radio"
                          />
                        ))}
                      </QuestionLayout>
                    )}

                    {currentPage === 6 && (
                      <QuestionLayout
                        title={hairQuestionList[5].questionHeader}
                        currentPage={currentPage}
                        pageNo={6}
                        questionId={hairQuestionList[5].questionId}
                      >
                        {hairQuestionList[5].answers.map((answer, index) => (
                          <QuestionOption
                            key={`${hairQuestionList[5].questionId}_${
                              index + 1
                            }`}
                            id={`${hairQuestionList[5].questionId}_${
                              index + 1
                            }`}
                            name={hairQuestionList[5].questionId}
                            value={answer.body}
                            checked={
                              formData[hairQuestionList[5].questionId] ===
                              answer.body
                            }
                            onChange={() =>
                              handleBreastCancerSelect(answer.body)
                            }
                            type="radio"
                          />
                        ))}
                      </QuestionLayout>
                    )}

                    {currentPage === 7 && (
                      <QuestionLayout
                        title={hairQuestionList[6].questionHeader}
                        currentPage={currentPage}
                        pageNo={7}
                        questionId={hairQuestionList[6].questionId}
                      >
                        {hairQuestionList[6].answers.map((answer, index) => (
                          <QuestionOption
                            key={`${hairQuestionList[6].questionId}_${
                              index + 1
                            }`}
                            id={`${hairQuestionList[6].questionId}_${
                              index + 1
                            }`}
                            name={hairQuestionList[6].questionId}
                            value={answer.body}
                            checked={
                              formData[hairQuestionList[6].questionId] ===
                              answer.body
                            }
                            onChange={() =>
                              handleProstateCancerSelect(answer.body)
                            }
                            type="radio"
                          />
                        ))}
                      </QuestionLayout>
                    )}

                    {currentPage === 8 && (
                      <QuestionLayout
                        title={hairQuestionList[7].questionHeader}
                        subtitle={hairQuestionList[7].subtitle}
                        currentPage={currentPage}
                        pageNo={8}
                        questionId={hairQuestionList[7].questionId}
                        inputType="checkbox"
                      >
                        {hairQuestionList[7].answers.map((answer) => (
                          <QuestionOption
                            key={answer.id}
                            id={answer.id}
                            name={answer.id}
                            value={answer.body}
                            checked={!!formData[answer.id]}
                            onChange={() =>
                              handleScalpSymptomSelect(answer.id, answer.body)
                            }
                            type="checkbox"
                            isNoneOption={answer.isNoneOption}
                          />
                        ))}
                      </QuestionLayout>
                    )}

                    {currentPage === 9 && (
                      <QuestionLayout
                        title={hairQuestionList[8].questionHeader}
                        currentPage={currentPage}
                        pageNo={9}
                        questionId={hairQuestionList[8].questionId}
                        inputType="checkbox"
                      >
                        {hairQuestionList[8].answers.map((answer) => (
                          <QuestionOption
                            key={answer.id}
                            id={answer.id}
                            name={answer.id}
                            value={answer.body}
                            checked={!!formData[answer.id]}
                            onChange={() =>
                              handleConditionSelect(answer.id, answer.body)
                            }
                            type="checkbox"
                            isNoneOption={answer.isNoneOption}
                          />
                        ))}
                      </QuestionLayout>
                    )}

                    {currentPage === 11 && (
                      <QuestionLayout
                        title={hairQuestionList[10].questionHeader}
                        currentPage={currentPage}
                        pageNo={11}
                        questionId={hairQuestionList[10].questionId}
                        inputType="checkbox"
                      >
                        {hairQuestionList[10].answers.map((answer) => (
                          <QuestionOption
                            key={answer.id}
                            id={answer.id}
                            name={answer.id}
                            value={answer.body}
                            checked={!!formData[answer.id]}
                            onChange={() =>
                              handleSexualIssueSelect(answer.id, answer.body)
                            }
                            type="checkbox"
                            isNoneOption={answer.isNoneOption}
                          />
                        ))}
                      </QuestionLayout>
                    )}

                    {currentPage === 12 && (
                      <QuestionLayout
                        title={hairQuestionList[11].questionHeader}
                        currentPage={currentPage}
                        pageNo={12}
                        questionId={hairQuestionList[11].questionId}
                        inputType="checkbox"
                      >
                        {hairQuestionList[11].answers.map((answer) => (
                          <QuestionOption
                            key={answer.id}
                            id={answer.id}
                            name={answer.id}
                            value={answer.body}
                            checked={!!formData[answer.id]}
                            onChange={() =>
                              handleMentalHealthConditionSelect(
                                answer.id,
                                answer.body
                              )
                            }
                            type="checkbox"
                            isNoneOption={answer.isNoneOption}
                          />
                        ))}

                        {formData["27_5"] && (
                          <QuestionAdditionalInput
                            id="36"
                            name="36"
                            placeholder="Please enter your other medical conditions"
                            value={formData["36"] || ""}
                            onChange={handleMentalHealthOtherChange}
                            type="textarea"
                            subtext="e.g. Medical Condition 1, Medical Condition 2"
                          />
                        )}
                      </QuestionLayout>
                    )}

                    {currentPage === 13 && (
                      <QuestionLayout
                        title={hairQuestionList[12].questionHeader}
                        currentPage={currentPage}
                        pageNo={13}
                        questionId={hairQuestionList[12].questionId}
                      >
                        {hairQuestionList[12].answers.map((answer, index) => (
                          <QuestionOption
                            key={`${hairQuestionList[12].questionId}_${
                              index + 1
                            }`}
                            id={`${hairQuestionList[12].questionId}_${
                              index + 1
                            }`}
                            name={hairQuestionList[12].questionId}
                            value={answer.body}
                            checked={
                              formData[hairQuestionList[12].questionId] ===
                              answer.body
                            }
                            onChange={() =>
                              handleMedicationsSelect(answer.body)
                            }
                            type="radio"
                          />
                        ))}

                        {formData["28"] === "Yes" && (
                          <div className="mt-4 w-full">
                            <p className="text-sm mb-2">
                              Please enter the exact name and dosing of the
                              medications you are taking
                            </p>
                            <textarea
                              id="29"
                              name="29"
                              value={formData["29"] || ""}
                              onChange={handleMedicationDetailsChange}
                              onBlur={() =>
                                submitOnBlur("29", formData["29"] || "")
                              }
                              placeholder="Example: Medication 1 and Dose 1, Medication 2 and Dose 2"
                              className="w-full p-3 border border-gray-300 rounded-md min-h-[100px]"
                            />
                          </div>
                        )}
                      </QuestionLayout>
                    )}

                    {currentPage === 14 && (
                      <QuestionLayout
                        title={hairQuestionList[13].questionHeader}
                        subtitle={hairQuestionList[13].subtitle}
                        currentPage={currentPage}
                        pageNo={14}
                        questionId={hairQuestionList[13].questionId}
                        subtitleStyle={{ color: "#C19A6B" }}
                      >
                        {hairQuestionList[13].answers.map((answer, index) => (
                          <QuestionOption
                            key={`${hairQuestionList[13].questionId}_${
                              index + 1
                            }`}
                            id={`${hairQuestionList[13].questionId}_${
                              index + 1
                            }`}
                            name={hairQuestionList[13].questionId}
                            value={answer.body}
                            checked={
                              formData[hairQuestionList[13].questionId] ===
                              answer.body
                            }
                            onChange={() =>
                              handleOtherMedicalConditionsSelect(answer.body)
                            }
                            type="radio"
                          />
                        ))}

                        {formData["30"] === "Yes" && (
                          <div className="mt-4 w-full">
                            <textarea
                              id="41"
                              name="41"
                              value={formData["41"] || ""}
                              onChange={handleOtherMedicalConditionsChange}
                              placeholder="e.g. Other Medical Condition 1, Other Medical Condition 2"
                              className="w-full p-3 border border-gray-300 rounded-md min-h-[100px]"
                            />
                          </div>
                        )}
                      </QuestionLayout>
                    )}

                    {currentPage === 15 && (
                      <QuestionLayout
                        title={hairQuestionList[14].questionHeader}
                        currentPage={currentPage}
                        pageNo={15}
                        questionId={hairQuestionList[14].questionId}
                      >
                        {hairQuestionList[14].answers.map((answer, index) => (
                          <QuestionOption
                            key={`${hairQuestionList[14].questionId}_${
                              index + 1
                            }`}
                            id={`${hairQuestionList[14].questionId}_${
                              index + 1
                            }`}
                            name={hairQuestionList[14].questionId}
                            value={answer.body}
                            checked={
                              formData[hairQuestionList[14].questionId] ===
                              answer.body
                            }
                            onChange={() => handleAllergiesSelect(answer.body)}
                            type="radio"
                          />
                        ))}

                        {formData["31"] === "Yes" && (
                          <div className="mt-4 w-full">
                            <p className="text-sm mb-2">
                              Please enter the allergies in the box below
                              separated by commas (,)
                            </p>
                            <textarea
                              id="32"
                              name="32"
                              value={formData["32"] || ""}
                              onChange={handleAllergiesChange}
                              placeholder="Example: Allergie 1, Allergie 2"
                              className="w-full p-3 border border-gray-300 rounded-md min-h-[100px]"
                            />
                          </div>
                        )}
                      </QuestionLayout>
                    )}

                    {currentPage === 16 && (
                      <QuestionLayout
                        title={hairQuestionList[15].questionHeader}
                        currentPage={currentPage}
                        pageNo={16}
                        questionId="upload"
                        inputType="upload"
                      >
                        <div className="w-full space-y-8">
                          {/* Photo upload UI code remains the same */}
                          <input
                            type="hidden"
                            id="photo_upload_1_url"
                            name="33"
                            value={formData["33"] || ""}
                          />
                          <input
                            type="hidden"
                            id="photo_upload_2_url"
                            name="34"
                            value={formData["34"] || ""}
                          />
                          {/* Front Hairline Photo Upload */}
                          <div className="w-full md:w-4/5 mx-auto">
                            {/* Photo upload content */}
                            <input
                              id="photo_upload_1"
                              className="hidden"
                              type="file"
                              name="photo_upload_1"
                              accept="image/*"
                              onChange={handleFrontHairlinePhotoSelect}
                            />
                            <label
                              htmlFor="photo_upload_1"
                              className="flex items-center cursor-pointer p-5 border-2 border-gray-300 rounded-lg shadow-md hover:bg-gray-50"
                            >
                              <div className="flex w-full flex-col">
                                <div className="flex items-center mb-2">
                                  <img
                                    className="w-16 h-16 object-contain mr-4 flex-shrink-0"
                                    src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/head-front.png"
                                    id="output1"
                                    alt="Upload icon"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[#C19A6B] break-words">
                                      Tap to upload Front Hairline photo
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </label>
                            <p className="text-center text-sm mt-2 mb-6">
                              The provider needs a photo of your front hairline.
                            </p>
                          </div>
                          {/* Top of Head Photo Upload */}
                          <div className="w-full md:w-4/5 mx-auto">
                            <input
                              id="photo_upload_2"
                              className="hidden"
                              type="file"
                              name="photo_upload_2"
                              accept="image/*"
                              onChange={handleTopHeadPhotoSelect}
                            />
                            <label
                              htmlFor="photo_upload_2"
                              className="flex items-center cursor-pointer p-5 border-2 border-gray-300 rounded-lg shadow-md hover:bg-gray-50"
                            >
                              <div className="flex w-full flex-col">
                                <div className="flex items-center mb-2">
                                  <img
                                    className="w-16 h-16 object-contain mr-4 flex-shrink-0"
                                    src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/head-back.png"
                                    id="output2"
                                    alt="Upload icon"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <span className="text-[#C19A6B] break-words">
                                      Tap to upload Top of Head photo
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </label>
                            <p className="text-center text-sm mt-2">
                              The provider needs a clear photo of the top of
                              your head
                            </p>
                            <p className="text-center text-xs mt-1 text-gray-500">
                              It helps to use a mirror
                            </p>
                          </div>
                          {/* File format information */}{" "}
                          <div className="text-center text-xs text-gray-400 mt-6">
                            <p>
                              Only JPG, JPEG, PNG, HEIF, and HEIC images are
                              supported.
                            </p>
                            <p>Max allowed file size per image is 20MB</p>
                          </div>
                          {/* Upload button */}
                          <div className="text-center mt-6">
                            <button
                              type="button"
                              onClick={handlePhotoUpload}
                              className="upload-button hidden bg-gray-300 hover:bg-gray-400 text-black font-medium py-3 px-6 rounded-full w-full max-w-md"
                              disabled={isUploading}
                            >
                              {isUploading ? (
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
                                "Upload and Continue"
                              )}
                            </button>
                          </div>
                        </div>
                      </QuestionLayout>
                    )}

                    {currentPage === 17 && (
                      <QuestionLayout
                        title={hairQuestionList[16].questionHeader}
                        currentPage={currentPage}
                        pageNo={17}
                        questionId={hairQuestionList[16].questionId}
                        inputType="radio"
                      >
                        <div className="text-left px-3 mx-2 sm:mx-2 md:mx-auto">
                          <h3 className="quiz-subheading text-[16px] text-left font-semibold pt-1">
                            Intended benefits of Finasteride for Hair Loss:
                          </h3>
                          <ul className="list-disc ml-7 mt-3 text-[#AE7E56] marker:text-[#AE7E56]">
                            <li className="text-lg text-left font-medium mb-3">
                              To help prevent further hair loss in male pattern
                              baldness
                            </li>
                            <li className="text-lg text-left font-medium mb-3">
                              This is not a cure for male pattern baldness
                            </li>
                            <li className="text-lg text-left font-medium mb-3">
                              If medication is stopped, hair loss is likely to
                              start again
                            </li>
                          </ul>

                          <span className="block border-b border-gray-300 mt-2"></span>

                          <h3 className="quiz-subheading text-lg text-left font-semibold pt-4 mt-2">
                            When can I expect to see initial results:
                          </h3>
                          <ul className="list-disc ml-7 mt-3 text-[#AE7E56] marker:text-[#AE7E56]">
                            <li className="text-lg text-left font-medium mb-3">
                              3 to 6 months
                            </li>
                          </ul>

                          <h3 className="quiz-subheading text-lg text-left font-semibold pt-4 mt-2">
                            Possible Side Effects:*
                          </h3>
                          <ul className="list-disc pl-4 mb-4 mt-3">
                            <li className="text-sm text-left font-normal mb-1">
                              Erectile dysfunction
                            </li>
                            <li className="text-sm text-left font-normal mb-1">
                              Low sex drive
                            </li>
                            <li className="text-sm text-left font-normal mb-1">
                              Difficulty ejaculating
                            </li>
                            <li className="text-sm text-left font-normal mb-1">
                              Indigestion
                            </li>
                            <li className="text-sm text-left font-normal">
                              Mood disturbance
                            </li>
                          </ul>

                          <span className="block border-b border-gray-300 mt-2"></span>

                          <h3 className="quiz-subheading text-[11px] text-left font-normal pt-2 text-gray-600">
                            *This is less likely to occur with the 2-1 foam
                            topical solution vs oral finasteride. This isn’t a
                            full list of potential side effects. To learn more,
                            please book an appointment or send a message to your
                            clinician
                          </h3>

                          <span className="block border-b border-gray-300 mt-2"></span>
                        </div>

                        <div className="quiz-options-wrapper flex flex-col flex-wrap items-center justify-center p-3 pb-6 mx-4 sm:mx-2 md:mx-auto">
                          {hairQuestionList[16].answers.map((answer, index) => (
                            <div
                              key={`${hairQuestionList[16].questionId}_${index}`}
                              className="quiz-option-1 text-left block w-full flex items-start mb-4"
                              data-option="1"
                            >
                              <input
                                id={`${hairQuestionList[16].questionId}_${index}`}
                                className="quiz-option-input quiz-option-input-203 w-6 h-6 accent-[#AE7E56] mt-1 mr-3 flex-shrink-0"
                                type="radio"
                                name={hairQuestionList[16].questionId}
                                value={answer.body}
                                checked={
                                  formData[hairQuestionList[16].questionId] ===
                                  answer.body
                                }
                                onChange={() =>
                                  handleMedicationAcknowledgment(answer.body)
                                }
                              />
                              <label
                                htmlFor={`${hairQuestionList[16].questionId}_${index}`}
                                className="quiz-option-label cursor-pointer text-md"
                              >
                                {answer.body}
                              </label>
                            </div>
                          ))}
                        </div>
                      </QuestionLayout>
                    )}

                    {currentPage === 18 && (
                      <QuestionLayout
                        title={hairQuestionList[17].questionHeader}
                        currentPage={currentPage}
                        pageNo={18}
                        questionId={hairQuestionList[17].questionId}
                      >
                        <div className="w-full space-y-4">
                          {hairQuestionList[17].answers.map((answer, index) => (
                            <div
                              key={index}
                              className={`quiz-option text-left block w-full mb-4 cursor-pointer`}
                              onClick={() =>
                                handleHealthcareQuestionsSelect(answer.body)
                              }
                            >
                              <div
                                className={`quiz-option-label cursor-pointer text-left p-4 border-2 
                                          ${
                                            formData["35_choice"] ===
                                            answer.body
                                              ? "border-[#A7885A]"
                                              : "border-gray-300"
                                          } 
                                          rounded-[12px] block w-full shadow-md flex items-center`}
                              >
                                <span className="flex-grow">{answer.body}</span>
                                {formData["35_choice"] === answer.body && (
                                  <svg
                                    className="w-6 h-6 text-[#A7885A]"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          ))}
                          {formData["35_choice"] === "Yes" && (
                            <div className="mt-4 w-full">
                              <p className="text-sm text-center mb-4">
                                Ask any questions you may have about your
                                condition or treatment options
                              </p>
                              <textarea
                                id="35"
                                name="35"
                                value={formData["35"] || ""}
                                onChange={handleProviderMessageChange}
                                placeholder="Type in your questions here..."
                                className="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-[#A7885A] focus:outline-none min-h-[150px]"
                              />
                            </div>
                          )}
                        </div>
                      </QuestionLayout>
                    )}

                    {currentPage === 19 && (
                      <QuestionLayout
                        title={hairQuestionList[18].questionHeader}
                        currentPage={currentPage}
                        pageNo={19}
                        questionId={hairQuestionList[18].questionId}
                        inputType="radio"
                      >
                        {hairQuestionList[18].answers.map((answer, index) => (
                          <QuestionOption
                            key={`${hairQuestionList[18].questionId}_${
                              index + 1
                            }`}
                            id={`${hairQuestionList[18].questionId}_${
                              index + 1
                            }`}
                            name={hairQuestionList[18].questionId}
                            value={answer.body}
                            checked={
                              formData[hairQuestionList[18].questionId] ===
                                answer.body ||
                              (answer.body === "Clinician" &&
                                formData[hairQuestionList[18].questionId] ===
                                  "Doctor")
                            }
                            onChange={() => handleBookCallSelect(answer.body)}
                            type="radio"
                          />
                        ))}
                      </QuestionLayout>
                    )}

                    {currentPage === 20 && (
                      <QuestionLayout
                        title={hairQuestionList[19].questionHeader}
                        currentPage={currentPage}
                        pageNo={20}
                        questionId={hairQuestionList[19].questionId}
                        inputType="checkbox"
                      >
                        <div className="text-left px-4 mb-6">
                          <p className="text-[#C19A6B] text-lg mb-8">
                            Please note this step is mandatory. If you are
                            unable to complete at this time, email your ID to{" "}
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

                    {currentPage === 21 && (
                      <motion.div
                        key={currentPage}
                        variants={slideVariants}
                        initial={isMovingForward ? "hiddenRight" : "hiddenLeft"}
                        animate="visible"
                        exit={isMovingForward ? "exitRight" : "exitLeft"}
                        className="w-full"
                      >
                        <div className="px-4 pt-6 pb-4">
                          <h1 className="text-3xl text-center text-[#AE7E56] font-bold mb-6">
                            {hairQuestionList[20].questionHeader}
                          </h1>
                          <h3 className="text-lg text-center font-medium mb-4">
                            {hairQuestionList[20].subtitle}
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
                                  Please capture a selfie of yourself holding
                                  your ID
                                </p>{" "}
                                <p className="text-center text-sm text-gray-500 mb-8">
                                  Only JPG, JPEG, PNG, HEIF, and HEIC images are
                                  supported.
                                  <br />
                                  Maximum file size per image is 20MB
                                </p>
                              </div>
                            )}
                          </div>{" "}
                          <input
                            type="hidden"
                            name="38"
                            value={formData["38"] || ""}
                          />
                        </div>
                      </motion.div>
                    )}

                    <WarningPopup
                      isOpen={showNameDifferencePopup}
                      onClose={(proceed = true) => {
                        setShowNameDifferencePopup(false);
                      }}
                      title="Name Difference Detected"
                      message="The name you've entered is different from your account information."
                      showCheckbox={false}
                      additionalContent={
                        <div className="w-full space-y-4 my-6">
                          <div
                            className="p-3 border-2 rounded-lg cursor-pointer hover:border-[#A7885A]"
                            onClick={() => {
                              setNameUpdateOption("update");
                              setShowNameDifferencePopup(false);
                            }}
                          >
                            <p className="font-medium">Update my legal name</p>
                            <p className="text-sm text-gray-500">
                              Your account information will be updated with your
                              new legal name.
                            </p>
                          </div>

                          <div
                            className="p-3 border-2 rounded-lg cursor-pointer hover:border-[#A7885A]"
                            onClick={() => {
                              setNameUpdateOption("someone_else");
                              setShowNameDifferencePopup(false);
                            }}
                          >
                            <p className="font-medium">
                              I'm ordering for someone else
                            </p>
                            <p className="text-sm text-gray-500">
                              The prescription will be issued for this person
                              instead of you.
                            </p>
                          </div>
                        </div>
                      }
                      buttonText="Cancel"
                      backgroundColor="bg-white"
                      titleColor="text-black"
                      currentPage={currentPage}
                    />

                    {/* Photo ID Popup */}
                    <WarningPopup
                      isOpen={showPhotoIdPopup}
                      onClose={(proceed = true) => {
                        if (proceed && photoIdAcknowledged) {
                          setShowPhotoIdPopup(false);
                          updateProgressData();
                        } else if (!proceed) {
                          setShowPhotoIdPopup(false);
                        }
                      }}
                      title="Upload Photo ID"
                      message={
                        <>
                          <p className="mb-5 text-md text-left">
                            Please note this step is mandatory. If you are
                            unable to complete at this time, email your ID to{" "}
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
                      currentPage={currentPage}
                    />

                    {/* No Call Acknowledgement Popup */}
                    <WarningPopup
                      isOpen={showNoCallAcknowledgement}
                      onClose={handleNoCallContinue}
                      title="No Call Acknowledgement"
                      message="I hereby acknowledge that by foregoing an appointment with a licensed physician or pharmacist, it is my sole responsibility to ensure I am aware of how to appropriately use the medication requested, furthermore I hereby confirm that I am aware of any potential side effects that may occur through the use of the aforementioned medication and hereby confirm that I do not have any medical questions to ask. I will ensure I have read the relevant product page and FAQ prior to use of the prescribed medication. Should I have any questions to ask, I am aware of how to contact the clinical team at MyRocky or get a hold of my primary care provider."
                      isAcknowledged={noCallAcknowledged}
                      onAcknowledge={handleNoCallAcknowledgement}
                      buttonText="I Acknowledge"
                      backgroundColor="bg-white"
                      currentPage={currentPage}
                      afterButtonContent={
                        <p className="mt-4 text-center font-medium text-md text-[#000000]">
                          <button
                            onClick={handleRequestCallInstead}
                            className="underline hover:text-gray-900"
                          >
                            I would like to request the call instead
                          </button>
                        </p>
                      }
                    />

                    {/* Mental Health Warning Popup */}
                    <WarningPopup
                      isOpen={showMentalHealthWarning}
                      onClose={handleMentalHealthWarningClose}
                      title="Sorry..."
                      message={
                        mentalHealthWarningType === "psychosis"
                          ? "We care about your health and want you to be the best version of yourself. If you are currently experiencing psychosis please speak to your doctor immediately or go to your local emergency department."
                          : "We care about your health and want you to be the best version of yourself. If you are currently experiencing suicidal thoughts please speak to your doctor immediately or go to your local emergency department."
                      }
                      isAcknowledged={mentalHealthWarningAcknowledged}
                      onAcknowledge={handleMentalHealthWarningAcknowledge}
                      buttonText="OK"
                      titleColor="text-[#C19A6B]"
                      currentPage={currentPage}
                    />

                    {/* Is condition active popup */}
                    <WarningPopup
                      isOpen={showConditionActivePopup}
                      onClose={(proceed = true) => {
                        if (proceed && isConditionActive) {
                          setShowConditionActivePopup(false);
                        } else if (!proceed) {
                          setShowConditionActivePopup(false);
                          setIsConditionActive("");
                        }
                      }}
                      title="Is it currently active?"
                      message=""
                      showCheckbox={false}
                      additionalContent={
                        <div className="w-full space-y-4 my-8">
                          <QuestionOption
                            id="40_1"
                            name="40"
                            value="Yes"
                            checked={formData["40"] === "Yes"}
                            onChange={() => handleConditionActiveSelect("Yes")}
                            type="radio"
                          />

                          <QuestionOption
                            id="40_2"
                            name="40"
                            value="No, my scalp is clear"
                            checked={formData["40"] === "No, my scalp is clear"}
                            onChange={() =>
                              handleConditionActiveSelect(
                                "No, my scalp is clear"
                              )
                            }
                            type="radio"
                          />
                        </div>
                      }
                      buttonText="Continue"
                      titleColor="text-black"
                      backgroundColor="bg-white"
                      currentPage={currentPage}
                    />

                    {/* Medical Condition Warning Popup */}
                    <WarningPopup
                      isOpen={showMedicalConditionPopup}
                      onClose={handleMedicalConditionPopupClose}
                      title="Sorry..."
                      message="This may be the cause of your hair loss and will require direct treatment of the underlying condition. We are therefore unable to provide you with assistance at this time. Please speak to your doctor to determine the care you need."
                      isAcknowledged={conditionActiveAcknowledged}
                      onAcknowledge={handleConditionActiveAcknowledge}
                      buttonText="OK"
                      titleColor="text-[#C19A6B]"
                      currentPage={currentPage}
                    />

                    {/* Scalp Symptoms Warning Popup */}
                    <WarningPopup
                      isOpen={showScalpSymptomsWarning}
                      onClose={handleScalpSymptomsWarningClose}
                      title="Sorry..."
                      message="This may be the cause of your hair loss and will require direct treatment of the underlying condition. We are therefore unable to provide you with assistance at this time. Please speak to your doctor to determine the care you need."
                      showCheckbox={true}
                      isAcknowledged={scalpSymptomsAcknowledged}
                      onAcknowledge={(e) =>
                        setScalpSymptomsAcknowledged(e.target.checked)
                      }
                      buttonText="I Acknowledge"
                      titleColor="text-[#C19A6B]"
                      currentPage={currentPage}
                    />

                    {/* Prostate Cancer Warning Popup */}
                    <WarningPopup
                      isOpen={showProstateCancerWarning}
                      onClose={handleProstateCancerWarningClose}
                      title="Please keep in mind that..."
                      message="Finasteride can increase the chance of a faster growing or irregular form of prostate cancer. If you have or have had prostate cancer, this drug can make it worse and therefore not safe for use. We are therefore unable to provide you with a prescription at this time."
                      isAcknowledged={prostateCancerWarningAcknowledged}
                      onAcknowledge={handleProstateCancerWarningAcknowledge}
                      buttonText="OK"
                      titleColor="text-[#C19A6B]"
                      currentPage={currentPage}
                    />

                    {/* Breast Cancer Warning Popup */}
                    <WarningPopup
                      isOpen={showBreastCancerWarning}
                      onClose={handleBreastCancerWarningClose}
                      title="Please keep in mind that..."
                      message="We care about your health here at MyRocky. This medication may not be safe for use with breast cancer and we are therefore unable to provide you with a prescription at this time. Please speak to your health care provider to see if Finasteride may be safe for you."
                      isAcknowledged={breastCancerWarningAcknowledged}
                      onAcknowledge={handleBreastCancerWarningAcknowledge}
                      buttonText="OK"
                      titleColor="text-[#C19A6B]"
                      currentPage={currentPage}
                    />

                    {/* Liver Disease Warning Popup */}
                    <WarningPopup
                      isOpen={showLiverWarning}
                      onClose={handleLiverWarningClose}
                      title="Warning"
                      message="Finasteride requires a healthy liver to be safely metabolized and removed from the body. We are therefore unable to provide you with a prescription at this time. Please speak to your health care provider to see if Finasteride may be safe for you."
                      isAcknowledged={liverWarningAcknowledged}
                      onAcknowledge={handleLiverWarningAcknowledge}
                      buttonText="OK"
                      titleColor="text-[#C19A6B]"
                      currentPage={currentPage}
                    />

                    {/* Female Warning Popup */}
                    <WarningPopup
                      isOpen={showFemaleWarning}
                      onClose={handleFemaleWarningClose}
                      title="Just a Quick Note! 😊"
                      message="We noticed you selected Female—currently, our treatments for hair loss are only available for men."
                      showCheckbox={false}
                      buttonText="Ok, I understand"
                      backgroundColor="bg-[#F5F4EF]"
                      titleColor="text-[#C19A6B]"
                      currentPage={currentPage}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </form>

            <p className="error-box text-red-500 hidden m-2 text-center text-sm"></p>

            <div className="fixed bottom-0 left-0 w-full p-4 z-[9999] bg-white shadow-lg flex items-center justify-center">
              <button
                type="button"
                onClick={() => {
                  if (currentPage === 21 && photoIdFile) {
                    verifyCustomerAndProceed();
                  } else if (currentPage === 21) {
                    alert("Please upload your ID photo to continue.");
                  } else {
                    moveToNextSlide();
                  }
                }}
                className="bg-black text-white w-full max-w-md py-4 px-4 rounded-full font-medium text-lg quiz-continue-button"
                style={{
                  display: shouldShowContinueButton(currentPage)
                    ? "block"
                    : "none",
                  opacity:
                    (currentPage === 20 && !photoIdAcknowledged) ||
                    (currentPage === 21 && (!photoIdFile || isUploading))
                      ? "0.5"
                      : "1",
                }}
                disabled={
                  (currentPage === 20 && !photoIdAcknowledged) ||
                  (currentPage === 21 && (!photoIdFile || isUploading))
                }
              >
                {currentPage === 20 ? (
                  "I acknowledge"
                ) : currentPage === 21 && photoIdFile ? (
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
            </div>

            {/* <p className="text-center text-xs text-gray-500 mt-5">
              We respect your privacy. All of your information is securely
              stored on our HIPAA Compliant server.
            </p> */}
            <div className="quiz-footer flex flex-col flex-wrap items-center justify-center mx-auto px-10 py-4 bg-white z-20 w-full"></div>
          </div>
        </div>
      )}

      {currentPage === 22 && hairShowIntermission && hairIntermissionProps && (
        <div className="px-5 py-8 flex justify-center">
          <div className="border rounded-xl w-full max-w-[480px] p-6">
            <QuestionnaireIntermission {...hairIntermissionProps} />
          </div>
        </div>
      )}

      {currentPage === 22 && !hairShowIntermission && (
        <div className="fixed inset-0 bg-[#F5F4EF] overflow-hidden flex flex-col">
          <div className="absolute inset-0 hidden md:block">
            <img
              src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/hair-web.png"
              alt="Background"
              className="w-full h-full object-cover object-right brightness-110 contrast-105"
            />
          </div>

          <div className="absolute inset-0 block md:hidden">
            <img
              src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/hair-m.png"
              alt="Background"
              className="w-full h-full object-cover object-bottom brightness-110 contrast-105"
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

          <div className="relative flex-1 flex flex-col items-center justify-between px-6 z-10">
            <div className="text-center max-w-md md:max-w-xl mx-auto mt-8 md:mt-16">
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
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98.059 1.281.073 1.689.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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

            <div className="w-full px-6 z-10 pb-6 md:pb-8 mb-4">
              <div className="max-w-md md:max-w-lg mx-auto">
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full bg-white text-black py-4 md:py-5 px-6 rounded-full text-base md:text-xl font-medium shadow-md hover:bg-gray-100 transition-colors"
                >
                  Go back home
                </button>
              </div>{" "}
            </div>
          </div>
        </div>
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
          Syncing. Please wait ... <br />
          <small style={{ color: "#999", letterSpacing: 0 }}>
            If this takes longer than 20 seconds, refresh the page.
          </small>
        </p>
      </div>
    </div>
  );
}
