import React from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import GenericQuestionStep from "../components/GenericQuestionStep";
import SkincareProductCard from "../components/SkincareProductCard";
import { quizConfig } from "./config/quizConfig";

const GenericRecommendationStep = dynamic(() =>
  import("../components/GenericRecommendationStep")
);
const PhotoUploadStep = dynamic(() => import("../components/PhotoUploadStep"));
const IdUploadStep = dynamic(() => import("../components/IdUploadStep"));
const ThankYouStep = dynamic(() => import("../components/ThankYouStep"));
import { getProductRecommendation } from "../utils/recommendationEngine";

const QuizStepRenderer = ({
  stepIndex,
  answers,
  setAnswers,
  selectedProduct,
  setSelectedProduct,
  handleNext,
  handleBack,
  handleAction,
  handleThankYouComplete,
  onProceed,
  submitFormData,
  submitCurrentStepData,
}) => {
  const stepConfig = quizConfig.steps[stepIndex];

  // Handle photo upload step
  if (stepIndex === 14) {
    return (
      <PhotoUploadStep
        onContinue={handleNext}
        onBack={handleBack}
        questionnaire="hyperpigmentation"
        onPhotoUpload={async (frontPhotoUrl, sidePhotoUrl) => {
          // Store photo URLs in answers
          setAnswers((prev) => ({
            ...prev,
            frontPhotoUrl: frontPhotoUrl,
            sidePhotoUrl: sidePhotoUrl,
            photosUploaded: true,
          }));
          // Defer submit to once-per-step by letting handleNext run after upload
        }}
      />
    );
  }

  // Handle ID upload step
  if (stepIndex === 15) {
    return (
      <IdUploadStep
        onContinue={handleNext}
        onBack={handleBack}
        questionnaire="hyperpigmentation"
        onIdUpload={async (idPhotoUrl) => {
          // Store ID photo URL in answers
          setAnswers((prev) => ({
            ...prev,
            idPhotoUrl: idPhotoUrl,
            idUploaded: true,
          }));
        }}
      />
    );
  }

  // Handle thank you step
  if (stepIndex === 16) {
    return (
      <ThankYouStep
        submitFormData={submitFormData}
        onComplete={handleThankYouComplete}
        quizType="hyperpigmentation"
      />
    );
  }

  // Handle recommendation step
  if (stepIndex === 17) {
    const recommendation = getProductRecommendation(
      answers,
      quizConfig.recommendationRules
    );

    return (
      <GenericRecommendationStep
        {...recommendation}
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        onContinue={onProceed}
        ProductCard={SkincareProductCard}
        showAlternatives={false}
      />
    );
  }

  // Handle final completion step (step 18) or invalid step
  if (!stepConfig) {
    return (
      <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6">
        <div className="text-center">
          {/* Success icon */}
          <div className="mb-6">
            <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>

          <h1 className="mb-4 headers-font text-[26px] font-[450] md:font-medium md:text-[32px] md:leading-[115%] leading-[120%] tracking-[-1%] md:tracking-[-2%] text-[#C19A6B]">
            Consultation Complete!
          </h1>
          <p className="text-gray-600 mb-8">
            Your personalized hyperpigmentation treatment has been added to your
            cart. Please continue to checkout to complete your order.
          </p>

          {/* Action Buttons */}
          <div className="space-y-4">
            <Link
              href="/cart"
              className="w-full bg-black text-white py-3 px-6 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6H19"
                />
              </svg>
              View Cart & Checkout
            </Link>

            <button
              onClick={() => {
                window.location.href = "/";
              }}
              className="w-full bg-white text-black py-3 px-6 rounded-full font-medium border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GenericQuestionStep
      key={stepIndex}
      stepConfig={stepConfig}
      userData={answers}
      setUserData={setAnswers}
      onContinue={handleNext}
      onAction={handleAction}
      onSubmitData={submitCurrentStepData}
    />
  );
};

export default QuizStepRenderer;
