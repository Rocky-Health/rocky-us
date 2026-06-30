"use client";

import QuestionnaireNavbar from "./QuestionnaireNavbar";
import { useEffect } from "react";

export const WarningPopup = ({
  isOpen,
  onClose,
  title = "Please Read",
  message,
  onAcknowledge,
  acknowledgeLabel = "I hereby understand and consent to the above waiver",
  isAcknowledged = true,
  showCheckbox = true,
  buttonText = "Continue",
  afterButtonContent,
  additionalContent,
  backgroundColor = "bg-[#F5F4EF]",
  titleColor = "text-[#C19A6B]",
  currentPage,
}) => {
  useEffect(() => {
    const form = document.getElementById("quiz-form");

    if (isOpen) {
      document.body.style.overflow = "hidden";

      if (form) {
        const onSubmit = form.onsubmit;
        form.onsubmit = (e) => {
          e.preventDefault();
          return false;
        };
        return () => {
          document.body.style.overflow = "auto";
          form.onsubmit = onSubmit;
        };
      }

      return () => {
        document.body.style.overflow = "auto";
      };
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 ${backgroundColor} !z-[999999] flex flex-col`}
      style={{
        animation: isOpen
          ? "fadeIn 0.3s ease-in-out"
          : "fadeOut 0.3s ease-in-out",
      }}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>

      <QuestionnaireNavbar
        onBackClick={() => onClose(false)}
        currentPage={currentPage}
      />

      <div className="flex-1 flex flex-col overflow-y-auto pb-[80px] md:pb-[100px]">
        <div className="w-full md:w-[520px] max-w-xl mx-auto px-5 md:px-0 py-4 relative flex flex-col">
          <h3
            className={`text-[26px] md:text-[32px] ${titleColor} font-semibold mb-8`}
          >
            {title}
          </h3>

          <p
            className="text-[20px] md:text-[24px] mb-8 text-[#000000] text-left headers-font"
          >
            {message}
          </p>

          {showCheckbox && (
            <div className="mb-8">
              <label className="flex items-start cursor-pointer">
                <div
                  className={`rounded-md flex items-center justify-center w-6 h-6 mr-3 mt-1 flex-shrink-0 ${
                    isAcknowledged ? "bg-[#C19A6B]" : "bg-gray-400"
                  }`}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      width="20"
                      height="20"
                      rx="4"
                      fill={isAcknowledged ? "#C19A6B" : "#9CA3AF"}
                    />
                    {isAcknowledged && (
                      <path
                        d="M5 10L8.5 13.5L15 7"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                  </svg>
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={isAcknowledged}
                  onChange={onAcknowledge}
                />
                <span className="text-xl subheaders-font pb-4">
                  {acknowledgeLabel}
                </span>
              </label>
            </div>
          )}
          {additionalContent}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full py-4 px-4 shadow-lg z-50">
        <div className="flex flex-col items-center justify-center max-w-md mx-auto">
          <button
            onClick={() => onClose(true)}
            disabled={showCheckbox && !isAcknowledged}
            className={`w-full py-4 px-4 rounded-full text-white font-medium text-lg ${
              (showCheckbox ? isAcknowledged : true)
                ? "bg-black"
                : "bg-gray-400"
            }`}
          >
            {buttonText}
          </button>
          {afterButtonContent && (
            <div className="w-full mt-2">{afterButtonContent}</div>
          )}
        </div>
      </div>
    </div>
  );
};
