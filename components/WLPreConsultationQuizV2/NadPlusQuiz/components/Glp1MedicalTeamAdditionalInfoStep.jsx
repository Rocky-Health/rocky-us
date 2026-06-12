"use client";

import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const Glp1MedicalTeamAdditionalInfoStep = ({
    userData,
    setUserData,
    config,
    onContinue,
}) => {
    const field = config.field;
    const detailsField = config.detailsField;
    const selectedValue = userData?.[field] || "";
    const detailsValue = userData?.[detailsField] ?? "";
    const options = config?.options || [];

    const introLead =
        config?.introLead ??
        "MyRocky medical providers typically review every form";
    const introHighlight = config?.introHighlight ?? "within 6-24 hours.";
    const questionText =
        config?.question ??
        "Do you have any further information which you would like our medical team to know?";
    const detailsLabel =
        config?.detailsLabel ??
        "Provide details here. Please do not include urgent or emergency medical information.";

    const [error, setError] = useState("");

    const canContinue =
        selectedValue === "no" ||
        (selectedValue === "yes" && String(detailsValue).trim().length > 0);

    const handleSelect = (value) => {
        if (error) setError("");
        setUserData((prev) => {
            const next = { ...prev, [field]: value };
            if (value === "no" && detailsField) {
                next[detailsField] = "";
            }
            return next;
        });
    };

    const handleDetailsChange = (e) => {
        const v = e.target.value;
        if (!detailsField) return;
        if (error) setError("");
        setUserData((prev) => ({ ...prev, [detailsField]: v }));
    };

    const handleNext = () => {
        if (!canContinue) {
            setError("Please select an option to continue.");
            return;
        }
        setError("");
        onContinue?.();
    };

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow lg:pb-10 pb-6">
                <h1 className="subheaders-font mb-8 text-5xl leading-[115%] tracking-[-0.02em] text-[#251F20]">
                    {introLead}{" "}
                    <span className="text-[#A7885A]">{introHighlight}</span>
                </h1>

                <h2 className="mt-8 subheaders-font text-3xl leading-[110%] text-[#251F20]">
                    {questionText}
                    <span className="text-red-600"> *</span>
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4">
                    {options.map((option) => {
                        const checked = selectedValue === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option.id)}
                                className={`flex min-h-[55px] items-center gap-3 rounded-[8px] border bg-white px-4 py-3 text-left md:min-h-[60px] md:px-5 ${
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
                                        <span className="h-3.5 w-3.5 rounded-full bg-[#A7885A]" />
                                    ) : null}
                                </span>
                                <span className="text-[15px] font-medium text-[#000000]">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {selectedValue === "yes" && detailsField ? (
                    <div className="mt-8">
                        <label
                            htmlFor="glp1-medical-team-additional-info"
                            className="mb-2 block text-lg font-normal leading-[140%] text-[#251F20]"
                        >
                            {detailsLabel}
                            <span className="text-red-600"> *</span>
                        </label>
                        <textarea
                            id="glp1-medical-team-additional-info"
                            value={detailsValue}
                            onChange={handleDetailsChange}
                            rows={5}
                            className="w-full resize-y rounded-[8px] border border-[#E2E2E1] bg-white px-3 py-3 text-[15px] text-[#251F20] outline-none focus:border-[#A7885A] focus:ring-1 focus:ring-[#A7885A]"
                            autoComplete="off"
                        />
                    </div>
                ) : null}
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

export default Glp1MedicalTeamAdditionalInfoStep;
