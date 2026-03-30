"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";

const Glp2WillingnessStep = ({ userData, setUserData, config, onContinue }) => {
  const selectedValue = userData?.[config.field] || "";
  const options = config?.options || [];

  const handleSelect = (value) => {
    setUserData((prev) => ({
      ...prev,
      [config.field]: value,
    }));
  };

  return (
    <div className="w-full h-full flex flex-col px-4 md:px-0">
      <div className="w-full md:w-[580px] mx-auto flex-grow pb-32 md:pb-36">
        <h1 className="headers-font text-[32px] leading-[115%] text-[#251F20] mb-6">
          If Clinically Appropriate, Are You Willing To:
        </h1>

        <div className="space-y-3">
          {options.map((option) => {
            const checked = selectedValue === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className={`w-full min-h-[52px] rounded-[8px] border px-4 py-2 text-left flex items-center gap-3 bg-white ${
                  checked ? "border-[#AE7E56]" : "border-[#E2E2E1]"
                }`}
              >
                <span
                  className={`w-[12px] h-[12px] rounded-full border flex items-center justify-center shrink-0 ${
                    checked ? "border-[#AE7E56]" : "border-[#CFCFCF]"
                  }`}
                >
                  {checked ? (
                    <span className="w-3 h-3 rounded-full bg-[#AE7E56]" />
                  ) : null}
                </span>
                <span className="text-[14px] text-[#000000] font-medium">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] backdrop-blur-sm">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          <button
            type="button"
            onClick={() => onContinue?.()}
            disabled={!selectedValue}
            className={`w-full py-3 flex items-center justify-center gap-2 rounded-full h-[52px] font-medium border-none focus:outline-none focus:ring-0 ${
              selectedValue
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-700 cursor-not-allowed"
            }`}
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Glp2WillingnessStep;
