"use client";

import { useState } from "react";
import Link from "next/link";

const MIN_WEIGHT = 140;
const MAX_WEIGHT = 400;
const WEIGHT_SPAN = MAX_WEIGHT - MIN_WEIGHT;

const MedViWeightCalculator = ({ ctaHref = "#" }) => {
    const [weight, setWeight] = useState(250);
    const weightLoss = Math.round(weight * 0.23);
    const fillPercent = ((weight - MIN_WEIGHT) / WEIGHT_SPAN) * 100;

    return (
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            <div className="w-full md:w-[38%]">
                <h2 className="headers-font text-black text-[32px] leading-[115%] tracking-[-0.64px] mb-4 md:mb-6 lg:pe-20">
                    Want to{" "}
                    <span className="text-[#AE7E56] font-[600]">
                        reach your goal
                    </span>{" "}
                    weight fast?
                </h2>
                <p className="poppins-font text-[rgba(0,0,0,0.70)] text-sm font-[400] leading-[150%] mb-6">
                    It&apos;s not magic&mdash;it&apos;s{" "}
                    <span className="text-[#AE7E56] font-[600]">
                        metabolic science
                    </span>
                    . GLP-1 is a naturally occurring hormone that regulates
                    appetite and blood sugar,{" "}
                    <span className="text-[#AE7E56] font-[600]">
                        improving your metabolism
                    </span>{" "}
                    and knocking out cravings.
                </p>
                <Link
                    href={ctaHref}
                    className="bg-black text-white rounded-full inline-flex items-center justify-center px-12 py-2.5 text-[14px] font-[600] tracking-[0.5px] uppercase hover:translate-y-[-3px] transition-all duration-300 hover:shadow-xl"
                >
                    Get Started
                </Link>
            </div>

            <div className="w-full md:w-[60%]">
                <div className="bg-[#F5F4EFee] rounded-[40px] p-6 md:p-12">
                    <div className="flex items-center justify-between mb-4">
                        <p className="subheaders-font text-black text-[16px] font-[400] ">
                            Select your current weight:
                        </p>
                        <p className="subheaders-font text-black text-[30px] font-[400]">
                            {weight}{" "}
                            <span className="subheaders-font text-[30px] font-[400] ">
                                lbs
                            </span>
                        </p>
                    </div>

                    <div className="relative my-8">
                        <input
                            type="range"
                            min={MIN_WEIGHT}
                            max={MAX_WEIGHT}
                            value={weight}
                            onChange={(e) => setWeight(Number(e.target.value))}
                            className="medvi-wl-range-input w-full"
                            style={{
                                "--medvi-range-pct": `${fillPercent}%`,
                            }}
                            aria-valuemin={MIN_WEIGHT}
                            aria-valuemax={MAX_WEIGHT}
                            aria-valuenow={weight}
                            aria-label="Current weight in pounds"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="subheaders-font text-black text-[16px] font-[400]">
                            Weight loss potential:
                        </p>
                        <p className="subheaders-font text-[#AE7E56] text-[56px] font-[700] flex items-center gap-2">
                            {weightLoss}{" "}
                            <span className="subheaders-font text-black text-[24px] font-[400]">
                                lbs
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedViWeightCalculator;
