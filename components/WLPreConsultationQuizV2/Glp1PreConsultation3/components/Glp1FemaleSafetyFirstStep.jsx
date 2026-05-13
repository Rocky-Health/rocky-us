"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";
const BG = "#F9F7F2";
const NONE_ID = "female-safety-none";

const OPTIONS = [
    {
        id: "pregnant-or-trying",
        label: "Currently or possibly pregnant, or actively trying to become pregnant",
    },
    {
        id: "breastfeeding",
        label: "Breastfeeding or bottle-feeding with breastmilk",
    },
    {
        id: "postpartum-under-6mo",
        label: "Have given birth to a child within the last 6 months",
    },
    {
        id: NONE_ID,
        label: "None of the above",
    },
];

const Glp1FemaleSafetyFirstStep = ({
    userData,
    setUserData,
    onContinue,
    onAction,
}) => {
    const [selected, setSelected] = useState(
        () => userData?.femalePregnancySafety ?? null,
    );

    useEffect(() => {
        if (userData?.femalePregnancySafety) {
            setSelected(userData.femalePregnancySafety);
        }
    }, [userData?.femalePregnancySafety]);

    const handleNext = () => {
        if (!selected) return;
        setUserData((u) => ({ ...u, femalePregnancySafety: selected }));
        if (selected === NONE_ID) {
            onContinue(selected);
        } else {
            onAction("showPopup", "pregnancy");
        }
    };

    return (
        <div className="w-full px-2 pb-12 pt-6">
            <div className="mx-auto w-full max-w-4xl">
                <h1 className="headers-font text-5xl font-normal leading-[120%] tracking-[-0.02em] text-[#251F20]">
                    Safety, first.
                </h1>
                <p className="mt-4 text-xl leading-[145%] text-[#251F20]/80">
                    Do any of these apply to you?
                </p>

                <div className="mt-8 flex flex-col gap-3">
                    {OPTIONS.map(({ id, label }) => {
                        const isSel = selected === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setSelected(id)}
                                className={`flex w-full items-start gap-3 rounded-2xl border-2 bg-white px-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 md:px-5 md:py-4 ${
                                    isSel
                                        ? "border-[#A7885A]"
                                        : "border-[#E5E2DC]"
                                }`}
                            >
                                <span
                                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                        isSel
                                            ? "border-[#A7885A]"
                                            : "border-[#ccc]"
                                    }`}
                                >
                                    {isSel ? (
                                        <span className="h-2.5 w-2.5 rounded-full bg-[#A7885A]" />
                                    ) : null}
                                </span>
                                <span className="font-sans text-[0.95rem] leading-snug text-[#251F20] md:text-base">
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    disabled={!selected}
                    onClick={handleNext}
                    className="mt-10 flex h-[52px] w-full items-center justify-center gap-2 rounded-full font-sans text-base font-medium text-white transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
                    style={{ backgroundColor: ACCENT }}
                >
                    <span>Next</span>
                    <FaArrowRight className="text-sm" />
                </button>
            </div>
        </div>
    );
};

export default Glp1FemaleSafetyFirstStep;
