"use client";

import React from "react";
import { FaArrowRight } from "react-icons/fa";

const Glp1ContactIntroStep = ({ userData, onContinue }) => {
  const firstName = userData?.firstName || "";

  return (
    <div className="w-full h-full flex flex-col px-4 md:px-0">
      <div className="w-full md:w-[580px] mx-auto flex-grow">
        <h1 className="headers-font text-[32px] md:text-[40px] leading-[110%] text-[#251F20] mb-6">
          {firstName && <span className="text-[#AE7E56]">{firstName}</span>}
          {firstName ? ", how" : "How"} can you be reached if necessary?
        </h1>

        <p className="text-[15px] md:text-[16px] leading-[150%] text-[#00000080]">
          Our medical teams and pharmacy use email and text for patient
          communication.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-white">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          <button
            type="button"
            onClick={() => onContinue?.()}
            className="w-full py-3 flex items-center justify-center gap-2 rounded-full h-[52px] font-medium border-none bg-black text-white focus:outline-none focus:ring-0"
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Glp1ContactIntroStep;
