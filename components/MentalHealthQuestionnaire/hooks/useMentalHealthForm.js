import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import { MENTAL_HEALTH_SCORES } from "../constants";

const INITIAL_FORM_STATE = {
  form_id: 5,
  action: "mh_questionnaire_data_upload",
  entrykey: "",
  id: "",
  token: "",
  stage: "consultation-before-checkout",
  page_step: 1,
  completion_state: "Partial",
  completion_percentage: 10,
  source_site: process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com",
  email: "",
  phone: "",
  "130_3": "",
  "130_6": "",
  131: "",
  132: "",
  158: "",
  "161_4": "",
  // Current situation
  501: "",
  "501_textarea": "",
  "l-501_1-input": "",
  "l-501_1-textarea": "",
  "l-501_3-input": "",
  "l-501_3-textarea": "",
  // Change type
  502: "",
  // Change reason
  503: "",
  "503_textarea": "",
  "l-503_4-textarea": "",
  // Symptoms
  "504_1": "",
  "504_2": "",
  "504_3": "",
  "504_4": "",
  "504_5": "",
  "504_textarea": "",
  "l-504_5-textarea": "",
  // How long feeling this way
  505: "",
  // Recent events
  "506_1": "",
  "506_2": "",
  "506_3": "",
  "506_4": "",
  "506_5": "",
  "506_6": "",
  "506_7": "",
  "506_textarea": "",
  "l-506_6-textarea": "",
  // Support methods
  "507_1": "",
  "507_2": "",
  "507_3": "",
  "507_4": "",
  "507_5": "",
  "507_6": "",
  "507_textarea": "",
  "l-507_5-textarea": "",
  // Results looking for
  "508_1": "",
  "508_2": "",
  "508_3": "",
  "508_4": "",
  "508_5": "",
  "508_6": "",
  "508_textarea": "",
  "l-508_6-textarea": "",
  // Mental health journey
  "509_1": "",
  "509_2": "",
  "509_3": "",
  // Psychiatrist consultation
  510: "",
  "510_textarea": "",
  "l-510_1-textarea": "",
  // PHQ-9 Questions
  511: "",
  512: "",
  513: "",
  514: "",
  515: "",
  516: "",
  517: "",
  518: "",
  519: "",
  // GAD-7 Questions
  520: "",
  521: "",
  522: "",
  523: "",
  524: "",
  525: "",
  526: "",
  // Medications
  "527_1": "",
  "527_2": "",
  "527_3": "",
  "527_4": "",
  "527_5": "",
  "527_6": "",
  "527_7": "",
  "527_8": "",
  // Medical conditions
  "528_1": "",
  "528_2": "",
  "528_3": "",
  "528_4": "",
  "528_5": "",
  "528_6": "",
  "528_7": "",
  "528_8": "",
  "528_9": "",
  "528_textarea": "",
  // Allergies
  529: "",
  "529_textarea": "",
  // Current medications
  530: "",
  "530_textarea": "",
  // Medical history
  531: "",
  "531_textarea": "",
  // Alcohol consumption
  532: "",
  // Recreational drugs
  "533_1": "",
  "533_2": "",
  "533_3": "",
  "533_4": "",
  "533_5": "",
  "533_6": "",
  // Health care team questions
  538: "",
  539: "",
  // ID Upload
  photoIdAcknowledged: false,
  photo_id: "",
  196: "",
  legal_first_name: "",
  legal_last_name: "",
  // Scores
  phq9_score: 0,
  gad7_score: 0,
  // Navigation
  "last-question-index": 1,
  navigationStack: "",
};

