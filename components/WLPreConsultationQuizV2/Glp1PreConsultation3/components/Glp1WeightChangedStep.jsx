"use client";

import React from "react";
import CustomImage from "@/components/utils/CustomImage";

const PRIMARY = "#A7885A";

const Glp1WeightChangedStep = ({
    userData,
    config,
    onSelect,
}) => {
    const field = config.field;
    const imageSrc = config.heroImageSrc || "/glp-quiz/wl-changed.png";
    const selectedValue = userData?.[field] || "";
    const options = config?.options || [];

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full flex-grow pb-10">
                <div className="relative mb-6 aspect-[16/10] lg:max-w-md max-w-sm mx-auto w-full overflow-hidden rounded-[12px] ">
                    <CustomImage
                        src={imageSrc}
                        alt="Weight and scale"
                        fill
                        className="object-contain"
                    />
                </div>

                <h1 className="subheaders-font text-3xl font-normal leading-[130%] text-[#251F20]">
                    Has your weight changed in the last year?
                </h1>

                <div className="mt-6 space-y-3">
                    {options.map((option) => {
                        const checked = selectedValue === option.id;
                        return (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => onSelect(option.id, option)}
                                className={`flex min-h-[55px] w-full items-center gap-3 rounded-[8px] border bg-white px-4 text-left ${
                                    checked
                                        ? "border-[#251F20]"
                                        : "border-[#E2E2E1]"
                                }`}
                                style={
                                    checked
                                        ? {
                                              boxShadow: `inset 0 0 0 1px ${PRIMARY}`,
                                          }
                                        : undefined
                                }
                            >
                                <span
                                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                                        checked
                                            ? "border-transparent"
                                            : "border-[#CFCFCF]"
                                    }`}
                                    style={
                                        checked
                                            ? { backgroundColor: PRIMARY }
                                            : undefined
                                    }
                                >
                                    {checked ? (
                                        <span className="h-2 w-2 rounded-full bg-white" />
                                    ) : null}
                                </span>
                                <span className="text-[15px] font-medium text-black">
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

export default Glp1WeightChangedStep;
