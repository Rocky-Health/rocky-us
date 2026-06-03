"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const BatteryLow = () => (
  <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="8" width="52" height="32" rx="4" stroke="#251F20" strokeWidth="3"/>
    <rect x="54" y="18" width="8" height="12" rx="2" fill="#251F20"/>
    <rect x="8" y="14" width="10" height="20" rx="2" fill="#251F20"/>
  </svg>
);

const BatteryMedium = () => (
  <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="8" width="52" height="32" rx="4" stroke="#251F20" strokeWidth="3"/>
    <rect x="54" y="18" width="8" height="12" rx="2" fill="#251F20"/>
    <rect x="8" y="14" width="10" height="20" rx="2" fill="#251F20"/>
    <rect x="22" y="14" width="10" height="20" rx="2" fill="#251F20"/>
  </svg>
);

const BatteryFull = () => (
  <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="8" width="52" height="32" rx="4" stroke="#251F20" strokeWidth="3"/>
    <rect x="54" y="18" width="8" height="12" rx="2" fill="#251F20"/>
    <rect x="8" y="14" width="10" height="20" rx="2" fill="#251F20"/>
    <rect x="22" y="14" width="10" height="20" rx="2" fill="#251F20"/>
    <rect x="36" y="14" width="10" height="20" rx="2" fill="#251F20"/>
  </svg>
);

const ICON_MAP = {
  "battery-low": BatteryLow,
  "battery-medium": BatteryMedium,
  "battery-full": BatteryFull,
};

const NadPlusEnergyStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onQuizChromeVisibilityChange,
}) => {
  const field = stepConfig?.field || "energyLevel";
  const options = stepConfig?.options || [];

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
          Your energy levels{" "}
          <span style={{ color: ACCENT }}>rapidly decline</span> as{" "}
          <span style={{ color: ACCENT }}>you age.</span>
        </h1>
        <p className="mt-4 font-sans text-3xl leading-[145%] text-[#251F20]/85">
          How is your overall energy?
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

export default NadPlusEnergyStep;
