"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const ICON_SRC_BY_KEY = {
    scale: "/glp-3-quiz/scale.png",
    muscle: "/glp-3-quiz/002-muscle.png",
    ok: "/glp-3-quiz/ok-(1).png",
};

function normalizeBodyPrioritySelection(value) {
    if (Array.isArray(value)) {
        return value.filter(Boolean);
    }
    if (value != null && value !== "") {
        return [value];
    }
    return [];
}

function toggleId(list, id) {
    if (list.includes(id)) {
        return list.filter((x) => x !== id);
    }
    return [...list, id];
}

const Glp1BodyPriorityStep = ({
    stepConfig,
    userData,
    setUserData,
    onContinue,
    onQuizChromeVisibilityChange,
}) => {
    const field = stepConfig?.field || "bodyPriority";
    const options = stepConfig?.options || [];

    const [selectedIds, setSelectedIds] = useState(() =>
        normalizeBodyPrioritySelection(userData?.[field]),
    );

    useEffect(() => {
        onQuizChromeVisibilityChange?.(false);
        return () => onQuizChromeVisibilityChange?.(false);
    }, [onQuizChromeVisibilityChange]);

    useEffect(() => {
        setSelectedIds(normalizeBodyPrioritySelection(userData?.[field]));
    }, [userData, field]);

    const handleNext = () => {
        if (selectedIds.length === 0) return;
        setUserData((prev) => ({ ...prev, [field]: selectedIds }));
        onContinue(selectedIds);
    };

    return (
        <div className="flex  w-full flex-col px-2 pb-12 pt-6">
            <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
                <h1 className="headers-font text-5xl font-normal leading-[125%] tracking-[-0.02em] text-[#251F20]">
                    We can help with all of these, but choose the{" "}
                    <span style={{ color: ACCENT }}>
                        most important for you.
                    </span>
                </h1>
                <p className="mt-4 font-sans text-3xl leading-[145%] text-[#251F20]/85">
                    Select all that apply.{" "}
                    <span className="text-[#C45C4A]" aria-hidden>
                        *
                    </span>
                </p>

                <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-3 md:gap-4">
                    {options.map((option) => {
                        const src =
                            ICON_SRC_BY_KEY[option.icon] ||
                            ICON_SRC_BY_KEY.scale;
                        const isSel = selectedIds.includes(option.id);
                        return (
                            <button
                                key={option.id}
                                type="button"
                                aria-pressed={isSel}
                                onClick={() => {
                                    setSelectedIds((prev) => {
                                        const next = toggleId(prev, option.id);
                                        setUserData((u) => ({
                                            ...u,
                                            [field]: next,
                                        }));
                                        return next;
                                    });
                                }}
                                className={`relative flex flex-col items-center justify-center rounded-2xl border-2 bg-white px-4 py-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 ${
                                    isSel
                                        ? "border-[#A7885A] shadow-sm"
                                        : "border-[#E5E2DC]"
                                }`}
                            >
                                {/* <span
                                    className={`absolute right-3 top-3 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 ${
                                        isSel
                                            ? "border-[#A7885A] bg-[#A7885A]"
                                            : "border-[#ccc] bg-white"
                                    }`}
                                    aria-hidden
                                >
                                    {isSel ? (
                                        <svg
                                            className="h-3 w-3 text-white"
                                            viewBox="0 0 12 10"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M1 5L4.5 8.5L11 1.5"
                                                stroke="currentColor"
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    ) : null}
                                </span> */}
                                <div className="relative h-16 w-16 shrink-0">
                                    <Image
                                        src={src}
                                        alt=""
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <span className="headers-font mt-4 text-center text-xl leading-snug text-[#251F20]">
                                    {option.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    disabled={selectedIds.length === 0}
                    onClick={handleNext}
                    className="mt-12 flex h-[52px] w-full max-w-4xl items-center justify-center gap-2 self-center rounded-full font-sans text-base font-medium text-white transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
                    style={{ backgroundColor: ACCENT }}
                >
                    <span>Next</span>
                    <FaArrowRight className="text-sm" />
                </button>
            </div>
        </div>
    );
};

export default Glp1BodyPriorityStep;
