"use client";

import React from "react";
import CustomImage from "@/components/utils/CustomImage";
import { FaLongArrowAltRight } from "react-icons/fa";

const PromotionalBanner = () => {
  return (
    <div
      className="py-24"
      style={{
        background:
          "linear-gradient(180deg, #F5F4EF 0%, rgba(255, 255, 255, 0.00) 100%)",
      }}
    >
      <div className="md:max-w-[1184px] md:h-[584px] mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[80px] items-center">
          {/* Left Side - Image */}
          <div className=" md:h-[584px] md:w-[552px] rounded-2xl">
            <CustomImage
              src="/merch/banner.png"
              alt="Group of men wearing MyRocky apparel"
              width={552}
              height={584}
            />
          </div>

          {/* Right Side - Content */}
          <div className="space-y-8">
            <div>
              <h1 className=" headers-font md:text-5xl font-semibold tracking-[-2%] leading-[115%] text-black mb-4">
                Own the MyRocky Look
              </h1>
              <p className="md:text-xl font-normal tracking-[-2%] leading-[100%] text-[#000000A6] mb-8">
                Minimal. Bold. Built for your journey.
              </p>
            </div>

            {/* Call to Action */}
            <button className="bg-black md:h-[44px] md:w-[157px] text-white  rounded-[64px] text-sm  tracking-[0%] leading-[100%] flex items-center justify-center gap-2">
              <span>Shop Now</span>
              <FaLongArrowAltRight className="ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionalBanner;
