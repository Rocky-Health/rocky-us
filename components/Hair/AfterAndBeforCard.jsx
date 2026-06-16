"use client";

import { FaCheck } from "react-icons/fa6";
import CustomImage from "../utils/CustomImage";

const AfterAndBeforCard = ({
  name,
  beforeImage,
  afterImage,
  duration,
  reviewText,
}) => {
  return (
    <div
      className=" relative min-w-[280px] md:min-w-[390px] border md:border-[0.5px] border-[#E2E2E1] rounded-[16px] px-4 md:px-6 py-6 md:py-10 overflow-hidden"
      style={{
        background:
          "linear-gradient(rgb(255, 255, 255) 0%, rgb(247, 247, 247) 100%)",
      }}
    >
      <div className="mx-auto text-center mb-[32px] md:mb-[40px]">
        <span className="text-[20px] leading-[30px] mb-[4px] block">
          {name}
        </span>
        <p className="flex items-center justify-center gap-[4px] text-[12px] leading-[16.8px] text-[#212121] font-[400]">
          <FaCheck className="text-[#814b00] text-base" />{" "}
          <span>Verified Reviewer</span>
        </p>
      </div>

      <div className="flex items-center justify-center gap-[2px] mb-[12px]">
        <div className="w-[123px] md:w-[170px] h-[123px] md:h-[170px] relative">
          <div className="bg-[#F5F4EF] w-[82px] h-[26px] md:h-[29px] py-[4px] text-[12px] md:text-[14px] leading-[18px] md:leading-[21px] flex items-center justify-center absolute top-[-13px] left-2/4 -translate-x-2/4 z-20">
            BEFORE
          </div>
          <div className="relative overflow-hidden  w-[170px] h-[170px]">
            <CustomImage src={beforeImage} alt="before" fill sizes="170px" />
          </div>
          {/* <Image
            loading="lazy"
            src={beforeImage}
            alt="before"
            className="w-full h-full object-cover"
            width={170}
            height={170}
          /> */}
        </div>
        <div className="w-[123px] md:w-[170px] h-[123px] md:h-[170px] relative">
          <div className="bg-[#F5F4EF] w-[82px] h-[26px] md:h-[29px] py-[4px] text-[12px] md:text-[14px] leading-[18px] md:leading-[21px] flex items-center justify-center absolute top-[-13px] left-2/4 -translate-x-2/4 z-20">
            AFTER
          </div>

          <div className="relative overflow-hidden  w-[170px] h-[170px]">
            <CustomImage src={afterImage} alt="after" fill sizes="170px" />
          </div>
          {/* <Image
            loading="lazy"
            src={afterImage}
            alt="after"
            className="w-full h-full object-cover"
            width={170}
            height={170}
          /> */}
        </div>
      </div>

      <p className="text-[12px] md:text-[14px] leading-[18px] md:leading-[21px] mx-auto text-center mb-[16px] md:mb-[24px] font-[500]">
        {duration}
      </p>

      <div className="text-center mx-auto text-[14px] md:text-[16px] leading-[19.6px] md:leading-[22.4px] font-[400] h-[80px] md:h-[66px]">
        "{reviewText}"
      </div>
    </div>
  );
};

export default AfterAndBeforCard;
