"use client";

import React from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const Glp1BeforeAfterStep = ({ onContinue }) => {
  return (
    <div className="w-full h-full flex flex-col px-5 md:px-0">
      <div className="w-full md:w-[580px] mx-auto flex-grow pb-32 md:pb-36">
        <div className="mb-10">
          <h1 className="text-center text-[22px] md:text-[32px] leading-[125%] font-medium headers-font text-[#251F20]">
            ""When nothing else worked...{" "}
            <span className="text-[#AE7E56]">MyRocky</span> did!"
          </h1>
        </div>

        <div className="rounded-[18px] overflow-hidden mb-10 relative w-full h-[335px] md:h-[580px]">
          <CustomImage
            src="/glp-quiz/Before%26After.png"
            alt="Before and after testimonial"
            fill
            sizes="(max-width: 768px) 100vw, 520px"
            className="object-cover"
          />
        </div>

        <p className="text-center text-[#779d7c] md:text-[28px] text-[18px] leading-[120%] font-medium headers-font px-2">
          Are you ready for your next chapter?
        </p>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] backdrop-blur-sm">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          <button
            className="w-full py-3 flex items-center justify-center gap-2 bg-black text-white rounded-full h-[40px] md:h-[52px] font-medium border-none focus:outline-none focus:ring-0 text-[12px] md:text-[16px]"
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

export default Glp1BeforeAfterStep;
