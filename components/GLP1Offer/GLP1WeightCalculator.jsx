"use client";

import { useState } from "react";
import Link from "next/link";

const GLP1WeightCalculator = ({ ctaHref = "#" }) => {
  const [weight, setWeight] = useState(250);
  const weightLoss = Math.round(weight * 0.23);

  return (
    <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
      {/* Left: Text */}
      <div className="w-full md:w-1/2">
        <h2 className="headers-font text-black text-[32px] md:text-[42px] leading-[115%] tracking-[-0.64px] mb-4 md:mb-6">
          Want to{" "}
          <span className="text-[#AE7E56] font-[600]">reach your goal</span>{" "}
          weight fast?
        </h2>
        <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[16px] md:text-[18px] font-[400] leading-[150%] mb-6">
          It&apos;s not magic&mdash;it&apos;s{" "}
          <span className="text-[#AE7E56] font-[600]">metabolic science</span>.
          GLP-1 is a naturally occurring hormone that regulates appetite and
          blood sugar,{" "}
          <span className="text-[#AE7E56] font-[600]">
            improving your metabolism
          </span>{" "}
          and knocking out cravings.
        </p>
        <Link
          href={ctaHref}
          className="bg-black text-white rounded-full inline-flex items-center justify-center px-8 h-[48px] text-[14px] font-[600] tracking-[0.5px] uppercase"
        >
          Get Started
        </Link>
      </div>

      {/* Right: Calculator */}
      <div className="w-full md:w-1/2">
        <div className="bg-[#F5F4EF] rounded-2xl p-6 md:p-10">
          <div className="flex items-center justify-between mb-4">
            <p className="poppins-font text-black text-[16px] font-[600]">
              Select your current weight:
            </p>
            <p className="headers-font text-black text-[36px] md:text-[42px] leading-[100%]">
              {weight}{" "}
              <span className="poppins-font text-[18px] font-[400]">lbs</span>
            </p>
          </div>

          {/* Slider */}
          <div className="relative mb-8">
            <input
              type="range"
              min="100"
              max="400"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #AE7E56 0%, #AE7E56 ${
                  ((weight - 100) / 300) * 100
                }%, #E2E2E1 ${((weight - 100) / 300) * 100}%, #E2E2E1 100%)`,
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <p className="poppins-font text-black text-[16px] font-[600]">
              Weight loss potential:
            </p>
            <p className="headers-font text-[#AE7E56] text-[42px] md:text-[52px] leading-[100%]">
              {weightLoss}{" "}
              <span className="poppins-font text-black text-[18px] font-[400]">
                lbs
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GLP1WeightCalculator;
