"use client";

import React, { useState } from "react";
import { FaArrowRight, FaBed, FaMeh } from "react-icons/fa";
import { TbBedOff } from "react-icons/tb";

const ACCENT = "#A7885A";

const ICONS_BY_ID = {
    "pretty-good": FaBed,
    "bit-restless": FaMeh,
    "dont-sleep-well": TbBedOff,
};

const Glp2SleepStep = ({ userData, setUserData, config, onContinue }) => {
    const field = config?.field || "overallSleep";
    const selectedValue = userData?.[field] || "";
    const options = config?.options || [];
    const [error, setError] = useState("");

    const handleSelect = (value) => {
        if (error) setError("");
        setUserData((prev) => ({
            ...prev,
            [field]: value,
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
                <h1 className="headers-font text-5xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20]">
                    How you sleep tells us a lot about your{" "}
                    <span className="font-semibold" style={{ color: ACCENT }}>
                        cortisol
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold" style={{ color: ACCENT }}>
                        efficiency.
                    </span>
                </h1>

                <h2 className="subheaders-font mt-8 text-3xl font-normal leading-[130%] text-[#251F20]">
                    How is your overall sleep?
                </h2>

                <div
                    className="lg:mt-4 mt-2 grid w-full grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4"
                    role="group"
                    aria-label="Overall sleep quality"
                >
                    {options.map((option) => {
                        const checked = selectedValue === option.id;
                        const Icon = ICONS_BY_ID[option.id] || FaBed;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option.id)}
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

export default Glp2SleepStep;
