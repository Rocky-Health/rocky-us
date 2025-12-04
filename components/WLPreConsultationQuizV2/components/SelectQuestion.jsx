import React, { useState, useEffect } from "react";
import SignInLink from "./SignInLink";
import StickyButton from "./StickyButton";

const SelectQuestion = ({
  config,
  userData,
  onSelect,
  textInput,
  setTextInput,
  onTextSubmit,
  isValid,
}) => {
  const [selected, setSelected] = useState(
    userData ? userData[config.field] ?? "" : ""
  );

  useEffect(() => {
    if (userData && typeof config?.field !== "undefined") {
      setSelected(userData[config.field] ?? "");
    }
  }, [userData, config.field]);

  // derive from local selection so changing the select doesn't immediately advance
  const derivedShowTextInput =
    selected === true &&
    config.options.find((opt) => opt.id === true)?.showTextInput;

  return (
    <>
      <div className="w-full">
        <label className="text-[14px] mb-[8px] font-medium leading-[140%]">
          {config.label}
        </label>
        <select
          className="w-full px-4 py-4 border border-gray-300 rounded-lg text-[16px] focus:outline-none focus:border-[#A7885A]"
          value={selected || ""}
          onChange={(e) => {
            const selectedId = e.target.value;
            setSelected(selectedId);
          }}
        >
          {config.options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="text-[10px] my-6 text-[#00000059] text-left font-[400] leading-[140%] tracking-[0%]">
          We respect your privacy. All of your information is securely stored on
          our PIPEDA Compliant server.
        </div>
      </div>

      {derivedShowTextInput && (
        <div className="mt-6">
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder={
              config.options.find((opt) => opt.showTextInput)
                ?.textPlaceholder || "Please specify..."
            }
            className="w-full p-4 border border-gray-300 rounded-lg min-h-[100px] text-[14px] md:text-[16px] focus:outline-none focus:border-[#A7885A]"
          />

          {textInput.trim() && (
            <button
              onClick={onTextSubmit}
              className="w-full mb-4 mt-4 py-3 bg-black text-white rounded-full font-medium"
            >
              Continue
            </button>
          )}
        </div>
      )}


      <StickyButton
        text="Continue"
        onClick={() => {
          const opt = config.options.find((o) => o.id === selected);
          onSelect(selected, opt);
        }}
        disabled={!selected || (derivedShowTextInput && !textInput.trim())}
        showSignIn={config.showSignIn}
      />
    </>
  );
};

export default SelectQuestion;
