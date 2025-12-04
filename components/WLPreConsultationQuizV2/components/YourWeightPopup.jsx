"use client";

import React, { useContext } from "react";
import CustomImage from "@/components/utils/CustomImage";
import { BiArrowToBottom } from "react-icons/bi";
import { FaArrowDown } from "react-icons/fa6";


const YourWeightPopup = ({ weight }) => {

  const weightDisplay = weight ? `${weight} lbs` : "-- lbs";

  return (
    <>
      <div>
        <h1 className="headers-font font-medium text-[26px] leading-[120%] tracking-tight mb-[24px] ">
          Your Weight
        </h1>
        <div className="flex justify-center items-center mb-[24px] relative">

          <p className="absolute top-[15px] tracking-tight left-[32px]  md:left-[115px] z-[999999] text-[56px] text-white font-medium">
            {weightDisplay}
          </p>
          <p className="absolute flex items-center top-[80px] text-[#DCA77B]  tracking-tight left-[32px] md:left-[115px] z-[999999] text-[34px]  font-medium">

            <FaArrowDown className="text-[24px]" /> {weight * (25 / 100)} lbs
          </p>
          <CustomImage src="https://myrocky.b-cdn.net/WP%20Images/wl-pre-consultation/emptyImage.webp" className=" w-auto h-[400px]" width="335" height="410" />
        </div>

        <p className="text-[18px] leading-[140%] font-medium mb-4">
          You’ll get a tailored weight loss plan that considers your genetics, habits and lifestyle
        </p>

        {/* <div className="flex items-center justify-start gap-[8px] mb-[8px]">
          <div>
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
              <text
                x="6"
                y="28"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="bold"
                fontSize="28"
                fill="#AE7E56"
              >
                R
              </text>
              <text
                x="20"
                y="32"
                fontFamily="Arial, Helvetica, sans-serif"
                fontWeight="bold"
                fontSize="28"
                fill="#AE7E56"
              >
                X
              </text>
            </svg>
          </div>
          <div>
            <p className="text-[16px] headers-font text-[#AE7E56] leading-[120%] font-medium">
                Ozempic, Wegovy, Zepbound
            </p>
          </div>
        </div>


        <p className="text-[16px] font-medium leading-[120%] headers-font mb-24">
            Certain medications are available for pickup/delivery within 1-4 days if prescribed.
        </p> */}
      </div>
    </>
  );
};

export default YourWeightPopup;
