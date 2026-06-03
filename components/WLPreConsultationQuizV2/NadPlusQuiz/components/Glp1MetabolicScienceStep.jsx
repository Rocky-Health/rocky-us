"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";
import CustomImage from "@/components/utils/CustomImage";
import DmOffersRockyInTheNews from "@/components/DmOffers/DmOffersRockyInTheNews";

const ACCENT = "#A7885A";

const PRESS_LINE =
    "OK! · The Balancing Act · Woman's World · LA WEEKLY · Lifetime · Health";

function MetabolicChartImage() {
    return (
        <CustomImage
            src="https://myrocky.b-cdn.net/WP%20Images/glp-offer/withdirectmeds.png"
            alt="Weight over time: greater loss with medication versus without over four months"
            width={880}
            height={460}
            className="mx-auto h-auto w-full max-h-[280px] object-contain lg:max-h-[320px] lg:max-w-2xl max-w-lg"
            sizes="(max-width: 768px) 100vw, 42rem"
            priority
        />
    );
}

const Glp1MetabolicScienceStep = ({
    onContinue,
    onQuizChromeVisibilityChange,
}) => {
    useEffect(() => {
        onQuizChromeVisibilityChange?.(false);
        return () => onQuizChromeVisibilityChange?.(false);
    }, [onQuizChromeVisibilityChange]);

    return (
        <div className="flex  w-full flex-col px-2 pb-6 lg:pt-6 pt-4">
            <div className="mx-auto w-full max-w-4xl flex-1 flex-col mb-16">
                <h1 className="headers-font text-5xl font-normal leading-[120%] tracking-[-0.02em] text-[#251F20]">
                    It feels like magic, but it&apos;s{" "}
                    <span style={{ color: ACCENT }}>metabolic science.</span>
                </h1>

                <div className="mt-8 rounded-2xl  bg-white p-4 shadow-sm lg:p-6 lg:max-w-2xl max-w-lg mx-auto">
                    <MetabolicChartImage />
                </div>

                <p className="headers-font mt-8 text-xl leading-[145%] text-[#251F20] font-normal">
                    On average, GLP-1 patients{" "}
                    <span className="font-bold">
                        lost 18% of their body weight.
                    </span>
                </p>
                <p className="mt-4 font-sans text-base leading-[155%] text-[#251F20]/80 font-normal">
                    Compounded GLP-1 medications offer the{" "}
                    <span className="font-bold text-[#251F20]">
                        same effective active
                    </span>{" "}
                    ingredients at up to 80% less cost than many brand-name
                    options, with more consistent availability.
                </p>

                <button
                    type="button"
                    onClick={() => onContinue?.()}
                    className="mt-10 flex h-[52px] w-full max-w-4xl items-center justify-center gap-2 self-center rounded-full font-sans text-base font-medium text-white transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2"
                    style={{ backgroundColor: ACCENT }}
                >
                    <span>Next</span>
                    <FaArrowRight className="text-sm" />
                </button>
            </div>

            {/* <DmOffersRockyInTheNews /> */}
        </div>
    );
};

export default Glp1MetabolicScienceStep;
