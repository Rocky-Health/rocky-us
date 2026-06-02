import React from "react";

const CompletionStep = ({ onBack }) => {
  return (
    <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 mt-6 pb-24">
      <div className="flex flex-col items-center text-center py-12">
        <div className="w-16 h-16 bg-[#FFFBF7] border-2 border-[#A7885A] rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-[#A7885A]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h2 className="headers-font text-[26px] md:text-[32px] leading-[115%] mb-4">
          Questionnaire Complete
        </h2>

        <p className="text-[16px] text-gray-600 mb-8 leading-[140%] max-w-sm">
          Thank you for completing the health screening questionnaire. Our team
          will be in touch to confirm your eligibility shortly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm justify-center">
          {/* {typeof onBack === "function" && (
            <button
              type="button"
              onClick={onBack}
              className="inline-block border border-gray-300 text-gray-800 py-3 px-8 rounded-full font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
          )} */}
          <a
            href="/"
            className="inline-block bg-black text-white py-3 px-8 rounded-full font-medium hover:bg-gray-800 transition-colors text-center"
          >
            Return to Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default CompletionStep;
