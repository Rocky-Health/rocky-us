"use client";

import React from "react";

const ACCENT = "#A7885A";

const Glp1RecentGlp1WeightLossStep = ({
    userData,
    setUserData,
    config,
    onSelect,
}) => {
    const field = config?.field || "glp1RecentGlp1WeightLoss";
    const options = config?.options || [];
    const selected = userData?.[field] ?? null;

    const handleOptionClick = (value, option) => {
        // Clean up prior-med fields when the user selects "no"
        if (value === "no") {
            setUserData((prev) => {
                const next = { ...prev, [field]: value };
                delete next.priorMedNameDoseFrequency;
                delete next.priorMedLastDose;
                delete next.priorMedPrescriber;
                delete next.priorMedPrescriberOther;
                return next;
            });
        }
        // Route through the dispatcher so conditionalNavigation is resolved correctly
        onSelect(value, option);
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
                                onClick={() => handleOptionClick(option.id, option)}
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
        </div>
    );
};

export default Glp1RecentGlp1WeightLossStep;
