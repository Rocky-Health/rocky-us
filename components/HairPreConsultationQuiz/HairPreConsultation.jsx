"use client";

import { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import { useRouter } from "next/navigation";
import React from "react";
import { ProgressBar } from "../EdQuestionnaire/ProgressBar";
import { QuestionLayout } from "../EdQuestionnaire/QuestionLayout";
import { QuestionOption } from "../EdQuestionnaire/QuestionOption";
import QuestionnaireNavbar from "../EdQuestionnaire/QuestionnaireNavbar";
import { WarningPopup } from "../EdQuestionnaire/WarningPopup";
import DOBInput from "../shared/DOBInput";
import { addToCartDirectly } from "../../utils/flowCartHandler";
import { getConsultationProduct } from "../../utils/hairProductsConfig";
import ProductRecommendationCard from "./ProductRecommendationCard";
import { useQuestionnaireStepTracking } from "@/lib/hooks/useQuestionnaireStepTracking";
import { trackMetaProductSelection, logMetaTrackingError } from "@/utils/metaQuestionnaireTracking";

const HairPreConsultationQuiz = () => {
  // Next.js router for navigation
  const router = useRouter();

  const [currentPage, setCurrentPage] = useState(1);

  useQuestionnaireStepTracking({
    questionnaireId: "hair-pre-consultation",
    stepId: currentPage,
    stepIndex: currentPage,
    flowId: "hair",
    stepType: "pre-consultation",
  });

  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [error137, setError137] = useState("");
  const [error138, setError138] = useState("");
  const [error1, setError1] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [recommendedProduct, setRecommendedProduct] = useState(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);
  const [dateInput, setDateInput] = useState("");
  const [dateValInput, setDateValInput] = useState("");
  const [age, setAge] = useState(null);
  const [cameFromBack, setCameFromBack] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showUnderagePopup, setShowUnderagePopup] = useState(false);

  const maxPage = 8;
  const minAgeValidity = 18;
  const maxAgeValidity = 55;
  const progress = Math.max(10, Math.ceil((currentPage / maxPage) * 100));

  const handleOptionChange = (questionId, value) => {
    if (questionId === 1 && value === "Female") {
      setShowPopup(true);
      return; // Stop further processing
    }

    if (questionId === 137 && error137) setError137("");
    if (questionId === 138 && error138) setError138("");
    if (questionId === 1 && error1) setError1("");

    setAnswers({
      ...answers,
      [questionId]: value,
    });
    setCameFromBack(false); // Reset the flag when an option is selected

    if (currentPage < maxPage) {
      if (questionId === 138 && currentPage === 2) {
        // For question 2 (page 2), always go to page 3 first
        setTimeout(() => {
          setCurrentPage(3);
        }, 300);
      } else {
        setTimeout(() => {
          setCurrentPage(currentPage + 1);
        }, 300);
      }
    }
  };

  const handleDateChange = (value) => {
    // DOBInput returns either "YYYY-MM-DD" format (when valid) or "MM/DD/YYYY" format
    let formattedValue = value;

    // If it's in YYYY-MM-DD format, convert to MM/DD/YYYY
    if (value && value.includes("-") && value.length === 10) {
      const [year, month, day] = value.split("-");
      formattedValue = `${month}/${day}/${year}`;
    }

    setDateValInput(value);
    setDateInput(formattedValue);
    if (error) setError("");

    if (isValidDate(formattedValue)) {
      const calculatedAge = getAge(formattedValue);
      logger.log(
        "Date validation - formattedValue:",
        formattedValue,
        "calculatedAge:",
        calculatedAge
      );
      setAge(calculatedAge);

      if (calculatedAge < minAgeValidity) {
        setShowUnderagePopup(false); // Show popup for underage only on final validation
      } else if (
        calculatedAge >= minAgeValidity &&
        calculatedAge <= maxAgeValidity
      ) {
        setAnswers({
          ...answers,
          158: formattedValue,
        });
      }
    } else {
      logger.log("Date validation failed for:", formattedValue);
    }
  };

  const formatDateInput = (value) => {
    const date = new Date(value);
    const formattedDate = `${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${date
      .getDate()
      .toString()
      .padStart(2, "0")}/${date.getFullYear()}`;
    return formattedDate;

    // const digits = value.replace(/\D/g, "");
    // if (digits.length <= 2) {
    //   return digits;
    // } else if (digits.length <= 4) {
    //   return `${digits.substring(0, 2)}/${digits.substring(2)}`;
    // } else {
    //   return `${digits.substring(0, 2)}/${digits.substring(
    //     2,
    //     4
    //   )}/${digits.substring(4, 8)}`;
    // }
  };

  const isValidDate = (dateString) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateString)) return false;
    const parts = dateString.split("/");
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (
      year < 1900 ||
      year > new Date().getFullYear() ||
      month === 0 ||
      month > 12
    )
      return false;

    const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0)) {
      monthLength[1] = 29;
    }

    return day > 0 && day <= monthLength[month - 1];
  };

  const getAge = (dateString) => {
    const today = new Date();

    // Parse MM/DD/YYYY format properly
    const parts = dateString.split("/");
    const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed in JavaScript Date
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);

    const birthDate = new Date(year, month, day);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const ContinueButton = ({ onClick, disabled = false, text = "Continue" }) => (
    <div className="fixed bottom-0 w-full p-4 bg-white border-t ">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`w-[335px] md:w-[520px] mx-auto bg-black text-white py-3 px-6 rounded-full font-medium ${
          disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-800"
        }`}
      >
        {text}
      </button>
    </div>
  );

  const handleContinue137 = () => {
    if (!answers[137]) {
      setError137("Please select an option to continue.");
      return;
    }
    setError137("");
    handleContinue();
  };

  const handleContinue138 = () => {
    if (!answers[138]) {
      setError138("Please select an option to continue.");
      return;
    }
    setError138("");
    handleContinue();
  };

  const handleContinue1 = () => {
    if (!answers[1]) {
      setError1("Please select an option to continue.");
      return;
    }
    if (answers[1] === "Female") {
      setShowPopup(true);
      return;
    }
    setError1("");
    handleContinue();
  };

  const handleContinue = () => {
    if (currentPage < maxPage) {
      if (
        currentPage === 2 &&
        answers[138] &&
        answers[138] !== "4 or more times a week"
      ) {
        setTimeout(() => {
          setCurrentPage(3);
        }, 300);
      } else {
        setTimeout(() => {
          setCurrentPage(currentPage + 1);
        }, 300);
      }
    }
  };

  const handleDateSubmit = () => {
    if (!age || !isValidDate(dateInput)) {
      setError("Please enter your date of birth.");
      return;
    }
    if (age >= minAgeValidity && age <= maxAgeValidity) {
      setCurrentPage(currentPage + 1);
      setError("");
    } else {
      setError(
        `You are not eligible. Minimum age required is ${minAgeValidity} and max age is ${maxAgeValidity}`
      );
    }
  };

  const handleBackClick = () => {
    if (currentPage > 1) {
      setCameFromBack(true); // Set the flag when back button is clicked
      if (
        currentPage === 4 &&
        answers[138] &&
        answers[138] !== "4 or more times a week"
      ) {
        setCurrentPage(2);
      } else if (currentPage === 4) {
        setCurrentPage(3); // Fix the navigation when coming back from page 4 to page 3
      } else if (currentPage === 7) {
        setShowProducts(false);
        setRecommendedProduct(null);
        setCurrentPage(5);

        logger.log(showProducts);
      } else {
        setCurrentPage(currentPage - 1);
      }
    }
  };

  useEffect(() => {
    if (currentPage === 6) {
      setIsLoading(true);
      setTimeout(() => {
        const product = getRecommendedProduct();
        setRecommendedProduct(product);
        setShowProducts(true);
        setIsLoading(false);
        setCurrentPage(7);
      }, 2000);
    }

    // For page 3, only auto-advance if not coming from back button
    if (currentPage === 3 && !cameFromBack) {
      const timer = setTimeout(() => {
        setCurrentPage(4);
      }, 2000);

      // Clean up the timer if component unmounts or page changes
      return () => clearTimeout(timer);
    }
  }, [currentPage, cameFromBack]);

  const getRecommendedProduct = () => {
    const resultDesired = answers[138];

    try {
      // Get product from centralized configuration
      const product = getConsultationProduct(resultDesired);
      logger.log(
        `🛒 Hair Consultation - Got product for "${resultDesired}":`,
        product
      );
      return product;
    } catch (error) {
      logger.error("Error getting consultation product:", error);
      // Fallback to default if mapping not found
      return getConsultationProduct("Regrowing my hair");
    }
  };

  // Handle checkout with direct cart addition
  const handleCheckout = async () => {
    if (!recommendedProduct) return;

    try {
      trackMetaProductSelection({
        flow_id: "hair",
        questionnaire_id: "hair-pre-consultation",
        content_id: String(recommendedProduct?.id || ""),
        selection_type: "product",
        selection_value: recommendedProduct?.id || "",
      });
    } catch (err) {
      logMetaTrackingError(err, { flow_id: "hair", questionnaire_id: "hair-pre-consultation", milestone: "PRODUCT_SELECTION" });
    }

    setIsCheckoutLoading(true);

    try {
      logger.log(
        "🛒 Hair Pre-Consultation - Recommended Product:",
        recommendedProduct
      );
      const result = await addToCartDirectly(recommendedProduct, [], "hair", {
        requireConsultation: true,
        subscriptionPeriod: recommendedProduct.subscriptionPeriod,
      });

      if (result.success) {
        logger.log("🎉 Hair Pre-Consultation - SUCCESS! Result:", result);

        // Use Next.js navigation instead of window.location.href
        window.location.href = result.redirectUrl;
      } else {
        logger.error("❌ Hair Pre-Consultation - FAILED! Error:", result.error);
        alert(
          result.error ||
            "There was an issue processing your checkout. Please try again."
        );
        setIsCheckoutLoading(false);
      }
    } catch (error) {
      logger.error("Error during hair flow checkout:", error);
      alert("There was an issue processing your checkout. Please try again.");
      setIsCheckoutLoading(false);
    }
  };

  if (showProducts && recommendedProduct) {
    return (
      <div
        className="flex flex-col min-h-screen bg-white subheaders-font font-medium"
        suppressHydrationWarning={true}
      >
        <QuestionnaireNavbar
          onBackClick={handleBackClick}
          currentPage={currentPage}
        />
        <div className="w-full md:w-[520px] mx-auto md:mb-20 px-6 md:px-0 ">
          <div className="progress-indicator mb-2 text-[#A7885A] font-medium">
            <span className="text-sm">Here's what we recommended</span>
          </div>
          <div className="progress-bar-wrapper w-full block h-[8px] my-1 rounded-[10px] bg-gray-200">
            <div
              style={{ width: "100%" }}
              className="progress-bar bg-[#A7885A] rounded-[10px] block float-left h-[8px]"
            ></div>
          </div>

          <div className="product-recommendation-page py-4 ">
            <div className="quiz-heading-wrapper px-3 mx-auto pt-2 pb-0">
              <h2 className="quiz-heading text-[#AE7E56] text-sm text-center">
                Time To Get Growing!
              </h2>
            </div>

            <p className="text-center pt-3 pb-0 text-2xl">We recommend</p>
            <ProductRecommendationCard
              product={recommendedProduct}
              onAddToCart={handleCheckout}
              isLoading={isCheckoutLoading}
            />
            <p className="text-left  mb-5 px-5 md:px-8  text-[12px] text-[#BCBCBC] mt-5 subheaders-font">
              We respect your privacy. All of your information is securely
              stored on our HIPAA Compliant server.
            </p>

            <div className="fixed bottom-0 w-[335px] md:w-[520px] p-4 bg-white -translate-x-2/4 left-2/4 z-10">
              <button
                onClick={handleCheckout}
                disabled={isCheckoutLoading}
                className={`w-full py-3 px-6 rounded-full font-medium transition-colors block text-center ${
                  isCheckoutLoading
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {isCheckoutLoading ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding to Cart...
                  </>
                ) : (
                  "Get my growth plan now"
                )}
              </button>
              <div className="flex items-center justify-center mt-2 text-sm">
                <img
                  src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/reset.png"
                  alt="Guarantee icon"
                  className="h-5 w-5 mr-1"
                />
                <span>100% Money Back Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full-screen loading overlay */}
        {isCheckoutLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999]">
            <div className="bg-white rounded-lg p-8 flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
              <p className="text-lg font-medium">Adding items to cart...</p>
              <p className="text-sm text-gray-600 mt-2">Please wait</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen bg-white subheaders-font font-medium"
      suppressHydrationWarning={true}
    >
      <QuestionnaireNavbar
        onBackClick={handleBackClick}
        currentPage={currentPage}
      />
      <ProgressBar progress={progress} />

      <div
        className="quiz-page-wrapper relative w-full subheaders-font md:w-[520px] mx-auto bg-[#FFFFFF]"
        suppressHydrationWarning={true}
      >
        <QuestionLayout
          title="What best describes your hair?"
          currentPage={currentPage}
          pageNo={1}
          questionId={137}
          inputType="radio"
        >
          <QuestionOption
            id="137_1"
            name="137"
            value="Receding hairline"
            checked={answers[137] === "Receding hairline"}
            onChange={() => handleOptionChange(137, "Receding hairline")}
            type="radio"
            className="mb-4"
            label={
              <div className="flex flex-row items-center">
                <span className="flex justify-start mr-4">
                  <img
                    className="w-[50px] h-[50px] object-contain"
                    src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/receding_hairline.png"
                    alt="Receding hairline"
                  />
                </span>
                <span className="self-center">Receding hairline</span>
              </div>
            }
          />

          <QuestionOption
            id="137_2"
            name="137"
            value="Thinning at the crown"
            checked={answers[137] === "Thinning at the crown"}
            onChange={() => handleOptionChange(137, "Thinning at the crown")}
            type="radio"
            className="mb-4"
            label={
              <div className="flex flex-row items-center">
                <span className="flex justify-start mr-4">
                  <img
                    className="w-[50px] h-[50px] object-contain"
                    src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/crown_hairline.png"
                    alt="Thinning at the crown"
                  />
                </span>
                <span className="self-center">Thinning at the crown</span>
              </div>
            }
          />

          <QuestionOption
            id="137_3"
            name="137"
            value="Overall hair loss/thinning"
            checked={answers[137] === "Overall hair loss/thinning"}
            onChange={() =>
              handleOptionChange(137, "Overall hair loss/thinning")
            }
            type="radio"
            className="mb-4"
            label={
              <div className="flex flex-row items-center">
                <span className="flex justify-start mr-4">
                  <img
                    className="w-[50px] h-[50px] object-contain"
                    src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/overall_hairline.png"
                    alt="Overall hair loss/thinning"
                  />
                </span>
                <span className="self-center">Overall hair loss/thinning</span>
              </div>
            }
          />

          <QuestionOption
            id="137_4"
            name="137"
            value="Full head of hair"
            checked={answers[137] === "Full head of hair"}
            onChange={() => handleOptionChange(137, "Full head of hair")}
            type="radio"
            className="mb-4"
            label={
              <div className="flex flex-row items-center">
                <span className="flex justify-start mr-4">
                  <img
                    className="w-[50px] h-[50px] object-contain"
                    src="https://myrocky.b-cdn.net/WP%20Images/Questionnaire/full_hairline.png"
                    alt="Full head of hair"
                  />
                </span>
                <span className="self-center">Full head of hair</span>
              </div>
            }
          />

          {cameFromBack && (
            <>
              {error137 && (
                <p className="text-red-500 text-[13px] mt-1 mb-2">{error137}</p>
              )}
              <ContinueButton onClick={handleContinue137} />
            </>
          )}
        </QuestionLayout>

        <QuestionLayout
          title="What sort of results are you looking for?"
          currentPage={currentPage}
          pageNo={2}
          questionId={138}
          inputType="radio"
        >
          <QuestionOption
            id="138_1"
            name="138"
            value="Regrowing my hair"
            checked={answers[138] === "Regrowing my hair"}
            onChange={() => handleOptionChange(138, "Regrowing my hair")}
            type="radio"
            label="Regrowing my hair"
            className="mb-4"
          />

          <QuestionOption
            id="138_2"
            name="138"
            value="Preventing future hair loss"
            checked={answers[138] === "Preventing future hair loss"}
            onChange={() =>
              handleOptionChange(138, "Preventing future hair loss")
            }
            type="radio"
            label="Preventing future hair loss"
            className="mb-4"
          />

          <QuestionOption
            id="138_3"
            name="138"
            value="Both"
            checked={answers[138] === "Both"}
            onChange={() => handleOptionChange(138, "Both")}
            type="radio"
            label="Both"
          />

          {cameFromBack && (
            <>
              {error138 && (
                <p className="text-red-500 text-[13px] mt-1 mb-2">{error138}</p>
              )}
              <ContinueButton onClick={handleContinue138} />
            </>
          )}
        </QuestionLayout>

        {currentPage === 3 && (
          <div className="quiz-page before-after-page">
            <div className="quiz-heading-wrapper px-3 mx-auto pt-10">
              <h2 className="quiz-heading text-2xl text-center font-medium">
                Time to get your hair back
              </h2>
            </div>
            <p className="text-center p-5">
              <img
                className="block w-full h-auto m-auto p-5 max-w-[500px]"
                src={`${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/uploads/2023/03/review-aanton-before-after-e1678831383630.jpg`}
                alt="Before and After Results"
              />
              <img
                width="24"
                height="24"
                className="block m-auto"
                src={`${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/puff.svg`}
                alt="Puff"
              />
            </p>
          </div>
        )}

        {currentPage === 4 && (
          <div className="quiz-page">
            <div className="quiz-content px-4 md:px-0 pt-2">
              <h2 className="text-2xl font-medium mb-6 mt-4">
                Let's make sure you're eligible for treatment
              </h2>

              <div className="birthday-section mb-6">
                <label
                  htmlFor="birthdate"
                  className="block text-left text-base mb-2"
                >
                  My birthday is
                </label>
                <DOBInput
                  value={dateInput}
                  onChange={handleDateChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#AE7E56] focus:border-[#AE7E56]"
                  placeholder="MM/DD/YYYY"
                  minAge={18}
                  required
                />
                <WarningPopup
                  isOpen={showUnderagePopup}
                  onClose={() => setShowUnderagePopup(false)}
                  // title="Age Restriction"
                  message="Sorry, but we are not able to service you as this service is for adults only."
                  showCheckbox={false}
                  buttonText="Ok"
                  backgroundColor="bg-[#F5F4EF]"
                  titleColor="text-[#C19A6B]"
                />
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
              </div>

              <div className="fixed bottom-0  p-4 bg-white border-t -translate-x-2/4 left-2/4">
                <button
                  type="button"
                  onClick={handleDateSubmit}
                  className="w-[335px] md:w-[520px] bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {currentPage === 5 && (
          <div className="quiz-page">
            <div className="quiz-content px-4 md:px-0 pt-2">
              <h2 className="text-2xl font-medium mb-4 mt-4">
                What was your biological sex at birth?
              </h2>
              <h3 className="text-[#B17F4A] text-base font-normal mb-6">
                For example, on your original birth certificate
              </h3>

              <div className="sex-options-wrapper space-y-4 mb-8">
                <QuestionOption
                  id="1_1"
                  name="1"
                  value="Male"
                  checked={answers[1] === "Male"}
                  onChange={() => handleOptionChange(1, "Male")}
                  type="radio"
                  label="Male"
                  className="w-full"
                />
                <QuestionOption
                  id="1_2"
                  name="1"
                  value="Female"
                  checked={answers[1] === "Female"}
                  onChange={() => handleOptionChange(1, "Female")}
                  type="radio"
                  label="Female"
                  className="w-full"
                />
              </div>

              {cameFromBack && (
                <>
                  {error1 && (
                    <p className="text-red-500 text-[13px] mt-1 mb-2">
                      {error1}
                    </p>
                  )}
                  <ContinueButton onClick={handleContinue1} />
                </>
              )}
            </div>
          </div>
        )}

        <WarningPopup
          isOpen={showPopup}
          onClose={(proceed) => {
            setShowPopup(false);
            if (!proceed) {
            } else {
              setAnswers({
                ...answers,
                1: "",
              });
            }
          }}
          title="Just a Quick Note! 😊"
          message="We noticed you selected Female—currently, our treatments for hair loss are only available for men."
          showCheckbox={false}
          buttonText="Ok"
          backgroundColor="bg-[#F5F4EF]"
          titleColor="text-[#C19A6B]"
        />

        {currentPage === 6 && (
          <div className="quiz-page">
            <div className="quiz-heading-wrapper px-3 mx-auto pt-10">
              <h2 className="quiz-heading text-lg text-center font-medium">
                Please wait while we are loading the recommended hair product...
              </h2>
            </div>
            <p className="text-center p-5 pb-[150px]">
              <img
                src={`${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/preloader-wheel.svg`}
                className="block w-[100px] h-auto m-auto"
                alt="Preloader Wheel"
              />
            </p>
          </div>
        )}

        {currentPage === 8 && (
          <div className="quiz-page">
            <p className="text-center p-5 pb-[100px]">
              <img
                src={`${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/preloader-wheel.svg`}
                className="block w-[100px] h-auto m-auto pt-6"
                alt="Preloader Wheel"
              />
            </p>
          </div>
        )}

        {/* <p className="text-left text-xs text-gray-400 mt-5 subheaders-font">
          We respect your privacy. All of your information is securely stored on
          our HIPAA Compliant server.
        </p> */}
      </div>
    </div>
  );
};

export default HairPreConsultationQuiz;
