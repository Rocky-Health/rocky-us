"use client";

import { useState, useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { WarningPopup } from "./WarningPopup";
import { QuestionLayout } from "./QuestionLayout";
import { QuestionOption } from "./QuestionOption";
import { QuestionAdditionalInput } from "./QuestionAdditionalInput";
import { motion, AnimatePresence } from "framer-motion";
import QuestionnaireNavbar from "./QuestionnaireNavbar";
import { ProgressBar } from "./ProgressBar";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaCheckCircle,
} from "react-icons/fa";
import Loader from "../Loader";
import {
  getPrefillStorageKey,
  mapCrmResponseToFormData,
} from "@/lib/questionnairePrefillConfig";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";
import { useQuizSequence } from "@/lib/questionnaire/useQuizSequence";
import QuestionnaireIntermission from "@/components/OrderReceived/QuestionnaireIntermission";
const { uploadFileToS3WithProgress } = await import(
  "@/utils/s3/frontend-upload"
);

const ED_PREFILL_KEY = getPrefillStorageKey("/ed-consultation-quiz");

const QuestionWrapper = ({ children }) => (
  <div className="w-[335px] md:w-[520px] mx-auto">{children}</div>
);

export default function EDConsultationQuiz({
  pn,
  userName,
  userEmail,
  province,
  dosage,
  dob,
}) {
  const getInitialFormData = () => {
    if (typeof window !== "undefined") {
      try {
        const now = new Date();
        const ttl = localStorage.getItem("quiz-form-data-expiry");
        if (ttl && now.getTime() < parseInt(ttl)) {
          const stored = localStorage.getItem("quiz-form-data");
          if (stored) {
            return JSON.parse(stored);
          }
        }
      } catch (e) {
        logger.error("Error loading form data from localStorage:", e);
      }
    }
    const nameParts = userName.split(" ");
    const fname = nameParts[0];
    const lname = nameParts[1];
    // Check for lidocaine addon selection
    let lidocaineAnswer = "";
    if (typeof window !== "undefined") {
      try {
        const prematureEjaculationData = localStorage.getItem(
          "premature_ejaculation_answer"
        );
        if (prematureEjaculationData) {
          const parsedData = JSON.parse(prematureEjaculationData);
          if (
            parsedData &&
            typeof parsedData === "object" &&
            parsedData.source === "lidocaine_addon_selection"
          ) {
            lidocaineAnswer = parsedData["98"] || "";
            logger.log(
              "Loaded lidocaine answer from localStorage:",
              lidocaineAnswer
            );
          } else {
            logger.warn(
              "Invalid lidocaine data structure, clearing localStorage"
            );
            localStorage.removeItem("premature_ejaculation_answer");
          }
        }
      } catch (e) {
        logger.error("Error loading lidocaine addon data:", e);
        try {
          localStorage.removeItem("premature_ejaculation_answer");
        } catch (_) {}
      }
    }

    return {
      form_id: 2,
      action: "ed_questionnaire_data_upload",
      entrykey: "",
      id: "",
      token: "",
      stage: "consultation-after-checkout",
      page_step: 1,
      completion_state: "Partial",
      completion_percentage: 10,
      source_site: process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com",
      "130_3": fname || "",
      "130_6": lname || "",
      131: userEmail,
      132: pn,
      158: dob,
      "161_4": province,
      "selected-dosage": dosage,
      1: "",
      28: "",
      148: "",
      181: "",
      182: "",
      196: "",
      ...(lidocaineAnswer ? { 98: lidocaineAnswer } : {}),
      ...Array.from({ length: 6 }, (_, i) => ({ [`23_${i + 1}`]: "" })).reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      ),
      ...Array.from({ length: 3 }, (_, i) => ({ [`5_${i + 1}`]: "" })).reduce(
        (acc, curr) => ({ ...acc, ...curr }),
        {}
      ),
    };
  };

  const nameParts = userName.split(" ");
  const fname = nameParts[0];
  const lname = nameParts[1];

  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef(null);
  const isValidating = useRef(false);
  const isIntentionalNavigation = useRef(false);

  // Multi-questionnaire sequence
  const {
    showIntermission: edShowIntermission,
    intermissionProps: edIntermissionProps,
    handleQuizComplete: edHandleQuizComplete,
  } = useQuizSequence(router);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomerVerificationPopup, setShowCustomerVerificationPopup] =
    useState(false);
  const [photoIdFile, setPhotoIdFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isHandlingPopState = useRef(false);
  const [isMovingForward, setIsMovingForward] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useQuestionnaireStepTracking({
    questionnaireId: "ed-consultation",
    stepId: currentPage,
    stepIndex: currentPage,
    flowId: "ed",
    stepType: "quiz",
    isPostPurchaseConsultation: true,
  });

  const [progress, setProgress] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [showEdStartWarning, setShowEdStartWarning] = useState(false);
  const [edStartAcknowledged, setEdStartAcknowledged] = useState(false);
  const [showMedicationWarning, setShowMedicationWarning] = useState(false);
  const [currentMedicationWarning, setCurrentMedicationWarning] = useState("");
  const [showSexualIssuesPopup, setShowSexualIssuesPopup] = useState(false);
  const [showLowLibidoWarning, setShowLowLibidoWarning] = useState(false);
  const [lowLibidoAcknowledged, setLowLibidoAcknowledged] = useState(false);
  const [showHighBpWarning, setShowHighBpWarning] = useState(false);
  const [showVeryHighBpWarning, setShowVeryHighBpWarning] = useState(false);
  const [bpWarningAcknowledged, setBpWarningAcknowledged] = useState(false);
  const [showBpMedicationWarning, setShowBpMedicationWarning] = useState(false);
  const [bpMedicationWarningAcknowledged, setBpMedicationWarningAcknowledged] =
    useState(false);
  const [showCardioSymptomWarning, setShowCardioSymptomWarning] =
    useState(false);
  const [showNoCallAcknowledgement, setShowNoCallAcknowledgement] =
    useState(false);
  const [noCallAcknowledged, setNoCallAcknowledged] = useState(false);
  const [photoIdAcknowledged, setPhotoIdAcknowledged] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [validationAttempted, setValidationAttempted] = useState(false);
  const fileInputRef = useRef(null);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const getPhotoUploadStatus = () => {
    if (typeof window === "undefined") return { uploaded: false, url: null };

    try {
      const status = localStorage.getItem("ed-photo-upload-status");
      return status ? JSON.parse(status) : { uploaded: false, url: null };
    } catch (error) {
      logger.error("Error reading photo upload status:", error);
      return { uploaded: false, url: null };
    }
  };

  const setPhotoUploadStatus = (uploaded, url = null) => {
    if (typeof window === "undefined") return;

    try {
      const status = { uploaded, url, timestamp: Date.now() };
      localStorage.setItem("ed-photo-upload-status", JSON.stringify(status));
    } catch (error) {
      logger.error("Error setting photo upload status:", error);
    }
  };

  const clearPhotoUploadStatus = () => {
    if (typeof window === "undefined") return;

    try {
      localStorage.removeItem("ed-photo-upload-status");
    } catch (error) {
      logger.error("Error clearing photo upload status:", error);
    }
  };

  const [syncError, setSyncError] = useState(null);
  const [selectedCardioSymptoms, setSelectedCardioSymptoms] = useState({
    "49_1": "", // Chest pain during sex
    "49_2": "", // Chest pain during exercise
    "49_3": "", // Unexplained fainting or dizziness
    "49_4": "", // Leg or buttock pain with exercise
    "49_5": "", // Abnormal heart rate or rhythm
    "49_6": "", // None of these apply to me
  });
  const [formData, setFormData] = useState(getInitialFormData());

  const [isLoadingQuestionnairePrefill, setIsLoadingQuestionnairePrefill] =
    useState(false);
  const [questionnairePrefillLoaded, setQuestionnairePrefillLoaded] =
    useState(false);

  const [showThankYou, setShowThankYou] = useState(false);
  const [isCheckingCompletion, setIsCheckingCompletion] = useState(true);

  // Fire sequence check when ED quiz reaches the thank-you screen
  const edSequenceCheckedRef = useRef(false);
  useEffect(() => {
    if (currentPage === 22 && showThankYou && !edSequenceCheckedRef.current) {
      edSequenceCheckedRef.current = true;
      edHandleQuizComplete();
    }
  }, [currentPage, showThankYou, edHandleQuizComplete]);

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
    const processQueue = async () => {
      if (pendingSubmissions.length === 0 || isSyncing) return;
      if (formData.completion_state === "Full") {
        logger.log(
          "Skipping queue processing - questionnaire already completed"
        );
        setPendingSubmissions([]); // Clear pending submissions
        return;
      }

      setIsSyncing(true);

      try {
        const sortedSubmissions = [...pendingSubmissions].sort(
          (a, b) => a.timestamp - b.timestamp
        );

        const submission = sortedSubmissions[0];
        const dataToSubmit = JSON.parse(JSON.stringify(submission.data));

        if (
          formData.id &&
          formData.token &&
          (!dataToSubmit.id || !dataToSubmit.token)
        ) {
          dataToSubmit.id = formData.id;
          dataToSubmit.token = formData.token;
          logger.log("Added existing ID/token to submission data");
        }

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

            const updatedLocalData = {
              ...formData,
              id: result.id,
              token: result.token || formData.token,
              hair_entrykey: result.hair_entrykey || formData.hair_entrykey,
            };
            localStorage.setItem(
              "quiz-form-data",
              JSON.stringify(updatedLocalData)
            );
          }
        }

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

  const getTargetPageFromPrefill = (data) => {
    const has = (keys) => {
      if (Array.isArray(keys)) {
        return keys.some(
          (k) => data[k] != null && String(data[k]).trim() !== ""
        );
      }
      return data[keys] != null && String(data[keys]).trim() !== "";
    };
    if (!has("1")) return 1;
    if (!has("30")) return 2;
    if (!has("138")) return 3;
    if (!has(["23_1", "23_2", "23_3", "23_4", "23_5", "23_6"])) return 4;
    if (
      !has([
        "5_1",
        "5_2",
        "5_3",
        "5_4",
        "5_5",
        "5_6",
        "5_7",
        "5_8",
        "5_9",
        "5_11",
        "5_12",
        "5_13",
      ])
    )
      return 5;
    if (!has("25")) return 6;
    if (data["25"] === "Yes") {
      if (!has(["27_1", "27_2", "27_3", "27_4", "27_5", "27_6", "27_7", "28"]))
        return 7;
    }
    if (!has(["33_1", "33_2", "33_3", "33_5"])) return 8;
    if (!has("42")) return 9;
    if (!has("35")) return 10;
    if (!has("37")) return 11;
    if (!has("40")) return 12;
    if (!has("45")) return 13;
    if (!has("51")) return 14;
    if (!has(["49_1", "49_2", "49_3", "49_4", "49_5", "49_6"])) return 15;
    if (!has("2")) return 16;
    if (data["2"] === "Yes" && !has("148")) return 16;
    if (!has("203")) return 17;
    if (!has("179")) return 18;
    if (data["179"] === "Yes" && !has("181")) return 18;
    if (!has("178")) return 19;
    if (!has("196")) return 20;
    return 21;
  };

  useEffect(() => {
    if (!searchParams || questionnairePrefillLoaded) return;
    const id = searchParams.get("id");
    const token = searchParams.get("token");
    const patientToken = searchParams.get("patient-token");
    // Portal recovery link arrived with patient-token but is missing
    // id/token. Without this guard we'd silently start a fresh quiz, which
    // creates a new CRM entry and orphans the original record.
    if (patientToken && (!id || !token)) {
      toast.error(
        "This recovery link is incomplete. Please request a new link from your account."
      );
      return;
    }
    if (!id || !token || !patientToken) return;

    const loadPrefill = async () => {
      setIsLoadingQuestionnairePrefill(true);
      try {
        let answersData = null;
        const cached =
          typeof window !== "undefined" && localStorage.getItem(ED_PREFILL_KEY);
        if (cached) {
          try {
            const { id: cachedId, data } = JSON.parse(cached);
            if (cachedId === id && data?.data) {
              answersData = data.data;
              logger.log(
                "[EDConsultationQuiz] Using cached questionnaire-filled-answers"
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
          logger.log("[EDConsultationQuiz] questionnaire-filled-answers:", {
            status: res.status,
            data,
          });
          if (data?.data) {
            answersData = data.data;
            if (typeof window !== "undefined") {
              localStorage.setItem(
                ED_PREFILL_KEY,
                JSON.stringify({ id, token, data })
              );
            }
          }
        }
        if (answersData) {
          const mapped = mapCrmResponseToFormData(answersData);
          const merged = { ...formData, id, token, ...mapped };
          const targetPage = getTargetPageFromPrefill(merged);
          setFormData({ ...merged, page_step: targetPage });
          setCurrentPage(targetPage);
          setProgress(Math.min(100, Math.floor(((targetPage - 1) / 21) * 100)));
          if (typeof window !== "undefined") {
            const ttl = Date.now() + 60 * 60 * 1000;
            const dataToStore = {
              ...merged,
              page_step: targetPage,
              completion_percentage: Math.min(
                100,
                Math.floor(((targetPage - 1) / 21) * 100)
              ),
            };
            localStorage.setItem("quiz-form-data", JSON.stringify(dataToStore));
            localStorage.setItem("quiz-form-data-expiry", ttl.toString());
          }
        }
      } catch (err) {
        logger.error(
          "[EDConsultationQuiz] questionnaire-filled-answers error:",
          err
        );
      } finally {
        setIsLoadingQuestionnairePrefill(false);
        setQuestionnairePrefillLoaded(true);
      }
    };
    loadPrefill();
  }, [searchParams, questionnairePrefillLoaded]);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      localStorage.getItem("on-thank-you-page") === "true"
    ) {
      setCurrentPage(22);
      setProgress(100);
      setShowThankYou(true);
      return;
    }

    const storedData = readLocalStorage();
    if (!storedData) return;

    try {
      const quizFormData = JSON.parse(storedData);
      if (!quizFormData || typeof quizFormData !== 'object') {
        logger.warn("Invalid quiz form data structure, clearing localStorage");
        localStorage.removeItem("quiz-form-data");
        localStorage.removeItem("quiz-form-data-expiry");
        return;
      }
      
      if (quizFormData["1"] === "Female") {
        setCurrentPage(1);
        setProgress(0);
        setShowPopup(true);
        const updatedData = {
          ...quizFormData,
          page_step: 1,
        };
        setFormData(updatedData);
        updateLocalStorage(updatedData);
        return;
      }
      setFormData(quizFormData);

      const photoStatus = getPhotoUploadStatus();
      if (photoStatus.uploaded && quizFormData["196"] && !photoIdFile) {
        logger.log(
          "Detected photo was uploaded but file object lost after refresh. Photo URL:",
          photoStatus.url
        );
        if (quizFormData.completion_state !== "Full") {
          const updatedData = {
            ...quizFormData,
            completion_state: "Full",
            completion_percentage: 100,
            196: photoStatus.url,
          };
          setFormData(updatedData);
          updateLocalStorage(updatedData);
        }
      }

      if (!quizFormData.page_step) return;

      const storedPage = parseInt(quizFormData.page_step);
      if (isNaN(storedPage) || storedPage < 1 || storedPage > 22) {
        logger.warn(`Invalid page number ${storedPage}, resetting to page 1`);
        setCurrentPage(1);
        setProgress(0);
        return;
      }

      const pageConditions = [
        {
          page: 1,
          nextPage: 2,
          condition: () => quizFormData["1"] === "Male",
        },
        {
          page: 2,
          nextPage: 3,
          condition: () => quizFormData["30"],
        },
        {
          page: 3,
          nextPage: 4,
          condition: () => quizFormData["138"],
        },
        {
          page: 4,
          nextPage: 5,
          condition: () =>
            quizFormData["23_1"] === "Cocaine" ||
            quizFormData["23_2"] === "Marijuana" ||
            quizFormData["23_3"] === "Magic Mushrooms" ||
            quizFormData["23_4"] === "Tobacco/vaping nicotine" ||
            quizFormData["23_5"] === "None of these apply" ||
            quizFormData["23_6"] === "Poppers",
        },
        {
          page: 5,
          nextPage: 6,
          condition: () =>
            quizFormData["5_1"] === "No Medical Issues" ||
            quizFormData["5_2"] === "Coronary artery disease" ||
            quizFormData["5_3"] === "Stroke or Transient ischemic attack" ||
            quizFormData["5_4"] === "High blood pressure" ||
            quizFormData["5_5"] === "Peripheral vascular disease" ||
            quizFormData["5_6"] === "Diabetes" ||
            quizFormData["5_7"] === "Neurological disease" ||
            quizFormData["5_8"] === "Low Testosterone" ||
            quizFormData["5_9"] === "Mental Health issues" ||
            quizFormData["5_11"] === "Enlarged Prostate" ||
            quizFormData["5_12"] === "Structural damage to your penis" ||
            quizFormData["5_13"] === "Other",
        },
        {
          page: 6,
          nextPage: 8,
          condition: () => quizFormData["25"] === "No",
        },
        {
          page: 6,
          nextPage: 7,
          condition: () => quizFormData["25"] === "Yes",
        },
        {
          page: 7,
          nextPage: 8,
          condition: () =>
            quizFormData["25"] === "Yes" &&
            (quizFormData["27_7"] === "None of these apply" ||
              (quizFormData["27_6"] === "Other" && quizFormData["28"]) ||
              !(
                quizFormData["27_1"] ===
                  "Glyceral Trinitrate spray or tablets" ||
                quizFormData["27_2"] === "Isosorbide Mononitrate" ||
                quizFormData["27_3"] === "Isosorbide Dinitrate" ||
                quizFormData["27_4"] === "Nitroprusside" ||
                quizFormData["27_5"] ===
                  "Any other nitrate-containing medication in any form"
              )),
        },
        {
          page: 8,
          nextPage: 9,
          condition: () =>
            quizFormData["33_1"] === "Difficulty getting an erection" ||
            quizFormData["33_2"] === "Difficulty maintaining an erection" ||
            quizFormData["33_3"] === "Low sexual desire" ||
            quizFormData["33_5"] === "Ejaculating too early",
        },
        {
          page: 9,
          nextPage: 10,
          condition: () => quizFormData["42"],
        },
        {
          page: 10,
          nextPage: 11,
          condition: () => quizFormData["35"] && quizFormData["96_1"] === "1",
        },
        {
          page: 11,
          nextPage: 12,
          condition: () => quizFormData["37"],
        },
        {
          page: 12,
          nextPage: 13,
          condition: () => quizFormData["40"],
        },
        {
          page: 13,
          nextPage: 14,
          condition: () =>
            quizFormData["45"] === "120/80 or lower (Normal)" ||
            quizFormData["45"] === "121/81 to 140/90 (Above Normal)" ||
            (quizFormData["45"] === "141/91 to 179/99  (High)" &&
              quizFormData["102_1"] === "1"),
        },
        {
          page: 14,
          nextPage: 15,
          condition: () =>
            quizFormData["51"] === "No" ||
            (quizFormData["51"] === "Yes" && quizFormData["103_1"] === "1"),
        },
        {
          page: 15,
          nextPage: 16,
          condition: () =>
            !(
              quizFormData["49_1"] ||
              quizFormData["49_2"] ||
              quizFormData["49_3"]
            ),
        },
        {
          page: 16,
          nextPage: 17,
          condition: () =>
            quizFormData["2"] &&
            (quizFormData["2"] === "No" ||
              (quizFormData["2"] === "Yes" && quizFormData["148"])),
        },
        {
          page: 17,
          nextPage: 18,
          condition: () => quizFormData["203"],
        },
        {
          page: 18,
          nextPage: 19,
          condition: () =>
            quizFormData["179"] &&
            (quizFormData["179"] === "No" ||
              (quizFormData["179"] === "Yes" && quizFormData["181"])),
        },
        {
          page: 19,
          nextPage: 20,
          condition: () =>
            quizFormData["178"] &&
            (quizFormData["178"] === "Clinician" ||
              quizFormData["178"] === "Pharmacist" ||
              (quizFormData["178"] === "No" && quizFormData["182_1"] === "1")),
        },
        {
          page: 20,
          nextPage: 21,
          condition: () => quizFormData["204_1"] === "1",
        },
        {
          page: 21,
          nextPage: 22,
          condition: () => {
            const photoStatus = getPhotoUploadStatus();
            return quizFormData["196"] && photoStatus.uploaded;
          },
        },
      ];

      const matchedCondition = pageConditions.find(
        (condition) => condition.page === storedPage && condition.condition()
      );

      if (matchedCondition) {
        const nextPage =
          typeof matchedCondition.nextPage === "function"
            ? matchedCondition.nextPage()
            : matchedCondition.nextPage;
        setCurrentPage(nextPage);
        setProgress(Math.floor(((nextPage - 1) / 21) * 100));
      } else {
        setCurrentPage(storedPage);
        setProgress(Math.floor(((storedPage - 1) / 21) * 100));
      }

      setIsSubmitting(false);
      if (isIntentionalNavigation.current) {
        isIntentionalNavigation.current = false;
      }

      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        if (params.has("page") || params.has("step")) {
          setTimeout(() => {
            setIsSubmitting(false);
            isIntentionalNavigation.current = false;

          }, 300);
        }
      }

      setIsSubmitting(false);


      setCurrentPage(storedPage);

      const calculatedProgress = Math.floor(((storedPage - 1) / 21) * 100);
      setProgress(calculatedProgress);
    } catch (error) {
      logger.error("Error parsing stored quiz data:", error);
    }
  }, []);
  useEffect(() => {
    const updateFormElements = () => {
      const updateRadioButtons = (name, value) => {
        const radioButtons = document.querySelectorAll(`input[name="${name}"]`);
        if (radioButtons.length) {
          radioButtons.forEach((radio) => {
            radio.checked = radio.value === value;

            if (radio.checked) {
              const label = document.querySelector(`label[for="${radio.id}"]`);
              if (label) {
                label.classList.add("border-[#A7885A]");
                label.classList.remove("border-gray-300");
              }
            }
          });
        }
      };

      switch (currentPage) {
        case 1:
          updateRadioButtons("1", formData["1"]);
          break;
        case 2:
          updateRadioButtons("30", formData["30"]);
          break;
        case 3:
          updateRadioButtons("138", formData["138"]);
          break;
        case 6:
          updateRadioButtons("25", formData["25"]);
          break;
        case 9:
          updateRadioButtons("42", formData["42"]);
          break;
        case 10:
          updateRadioButtons("35", formData["35"]);
          break;
        case 11:
          updateRadioButtons("37", formData["37"]);
          break;
        case 12:
          updateRadioButtons("40", formData["40"]);
          break;
        case 13:
          updateRadioButtons("45", formData["45"]);
          break;
        case 14:
          updateRadioButtons("51", formData["51"]);
          break;
        case 16:
          updateRadioButtons("2", formData["2"]);
          break;
        case 17:
          updateRadioButtons("203", formData["203"]);
          break;
        case 18:
          updateRadioButtons("179", formData["179"]);
          break;
        case 19:
          updateRadioButtons("178", formData["178"]);
          break;
        default:
          break;
      }
    };

    updateFormElements();
  }, [currentPage, formData]);

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

    const isMultiSelectPage = [4, 5, 7, 8, 15].includes(currentPage);
    const mightNeedTextInput = [2, 5, 7, 16, 18, 19].includes(currentPage);
    const isSpecialCasePage = [20, 21].includes(currentPage);
    const isSingleSelectionPage = [
      1, 2, 3, 6, 9, 10, 11, 12, 13, 14, 17, 19,
    ].includes(currentPage);

    if (isMultiSelectPage || mightNeedTextInput || isSpecialCasePage) {
      continueButton.style.display = "block";
      let shouldEnableButton = false;
      switch (currentPage) {
        case 2: // Allergies
          shouldEnableButton =
            formData["30"] === "No" ||
            (formData["30"] === "Yes" &&
              typeof formData["31"] === "string" &&
              formData["31"].trim().length > 0);
          break;
        case 4: // Drug
          shouldEnableButton =
            formData["23_1"] === "Cocaine" ||
            formData["23_2"] === "Marijuana" ||
            formData["23_3"] === "Magic Mushrooms" ||
            formData["23_4"] === "Tobacco/vaping nicotine" ||
            formData["23_5"] === "None of these apply" ||
            formData["23_6"] === "Poppers";
          break;
        case 5: // Medical conditions
          shouldEnableButton =
            formData["5_1"] === "No Medical Issues" ||
            formData["5_2"] === "Coronary artery disease" ||
            formData["5_3"] === "Stroke or Transient ischemic attack" ||
            formData["5_4"] === "High blood pressure" ||
            formData["5_5"] === "Peripheral vascular disease" ||
            formData["5_6"] === "Diabetes" ||
            formData["5_7"] === "Neurological disease" ||
            formData["5_8"] === "Low Testosterone" ||
            formData["5_9"] === "Mental Health issues" ||
            formData["5_11"] === "Enlarged Prostate" ||
            formData["5_12"] === "Structural damage to your penis" ||
            (formData["5_13"] === "Other" &&
              typeof formData["56"] === "string" &&
              formData["56"].trim().length > 0);
          break;
        case 7: // Specific medications
          shouldEnableButton =
            formData["27_1"] === "Glyceral Trinitrate spray or tablets" ||
            formData["27_2"] === "Isosorbide Mononitrate" ||
            formData["27_3"] === "Isosorbide Dinitrate" ||
            formData["27_4"] === "Nitroprusside" ||
            formData["27_5"] ===
              "Any other nitrate-containing medication in any form" ||
            formData["27_7"] === "None of these apply" ||
            (formData["27_6"] === "Other" &&
              typeof formData["28"] === "string" &&
              formData["28"].trim().length > 0);
          break;
        case 8: // Sexual issues
          shouldEnableButton =
            formData["33_1"] === "Difficulty getting an erection" ||
            formData["33_2"] === "Difficulty maintaining an erection" ||
            formData["33_3"] === "Low sexual desire" ||
            formData["33_5"] === "Ejaculating too early";
          break;
        case 15: // Cardiovascular symptoms
          const hasDangerousSymptoms =
            formData["49_1"] || formData["49_2"] || formData["49_3"];
          const missingHeartDetails = formData["49_5"] && !formData["81"];
          shouldEnableButton =
            !hasDangerousSymptoms &&
            !missingHeartDetails &&
            (formData["49_4"] || formData["49_5"] || formData["49_6"]);
          break;
        case 16: // ED medication experience
          shouldEnableButton =
            formData["2"] === "No" ||
            (formData["2"] === "Yes" &&
              typeof formData["148"] === "string" &&
              formData["148"].trim().length > 0);
          break;
        case 18: // Healthcare questions
          shouldEnableButton =
            formData["179"] === "No" ||
            (formData["179"] === "Yes" &&
              typeof formData["181"] === "string" &&
              formData["181"].trim().length > 0);
          break;
        case 19: // Healthcare team questions
          shouldEnableButton =
            formData["178"] === "No" ||
            formData["178"] === "Pharmacist" ||
            formData["178"] === "Doctor" ||
            (formData["178"] === "Clinician" &&
              typeof formData["182"] === "string" &&
              formData["182"].trim().length > 0);
          break;
        case 20: // Photo ID acknowledgement
          shouldEnableButton = !!photoIdAcknowledged;
          break;
        case 21: // Photo ID upload
          shouldEnableButton = !!photoIdFile && !isUploading;
          break;
        default:
          shouldEnableButton = true;
      }
      continueButton.classList.remove("hidden");
      continueButton.style.display = "block";
      continueButton.disabled = !shouldEnableButton;
      continueButton.style.opacity = shouldEnableButton ? "1" : "0.5";
      return;
    }
    if (isSingleSelectionPage) {
      if (currentPage === 1) {
        continueButton.classList.remove("hidden");
        continueButton.style.display = "block";
        continueButton.disabled = formData["1"] !== "Male";
        continueButton.style.opacity = formData["1"] === "Male" ? "1" : "0.5";
        return;
      }
      let hasSelection = false;
      switch (currentPage) {
        case 2:
          hasSelection = !!formData["30"];
          break;
        case 3:
          hasSelection = !!formData["138"];
          break;
        case 6:
          hasSelection = !!formData["25"];
          break;
        case 9:
          hasSelection = !!formData["42"];
          break;
        case 10:
          hasSelection = !!formData["35"];
          break;
        case 11:
          hasSelection = !!formData["37"];
          break;
        case 12:
          hasSelection = !!formData["40"];
          break;
        case 13:
          hasSelection = !!formData["45"];
          break;
        case 14:
          hasSelection = !!formData["51"];
          break;
        case 17:
          hasSelection = !!formData["203"];
          break;
        case 19:
          hasSelection = !!formData["178"];
          break;
        default:
          hasSelection = false;
      }
      continueButton.classList.remove("hidden");
      continueButton.style.display = "block";
      continueButton.disabled = !hasSelection;
      continueButton.style.opacity = hasSelection ? "1" : "0.5";
      return;
    }

    continueButton.classList.remove("hidden");
    continueButton.style.display = "block";
    continueButton.disabled = false;
    continueButton.style.opacity = "1";

    if (currentPage === 22) {
      const handlePopState = () => {
        window.location.href = "/";
      };
      window.addEventListener("popstate", handlePopState);
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  }, [currentPage, formData, photoIdAcknowledged, photoIdFile, isUploading]);

  const queueFormSubmission = (data, forceSubmit = false) => {
    if (formData.completion_state === "Full" && !forceSubmit) {
      logger.log("Skipping queue submission - questionnaire already completed");
      return;
    }

    if (data.completion_state === "Full" && currentPage === 21) {
      const photoStatus = getPhotoUploadStatus();
      const hasPhotoInData = formData["196"] || data["196"];

      if (!photoStatus.uploaded && !hasPhotoInData) {
        logger.log(
          "Preventing Full completion - photo required but not uploaded"
        );
        data.completion_state = "Partial";
        data.completion_percentage = 95;
      }
    }

    const shouldSubmit =
      forceSubmit ||
      Object.keys(data).filter((key) => data[key] !== "").length > 0;

    if (shouldSubmit) {
      const currentFormData = JSON.parse(JSON.stringify(formData));
      const mergedData = { ...currentFormData, ...data };

      if (currentFormData.id && currentFormData.token) {
        mergedData.id = currentFormData.id;
        mergedData.token = currentFormData.token;
      }

      const dataCopy = Object.fromEntries(
        Object.entries(mergedData).filter(
          ([_, v]) => v !== "" && v !== undefined && v !== null
        )
      );

      setPendingSubmissions((prev) => {
        const hasPendingWithSameId = prev.some(
          (submission) =>
            submission.data.id &&
            dataCopy.id &&
            submission.data.id === dataCopy.id
        );

        if (hasPendingWithSameId) {
          return prev.map((submission) =>
            submission.data.id &&
            dataCopy.id &&
            submission.data.id === dataCopy.id
              ? { data: dataCopy, timestamp: Date.now() }
              : submission
          );
        }

        const isDuplicate = prev.some(
          (submission) =>
            JSON.stringify(submission.data) === JSON.stringify(dataCopy)
        );

        return isDuplicate
          ? prev
          : [...prev, { data: dataCopy, timestamp: Date.now() }];
      });
    }
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

  const handleBackClick = () => {
    moveToPreviousSlide();
  };
  const handleContinueClick = async () => {
    if (currentPage === 22) {
      window.location.href = "/";
      return;
    }
    if (currentPage === 1 && formData["1"] === "Female") {
      setShowPopup(true);
      return;
    }

    if (currentPage === 6) {
      if (!formData["25"]) {
        const errorBox = formRef.current?.querySelector(".error-box");
        if (errorBox) {
          errorBox.classList.remove("hidden");
          errorBox.textContent = "Please make a selection";
        }
        return;
      }

      const updates = {
        25: formData["25"],
        "27_1": "",
        "27_2": "",
        "27_3": "",
        "27_4": "",
        "27_5": "",
        "27_6": "",
        "27_7": "",
        28: "",
        page_step: formData["25"] === "No" ? 8 : 7,
      };

      const updatedFormData = { ...formData, ...updates };
      setFormData(updatedFormData);
      updateLocalStorage(updatedFormData);
      queueFormSubmission(updatedFormData);

      if (formData["25"] === "No") {
        setCurrentPage(8);
        setProgress(Math.floor((7 / 21) * 100));
        return;
      }
    }

    setValidationAttempted(true);
    if (currentPage !== 1) {
      if (currentPage !== 1) {
        setIsSubmitting(true);
      }
    }

    if (currentPage === 8 && formData["33_5"] === "Ejaculating too early") {
      setShowSexualIssuesPopup(true);
      setIsSubmitting(false);
      return;
    }

    if (currentPage === 8 && formData["33_3"] === "Low sexual desire") {
      setShowLowLibidoWarning(true);
      setIsSubmitting(false);
      return;
    }

    if (currentPage === 13) {
      if (
        formData["45"] === ">180/100 (Higher)" ||
        formData["45"] === "I don’t know my blood pressure"
      ) {
        setShowVeryHighBpWarning(true);
        setIsSubmitting(false);
        return;
      }

      if (formData["45"] === "141/91 to 179/99  (High)" && !formData["102_1"]) {
        setShowHighBpWarning(true);
        setIsSubmitting(false);
        return;
      }
    }

    if (currentPage === 15) {
      const hasSelection =
        formData["49_1"] ||
        formData["49_2"] ||
        formData["49_3"] ||
        formData["49_4"] ||
        formData["49_5"] ||
        formData["49_6"];

      if (!hasSelection) {
        const errorBox = formRef.current?.querySelector(".error-box");
        if (errorBox) {
          errorBox.classList.remove("hidden");
          errorBox.textContent = "Please select at least one option";
        }
        setIsSubmitting(false);
        return;
      }

      if (formData["49_5"] && !formData["81"]) {
        const errorBox = formRef.current?.querySelector(".error-box");
        if (errorBox) {
          errorBox.classList.remove("hidden");
          errorBox.textContent =
            "Please provide details about your heart condition";
        }
        return;
      }

      queueFormSubmission(formData);

      const hasDangerousSymptoms =
        formData["49_1"] || formData["49_2"] || formData["49_3"];

      if (hasDangerousSymptoms) {
        setShowCardioSymptomWarning(true);
        return;
      }

      clearError();
      moveToNextSlide(null, true);
      return;
    }

    if (currentPage === 7) {
      const hasDangerousMedication =
        formData["27_1"] === "Glyceral Trinitrate spray or tablets" ||
        formData["27_2"] === "Isosorbide Mononitrate" ||
        formData["27_3"] === "Isosorbide Dinitrate" ||
        formData["27_4"] === "Nitroprusside" ||
        formData["27_5"] ===
          "Any other nitrate-containing medication in any form";

      if (hasDangerousMedication) {
        queueFormSubmission(formData);

        const dangerousMeds = [
          { field: "27_1", value: "Glyceral Trinitrate spray or tablets" },
          { field: "27_2", value: "Isosorbide Mononitrate" },
          { field: "27_3", value: "Isosorbide Dinitrate" },
          { field: "27_4", value: "Nitroprusside" },
          {
            field: "27_5",
            value: "Any other nitrate-containing medication in any form",
          },
        ];

        for (const med of dangerousMeds) {
          if (formData[med.field] === med.value) {
            setCurrentMedicationWarning(med.value);
            break;
          }
        }

        setShowMedicationWarning(true);
        return;
      }

      const hasSelection =
        formData["27_1"] ||
        formData["27_2"] ||
        formData["27_3"] ||
        formData["27_4"] ||
        formData["27_5"] ||
        formData["27_6"] ||
        formData["27_7"];

      if (!hasSelection) {
        const errorBox = formRef.current?.querySelector(".error-box");
        if (errorBox) {
          errorBox.classList.remove("hidden");
          errorBox.textContent = "Please make a selection";
        }
        return;
      }

      if (currentPage === 6) {
        if (formData["25"] === "No") {
          const updates = {
            25: "No",
            "27_1": "",
            "27_2": "",
            "27_3": "",
            "27_4": "",
            "27_5": "",
            "27_6": "",
            "27_7": "",
            28: "",
            page_step: 8,
          };

          const updatedFormData = { ...formData, ...updates };
          setFormData(updatedFormData);
          updateLocalStorage(updatedFormData);
          queueFormSubmission(updatedFormData);

          setTimeout(() => {
            setCurrentPage(8);
            setProgress(Math.floor(((8 - 1) / 21) * 100));
            setIsSubmitting(false);
          }, 10);

          return;
        }
      }

      if (formData["27_6"] === "Other" && !formData["28"]) {
        const errorBox = formRef.current?.querySelector(".error-box");
        if (errorBox) {
          errorBox.classList.remove("hidden");
          errorBox.textContent = "Please enter your medication details";
        }
        return;
      }

      clearError();
      queueFormSubmission(formData);
      moveToNextSlide(null, true);
      return;
    }

    if (currentPage === 20) {
      handlePhotoIdAcknowledgeContinue();
      return;
    } else if (currentPage === 21) {
      const photoStatus = getPhotoUploadStatus();
      if (!photoIdFile && !formData["196"] && !photoStatus.uploaded) {
        const errorBox = formRef.current?.querySelector(".error-box");
        if (errorBox) {
          errorBox.classList.remove("hidden");
          errorBox.textContent = "Please upload a photo ID to continue";
        }
        setIsSubmitting(false);
        return;
      }

      if (photoIdFile) {
        verifyCustomerAndProceed();
        return;
      }
    }

    if (isValidated()) {
      setValidationAttempted(false);
      const currentPageData = collectCurrentPageData();
      const updatedFormData = {
        ...formData,
        ...currentPageData,
        page_step: currentPage + 1,
      };
      setFormData(updatedFormData);
      updateLocalStorage(updatedFormData);
      queueFormSubmission(updatedFormData);
      moveToNextSlide(null, true);
    }
  };

  const submitFormData = async (specificData = null) => {
    try {
      const firstQuestionAnswer = formData["1"];

      const specificId = specificData?.id || "";
      const specificToken = specificData?.token || "";

      const essentialData = {
        form_id: formData.form_id || 2,
        action: "ed_questionnaire_data_upload",
        entrykey: formData.entrykey || "",
        id: specificId || formData.id || "",
        token: specificToken || formData.token || "",
        stage: formData.stage || "consultation-after-checkout",
        page_step: currentPage,
        completion_state: formData.completion_state || "Partial",
        completion_percentage: progress,
        source_site: formData.source_site || process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com",
      };

      const userInfo = {
        "130_3": formData["130_3"] || "Omkar",
        "130_6": formData["130_6"] || "Test",
        131: formData["131"] || "omkar@w3mg.in",
        132: formData["132"] || "(000) 000-0000",
        158: formData["158"] || "2000-01-01",
        "161_4": formData["161_4"] || "Ontario",
        "selected-dosage": formData["selected-dosage"] || "",
      };

      const allFormData = { ...formData };

      const currentPageData = specificData || collectCurrentPageData();

      const payload = {
        ...essentialData,
        ...userInfo,
        ...allFormData,
        ...currentPageData,
      };

      logger.log("API submission payload:", payload);

      const response = await fetch("/api/ed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await response.json();

      if (data.error) {
        logger.error("Form submission error:", data.msg || data.error_message);
        if (data.msg?.includes("authentication") || data.msg?.includes("unauthorized") || response.status === 401) {
          alert("Your session has expired. Please log in again.");
          window.location.href = "/login-register";
          return null;
        }

        if (data.data_not_found) {
          alert(
            "An error has been encountered while processing your data. If your session has expired, you will be asked to login again."
          );
          const redirectStage = data.redirect_to_stage || "consultation-after-checkout";
          window.location.href = `/ed-consultation-quiz/?stage=${redirectStage}`;
          return null;
        }

        return null;
      }

      if (firstQuestionAnswer) {
        setFormData((prev) => ({
          ...prev,
          id: data.id || prev.id,
          token: data.token || prev.token,
          entrykey: data.entrykey || prev.entrykey,
          1: firstQuestionAnswer,
        }));

        const updatedStorage = {
          ...formData,
          id: data.id || formData.id,
          token: data.token || formData.token,
          entrykey: data.entrykey || formData.entrykey,
          1: firstQuestionAnswer,
        };
        updateLocalStorage(updatedStorage);
      } else {
        setFormData((prev) => ({
          ...prev,
          id: data.id || prev.id,
          token: data.token || prev.token,
          entrykey: data.entrykey || prev.entrykey,
        }));

        updateLocalStorage();
      }

      if (formData.completion_state === "Full") {
        setCurrentPage(22);
        setProgress(100);
      }

      return data;
    } catch (error) {
      logger.error("Error submitting form:", error);
      return null;
    }
  };

  const handleSingleChoiceSelection = (
    fieldName,
    value,
    additionalUpdates = {}
  ) => {
    clearError();

    let updates = {
      [fieldName]: value,
      ...additionalUpdates,
    };

    if (fieldName === "25" && value === "No") {
      updates = {
        ...updates,
        "27_1": "",
        "27_2": "",
        "27_3": "",
        "27_4": "",
        "27_5": "",
        "27_6": "",
        "27_7": "",
        28: "",
      };
    }

    const completeFormData = {
      ...formData,
      ...updates,
    };

    localStorage.setItem("quiz-form-data", JSON.stringify(completeFormData));
    localStorage.setItem(
      "quiz-form-data-expiry",
      (new Date().getTime() + 1000 * 60 * 60).toString()
    );

    setFormData(completeFormData);

    queueFormSubmission(completeFormData);

    moveToNextSlide(null, true);
  };

  const updateFormDataAndStorage = (updates) => {
    const newFormData = { ...formData, ...updates };

    const now = new Date();
    const ttl = now.getTime() + 1000 * 60 * 60;
    localStorage.setItem("quiz-form-data", JSON.stringify(newFormData));
    localStorage.setItem("quiz-form-data-expiry", ttl.toString());

    setFormData(newFormData);

    return newFormData;
  };

  useEffect(() => {
    initializeUserDetails();
  }, []);

  const setEntryKey = (key) => {
    localStorage.setItem("entrykey", key);
    const expiry = Date.now() + 30 * 60 * 1000;
    localStorage.setItem("entrykey_expiry", expiry);
  };

  const initializeUserDetails = () => {
    if (!localStorage.getItem("userDetails")) {
      const defaultUserDetails = {
        firstName: "Omkar",
        lastName: "Test",
        email: "omkar@w3mg.in",
      };
      localStorage.setItem("userDetails", JSON.stringify(defaultUserDetails));
    }
  };
  const verifyCustomerAndProceed = async () => {
    if (!photoIdFile && !formData["196"]) {
      setIsSubmitting(false);
      alert("Please upload a photo ID");
      return;
    }

    try {
      setIsUploading(true);
      showLoader();
      await handlePhotoIdUpload();

      setFormData((prev) => ({
        ...prev,
        opted_to_update_legal_name: false,
        customer_is_ordering_for_some_one_else: false,
      }));

      if (typeof window !== "undefined") {
        localStorage.removeItem("quiz-form-data");
        localStorage.removeItem("quiz-form-data-expiry");
        logger.log("Quiz form data cleared from localStorage");
      }

      setIsUploading(false);
      setCurrentPage(22);
      setProgress(100);
      setIsSubmitting(false);
      setShowThankYou(true);

      setTimeout(() => {
        hideLoader();
      }, 100);
    } catch (error) {
      logger.error("Customer verification error:", error);
      hideLoader();
      setIsUploading(false);
      alert("An error occurred during verification. Please try again.");
      setIsSubmitting(false);
    }
  };

  const handleUpdateCustomerName = (proceed = true) => {
    setShowThankYou(true);
    if (!proceed) {
      setShowCustomerVerificationPopup(false);

      return;
    }

    try {
      const updatedData = {
        ...formData,
        opted_to_update_legal_name: true,
        customer_is_ordering_for_some_one_else: false,
        completion_state: "Full",
      };

      setFormData(updatedData);
      updateLocalStorage(updatedData);
      submitFormData(updatedData);

      setShowCustomerVerificationPopup(false);
      setCurrentPage(22);
      setProgress(100);
      if (typeof window !== "undefined") {
        localStorage.removeItem("quiz-form-data");
        localStorage.removeItem("quiz-form-data-expiry");
        logger.log("Quiz form data cleared from localStorage");
      }
    } catch (error) {
      logger.error("Name update error:", error);
      alert("An error occurred while updating your name.");
    }
  };
  const handleOrderForSomeoneElse = () => {
    try {
      const updatedData = {
        ...formData,
        opted_to_update_legal_name: false,
        customer_is_ordering_for_some_one_else: true,
        completion_state: "Full",
      };

      setFormData(updatedData);
      updateLocalStorage(updatedData);
      submitFormData(updatedData);

      setShowCustomerVerificationPopup(false);
      setCurrentPage(22);
      setProgress(100);

      setShowThankYou(true);
      if (typeof window !== "undefined") {
        localStorage.removeItem("quiz-form-data");
        localStorage.removeItem("quiz-form-data-expiry");
        logger.log("Quiz form data cleared from localStorage");
      }
    } catch (error) {
      logger.error("Ordering for someone else error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  const fullScreenPopupStyle = {
    height: "100%",
    overflow: "auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  };
  const readLocalStorage = () => {
    if (typeof window !== "undefined") {
      if (localStorage.getItem("on-thank-you-page") === "true") {
        return null;
      }

      const now = new Date();
      const ttl = localStorage.getItem("quiz-form-data-expiry");

      if (ttl && now.getTime() < parseInt(ttl)) {
        return localStorage.getItem("quiz-form-data");
      } else {
        localStorage.removeItem("quiz-form-data");
        localStorage.removeItem("quiz-form-data-expiry");
      }
    }
    return null;
  };

  const updateLocalStorage = (dataToStore = formData) => {
    if (typeof window !== "undefined") {
      const now = new Date();
      const ttl = now.getTime() + 1000 * 60 * 60;

      try {
        const dataToStoreClone = JSON.parse(JSON.stringify(dataToStore));

        localStorage.setItem(
          "quiz-form-data",
          JSON.stringify(dataToStoreClone)
        );
        localStorage.setItem("quiz-form-data-expiry", ttl.toString());
        return true;
      } catch (error) {
        logger.error("Error storing data in local storage:", error);
        return false;
      }
    }
    return false;
  };

  const updateProgressData = async () => {
    const newProgress = Math.floor(((currentPage - 1) / 21) * 100);
    const progressValue = newProgress;

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
      2: { 30: formData["30"], 31: formData["31"] },
      3: { 138: formData["138"] },
      4: {
        "23_1": formData["23_1"],
        "23_2": formData["23_2"],
        "23_3": formData["23_3"],
        "23_4": formData["23_4"],
        "23_5": formData["23_5"],
        "23_6": formData["23_6"],
      },
      5: {
        "5_1": formData["5_1"],
        "5_2": formData["5_2"],
        "5_3": formData["5_3"],
        "5_4": formData["5_4"],
        "5_5": formData["5_5"],
        "5_6": formData["5_6"],
        "5_7": formData["5_7"],
        "5_8": formData["5_8"],
        "5_9": formData["5_9"],
        "5_11": formData["5_11"],
        "5_12": formData["5_12"],
        "5_13": formData["5_13"],
        56: formData["56"],
      },
      6: { 25: formData["25"] },
      7: {
        "27_1": formData["27_1"],
        "27_2": formData["27_2"],
        "27_3": formData["27_3"],
        "27_4": formData["27_4"],
        "27_5": formData["27_5"],
        "27_6": formData["27_6"],
        "27_7": formData["27_7"],
        28: formData["28"],
        "92_1": formData["92_1"],
        "92_2": formData["92_2"],
        "92_3": formData["92_3"],
      },
      8: {
        "33_1": formData["33_1"],
        "33_2": formData["33_2"],
        "33_3": formData["33_3"],
        "33_5": formData["33_5"],
        "97_1": formData["97_1"],
        "97_2": formData["97_2"],
        "97_3": formData["97_3"],
      },
      9: { 42: formData["42"] },
      10: {
        35: formData["35"],
        "96_1": formData["96_1"],
        "96_2": formData["96_2"],
        "96_3": formData["96_3"],
      },
      11: { 37: formData["37"] },
      12: { 40: formData["40"] },
      13: {
        45: formData["45"],
        "102_1": formData["102_1"],
        "102_2": formData["102_2"],
        "102_3": formData["102_3"],
      },
      14: {
        51: formData["51"],
        "103_1": formData["103_1"],
        "103_2": formData["103_2"],
        "103_3": formData["103_3"],
      },
      15: {
        "49_1": formData["49_1"],
        "49_2": formData["49_2"],
        "49_3": formData["49_3"],
        "49_4": formData["49_4"],
        "49_5": formData["49_5"],
        "49_6": formData["49_6"],
        81: formData["81"],
      },
      16: {
        2: formData["2"],
        148: formData["148"],
      },
      17: { 203: formData["203"] },
      18: {
        179: formData["179"],
        181: formData["181"],
      },
      19: {
        178: formData["178"],
        182: formData["182"],
        "182_1": formData["182_1"],
        "182_2": formData["182_2"],
        "182_3": formData["182_3"],
      },
      20: {
        "204_1": formData["204_1"],
        "204_2": formData["204_2"],
        "204_3": formData["204_3"],
      },
      21: {
        196: formData["196"],
        opted_to_update_legal_name: formData["opted_to_update_legal_name"],
        customer_is_ordering_for_some_one_else:
          formData["customer_is_ordering_for_some_one_else"],
      },
      22: { completion_state: "Full" },
    };

    const pageData = pageDataMap[currentPage] || {};

    const result = Object.fromEntries(
      Object.entries(pageData).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ""
      )
    );

    logger.log("Collected page data:", result);

    return result;
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

  const handlePhotoIdUpload = async () => {
    if (!photoIdFile) {
      throw new Error("No photo file selected");
    }

    try {
      const s3Url = await uploadFileToS3WithProgress(
        photoIdFile,
        "questionnaire/ed-photo-ids",
        "ed",
        (progress) => {
          setUploadProgress(progress);
        }
      );

      const submissionData = {
        ...formData,
        196: s3Url,
        completion_state: "Full",
        completion_percentage: 100,
        stage: "photo-id-upload",
      };

      const { photo_id_upload, ...cleanSubmissionData } = submissionData;

      const response = await fetch("/api/ed", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanSubmissionData),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.msg || "Failed to submit questionnaire data");
      }

      const updatedData = {
        ...formData,
        196: s3Url,
        completion_state: "Full",
        completion_percentage: 100,
        stage: "photo-id-upload",
        id: data.id || formData.id,
        token: data.token || formData.token,
      };

      setFormData(updatedData);
      setProgress(100);
      updateLocalStorage(updatedData);
      setPhotoUploadStatus(true, s3Url);

      return true;
    } catch (error) {
      logger.error("Error uploading photo:", error);
      throw error;
    }
  };

  const handleTapToUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePhotoIdAcknowledgement = (e) => {
    clearError();

    const isChecked = e.target.checked;
    setPhotoIdAcknowledged(isChecked);

    const updates = {
      "204_1": isChecked ? "1" : "",
      "204_2": isChecked
        ? "I hereby understand and acknowledge the above message"
        : "",
      "204_3": isChecked ? "33" : "",
    };

    const updatedData = {
      ...formData,
      ...updates,
    };

    setFormData(updatedData);
    updateLocalStorage(updatedData);
    queueFormSubmission(updatedData);
    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.disabled = !isChecked;
      continueButton.style.opacity = isChecked ? "1" : "0.5";
    }
  };

  const shouldShowContinueButton = (page) => {
    const multiSelectPages = [4, 5, 7, 8, 15];

    const textInputPages = [2, 5, 7, 16, 18];

    const specialCases = [20, 21];

    return (
      multiSelectPages.includes(page) ||
      textInputPages.includes(page) ||
      specialCases.includes(page)
    );
  };

  const handlePhotoIdAcknowledgeContinue = () => {
    if (!photoIdAcknowledged) return;

    const updatedData = {
      ...formData,
      "204_1": "1",
      "204_2": "I hereby understand and acknowledge the above message",
      "204_3": "33",
    };

    setFormData(updatedData);
    updateLocalStorage(updatedData);

    queueFormSubmission(updatedData);

    if (isValidated()) {
      moveToNextSlide(null, true);
    }
  };

  const handleBookCallSelect = (option) => {
    clearError();

    if (option === "Clinician") {
      option = "Doctor";
    }

    let updates = {
      178: option,
    };
    if (option === "Pharmacist" || option === "Doctor") {
      updates["182_1"] = "";
      updates["182_2"] = "";
      updates["182_3"] = "";
    }

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateFormDataAndStorage(updates);
    queueFormSubmission({ ...formData, ...updates });

    if (option === "Doctor" || option === "Pharmacist") {
      setTimeout(() => {
        moveToNextSlide(null, true);
      }, 10);
    } else if (option === "No") {
      setShowNoCallAcknowledgement(true);
      setNoCallAcknowledged(false);
    }
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

    const updatedData = {
      ...formData,
      ...updates,
    };

    setFormData(updatedData);
    updateLocalStorage(updatedFormData);

    queueFormSubmission(updates);
  };

  const handleRequestCallInstead = () => {
    setShowNoCallAcknowledgement(false);

    const updates = {
      178: "Doctor",
      "182_1": "",
      "182_2": "",
      "182_3": "",
    };

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateLocalStorage({
      ...formData,
      ...updates,
    });

    queueFormSubmission(updates);
    setNoCallAcknowledged(false);

    setTimeout(() => {
      moveToNextSlide(null, true);
    }, 10);
  };

  const handleNoCallContinue = (proceed = true) => {
    if (!proceed) {
      setShowNoCallAcknowledgement(false);
      setNoCallAcknowledged(false);

      const updates = {
        178: "",
        "182_1": "",
        "182_2": "",
        "182_3": "",
      };

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      updateLocalStorage({
        ...formData,
        ...updates,
      });

      queueFormSubmission(updates);
      return;
    }

    if (!noCallAcknowledged) return;
    setShowNoCallAcknowledgement(false);

    const updates = {
      "182_1": "1",
      "182_2": "I hereby understand and consent to the above waiver",
      "182_3": "33",
    };

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateLocalStorage({
      ...formData,
      ...updates,
    });

    queueFormSubmission(updates);

    if (isValidated()) {
      setValidationAttempted(false);
      if (currentPage !== 1) {
        setIsSubmitting(true);
      }
      isIntentionalNavigation.current = true;
      moveToNextSlide(null, true);
    }
  };

  const handleHealthcareQuestionsSelect = (option) => {
    clearError();

    const updates = {
      179: option,
      181: option === "No" ? "" : formData["181"],
    };

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
    updateFormDataAndStorage(updates);
    queueFormSubmission({ ...formData, ...updates });

    if (option === "No") {
      setTimeout(() => {
        moveToNextSlide(null, true);
      }, 10);
    } else {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.display = "block";
      }
    }
  };

  const handleHealthcareQuestionsPage19Select = (option) => {
    clearError();

    const updates = {
      178: option,
      182: option === "No" ? "" : formData["182"],
    };

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));
    updateFormDataAndStorage(updates);
    queueFormSubmission({ ...formData, ...updates });

    if (option === "No") {
      setTimeout(() => {
        moveToNextSlide(null, true);
      }, 10);
    } else {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.display = "block";
      }
    }
  };

  const handleSpecifiedQuestionsChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      181: value,
    }));

    updateFormDataAndStorage({
      181: value,
    });

    debouncedQueueSubmission({ ...formData, 181: value });

    if (value.trim() !== "") {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handlePage19QuestionsChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      182: value,
    }));

    updateFormDataAndStorage({
      182: value,
    });

    debouncedQueueSubmission({ ...formData, 182: value });

    if (value.trim() !== "") {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleMedicationAcknowledgmentSelect = (option) => {
    handleSingleChoiceSelection("203", option);
  };

  const handleMedicationSelect = (option) => {
    clearError();

    if (option === "No") {
      const updates = {
        25: "No",
        "27_1": "",
        "27_2": "",
        "27_3": "",
        "27_4": "",
        "27_5": "",
        "27_6": "",
        "27_7": "",
        28: "",
        page_step: 8,
      };

      const updatedFormData = { ...formData, ...updates };
      setFormData(updatedFormData);
      updateLocalStorage(updatedFormData);
      queueFormSubmission(updatedFormData);

      setTimeout(() => {
        setCurrentPage(8);
        setProgress(Math.floor(((8 - 1) / 21) * 100));
      }, 10);
    } else {
      handleSingleChoiceSelection("25", option);
    }
  };

  const handleEdMedsExperienceSelect = (option) => {
    clearError();

    let updates = {};

    if (option === "No") {
      updates = {
        2: option,
        148: "",
      };

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      updateFormDataAndStorage(updates);
      queueFormSubmission({ ...formData, ...updates });

      setTimeout(() => {
        moveToNextSlide(null, true);
      }, 10);
    } else {
      updates = {
        2: option,
      };

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      updateFormDataAndStorage(updates);
      queueFormSubmission({ ...formData, ...updates });

      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.display = "block";
      }
    }
  };

  const handleEdMedicationDetailsChange = (e) => {
    if (formData["2"] !== "Yes") {
      return;
    }

    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      148: value,
    }));

    updateFormDataAndStorage({
      148: value,
    });

    debouncedQueueSubmission({ ...formData, 148: value });

    if (value.trim() !== "") {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleCardioSymptomSelect = (fieldName, value) => {
    clearError();

    const updatedSelections = { ...selectedCardioSymptoms };

    updatedSelections[fieldName] =
      updatedSelections[fieldName] === value ? "" : value;

    if (fieldName === "49_6" && updatedSelections[fieldName]) {
      Object.keys(updatedSelections).forEach((key) => {
        if (key !== "49_6") {
          updatedSelections[key] = "";
        }
      });
    }

    if (fieldName !== "49_6" && updatedSelections[fieldName]) {
      updatedSelections["49_6"] = "";
    }

    setSelectedCardioSymptoms(updatedSelections);

    let updates = {};
    Object.keys(updatedSelections).forEach((key) => {
      updates[key] = updatedSelections[key];
    });

    if (fieldName === "49_6" && updatedSelections[fieldName]) {
      updates["81"] = "";
    }

    updateFormDataAndStorage(updates);
  };

  const handleHeartConditionChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      81: value,
    }));

    updateFormDataAndStorage({
      81: value,
    });

    debouncedQueueSubmission({ ...formData, 81: value });

    if (value.trim() !== "") {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleCardioWarningClose = (proceed = true) => {
    setShowCardioSymptomWarning(false);
    setIsSubmitting(false);

    if (!proceed) {
      const resetSelections = {
        "49_1": "",
        "49_2": "",
        "49_3": "",
        "49_4": "",
        "49_5": "",
        "49_6": "",
        81: "",
      };

      setFormData((prev) => ({
        ...prev,
        ...resetSelections,
      }));

      updateLocalStorage({
        ...formData,
        ...resetSelections,
      });

      setSelectedCardioSymptoms({
        "49_1": "",
        "49_2": "",
        "49_3": "",
        "49_4": "",
        "49_5": "",
        "49_6": "",
      });
    }
  };

  const handleBpMedicationSelect = (option) => {
    clearError();

    let updates = {
      51: option,
    };

    if (option === "No") {
      updates["103_1"] = "";
      updates["103_2"] = "";
      updates["103_3"] = "";
    }

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateFormDataAndStorage(updates);
    queueFormSubmission({ ...formData, ...updates });

    if (option === "Yes") {
      setShowBpMedicationWarning(true);
      setBpMedicationWarningAcknowledged(false);
    } else {
      setTimeout(() => {
        moveToNextSlide(null, true);
      }, 10);
    }
  };

  const handleBpMedicationWarningAcknowledgement = (e) => {
    const isChecked = e.target.checked;
    setBpMedicationWarningAcknowledged(isChecked);

    const updates = {
      "103_1": isChecked ? "1" : "",
      "103_2": isChecked
        ? "I hereby understand and acknowledge the above warning"
        : "",
      "103_3": isChecked ? "33" : "",
    };

    const updatedData = {
      ...formData,
      ...updates,
    };

    setFormData(updatedData);
    updateLocalStorage(updatedData);
    queueFormSubmission(updates);
  };

  const handleBpMedicationWarningContinue = (proceed = true) => {
    if (!proceed) {
      setShowBpMedicationWarning(false);
      setBpMedicationWarningAcknowledged(false);

      const updates = {
        51: "",
        "103_1": "",
        "103_2": "",
        "103_3": "",
      };

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      updateLocalStorage({
        ...formData,
        ...updates,
      });

      queueFormSubmission(updates);

      return;
    }

    if (!bpMedicationWarningAcknowledged) return;
    setShowBpMedicationWarning(false);

    const updates = {
      "103_1": "1",
      "103_2": "I hereby understand and acknowledge the above warning",
      "103_3": "33",
    };

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateLocalStorage({
      ...formData,
      ...updates,
    });

    queueFormSubmission(updates);

    if (isValidated()) {
      setValidationAttempted(false);
      if (currentPage !== 1) {
        setIsSubmitting(true);
      }
      isIntentionalNavigation.current = true;
      moveToNextSlide(null, true);
    }
  };

  const handleBloodPressureSelect = (option) => {
    clearError();

    const updates = { 45: option };
    if (option !== "141/91 to 179/99  (High)") {
      updates["102_1"] = "";
      updates["102_2"] = "";
      updates["102_3"] = "";
    }

    setFormData((prevData) => ({
      ...prevData,
      ...updates,
    }));

    updateLocalStorage({
      ...formData,
      ...updates,
    });

    queueFormSubmission({
      ...formData,
      ...updates,
    });

    if (option === "141/91 to 179/99  (High)") {
      setShowHighBpWarning(true);
      setBpWarningAcknowledged(false);
    } else if (
      option === ">180/100 (Higher)" ||
      option === "I don’t know my blood pressure"
    ) {
      setShowVeryHighBpWarning(true);
      setIsSubmitting(false);
      return;
    } else {
      setTimeout(() => {
        moveToNextSlide(null, true);
      }, 10);
    }
  };

  const handleBpWarningAcknowledgement = (e) => {
    const isChecked = e.target.checked;
    setBpWarningAcknowledged(isChecked);

    const updates = {
      "102_1": isChecked ? "1" : "",
      "102_2": isChecked
        ? "I hereby understand and acknowledge the above warning"
        : "",
      "102_3": isChecked ? "33" : "",
    };

    const updatedData = {
      ...formData,
      ...updates,
    };

    setFormData(updatedData);
    updateLocalStorage(updatedData);
    queueFormSubmission(updates);
  };

  const handleHighBpWarningContinue = (proceed = true) => {
    if (!proceed) {
      setShowHighBpWarning(false);
      setBpWarningAcknowledged(false);

      const updates = {
        45: "",
        "102_1": "",
        "102_2": "",
        "102_3": "",
      };

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      updateLocalStorage({
        ...formData,
        ...updates,
      });

      queueFormSubmission(updates);

      return;
    }

    if (!bpWarningAcknowledged) return;
    setShowHighBpWarning(false);

    const updates = {
      "102_1": "1",
      "102_2": "I hereby understand and acknowledge the above warning",
      "102_3": "33",
    };

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateLocalStorage({
      ...formData,
      ...updates,
    });

    queueFormSubmission(updates);

    if (isValidated()) {
      setValidationAttempted(false);
      if (currentPage !== 1) {
        setIsSubmitting(true);
      }
      isIntentionalNavigation.current = true;
      moveToNextSlide(null, true);
    }
  };

  const handleVeryHighBpWarningClose = (proceed = true) => {
    logger.log("Closing very high BP warning, selection was:", formData["45"]);
    setShowVeryHighBpWarning(false);
    setIsSubmitting(false);

    if (!proceed) {
      const updates = { 45: "" };
      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));
      updateLocalStorage({
        ...formData,
        ...updates,
      });
      queueFormSubmission(updates);
    } else {
      const currentSelection = formData["45"];
      logger.log("User proceeding with selection:", currentSelection);
      queueFormSubmission({ 45: currentSelection });
    }
  };

  const handleMorningErectionsSelect = (option) => {
    handleSingleChoiceSelection("40", option);
  };

  const handleEdFrequencySelect = (option) => {
    handleSingleChoiceSelection("37", option);
  };

  const handleEdStartOptionSelect = (option) => {
    clearError();

    const updatedData = updateFormDataAndStorage({
      35: option,
    });

    queueFormSubmission(updatedData);
    setShowEdStartWarning(true);
  };

  const handleEdStartAcknowledgement = (e) => {
    const isChecked = e.target.checked;
    setEdStartAcknowledged(isChecked);

    const updates = {
      "96_1": isChecked ? "1" : "",
      "96_2": isChecked
        ? "I hereby understand and acknowledge the above warning"
        : "",
      "96_3": isChecked ? "33" : "",
    };

    const updatedData = {
      ...formData,
      ...updates,
    };

    setFormData(updatedData);

    updateLocalStorage(updatedData);

    queueFormSubmission(updatedData);
  };

  const handleEdStartWarningContinue = (proceed = true) => {
    if (!proceed) {
      setShowEdStartWarning(false);
      return;
    }
    if (!edStartAcknowledged) return;

    setShowEdStartWarning(false);

    const updatedData = {
      ...formData,
      "96_1": "1",
      "96_2": "I hereby understand and acknowledge the above warning",
      "96_3": "33",
    };

    setFormData(updatedData);
    updateLocalStorage(updatedData);
    queueFormSubmission(updatedData);

    if (isValidated()) {
      setValidationAttempted(false);
      if (currentPage !== 1) {
        setIsSubmitting(true);
      }
      isIntentionalNavigation.current = true;
      moveToNextSlide(null, true);
    }
  };

  const handleLastNormalFunctionSelect = (fieldName, value) => {
    handleSingleChoiceSelection(fieldName, value);
  };

  const handleSexualIssueSelect = (fieldName, value) => {
    clearError();

    const newValue = formData[fieldName] === value ? "" : value;
    logger.log(`Setting ${fieldName} to ${newValue}`);

    const currentValue = formData[fieldName];

    updateFormDataAndStorage({
      [fieldName]: newValue,
    });

    if (currentPage === 8) {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }

    const errorBox = formRef.current?.querySelector(".error-box");
    if (errorBox) {
      errorBox.classList.add("hidden");
      errorBox.textContent = "";
    }
  };

  const handleFemaleWarningClose = () => {
    setShowPopup(false);
  };
  const handleSexualIssuesPopupContinue = (proceed = true) => {
    if (!proceed) {
      setShowSexualIssuesPopup(false);
      setIsSubmitting(false);
      return;
    }

    setShowSexualIssuesPopup(false);
    queueFormSubmission(formData);

    if (isValidated()) {
      setValidationAttempted(false);
      if (currentPage !== 1) {
        setIsSubmitting(true);
      }
      moveToNextSlide();
    } else {
      setIsSubmitting(false);
    }
  };

  const handleLowLibidoAcknowledgement = (e) => {
    const isChecked = e.target.checked;
    setLowLibidoAcknowledged(isChecked);

    const updates = {
      "97_1": isChecked ? "1" : "",
      "97_2": isChecked
        ? "I hereby understand and acknowledge the above warning"
        : "",
      "97_3": isChecked ? "33" : "",
    };

    const updatedData = {
      ...formData,
      ...updates,
    };

    setFormData(updatedData);
    updateLocalStorage(updatedData);
    queueFormSubmission(updates);
  };

  const handleLowLibidoWarningContinue = (proceed = true) => {
    if (!proceed) {
      setShowLowLibidoWarning(false);
      setLowLibidoAcknowledged(false);

      const updates = {
        "33_3": "",
        "97_1": "",
        "97_2": "",
        "97_3": "",
      };

      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      updateLocalStorage({
        ...formData,
        ...updates,
      });

      queueFormSubmission(updates);
      setIsSubmitting(false);
      return;
    }

    if (!lowLibidoAcknowledged) return;
    setShowLowLibidoWarning(false);

    const updates = {
      "97_1": "1",
      "97_2": "I hereby understand and acknowledge the above warning",
      "97_3": "33",
    };

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateLocalStorage({
      ...formData,
      ...updates,
    });

    queueFormSubmission(updates);

    if (isValidated()) {
      setValidationAttempted(false);
      if (currentPage !== 1) {
        setIsSubmitting(true);
      }
      isIntentionalNavigation.current = true;
      moveToNextSlide(null, true);
    }
  };

  const handlePrescriptionOptionSelect = (option) => {
    clearError();

    const updates = {
      25: option,
      "27_1": "",
      "27_2": "",
      "27_3": "",
      "27_4": "",
      "27_5": "",
      "27_6": "",
      "27_7": "",
      28: "",
      page_step: option === "No" ? 8 : 7,
    };

    const updatedFormData = { ...formData, ...updates };
    setFormData(updatedFormData);
    updateLocalStorage(updatedFormData);
    queueFormSubmission(updatedFormData);

    if (option === "No") {
      setCurrentPage(8);
      setProgress(Math.floor((7 / 21) * 100));
    } else {
      moveToNextSlide(null, true);
    }
  };

  const handleSpecificMedicationSelect = (fieldName, value) => {
    clearError();

    if (formData["27_7"] === "None of these apply") {
      setFormData((prev) => ({
        ...prev,
        "27_7": "",
      }));
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: prev[fieldName] === value ? "" : value,
    }));

    setTimeout(() => {
      updateLocalStorage();
    }, 1);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleMedicationNoneOptionSelect = () => {
    clearError();

    let updates = {};

    if (formData["27_7"] === "None of these apply") {
      updates["27_7"] = "";
    } else {
      updates = {
        "27_1": "",
        "27_2": "",
        "27_3": "",
        "27_4": "",
        "27_5": "",
        "27_6": "",
        "27_7": "None of these apply",
        28: "",
      };
    }

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateFormDataAndStorage(updates);

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleMedicationOtherOptionSelect = () => {
    clearError();

    if (formData["27_7"] === "None of these apply") {
      setFormData((prev) => ({
        ...prev,
        "27_7": "",
      }));
    }

    setFormData((prev) => {
      const newState = {
        ...prev,
        "27_6": prev["27_6"] === "Other" ? "" : "Other",
      };

      if (newState["27_6"] === "") {
        newState["28"] = "";
      }

      return newState;
    });

    setTimeout(() => {
      updateLocalStorage();
    }, 1);

    const input = formRef.current?.querySelector(".quiz-option-input-28");
    if (input) {
      input.disabled = formData["27_6"] !== "Other";
    }

    const continueButton = formRef.current?.querySelector(
      ".quiz-continue-button"
    );
    if (continueButton) {
      continueButton.style.visibility = "";
    }
  };

  const handleMedicationDetailsChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      148: value,
    }));

    updateFormDataAndStorage({
      148: value,
    });

    debouncedQueueSubmission({ ...formData, 148: value });

    if (value.trim() !== "") {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handlePage7OtherOption = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      28: value,
    }));

    updateFormDataAndStorage({
      28: value,
    });

    debouncedQueueSubmission({ ...formData, 28: value });

    if (value.trim() !== "") {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleCloseMedicationWarning = (proceed = true) => {
    setShowMedicationWarning(false);
    setIsSubmitting(false);

    if (!proceed) {
      const dangerousMeds = ["27_1", "27_2", "27_3", "27_4", "27_5"];
      const updatedForm = { ...formData };

      dangerousMeds.forEach((med) => {
        if (updatedForm[med]) {
          updatedForm[med] = "";
        }
      });

      setFormData(updatedForm);
      updateLocalStorage(updatedForm);
      queueFormSubmission(updatedForm);
    }
  };

  const handleMedicalConditionSelect = (fieldName, value) => {
    clearError();

    if (formData["5_1"] === "No Medical Issues") {
      setFormData((prev) => ({
        ...prev,
        "5_1": "",
      }));
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        [fieldName]: prev[fieldName] === value ? "" : value,
      };
      return updated;
    });

    setTimeout(() => {
      updateLocalStorage();
    }, 1);

    if (currentPage === 5) {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleMedicalNoneOptionSelect = () => {
    clearError();

    let updates = {};

    if (formData["5_1"] === "No Medical Issues") {
      updates = { "5_1": "" };
    } else {
      updates = {
        "5_1": "No Medical Issues",
        "5_2": "",
        "5_3": "",
        "5_4": "",
        "5_5": "",
        "5_6": "",
        "5_7": "",
        "5_8": "",
        "5_9": "",
        "5_11": "",
        "5_12": "",
        "5_13": "",
        56: "",
      };
    }

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateFormDataAndStorage(updates);

    if (currentPage === 5) {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleMedicalOtherOptionSelect = async () => {
    clearError();

    let updates = {};

    if (formData["5_1"] === "No Medical Issues") {
      updates["5_1"] = "";
    }

    const newOtherValue = formData["5_13"] === "Other" ? "" : "Other";
    updates["5_13"] = newOtherValue;

    if (newOtherValue === "") {
      updates["56"] = "";
    }

    const updatedData = updateFormDataAndStorage(updates);

    try {
      queueFormSubmission(updatedData);

      const textarea = formRef.current?.querySelector(".quiz-option-input-56");
      if (textarea) {
        textarea.disabled = newOtherValue === "";
      }

      if (currentPage === 5) {
        const continueButton = formRef.current?.querySelector(
          ".quiz-continue-button"
        );
        if (continueButton) {
          continueButton.style.visibility = "";
        }
      }
    } catch (error) {
      logger.error("Error auto-saving:", error);
    }
  };

  const handleMedicalConditionsTextChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      56: value,
    }));

    updateFormDataAndStorage({
      56: value,
    });

    debouncedQueueSubmission({ ...formData, 56: value });

    if (value.trim() !== "") {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleDrugOptionSelect = (fieldName, value) => {
    clearError();

    let updates = {};

    if (formData["23_5"] === "None of these apply") {
      updates["23_5"] = "";
    }

    updates[fieldName] = formData[fieldName] === value ? "" : value;
    updateFormDataAndStorage(updates);
  };

  const handleDrugNoneOptionSelect = () => {
    clearError();

    let updates = {};

    if (formData["23_5"] === "None of these apply") {
      updates["23_5"] = "";
    } else {
      updates = {
        "23_1": "",
        "23_2": "",
        "23_3": "",
        "23_4": "",
        "23_5": "None of these apply",
        "23_6": "",
      };
    }

    setFormData((prev) => ({
      ...prev,
      ...updates,
    }));

    updateFormDataAndStorage(updates);

    if (currentPage === 4) {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };
  const handleSexOptionSelect = (option) => {
    clearError();

    const previousSelection = formData["1"];

    setFormData((prev) => ({
      ...prev,
      1: option,
    }));

    const updatedData = { ...formData, 1: option };
    localStorage.setItem("quiz-form-data", JSON.stringify(updatedData));
    localStorage.setItem(
      "quiz-form-data-expiry",
      (new Date().getTime() + 1000 * 60 * 60).toString()
    );

    if (previousSelection !== option) {
      queueFormSubmission({
        ...formData,
        1: option,
        id: formData.id || "",
        token: formData.token || "",
      });
    }

    if (option === "Female") {
      setShowPopup(true);
    } else {
      moveToNextSlide(option, true);
    }
  };

  const handleAllergiesOptionSelect = (option) => {
    clearError();

    if (option === "No") {
      const updates = { 30: option, 31: "" };
      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      updateFormDataAndStorage(updates);
      queueFormSubmission({ ...formData, ...updates });

      const textarea = formRef.current?.querySelector(".quiz-option-input-31");
      if (textarea) {
        textarea.disabled = true;
      }

      setTimeout(() => {
        moveToNextSlide(null, true);
      }, 50);
    } else {
      const updates = { 30: option };
      setFormData((prev) => ({
        ...prev,
        ...updates,
      }));

      updateFormDataAndStorage(updates);
      queueFormSubmission({ ...formData, ...updates });

      const textarea = formRef.current?.querySelector(".quiz-option-input-31");
      if (textarea) {
        textarea.disabled = false;
      }

      if (currentPage === 2) {
        const continueButton = formRef.current?.querySelector(
          ".quiz-continue-button"
        );
        if (continueButton) {
          continueButton.style.display = "block";
          continueButton.style.visibility = "";
        }
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
  }, 1000);

  const handleAllergiesTextChange = (e) => {
    const value = e.target.value;

    setFormData((prev) => ({
      ...prev,
      31: value,
    }));

    updateFormDataAndStorage({
      31: value,
    });

    if (value.trim() !== "") {
      const continueButton = formRef.current?.querySelector(
        ".quiz-continue-button"
      );
      if (continueButton) {
        continueButton.style.visibility = "";
      }
    }
  };

  const handleAlcoholOptionSelect = (option) => {
    clearError();
    const updatedData = {
      ...formData,
      138: option,
    };

    localStorage.setItem("quiz-form-data", JSON.stringify(updatedData));
    localStorage.setItem(
      "quiz-form-data-expiry",
      (new Date().getTime() + 1000 * 60 * 60).toString()
    );

    setFormData(updatedData);
    queueFormSubmission(updatedData);
    moveToNextSlide(null, true);
  };
  const moveToNextSlide = async (sexOption = null, skipApiCall = false) => {
    const currentSexValue = sexOption || formData["1"];
    if (showConsentPopup(currentSexValue)) {
      return;
    }

    if (currentPage >= 21 && currentPage + 1 >= 22) {
      if (typeof window !== "undefined") {
        localStorage.setItem("on-thank-you-page", "true");
      }
      setCurrentPage(22);
      setProgress(100);
      setShowThankYou(true);
      return;
    }

    if (currentPage >= 22) {
      window.location.href = "/";
      return;
    }

    setIsMovingForward(true);
    const nextPage = currentPage + 1;

    setCurrentPage(nextPage);

    const newProgress = Math.floor(((nextPage - 1) / 21) * 100);
    setProgress(newProgress);
    setIsSubmitting(false);
    isIntentionalNavigation.current = false;
  };
  useEffect(() => {
    updateProgressData();
  }, [currentPage]);
  useEffect(() => {
    if (currentPage === 22 && showThankYou) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("quiz-form-data");
        localStorage.removeItem("quiz-form-data-expiry");
        clearPhotoUploadStatus();
        logger.log("Quiz form data cleared from localStorage");
        localStorage.setItem("on-thank-you-page", "true");
      }
    }

    return () => {
      if (currentPage === 22 && typeof window !== "undefined") {
        localStorage.removeItem("on-thank-you-page");
      }
    };
  }, [currentPage, showThankYou]);
  const moveToPreviousSlide = () => {
    setIsMovingForward(false);

    if (currentPage === 22) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("on-thank-you-page");
      }
      window.location.href = "/";
      return;
    }

    if (currentPage > 1) {
      let prevPage = currentPage - 1;
      if (currentPage === 8) {
        if (formData["25"] === "No") {
          prevPage = 6;
          setFormData((prev) => ({
            ...prev,
            page_step: 6,
            "27_1": "",
            "27_2": "",
            "27_3": "",
            "27_4": "",
            "27_5": "",
            "27_6": "",
            "27_7": "",
            28: "",
          }));
        } else if (formData["25"] === "Yes") {
          prevPage = 7;
        } else {
          prevPage = 6;
        }

        setCurrentPage(prevPage);
        setFormData((prev) => ({
          ...prev,
          page_step: prevPage,
        }));
      } else if (currentPage === 11) {
        prevPage = 10;
        setCurrentPage(prevPage);
        setFormData((prev) => ({
          ...prev,
          page_step: prevPage,
        }));
        setEdStartAcknowledged(formData["96_1"] === "1");
      } else {
        setCurrentPage(prevPage);
        setFormData((prev) => ({
          ...prev,
          page_step: prevPage,
        }));
      }

      const newProgress = Math.floor(((prevPage - 1) / 21) * 100);
      setProgress(newProgress);

      setTimeout(() => {
        const updatedFormData = {
          ...formData,
          page_step: prevPage,
        };
        localStorage.setItem("quiz-form-data", JSON.stringify(updatedFormData));
        localStorage.setItem(
          "quiz-form-data-expiry",
          (new Date().getTime() + 1000 * 60 * 60).toString()
        );
      }, 10);
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

  const isValidated = (sexValue = null) => {
    const showError = (message) => {
      const errorBox = formRef.current?.querySelector(".error-box");
      if (errorBox) {
        errorBox.classList.remove("hidden");
        errorBox.textContent = message;
      }
      setIsSubmitting(false);
      return false;
    };

    const validationRules = [
      {
        page: 1,
        validate: () => {
          const currentValue = sexValue || formData["1"];
          if (!currentValue) {
            return showError("Please make a selection");
          }
          return true;
        },
      },
      {
        page: 2,
        validate: () => {
          if (!formData["30"]) {
            return showError("Please select whether you have allergies or not");
          }
          if (formData["30"] === "Yes" && !formData["31"]) {
            return showError("Please enter your allergies");
          }
          return true;
        },
      },
      {
        page: 3,
        validate: () => {
          if (!formData["138"]) {
            return showError("Please make a selection");
          }
          return true;
        },
      },
      {
        page: 4,
        validate: () => {
          const hasSelection =
            formData["23_1"] === "Cocaine" ||
            formData["23_2"] === "Marijuana" ||
            formData["23_3"] === "Magic Mushrooms" ||
            formData["23_4"] === "Tobacco/vaping nicotine" ||
            formData["23_5"] === "None of these apply" ||
            formData["23_6"] === "Poppers";

          if (!hasSelection) {
            return showError("Please make a selection");
          }
          return true;
        },
      },
      {
        page: 5,
        validate: () => {
          const hasSelection =
            formData["5_1"] === "No Medical Issues" ||
            formData["5_2"] === "Coronary artery disease" ||
            formData["5_3"] === "Stroke or Transient ischemic attack" ||
            formData["5_4"] === "High blood pressure" ||
            formData["5_5"] === "Peripheral vascular disease" ||
            formData["5_6"] === "Diabetes" ||
            formData["5_7"] === "Neurological disease" ||
            formData["5_8"] === "Low Testosterone" ||
            formData["5_9"] === "Mental Health issues" ||
            formData["5_11"] === "Enlarged Prostate" ||
            formData["5_12"] === "Structural damage to your penis" ||
            formData["5_13"] === "Other";

          if (!hasSelection) {
            return showError("Please make a selection");
          }
          if (formData["5_13"] === "Other" && !formData["56"]) {
            return showError("Please enter your medical conditions");
          }
          return true;
        },
      },
      {
        page: 6,
        validate: () => {
          if (!formData["25"]) {
            return showError("Please make a selection");
          }

          if (formData["25"] === "No") {
            return true;
          }

          return true;
        },
      },
      {
        page: 7,
        validate: () => {
          if (formData["25"] === "No") {
            return true;
          }

          const hasSelection =
            formData["27_1"] ||
            formData["27_2"] ||
            formData["27_3"] ||
            formData["27_4"] ||
            formData["27_5"] ||
            formData["27_6"] ||
            formData["27_7"];

          if (!hasSelection) {
            return showError("Please make a selection");
          }

          if (formData["27_6"] === "Other" && !formData["28"]) {
            return showError("Please enter your medication details");
          }

          return true;
        },
      },
      {
        page: 8,
        validate: () => {
          const hasSelection =
            formData["33_1"] === "Difficulty getting an erection" ||
            formData["33_2"] === "Difficulty maintaining an erection" ||
            formData["33_3"] === "Low sexual desire" ||
            formData["33_5"] === "Ejaculating too early";

          if (!hasSelection) {
            return showError("Please select at least one option");
          }

          if (formData["33_3"] === "Low sexual desire" && !formData["97_1"]) {
            setShowLowLibidoWarning(true);
            return false;
          }

          return true;
        },
      },
      {
        page: 9,
        validate: () => {
          if (!formData["42"]) {
            return showError("Please make a selection");
          }
          return true;
        },
      },
      {
        page: 10,
        validate: () => {
          if (!formData["35"]) {
            return showError("Please make a selection");
          }
          if (formData["35"] && !formData["96_1"]) {
            setShowEdStartWarning(true);
            return false;
          }
          return true;
        },
      },
      {
        page: 11,
        validate: () => {
          if (!formData["37"]) {
            return showError("Please make a selection");
          }
          return true;
        },
      },
      {
        page: 12,
        validate: () => {
          if (!formData["40"]) {
            return showError("Please make a selection");
          }
          return true;
        },
      },
      {
        page: 13,
        validate: () => {
          if (!formData["45"]) {
            return showError("Please make a selection");
          }

          if (formData["45"] === "141/91 to 179/99  (High)") {
            if (!formData["102_1"]) {
              setShowHighBpWarning(true);
              return false;
            }
          }

          if (
            formData["45"] === ">180/100 (Higher)" ||
            formData["45"] === "I don’t know my blood pressure"
          ) {
            setShowVeryHighBpWarning(true);
            return false;
          }

          return true;
        },
      },
      {
        page: 14,
        validate: () => {
          if (!formData["51"]) {
            return showError("Please make a selection");
          }
          if (formData["51"] === "Yes" && !formData["103_1"]) {
            setShowBpMedicationWarning(true);
            return false;
          }
          return true;
        },
      },
      {
        page: 15,
        validate: () => {
          const hasSelection =
            formData["49_1"] ||
            formData["49_2"] ||
            formData["49_3"] ||
            formData["49_4"] ||
            formData["49_5"] ||
            formData["49_6"];

          if (!hasSelection) {
            return showError("Please select at least one option");
          }

          if (formData["49_5"] && !formData["81"]) {
            return showError(
              "Please provide details about your heart condition"
            );
          }

          return true;
        },
      },
      {
        page: 16,
        validate: () => {
          if (!formData["2"]) {
            return showError("Please make a selection");
          }
          if (formData["2"] === "Yes" && !formData["148"]) {
            return showError("Please provide medication and dosage details");
          }
          return true;
        },
      },
      {
        page: 17,
        validate: () => {
          if (!formData["203"]) {
            return showError("Please make a selection");
          }
          return true;
        },
      },
      {
        page: 18,
        validate: () => {
          if (!formData["179"]) {
            return showError("Please make a selection");
          }
          if (formData["179"] === "Yes" && !formData["181"]) {
            return showError("Please specify your questions");
          }
          return true;
        },
      },
      {
        page: 19,
        validate: () => {
          if (!formData["178"]) {
            return showError("Please make a selection");
          }
          if (formData["178"] === "Clinician" && !formData["182"]) {
            return showError("Please specify your questions");
          }
          if (formData["178"] === "No" && !formData["182_1"]) {
            setShowNoCallAcknowledgement(true);
            return false;
          }
          return true;
        },
      },
      {
        page: 20,
        validate: () => {
          if (!formData["204_1"]) {
            return showError("Please acknowledge the message");
          }
          return true;
        },
      },
      {
        page: 21,
        validate: () => {
          const photoStatus = getPhotoUploadStatus();
          if (!photoIdFile && !formData["196"] && !photoStatus.uploaded) {
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

  const showConsentPopup = (sexValue = null) => {
    const currentValue = sexValue || formData["1"];
    if (currentPage === 1 && currentValue === "Female") {
      setShowPopup(true);
      return true;
    }

    return false;
  };

  const handleClosePopup = () => {
    setShowPopup(false);

    setFormData((prev) => ({
      ...prev,
      1: "",
    }));

    setTimeout(() => {
      updateLocalStorage();
    }, 1);
  };

  const goBackHome = () => {
    router.push("/");
  };

  useEffect(() => {
    window.history.replaceState({ page: 1 }, "", `?page=1`);

    clearError();
    setValidationAttempted(false);

    const handleForwardNavigation = () => {
      if (currentPage > 1 && !isHandlingPopState.current) {
        window.history.pushState(
          { page: currentPage },
          "",
          `?page=${currentPage}`
        );
      }
    };

    const handlePopState = (event) => {
      logger.log("PopState triggered, current page:", currentPage);

      if (isHandlingPopState.current) return;
      isHandlingPopState.current = true;

      moveToPreviousSlide();

      setTimeout(() => {
        isHandlingPopState.current = false;
      }, 1);
    };

    window.addEventListener("popstate", handlePopState);

    if (currentPage > 1) {
      handleForwardNavigation();
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [currentPage]);
  useEffect(() => {
    if (currentPage > 1 && currentPage < 22) {
      const handleBeforeUnload = (event) => {
        if (
          !isSubmitting &&
          !isIntentionalNavigation.current &&
          !isUploading &&
          !showMedicationWarning &&
          !showEdStartWarning &&
          !showLowLibidoWarning &&
          !showHighBpWarning &&
          !showVeryHighBpWarning &&
          !showBpMedicationWarning &&
          !showCardioSymptomWarning &&
          !showNoCallAcknowledgement &&
          !showPopup &&
          !showCustomerVerificationPopup
        ) {
          event.preventDefault();
          event.returnValue =
            "You have unsaved changes. Are you sure you want to leave?";
          return event.returnValue;
        }
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }

    return undefined;
  }, [
    currentPage,
    isSubmitting,
    isUploading,
    showMedicationWarning,
    showEdStartWarning,
    showHighBpWarning,
    showVeryHighBpWarning,
    showBpMedicationWarning,
    showCardioSymptomWarning,
    showNoCallAcknowledgement,
    showPopup,
    showCustomerVerificationPopup,
  ]);

  useEffect(() => {
    const form = document.getElementById("quiz-form");
    if (form) {
      const handleSubmit = (e) => {
        if (!isSubmitting) {
          e.preventDefault();
          return false;
        }
      };

      form.addEventListener("submit", handleSubmit);

      return () => {
        form.removeEventListener("submit", handleSubmit);
      };
    }
  }, [isSubmitting]);

  if (isLoadingQuestionnairePrefill) {
    return <Loader />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white subheaders-font font-medium">
      <QuestionnaireNavbar
        onBackClick={handleBackClick}
        currentPage={currentPage}
        isThankYouPage={currentPage === 22 && showThankYou}
      />

      <ProgressBar progress={progress} />

      <div className="flex-1">
        <div
          className="quiz-page-wrapper relative w-full md:w-[520px] px-5 md:px-0 mx-auto mb-10 bg-[#FFFFFF]"
          ref={formRef}
          suppressHydrationWarning={true}
        >
          <form id="quiz-form">
            <input type="hidden" name="form_id" value="2" />
            <input
              type="hidden"
              name="action"
              value="ed_questionnaire_data_upload"
            />
            <input
              type="hidden"
              name="entrykey"
              value={formData.entrykey || ""}
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
              value="https://stg-1.rocky.health"
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
            <input
              type="hidden"
              name="selected-dosage"
              value={formData["selected-dosage"] || ""}
            />

            <div
              className="relative min-h-[400px] flex items-start"
              suppressHydrationWarning={true}
            >
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
                    {/* Biological Sex Question */}
                    {currentPage === 1 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="What was your biological sex at birth?"
                          subtitle="For example, on your original birth certificate"
                          currentPage={currentPage}
                          pageNo={1}
                          questionId="1"
                        >
                          {["Male", "Female"].map((option, index) => (
                            <QuestionOption
                              key={`sex-option-${index}`}
                              id={`1_${index}`}
                              name="1"
                              value={option}
                              checked={formData["1"] === option}
                              onChange={() => handleSexOptionSelect(option)}
                              type="radio"
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Allergies Question */}
                    {currentPage === 2 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="Do you have any known allergies?"
                          currentPage={currentPage}
                          pageNo={2}
                          questionId="30"
                        >
                          {[
                            { id: "30_1", value: "No" },
                            { id: "30_2", value: "Yes" },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name="30"
                              value={option.value}
                              checked={formData["30"] === option.value}
                              onChange={() =>
                                handleAllergiesOptionSelect(option.value)
                              }
                              type="radio"
                            />
                          ))}

                          {formData["30"] === "Yes" && (
                            <QuestionAdditionalInput
                              id="31"
                              name="31"
                              placeholder="Please enter the allergies in the box below separated by comma (,)"
                              value={formData["31"] || ""}
                              onChange={handleAllergiesTextChange}
                              disabled={formData["30"] !== "Yes"}
                              subtext="Example: Allergy 1, Allergy 2"
                            />
                          )}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Alcohol Consumption Question */}
                    {currentPage === 3 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="Do you drink alcohol?"
                          subtitle="One shot of 40% spirits is 1 unit. One glass of wine or a pint of beer is 2 units."
                          currentPage={currentPage}
                          pageNo={3}
                          questionId="138"
                        >
                          {[
                            { id: "138_1", value: "No" },
                            {
                              id: "138_2",
                              value: "Yes, more than 14 units/week",
                            },
                            {
                              id: "138_3",
                              value: "Yes, Less than 14 units/week",
                            },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name="138"
                              value={option.value}
                              checked={formData["138"] === option.value}
                              onChange={() =>
                                handleAlcoholOptionSelect(option.value)
                              }
                              type="radio"
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {currentPage === 4 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="Do you use any of the following drugs?"
                          currentPage={currentPage}
                          pageNo={4}
                          questionId="23"
                          inputType="checkbox"
                        >
                          {[
                            { id: "23_1", name: "23_1", value: "Cocaine" },
                            { id: "23_2", name: "23_2", value: "Marijuana" },
                            {
                              id: "23_3",
                              name: "23_3",
                              value: "Magic Mushrooms",
                            },
                            {
                              id: "23_4",
                              name: "23_4",
                              value: "Tobacco/vaping nicotine",
                            },
                            { id: "23_6", name: "23_6", value: "Poppers" },
                            {
                              id: "23_5",
                              name: "23_5",
                              value: "None of these apply",
                              isNoneOption: true,
                            },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name={option.name}
                              value={option.value}
                              checked={formData[option.name] === option.value}
                              onChange={() =>
                                option.isNoneOption
                                  ? handleDrugNoneOptionSelect()
                                  : handleDrugOptionSelect(
                                      option.name,
                                      option.value
                                    )
                              }
                              type="checkbox"
                              isNoneOption={option.isNoneOption}
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Medical Conditions Question */}
                    {currentPage === 5 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="Do you have any of the following medical conditions?"
                          currentPage={currentPage}
                          pageNo={5}
                          questionId="5"
                          inputType="checkbox"
                        >
                          {[
                            {
                              id: "5_1",
                              name: "5_1",
                              value: "No Medical Issues",
                              isNoneOption: true,
                            },
                            {
                              id: "5_2",
                              name: "5_2",
                              value: "Coronary artery disease",
                            },
                            {
                              id: "5_3",
                              name: "5_3",
                              value: "Stroke or Transient ischemic attack",
                            },
                            {
                              id: "5_4",
                              name: "5_4",
                              value: "High blood pressure",
                            },
                            {
                              id: "5_5",
                              name: "5_5",
                              value: "Peripheral vascular disease",
                            },
                            { id: "5_6", name: "5_6", value: "Diabetes" },
                            {
                              id: "5_7",
                              name: "5_7",
                              value: "Neurological disease",
                            },
                            {
                              id: "5_8",
                              name: "5_8",
                              value: "Low Testosterone",
                            },
                            {
                              id: "5_9",
                              name: "5_9",
                              value: "Mental Health issues",
                            },
                            {
                              id: "5_11",
                              name: "5_11",
                              value: "Enlarged Prostate",
                            },
                            {
                              id: "5_12",
                              name: "5_12",
                              value: "Structural damage to your penis",
                            },
                            {
                              id: "5_13",
                              name: "5_13",
                              value: "Other",
                              isOtherOption: true,
                              otherField: "other-medical-conditions-field",
                            },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name={option.name}
                              value={option.value}
                              checked={formData[option.name] === option.value}
                              onChange={() =>
                                option.isNoneOption
                                  ? handleMedicalNoneOptionSelect()
                                  : option.isOtherOption
                                  ? handleMedicalOtherOptionSelect()
                                  : handleMedicalConditionSelect(
                                      option.name,
                                      option.value
                                    )
                              }
                              type="checkbox"
                              isNoneOption={option.isNoneOption}
                              isOtherOption={option.isOtherOption}
                              otherField={option.otherField}
                            />
                          ))}

                          {formData["5_13"] === "Other" && (
                            <QuestionAdditionalInput
                              id="56"
                              name="56"
                              placeholder="Please enter the medical conditions in the box below separated by comma (,)"
                              value={formData["56"] || ""}
                              onChange={handleMedicalConditionsTextChange}
                              disabled={formData["5_13"] !== "Other"}
                              subtext="Example: Medical Condition 1, Medical Condition 2"
                            />
                          )}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Prescription Medications Question */}
                    {currentPage === 6 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="Are you currently taking any prescription medications?"
                          currentPage={currentPage}
                          pageNo={6}
                          questionId="25"
                        >
                          {["No", "Yes"].map((option, index) => (
                            <QuestionOption
                              key={`prescription-${index}`}
                              id={`25_${index + 1}`}
                              name="25"
                              value={option}
                              checked={formData["25"] === option}
                              onChange={() => handleMedicationSelect(option)}
                              type="radio"
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Specific Medications Question */}
                    {currentPage === 7 && formData["25"] === "Yes" && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="Are you taking any of the following medications?"
                          currentPage={currentPage}
                          pageNo={7}
                          questionId="27"
                          inputType="checkbox"
                        >
                          {[
                            {
                              id: "27_1",
                              name: "27_1",
                              value: "Glyceral Trinitrate spray or tablets",
                              showWarning: true,
                            },
                            {
                              id: "27_2",
                              name: "27_2",
                              value: "Isosorbide Mononitrate",
                              showWarning: true,
                            },
                            {
                              id: "27_3",
                              name: "27_3",
                              value: "Isosorbide Dinitrate",
                              showWarning: true,
                            },
                            {
                              id: "27_4",
                              name: "27_4",
                              value: "Nitroprusside",
                              showWarning: true,
                            },
                            {
                              id: "27_5",
                              name: "27_5",
                              value:
                                "Any other nitrate-containing medication in any form",
                              showWarning: true,
                            },
                            {
                              id: "27_7",
                              name: "27_7",
                              value: "None of these apply",
                              isNoneOption: true,
                            },
                            {
                              id: "27_6",
                              name: "27_6",
                              value: "Other",
                              isOtherOption: true,
                              otherField: "other-medicine-dropdown-field",
                            },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name={option.name}
                              value={option.value}
                              checked={formData[option.name] === option.value}
                              onChange={() =>
                                option.isNoneOption
                                  ? handleMedicationNoneOptionSelect()
                                  : option.isOtherOption
                                  ? handleMedicationOtherOptionSelect()
                                  : handleSpecificMedicationSelect(
                                      option.name,
                                      option.value,
                                      option.showWarning
                                    )
                              }
                              type="checkbox"
                              isNoneOption={option.isNoneOption}
                              isOtherOption={option.isOtherOption}
                              otherField={option.otherField}
                            />
                          ))}

                          {formData["27_6"] === "Other" && (
                            <QuestionAdditionalInput
                              id="28"
                              name="28"
                              placeholder="Please enter your medication details."
                              value={formData["28"] || ""}
                              onChange={handlePage7OtherOption}
                              type="text"
                              disabled={formData["27_6"] !== "Other"}
                            />
                          )}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Sexual Issues Question */}
                    {currentPage === 8 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="What sexual issues are you experiencing?"
                          currentPage={currentPage}
                          pageNo={8}
                          questionId="33"
                          inputType="checkbox"
                        >
                          {[
                            {
                              id: "33_1",
                              name: "33_1",
                              value: "Difficulty getting an erection",
                            },
                            {
                              id: "33_2",
                              name: "33_2",
                              value: "Difficulty maintaining an erection",
                            },
                            {
                              id: "33_3",
                              name: "33_3",
                              value: "Low sexual desire",
                            },
                            {
                              id: "33_5",
                              name: "33_5",
                              value: "Ejaculating too early",
                            },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name={option.name}
                              value={option.value}
                              checked={formData[option.name] === option.value}
                              onChange={() =>
                                handleSexualIssueSelect(
                                  option.name,
                                  option.value
                                )
                              }
                              type="checkbox"
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Last Normal Sexual Function Question */}
                    {currentPage === 9 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="When was the last time you had normal sexual function?"
                          currentPage={currentPage}
                          pageNo={9}
                          questionId="42"
                        >
                          {[
                            { id: "42_1", value: "Currently normal" },
                            { id: "42_2", value: "3 months ago" },
                            { id: "42_3", value: "6 months ago" },
                            { id: "42_4", value: "12 months ago" },
                            { id: "42_5", value: "Always had problems" },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name="42"
                              value={option.value}
                              label={option.label || option.value}
                              checked={formData["42"] === option.value}
                              onChange={() =>
                                handleLastNormalFunctionSelect(
                                  "42",
                                  option.value
                                )
                              }
                              type="radio"
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* ED Start Question */}
                    {currentPage === 10 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="How did your ED start?"
                          currentPage={currentPage}
                          pageNo={10}
                          questionId="35"
                        >
                          {[
                            { id: "35_1", value: "Suddenly" },
                            { id: "35_2", value: "Gradually" },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name="35"
                              value={option.value}
                              checked={formData["35"] === option.value}
                              onChange={() =>
                                handleEdStartOptionSelect(option.value)
                              }
                              type="radio"
                              className="w-full"
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* ED Frequency Question */}
                    {currentPage === 11 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="How often is ED a problem for you?"
                          currentPage={currentPage}
                          pageNo={11}
                          questionId="37"
                        >
                          {[
                            { id: "37_1", value: "All the time" },
                            { id: "37_2", value: "Sometimes" },
                            { id: "37_3", value: "Rarely" },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name="37"
                              value={option.value}
                              checked={formData["37"] === option.value}
                              onChange={() =>
                                handleEdFrequencySelect(option.value)
                              }
                              type="radio"
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Morning Erections Question */}
                    {currentPage === 12 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="Do you get morning erections?"
                          currentPage={currentPage}
                          pageNo={12}
                          questionId="40"
                        >
                          {[
                            { id: "40_1", value: "Yes" },
                            {
                              id: "40_2",
                              value: "Have not had one in over three months",
                            },
                            { id: "40_3", value: "Never had them" },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name="40"
                              value={option.value}
                              checked={formData["40"] === option.value}
                              onChange={() =>
                                handleMorningErectionsSelect(option.value)
                              }
                              type="radio"
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Blood Pressure Question */}
                    {currentPage === 13 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="What was your most recent blood pressure reading?"
                          subtitle="Please provide your blood pressure reading taken within the last 6 months."
                          currentPage={currentPage}
                          pageNo={13}
                          questionId="45"
                        >
                          {[
                            { id: "45_0", value: "120/80 or lower (Normal)" },
                            {
                              id: "45_1",
                              value: "121/81 to 140/90 (Above Normal)",
                            },
                            { id: "45_2", value: "141/91 to 179/99  (High)" },
                            {
                              id: "45_3",
                              value: ">180/100 (Higher)",
                              label: "180/100 (Higher)",
                            },
                            {
                              id: "45_4",
                              value: "I don’t know my blood pressure",
                            },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name="45"
                              value={option.value}
                              label={option.label || option.value}
                              checked={formData["45"] === option.value}
                              onChange={() =>
                                handleBloodPressureSelect(option.value)
                              }
                              type="radio"
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Blood Pressure Medication Question */}
                    {currentPage === 14 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="Are you currently taking any medication(s) to help lower your blood pressure?"
                          subtitle="(antihypertensives)"
                          currentPage={currentPage}
                          pageNo={14}
                          questionId="51"
                        >
                          {[
                            { id: "51_1", value: "Yes" },
                            { id: "51_2", value: "No" },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name="51"
                              value={option.value}
                              checked={formData["51"] === option.value}
                              onChange={() =>
                                handleBpMedicationSelect(option.value)
                              }
                              type="radio"
                            />
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Cardiovascular Symptoms Question */}
                    {currentPage === 15 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="Do you experience any of the following cardiovascular symptoms?"
                          currentPage={currentPage}
                          pageNo={15}
                          questionId="49"
                          inputType="checkbox"
                        >
                          {[
                            { id: "49_1", value: "Chest pain during sex" },
                            { id: "49_2", value: "Chest pain during exercise" },
                            {
                              id: "49_3",
                              value: "Unexplained fainting or dizziness",
                            },
                            {
                              id: "49_4",
                              value: "Leg or buttock pain with exercise",
                            },
                            {
                              id: "49_5",
                              value: "Abnormal heart rate or rhythm",
                            },
                            {
                              id: "49_6",
                              value: "None of these apply to me",
                              isNoneOption: true,
                            },
                          ].map((option) => (
                            <QuestionOption
                              key={option.id}
                              id={option.id}
                              name={option.id}
                              value={option.value}
                              checked={!!formData[option.id]}
                              onChange={() =>
                                handleCardioSymptomSelect(
                                  option.id,
                                  option.value
                                )
                              }
                              type="checkbox"
                              isNoneOption={option.isNoneOption}
                            />
                          ))}

                          {formData["49_5"] && (
                            <QuestionAdditionalInput
                              id="81"
                              name="81"
                              placeholder="Please state the condition"
                              value={formData["81"] || ""}
                              onChange={handleHeartConditionChange}
                              type="text"
                              disabled={!formData["49_5"]}
                            />
                          )}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {/* Previous ED Medication Experience Question */}
                    {currentPage === 16 && (
                      <QuestionWrapper>
                        <div className="w-full max-w-[335px] md:max-w-[520px] mx-auto">
                          <QuestionLayout
                            title="Let's figure this out."
                            subtitle="Have you used ED meds before?"
                            currentPage={currentPage}
                            pageNo={16}
                            questionId="2"
                          >
                            {[
                              { id: "2_0", value: "Yes" },
                              { id: "2_1", value: "No" },
                            ].map((option) => (
                              <div className="w-full" key={option.id}>
                                <QuestionOption
                                  id={option.id}
                                  name="2"
                                  value={option.value}
                                  checked={formData["2"] === option.value}
                                  onChange={() =>
                                    handleEdMedsExperienceSelect(option.value)
                                  }
                                  type="radio"
                                />
                                {option.value === "Yes" &&
                                  formData["2"] === "Yes" && (
                                    <div className="mt-2 w-full">
                                      <QuestionAdditionalInput
                                        id="148"
                                        name="148"
                                        placeholder="Please state the medication and dosage"
                                        value={formData["148"] || ""}
                                        onChange={handleMedicationDetailsChange}
                                        type="textarea"
                                        disabled={formData["2"] !== "Yes"}
                                      />
                                    </div>
                                  )}
                              </div>
                            ))}
                          </QuestionLayout>
                        </div>
                      </QuestionWrapper>
                    )}
                    {/* Medication Acknowledgement Question */}
                    {currentPage === 17 && (
                      <QuestionWrapper>
                        <motion.div
                          key={currentPage}
                          variants={slideVariants}
                          initial={
                            isMovingForward ? "hiddenRight" : "hiddenLeft"
                          }
                          animate="visible"
                          exit={isMovingForward ? "exitRight" : "exitLeft"}
                          className="w-full subheaders-font"
                        >
                          <div className=" pt-6 pb-4">
                            <h1 className="text-[26px] md:text-[32px] mb-6 ">
                              About your medication
                            </h1>

                            <div className="text-left  md:mx-auto">
                              <h3 className="quiz-subheading text-[14px] md:text-[16px] text-left pt-1">
                                Intended benefits of Cialis(Tadalafil) /
                                Viagra(Sildenafil) for sexual health:
                              </h3>
                              <ul className="list-disc ml-7 mt-3 text-[#AE7E56] marker:text-[#AE7E56]">
                                <li className="text-[16px] md:text-[18px] text-left font-medium mb-3">
                                  To help get and/or maintain an erection
                                </li>
                              </ul>

                              <span className="block border-b border-gray-300 mt-2"></span>

                              <h3 className="quiz-subheading text-[12px] text-left font-normal pt-2 text-gray-600 mb-4">
                                *This isn’t a full list of potential side
                                effects. To learn more, please book an
                                appointment or send a message to your clinician
                              </h3>
                              <h3 className="quiz-subheading md:text-[18px] text-left font-semibold pt-4 mt-2">
                                Possible Side Effects:
                              </h3>

                              <ul className="list-disc pl-4 mb-4 mt-3">
                                <li className="md:text-[14px] text-left font-normal mb-1">
                                  Headaches
                                </li>
                                <li className="md:text-[14px] text-left font-normal mb-1">
                                  Facial flushing
                                </li>
                                <li className="md:text-[14px] text-left font-normal mb-1">
                                  Muscle pain
                                </li>
                                <li className="md:text-[14px] text-left font-normal mb-1">
                                  Indigestion
                                </li>
                                <li className="md:text-[14px] text-left font-normal">
                                  Low blood pressure
                                </li>
                              </ul>

                              <span className="block border-b border-gray-300 mt-2"></span>

                              <h3 className="quiz-subheading md:text-[12px] text-left font-normal pt-2 text-gray-600">
                                *This isn’t a full list of potential side
                                effects. To learn more, please book an
                                appointment or send a message to your clinician
                              </h3>

                              <span className="block border-b border-gray-300 mt-2"></span>
                            </div>

                            <div className="quiz-options-wrapper flex flex-col flex-wrap items-center justify-center py-3  pb-6  md:mx-auto">
                              <div
                                className="quiz-option-1 text-left  w-full flex items-start mb-4"
                                data-option="1"
                              >
                                <input
                                  id="203_0"
                                  className="mt-[5px] w-3 h-3 min-w-3 min-h-3  flex-shrink-0 appearance-none border-2 border-gray-400 rounded-full checked:bg-[#AE7E56] checked:border-transparent focus:outline-none"
                                  type="radio"
                                  name="203"
                                  value="I have read and understood the intended benefits and possible side effects and do not have any questions"
                                  checked={
                                    formData["203"] ===
                                    "I have read and understood the intended benefits and possible side effects and do not have any questions"
                                  }
                                  onChange={() =>
                                    handleMedicationAcknowledgmentSelect(
                                      "I have read and understood the intended benefits and possible side effects and do not have any questions"
                                    )
                                  }
                                />
                                <label
                                  htmlFor="203_0"
                                  className="quiz-option-label leading-[140%] cursor-pointer pl-2 text-md"
                                >
                                  I have read and understood the intended
                                  benefits and possible side effects and do not
                                  have any questions
                                </label>
                              </div>

                              <div
                                className="quiz-option-1 text-left  w-full flex items-start mb-4"
                                data-option="1"
                              >
                                <input
                                  id="203_1"
                                  className="mt-[3px] w-3 h-3 min-w-3 min-h-3  flex-shrink-0 appearance-none border-2 border-gray-400 rounded-full checked:bg-[#AE7E56] checked:border-transparent focus:outline-none"
                                  type="radio"
                                  name="203"
                                  value="I have questions and will book a phone call"
                                  checked={
                                    formData["203"] ===
                                    "I have questions and will book a phone call"
                                  }
                                  onChange={() =>
                                    handleMedicationAcknowledgmentSelect(
                                      "I have questions and will book a phone call"
                                    )
                                  }
                                />
                                <label
                                  htmlFor="203_1"
                                  className="quiz-option-label leading-[140%] cursor-pointer pl-2 text-md"
                                >
                                  I have questions and will book a phone call
                                </label>
                              </div>
                            </div>

                            <p className="error-box text-red-500 hidden m-2 text-center text-sm"></p>
                          </div>
                        </motion.div>
                      </QuestionWrapper>
                    )}
                    {/* Healthcare Team Questions */}
                    {currentPage === 18 && (
                      <QuestionWrapper>
                        <div className="w-full max-w-[335px] md:max-w-[520px] mx-auto">
                          <QuestionLayout
                            title="Do you have any questions for our healthcare team?"
                            // subtitle="Connect with our Medical Team"
                            // subtitle2=""
                            currentPage={currentPage}
                            pageNo={18}
                            questionId="179"
                          >
                            {[
                              { id: "179_0", value: "Yes" },
                              { id: "179_1", value: "No" },
                            ].map((option) => (
                              <div className="w-full" key={option.id}>
                                <QuestionOption
                                  id={option.id}
                                  name="179"
                                  value={option.value}
                                  checked={formData["179"] === option.value}
                                  onChange={() =>
                                    handleHealthcareQuestionsSelect(
                                      option.value
                                    )
                                  }
                                  type="radio"
                                  className="w-full"
                                />
                                {option.value === "Yes" &&
                                  formData["179"] === "Yes" && (
                                    <div className="mt-2 w-full">
                                      <QuestionAdditionalInput
                                        id="181"
                                        name="181"
                                        placeholder="Specify your questions"
                                        value={formData["181"] || ""}
                                        onChange={
                                          handleSpecifiedQuestionsChange
                                        }
                                        disabled={formData["179"] !== "Yes"}
                                      />
                                    </div>
                                  )}
                              </div>
                            ))}
                          </QuestionLayout>
                        </div>
                      </QuestionWrapper>
                    )}
                    {currentPage === 19 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title=" Would you like to book an appointment with our health care team?"
                          currentPage={currentPage}
                          pageNo={19}
                          questionId="178"
                        >
                          {[
                            { id: "178_0", value: "Clinician" },
                            { id: "178_1", value: "Pharmacist" },
                            { id: "178_2", value: "No" },
                          ].map((option) => (
                            <div className="w-full" key={option.id}>
                              <QuestionOption
                                id={option.id}
                                name="178"
                                value={option.value}
                                checked={formData["178"] === option.value}
                                onChange={() =>
                                  handleBookCallSelect(
                                    option.value
                                  )
                                }
                                type="radio"
                                className="w-full"
                              />
                              {option.value === "Clinician" &&
                                formData["178"] === "Clinician" && (
                                  <div className="mt-2 w-full">
                                    <QuestionAdditionalInput
                                      id="182"
                                      name="182"
                                      placeholder="Specify your questions"
                                      value={formData["182"] || ""}
                                      onChange={handlePage19QuestionsChange}
                                      disabled={formData["178"] !== "Clinician"}
                                    />
                                  </div>
                                )}
                            </div>
                          ))}
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {currentPage === 20 && (
                      <QuestionWrapper>
                        <QuestionLayout
                          title="Upload Photo ID"
                          currentPage={currentPage}
                          pageNo={20}
                          questionId="204"
                          inputType="checkbox"
                        >
                          <div className="text-left mb-6 mt-6">
                            <p className="text-[#C19A6B] text-[14px] md:text-[18px] mb-8">
                              Please note this step is mandatory. If you are
                              unable to complete at this time, email your ID to{" "}
                              <a
                                href="mailto:clinicadmin@myrocky.com"
                                className="underline"
                              >
                                clinicadmin@myrocky.com
                              </a>
                            </p>
                            <p className="text-[14px] md:text-[18px]">
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
                              className="ml-3 text-[16px] font-medium text-[#000000]"
                            >
                              I hereby understand and acknowledge the above
                              message
                            </label>
                          </div>
                        </QuestionLayout>
                      </QuestionWrapper>
                    )}
                    {currentPage === 21 && (
                      <QuestionWrapper>
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
                            <h1 className="text-3xl text-center text-[#AE7E56] font-bold mb-6 subheaders-font">
                              Verify your Identity
                            </h1>
                            <h3 className="text-lg text-center font-medium mb-1">
                              Take a picture holding your ID.
                            </h3>
                            <h3 className="text-lg text-center font-medium mb-8">
                              Your face and ID must be clearly visible
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

                              <div className="w-full max-w-md mx-auto">
                                {photoIdFile ? (
                                  <p className="text-center text-xs text-gray-500 mb-4 break-words px-2">
                                    Photo selected: {photoIdFile.name}
                                  </p>
                                ) : (
                                  <>
                                    <p className="text-center text-md font-medium mb-2">
                                      Please capture a selfie of yourself
                                      holding your ID
                                    </p>{" "}
                                    <p className="text-center text-sm text-gray-500 mb-8">
                                      Only JPG, JPEG, PNG, HEIF, and HEIC images
                                      are supported.
                                      <br />
                                      Max allowed file size per image is 20MB
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <input
                            type="hidden"
                            name="196"
                            value={formData["196"] || ""}
                          />
                        </motion.div>
                      </QuestionWrapper>
                    )}{" "}
                    {currentPage === 22 && edShowIntermission && edIntermissionProps && (
                      <QuestionWrapper>
                        <div className="py-4">
                          <QuestionnaireIntermission {...edIntermissionProps} />
                        </div>
                      </QuestionWrapper>
                    )}
                    {currentPage === 22 && !edShowIntermission && (
                      <QuestionWrapper>
                        <div
                          className="quiz-page page-thank-you quiz-page-22"
                          data-pageno="22"
                          data-ques-id=""
                          data-input-type=""
                        >
                          {!showThankYou ? (
                            <div className="py-4 flex justify-center items-center">
                              <Loader></Loader>
                            </div>
                          ) : (
                            <div
                              id="submit-message"
                              className="py-4 text-center"
                            >
                              <h1 className="text-[#814B00] text-2xl text-center font-semibold mb-6">
                                Thank You!
                              </h1>

                              <div className="mb-8">
                                {" "}
                                <FaCheckCircle className="block h-auto mx-auto my-6 max-w-[150px] text-6xl text-green-700" />
                                <h2 className="text-center text-xl text-bold mb-4">
                                  Your form has been successfully submitted!
                                </h2>
                                <p className="text-center text-md text-gray-600 mb-6">
                                  We will review your information and be in
                                  touch shortly.
                                </p>
                              </div>

                              <div className="text-center max-w-[300px] mx-auto mt-6">
                                <h3 className="text-[#814B00] text-xl text-center font-medium">
                                  Follow us
                                </h3>
                              </div>

                              <div className="flex justify-center gap-6 mt-4">
                                <a
                                  href="https://www.facebook.com/people/Rocky-Health-Inc/100084461297628/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#814B00]"
                                >
                                  <FaFacebook />
                                </a>

                                <a
                                  href="https://www.instagram.com/myrocky/"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#814B00]"
                                >
                                  <FaInstagram />
                                </a>

                                <a
                                  href="https://twitter.com/myrockyca"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[#814B00]"
                                >
                                  <FaTwitter />
                                </a>
                              </div>

                              <div
                                id="go-home"
                                className="text-center mx-auto mt-10 hidden"
                              >
                                <a
                                  className="mt-3 py-2 px-10 h-[40px] rounded-md border border-[#814B00] bg-[#814B00] text-[#fefefe] font-medium text-md hover:bg-white hover:text-[#814B00]"
                                  href={`${process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com"}/`}
                                >
                                  Back Home
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      </QuestionWrapper>
                    )}
                    {/* Sexual Issues Popup */}
                    <WarningPopup
                      isOpen={showSexualIssuesPopup}
                      onClose={handleSexualIssuesPopupContinue}
                      title="Please Read"
                      message="Premature ejaculation lacks a strict definition but is generally considered penetrative sex lasting under three minutes, leading to dissatisfaction. If this sounds like your experience, ED treatments won't help—please visit our premature ejaculation page instead."
                      showCheckbox={false}
                      buttonText="Ok"
                      currentPage={currentPage}
                    />
                    {/* Low Libido Warning Popup */}
                    <WarningPopup
                      isOpen={showLowLibidoWarning}
                      onClose={handleLowLibidoWarningContinue}
                      title="Low Sex Drive Notice"
                      message={
                        <>
                          You've indicated you have low sex drive. While
                          erectile dysfunction and low libido can sometimes
                          occur together, they are often caused by different
                          underlying issues.
                          <br />
                          <br />
                          💡 Please note: Treatments for erectile dysfunction
                          are unlikely to improve sex drive.
                          <br />
                          <br />
                          Low libido may require further evaluation, as it can
                          be linked to hormonal, psychological, or medical
                          factors.
                          <br />
                          <br />
                          👉 We strongly recommend that you consult your
                          physician or a healthcare professional for a full
                          assessment.
                        </>
                      }
                      isAcknowledged={lowLibidoAcknowledged}
                      onAcknowledge={handleLowLibidoAcknowledgement}
                      currentPage={currentPage}
                    />
                    {/* ED Start Warning Popup */}
                    <WarningPopup
                      isOpen={showEdStartWarning}
                      onClose={handleEdStartWarningContinue}
                      title="Please Read"
                      message="ED can have a variety of underlying causes, some of which may require treatment. We recommend you schedule an appointment with your doctor to discuss this further and arrange any necessary tests. For now, let MyRocky do some of the work for you."
                      isAcknowledged={edStartAcknowledged}
                      onAcknowledge={handleEdStartAcknowledgement}
                      currentPage={currentPage}
                    />
                    {/* High Blood Pressure Warning Popup */}
                    <WarningPopup
                      isOpen={showHighBpWarning}
                      onClose={handleHighBpWarningContinue}
                      title="Please keep in mind..."
                      message="Your blood pressure is considered high. We'll be able to give you your prescription but please speak to your doctor to discuss your blood pressure."
                      isAcknowledged={bpWarningAcknowledged}
                      onAcknowledge={handleBpWarningAcknowledgement}
                      currentPage={currentPage}
                    />
                    {/* Very High BP Warning Popup */}
                    <WarningPopup
                      isOpen={showVeryHighBpWarning}
                      onClose={handleVeryHighBpWarningClose}
                      title="Sorry..."
                      message={
                        formData["45"] === ">180/100 (Higher)"
                          ? "Your blood pressure is considered very high and we would not be able to provide you with a prescription today. We strongly advise you seek immediate medical attention."
                          : "Unfortunately it would not be safe to give you a prescription without knowing your blood pressure."
                      }
                      showCheckbox={false}
                      backgroundColor="bg-[#F5F4EF]"
                      currentPage={currentPage}
                    />
                    {/* BP Medication Warning Popup */}
                    <WarningPopup
                      isOpen={showBpMedicationWarning}
                      onClose={handleBpMedicationWarningContinue}
                      title="Please keep in mind that..."
                      message="When antihypertensives are combined with sildenafil or tadalafil, this may lower blood pressure even further causing you to feel faint. Although it is generally safe to take these medications together, it is best to take them 4 hours apart to avoid this side effect."
                      isAcknowledged={bpMedicationWarningAcknowledged}
                      onAcknowledge={handleBpMedicationWarningAcknowledgement}
                      currentPage={currentPage}
                    />
                    <WarningPopup
                      isOpen={showCardioSymptomWarning}
                      onClose={handleCardioWarningClose}
                      title="Unfortunately..."
                      message="It would not be safe to provide you with a prescription at this time. Please consult a doctor as soon as possible to discuss your symptoms."
                      showCheckbox={false}
                      currentPage={currentPage}
                    />
                    {/* No Call Acknowledgement Popup */}
                    <WarningPopup
                      isOpen={showNoCallAcknowledgement}
                      onClose={handleNoCallContinue}
                      title="Acknowledgement"
                      message="I hereby acknowledge that by foregoing an appointment with a licensed physician or pharmacist, it is my sole responsibility to ensure I am aware of how to appropriately use the medication requested, furthermore I hereby confirm that I am aware of any potential side effects that may occur through the use of the aforementioned medication and hereby confirm that I do not have any medical questions to ask. I will ensure I have read the relevant product page and FAQ prior to use of the prescribed medication. Should I have any questions to ask, I am aware of how to contact the clinical team at MyRocky or get a hold of my primary care provider."
                      isAcknowledged={noCallAcknowledged}
                      onAcknowledge={handleNoCallAcknowledgement}
                      backgroundColor="bg-[#F5F4EF]"
                      additionalContent={null}
                      buttonText="OK"
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
                    <WarningPopup
                      isOpen={showMedicationWarning}
                      onClose={handleCloseMedicationWarning}
                      title="Sorry"
                      message="As much as we would love to help, ED medications are not considered safe when taken with this medication. It may cause your blood pressure to drop leading to a possible faint or collapse. We are therefore unable to provide you with a prescription on this occasion and would encourage you to speak to your regular doctor."
                      showCheckbox={false}
                      backgroundColor="bg-[#F5F4EF]"
                      currentPage={currentPage}
                    />
                    <WarningPopup
                      isOpen={showPopup}
                      onClose={(proceed) => {
                        setShowPopup(false);
                      }}
                      title="Just a Quick Note! 😊"
                      message="We noticed you selected Female—currently, our treatments for erectile dysfunction are only available for men."
                      showCheckbox={false}
                      buttonText="Ok, I understand"
                      backgroundColor="bg-[#F5F4EF]"
                      titleColor="text-[#C19A6B]"
                      currentPage={2}
                    />
                    {showCustomerVerificationPopup && (
                      <WarningPopup
                        isOpen={showCustomerVerificationPopup}
                        onClose={handleUpdateCustomerName}
                        title="Customer Verification"
                        message={`The name you entered does not match the name on your account (${formData["130_3"]} ${formData["130_6"]}).`}
                        showCheckbox={false}
                        backgroundColor="bg-white"
                        titleColor="text-[#AE7E56]"
                        currentPage={currentPage}
                        buttonText="Update My Legal Name"
                        afterButtonContent={
                          <button
                            onClick={handleOrderForSomeoneElse}
                            className="w-full py-4 px-4 rounded-full border border-black text-black font-medium text-lg mt-4"
                          >
                            I Am Ordering for Someone Else
                          </button>
                        }
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
                <p className="error-box text-red-500 hidden mb-10 text-center text-sm"></p>
              </div>
            </div>
          </form>

          <div className="fixed bottom-0 left-0 w-full p-4 z-[10] bg-white shadow-lg flex items-center justify-center">
            <button
              type="button"
              onClick={handleContinueClick}
              className={`${
                currentPage === 20 || currentPage === 21
                  ? "bg-[#000000]"
                  : "bg-black"
              } text-white w-full max-w-md py-4 px-4 rounded-full font-medium text-lg`}
              style={{
                display: "block",
                opacity:
                  (currentPage === 20 && !photoIdAcknowledged) ||
                  (currentPage === 21 && !photoIdFile)
                    ? "0.5"
                    : "1",
              }}
              disabled={
                (currentPage === 20 && !photoIdAcknowledged) ||
                (currentPage === 21 && !photoIdFile) ||
                isUploading
              }
            >
              {currentPage === 20 ? (
                "I acknowledge"
              ) : currentPage === 21 ? (
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
              ) : currentPage >= 22 ? (
                "Back To Home"
              ) : (
                "Continue"
              )}
            </button>
          </div>
          <div className="quiz-footer flex flex-col flex-wrap items-center justify-center mx-auto px-10 py-4 bg-white z-20 w-full"></div>

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
              {uploadProgress > 0 && (
                <div className="text-xl font-semibold text-gray-700 mb-2">
                  {uploadProgress}% uploaded
                </div>
              )}
              {uploadProgress === 0 && (
                <div className="text-sm text-gray-500 mb-2">
                  Preparing upload...
                </div>
              )}
              Syncing. Please wait ... <br />
              <small style={{ color: "#999", letterSpacing: 0 }}>
                If this takes longer than 15 seconds, refresh the page.
              </small>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
