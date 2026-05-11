import CustomImage from "@/components/utils/CustomImage";
import React, { useState, useEffect } from "react";
import StickyButton from "../../components/StickyButton";

const RadioImagesQuestion = ({
  config,
  userData,
  onSelect,
  textInput,
  setTextInput,
  onTextSubmit,
  isValid,
}) => {
  const [selected, setSelected] = useState(
    userData ? (userData[config.field] ?? null) : null,
  );

  useEffect(() => {
    if (userData && typeof config?.field !== "undefined") {
      setSelected(userData[config.field] ?? null);
    }
  }, [userData, config.field]);

  const selectedOption = config.options.find((opt) => opt.id === selected);
  const derivedShowTextInput = !!selectedOption?.showTextInput;

  return (
    <>
      <div className="grid grid-cols-3 pb-32">
        {config.options.map((option) => (
          <button
            key={option.id}
            className="w-full text-center px-2  py-2  rounded-lg flex justify-start flex-col items-center gap-3 bg-white"
            onClick={() => setSelected(option.id)}
          >
            {option.image && (
              <div
                className={`rounded-md ${
                  selected === option.id
                    ? "border-2 border-[#A7885A] p-2 bg-[#FFFBF7]"
                    : "border-2 p-2 border-[#E2E2E1]"
                }`}
              >
                <CustomImage
                  src={option.image}
                  alt={option.label}
                  width={100}
                  height={100}
                  className={`${
                    selected === option.id ? "opacity-100" : "opacity-50"
                  } object-cover`}
                />
              </div>
            )}
            <span className="text-[12px] md:text-[16px] font-medium leading-[140%] tracking-[0%] text-black">
              {option.label}
            </span>
          </button>
        ))}
      </div>

      {derivedShowTextInput && (
        <div className="mt-6">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={selectedOption?.textPlaceholder || "Please specify..."}
            className="w-full p-4 border border-gray-300 rounded-lg min-h-[100px] text-[14px] md:text-[16px] focus:outline-none focus:border-[#A7885A]"
          />

          {textInput.trim() && (
            <button
              onClick={onTextSubmit}
              className="w-full mt-4 py-3 bg-black text-white rounded-full font-medium"
            >
              Continue
            </button>
          )}
        </div>
      )}

      <div className="text-[10px] my-6 text-[#00000059] text-left font-[400] leading-[140%] tracking-[0%] mb-24">
        We respect your privacy. All of your information is securely stored on
        our HIPAA Compliant server.
      </div>
      <StickyButton
        onClick={() => {
          const opt = config.options.find((o) => o.id === selected);
          onSelect(selected, opt);
        }}
        disabled={
          selected == null || (derivedShowTextInput && !textInput.trim())
        }
        text="Continue"
      />
    </>
  );
};

export default RadioImagesQuestion;
