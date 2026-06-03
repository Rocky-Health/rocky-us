import React, { useEffect, useRef, useState } from "react";

const LongevityThankYouStep = ({ onSubmitFinal, submitError }) => {
  const [isComplete, setIsComplete] = useState(false);
  const [localError, setLocalError] = useState(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current || typeof onSubmitFinal !== "function") return;
    startedRef.current = true;

    (async () => {
      try {
        setLocalError(null);
        await onSubmitFinal();
        setIsComplete(true);
      } catch (e) {
        setLocalError(e?.message || "Could not save your answers. Please try again.");
        startedRef.current = false;
      }
    })();
  }, [onSubmitFinal]);

  const displayError = localError || submitError;

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

        {!isComplete && !displayError && (
          <>
            <p className="text-[16px] text-gray-600 mb-6 leading-[140%] max-w-sm">
              Saving your responses…
            </p>
            <div className="flex justify-center space-x-1 mb-6">
              <div className="w-2 h-2 bg-[#A7885A] rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-[#A7885A] rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}
              />
              <div
                className="w-2 h-2 bg-[#A7885A] rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
            </div>
          </>
        )}

        {displayError && (
          <div className="mb-6 max-w-sm">
            <p className="text-red-600 text-[15px] mb-4">{displayError}</p>
            <button
              type="button"
              onClick={() => {
                startedRef.current = false;
                setLocalError(null);
                onSubmitFinal?.().then(() => setIsComplete(true)).catch((e) => {
                  setLocalError(
                    e?.message || "Could not save your answers. Please try again.",
                  );
                });
              }}
              className="inline-block bg-black text-white py-3 px-8 rounded-full font-medium hover:bg-gray-800 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {isComplete && (
          <p className="text-[16px] text-gray-600 mb-8 leading-[140%] max-w-sm">
            Thank you for completing the health screening questionnaire. Our team
            will be in touch to confirm your eligibility shortly.
          </p>
        )}

        {isComplete && (
          <a
            href="/"
            className="inline-block bg-black text-white py-3 px-8 rounded-full font-medium hover:bg-gray-800 transition-colors text-center"
          >
            Return to Home
          </a>
        )}
      </div>
    </div>
  );
};

export default LongevityThankYouStep;
