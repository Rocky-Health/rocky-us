"use client";

import { useEffect, useState, useRef } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter } from "next/navigation";
import QuestionnaireNavbar from "../EdQuestionnaire/QuestionnaireNavbar";
import { ProgressBar } from "../EdQuestionnaire/ProgressBar";
import { useMentalHealthForm } from "./hooks/useMentalHealthForm";
import { useFormValidation } from "./hooks/useFormValidation";
import { useWarningPopups } from "./hooks/useWarningPopups";
import { usePhotoIdHandling } from "./hooks/usePhotoIdHandling";
import { QuestionnaireForm } from "./components/QuestionnaireForm";
import { ContinueButton } from "./components/ContinueButton";
import { QuestionnaireWarningPopups } from "./components/WarningPopups";
import { VALIDATION_RULES, QUESTION_CONFIG } from "./constants";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";

const RADIO_BUTTON_QUESTIONS = [
  1, 2, 5, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
  29, 30, 31, 33, 34, 35,
];

export default function MentalHealthQuestionnaire({
  pn,
  userName,
  userEmail,
  province,
  dob,
}) {
  const router = useRouter();
  const [showLoader, setShowLoader] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    formData,
    currentPage,
    progress,
    questionsStack,
    isMovingForward,
    handleFormChange,
    calculateProgress,
    submitFormData,
    setCurrentPage,
    setProgress,
    setQuestionsStack,
    setIsMovingForward,
    calculatePHQ9Score,
    calculateGAD7Score,
  } = useMentalHealthForm({ userName, userEmail, pn, province, dob });

  useQuestionnaireStepTracking({
    questionnaireId: "mental-health",
    stepId: currentPage,
    stepIndex: currentPage,
    flowId: "mental-health",
    stepType: "quiz",
    isPostPurchaseConsultation: true,
  });

  const {
    formRef,
    inputFieldsValid,
    setInputFieldsValid,
    validateMedicationFields,
    showError,
    hideError,
    clearError,
    isValidated,
  } = useFormValidation();

  const {
    showSuicidalWarning,
    showHighAnxietyWarning,
    showHighDepressionWarning,
    showCompletionWarning,
    isAcknowledged,
    setShowSuicidalWarning,
    setShowHighAnxietyWarning,
    setShowHighDepressionWarning,
    setShowCompletionWarning,
    handleAcknowledge,
    canCloseCurrentWarning,
    isSuicidalWarningAcknowledged,
    isDepressionWarningAcknowledged,
    isAnxietyWarningAcknowledged,
    clearAllWarningStates,
  } = useWarningPopups(
    formData,
    currentPage,
    calculatePHQ9Score,
    calculateGAD7Score
  );
  const {
    photoIdFile,
    photoIdAcknowledged,
    showPhotoIdPopup,
    isUploading,
    fileInputRef,
    handlePhotoIdAcknowledge,
    handleTapToUpload,
    handlePhotoIdFileSelect,
    handlePhotoIdUpload,
  } = usePhotoIdHandling(
    formData,
    handleFormChange,
    submitFormData,
    clearError,
    setUploadProgress
  );
  const [showContinueButton, setShowContinueButton] = useState(true);
  const [cameFromBack, setCameFromBack] = useState(false);
  const [firstName, setFirstName] = useState(formData.legal_first_name || "");
  const [lastName, setLastName] = useState(formData.legal_last_name || "");

  const isRadioButtonQuestion = RADIO_BUTTON_QUESTIONS.includes(currentPage);
  const isQuestionThreeWithOther =
    currentPage === 3 && formData["503"] === "Other";

  const isHandlingPopState = useRef(false);
  const isIntentionalNavigationRef = useRef(false);
  const isShowingPopupRef = useRef(false);

  useEffect(() => {
    const validationListener = (event) => {
      if (event.detail && event.detail.questionId) {
        setInputFieldsValid(event.detail.isValid);
      }
    };

    document.addEventListener("questionValidationChange", validationListener);
    return () => {
      document.removeEventListener(
        "questionValidationChange",
        validationListener
      );
    };
  }, []);
  useEffect(() => {
    if (currentPage === 37) {
      setShowContinueButton(false);
      return;
    }

    if (currentPage >= 11 && currentPage <= 26) {
      const questionId = currentPage.toString();
      const hasAnswer = !!formData[questionId];

      const shouldShow = cameFromBack || hasAnswer;
      setShowContinueButton(shouldShow);
      return;
    }

    if (cameFromBack) {
      setShowContinueButton(true);
      return;
    }
    if (cameFromBack) {
      setShowContinueButton(true);
    } else {
      if (currentPage === 3 && formData["503"] === "Other") {
        setShowContinueButton(true);
      } else if (currentPage === 4 && formData["504"] === "Something else") {
        setShowContinueButton(true);
      } else if (currentPage === 5 && formData["505"]) {
        setShowContinueButton(true);
      } else if (currentPage === 8) {
        setShowContinueButton(true);
      } else if (currentPage === 9) {
        setShowContinueButton(true);
      } else if (currentPage === 10) {
        setShowContinueButton(!!formData["510"]);
      } else if (currentPage === 27) {
        const anyMedicationSelected =
          formData["527_1"] ||
          formData["527_2"] ||
          formData["527_3"] ||
          formData["527_4"] ||
          formData["527_5"] ||
          formData["527_6"] ||
          formData["527_7"] ||
          formData["527_8"];
        setShowContinueButton(!!anyMedicationSelected);
      } else if (currentPage === 28) {
        const anyMedicalConditionSelected =
          formData["528_1"] ||
          formData["528_2"] ||
          formData["528_3"] ||
          formData["528_4"] ||
          formData["528_5"] ||
          formData["528_6"] ||
          formData["528_7"] ||
          formData["528_8"] ||
          formData["528_9"];
        setShowContinueButton(!!anyMedicalConditionSelected);
      } else if (currentPage === 29) {
        setShowContinueButton(!!formData["529"]);
      } else if (currentPage === 30) {
        setShowContinueButton(formData["530"] === "Yes");
      } else if (currentPage === 31) {
        setShowContinueButton(formData["531"] === "Yes");
      } else if (currentPage === 32) {
        setShowContinueButton(!!formData["532"]);
      } else if (currentPage === 33) {
        const anyDrugSelected =
          formData["533_1"] ||
          formData["533_2"] ||
          formData["533_3"] ||
          formData["533_4"] ||
          formData["533_5"] ||
          formData["533_6"];
        setShowContinueButton(!!anyDrugSelected);
      } else if (currentPage === 34) {
        const hasSelection = !!formData["538"];
        const hasText =
          formData["538"] === "Yes"
            ? !!formData["539"] && formData["539"].trim() !== ""
            : true;
        setShowContinueButton(hasSelection && hasText);
      } else if (currentPage === 35) {
        setShowContinueButton(true);
      } else {
        setShowContinueButton(currentPage === 1 || !isRadioButtonQuestion);
      }
    }
  }, [currentPage, cameFromBack, isRadioButtonQuestion, formData]);

  useEffect(() => {
    if (currentPage === 33) {
      const anyDrugSelected =
        formData["533_1"] ||
        formData["533_2"] ||
        formData["533_3"] ||
        formData["533_4"] ||
        formData["533_5"] ||
        formData["533_6"];
      setShowContinueButton(!!anyDrugSelected);
    }
  }, [formData, currentPage]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentPage]);

  useEffect(() => {
    window.history.replaceState(
      { page: currentPage },
      "",
      window.location.pathname
    );

    const handleForwardNavigation = () => {
      if (currentPage > 1 && !isHandlingPopState.current) {
        window.history.pushState(
          { page: currentPage },
          "",
          window.location.pathname
        );
      }
    };

    const handlePopState = (event) => {
      if (isHandlingPopState.current) return;

      isHandlingPopState.current = true;

      if (showSuicidalWarning) {
        if (isSuicidalWarningAcknowledged()) {
          setShowSuicidalWarning(false);
        }

        window.history.pushState(
          { page: currentPage },
          "",
          window.location.pathname
        );

        setTimeout(() => {
          isHandlingPopState.current = false;
        }, 100);
        return;
      }

      if (showHighDepressionWarning) {
        if (isDepressionWarningAcknowledged()) {
          setShowHighDepressionWarning(false);
        }

        window.history.pushState(
          { page: currentPage },
          "",
          window.location.pathname
        );

        setTimeout(() => {
          isHandlingPopState.current = false;
        }, 100);
        return;
      }

      if (showHighAnxietyWarning) {
        if (isAnxietyWarningAcknowledged()) {
          setShowHighAnxietyWarning(false);
        }

        window.history.pushState(
          { page: currentPage },
          "",
          window.location.pathname
        );

        setTimeout(() => {
          isHandlingPopState.current = false;
        }, 100);
        return;
      }

      if (!isIntentionalNavigationRef.current) {
        moveToPreviousSlide();
      }

      setTimeout(() => {
        isHandlingPopState.current = false;
        isIntentionalNavigationRef.current = false;
      }, 50);
    };

    window.addEventListener("popstate", handlePopState);

    if (currentPage > 1) {
      handleForwardNavigation();
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [
    currentPage,
    showSuicidalWarning,
    showHighAnxietyWarning,
    showHighDepressionWarning,
  ]);

  const handleBackClick = () => {
    if (showSuicidalWarning) {
      if (isSuicidalWarningAcknowledged()) {
        setShowSuicidalWarning(false);
      }
      return;
    }

    if (showHighDepressionWarning) {
      if (isDepressionWarningAcknowledged()) {
        setShowHighDepressionWarning(false);
      }
      return;
    }

    if (showHighAnxietyWarning) {
      if (isAnxietyWarningAcknowledged()) {
        setShowHighAnxietyWarning(false);
      }
      return;
    }

    setCameFromBack(true);
    moveToPreviousSlide();
  };

  const moveToNextSlide = async () => {
    if (cameFromBack) {
      setCameFromBack(false);
    }

    if (currentPage === 1) {
      const currentSituation = formData["501"];

      if (
        currentSituation ===
        "I'm currently on medications and want to get it from MyRocky"
      ) {
        const hasMedicationName =
          formData["l-501_1-input"] || formData["l-501-1-input"];
        const hasPrescriberInfo =
          formData["l-501_1-textarea"] || formData["l-501-1-textarea"];

        if (!hasMedicationName || !hasPrescriberInfo) {
          showError("Please complete all medication information fields");
          return;
        }
      }

      if (
        currentSituation ===
        "I am not on medication for mental health but have been in the past"
      ) {
        const hasMedicationName =
          formData["l-501_3-input"] || formData["l-501-3-input"];
        const hasPrescriberInfo =
          formData["l-501_3-textarea"] || formData["l-501-3-textarea"];

        if (!hasMedicationName || !hasPrescriberInfo) {
          showError("Please complete all medication information fields");
          return;
        }
      }

      const loaderElement = document.getElementById(
        "please-wait-loader-overlay"
      );
      if (loaderElement) {
        loaderElement.classList.remove("hidden");
      }
    }

    if (currentPage === 33) {
      const anyDrugSelected =
        formData["533_1"] ||
        formData["533_2"] ||
        formData["533_3"] ||
        formData["533_4"] ||
        formData["533_5"] ||
        formData["533_6"];

      if (!anyDrugSelected) {
        showError("Please select at least one option");
        return;
      }
    }
    if (
      !isValidated(
        currentPage,
        formData,
        photoIdFile,
        isUploading,
        photoIdAcknowledged
      )
    )
      return;

    isIntentionalNavigationRef.current = true;
    setCameFromBack(false);
    setIsMovingForward(true);

    const nextPage = getNextQuestionId();
    const updatedStack = [...questionsStack, currentPage];
    setQuestionsStack(updatedStack);

    const newProgress = calculateProgress(nextPage);

    try {
      const shouldAwaitSubmission = currentPage === 1 || currentPage >= 36;
      if (currentPage === 4) {
        const feelingsData = {};

        Object.keys(formData).forEach((key) => {
          if (key.startsWith("504_") && formData[key]) {
            feelingsData[key] = formData[key];
          }
        });

        if (formData["l-504_5-textarea"]) {
          feelingsData["l-504_5-textarea"] = formData["l-504_5-textarea"];
        }

        if (shouldAwaitSubmission) {
          await submitFormData(feelingsData);
        } else {
          submitFormData(feelingsData).catch((error) => {
            logger.error("Background form submission error:", error);
          });
        }
      } else {
        if (shouldAwaitSubmission) {
          await submitFormData();
        } else {
          submitFormData().catch((error) => {
            logger.error("Background form submission error:", error);
          });
        }
      }

      window.history.pushState(
        { page: nextPage },
        "",
        window.location.pathname
      );
      setCurrentPage(nextPage);
      setProgress(newProgress);
      setQuestionsStack(updatedStack);
    } catch (error) {
      logger.error("Error submitting form data:", error);
      const loaderElement = document.getElementById(
        "please-wait-loader-overlay"
      );
      if (loaderElement) {
        loaderElement.classList.add("hidden");
      }
    }

    setTimeout(() => {
      isIntentionalNavigationRef.current = false;
    }, 100);
  };
  const moveToPreviousSlide = () => {
    if (questionsStack.length === 0) return;

    setCameFromBack(true);
    setIsMovingForward(false);
    setShowContinueButton(true);

    const newStack = [...questionsStack];
    const prevPage = newStack.pop();

    setQuestionsStack(newStack);
    setCurrentPage(prevPage);

    const newProgress = calculateProgress(prevPage);
    setProgress(newProgress);
  };

  const getNextQuestionId = () => {
    if (currentPage === 1) {
      const selectedOption = formData["501"];
      if (
        selectedOption ===
        "I’m currently on medications and want to get it from MyRocky"
      ) {
        return 9;
      } else if (
        selectedOption ===
        "I'm currently on medication but want to make a change"
      ) {
        return 2;
      } else if (
        selectedOption ===
          "I have never been on medication for mental health before" ||
        selectedOption ===
          "I am not on medication for mental health but have been in the past"
      ) {
        return 4;
      }
    }

    const config = QUESTION_CONFIG[currentPage];
    if (!config) return currentPage + 1;

    if (config.nextQuestions) {
      return config.nextQuestions[formData[currentPage]] || currentPage + 1;
    }

    return config.nextQuestion || currentPage + 1;
  };

  const handleCompletionContinue = () => {
    setShowCompletionWarning(false);
    clearAllWarningStates();
    // Clear localStorage data before redirect
    if (typeof window !== "undefined") {
      localStorage.removeItem("mh-quiz-form-data");
      localStorage.removeItem("mh-quiz-form-data-expiry");
    }
    // Use redirect instead of navigation for MH quiz completion
    window.location.href = "/";
  };
  const handleFormChangeWithAutoAdvance = (field, value) => {
    handleFormChange(field, value);

    if (
      (field === "503" && value === "Other") ||
      (field === "529" && value === "Yes") ||
      (field === "530" && value === "Yes")
    ) {
      setShowContinueButton(true);
      return;
    }

    if (field === "504") {
      return;
    }

    const isPHQ9orGAD7Question = field >= "511" && field <= "526";
    if (isRadioButtonQuestion && !cameFromBack && !isPHQ9orGAD7Question) {
      const updatedFormData = { ...formData, [field]: value };

      if (currentPage === 1) {
        return;
      }

      setTimeout(() => {
        const standardValidation =
          !VALIDATION_RULES[currentPage] ||
          VALIDATION_RULES[currentPage](updatedFormData);
        const specialCaseValid =
          currentPage === 1
            ? validateMedicationFields(currentPage, updatedFormData) &&
              inputFieldsValid
            : true;

        if (standardValidation && specialCaseValid) {
          hideError();

          isIntentionalNavigationRef.current = true;

          setCameFromBack(false);
          setIsMovingForward(true);

          const config = QUESTION_CONFIG[currentPage];
          let nextPage;

          if (
            config &&
            config.nextQuestions &&
            config.nextQuestions[updatedFormData[currentPage]]
          ) {
            nextPage = config.nextQuestions[updatedFormData[currentPage]];
          } else if (config && config.nextQuestion) {
            nextPage = config.nextQuestion;
          } else {
            nextPage = currentPage + 1;
          }

          const updatedStack = [...questionsStack, currentPage];
          setQuestionsStack(updatedStack);

          window.history.pushState(
            { page: nextPage },
            "",
            window.location.pathname
          );

          setCurrentPage(nextPage);

          const newProgress = calculateProgress(nextPage);
          setProgress(newProgress);

          setTimeout(() => {
            if (currentPage === 1 || currentPage >= 36) {
              submitFormData();
            } else {
              submitFormData().catch((error) => {
                logger.error("Background form submission error:", error);
              });
            }

            isIntentionalNavigationRef.current = false;
          }, 100);
        } else {
          if (currentPage === 1 && !specialCaseValid) {
            showError("Please complete the medication information");
          } else if (!standardValidation) {
            showError("Please complete all required fields");
          }
        }
      }, 100);
    } else {
      if (isPHQ9orGAD7Question && value) {
        setShowContinueButton(true);

        setTimeout(() => {
          setFormData((prev) => ({ ...prev, [field]: value }));
        }, 0);
      }

      setTimeout(() => {
        if (currentPage === 1 || currentPage >= 36) {
          submitFormData();
        } else {
          submitFormData().catch((error) => {
            logger.error("Background form submission error:", error);
          });
        }
      }, 100);
    }
  };
  const enhancedHandleFormChange = (field, value) => {
    const isFeelingsQuestion = field.startsWith("504_");
    handleFormChange(field, value);

    if (!isFeelingsQuestion) {
      if (currentPage === 1) {
        setShowContinueButton(!!value);

        const currentSituation = value;
        const needsExtraInput =
          currentSituation ===
            "I'm currently on medications and want to get it from MyRocky" ||
          currentSituation ===
            "I am not on medication for mental health but have been in the past";

        setTimeout(() => {
          const loaderElement = document.getElementById(
            "please-wait-loader-overlay"
          );
          if (loaderElement) {
            loaderElement.classList.add("hidden");
          }

          submitFormData();

          if (needsExtraInput) {
            setShowContinueButton(true);
          }
        }, 100);
      } else {
        setTimeout(() => {
          if (currentPage === 1 || currentPage >= 36) {
            submitFormData();
          } else {
            submitFormData().catch((error) => {
              logger.error("Background form submission error:", error);
            });
          }
        }, 100);
      }
    }
  };

  const handlePhotoUpload = async () => {
    return handlePhotoIdUpload(
      showError,
      setCurrentPage,
      setQuestionsStack,
      questionsStack,
      currentPage,
      setProgress,
      setCameFromBack,
      setIsMovingForward
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <QuestionnaireNavbar
        onBackClick={handleBackClick}
        currentPage={currentPage}
      />
      <ProgressBar progress={progress} />{" "}
      <QuestionnaireForm
        formRef={formRef}
        currentPage={currentPage}
        isMovingForward={isMovingForward}
        formData={formData}
        handleFormChange={handleFormChange}
        handleFormChangeWithAutoAdvance={handleFormChangeWithAutoAdvance}
        enhancedHandleFormChange={enhancedHandleFormChange}
        fileInputRef={fileInputRef}
        photoIdFile={photoIdFile}
        photoIdAcknowledged={photoIdAcknowledged}
        handlePhotoIdAcknowledge={handlePhotoIdAcknowledge}
        handleTapToUpload={handleTapToUpload}
        handlePhotoIdFileSelect={handlePhotoIdFileSelect}
        isUploading={isUploading}
        firstName={firstName}
        lastName={lastName}
        setFirstName={setFirstName}
        setLastName={setLastName}
      />
      <ContinueButton
        showContinueButton={showContinueButton}
        currentPage={currentPage}
        photoIdAcknowledged={photoIdAcknowledged}
        photoIdFile={photoIdFile}
        handlePhotoIdUpload={handlePhotoUpload}
        moveToNextSlide={moveToNextSlide}
      />
      <QuestionnaireWarningPopups
        showSuicidalWarning={showSuicidalWarning}
        showHighDepressionWarning={showHighDepressionWarning}
        showHighAnxietyWarning={showHighAnxietyWarning}
        showCompletionWarning={showCompletionWarning}
        isAcknowledged={isAcknowledged}
        setShowSuicidalWarning={setShowSuicidalWarning}
        setShowHighDepressionWarning={setShowHighDepressionWarning}
        setShowHighAnxietyWarning={setShowHighAnxietyWarning}
        handleAcknowledge={handleAcknowledge}
        handleCompletionContinue={handleCompletionContinue}
        currentPage={currentPage}
        canCloseCurrentWarning={canCloseCurrentWarning}
      />{" "}
      {/* Loader overlay */}
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
            src="https://myrocky.com/wp-content/themes/salient-child/img/preloader-wheel.svg"
            className="block w-[100px] h-auto m-auto pt-6"
            style={{ marginBottom: "10px" }}
            alt="Preloader Wheel"
          />
          Syncing. Please wait ... <br />
          <small style={{ color: "#999", letterSpacing: 0 }}>
            {uploadProgress === 0
              ? "Preparing upload..."
              : `${uploadProgress}% uploaded`}
            <br />
            If this takes longer than 20 seconds, refresh the page.
          </small>
        </p>
      </div>
    </div>
  );
}
