"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const Glp1RecentGlp1WeightLossStep = ({
    userData,
    setUserData,
    config,
    onContinue,
}) => {
    const field = config?.field || "glp1RecentGlp1WeightLoss";
    const options = config?.options || [];
    const [selected, setSelected] = useState(() => userData?.[field] ?? null);

    useEffect(() => {
        setSelected(userData?.[field] ?? null);
    }, [userData, field]);

    const handleNext = () => {
        if (selected == null) return;
        let next = { ...userData, [field]: selected };
        if (selected === "no") {
            delete next.priorMedNameDoseFrequency;
            delete next.priorMedLastDose;
            delete next.priorMedPrescriber;
            delete next.priorMedPrescriberOther;
        }
        setUserData(next);
        onContinue?.(next);
    };

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow pb-14">
                <p className="subheaders-font text-3xl font-normal leading-[130%] text-[#251F20] ">
                    Have you taken GLP-1 medication for weight loss within the
                    past 4 weeks?{" "}
                    <span className="text-red-600" aria-hidden>
                        *
                    </span>
                </p>

                <div className="mt-6 space-y-3">
                    {options.map((option) => {
                        const isSel = selected === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setSelected(option.id)}
                                className={`flex min-h-[60px] w-full items-center gap-3 rounded-xl border bg-white px-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 ${
                                    isSel
                                        ? "border-2"
                                        : "border border-[#E2E2E1]"
                                }`}
                                style={
                                    isSel ? { borderColor: ACCENT } : undefined
                                }
                            >
                                <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                        isSel
                                            ? "border-transparent"
                                            : "border-[#CFCFCF]"
                                    }`}
                                    style={
                                        isSel
                                            ? { backgroundColor: ACCENT }
                                            : undefined
                                    }
                                >
                                    {isSel ? (
                                        <span className="h-2 w-2 rounded-full bg-white" />
                                    ) : null}
                                </span>
                                <span className="text-[15px] font-medium leading-[140%] text-black md:text-base">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className=" bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)]  pb-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl">
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={selected == null}
                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 text-base font-medium text-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                        style={
                            selected != null
                                ? { backgroundColor: ACCENT }
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

export default Glp1RecentGlp1WeightLossStep;
