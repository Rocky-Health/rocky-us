"use client";

import React, { useState } from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const Glp2WeightChangedStep = ({
    userData,
    setUserData,
    config,
    onContinue,
}) => {
    const selectedValue = userData?.[config.field] || "";
    const options = config?.options || [];
    const [error, setError] = useState("");

    const handleSelect = (value) => {
        if (error) setError("");
        setUserData((prev) => ({
            ...prev,
            [config.field]: value,
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
        <div className="w-full h-full flex flex-col px-4 md:px-0">
            <div className="w-full mx-auto flex-grow pb-32 md:pb-36">
                <div className="rounded-[12px] overflow-hidden mb-6 relative w-full h-[223.44] md:h-[386.85]">
                    <CustomImage
                        src="/glp-quiz/wl-changed.png"
                        alt="Weight changed"
                        fill
                        className="object-cover"
                    />
                </div>

                <h1 className="headers-font text-[32px] leading-[115%] text-[#251F20] mb-6">
                    Has Your Weight Changed In The Last Year?
                </h1>

                <div className="space-y-3">
                    {options.map((option) => {
                        const checked = selectedValue === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option.id)}
                                className={`w-full min-h-[55px] rounded-[8px] border px-4 text-left flex items-center gap-3 bg-white ${
                                    checked
                                        ? "border-[#AE7E56]"
                                        : "border-[#E2E2E1]"
                                }`}
                            >
                                <span
                                    className={`w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 ${
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
                <div className="w-full max-w-xl">
                    {error && (
                        <p className="text-red-500 text-[13px] mb-2 text-center">{error}</p>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        className="w-full py-3 flex items-center justify-center gap-2 rounded-full h-[52px] font-medium border-none bg-black text-white focus:outline-none focus:ring-0"
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glp2WeightChangedStep;
