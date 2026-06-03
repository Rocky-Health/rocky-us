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

    const handleSelect = (value) => {
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
        setUserData((prev) => ({ ...prev, [detailsField]: v }));
    };

    const canContinue =
        selectedValue === "no" ||
        (selectedValue === "yes" && String(detailsValue).trim().length > 0);

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow pb-10">
                <div className="relative mx-auto mb-6 aspect-[16/10] w-full lg:max-w-md max-w-sm overflow-hidden rounded-[12px]">
                    <CustomImage
                        src={imageSrc}
                        alt={imageAlt}
                        fill
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
                    </div>
                ) : null}
            </div>

            <div className="bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] px-0 pb-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl">
                    <button
                        type="button"
                        onClick={() => onContinue?.()}
                        disabled={!canContinue}
                        className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 text-base font-medium focus:outline-none focus:ring-0 ${
                            canContinue
                                ? "bg-[#A7885A] text-white"
                                : "cursor-not-allowed bg-gray-300 text-gray-700"
                        }`}
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glp1CurrentMedicationsStep;
