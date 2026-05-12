"use client";

import { useState } from "react";
import Link from "next/link";
import { goalOptions } from "@/components/GLP1Offer/data";

const MedViGoalSelector = ({ ctaHref = "#" }) => {
    const [selected, setSelected] = useState(null);

    return (
        <div className="max-w-[1200px] mx-auto text-center bg-[#f5f3f1] sm:rounded-[56px] rounded-2xl  overflow-hidden sm:px-28 px-8 sm:py-28 py-12">
            <h2 className="headers-font text-black sm:text-[28px] text-[24px] leading-[115%] tracking-[-0.64px] mb-4 md:mb-10">
                What&apos;s your weight loss goal?
            </h2>

            <div className="space-y-3 mb-8 max-w-[600px] mx-auto">
                {goalOptions.map((option, index) => (
                    <button
                        key={index}
                        type="button"
                        onClick={() => setSelected(index)}
                        className={`w-full rounded-lg py-6 px-6 text-[16px] font-[500] poppins-font transition-all border text-left ${
                            selected === index
                                ? "bg-[#AE7E5699] text-black border-[#AE7E56]"
                                : "bg-white text-black border-[#E2E2E1] hover:border-[#AE7E56]"
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            <Link
                href={ctaHref}
                className="bg-black text-white rounded-full w-full max-w-[600px] mx-auto sm:py-6 py-4 text-[16px] font-[500] leading-[140%] flex items-center justify-center hover:translate-y-[-3px] transition-all duration-300 hover:shadow-xl"
            >
                Continue
            </Link>
        </div>
    );
};

export default MedViGoalSelector;
