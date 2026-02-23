"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter } from "next/navigation";
import QuestionnaireNavbar from "../EdQuestionnaire/QuestionnaireNavbar";
import { ProgressBar } from "../EdQuestionnaire/ProgressBar";
import { WarningPopup } from "../EdQuestionnaire/WarningPopup";
import { mhFlowAddToCart } from "@/utils/flowCartHandler";
import Image from "next/image";
import DOBInput from "../shared/DOBInput";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";

const MHPreConsultation = () => {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  useQuestionnaireStepTracking({
    questionnaireId: "mh-pre-consultation",
    stepId: currentPage,
    stepIndex: currentPage,
    flowId: "mental-health",
    stepType: "pre-consultation",
  });

  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [province, setProvince] = useState("");
  const [hearSeeOption, setHearSeeOption] = useState(null);
  const [watchingHurtOption, setWatchingHurtOption] = useState(null);
  const [specialAbilitiesOption, setSpecialAbilitiesOption] = useState(null);
  const [mentalHealthOption, setMentalHealthOption] = useState(null);
  const [unusualBehaviorOptions, setUnusualBehaviorOptions] = useState([]);
  const [harmDesireOption, setHarmDesireOption] = useState(null);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRejected, setIsRejected] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showAgePopup, setShowAgePopup] = useState(false);

  const maxPage = 7;

  const BACKGROUND_IMAGES = {
    MOBILE: {
      YES: "https://myrocky.b-cdn.net/WP%20Images/Questionnaire/MH-Mb-Y.png",
      NO: "https://myrocky.b-cdn.net/WP%20Images/Questionnaire/MH-Mb-N.png",
    },
    DESKTOP: {
      YES: "https://myrocky.b-cdn.net/WP%20Images/Questionnaire/MH-Accept.png",
      NO: "https://myrocky.b-cdn.net/WP%20Images/Questionnaire/MH-Reject.png",
    },
  };

  const [navStack, setNavStack] = useState([]);
  const progress = Math.max(10, Math.ceil((currentPage / maxPage) * 100));

  const handleBackClick = () => {
    if (navStack.length > 0) {
      const previousPage = navStack[navStack.length - 1];
      setNavStack(navStack.slice(0, -1));
      setCurrentPage(previousPage);
    }
  };

  useEffect(() => {
    if (currentPage === 8) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 8) {
      const shouldReject =
        hearSeeOption === "Yes" ||
        watchingHurtOption === "Yes" ||
        specialAbilitiesOption === "Yes" ||
        mentalHealthOption !== "None of the above applies to me" ||
        unusualBehaviorOptions.some(
          (o) => o !== "None of the above applies to me"
        ) ||
        harmDesireOption === "Yes";

      setIsRejected(shouldReject);

      if (shouldReject) {
        if (hearSeeOption === "Yes") {
          setRejectionReason(determineRejectionReason("hear_see", "Yes"));
        } else if (watchingHurtOption === "Yes") {
          setRejectionReason(determineRejectionReason("watching_hurt", "Yes"));
        } else if (specialAbilitiesOption === "Yes") {
          setRejectionReason(
            determineRejectionReason("special_abilities", "Yes")
          );
        } else if (mentalHealthOption !== "None of the above applies to me") {
          setRejectionReason(
            determineRejectionReason("mental_health", mentalHealthOption)
          );
        } else if (
          unusualBehaviorOptions.some(
            (o) => o !== "None of the above applies to me"
          )
        ) {
          setRejectionReason(
            determineRejectionReason("unusual_behavior", "Yes")
          );
        } else if (harmDesireOption === "Yes") {
          setRejectionReason(determineRejectionReason("harm_desire", "Yes"));
        }
      }
    }
  }, [
    currentPage,
    hearSeeOption,
    watchingHurtOption,
    specialAbilitiesOption,
    mentalHealthOption,
    unusualBehaviorOptions,
    harmDesireOption,
  ]);

  const handleUnusualBehavior = (option) => {
    setUnusualBehaviorOptions((prev) => {
      if (option === "None of the above applies to me") {
        return [option];
      }

      const newOptions = prev.filter(
        (o) => o !== "None of the above applies to me"
      );
      return prev.includes(option)
        ? newOptions.filter((o) => o !== option)
        : [...newOptions, option];
    });
  };

  const determineRejectionReason = (questionType, option) => {
    if (questionType === "age" && getAge(dateOfBirth) < 18) {
      return "Sorry, but we are not able to service you as this service is for adults only.";
    } else if (questionType === "province" && !province) {
      return "Please select your province to continue.";
    } else {
      return "Thank you for answering these questions. Based on your responses we do not think virtual care would provide you with the best possible care. We encourage you to speak with your doctor or visit your local walk-in clinic for further assistance. If this is an emergency, please visit your local ER.";
    }
  };

  const handleOptionSelect = (questionType, option) => {
    switch (questionType) {
      case "hear_see":
        setHearSeeOption(option);
        break;
      case "watching_hurt":
        setWatchingHurtOption(option);
        break;
      case "special_abilities":
        setSpecialAbilitiesOption(option);
        break;
      case "mental_health":
        setMentalHealthOption(option);
        break;
      case "unusual_behavior":
        handleUnusualBehavior(option);
        return;
      case "harm_desire":
        setHarmDesireOption(option);
        break;
    }

    if (currentPage < 8) {
      setNavStack((prev) => [...prev, currentPage]);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handleContinue = () => {
    if (currentPage === 1) {
      const age = getAge(dateOfBirth);
      const isValidProvince = province && province.trim() !== "";

      if (age < 18) {
        setRejectionReason(determineRejectionReason("age"));
        setIsRejected(true);
        setShowAgePopup(true);
        return;
      } else if (!isValidProvince) {
        setRejectionReason(determineRejectionReason("province"));
        setIsRejected(true);
      }
    }

    if (currentPage === 7) {
      setNavStack((prev) => [...prev, currentPage]);
      setCurrentPage(8);
      return;
    }

    if (currentPage < 8) {
      setNavStack((prev) => [...prev, currentPage]);
      setCurrentPage((prev) => prev + 1);
    }
  };

  const getAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const PrivacyText = () => (
    <p className="text-xs text-gray-500  my-6">
      We respect your privacy. All of your information is securely stored on our
      HIPAA Compliant server.
    </p>
  );

  const ContinueButton = ({ currentPage, isDisabled, handleContinue }) => {
    const getButtonText = () => {
      if (currentPage === 8) {
        return isRejected ? "Return Home" : "Continue to Consultation";
      }
      return "Continue";
    };

    const getDisabledState = () => {
      switch (currentPage) {
        case 1:
          return !dateOfBirth || !province;
        case 2:
          return !hearSeeOption;
        case 3:
          return !watchingHurtOption;
        case 4:
          return !specialAbilitiesOption;
        case 5:
          return !mentalHealthOption;
        case 6:
          return unusualBehaviorOptions.length === 0;
        case 7:
          return !harmDesireOption;
        default:
          return false;
      }
    };

    return (
      <div className="md:mb-2 fixed bottom-0 left-0 right-0 md:static bg-white p-4 md:p-0 pb-6 md:pb-0">
        <div className="w-full mx-auto">
          <PrivacyText />
          <button
            onClick={handleContinue}
            disabled={getDisabledState()}
            className={`w-full py-3 px-4 rounded-full font-medium mt-4
                            ${
                              getDisabledState()
                                ? "bg-gray-300 text-gray-500"
                                : "bg-black text-white hover:bg-gray-900"
                            }`}
          >
            {getButtonText()}
          </button>
        </div>
      </div>
    );
  };

  const handleDateChange = (value) => {
    setDateOfBirth(value);
  };

  // Loading overlay
  if (isCheckoutLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]">
        <div className="bg-white p-8 rounded-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-lg font-medium">Adding to Cart...</p>
          <p className="text-sm text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white subheaders-font font-medium">
      <QuestionnaireNavbar
        onBackClick={handleBackClick}
        currentPage={currentPage}
      />
      {currentPage !== 8 && <ProgressBar progress={progress} />}

      <div className="quiz-page-wrapper relative w-full md:w-[520px] px-5 md:px-0 mx-auto bg-[#FFFFFF]">
        {currentPage === 1 && (
          <div className="w-full md:w-[520px] mx-auto  mt-6">
            <div className="mb-8">
              <h2 className="text-2xl mb-6 font-semibold md:text-center">
                Let's make sure you're eligible for treatment
              </h2>

              <div className="mb-8">
                <label className="block md:text-center text-[#C19A6B] text-sm mb-2">
                  1. My birth date is
                </label>
                {/* <input
                  type="date"
                  className="w-full p-3 border border-gray-200 rounded-lg text-center bg-white"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  placeholder="mm/dd/yyyy"
                /> */}

                <DOBInput
                  value={dateOfBirth}
                  onChange={handleDateChange}
                  className="w-full p-3 border border-gray-200 rounded-lg text-center bg-white"
                  placeholder="MM/DD/YYYY"
                  minAge={18}
                  required
                />
              </div>

              <div className="mb-8">
                <label className="block md:text-center text-[#C19A6B] text-sm mb-2">
                  2. We currently provide our Mental Health Service in Alberta,
                  British Columbia, Manitoba, Ontario, Quebec, and Saskatchewan.
                  Please select your province
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors focus:border-[#814B00] focus:outline-none"
                >
                  <option value="">Select your province</option>
                  {[
                    "Alberta",
                    "British Columbia",
                    "Manitoba",
                    "Ontario",
                    "Quebec",
                    "Saskatchewan",
                  ].map((loc, index) => (
                    <option key={index} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {showAgePopup && (
              <WarningPopup
                isOpen={showAgePopup}
                onClose={() => {
                  setShowAgePopup(false);
                }}
                message="Sorry, but we are not able to service you as this service is for adults only."
                acknowledgeLabel=""
                isAcknowledged={true}
                showCheckbox={false}
                hideDefaultButton={false}
                buttonText="Ok, I understand"
                currentPage={currentPage}
              />
            )}
          </div>
        )}

        {currentPage === 2 && (
          <div className="w-full md:w-[520px] mx-auto  mt-6">
            <div className="mb-8">
              <h2 className="text-2xl mb-6 font-semibold md:text-center">
                Do you ever hear things other people don't hear or see things
                other people don't see?
              </h2>

              <div className="space-y-3">
                {["Yes", "No"].map((option, index) => (
                  <div key={index} className="relative w-full mb-3">
                    <input
                      id={`hear_see_${index}`}
                      type="radio"
                      name="hear_see"
                      value={option}
                      onChange={() => handleOptionSelect("hear_see", option)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <label
                      htmlFor={`hear_see_${index}`}
                      className={`block w-full p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                                            ${
                                              hearSeeOption === option
                                                ? "border-[#814B00] bg-gray-50"
                                                : ""
                                            }`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 3 && (
          <div className="w-full md:w-[520px] mx-auto  mt-6">
            <div className="mb-8">
              <h2 className="text-2xl mb-6 font-semibold md:text-center">
                Do you ever feel that someone is watching you or trying to hurt
                you?
              </h2>

              <div className="space-y-3">
                {["Yes", "No"].map((option, index) => (
                  <div key={index} className="relative w-full mb-3">
                    <input
                      id={`watching_hurt_${index}`}
                      type="radio"
                      name="watching_hurt"
                      value={option}
                      onChange={() =>
                        handleOptionSelect("watching_hurt", option)
                      }
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <label
                      htmlFor={`watching_hurt_${index}`}
                      className={`block w-full p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                                            ${
                                              watchingHurtOption === option
                                                ? "border-[#814B00] bg-gray-50"
                                                : ""
                                            }`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 4 && (
          <div className="w-full md:w-[520px] mx-auto  mt-6">
            <div className="mb-8">
              <h2 className="text-2xl mb-6 font-semibold md:text-center">
                Do you have any special abilities or powers that other humans
                don't possess?
              </h2>

              <div className="space-y-3">
                {["Yes", "No"].map((option, index) => (
                  <div key={index} className="relative w-full mb-3">
                    <input
                      id={`special_abilities_${index}`}
                      type="radio"
                      name="special_abilities"
                      value={option}
                      onChange={() =>
                        handleOptionSelect("special_abilities", option)
                      }
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <label
                      htmlFor={`special_abilities_${index}`}
                      className={`block w-full p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                                ${
                                  specialAbilitiesOption === option
                                    ? "border-[#814B00] bg-gray-50"
                                    : ""
                                }`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 5 && (
          <div className="w-full md:w-[520px] mx-auto  mt-6 ">
            <div className="pb-[185px] md:pb-5">
              <h2 className="text-2xl mb-6 font-semibold md:text-center">
                Have you been diagnosed or have a history of any of the
                following mental health conditions?
              </h2>

              <div
                className="space-y-3  overflow-y-auto 
                [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] 
                [scrollbar-width:none]"
              >
                {[
                  "Bipolar disorder",
                  "Psychosis",
                  "Schizophrenia or schizoaffective disorder",
                  "Anorexia or bulimia",
                  "Binge eating",
                  "Borderline personality disorder",
                  "Serotonin syndrome",
                  "Psychiatric hospitalization within the last 3 months",
                  "Psychiatric hospitalization more than 3 months ago",
                  "Moderate to severe substance or alcohol abuse",
                  "None of the above applies to me",
                ].map((option, index) => (
                  <div key={index} className="relative w-full mb-3">
                    <input
                      id={`mental_health_${index}`}
                      type="radio"
                      name="mental_health"
                      value={option}
                      onChange={() =>
                        handleOptionSelect("mental_health", option)
                      }
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <label
                      htmlFor={`mental_health_${index}`}
                      className={`block w-full p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                                            ${
                                              mentalHealthOption === option
                                                ? "border-[#814B00] bg-gray-50"
                                                : ""
                                            }`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 6 && (
          <div className="w-full md:w-[520px] mx-auto  mt-6">
            <div className="mb-8">
              <h2 className="text-2xl mb-6 font-semibold md:text-center">
                Has there ever been a period of time when you were not your
                usual self and...
              </h2>

              <div className="space-y-3">
                {[
                  "You felt so good or so hyper that other people thought you were not your normal self or you were so hyper that you got into trouble?",
                  "You got much less sleep than usual and found you didn't really miss it",
                  "You did things that were unusual for you or that other people might have thought were excessive, foolish, or risky?",
                  "None of the above applies to me",
                ].map((option, index) => (
                  <div key={index} className="relative w-full mb-3">
                    <input
                      id={`unusual_behavior_${index}`}
                      type="checkbox"
                      name="unusual_behavior"
                      value={option}
                      onChange={() =>
                        handleOptionSelect("unusual_behavior", option)
                      }
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <label
                      htmlFor={`unusual_behavior_${index}`}
                      className={`block w-full p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                                ${
                                  unusualBehaviorOptions.includes(option)
                                    ? "border-[#814B00] bg-gray-50"
                                    : ""
                                }`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 7 && (
          <div className="w-full md:w-[520px] mx-auto mt-6">
            <div className="mb-8">
              <h2 className="text-2xl mb-6 font-semibold md:text-center">
                Do you currently have any desire to harm yourself or others?
              </h2>

              <div className="space-y-3">
                {["Yes", "No"].map((option, index) => (
                  <div key={index} className="relative w-full mb-3">
                    <input
                      id={`harm_desire_${index}`}
                      type="radio"
                      name="harm_desire"
                      value={option}
                      onChange={() => handleOptionSelect("harm_desire", option)}
                      className="absolute opacity-0 w-full h-full cursor-pointer"
                    />
                    <label
                      htmlFor={`harm_desire_${index}`}
                      className={`block w-full p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors
                                ${
                                  harmDesireOption === option
                                    ? "border-[#814B00] bg-gray-50"
                                    : ""
                                }`}
                    >
                      {option}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {currentPage === 8 && (
          <div className="fixed inset-0 w-full min-h-screen">
            <div className="absolute inset-0">
              <div className="block md:hidden">
                <Image
                  src={
                    isRejected
                      ? BACKGROUND_IMAGES.MOBILE.NO
                      : BACKGROUND_IMAGES.MOBILE.YES
                  }
                  alt=""
                  fill
                  priority
                  quality={100}
                  className="object-cover"
                />
              </div>
              <div className="hidden md:block">
                <Image
                  src={
                    isRejected
                      ? BACKGROUND_IMAGES.DESKTOP.NO
                      : BACKGROUND_IMAGES.DESKTOP.YES
                  }
                  alt=""
                  fill
                  priority
                  quality={100}
                  className="object-cover"
                />
              </div>
            </div>

            <div className="relative z-10 flex flex-col justify-between w-full h-full">
              <div className="flex-1 flex items-center justify-center">
                <div className="w-full max-w-[520px] mx-auto px-4">
                  <div className="text-center">
                    {isRejected ? (
                      <>
                        <h2 className="text-2xl mb-6 font-semibold text-[#C19A6B]">
                          Thank you!
                        </h2>
                        <p className="text-gray-600 mb-4">
                          {rejectionReason ||
                            "Thank you for answering these questions. Based on your responses we do not think virtual care would provide you with the best possible care. We encourage you to speak with your doctor or visit your local walk-in clinic for further assistance. If this is an emergency, please visit your local ER."}
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-4xl mb-6 font-semibold text-[#C19A6B]">
                          Thank you!
                        </h2>
                        <p className="text-gray-600 mb-8">
                          Thank you for answering these questions, we think you
                          would be a good fit for virtual care. You will now be
                          taken to the checkout page. Once completed, a medical
                          questionnaire will follow which will be assessed by a
                          clinician.
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="pb-8 px-4">
                <div className="w-full md:w-[520px] mx-auto">
                  <button
                    onClick={async () => {
                      if (isRejected) {
                        router.push("/");
                        return;
                      }

                      try {
                        setIsCheckoutLoading(true);

                        // MH consultation product (ID: 103808)
                        const mainProduct = {
                          id: "103808",
                          name: "Mental Health Consultation",
                          price: 0, // Consultation is typically free
                          quantity: 1,
                          isSubscription: false,
                        };

                        logger.log("MH main product:", mainProduct);

                        // Use the new direct cart handler
                        const result = await mhFlowAddToCart(mainProduct, [], {
                          requireConsultation: true,
                        });

                        if (result.success) {
                          setIsCheckoutLoading(false);
                          router.push(result.redirectUrl);
                        } else {
                          logger.error("MH checkout failed:", result.error);
                          setIsCheckoutLoading(false);
                          alert(
                            "There was an issue processing your checkout. Please try again."
                          );
                        }
                      } catch (error) {
                        logger.error("Error in MH checkout process:", error);
                        setIsCheckoutLoading(false);
                        alert(
                          "There was an issue processing your checkout. Please try again."
                        );
                      }
                    }}
                    className="w-full py-3 px-4 rounded-full font-medium bg-white text-black hover:bg-gray-100"
                    disabled={isCheckoutLoading}
                  >
                    {isCheckoutLoading
                      ? "Processing..."
                      : isRejected
                      ? "Go Back Home"
                      : "Proceed To Checkout"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {currentPage !== 8 && (
          <ContinueButton
            currentPage={currentPage}
            handleContinue={handleContinue}
          />
        )}
      </div>
    </div>
  );
};

export default MHPreConsultation;
