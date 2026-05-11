"use client";

import { Fragment } from "react";
import { glp1PreConsultation3Config } from "../config/glp1PreConsultation3Config";

const PHASES = glp1PreConsultation3Config.progressPhases || [];

const ACTIVE = "#A7885A";
const LINE_DONE = "#A7885A";
const LINE_TODO = "#ccc";
const LABEL_ACTIVE = "#A7885A";
const LABEL_DONE = "#A7885A";
const LABEL_TODO = "#a0a0a0";

function getActivePhaseIndex(currentStep) {
    let activeIdx = PHASES.findIndex((p) => p.steps.includes(currentStep));
    if (activeIdx === -1) {
        activeIdx = Math.max(0, PHASES.length - 1);
    }
    return activeIdx;
}

export default function Glp1PreConsultation3PhaseProgress({
    currentStep,
    onBack,
    thankYouStep = 33,
}) {
    const showBack = currentStep > 1 && currentStep !== thankYouStep;
    const activePhaseIndex = getActivePhaseIndex(currentStep);

    return (
        <div className="w-full border-b border-[#ccc] mb-6">
            <div className="relative max-w-7xl mx-auto px-4 md:px-6 pt-4 pb-4 md:pt-4 md:pb-4 sm:mx-14 lg:mx-auto">
                {
                    <button
                        type="button"
                        onClick={onBack}
                        className="absolute left-4 md:left-6 top-4 text-[#000] hover:text-gray-700 p-1 z-10"
                        aria-label="Go back to previous question"
                        disabled={!showBack}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>
                }

                <div
                    className={`flex min-w-0 items-start ${
                        showBack ? "pl-10 md:pl-11" : "pl-10 md:pl-11"
                    }`}
                >
                    {PHASES.map((phase, i) => {
                        const isComplete = i < activePhaseIndex;
                        const isActive = i === activePhaseIndex;
                        const labelColor = isActive
                            ? LABEL_ACTIVE
                            : isComplete
                              ? LABEL_DONE
                              : LABEL_TODO;

                        return (
                            <Fragment key={phase.key}>
                                <div className="flex shrink-0 flex-row items-center gap-2 max-w-[100px] sm:max-w-[120px] px-2">
                                    <div
                                        className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border-2 bg-transparent"
                                        style={{
                                            borderColor:
                                                isComplete || isActive
                                                    ? ACTIVE
                                                    : LINE_TODO,
                                            backgroundColor:
                                                isComplete && !isActive
                                                    ? ACTIVE
                                                    : "transparent",
                                        }}
                                    >
                                        {isActive && (
                                            <span
                                                className="block h-2 w-2 rounded-full"
                                                style={{ background: ACTIVE }}
                                            />
                                        )}
                                        {isComplete && !isActive && (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                width="14"
                                                height="14"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="white"
                                                strokeWidth="3"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                aria-hidden
                                            >
                                                <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                        )}
                                    </div>
                                    <span
                                        className={`text-center text-base font-normal leading-snug  break-words w-full ${!isActive ? "hidden lg:block" : ""}`}
                                        style={{ color: labelColor }}
                                    >
                                        {phase.label}
                                    </span>
                                </div>

                                {i < PHASES.length - 1 && (
                                    <div
                                        className="mt-[14px] h-0.5 min-w-[8px] flex-1 rounded-full self-start"
                                        style={{
                                            background:
                                                activePhaseIndex > i
                                                    ? LINE_DONE
                                                    : LINE_TODO,
                                        }}
                                        aria-hidden
                                    />
                                )}
                            </Fragment>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
