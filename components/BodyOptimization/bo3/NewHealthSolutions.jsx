"use client";
import Link from "next/link";
import { useState } from "react";
import { FaArrowRight, FaChevronDown, FaChevronUp } from "react-icons/fa6";
import CustomImage from "@/components/utils/CustomImage";

const accordionData = [
  {
    title: "Work with your body, not against it",
    content:
      "Traditional diets don't work because nearly 70% of weight is genetically determined. Through medication, and a comprehensive data-backed weight loss plan, you can work with your body, rather than against it.",
  },
  {
    title: "No restrictive diets, just science",
    content:
      "No restrictive diets or miracle cures—just scientifically-backed weight loss treatments designed to fit seamlessly into your life. Break the cycle of yo-yo dieting with strategies that address the biological factors influencing your weight.",
  },
  {
    title: "Improve health",
    content:
      "Lose weight in a healthy manner with strategies that may reduce your risk for certain conditions like diabetes and heart disease. Our plans encourage realistic nutrition principles, tailored tips to support better eating habits and sleep quality.",
  },
];

const HealthSolutions = ({ btnColor = null }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section>
      {/* Heading */}
      <div className="max-w-[817px] mx-auto md:mb-14 mb-8">
        <h1 className="headers-font text-[#000] text-[32px] md:text-[48px] leading-[115%] md:leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] md:text-center not-italic mb-6">
          Weight Loss that Works with Your Body
        </h1>
        <p className="poppins-font text-[#000] text-[16px] md:text-[18px] font-[400] leading-[140%] md:leading-[140%] md:text-center not-italic  md:py-0 md:mb-[18px]">
          It's not magic, it's metabolic science. Access GLP-1s and treatments
          tailored to your unique goals, body and lifestyle, with all the
          support you need.
        </p>
      </div>

      {/* Unified Layout: Mobile (column) and Desktop (row) */}
      <div className="flex flex-col md:flex-row md:items-center md:gap-[80px] border-t-[1px] border-[#E2E2E1] pt-6 md:border-t-0 md:pt-0">
        {/* Content - Mobile: first, Desktop: right */}
        <div className="w-full md:w-1/2 order-1 md:order-2">
          {/* Accordion List */}
          <ul className="mb-5 md:mb-14 text-base font-normal">
            {accordionData.map((item, index) => (
              <li
                key={index}
                className={index > 0 ? "border-t border-gray-200" : ""}
              >
                <div
                  className="flex items-center justify-between cursor-pointer py-[25px]"
                  onClick={() => handleToggle(index)}
                >
                  <div className="flex items-center justify-between w-full">
                    <p className="poppins-font text-[#000] text-[18px] md:text-[20px] font-[500] leading-normal tracking-[-0.36px] md:tracking-[-0.4px] not-italic">
                      {item.title}
                    </p>
                    <span
                      className={`transform transition-transform duration-300 ease-in-out flex items-center justify-center ${
                        openIndex === index ? "rotate-0" : "rotate-180"
                      }`}
                    >
                      <FaChevronUp className="text-[#000] w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    openIndex === index
                      ? "max-h-[500px] opacity-100 pb-4"
                      : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="poppins-font text-[#000] text-[16px] font-[400] leading-[140%] not-italic max-w-[500px]">
                    {item.content}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* Button */}
          <div className="w-full md:w-[240px] mb-5 md:mb-0">
            <Link
              href="/wl-pre-consultation/"
              className={`flex h-[48px] px-8 items-center justify-center gap-2 w-full md:w-[240px] rounded-[64px] transition text-white hover:bg-gray-800  bg-[#013D3D]`}
            >
              <span className="poppins-font text-[#FFF] text-[16px] leading-[140%] not-italic">
                I know what I want
              </span>
              <FaArrowRight />
            </Link>
          </div>
        </div>

        {/* Image - Mobile: second, Desktop: left */}
        <div className="order-2 md:order-1 relative overflow-hidden rounded-[16px] w-full h-[382.857px] md:w-[560px] md:h-[640px] flex justify-center lg:justify-start mb-5 md:mb-0 shrink-0">
          <CustomImage
            width="560"
            height="640"
            src="https://myrocky.b-cdn.net/WP%20Images/bo3/new/WeightLoss.jpg"
            alt="Weight Loss"
            className="w-full h-full object-cover rounded-[16px]"
          />
        </div>
      </div>
    </section>
  );
};

export default HealthSolutions;
