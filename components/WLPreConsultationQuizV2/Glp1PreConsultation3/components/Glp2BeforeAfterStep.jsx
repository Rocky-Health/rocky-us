"use client";

import React, { useEffect, useMemo } from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#AE7E56";

function buildMaleVariant() {
    return {
        key: "male",
        quote: (
            <>
                &quot;I felt stuck before I joined MyRocky. Their guidance helped
                me <span style={{ color: ACCENT }}>lose over 50 pounds</span>{" "}
                and completely change how I approach health&quot;
            </>
        ),
        imageSrc: "/glp-quiz/Before%26After3.jpg",
        footer: (
            <>
                <span style={{ color: ACCENT }}>Denis lost 49 lbs</span> and
                came off his blood pressure medication
            </>
        ),
    };
}

function buildFemaleVariant() {
    return {
        key: "female",
        quote: (
            <>
                &quot; It really does work. Took about 6 weeks to feel it, but
                once it kicked in,{" "}
                <span style={{ color: ACCENT }}>I dropped 35 pounds</span> of
                fat and haven&apos;t looked back. Thank you MyRocky! &quot;
            </>
        ),
        imageSrc: "/glp-quiz/Before%26After.png",
        footer: (
            <>
                Megan took control and doubled her confidence in
                <span style={{ color: ACCENT }}> only 2 months.</span>
            </>
        ),
    };
}

function useBeforeAfterVariant(userData, invertGenderTestimonial) {
    return useMemo(() => {
        const isMale = userData?.sex === "male";
        const useMaleContent = invertGenderTestimonial ? !isMale : isMale;
        return useMaleContent ? buildMaleVariant() : buildFemaleVariant();
    }, [userData?.sex, invertGenderTestimonial]);
}

const Glp2BeforeAfterStep = ({
    userData,
    invertGenderTestimonial = false,
    onContinue,
    onQuizChromeVisibilityChange,
}) => {
    const variant = useBeforeAfterVariant(userData, invertGenderTestimonial);

    useEffect(() => {
        onQuizChromeVisibilityChange?.(false);
        return () => onQuizChromeVisibilityChange?.(false);
    }, [onQuizChromeVisibilityChange]);

    return (
        <div className="flex h-full w-full flex-col px-5 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow pb-32 md:pb-36">
                <div className="mb-10">
                    <p className="headers-font text-center text-3xl font-medium leading-[125%] text-[#251F20]">
                        {variant.quote}
                    </p>
                </div>

                <div className="relative mb-10 h-[440px] w-full overflow-hidden rounded-[18px] lg:h-[580px]">
                    <CustomImage
                        key={`${variant.key}-${invertGenderTestimonial ? "inv" : "std"}`}
                        src={variant.imageSrc}
                        alt="Before and after testimonial"
                        fill
                        className="!object-contain"
                    />
                </div>

                <p className="headers-font text-start text-base font-medium leading-[120%] text-black">
                    {variant.footer}
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

export default Glp2BeforeAfterStep;
