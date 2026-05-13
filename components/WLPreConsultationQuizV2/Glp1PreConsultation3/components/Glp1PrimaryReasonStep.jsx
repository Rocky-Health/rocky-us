"use client";

import React, { useState, useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const Glp1PrimaryReasonStep = ({
    userData,
    setUserData,
    config,
    onContinue,
}) => {
    const field = config?.field || "glp1PrimaryReason";
    const options = config?.options || [];
    const [selected, setSelected] = useState(() => userData?.[field] ?? null);

    useEffect(() => {
        setSelected(userData?.[field] ?? null);
    }, [userData, field]);

    const handleNext = () => {
        if (selected == null) return;
        const next = { ...userData, [field]: selected };
        setUserData(next);
        onContinue?.(next);
    };

    return (
        <div className="flex w-full flex-col px-4 pb-10 md:px-0">
            <div className="mx-auto w-full max-w-4xl">
                <h1 className="headers-font text-5xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20]">
                    Improving your life requires{" "}
                    <span className="headers-font " style={{ color: ACCENT }}>
                        motivation.
                    </span>
                </h1>

                <p className="headers-font mt-6 text-3xl font-normal leading-[140%] text-[#251F20]">
                    What is your{" "}
                    <span className="font-bold">primary reason</span> for
                    looking into GLP-1 medication?{" "}
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
                                className={`flex min-h-[60px] w-full items-center gap-3 rounded-xl border bg-white px-4 text-left transition-colors ${
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

                <button
                    type="button"
                    onClick={handleNext}
                    disabled={selected == null}
                    className="mt-10 flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none font-sans text-base font-medium text-white transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: ACCENT }}
                >
                    <span>Next</span>
                    <FaArrowRight className="text-sm" />
                </button>
            </div>
        </div>
    );
};

export default Glp1PrimaryReasonStep;
