"use client";

import React from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowDown } from "react-icons/fa6";

// Separate YourWeightPopup component for BO2/BO3 simplified flow
// This is completely independent from the default WL flow
const YourWeightPopup = ({ weight }) => {
  // Ensure weight is a number, default to 0 if not
  const numericWeight = weight
    ? typeof weight === "number"
      ? weight
      : parseFloat(weight) || 0
    : 0;
  const weightDisplay = numericWeight > 0 ? `${numericWeight} lbs` : "-- lbs";
  const weightToLose =
    numericWeight > 0 ? (numericWeight * 0.25).toFixed(1) : "0";

  return (
    <>
      <div>
        <h1 className="subheaders-font text-[18px] leading-[120%] tracking-tight mb-[24px] font-[450]">
          You could lose up to{" "}
          <span className="text-[#AE7E56]">{weightToLose} lbs</span> more easily
          than you think—without restrictive diets.
        </h1>
        <div className="flex justify-center items-center mb-[24px] relative">
          <p className="absolute top-[15px] tracking-tight left-[42px]  md:left-[115px] z-[999999] text-[56px] text-white font-medium">
            {weightDisplay}
          </p>
          <p className="absolute flex items-center top-[80px] text-[#DCA77B]  tracking-tight left-[42px] md:left-[115px] z-[999999] text-[34px]  font-medium">
            <FaArrowDown className="text-[24px]" /> {weightToLose} lbs
          </p>
          <CustomImage
            src="https://myrocky.b-cdn.net/WP%20Images/wl-pre-consultation/emptyImage.webp"
            className=" w-auto h-[400px]"
            width="335"
            height="410"
          />
        </div>

        <p className="text-[18px] leading-[140%] font-medium mb-4">
          You'll get a tailored weight loss plan that considers your genetics,
          habits and lifestyle
        </p>
      </div>
    </>
  );
};

export default YourWeightPopup;
