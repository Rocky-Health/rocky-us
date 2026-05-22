"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { FaSyringe } from "react-icons/fa6";
import { HiArrowTrendingUp } from "react-icons/hi2";
import { BsReceipt } from "react-icons/bs";
import { BsEyedropper } from "react-icons/bs";

const ICON_BY_KEY = {
    receipt: BsReceipt,
    trend: HiArrowTrendingUp,
    syringe: FaSyringe,
    dropper: BsEyedropper,
};

function optionIcon(option) {
    if (option.icon && ICON_BY_KEY[option.icon]) {
        return ICON_BY_KEY[option.icon];
    }
    if (option.id === "affordability") return BsReceipt;
    if (option.id === "potency") return HiArrowTrendingUp;
    if (option.id === "inject") return FaSyringe;
    if (option.id === "drops") return BsEyedropper;
    return BsReceipt;
}

function CardChoiceGrid({ options, selectedId, onSelect }) {
    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {options.map((option) => {
                const checked = selectedId === option.id;
                const Icon = optionIcon(option);
                return (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onSelect(option.id)}
                        className={`flex flex-col items-center rounded-2xl border-2 bg-white px-4 py-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 md:px-6 md:py-6 ${
                            checked
                                ? "border-[#A7885A] shadow-[0_0_0_1px_#A7885A]"
                                : "border-[#E2E2E1] hover:border-[#cfcfcf]"
                        }`}
                    >
                        <Icon
                            className="mb-4 h-16 w-16 shrink-0 text-[#251F20]"
                            aria-hidden
                        />
                        <span className="subheaders-font text-xl font-bold leading-[140%] text-[#251F20]">
                            {option.label}
                        </span>
                        <span className="mt-2 text-sm font-normal leading-[140%] text-[#6B6B6B]">
                            {option.subtitle}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

const Glp2MedicationPriorityStep = ({
    userData,
    setUserData,
    config,
    onContinue,
}) => {
    const selectedValue = userData?.[config.field] || "";
    const options = config?.options || [];
    const secondary = config?.secondaryQuestion;
    const secondaryField = secondary?.field;
    const secondaryOptions = secondary?.options || [];
    const secondarySelected = secondaryField
        ? userData?.[secondaryField] || ""
        : "";

    const headingLead =
        config?.medicationPriorityHeadingLead ?? "Almost there ";
    const headingRest =
        config?.medicationPriorityHeadingRest ??
        "- a few clinical questions to make sure GLP-1 is safe for you.";
    const promptText =
        config?.medicationPriorityPrompt ??
        "Which of these is most important to you?";

    const useCardLayout =
        options.length === 2 && options.every((o) => o.subtitle);

    const hasSecondaryCards =
        !!secondaryField &&
        secondaryOptions.length === 2 &&
        secondaryOptions.every((o) => o.subtitle);

    const handleSelect = (value) => {
        setUserData((prev) => {
            const next = { ...prev, [config.field]: value };
            if (secondaryField) {
                next[secondaryField] = "";
            }
            return next;
        });
    };

    const handleSecondarySelect = (value) => {
        if (!secondaryField) return;
        setUserData((prev) => ({
            ...prev,
            [secondaryField]: value,
        }));
    };

    const canContinue =
        !!selectedValue && (!hasSecondaryCards || !!secondarySelected);

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow lg:pb-10 pb-6">
                <h1 className="headers-font text-5xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20]">
                    <span className="text-[#A7885A]">{headingLead}</span>{" "}
                    {headingRest}
                </h1>

                {useCardLayout ? (
                    <>
                        <hr className="lg:mt-6 mt-4 border-0 border-t border-[#E2E2E1]" />
                        <h2 className="headers-font lg:my-6 my-4 text-3xl font-normal leading-[140%] text-[#251F20]">
                            {promptText}
                        </h2>
                        <CardChoiceGrid
                            options={options}
                            selectedId={selectedValue}
                            onSelect={handleSelect}
                        />

                        {hasSecondaryCards && selectedValue ? (
                            <>
                                <h2 className="headers-font mb-6 lg:mt-12 mt-6 text-3xl font-normal leading-[140%] text-[#251F20] ">
                                    {secondary.prompt}
                                </h2>
                                <CardChoiceGrid
                                    options={secondaryOptions}
                                    selectedId={secondarySelected}
                                    onSelect={handleSecondarySelect}
                                />
                            </>
                        ) : null}
                    </>
                ) : (
                    <div className="space-y-3">
                        {options.map((option) => {
                            const checked = selectedValue === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => handleSelect(option.id)}
                                    className={`flex min-h-[55px] w-full items-center gap-3 rounded-[8px] border bg-white px-4 text-left ${
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
                )}
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

export default Glp2MedicationPriorityStep;
