import React, { useState } from "react";
import SignInLink from "./SignInLink";

const CheckboxQuestion = ({
  config,
  userData,
  onToggle,
  isValid,
  onContinue,
}) => {
  const selectedValues = userData[config.field] || [];
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (!isValid) {
      setError("Please select an option to continue.");
      return;
    }
    setError("");
    onContinue?.();
  };

  return (
    <>
      <div className="space-y-4 pb-10">
        {config.options.map((option) => (
          <button
            key={option.id}
            className={`w-full text-left px-4 py-5 md:py-6 border-[1px] rounded-lg flex items-center gap-3 ${
              selectedValues.includes(option.id)
                ? "border-[#A7885A] border-[2px]"
                : "border-[#E2E2E1]"
            }`}
            onClick={() => {
              if (error) setError("");
              onToggle(option.id, option);
            }}
          >
            <div className="flex-1">
              <span className="text-[14px] md:text-[16px] font-medium leading-[140%] tracking-[0%] text-black">
                {option.label}
              </span>
              {option.metadata && (
                <div className="text-[12px] text-gray-500 mt-1">
                  ({option.metadata})
                </div>
              )}
            </div>
            <div
              className={`w-5 h-5 border rounded flex items-center justify-center ${
                selectedValues.includes(option.id)
                  ? "border-[#A7885A] bg-[#A7885A]"
                  : "border-gray-300"
              }`}
            >
              {selectedValues.includes(option.id) && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M2 6L4.5 8.5L10 3"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Privacy text - WL style */}
      <div className="text-[10px] my-6 text-[#00000059] text-left font-[400] leading-[140%] tracking-[0%]">
        We respect your privacy. All of your information is securely stored on
        our HIPAA Compliant server.
      </div>

      {config.showSignIn && <SignInLink className="mt-1" />}

      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex flex-col items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_37.51%,#FFFFFF_63.04%)] backdrop-blur-sm">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          {error && (
            <p className="text-red-500 text-[13px] mb-2 text-center">{error}</p>
          )}
          <button
            onClick={handleContinue}
            className="w-full py-3 h-[52px] rounded-full font-medium bg-black text-white"
          >
            Continue
          </button>
        </div>
      </div>
    </>
  );
};

export default CheckboxQuestion;
