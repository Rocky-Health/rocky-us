"use client";

import React from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const PRIMARY = "#A7885A";

const Glp1WeightChangedStep = ({
    userData,
    setUserData,
    config,
    onContinue,
}) => {
    const field = config.field;
    const imageSrc = config.heroImageSrc || "/glp-quiz/wl-changed.png";
    const selectedValue = userData?.[field] || "";
    const options = config?.options || [];

    const handleSelect = (value) => {
        setUserData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleNext = () => {
        if (!selectedValue) return;
        const next = { ...userData, [field]: selectedValue };
        setUserData(next);
        onContinue?.(next);
    };

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full flex-grow pb-10">
                <div className="relative mb-6 aspect-[16/10] lg:max-w-md max-w-sm mx-auto w-full overflow-hidden rounded-[12px] ">
                    <CustomImage
                        src={imageSrc}
                        alt="Weight and scale"
                        fill
                        className="object-contain"
                    />
                </div>

                <h1 className="subheaders-font text-3xl font-normal leading-[130%] text-[#251F20]">
                    Has your weight changed in the last year?
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
                                        ? "border-[#251F20]"
                                        : "border-[#E2E2E1]"
                                }`}
                                style={
                                    checked
                                        ? {
                                              boxShadow: `inset 0 0 0 1px ${PRIMARY}`,
                                          }
                                        : undefined
                                }
                            >
                                <span
                                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                                        checked
                                            ? "border-transparent"
                                            : "border-[#CFCFCF]"
                                    }`}
                                    style={
                                        checked
                                            ? { backgroundColor: PRIMARY }
                                            : undefined
                                    }
                                >
                                    {checked ? (
                                        <span className="h-2 w-2 rounded-full bg-white" />
                                    ) : null}
                                </span>
                                <span className="text-[15px] font-medium text-black">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className=" bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] px-0 pb-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl">
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!selectedValue}
                        className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 text-base font-medium focus:outline-none focus:ring-0 ${
                            selectedValue
                                ? "text-white"
                                : "cursor-not-allowed bg-gray-300 text-gray-600"
                        }`}
                        style={
                            selectedValue
                                ? { backgroundColor: PRIMARY }
                                : undefined
                        }
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glp1WeightChangedStep;
