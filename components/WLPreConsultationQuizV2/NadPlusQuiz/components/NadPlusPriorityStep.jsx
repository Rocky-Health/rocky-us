"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const LightningIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M38 6L14 36H32L26 58L50 28H32L38 6Z" stroke="#251F20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LightbulbIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 48H40" stroke="#251F20" strokeWidth="3" strokeLinecap="round"/>
    <path d="M26 52H38" stroke="#251F20" strokeWidth="3" strokeLinecap="round"/>
    <path d="M32 8C22.06 8 14 16.06 14 26C14 32.08 17.16 37.42 22 40.58V44C22 45.1 22.9 46 24 46H40C41.1 46 42 45.1 42 44V40.58C46.84 37.42 50 32.08 50 26C50 16.06 41.94 8 32 8Z" stroke="#251F20" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="32" cy="26" r="4" fill="#251F20"/>
  </svg>
);

const SmileyIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="32" cy="32" r="24" stroke="#251F20" strokeWidth="3"/>
    <circle cx="24" cy="28" r="3" fill="#251F20"/>
    <circle cx="40" cy="28" r="3" fill="#251F20"/>
    <path d="M20 38C22 44 26.5 48 32 48C37.5 48 42 44 44 38" stroke="#251F20" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const ICON_MAP = {
  lightning: LightningIcon,
  lightbulb: LightbulbIcon,
  smiley: SmileyIcon,
};

const NadPlusPriorityStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onQuizChromeVisibilityChange,
}) => {
  const field = stepConfig?.field || "nadPlusPriority";
  const options = stepConfig?.options || [];
  const subtitle = stepConfig?.subtitle || "Which of these is your priority?";

  const [selected, setSelected] = useState(userData?.[field] || null);

  useEffect(() => {
    onQuizChromeVisibilityChange?.(false);
    return () => onQuizChromeVisibilityChange?.(false);
  }, [onQuizChromeVisibilityChange]);

  useEffect(() => {
    setSelected(userData?.[field] || null);
  }, [userData, field]);

  const handleSelect = (id) => {
    setSelected(id);
    setUserData((prev) => ({ ...prev, [field]: id }));
  };

  const handleNext = () => {
    if (!selected) return;
    onContinue({ ...userData, [field]: selected });
  };

  return (
    <div className="flex w-full flex-col px-2 pb-12 lg:pt-6 pt-4">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
        <h1 className="headers-font text-5xl font-normal leading-[125%] tracking-[-0.02em] text-[#251F20]">
          We can help with all of these, but choose the{" "}
          <span style={{ color: ACCENT }}>most important for you.</span>
        </h1>
        <p className="mt-4 font-sans text-3xl leading-[145%] text-[#251F20]/85">
          {subtitle}{" "}
          <span className="text-[#C45C4A]" aria-hidden>*</span>
        </p>

        <div className="lg:mt-10 mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3 md:gap-4">
          {options.map((option) => {
            const IconComponent = ICON_MAP[option.icon];
            const isSel = selected === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSel}
                onClick={() => handleSelect(option.id)}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 bg-white px-4 py-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 ${
                  isSel ? "border-[#A7885A] shadow-sm" : "border-[#E5E2DC]"
                }`}
              >
                <div className="h-16 w-16 shrink-0 flex items-center justify-center">
                  {IconComponent && <IconComponent />}
                </div>
                <span className="headers-font mt-4 text-center text-xl leading-snug text-[#251F20]">
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selected}
          onClick={handleNext}
          className="mt-12 flex h-[52px] w-full max-w-4xl items-center justify-center gap-2 self-center rounded-full font-sans text-base font-medium text-white transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
          style={{ backgroundColor: ACCENT }}
        >
          <span>Next</span>
          <FaArrowRight className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default NadPlusPriorityStep;
