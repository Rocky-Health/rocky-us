// components/SkinCareSection.js
import React from "react";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import BrimaryButton from "../ui/buttons/BrimaryButton";

const treatments = [
    {
        title: "Acne",
        imageSrc: "acne-cream.png",
        learnMoreHref: "/acne-cream",
        getStartedHref: "/acne-consultation-quiz",
    },
    {
        title: "Anti-Aging",
        imageSrc: "anti-aging-cream.png",
        learnMoreHref: "/anti-aging-cream",
        getStartedHref: "/anti-aging-consultation-quiz",
    },
    {
        title: "Hyperpigmentation",
        imageSrc: "hyperpigmntation.png",
        learnMoreHref: "/hyper-pigmentation-cream",
        getStartedHref: "/hyperpigmentation-consultation-quiz",
    },
];

const features = [
    "Experienced medical providers",
    "FDA-Approved treatments",
    "Clinically crafted by dermatologists",
];

const SkinCareSection = () => {
    return (
        <section
            className="bg-white py-14 md:py-24 px-4 md:px-8 lg:px-16"
            id="skin-care-section"
        >
            <div className="max-w-6xl mx-auto">
                {/* Treatments Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-[56px] md:mb-[112px]">
                    {treatments.map((treatment, index) => (
                        <div
                            key={index}
                            className="rounded-2xl md:rounded-3xl bg-[#F7F7F7] p-5 md:p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col items-center h-[380px] md:h-[480px]"
                        >
                            <h2 className="text-xl md:text-3xl font-semibold text-[#000000] mb-4 w-full text-start">
                                {treatment.title}
                            </h2>
                            <div className="w-[240px] h-[240px] relative lg:mt-8">
                                <Image
                                    src={`/skin-care/${treatment.imageSrc}`}
                                    alt={treatment.title}
                                    layout="fill"
                                />
                            </div>
                            <div className="flex w-full gap-2 mt-auto">
                                <BrimaryButton
                                    className="w-1/2 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
                                    href={treatment.getStartedHref}
                                >
                                    Get Started
                                </BrimaryButton>
                                <BrimaryButton
                                    className="w-1/2 border border-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
                                    href={treatment.learnMoreHref}
                                >
                                    {" "}
                                    Learn More
                                </BrimaryButton>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-20">
                    <div>
                        <p className="text-[24px] md:text-[32px] leading-[115%] font-[450] mb-0 text-left max-w-max lg:max-w-[560px]">
                            <span className="text-[#b77c50] headers-font">
                                Rocky connects you
                            </span>
                            <span className="text-black headers-font">
                                {" "}
                                with best-in-class skincare providers and
                                quality,{" "}
                            </span>
                            <span className="text-[#b77c50] headers-font">
                                doctor-trusted products
                            </span>
                            <span className="text-black headers-font">
                                {" "}
                                so you can put your best face forward.
                            </span>
                        </p>
                    </div>
                    <div className="md:w-1/3 flex flex-col gap-4">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3"
                            >
                                <FaCheckCircle size={21} color="#b77c50" />
                                <span className="text-black text-base md:text-[18px]">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default SkinCareSection;
