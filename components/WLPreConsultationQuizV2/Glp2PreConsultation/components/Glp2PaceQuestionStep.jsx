"use client";

import React from "react";

const LOW_RATE  = 0.015;
const HIGH_RATE = 0.01666;

function computeProjection(weight, goalWeight) {
    const w   = parseFloat(weight)     || 0;
    const g   = parseFloat(goalWeight) || 0;
    const lbs = Math.max(w - g, 0);
    const lossPerWeekLow  = +(w * LOW_RATE).toFixed(2);
    const lossPerWeekHigh = +(w * HIGH_RATE).toFixed(2);
    const weeksToGoal     = lossPerWeekLow > 0 ? +(lbs / lossPerWeekLow).toFixed(2) : null;
    const weeksToGoalFast = lossPerWeekHigh > 0 ? +(lbs / lossPerWeekHigh).toFixed(2) : null;
    return { lbs, lossPerWeekLow, lossPerWeekHigh, weeksToGoal, weeksToGoalFast, goalWeight: g };
}

const OPTIONS = [
    { value: "works-for-me", label: "Works for me" },
    { value: "faster", label: "I want it faster" },
    { value: "too-fast", label: "That\u2019s too fast" },
];

const Glp2PaceQuestionStep = ({ userData, onSelect }) => {
    const { lossPerWeekLow, lossPerWeekHigh, weeksToGoal, goalWeight } =
        computeProjection(userData?.weight, userData?.goalWeight);

    const hasProjection = lossPerWeekLow > 0 && goalWeight > 0;

    return (
        <div className="w-full h-full flex flex-col px-4 md:px-0">
            <div className="w-full md:w-[580px] mx-auto flex-grow headers-font">
                <h1 className="headers-font text-[32px] leading-[105%] text-[#251F20] mb-10">
                    {hasProjection ? (
                        <>
                            With Medication, You&apos;ll Lose {lossPerWeekLow} To{" "}
                            {lossPerWeekHigh} Pounds{" "}
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

                <div className="space-y-3">
                    {OPTIONS.map((option) => {
                        const checked = userData?.pacePreference === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onSelect(option.value, option)}
                                className={`w-full h-[55px] rounded-[8px] border px-4 text-left flex items-center gap-3 bg-white ${
                                    checked
                                        ? "border-[#AE7E56]"
                                        : "border-[#E2E2E1]"
                                }`}
                            >
                                <span
                                    className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center ${
                                        checked
                                            ? "border-[#AE7E56]"
                                            : "border-[#CFCFCF]"
                                    }`}
                                >
                                    {checked ? (
                                        <span className="w-3.5 h-3.5 rounded-full bg-[#AE7E56]" />
                                    ) : null}
                                </span>
                                <span className="text-[15px] text-[#000000] font-medium">
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

export default Glp2PaceQuestionStep;
