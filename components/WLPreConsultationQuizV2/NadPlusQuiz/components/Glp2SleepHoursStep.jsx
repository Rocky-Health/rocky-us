"use client";

import React, { useState } from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const Glp2SleepHoursStep = ({ userData, setUserData, config, onContinue }) => {
    const field = config?.field || "sleepHours";
    const selectedValue = userData?.[field] || "";
    const options = config?.options || [];
    const [error, setError] = useState("");

    const handleSelect = (id) => {
        if (error) setError("");
        setUserData((prev) => ({
            ...prev,
            [field]: id,
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
            <div className="mx-auto w-full max-w-4xl">
                <div className="relative mb-8 w-full overflow-hidden rounded-xl lg:max-w-lg max-w-md mx-auto">
                    <div className="relative aspect-[14/8] w-full ">
                        <CustomImage
                            src="https://myrocky.b-cdn.net/WP%20Images/glp-offer/sleep.png"
                            alt="Woman sleeping comfortably in bed"
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 100vw, 48rem"
                            priority
                        />
                    </div>
                </div>

                <h1 className="headers-font text-4xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20]">
                    How many hours of sleep do you usually get each night?
                </h1>

                <div className="lg:mt-8 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    {options.map((option) => {
                        const checked = selectedValue === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option.id)}
                                className={`flex min-h-[60px] w-full items-center gap-3 rounded-xl border bg-white px-3 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 md:min-h-[64px] md:px-4 ${
                                    checked
                                        ? "border-2"
                                        : "border border-[#E2E2E1]"
                                }`}
                                style={
                                    checked
                                        ? { borderColor: ACCENT }
                                        : undefined
                                }
                            >
                                <span
                                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 md:h-5 md:w-5 ${
                                        checked
                                            ? "border-transparent"
                                            : "border-[#CFCFCF]"
                                    }`}
                                    style={
                                        checked
                                            ? { backgroundColor: ACCENT }
                                            : undefined
                                    }
                                    aria-hidden
                                >
                                    {checked ? (
                                        <span className="h-2 w-2 rounded-full bg-white" />
                                    ) : null}
                                </span>
                                <span className="text-left text-[13px] font-medium leading-[130%] text-[#251F20] md:text-[15px]">
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

export default Glp2SleepHoursStep;
