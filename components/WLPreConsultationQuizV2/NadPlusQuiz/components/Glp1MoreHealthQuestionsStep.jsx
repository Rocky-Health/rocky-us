"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";

const PRIMARY = "#A7885A";
const NONE_ID = "none";

const Glp1MoreHealthQuestionsStep = ({
    userData,
    setUserData,
    config,
    onContinue,
}) => {
    const field = config.field;
    const options = config.options || [];
    const selectedValues = userData?.[field] || [];

    const handleSelect = (id) => {
        setUserData((prev) => {
            const current = prev[field] || [];
            let next;
            if (id === NONE_ID) {
                next = current.includes(NONE_ID) ? [] : [NONE_ID];
            } else {
                const withoutNone = current.filter((v) => v !== NONE_ID);
                next = withoutNone.includes(id)
                    ? withoutNone.filter((v) => v !== id)
                    : [...withoutNone, id];
            }
            return { ...prev, [field]: next };
        });
    };

    const handleNext = () => {
        if (selectedValues.length === 0) return;
        onContinue?.();
    };

    const canContinue = selectedValues.length > 0;

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow pb-10">
                <h1 className="headers-font text-5xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20]">
                    A few more health questions
                </h1>

                <p className="headers-font mt-6 text-3xl font-normal leading-[140%] text-[#251F20]">
                    Do any of these apply to you?{" "}
                    <span className="text-red-600">*</span>
                </p>

                <div className="mt-5 space-y-1">
                    {options.map((option) => {
                        const checked = selectedValues.includes(option.id);
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option.id)}
                                className="flex w-full items-center gap-2 px-2 py-2 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2"
                            >
                                <span
                                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[4px] border ${
                                        checked
                                            ? "border-[#CFCFCF] bg-white"
                                            : "border-[#CFCFCF] bg-[#F5F5F5]"
                                    }`}
                                >
                                    {checked ? (
                                        <span
                                            className="h-2.5 w-2.5 rounded-[2px]"
                                            style={{ backgroundColor: PRIMARY }}
                                        />
                                    ) : null}
                                </span>
                                <span className="text-base font-normal leading-[140%] text-black">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className=" bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] px-4 pb-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl">
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canContinue}
                        className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 text-base font-medium focus:outline-none focus:ring-0 ${
                            canContinue
                                ? "text-white"
                                : "cursor-not-allowed bg-gray-300 text-gray-600"
                        }`}
                        style={
                            canContinue
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

export default Glp1MoreHealthQuestionsStep;
