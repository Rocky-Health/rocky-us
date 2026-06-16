"use client";

import Image from "next/image";
import CustomImage from "../utils/CustomImage";

const PartWaysHairLossCard = ({ image, title, description, letter }) => {
  return (
    <div className="relative w-[280] min-w-[280px] overflow-hidden rounded-[16px] ">
      <div className="relative overflow-hidden w-full h-[284px] bg-[#F5F4EF] rounded-[16px] object-cover mb-[24px] ">
        <CustomImage
          fill
          src={image}
          alt="title"
          className="!object-contain"
          sizes="280px"
        />
      </div>
      <div className="text-left">
        <h3 className="text-[18px] md:text-[20px] leading-[27px] md:leading-[30px] font-[500] md:font-[400] mb-[8px]">
          <span className="font-[700]">[{letter}]</span>
          {title}
        </h3>
        <p className="text-[14px] md:text-[16px] leading-[19.6px] md:leading-[22.4px] text-[#212121] font-[400] max-w-[268px]">
          {description}
        </p>
      </div>
    </div>
  );
};

export default PartWaysHairLossCard;
