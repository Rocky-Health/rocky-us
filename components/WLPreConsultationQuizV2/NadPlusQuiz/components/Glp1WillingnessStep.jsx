"use client";

import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const PRIMARY = "#A7885A";

const Glp1WillingnessStep = ({ userData, setUserData, config, onContinue }) => {
    const field = config.field;
    const selectedValues = userData?.[field] || [];
    const options = config?.options || [];
    const [error, setError] = useState("");

    const handleSelect = (value) => {
        if (error) setError("");
        setUserData((prev) => {
            const current = prev[field] || [];
            let next;
            if (value === "none") {
                next = current.includes("none") ? [] : ["none"];
            } else {
                const withoutNone = current.filter((v) => v !== "none");
                next = withoutNone.includes(value)
                    ? withoutNone.filter((v) => v !== value)
                    : [...withoutNone, value];
            }
            return { ...prev, [field]: next };
        });
    };

    const handleNext = () => {
        if (selectedValues.length === 0) {
            setError("Please select an option to continue.");
            return;
        }
        setError("");
        const next = { ...userData, [field]: selectedValues };
        setUserData(next);
        onContinue?.(next);
    };

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full flex-grow pb-10">
                <h1 className="headers-font mb-6 text-[28px] font-normal leading-[115%] text-[#251F20] md:text-[32px]">
                    If clinically appropriate, are you willing to:
                </h1>

                <div className="space-y-3">
                    {options.map((option) => {
                        const checked = selectedValues.includes(option.id);
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option.id)}
                                className={`flex  w-full items-center gap-2 px-2 py-1 text-left ${
                                    checked ? "" : ""
                                }`}
                                style={
                                    checked
                                        ? { border: `0px solid ${PRIMARY}` }
                                        : undefined
                                }
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
                                            className="h-3 w-3 rounded-[2px]"
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

            <div className=" bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] px-0 pb-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl">
                    {error && (
                        <p className="text-red-500 text-[13px] mb-2 text-center">
                            {error}
                        </p>
                    )}
                    <button
                        type="button"
                        onClick={handleNext}
                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 text-base font-medium text-white focus:outline-none focus:ring-0"
                        style={{ backgroundColor: PRIMARY }}
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glp1WillingnessStep;
