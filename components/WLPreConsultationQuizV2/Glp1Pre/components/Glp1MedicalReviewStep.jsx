"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";

const LOW_RATE = 0.015;

function computeWeeks(weight, goalWeight) {
  const w = parseFloat(weight) || 0;
  const g = parseFloat(goalWeight) || 0;
  const lbs = Math.max(w - g, 0);
  const lossPerWeek = +(w * LOW_RATE).toFixed(2);
  if (!lossPerWeek || !lbs) return null;
  return +(lbs / lossPerWeek).toFixed(1);
}

const Glp1MedicalReviewStep = ({ userData, onContinue }) => {
  const bmi = parseFloat(userData?.bmi) || null;
  const weight = parseFloat(userData?.weight) || null;
  const goalWeight = parseFloat(userData?.goalWeight || userData?.goal) || null;
  const weeks = weight && goalWeight ? computeWeeks(weight, goalWeight) : null;

  return (
    <div className="w-full h-full flex flex-col px-4 md:px-0">
      <div className="w-full md:w-[580px] mx-auto flex-grow">
        <h1 className="headers-font text-[32px] md:text-[40px] leading-[110%] text-[#AE7E56] text-center mb-8">
          Your Medical Review
        </h1>

        {/* Stats block */}
        <div className="mb-4 space-y-1">
          {bmi !== null && (
            <p className="text-[16px] text-[#251F20]">
              <span className="font-semibold">BMI</span>: {bmi.toFixed(2)}
            </p>
          )}
          {weight !== null && (
            <p className="text-[16px] text-[#251F20]">
              <span className="font-semibold">Current Weight</span>: {weight}lbs
            </p>
          )}
          {goalWeight !== null && (
            <p className="text-[16px] text-[#251F20]">
              <span className="font-semibold">Goal Weight</span>: {goalWeight}
              lbs
              {weeks !== null && (
                <>
                  {" "}
                  <span className="underline">within {weeks} weeks</span>
                </>
              )}
            </p>
          )}
        </div>

        <div className="w-full h-[1px] bg-[#E2E2E1] mb-4" />

        {/* Candidate statement */}
        <p className="text-[15px] leading-[150%] text-[#251F20] mb-4">
          You are a <strong>strong candidate</strong> for medical weight loss
          with a <strong>94% chance</strong> of successful treatment if
          qualified.
        </p>

        <div className="w-full h-[1px] bg-[#E2E2E1] mb-6" />

        {/* CTA line */}
        <p className="headers-font text-[26px] md:text-[32px] leading-[115%] text-[#251F20]">
          Let&apos;s proceed to check your eligibility.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] backdrop-blur-sm">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          <button
            type="button"
            onClick={() => onContinue?.()}
            className="w-full py-3 flex items-center justify-center gap-2 rounded-full h-[52px] font-medium border-none bg-black text-white focus:outline-none focus:ring-0"
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Glp1MedicalReviewStep;
