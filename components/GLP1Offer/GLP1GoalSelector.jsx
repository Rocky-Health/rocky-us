"use client";

import { useState } from "react";
import Link from "next/link";
import { goalOptions } from "./data";

const GLP1GoalSelector = ({ ctaHref = "#" }) => {
  const [selected, setSelected] = useState(null);

  return (
    <div className="max-w-[600px] mx-auto text-center">
      <h2 className="headers-font text-black text-[32px] md:text-[42px] leading-[115%] tracking-[-0.64px] mb-8 md:mb-10">
        What&apos;s your weight loss goal?
      </h2>

      <div className="space-y-3 mb-8">
        {goalOptions.map((option, index) => (
          <button
            key={index}
            onClick={() => setSelected(index)}
            className={`w-full rounded-full h-[52px] text-[16px] font-[500] poppins-font transition-all border ${
              selected === index
                ? "bg-[#013D3D] text-white border-[#013D3D]"
                : "bg-white text-black border-[#E2E2E1] hover:border-[#AE7E56]"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <Link
        href={ctaHref}
        className="bg-[#013D3D] text-white rounded-full w-full h-[52px] text-[16px] font-[500] leading-[140%] flex items-center justify-center"
      >
        Continue
      </Link>
    </div>
  );
};

export default GLP1GoalSelector;
