"use client";

import React, { useState } from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const Glp2GoalWeightStep = ({ userData, setUserData, onContinue }) => {
  const bmi = userData?.bmi ? parseFloat(userData.bmi).toFixed(2) : null;
  const [goalWeight, setGoalWeight] = useState(userData?.goalWeight || "");
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!goalWeight.trim()) {
      setError("Please enter your goal weight.");
      return;
    }
    setError("");
    setUserData((prev) => ({ ...prev, goalWeight: goalWeight.trim() }));
    onContinue?.();
  };

  return (
    <div className="w-full h-full flex flex-col px-5 md:px-0">
      <div className="w-full md:w-[580px] mx-auto flex-grow pb-32 md:pb-36">
        {/* BMI confirmation */}
        {bmi && (
          <div className="flex items-start gap-3 mb-6">
            <span className="mt-1 flex-shrink-0 w-6 h-6 rounded-full bg-[#AE7E56] flex items-center justify-center">
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6l3 3 5-5"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <div>
              <p className="text-[18px] md:text-[20px] font-semibold leading-[130%] text-[#251F20]">
                Perfect! With a BMI of {bmi}, we can continue.
              </p>
              <p className="text-[16px] md:text-[18px] leading-[140%] text-[#251F20] mt-1">
                We&apos;re in this together.{" "}
                <span className="text-[#AE7E56] font-medium">
                  Your goal is our goal.
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Goal weight title */}
        <h2 className="text-[22px] md:text-[26px] font-semibold leading-[120%] text-[#251F20] mb-4">
          What is your Goal Weight?
        </h2>

        {/* Input */}
        <input
          type="number"
          inputMode="decimal"
          placeholder="Enter your goal weight (in lbs)"
          value={goalWeight}
          onChange={(e) => {
            setGoalWeight(e.target.value);
            if (error) setError("");
          }}
          className={`w-full border rounded-[10px] px-4 py-3 text-[16px] text-[#251F20] placeholder-[#ADADAD] focus:outline-none ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-[#E2E2E1] focus:border-[#AE7E56]"
          } ${error ? "mb-2" : "mb-6"}`}
        />
        {error && <p className="text-red-500 text-[13px] mb-6">{error}</p>}

        {/* Illustration */}
        <div className="relative w-full rounded-2xl overflow-hidden aspect-[16/9]">
          <CustomImage
            src="/glp-quiz/goal-weight.png"
            alt="Join over 500K success stories"
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover"
          />
        </div>
      </div>

      {/* Fixed Next button */}
      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] backdrop-blur-sm">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          <button
            type="button"
            onClick={handleNext}
            className="w-full py-3 flex items-center justify-center gap-2 bg-black text-white rounded-full h-[40px] md:h-[52px] font-medium border-none focus:outline-none focus:ring-0 text-[12px] md:text-[16px]"
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Glp2GoalWeightStep;
