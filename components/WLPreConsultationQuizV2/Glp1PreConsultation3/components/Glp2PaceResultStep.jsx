"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";

const HIGH_RATE = 0.0175;
const ACCENT = "#A7885A";
/** Muted sage for “doesn’t involve restrictive diets.” */
const SAGE = "#6B7560";

function computeProjection(weight, goalWeight) {
    const w = parseFloat(weight) || 0;
    const g = parseFloat(goalWeight) || 0;
    const lbs = Math.max(w - g, 0);
    const lossPerWeekHigh = +(w * HIGH_RATE).toFixed(2);
    const weeksToGoalFast =
        lossPerWeekHigh > 0
            ? Math.max(1, Math.ceil(lbs / lossPerWeekHigh))
            : null;
    return { lbs, weeksToGoalFast };
}

function TitleBlock({ variant }) {
    if (variant === "faster") {
        return (
            <h1 className="subheaders-font mb-4 text-5xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20]">
                Not a problem,{" "}
                <span style={{ color: ACCENT }}>we can move faster.</span>
            </h1>
        );
    }
    if (variant === "too-fast") {
        return (
            <h1 className="subheaders-font mb-4 text-5xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20]">
                We&apos;ll move at{" "}
                <span style={{ color: ACCENT }}>your pace.</span>
            </h1>
        );
    }
    return (
        <h1 className="subheaders-font mb-4 text-5xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20]">
            Great — you qualify
        </h1>
    );
}

const Glp2PaceResultStep = ({ userData, onContinue }) => {
    const selectedRaw = userData?.pacePreference || "works-for-me";
    const selected = ["works-for-me", "faster", "too-fast"].includes(
        selectedRaw,
    )
        ? selectedRaw
        : "works-for-me";
    const { lbs, weeksToGoalFast } = computeProjection(
        userData?.weight,
        userData?.goalWeight,
    );
    const lbsRounded = Math.round(lbs);
    const lbsLabel = lbsRounded > 0 ? `${lbsRounded} lbs` : "your goal weight";

    let bodyLead = "";
    if (selected === "works-for-me") {
        bodyLead = `Losing ${lbsLabel} is easier than you think - and it `;
    } else if (selected === "faster") {
        bodyLead =
            weeksToGoalFast != null
                ? `It will take some work, but with GLP-1 medication, your goal to lose ${lbsLabel} can be achieved in about ${weeksToGoalFast} weeks - and it `
                : `With GLP-1 medication, your goal to lose ${lbsLabel} can be achieved faster - and it `;
    } else {
        bodyLead = `With GLP-1 medication, your goal to lose ${lbsLabel} is easier than you think - and it `;
    }

    const bodyHighlight = "doesn't involve restrictive diets.";

    const titleVariant =
        selected === "faster"
            ? "faster"
            : selected === "too-fast"
              ? "too-fast"
              : "works-for-me";

    return (
        <div className="flex w-full flex-col px-4 pb-10 md:px-0">
            <div className="mx-auto w-full max-w-4xl">
                <TitleBlock variant={titleVariant} />

                <p className="subheaders-font mb-8 text-3xl font-normal leading-[125%] text-[#251F20]">
                    {bodyLead}
                    <span style={{ color: SAGE }}>{bodyHighlight}</span>
                </p>

                <hr className="mb-6 border-0 border-t border-[#E2E2E1]" />

                <p className="font-sans text-xl font-normal leading-[145%] text-[#251F20]">
                    Now, let&apos;s{" "}
                    <span className="font-bold text-[#251F20]">
                        analyze your metabolism
                    </span>{" "}
                    and discover how well your body processes macronutrients.
                </p>

                <button
                    type="button"
                    onClick={() => onContinue?.()}
                    className="mt-10 flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none font-sans text-base font-medium text-white transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2"
                    style={{ backgroundColor: ACCENT }}
                >
                    <span>Next</span>
                    <FaArrowRight className="text-sm" />
                </button>
            </div>
        </div>
    );
};

export default Glp2PaceResultStep;
