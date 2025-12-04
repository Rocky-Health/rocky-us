import React from "react";
import SignInLink from "./SignInLink";

const CheckboxQuestion = ({
  config,
  userData,
  onToggle,
  isValid,
  onContinue,
}) => {
  const selectedValues = userData[config.field] || [];

  const handleContinue = () => {
    if (isValid && onContinue) {
      onContinue();
    }
  };

  return (
    <>
      <div className="space-y-4">
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
        our PIPEDA Compliant server.
      </div>

      {config.showSignIn && <SignInLink className="mt-1" />}


      
        <div className="sticky bottom-0 py-4 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_37.51%,#FFFFFF_63.04%)]">
          <button
            onClick={handleContinue}
            disabled={!isValid}
            className={` w-full mt-6 py-3 h-[52px]  rounded-full font-medium ${isValid ? 'bg-black text-white' : 'bg-[#E3E3E3] text-black'}`}
          >
            Continue
          </button>
        </div>
      

    </>
  );
};

export default CheckboxQuestion;
