import React from "react";

const LongevityRadioQuestion = ({ config, userData, onSelect }) => {
  const selectedValue = userData[config.field];

  return (
    <div className="space-y-4">
      {config.options.map((option) => {
        const isSelected = selectedValue === option.id;
        return (
          <button
            key={option.id}
            className={`w-full text-left px-4 py-5 md:py-6 border-[1px] rounded-lg flex items-center gap-3 transition-colors ${
              isSelected
                ? "border-[#A7885A] bg-[#FFFBF7]"
                : "border-[#E2E2E1] bg-white"
            }`}
            onClick={() => onSelect(option.id, option)}
          >
            <div
              className={`w-5 h-5 border rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected ? "border-[#A7885A]" : "border-gray-300"
              }`}
            >
              {isSelected && (
                <div className="w-3 h-3 rounded-full bg-[#A7885A]" />
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

export default LongevityRadioQuestion;
