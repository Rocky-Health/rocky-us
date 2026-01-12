"use client";
import React from "react";
import Link from "next/link";
import { FaArrowRight, FaCheck } from "react-icons/fa6";
import CustomImage from "@/components/utils/CustomImage";
import NewHighlightV2 from "@/components/BodyOptimization/bo3/NewHighlightV2";
import NewProudPartner from "@/components/BodyOptimization/bo3/NewProudPartner";

const NewWlCover = ({ btnColor = null }) => {
  return (
    <section className="w-ful relative bg-[#F4F3EF] h-[875px] md:h-auto mx-auto max-w-[1440px]">
      <div className=" flex md:items-center pt-6  px-5 md:px-0 max-w-[1200px] mx-auto relative">
        <div
          className="w-[604px] flex flex-col justify-start"
          style={{ zIndex: 6 }}
        >
          <p className="text-black poppins-font text-[14px] md:text-[16px] font-[400] leading-[100%] flex items-center gap-2 md:mb-2 mb-[13px] md:mt-[83px]">
            Trusted by 350,000+ users
          </p>
          <h1 className="tagline-hero text-[36px] md:text-[54px] leading-[115%] tracking-[-0.72px] md:tracking-[-1.08px] text-black mb-4 md:mb-8 capitalize headers-font md:max-w-[552px]">
            Medical Weight Loss, Guaranteed
          </h1>
          <div className="mb-4 md:mb-10">
            <ul className="space-y-3 mb-4 md:mb-6">
              <li className="flex items-center gap-2 md:gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#AE7E56] text-white ">
                  <FaCheck className="w-3 h-3" />
                </span>
                <p className="text-black poppins-font text-[15px] md:text-[18px] font-[400] leading-[140%] tracking-[-0.3px] max-w-[307px] md:max-w-none">
                  Lose 15-20% of your body weight in a year*
                </p>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#AE7E56] text-white">
                  <FaCheck className="w-3 h-3" />
                </span>
                <p className="text-black poppins-font text-[15px] md:text-[18px] font-[400] leading-[140%] tracking-[-0.3px] max-w-[307px] md:max-w-none ">
                  Access the right medication for you, with your GLP-1
                  prescription.
                </p>
              </li>
              <li className="flex items-center gap-2 md:gap-3">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#AE7E56] text-white">
                  <FaCheck className="w-3 h-3" />
                </span>
                <p className="text-black poppins-font text-[15px] md:text-[18px] font-[400] leading-[140%] tracking-[-0.3px] max-w-[307px] md:max-w-none">
                  Personalized treatments with ongoing clinical support.
                </p>
              </li>
            </ul>
          </div>
          <div className="md:w-[300px]">
            <Link
              href="/wl-pre-consultation/"
              className="bg-[#013D3D] text-white rounded-full md:w-[300px] mb-3 w-full h-[48px] text-[16px] font-[500] leading-[140%] tracking-[0%] flex items-center justify-center gap-2"
            >
              <span>Am I Eligible?</span>
              <FaArrowRight />
            </Link>
            <p className="mt-2 text-black poppins-font text-[12px] font-[400] leading-normal text-center max-w-[280px] mx-auto md:mb-10 mb-4">
              <span className="text-black poppins-font text-[12px] font-[600] leading-normal">
                Money-back Guarantee:
              </span>{" "}
              Transform your body or we'll fully refund all your consultation
              costs.
              <sup>2</sup>
            </p>
            <div className=" md:mb-[122px]  mb-4 w-full mx-auto">
              <NewProudPartner section bg="bg-[#F4F3EF] mx-auto" />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 translate-y-3/4 z-10">
        <NewHighlightV2 />
      </div>
      {/* Desktop Image */}
      <div className="md:block hidden  absolute  z-0 bottom-0 right-0 h-[365px] md:h-full w-full ">
        <CustomImage
          src="https://myrocky.b-cdn.net/WP%20Images/bo3/new/HeroV1Desk.jpg"
          alt="Hero1Desk"
          fill
          className="desktop-image-hero object-cover  "
        />
      </div>
      <div className="md:hidden block absolute bottom-0 left-0 h-[348px]  w-full ">
        <CustomImage
          src="https://myrocky.b-cdn.net/WP%20Images/bo3/new/HeroV1Mob.jpg"
          alt="HeroV1Mob"
          fill
          className="mobile-image-hero object-cover   "
        />
      </div>
    </section>
  );
};

export default NewWlCover;
