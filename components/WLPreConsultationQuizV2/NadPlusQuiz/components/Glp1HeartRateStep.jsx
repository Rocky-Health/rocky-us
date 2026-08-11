"use client";

import React, { useState } from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const Glp1HeartRateStep = ({ userData, setUserData, config, onContinue }) => {
    const field = config.field;
    const selectedValue = userData?.[field] || "";
    const options = config?.options || [];
    const imageSrc = config?.imageSrc || "/glp-3-quiz/heart-rate.jpg";
    const questionText =
        config?.question || "How about your average resting heart rate?";
    const imageAlt =
        config?.imageAlt || "Person using a pulse oximeter on their finger";
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
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow pb-10">
                <div className="relative mx-auto mb-6 aspect-[16/10] w-full lg:max-w-md max-w-sm overflow-hidden rounded-[12px]">
                    <CustomImage
                        src={imageSrc}
                        alt={imageAlt}
                        fill
                        sizes="(max-width: 768px) 100vw, 450px"
                        className="object-contain"
                    />
                </div>

                <h1 className="subheaders-font text-3xl font-normal leading-[130%] text-[#251F20]">
                    {questionText}
                </h1>

                <div className="mt-6 space-y-3">
                    {options.map((option) => {
                        const checked = selectedValue === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option.id)}
                                className={`flex min-h-[55px] w-full items-center gap-3 rounded-[8px] border bg-white px-4 text-left ${
                                    checked
                                        ? "border-[#A7885A]"
                                        : "border-[#E2E2E1]"
                                }`}
                            >
                                <span
                                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
                                        checked
                                            ? "border-[#A7885A]"
                                            : "border-[#CFCFCF]"
                                    }`}
                                >
                                    {checked ? (
                                        <span
                                            className="h-3.5 w-3.5 rounded-full"
                                            style={{ backgroundColor: ACCENT }}
                                        />
                                    ) : null}
                                </span>
                                <span className="text-[15px] font-medium text-[#000000]">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] px-0 pb-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl">
                    {error && (
                        <p className="text-red-500 text-[13px] mb-2 text-center">{error}</p>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 text-base font-medium bg-[#A7885A] text-white focus:outline-none focus:ring-0"
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glp1HeartRateStep;
