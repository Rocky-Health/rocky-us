"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";

const OPTIONS = [
    { value: "works-for-me", label: "Works for me" },
    { value: "faster", label: "I want it faster" },
    { value: "too-fast", label: "That\u2019s too fast" },
];

const Glp2PaceQuestionStep = ({ userData, setUserData, onContinue }) => {
    const selectedValue = userData?.pacePreference || "";

    const handleSelect = (value) => {
        setUserData((prev) => ({
            ...prev,
            pacePreference: value,
        }));
    };

    return (
        <div className="w-full h-full flex flex-col px-4 md:px-0">
            <div className="w-full md:w-[580px] mx-auto flex-grow  headers-font">
                <h1 className="headers-font text-[32px] leading-[105%] text-[#251F20] mb-10">
                    With Medication, You&apos;ll Lose 3.75 To 4.17 Pounds{" "}
                    <span className="text-[#AE7E56]">Per Week.</span>
                </h1>
                <p className="text-[18px] leading-[130%] text-[#00000099] mb-[24px]">
                    It will take about 24.0 weeks to reach your goal weight of
                    160.
                </p>

                <h2 className="headers-font text-[24px] leading-[115%] text-[#000000] mb-[24px]">
                    How Is That Pace For You?
                </h2>

                <div className="space-y-3">
                    {OPTIONS.map((option) => {
                        const checked = selectedValue === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => handleSelect(option.value)}
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
