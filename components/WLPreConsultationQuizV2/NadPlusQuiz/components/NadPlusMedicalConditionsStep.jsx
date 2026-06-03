"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const NadPlusMedicalConditionsStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onQuizChromeVisibilityChange,
}) => {
  const field = stepConfig?.field || "medicalConditions";
  const options = stepConfig?.options || [];

  const [selected, setSelected] = useState(() => {
    const stored = userData?.[field];
    if (Array.isArray(stored)) return stored;
    return [];
  });

  useEffect(() => {
    onQuizChromeVisibilityChange?.(false);
    return () => onQuizChromeVisibilityChange?.(false);
  }, [onQuizChromeVisibilityChange]);

  const toggleOption = (id) => {
    setSelected((prev) => {
      let next;
      if (id === "none") {
        next = prev.includes("none") ? [] : ["none"];
      } else {
        const without = prev.filter((x) => x !== "none");
        next = without.includes(id)
          ? without.filter((x) => x !== id)
          : [...without, id];
      }
      setUserData((u) => ({ ...u, [field]: next }));
      return next;
    });
  };

  const handleNext = () => {
    if (selected.length === 0) return;
    onContinue({ ...userData, [field]: selected });
  };

  return (
    <div className="flex w-full flex-col px-2 pb-12 lg:pt-6 pt-4">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
        <h1 className="headers-font text-5xl font-normal leading-[120%] tracking-[-0.02em] text-[#251F20]">
          <span style={{ color: ACCENT }}>NAD+ is safe,</span> but these
          health conditions might prevent you from being prescribed.
        </h1>

        <p className="mt-4 text-center font-sans text-base leading-[145%] text-[#251F20]/70">
          Your answers are completely confidential and protected by HIPAA
        </p>

        <h2 className="mt-8 headers-font text-3xl font-normal leading-[130%] text-[#251F20]">
          Do any of these apply to you?{" "}
          <span className="text-[#C45C4A]" aria-hidden>*</span>
        </h2>

        <div className="mt-6 flex flex-col gap-3">
          {options.map((option) => {
            const isChecked = selected.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                role="checkbox"
                aria-checked={isChecked}
                onClick={() => toggleOption(option.id)}
                className="flex items-center gap-3 text-left font-sans text-base text-[#251F20]"
              >
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                    isChecked
                      ? "border-[#A7885A] bg-[#A7885A]"
                      : "border-[#ccc] bg-white"
                  }`}
                  aria-hidden
                >
                  {isChecked && (
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      viewBox="0 0 12 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 5L4.5 8.5L11 1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={selected.length === 0}
          onClick={handleNext}
          className="mt-10 flex h-[52px] w-full max-w-4xl items-center justify-center gap-2 self-center rounded-full font-sans text-base font-medium text-white transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
          style={{ backgroundColor: ACCENT }}
        >
          <span>Next</span>
          <FaArrowRight className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default NadPlusMedicalConditionsStep;
