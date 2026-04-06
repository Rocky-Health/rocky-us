"use client";

import Link from "next/link";
import { FaArrowRight, FaCheck } from "react-icons/fa6";
import NewHighlightV2 from "@/components/BodyOptimization/bo3/NewHighlightV2";
import NewProudPartner from "@/components/BodyOptimization/bo3/NewProudPartner";

const GLP1HeroSection = ({ ctaHref = "#", hideProudPartner = false }) => {
  return (
    <section className="w-full relative bg-[#F4F3EF] mx-auto max-w-[1440px]">
      <div className="pt-8 pb-20 md:pb-28 px-5 md:px-0 max-w-[1200px] mx-auto relative">
        <div className="flex flex-col items-center text-center max-w-[700px] mx-auto">
          <div className="flex items-center gap-1 mb-2">
            {[...Array(5)].map((_, i) => (
              <svg key={i} width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B" aria-hidden="true">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <p className="text-black poppins-font text-[14px] md:text-[16px] font-[400] leading-[100%] flex items-center gap-2 mb-4 md:mb-6">
            Trusted by 350,000+ Patients
          </p>

          <h1 className="text-[36px] md:text-[54px] leading-[115%] tracking-[-0.72px] md:tracking-[-1.08px] text-black mb-4 md:mb-6 headers-font">
            Lose <span className="text-[#AE7E56]">1–2lbs</span> per week!
          </h1>

          <p className="poppins-font text-[16px] md:text-[18px] font-[400] leading-[140%] mb-4 md:mb-6 text-black">
            The proven way to lose 15% of your body weight fast!
          </p>

          <p className="poppins-font text-[16px] md:text-[18px] font-[400] mb-8 md:mb-10">
            Starting at{" "}
            <span className="text-[#AE7E56] font-[700] text-[28px] md:text-[36px] headers-font">
              $149
            </span>{" "}
            &mdash; GLP-1 &amp; GLP-1 + GIP in stock
          </p>

          {/* Checklist */}
          <ul className="space-y-4 mb-8 md:mb-10 text-left w-full max-w-[500px]">
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#AE7E56] text-white flex-shrink-0">
                <FaCheck className="w-3 h-3" />
              </span>
              <p className="text-black poppins-font text-[15px] md:text-[16px] font-[400] leading-[140%]">
                100% online medical visit. Injections and oral options
                available.
              </p>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#AE7E56] text-white flex-shrink-0">
                <FaCheck className="w-3 h-3" />
              </span>
              <p className="font-[600] text-black poppins-font text-[15px] md:text-[16px] leading-[140%]">
                Same price, every dose. No hidden fees.
              </p>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#AE7E56] text-white flex-shrink-0">
                <FaCheck className="w-3 h-3" />
              </span>
              <p className="text-black poppins-font text-[15px] md:text-[16px] leading-[140%]">
                Prescription & telemed visits included. No insurance required.
              </p>
            </li>
            <li className="flex items-center gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#AE7E56] text-white flex-shrink-0">
                <FaCheck className="w-3 h-3" />
              </span>
              <p className="text-black poppins-font text-[15px] md:text-[16px] leading-[140%]">
                Free shipping. Arrives in 1–2 days.
              </p>
            </li>
          </ul>

          {/* CTA */}
          <Link
            href={ctaHref}
            className="bg-[#013D3D] text-white rounded-full w-full max-w-[400px] h-[52px] text-[16px] font-[500] leading-[140%] flex items-center justify-center gap-2 mb-4"
          >
            <span>AM I QUALIFIED?</span>
            <FaArrowRight />
          </Link>

          <p className="text-black poppins-font text-[12px] font-[400] leading-normal text-center max-w-[300px] mx-auto mb-6">
            <span className="font-[600]">Money-back Guarantee:</span> The only
            thing you&apos;ll lose is extra weight.
          </p>

          {!hideProudPartner && (
            <div className="w-full flex justify-center">
              <NewProudPartner
                section={true}
                bg="bg-[#F4F3EF] mx-auto"
                hideMapleLeaf={true}
              />
            </div>
          )}
        </div>
      </div>

      {/* Highlight bar overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 translate-y-3/4 z-10">
        <NewHighlightV2 />
      </div>
    </section>
  );
};

export default GLP1HeroSection;
