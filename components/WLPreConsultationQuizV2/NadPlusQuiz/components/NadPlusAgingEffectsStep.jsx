"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const ArrowDownIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 8V36M24 36L14 26M24 36L34 26" stroke="#251F20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CombIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M32 12C32 12 34 16 34 22C34 28 30 34 24 38" stroke="#251F20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 14L22 18M16 18L20 22M14 22L18 26M14 26L18 30" stroke="#251F20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M24 10C20 10 16 14 14 22C12 30 16 36 24 38" stroke="#251F20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SkinIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="16" r="3" fill="#251F20"/>
    <circle cx="18" cy="22" r="2" fill="#251F20"/>
    <circle cx="30" cy="22" r="2" fill="#251F20"/>
    <circle cx="24" cy="28" r="2.5" fill="#251F20"/>
    <circle cx="16" cy="30" r="1.5" fill="#251F20"/>
    <circle cx="32" cy="30" r="1.5" fill="#251F20"/>
    <rect x="10" y="10" width="28" height="28" rx="4" stroke="#251F20" strokeWidth="2.5"/>
  </svg>
);

const BrainIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M24 40V24" stroke="#251F20" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M24 24C24 24 18 22 16 18C14 14 16 10 20 8C22 7 24 8 24 8C24 8 26 7 28 8C32 10 34 14 32 18C30 22 24 24 24 24Z" stroke="#251F20" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 16C18 16 20 18 24 18C28 18 30 16 30 16" stroke="#251F20" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M14 24C12 26 12 30 16 32" stroke="#251F20" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M34 24C36 26 36 30 32 32" stroke="#251F20" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const BatteryLowIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="14" width="34" height="20" rx="3" stroke="#251F20" strokeWidth="2.5"/>
    <rect x="38" y="20" width="6" height="8" rx="1.5" fill="#251F20"/>
    <rect x="8" y="18" width="6" height="12" rx="1.5" fill="#251F20"/>
    <path d="M20 22L18 25H22L20 28" stroke="#251F20" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NoneIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 14L34 34M34 14L14 34" stroke="#251F20" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const ICON_MAP = {
  "arrow-down": ArrowDownIcon,
  comb: CombIcon,
  skin: SkinIcon,
  brain: BrainIcon,
  "battery-low": BatteryLowIcon,
  none: NoneIcon,
};

const NadPlusAgingEffectsStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onQuizChromeVisibilityChange,
}) => {
  const field = stepConfig?.field || "agingEffects";
  const options = stepConfig?.options || [];

  const [selected, setSelected] = useState(
    userData?.[field] || [],
  );

  useEffect(() => {
    onQuizChromeVisibilityChange?.(false);
    return () => onQuizChromeVisibilityChange?.(false);
  }, [onQuizChromeVisibilityChange]);

  useEffect(() => {
    setSelected(userData?.[field] || []);
  }, [userData, field]);

  const handleToggle = (id) => {
    let next;
    if (id === "none") {
      next = selected.includes("none") ? [] : ["none"];
    } else {
      const without = selected.filter((s) => s !== "none" && s !== id);
      next = selected.includes(id) ? without : [...without, id];
    }
    setSelected(next);
    setUserData((prev) => ({ ...prev, [field]: next }));
  };

  const handleNext = () => {
    if (!selected.length) return;
    onContinue({ ...userData, [field]: selected });
  };

  return (
    <div className="flex w-full flex-col px-2 pb-12 lg:pt-6 pt-4">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
        <h1 className="headers-font text-5xl font-normal leading-[125%] tracking-[-0.02em] text-[#251F20]">
          {userData?.sex === "female" ? "Women" : "Men"} experience{" "}
          <span style={{ color: ACCENT }}>unique effects</span> from aging.
        </h1>
        <p className="mt-4 font-sans text-3xl leading-[145%] text-[#251F20]/85">
          Do you experience any of the following?{" "}
          <span className="text-[#C45C4A]" aria-hidden>*</span>
        </p>

        <div className="lg:mt-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          {options.map((option) => {
            const IconComponent = ICON_MAP[option.icon];
            const isSel = selected.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSel}
                onClick={() => handleToggle(option.id)}
                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 bg-white px-3 py-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 ${
                  isSel ? "border-[#A7885A] shadow-sm" : "border-[#E5E2DC]"
                }`}
              >
                <div className="h-12 w-12 shrink-0 flex items-center justify-center">
                  {IconComponent && <IconComponent />}
                </div>
                <span className="headers-font mt-3 text-center text-sm leading-snug text-[#251F20]">
                  {option.label}
                </span>
                {option.subtitle && (
                  <span className="mt-1 text-center font-sans text-xs leading-tight text-[#251F20]/60">
                    {option.subtitle}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          disabled={!selected.length}
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

export default NadPlusAgingEffectsStep;
