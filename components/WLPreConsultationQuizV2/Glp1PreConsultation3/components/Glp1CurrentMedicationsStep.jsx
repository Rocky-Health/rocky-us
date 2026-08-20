"use client";

import React from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const Glp1CurrentMedicationsStep = ({
    userData,
    setUserData,
    config,
    onContinue,
    onSelect,
}) => {
    const field = config.field;
    const detailsField = config.detailsField;
    const selectedValue = userData?.[field] || "";
    const detailsValue = userData?.[detailsField] ?? "";
    const options = config?.options || [];
    const imageSrc = config?.imageSrc || "/glp-3-quiz/medications.jpg";
    const questionText =
        config?.question || "Do you currently take any medications?";
    const detailsLabel =
        config?.detailsLabel ||
        "Please add some details about the current medicine you take.";
    const imageAlt =
        config?.imageAlt || "Person organizing blister packs and medication";

    const handleRadioClick = (value, option) => {
        setUserData((prev) => {
            const next = { ...prev, [field]: value };
            if (value === "no" && detailsField) {
                next[detailsField] = "";
            }
            return next;
        });
        // For "no": advance immediately via dispatcher (no showTextInput).
        // For "yes": dispatcher sees showTextInput:true and returns without advancing;
        //            user fills in the textarea then clicks the Next button below.
        onSelect(value, { ...option, showTextInput: value === "yes" });
    };

    const handleDetailsChange = (e) => {
        const v = e.target.value;
        if (!detailsField) return;
        setUserData((prev) => ({ ...prev, [detailsField]: v }));
    };

    const canSubmitDetails =
        selectedValue === "yes" && String(detailsValue).trim().length > 0;

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

                <div className="mt-6 grid grid-cols-2 gap-3 md:gap-4">
                    {options.map((option) => {
                        const checked = selectedValue === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleRadioClick(option.id, option)}
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

                {selectedValue === "yes" && detailsField ? (
                    <div className="mt-8">
                        <label
                            htmlFor="glp1-current-medications-details"
                            className="mb-2 block text-lg font-normal leading-[140%] text-[#251F20]"
                        >
                            {detailsLabel}
                        </label>
                        <textarea
                            id="glp1-current-medications-details"
                            value={detailsValue}
                            onChange={handleDetailsChange}
                            rows={5}
                            className="w-full resize-y rounded-[8px] border border-[#E2E2E1] bg-white px-3 py-3 text-[15px] text-[#251F20] outline-none focus:border-[#A7885A] focus:ring-1 focus:ring-[#A7885A]"
                            autoComplete="off"
                        />
                        {canSubmitDetails && (
                            <div className="mt-6">
                                <button
                                    type="button"
                                    onClick={() => onContinue?.()}
                                    className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none bg-[#A7885A] py-3 text-base font-medium text-white focus:outline-none focus:ring-0"
                                >
                                    <span>Next</span>
                                    <FaArrowRight />
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default Glp1CurrentMedicationsStep;
