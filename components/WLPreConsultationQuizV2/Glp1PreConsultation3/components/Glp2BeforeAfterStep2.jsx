"use client";

import React, { useEffect } from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#AE7E56";

const Glp2BeforeAfterStep2 = ({ onContinue, onQuizChromeVisibilityChange }) => {
    useEffect(() => {
        onQuizChromeVisibilityChange?.(false);
        return () => onQuizChromeVisibilityChange?.(false);
    }, [onQuizChromeVisibilityChange]);

    return (
        <div className="flex h-full w-full flex-col px-5 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow pb-32 md:pb-36">
                <div className="mb-10">
                    <p className="headers-font text-center text-3xl font-medium leading-[125%] text-[#251F20]">
                        &quot;I was ready to give up. After seeing reviews of
                        GLP-1, I had to try. 6 months later -- wow. Thank you
                        for the metabolic reset - game changer.&quot;
                    </p>
                </div>

                <div className="relative mb-10 h-[440px] w-full overflow-hidden rounded-[18px] lg:h-[580px]">
                    <CustomImage
                        src="/glp-quiz/Before%26After2.jpg"
                        alt="Before and after testimonial"
                        fill
                        className="!object-contain"
                    />
                </div>

                <p className="headers-font text-start text-base font-medium leading-[120%] text-black">
                    <span style={{ color: ACCENT }}>Samantha lost 29 lbs</span>{" "}
                    and has renewed confidence
                </p>
            </div>

            <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] px-4 pb-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl sm:px-20 lg:px-0">
                    <button
                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none bg-[#A7885A] py-3 text-base font-medium text-white focus:outline-none focus:ring-0"
                        onClick={() => onContinue?.()}
                        type="button"
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glp2BeforeAfterStep2;
