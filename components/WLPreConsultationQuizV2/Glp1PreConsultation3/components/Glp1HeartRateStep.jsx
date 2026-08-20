"use client";

import React from "react";
import CustomImage from "@/components/utils/CustomImage";

const ACCENT = "#A7885A";

const Glp1HeartRateStep = ({ userData, config, onSelect }) => {
    const field = config.field;
    const selectedValue = userData?.[field] || "";
    const options = config?.options || [];
    const imageSrc = config?.imageSrc || "/glp-3-quiz/heart-rate.jpg";
    const questionText =
        config?.question || "How about your average resting heart rate?";
    const imageAlt =
        config?.imageAlt || "Person using a pulse oximeter on their finger";

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
            </div>
        </div>
    );
};

export default Glp1HeartRateStep;
