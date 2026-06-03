"use client";

import React, { useState } from "react";
import CustomImage from "@/components/utils/CustomImage";

const ACCENT_BLUE = "#A7885A";
const BTN_BLUE = "#A7885A";

const Glp2GoalWeightStep = ({ userData, setUserData, onContinue }) => {
    const bmi = userData?.bmi ? parseFloat(userData.bmi).toFixed(0) : null;
    const [goalWeight, setGoalWeight] = useState(userData?.goalWeight || "");

    const handleNext = () => {
        if (!goalWeight.trim()) return;
        setUserData((prev) => ({ ...prev, goalWeight: goalWeight.trim() }));
        onContinue?.();
    };

    return (
        <div className="flex h-full w-full flex-col">
            <div className="mx-auto w-full flex-grow pb-10">
                {bmi && (
                    <p className="headers-font mb-6 text-3xl leading-[140%]">
                        <span className="font-semibold text-[#4A916C]">
                            Great — you qualify
                        </span>{" "}
                        <span className="text-[#251F20]">
                            With a BMI of {bmi}, we can continue.
                        </span>
                    </p>
                )}

                <h2 className="subheaders-font mb-8 text-5xl leading-[115%] tracking-[-0.02em] text-[#251F20]">
                    We&apos;re in this together.{" "}
                    <span style={{ color: ACCENT_BLUE }}>
                        Your goal is our goal.
                    </span>
                </h2>

                <label
                    className="subheaders-font mb-2 block text-3xl font-medium text-[#000000]"
                    htmlFor="nad-plus-goal-weight"
                >
                    What is your goal weight (lbs)?
                </label>
                <input
                    id="nad-plus-goal-weight"
                    type="number"
                    inputMode="decimal"
                    enterKeyHint="done"
                    placeholder=""
                    value={goalWeight}
                    onChange={(e) => setGoalWeight(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && goalWeight.trim())
                            handleNext();
                    }}
                    className="mb-8 h-[52px] w-full rounded-md border border-[#E2E2E1] bg-white px-4 text-[16px] text-[#251F20] placeholder-[#ADADAD] focus:border-[#A7885A] focus:outline-none"
                />

                <div className="w-full max-w-4xl">
                    <button
                        type="button"
                        disabled={!goalWeight.trim()}
                        onClick={handleNext}
                        style={{
                            backgroundColor: goalWeight.trim()
                                ? BTN_BLUE
                                : undefined,
                        }}
                        className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 font-medium text-white headers-font focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600`}
                    >
                        <span>Next</span>
                        <span aria-hidden className="text-lg leading-none">
                            →
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glp2GoalWeightStep;
