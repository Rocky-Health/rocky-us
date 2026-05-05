"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CustomImage from "@/components/utils/CustomImage";
import { steps } from "@/components/GLP1Offer/data";

const MedViThreeStepProcess = ({ ctaHref = "#" }) => {
    const timelineRef = useRef(null);
    const stepRefs = useRef([]);
    const [fillHeight, setFillHeight] = useState(0);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            if (!timelineRef.current) return;

            const timeline = timelineRef.current;
            const timelineRect = timeline.getBoundingClientRect();
            const timelineTop = timelineRect.top;
            const timelineHeight = timelineRect.height;

            const triggerPoint = window.innerHeight * 0.4;
            const scrolledPast = triggerPoint - timelineTop;
            const progress = Math.max(
                0,
                Math.min(1, scrolledPast / timelineHeight),
            );

            setFillHeight(progress * 100);

            let newActive = 0;
            stepRefs.current.forEach((ref, index) => {
                if (!ref) return;
                const rect = ref.getBoundingClientRect();
                if (rect.top < triggerPoint) {
                    newActive = index;
                }
            });
            setActiveStep(newActive);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="flex flex-col md:flex-row gap-10 md:gap-16">
            <div className="w-full md:w-5/12 md:sticky md:top-24 md:self-start">
                <h2 className="headers-font text-black sm:text-[28px] text-[24px] leading-[115%] tracking-[-0.64px] mb-4 md:mb-6 md:pe-28">
                    Begin your weight loss journey with Rocky.
                </h2>
                <p className="poppins-font text-[rgba(0,0,0,0.70)] text-sm font-[400] leading-[150%] mb-6">
                    Start your transformation today with Rocky&apos;s easy,
                    personalized process for accessing GLP-1 medications.
                    Designed with your convenience in mind, our streamlined
                    approach ensures you&apos;re supported every step of the
                    way, from approval to receiving your prescription.
                </p>
                <Link
                    href={ctaHref}
                    className="bg-black text-white rounded-full inline-flex items-center justify-center px-12 py-2.5 text-[14px] font-[600] tracking-[0.5px] uppercase hover:translate-y-[-3px] transition-all duration-300 hover:shadow-xl sm:w-fit w-full"
                >
                    Get Started
                </Link>
            </div>

            <div className="w-full md:w-7/12">
                <div className="relative" ref={timelineRef}>
                    <div className="absolute left-[11px] md:left-[15px] top-4 bottom-4 w-[2px] bg-[#E2E2E1]" />

                    <div
                        className="absolute left-[11px] md:left-[15px] top-4 w-[2px] bg-[#AE7E56] transition-[height] duration-100 ease-out"
                        style={{ height: `calc(${fillHeight}% - 16px)` }}
                    />

                    <div className="space-y-12 md:space-y-16">
                        {steps.map((step, index) => (
                            <div
                                key={index}
                                ref={(el) => {
                                    stepRefs.current[index] = el;
                                }}
                                className="relative pl-14 md:pl-14"
                            >
                                <div
                                    className={`absolute left-0 top-0 w-6 h-6 md:w-8 md:h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                                        index <= activeStep
                                            ? "bg-[#e4d4c7] border-transparent scale-100"
                                            : "bg-white border-transparent scale-100"
                                    }`}
                                >
                                    <span
                                        className={` sm:w-3 sm:h-3 w-4 h-3 rounded-full ${
                                            index <= activeStep
                                                ? "bg-[#AE7E56]"
                                                : "bg-gray-300"
                                        }`}
                                    />
                                </div>
                                <div
                                    className={`transition-opacity duration-500 md:ps-12 ${
                                        index <= activeStep
                                            ? "opacity-100"
                                            : "opacity-40"
                                    }`}
                                >
                                    <h3 className="headers-font text-black text-[22px]  leading-[115%] mb-3">
                                        {step.title}
                                    </h3>
                                    <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[14px] font-[400] leading-[150%] mb-4">
                                        {step.description}
                                    </p>

                                    {step.image && (
                                        <div className="relative w-full h-[200px] md:h-[280px] sm:rounded-[56px] rounded-2xl overflow-hidden">
                                            <CustomImage
                                                src={step.image}
                                                alt={step.title}
                                                fill
                                                className="object-cover hover:scale-105 transition-all duration-300"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedViThreeStepProcess;
