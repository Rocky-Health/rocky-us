"use client";

import React from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const Glp2BeforeAfterStep = ({ onContinue }) => {
  return (
    <div className="w-full h-full flex flex-col px-5 md:px-0">
      <div className="w-full md:w-[580px] mx-auto flex-grow pb-32 md:pb-36">
        <div className="mb-10">
          <p className="text-center text-[24px] leading-[125%] font-medium headers-font text-[#251F20]">
            " It really does work. Took about 6 weeks to feel it, but once it
            kicked in,{" "}
            <span className="text-[#AE7E56]">I dropped 35 pounds</span> of fat
            and haven&apos;t looked back. Thank you MyRocky! "
          </p>
        </div>

        <div className="rounded-[18px] overflow-hidden mb-10 relative w-full h-[335px] md:h-[580px]">
          <CustomImage
            src="/glp-quiz/Before%26After.png"
            alt="Before and after testimonial"
            fill
            className="object-cover"
          />
        </div>

        <p className="text-center text-[#000000] text-[18px] leading-[120%] font-medium headers-font px-2">
          Megan took control and doubled her confidence <br />
          in
          <span className="text-[#AE7E56]"> only 2 months.</span>
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

export default Glp2BeforeAfterStep;