export const useMentalHealthForm = ({
  userName = "",
  userEmail = "",
  pn = "",
  province = "",
  dob = "",
} = {}) => {
  const nameParts = userName ? userName.split(" ") : ["", ""];
  const initialFirstName = nameParts[0] || "";
  const initialLastName =
    nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
  const [formData, setFormData] = useState({
    ...INITIAL_FORM_STATE,
    email: userEmail || "",
    phone: pn || "",
    legal_first_name: initialFirstName,
    legal_last_name: initialLastName,
    "130_3": initialFirstName || "",
    "130_6": initialLastName || "",
    131: userEmail || "",
    132: pn || "",
    158: dob || "",
    "161_4": province || "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [progress, setProgress] = useState(10);
  const [questionsStack, setQuestionsStack] = useState([]);
  const [isMovingForward, setIsMovingForward] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [storagePingInterval, setStoragePingInterval] = useState(null);
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch("/api/mental-health", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (data && data.entrykey) {
          setFormData((prev) => ({
            ...prev,
            entrykey: data.entrykey,
          }));
        }
      } catch (error) {
        logger.error("Error fetching user data:", error);
      }
      const loadedData = loadFromStorage();
      if (loadedData) {
        setFormData((prevData) => ({
          ...prevData,
          ...loadedData,
          email: loadedData.email || prevData.email,
          phone: loadedData.phone || prevData.phone,
          legal_first_name:
            loadedData.legal_first_name || prevData.legal_first_name,
          legal_last_name:
            loadedData.legal_last_name || prevData.legal_last_name,
          "130_3": loadedData["130_3"] || prevData["130_3"],
          "130_6": loadedData["130_6"] || prevData["130_6"],
          131: loadedData["131"] || prevData["131"],
          132: loadedData["132"] || prevData["132"],
          158: loadedData["158"] || prevData["158"],
          "161_4": loadedData["161_4"] || prevData["161_4"],
        }));
      }

      setDataLoaded(true);
    };

    loadUserData();

    const interval = setInterval(() => {
      syncWithStorage();
    }, 5000);

    setStoragePingInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (storagePingInterval) clearInterval(storagePingInterval);
    };
  }, [storagePingInterval]);

  useEffect(() => {
    calculatePHQ9Score();
    calculateGAD7Score();
  }, [
    formData["511"],
    formData["512"],
    formData["513"],
    formData["514"],
    formData["515"],
    formData["516"],
    formData["517"],
    formData["518"],
    formData["519"],
    formData["520"],
    formData["521"],
    formData["522"],
    formData["523"],
    formData["524"],
    formData["525"],
    formData["526"],
  ]);

  const syncWithStorage = () => {
    if (typeof window !== "undefined") {
      try {
        const storedData = readLocalStorage();
        if (storedData) {
          loadFromStorage(storedData, false);
        }
      } catch (error) {
        logger.error("Error syncing with storage:", error);
      }
    }
  };

  const loadFromStorage = (storedData = null, updateNavigation = true) => {
    try {
      if (typeof window !== "undefined" && !storedData) {
        storedData = readLocalStorage();
      }

      if (!storedData) {
        return null;
      }

      const quizFormData = JSON.parse(storedData);
      if (!quizFormData || typeof quizFormData !== 'object') {
        logger.warn("Invalid mental health form data structure, clearing localStorage");
        localStorage.removeItem("mh-quiz-form-data");
        localStorage.removeItem("mh-quiz-form-data-expiry");
        return null;
      }
      
      let updatedData = null;

      setFormData((prev) => {
        updatedData = { ...prev };

        Object.entries(quizFormData).forEach(([key, value]) => {
          if (
            key !== "last-question-index" &&
            key !== "navigationStack" &&
            key !== "completion_percentage" &&
            key !== "initialDataLoaded"
          ) {
            if (value || value === "") {
              updatedData[key] = value;
            }
          }
        });

        updatedData.entrykey = prev.entrykey || quizFormData.entrykey || "";
        updatedData.initialDataLoaded =
          prev.initialDataLoaded || quizFormData.initialDataLoaded || false;

        return updatedData;
      });

      if (updateNavigation) {
        if (quizFormData["last-question-index"]) {
          const storedPage = parseInt(quizFormData["last-question-index"]);
          
          if (isNaN(storedPage) || storedPage < 1 || storedPage > 35) {
            logger.warn(`Invalid page number ${storedPage} for mental health, resetting to page 1`);
            setCurrentPage(1);
            setProgress(0);
            return updatedData;
          }
          
          setCurrentPage(storedPage);

          const calculatedProgress = calculateProgress(storedPage);
          setProgress(calculatedProgress);
        }

        if (quizFormData.navigationStack) {
          const navStack =
            typeof quizFormData.navigationStack === "string"
              ? quizFormData.navigationStack
                  .split(",")
                  .filter((v) => v)
                  .map((v) => Number(v))
              : quizFormData.navigationStack;
          setQuestionsStack(navStack);
        }
      }

      return updatedData;
    } catch (error) {
      logger.error("Error parsing stored quiz data:", error);
    }
  };

  const readLocalStorage = () => {
    if (typeof window !== "undefined") {
      const now = new Date();
      const ttl = localStorage.getItem("mh-quiz-form-data-expiry");

      if (ttl && now.getTime() < parseInt(ttl)) {
        return localStorage.getItem("mh-quiz-form-data");
      } else {
        localStorage.removeItem("mh-quiz-form-data");
        localStorage.removeItem("mh-quiz-form-data-expiry");
      }
    }
    return null;
  };

  const updateLocalStorage = (dataToStore = formData) => {
    if (typeof window !== "undefined") {
      const now = new Date();
      const ttl = now.getTime() + 1000 * 60 * 60;

      const dataToSave = {
        ...dataToStore,
        "last-question-index": currentPage,
        navigationStack: questionsStack.join(","),
        completion_percentage: progress,
      };

      try {
        localStorage.setItem("mh-quiz-form-data", JSON.stringify(dataToSave));
        localStorage.setItem("mh-quiz-form-data-expiry", ttl.toString());
        return true;
      } catch (error) {
        logger.error("Error storing data in storage:", error);
        return false;
      }
    }
    return false;
  };

  const calculateProgress = (questionIndex) => {
    const totalQuestions = 37;
    if (questionIndex <= 5) {
      const initialProgress = 10 + (questionIndex - 1) * 1;
      return initialProgress;
    }
    const newProgress = Math.ceil((questionIndex / totalQuestions) * 100);
    return Math.max(15, Math.min(newProgress, 100));
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [field]: value,
      };

      if (
        field.startsWith("l-") &&
        field.includes("_") &&
        field.includes("-")
      ) {
        const hyphenField = field.replace(/_/g, "-");
        updatedData[hyphenField] = value;
      }

      if (field.includes("_") && !field.startsWith("l-")) {
        const [questionId, optionId] = field.split("_");
      }

      if (field >= "511" && field <= "526") {
        if (field >= "511" && field <= "519") {
          calculatePHQ9Score();
        } else {
          calculateGAD7Score();
        }
      }

      updateLocalStorage(updatedData);
      return updatedData;
    });
  };

  const calculatePHQ9Score = () => {
    const phq9Fields = [
      "511",
      "512",
      "513",
      "514",
      "515",
      "516",
      "517",
      "518",
      "519",
    ];
    let score = 0;

    phq9Fields.forEach((field) => {
      const answer = formData[field];
      if (!answer) return;

      switch (answer) {
        case "Not at all":
          score += 0;
          break;
        case "Several Days":
          score += 1;
          break;
        case "More than half the days":
          score += 2;
          break;
        case "Nearly every day":
          score += 3;
          break;
      }
    });

    setFormData((prev) => ({
      ...prev,
      phq9_score: score,
    }));

    return score;
  };

  const calculateGAD7Score = () => {
    const gad7Fields = ["520", "521", "522", "523", "524", "525", "526"];
    let score = 0;

    gad7Fields.forEach((field) => {
      const answer = formData[field];
      if (!answer) return;

      switch (answer) {
        case "Not at all":
          score += 0;
          break;
        case "Several Days":
          score += 1;
          break;
        case "More than half the days":
          score += 2;
          break;
        case "Nearly every day":
          score += 3;
          break;
      }
    });

    setFormData((prev) => ({
      ...prev,
      gad7_score: score,
    }));

    return score;
  };

  const submitFormData = async (specificData = null) => {
    try {
      const dataToSubmit = {
        ...formData,
        "last-question-index": currentPage,
        completion_percentage: progress,
        navigationStack: questionsStack.join(","),
        ...(specificData || {}),
      };

      const response = await fetch("/api/mental-health", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSubmit),
        credentials: "include",
      });

      const data = await response.json();

      if (typeof window !== "undefined") {
        const loaderElement = document.getElementById(
          "please-wait-loader-overlay"
        );
        if (loaderElement) {
          loaderElement.classList.add("hidden");
        }
      }

      if (data.error) {
        logger.error("Form submission error:", data.msg || data.error_message);
        return null;
      }

      const currentNavigationState = {
        currentPage: currentPage,
        questionsStack: [...questionsStack],
      };

      setFormData((prev) => {
        const updatedData = {
          ...prev,
          id: data.id || prev.id,
          token: data.token || prev.token,
          entrykey: data.entrykey || prev.entrykey,
          ...(specificData || {}),
        };

        const dataToStore = {
          ...updatedData,
          "last-question-index": currentNavigationState.currentPage,
          navigationStack: currentNavigationState.questionsStack.join(","),
        };

        if (typeof window !== "undefined") {
          const now = new Date();
          const ttl = now.getTime() + 1000 * 60 * 60;
          localStorage.setItem(
            "mh-quiz-form-data",
            JSON.stringify(dataToStore)
          );
          localStorage.setItem("mh-quiz-form-data-expiry", ttl.toString());
        }

        return updatedData;
      });

      return data;
    } catch (error) {
      logger.error("Error submitting form:", error);
      return null;
    }
  };

  return {
    formData,
    setFormData,
    currentPage,
    setCurrentPage,
    progress,
    setProgress,
    questionsStack,
    setQuestionsStack,
    isMovingForward,
    setIsMovingForward,
    handleFormChange,
    calculateProgress,
    submitFormData,
    updateLocalStorage,
    calculatePHQ9Score,
    calculateGAD7Score,
  };
};
