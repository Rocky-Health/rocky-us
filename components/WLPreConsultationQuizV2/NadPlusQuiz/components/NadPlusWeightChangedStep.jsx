"use client";

import React, { useEffect } from "react";
import Image from "next/image";

const NadPlusWeightChangedStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onQuizChromeVisibilityChange,
}) => {
  const field = stepConfig?.field || "weightChanged";
  const options = stepConfig?.options || [];
  const imageSrc = stepConfig?.imageSrc || "/nad+/weightloss-scale.png";

  useEffect(() => {
    onQuizChromeVisibilityChange?.(false);
    return () => onQuizChromeVisibilityChange?.(false);
  }, [onQuizChromeVisibilityChange]);

  const handleSelect = (id) => {
    setUserData((prev) => ({ ...prev, [field]: id }));
    onContinue({ ...userData, [field]: id });
  };

  return (
    <div className="flex w-full flex-col px-2 pb-12 lg:pt-6 pt-4">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
        <div className="relative mx-auto mb-6 h-[200px] w-[280px] overflow-hidden rounded-xl lg:h-[240px] lg:w-[340px]">
          <Image
            src={imageSrc}
            alt="Weight scale"
            fill
            className="object-cover"
            priority
          />
        </div>

        <h2 className="headers-font text-3xl font-normal leading-[130%] tracking-[-0.01em] text-[#251F20] lg:text-4xl">
          Has your weight changed in the last year?
        </h2>

        <p className="mt-4 font-sans text-base leading-[155%] text-[#251F20]/80">
          NAD+ helps cellular function throughout your body and may also assist
          with metabolic performance and agility. In short, NAD+ could help your
          body become more efficient at burning calories, which may also cause it
          to lose weight more quickly or efficiently than it would otherwise.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          {options.map((option) => {
            const isSel = userData?.[field] === option.id;
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
      </div>
    </div>
  );
};

export default NadPlusWeightChangedStep;
