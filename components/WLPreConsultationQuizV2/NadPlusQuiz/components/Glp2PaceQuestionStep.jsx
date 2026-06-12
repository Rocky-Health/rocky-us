"use client";

import React, { useState } from "react";
import { FaArrowRight, FaBolt, FaCheck } from "react-icons/fa";
import { FaPersonWalking } from "react-icons/fa6";

const LOW_RATE = 0.015;
const HIGH_RATE = 0.01666;
const WEEKS_RATE = 0.0175;
const ACCENT = "#A7885A";

function computeProjection(weight, goalWeight) {
    const w = parseFloat(weight) || 0;
    const g = parseFloat(goalWeight) || 0;
    const lbs = Math.max(w - g, 0);
    const lossPerWeekLow = +(w * LOW_RATE).toFixed(1);
    const lossPerWeekHigh = +(w * HIGH_RATE).toFixed(1);
    const lossPerWeek = w * WEEKS_RATE;
    const weeksToGoal =
        lossPerWeek > 0 && lbs > 0
            ? Math.max(1, Math.ceil(lbs / lossPerWeek))
            : null;
    return {
        lbs,
        lossPerWeekLow,
        lossPerWeekHigh,
        weeksToGoal,
        goalWeight: g,
    };
}

const OPTIONS = [
    {
        value: "works-for-me",
        label: "That works for me",
        Icon: FaCheck,
    },
    {
        value: "faster",
        label: "I want it faster",
        Icon: FaPersonWalking,
    },
    {
        value: "too-fast",
        label: "That's too fast",
        Icon: FaBolt,
    },
];

const Glp2PaceQuestionStep = ({ userData, setUserData, onContinue }) => {
    const selectedValue = userData?.pacePreference || "";
    const { lossPerWeekLow, lossPerWeekHigh, weeksToGoal, goalWeight } =
        computeProjection(userData?.weight, userData?.goalWeight);

    const hasProjection = lossPerWeekLow > 0 && goalWeight > 0;
    const [error, setError] = useState("");

    const handleSelect = (value) => {
        if (error) setError("");
        setUserData((prev) => ({
            ...prev,
            pacePreference: value,
        }));
    };

    const handleNext = () => {
        if (!selectedValue) {
            setError("Please select an option to continue.");
            return;
        }
        setError("");
        onContinue?.();
    };

    return (
        <div className="flex w-full flex-col px-4 pb-10 md:px-0">
            <div className="headers-font mx-auto w-full max-w-4xl">
                <h1 className="headers-font text-5xl font-normal leading-[125%] tracking-[-0.02em] text-[#251F20]">
                    {hasProjection ? (
                        <>
                            With medication, you&apos;ll lose {lossPerWeekLow}-
                            {lossPerWeekHigh} pounds{" "}
                        </>
                    ) : (
                        <>With medication, you&apos;ll lose weight </>
                    )}
                    <span className="headers-font " style={{ color: ACCENT }}>
                        per week.
                    </span>
                </h1>

                <hr className="my-6 border-0 border-t border-[#E2E2E1]" />

                <p className="font-sans text-2xl font-normal leading-[145%] text-[#251F20]/85">
                    {hasProjection && weeksToGoal != null ? (
                        <>
                            It will take about {weeksToGoal} weeks to reach your
                            goal weight of {goalWeight}.
                        </>
                    ) : (
                        <>
                            You&apos;re on your way to reaching your goal
                            weight.
                        </>
                    )}
                </p>

                <hr className="my-6 border-0 border-t border-[#E2E2E1]" />

                <h2 className="subheaders-font text-3xl font-normal leading-[115%] text-[#251F20]">
                    How is that pace for you?
                </h2>

                <div
                    className="lg:mt-6 mt-2 grid w-full grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 max-w-4xl mx-auto"
                    role="group"
                    aria-label="Pace preference"
                >
                    {OPTIONS.map((option) => {
                        const checked = selectedValue === option.value;
                        const Icon = option.Icon;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
                                className={`flex  w-full min-w-0 flex-col rounded-xl border bg-white px-2 py-10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2  ${
                                    checked
                                        ? "border-[3px] shadow-sm"
                                        : "border border-[#E2E2E1]"
                                }`}
                                style={
                                    checked
                                        ? { borderColor: ACCENT }
                                        : undefined
                                }
                            >
                                <div className="flex min-h-0 flex-1 w-full flex-col items-center justify-center">
                                    <Icon
                                        className="h-10 w-10 text-[#251F20] sm:h-14 sm:w-14 md:h-16 md:w-16"
                                        aria-hidden
                                    />
                                </div>
                                <span className="font-medium mt-4 w-full px-0.5 text-center  leading-[1.25] text-[#251F20] text-xl">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {error && (
                    <p className="text-red-500 text-[13px] mt-4 text-center">{error}</p>
                )}
                <button
                    type="button"
                    onClick={handleNext}
                    className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none font-sans text-base font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2"
                    style={{ backgroundColor: ACCENT }}
                >
                    <span>Next</span>
                    <FaArrowRight className="text-sm" />
                </button>
            </div>
        </div>
    );
};

export default Glp2PaceQuestionStep;
