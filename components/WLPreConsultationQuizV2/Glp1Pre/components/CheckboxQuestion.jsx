import React from "react";

const CheckboxQuestion = ({
  config,
  userData,
  onToggle,
  isValid,
  onContinue,
}) => {
  const selectedValues = userData[config.field] || [];
  const warningConfig = config?.selectionWarning;
  const excludedOptionIds = warningConfig?.excludeOptionIds || [];
  const triggerOptionIds = warningConfig?.triggerOptionIds || [];

  const shouldShowSelectionWarning =
    !!warningConfig &&
    selectedValues.length > 0 &&
    (triggerOptionIds.length > 0
      ? selectedValues.some((value) => triggerOptionIds.includes(value))
      : selectedValues.some((value) => !excludedOptionIds.includes(value)));

  const handleContinue = () => {
    if (isValid && onContinue) {
      onContinue();
    }
  };

  return (
    <>
      <div className="space-y-4 pb-10">
        <h1>{config.title}</h1>
        {config.options.map((option) => (
          <button
            key={option.id}
            className={`w-full text-left px-4 py-5 md:py-6 border-[1px] rounded-lg flex items-center gap-3 ${
              selectedValues.includes(option.id)
                ? "border-[#A7885A] border-[2px]"
                : "border-[#E2E2E1]"
            }`}
            onClick={() => onToggle(option.id, option)}
          >
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
            <div className="flex-1">
              <span className="text-[14px] md:text-[16px] leading-[140%] tracking-[0%] text-black">
                {option.label}
              </span>
              {option.metadata && (
                <div className="text-[12px] text-gray-500 mt-1">
                  ({option.metadata})
                </div>
              )}
            </div>
          </button>
        ))}

        {shouldShowSelectionWarning && (
          <div className="flex items-center gap-3 rounded-[12px] border border-[#F3C84A] bg-[#FAF8E8] px-5 py-4">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
            >
              <path
                d="M12 3L21 19H3L12 3Z"
                stroke="#E2B21C"
                strokeWidth="1.5"
                fill="#FFF8D6"
              />
              <path
                d="M12 9V13"
                stroke="#E2B21C"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="12" cy="16.5" r="1" fill="#E2B21C" />
            </svg>
            <p className="text-[1rem] leading-[140%] text-[#ca8a04]">
              {warningConfig.message}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default CheckboxQuestion;
