import React from "react";

const LongevityCheckboxQuestion = ({ config, userData, onToggle }) => {
  const selectedValues = userData[config.field] || [];

  return (
    <div className="space-y-4">
      {config.options.map((option) => {
        const isSelected = selectedValues.includes(option.id);
        return (
          <button
            key={option.id}
            className={`w-full text-left px-4 py-5 md:py-6 border-[1px] rounded-lg flex items-center gap-3 transition-colors ${
              isSelected
                ? "border-[#A7885A] bg-[#FFFBF7]"
                : "border-[#E2E2E1] bg-white"
            }`}
            onClick={() => onToggle(option.id)}
          >
            <div
              className={`w-5 h-5 border rounded flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected
                  ? "border-[#A7885A] bg-[#A7885A]"
                  : "border-gray-300 bg-white"
              }`}
            >
              {isSelected && (
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
            <span className="text-[14px] md:text-[16px] font-medium leading-[140%] tracking-[0%] text-black">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default LongevityCheckboxQuestion;
