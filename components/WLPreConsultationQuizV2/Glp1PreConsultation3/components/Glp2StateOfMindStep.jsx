"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";
import { FaRegGrinBeam, FaRegSmile } from "react-icons/fa";
import { FaRegFaceMeh } from "react-icons/fa6";

const ICON_BY_OPTION_ID = {
    ready: FaRegGrinBeam,
    hopeful: FaRegSmile,
    cautious: FaRegFaceMeh,
};

function optionIcon(option) {
    if (option.icon && ICON_BY_OPTION_ID[option.icon]) {
        return ICON_BY_OPTION_ID[option.icon];
    }
    return ICON_BY_OPTION_ID[option.id] || FaRegSmile;
}

function formatGoalWeightLbs(userData) {
    const raw = userData?.goalWeight;
    if (raw == null || raw === "") return null;
    const n = parseInt(String(raw).replace(/\D/g, ""), 10);
    if (Number.isFinite(n) && n > 0) return `${n}`;
    const t = String(raw).trim();
    return t.length ? t : null;
}

const Glp2StateOfMindStep = ({ userData, setUserData, config, onContinue }) => {
    const selectedValue = userData?.[config.field] || "";
    const options = config?.options || [];
    const goalPart = formatGoalWeightLbs(userData);
    const motivationLine =
        config?.stateOfMindMotivationTemplate != null
            ? String(config.stateOfMindMotivationTemplate).replace(
                  /\{goal\}/g,
                  goalPart ? `${goalPart}lbs` : "your goal weight",
              )
            : goalPart
              ? `How motivated are you to reach ${goalPart}lbs?`
              : "How motivated are you to reach your goal weight?";

    const handleSelect = (value) => {
        setUserData((prev) => ({
            ...prev,
            [config.field]: value,
        }));
    };

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow lg:pb-10 pb-6">
                <h1 className="subheaders-font text-5xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20]">
                    Let&apos;s better understand your current{" "}
                    <span className="text-[#A7885A]">state of mind.</span>
                </h1>

                <h2 className="subheaders-font lg:mt-8 mt-6 text-3xl font-normal leading-[140%] text-[#251F20]">
                    {motivationLine}
                </h2>

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
                    {options.map((option) => {
                        const checked = selectedValue === option.id;
                        const Icon = optionIcon(option);
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => handleSelect(option.id)}
                                className={`flex flex-col items-center justify-center rounded-2xl border-2 bg-white px-4 py-12 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 md:px-5 ${
                                    checked
                                        ? "border-[#A7885A] shadow-[0_0_0_1px_#A7885A]"
                                        : "border-[#E2E2E1] hover:border-[#cfcfcf] hover:bg-[#f7f6f5]"
                                }`}
                            >
                                <Icon
                                    className="mb-4 h-16 w-16 shrink-0 text-[#251F20]"
                                    aria-hidden
                                />
                                <span className="subheaders-font text-xl font-bold leading-[140%] text-[#251F20]">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] px-0 pb-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl">
                    <button
                        type="button"
                        onClick={() => onContinue?.()}
                        disabled={!selectedValue}
                        className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 text-base font-medium focus:outline-none focus:ring-0 ${
                            selectedValue
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

export default Glp2StateOfMindStep;
