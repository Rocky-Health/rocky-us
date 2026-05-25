"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { sanitizeSvg } from "@/utils/sanitizeHtml";

const LOW_RATE = 0.015;
const HIGH_RATE = 0.01666;

function computeProjection(weight, goalWeight) {
  const w = parseFloat(weight) || 0;
  const g = parseFloat(goalWeight) || 0;
  const lbs = Math.max(w - g, 0);
  const lossPerWeekLow = Math.round(w * LOW_RATE);
  const lossPerWeekHigh = Math.round(w * HIGH_RATE);
  const weeksToGoal =
    lossPerWeekLow > 0 ? Math.round(lbs / lossPerWeekLow) : null;
  const weeksToGoalFast =
    lossPerWeekHigh > 0 ? Math.round(lbs / lossPerWeekHigh) : null;
  return {
    lbs,
    lossPerWeekLow,
    lossPerWeekHigh,
    weeksToGoal,
    weeksToGoalFast,
    goalWeight: g,
  };
}

const OPTIONS = [
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-check">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M5 12l5 5l10 -10"></path>
</svg>
`,
    value: "works-for-me",
    label: "Works for me",
  },
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-run">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <circle cx="13" cy="4" r="1"></circle>
  <path d="M4 17l5 1 l.75 -1.5"></path>
  <path d="M15 21l0 -4l-4 -3l1 -6"></path>
  <path d="M7 12l0 -3l5 -1l3 3l3 1"></path>
</svg>
`,
    value: "faster",
    label: "I want it faster",
  },
  {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-hourglass-low">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
  <path d="M6.5 17h11"></path>
  <path d="M6 20v-2a6 6 0 1 1 12 0v2a1 1 0 0 1 -1 1h-10a1 1 0 0 1 -1 -1z"></path>
  <path d="M6 4v2a6 6 0 1 0 12 0v-2a1 1 0 0 0 -1 -1h-10a1 1 0 0 0 -1 1z"></path>
</svg>
`,
    value: "too-fast",
    label: "That\u2019s too fast",
  },
];

const Glp2PaceQuestionStep = ({ userData, setUserData, onContinue }) => {
  const selectedValue = userData?.pacePreference || "";
  const { lossPerWeekLow, lossPerWeekHigh, weeksToGoal, goalWeight } =
    computeProjection(userData?.weight, userData?.goalWeight || userData?.goal);

  const hasProjection = lossPerWeekLow > 0 && goalWeight > 0;

  const handleSelect = (value) => {
    setUserData((prev) => ({
      ...prev,
      pacePreference: value,
    }));
  };

  return (
    <div className="w-full h-full flex flex-col px-4 md:px-0">
      <div className="w-full md:w-[580px] mx-auto flex-grow headers-font">
        <h1 className="headers-font text-[32px] leading-[105%] text-[#251F20] mb-10">
          {hasProjection ? (
            <>
              With Medication, You&apos;ll Lose{" "}
              {lossPerWeekLow === lossPerWeekHigh
                ? lossPerWeekLow
                : `${lossPerWeekLow} To ${lossPerWeekHigh}`}{" "}
              Pounds{" "}
            </>
          ) : (
            "With Medication, You'll Lose Weight "
          )}
          <span className="text-[#AE7E56]">Per Week.</span>
        </h1>
        <p className="text-[18px] leading-[130%] text-[#00000099] mb-[24px]">
          {hasProjection && weeksToGoal
            ? `It will take about ${weeksToGoal} weeks to reach your goal weight of ${goalWeight}.`
            : "You're on your way to reaching your goal weight."}
        </p>

        <h2 className="headers-font text-[24px] leading-[115%] text-[#000000] mb-[24px]">
          How Is That Pace For You?
        </h2>

        <div className="flex flex-row gap-3">
          {OPTIONS.map((option) => {
            const checked = selectedValue === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`flex-1 min-w-0 h-[208px] rounded-[12px] border px-4 py-5 text-left flex flex-col items-center justify-between bg-white ${
                  checked ? "border-[#AE7E56]" : "border-[#E2E2E1]"
                }`}
              >
                <div className="w-full flex justify-center">
                  <span
                    className={`w-[94px] h-[94px] flex items-center justify-center text-[#3D342F] [&_svg]:w-full [&_svg]:h-full ${
                      checked ? "text-[#AE7E56]" : "text-[#3D342F]"
                    }`}
                    dangerouslySetInnerHTML={{ __html: sanitizeSvg(option.svg) }}
                  />
                </div>

                <div className="w-full flex items-center gap-3 justify-start">
                  <span
                    className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center flex-none ${
                      checked ? "border-[#AE7E56]" : "border-[#CFCFCF]"
                    }`}
                  >
                    {checked ? (
                      <span className="w-3.5 h-3.5 rounded-full bg-[#AE7E56]" />
                    ) : null}
                  </span>
                  <span className="text-[15px] text-[#000000] font-medium leading-none">
                    {option.label}
                  </span>
                </div>
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

export default Glp2PaceQuestionStep;
