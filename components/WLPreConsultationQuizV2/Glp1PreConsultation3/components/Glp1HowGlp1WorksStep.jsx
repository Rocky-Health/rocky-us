"use client";

import React, { useEffect } from "react";
import { FaArrowRight } from "react-icons/fa";
import CustomImage from "@/components/utils/CustomImage";
import DmOffersRockyInTheNews from "@/components/DmOffers/DmOffersRockyInTheNews";

const ACCENT = "#A7885A";

const BULLETS = [
    <>
        <span className="font-semibold">Week 1 - 4 :</span> Your body gets
        acclimated to GLP-1 medication
    </>,
    <>
        <span className="font-semibold">Week 4 - 8 :</span> Weight loss is
        increasing more and more
    </>,
    <>
        <span className="font-semibold">Week 9+ :</span> Your body has become a{" "}
        <span className="font-bold">burning machine</span>
    </>,
];

const Glp1HowGlp1WorksStep = ({ onContinue, onQuizChromeVisibilityChange }) => {
    useEffect(() => {
        onQuizChromeVisibilityChange?.(false);
        return () => onQuizChromeVisibilityChange?.(false);
    }, [onQuizChromeVisibilityChange]);

    return (
        <div className="flex w-full flex-col px-2 pb-10 pt-2 md:px-4">
            <div className="mx-auto w-full max-w-4xl flex-1 flex-col mb-16">
                <h1 className="headers-font text-3xl font-normal leading-[120%] tracking-[-0.02em] text-[#251F20] md:text-4xl lg:text-[2.75rem]">
                    How will GLP-1{" "}
                    <span
                        className="headers-font italic"
                        style={{ color: ACCENT }}
                    >
                        work for you?
                    </span>
                </h1>

                <div className="mt-6 overflow-hidden rounded-2xl max-w-lg mx-auto md:mt-8 md:p-5">
                    <CustomImage
                        src="/wl-pre-consultation/wlps.png"
                        alt="How GLP-1 improves metabolic rate and ease of weight loss over 12 weeks"
                        width={880}
                        height={520}
                        className="mx-auto h-auto w-full object-contain"
                        sizes="(max-width: 768px) 100vw, 42rem"
                        priority
                    />
                </div>

                <ul className="mt-6 space-y-3 font-sans text-lg leading-[150%] text-[#251F20] md:mt-8">
                    {BULLETS.map((line, i) => (
                        <li key={i} className="flex gap-2">
                            <span className="mt-0.5 shrink-0" aria-hidden>
                                •
                            </span>
                            <span>{line}</span>
                        </li>
                    ))}
                </ul>

                <p className="headers-font mt-8 text-base leading-[145%] text-[#251F20] font-light">
                    We identify the {""}
                    <span style={{ color: ACCENT }} className="font-bold">
                        root causes
                    </span>
                    {""} of your metabolic issues, so you get a {""}
                    <span className="font-bold">long-term solution</span>, not
                    just another quick fix.
                </p>

                <button
                    type="button"
                    onClick={() => onContinue?.()}
                    className="mt-10 flex h-[52px] w-full items-center justify-center gap-2 rounded-full font-sans text-base font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2"
                    style={{ backgroundColor: ACCENT }}
                >
                    <span>Next</span>
                    <FaArrowRight className="text-sm" />
                </button>
            </div>

            <DmOffersRockyInTheNews />
        </div>
    );
};

export default Glp1HowGlp1WorksStep;
