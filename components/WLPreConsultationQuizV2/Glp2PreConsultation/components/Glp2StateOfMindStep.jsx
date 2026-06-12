"use client";

import React from "react";

const Glp2StateOfMindStep = ({ userData, config, onSelect }) => {
  const options = config?.options || [];

  return (
    <div className="w-full h-full flex flex-col px-4 md:px-0">
      <div className="w-full md:w-[580px] mx-auto flex-grow pb-32 md:pb-36">
        <h1 className="headers-font text-[32px] leading-[115%] text-[#251F20] mb-6">
          Let&apos;s Better Understand Your Current{" "}
          <span className="text-[#AE7E56]">State Of Mind.</span>
        </h1>

        <div className="space-y-3">
          {options.map((option) => {
            const checked = userData?.[config.field] === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.id, option)}
                className={`w-full min-h-[55px] rounded-[8px] border px-4 text-left flex items-center gap-3 bg-white ${
                  checked ? "border-[#AE7E56]" : "border-[#E2E2E1]"
                }`}
              >
                <span
                  className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${
                    checked ? "border-[#AE7E56]" : "border-[#CFCFCF]"
                  }`}
                >
                  {checked ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-[#AE7E56]" />
                  ) : null}
                </span>
                <span className="text-[15px] text-[#000000] font-medium">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Glp2StateOfMindStep;
