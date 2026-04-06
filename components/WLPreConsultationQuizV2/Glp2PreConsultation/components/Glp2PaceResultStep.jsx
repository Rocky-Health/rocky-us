"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";

const HIGH_RATE = 0.0175;

function computeProjection(weight, goalWeight) {
  const w   = parseFloat(weight)     || 0;
  const g   = parseFloat(goalWeight) || 0;
  const lbs = Math.max(w - g, 0);
  const lossPerWeekHigh = +(w * HIGH_RATE).toFixed(2);
  const weeksToGoalFast = lossPerWeekHigh > 0 ? +(lbs / lossPerWeekHigh).toFixed(2) : null;
  return { lbs, weeksToGoalFast };
}

const CONSTANT_METABOLISM_LINE =
  "Now, let's analyze your metabolism and discover how well your body processes macronutrients.";

const Glp2PaceResultStep = ({ userData, onContinue }) => {
  const selected = userData?.pacePreference || "works-for-me";
  const { lbs, weeksToGoalFast } = computeProjection(userData?.weight, userData?.goalWeight);
  const lbsLabel = lbs > 0 ? `${lbs}lbs` : "your goal weight";

  const RESULT_COPY = {
    "works-for-me": {
      title: "Perfect!",
      bodyLead: `Losing ${lbsLabel} Is Easier Than You Think \u2014 And It `,
      bodyHighlight: "Doesn\u2019t Involve Restrictive Diets.",
    },
    faster: {
      title: "Not a problem, we can move faster.",
      bodyLead: weeksToGoalFast
        ? `It will take some work, but with GLP-1 medication, your goal to lose ${lbsLabel} can be achieved in about ${weeksToGoalFast} weeks \u2014 and it `
        : `With GLP-1 medication, your goal to lose ${lbsLabel} can be achieved faster \u2014 and it `,
      bodyHighlight: "doesn\u2019t involve restrictive diets.",
    },
    "too-fast": {
      title: "We\u2019ll move at your pace.",
      bodyLead: `With GLP-1 medication, your goal to lose ${lbsLabel} is easier than you think \u2014 and it `,
      bodyHighlight: "doesn\u2019t involve restrictive diets.",
    },
  };

  const copy = RESULT_COPY[selected] || RESULT_COPY["works-for-me"];

  return (
    <div className="w-full h-full flex flex-col px-4 md:px-0">
      <div className="w-full md:w-[580px] mx-auto flex-grow pb-32 md:pb-36">
        <h1 className="headers-font text-[32px] leading-[110%] text-[#251F20] mb-10">
          {copy.title}
        </h1>

        <p className="text-[24px] leading-[115%] headers-font text-[#251F20] font-medium mb-10">
          {copy.bodyLead}
          <span className="text-[#AE7E56]">{copy.bodyHighlight}</span>
        </p>

        <p className="text-[18px] md:text-[22px] leading-[135%] text-[#6F6F6F]">
          {CONSTANT_METABOLISM_LINE}
        </p>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] backdrop-blur-sm">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          <button
            type="button"
            onClick={() => onContinue?.()}
            className="w-full py-3 flex items-center justify-center gap-2 bg-black text-white rounded-full h-[52px] font-medium border-none focus:outline-none focus:ring-0"
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Glp2PaceResultStep;
