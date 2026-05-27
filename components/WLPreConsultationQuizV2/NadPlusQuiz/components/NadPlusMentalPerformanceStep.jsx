"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const NadPlusMentalPerformanceStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onQuizChromeVisibilityChange,
}) => {
  const field = stepConfig?.field || "mentalPerformance";
  const options = stepConfig?.options || [];
  const imageSrc = stepConfig?.imageSrc || "/nad+/women-quiz.png";

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
        <div className="relative mx-auto mb-6 h-[220px] w-[280px] overflow-hidden rounded-xl lg:h-[260px] lg:w-[340px]">
          <Image
            src={imageSrc}
            alt="Mental performance"
            fill
            className="object-cover"
            priority
          />
        </div>

        <h2 className="headers-font text-3xl font-normal leading-[130%] tracking-[-0.01em] text-[#251F20] lg:text-4xl">
          How would you rate your current mental performance?
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isSel = selected === option.id;
            return (
              <button
                key={option.id}
                type="button"
                aria-pressed={isSel}
                onClick={() => handleSelect(option.id)}
                className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 ${
                  isSel ? "border-[#A7885A]" : "border-[#E5E2DC]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSel
                      ? "border-[#A7885A] bg-[#A7885A]"
                      : "border-[#ccc] bg-white"
                  }`}
                  aria-hidden
                >
                  {isSel && (
                    <span className="block h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="font-sans text-base leading-snug text-[#251F20]">
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

export default NadPlusMentalPerformanceStep;
