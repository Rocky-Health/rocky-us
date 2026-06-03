import React, { useEffect } from "react";
import QuestionnaireNavbar from "@/components/EdQuestionnaire/QuestionnaireNavbar";

// Renders a message string and turns any email addresses into gold mailto links
const renderMessageWithEmail = (text, index) => {
  const emailRegex = /([a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/g;
  const parts = text.split(emailRegex);

  return (
    <p key={index} className={index > 0 ? "mt-4" : ""}>
      {parts.map((part, i) =>
        emailRegex.test(part) ? (
          <a
            key={i}
            href={`mailto:${part}`}
            className="font-medium underline underline-offset-2"
            style={{ color: "#C19A6B" }}
          >
            {part}
          </a>
        ) : (
          part
        )
      )}
    </p>
  );
};

const LongevityPopup = ({
  isOpen,
  onClose,
  popupData,
  onAction,
  isSubmitting = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen || !popupData) return null;

  const handleButtonClick = (button) => {
    switch (button.action) {
      case "redirect":
        window.location.href = button.url;
        break;
      case "continue":
        onAction("continue");
        break;
      case "close":
      default:
        onClose();
        break;
    }
  };

  const getTitleColor = () => {
    if (popupData.titleColor === "red") return "text-red-600";
    return "text-[#C19A6B]";
  };

  return (
    <div
      className="fixed inset-0 bg-[#F5F4EF] !z-[999999] flex flex-col overflow-auto"
      style={{
        animation: isOpen
          ? "fadeIn 0.3s ease-in-out"
          : "fadeOut 0.3s ease-in-out",
      }}
    >
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      <QuestionnaireNavbar onBackClick={() => onClose()} />

      <div className="flex-1 flex items-start justify-center py-4 overflow-auto">
        <div className="w-full md:w-[520px] max-w-xl mx-auto px-6 py-4 relative flex flex-col">
          <h3
            className={`text-[26px] md:text-[32px] headers-font ${getTitleColor()} leading-[115%] mb-8`}
          >
            {popupData.title}
          </h3>

          <div className="text-[20px] md:text-[24px] mb-8 text-[#000000] max-w-lg mx-auto text-left leading-[140%]">
            {popupData.message.split("\n").map((line, index) =>
              renderMessageWithEmail(line, index)
            )}
          </div>

          {/* Fixed bottom button area */}
          <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50">
            <div className="w-[335px] md:w-[520px] max-w-xl flex flex-col gap-3">
              {popupData.buttons.map((button, index) => (
                <button
                  key={index}
                  onClick={() => handleButtonClick(button)}
                  disabled={isSubmitting && button.action === "continue"}
                  className={`w-full py-3 rounded-full font-medium transition-colors relative ${
                    button.primary
                      ? "bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      : "border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  }`}
                >
                  {button.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LongevityPopup;
