"use client";

import CustomImage from "../utils/CustomImage";

const ResultCard = ({
  beforeImage,
  afterImage,
  duration,
  reviewText,
  name,
}) => {
  return (
    <div className="w-full min-w-[300px] md:min-w-[380px] h-[495.32px] md:h-[577px] rounded-[16px] bg-[#F5F4EF] border border-[#E2E2E1] shadow-sm overflow-hidden px-5 md:px-6 py-6 text-center">
      {/* Duration pill */}
      <div className="bg-[#AE7E56] border border-[#AE7E56] text-white text-[14px] md:text-[16px] font-[500] leading-[140%] px-6 md:px-4 py-[2px] md:py-1 rounded-full inline-block mx-auto mb-5 md:mb-[33px]">
        {duration}
      </div>

      {/* Before/After images */}
      <div className="flex justify-center gap-1 mb-5 md:mb-8">
        <div className="flex flex-col items-center">
          <div className="relative w-[128px] md:w-[164px] h-[187.32px] md:h-[240px] rounded-[16px] overflow-hidden bg-[#0000001F]">
            <CustomImage src={beforeImage} alt="before" fill sizes="(max-width: 768px) 128px, 164px" />
          </div>
          <div className="text-[14px] text-[#000000] leadding-[140%] font-[400] mt-1 dm:mt-2">
            Before
          </div>
        </div>
        <div className="flex flex-col items-center">
          <div className="relative w-[128px] md:w-[164px] h-[187.32px] md:h-[240px] rounded-[16px] overflow-hidden bg-[#0000001F]">
            <CustomImage src={afterImage} alt="after" fill sizes="(max-width: 768px) 128px, 164px" />
          </div>
          <div className="text-[14px] text-[#000000] leadding-[140%] font-[400] mt-1 dm:mt-2">
            After
          </div>
        </div>
      </div>

      {/* Testimonial */}
      <p className="text-[16px] md:text-[18px] leading-[140%] text-[#000000] font-[400] max-w-[250px] md:max-w-[330px] mb-4 md:mb-6">
        "{reviewText}"
      </p>

      {/* Customer info */}
      <div>
        <p className="font-[600] text-[16px] md:text-[18px] leading-[140%] text-[#000000] mb-1">
          {name}
        </p>
        <p className="text-[14px] font-[400] leading-[140%] text-[#0000008F]">
          MyRocky customer
        </p>
      </div>
    </div>
  );
};

export default ResultCard;
