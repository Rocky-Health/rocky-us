import React from 'react';
import BrimaryButton from '@/components/ui/buttons/BrimaryButton';

const UnmatchedResults = () => {
  const consultationHref = "/wl-pre-consultation/";

  const statistics = [
    {
      value: "2x",
      title: "Better Results",
      description: "In 180 days, Rocky members lose up to twice as much weight compared to other programs."
    },
    {
      value: "16+ lbs",
      title: "Avg. Weight Loss",
      description: "Average weight reduction within 90 days of starting Rocky’s program."
    },
    {
      value: "93.7%",
      title: "Success Rate",
      description: "Percentage of Rocky members achieving clinically meaningful weight loss outcomes."
    }
  ];

  return (
    <div className="w-full">
      {/* Headline */}
      <div className="text-center mb-6">
        <h2 className="text-[32px] md:text-[48px] md:font-[550] leading-none tracking-[-0.64px] md:tracking-[-0.96px] mb-2 headers-font text-black mx-auto w-[83%] md:max-w-[694px]">
          Why Is Everyone Switching to Rocky? <span className="text-[32px] md:text-[48px]  md:font-[550] leading-none tracking-[-0.64px] md:tracking-[-0.96px] headers-font text-[#AE7E56]">
            Unmatched Results.
          </span>
        </h2>
      </div>

      {/* Sub-headline */}
      <p className="text-center text-[16px] md:text-[18px] font-normal text-black mb-12 leading-[140%] mx-auto md:max-w-[482px]">
        MyRocky members lose more weight, faster, than the average results reported by other GLP-1 providers.
      </p>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 mb-12 md:w-[972px] md:h-[195px] md:mx-auto">
        {statistics.map((stat, index) => (
          <div key={index} className="text-center">
            {/* Separator line for mobile (except first) */}
            {index > 0 && (
              <div className="md:hidden border-t border-gray-200 mb-8 -mt-4"></div>
            )}
            
            {/* Value */}
            <div className="text-[40px] md:text-[64px] md:font-[550] headers-font text-[#AE7E56] mb-2 tracking-[-0.8px] md:tracking-[-1.28px] leading-none">
              {stat.value}
            </div>
            
            {/* Title */}
            <h3 className="text-[22px] md:text-[24px]  md:font-medium text-[#212121] mb-3 tracking-[-0.44px] md:tracking-[-0.48px] leading-none capitalize">
              {stat.title}
            </h3>
            
            {/* Description */}
            <p className="text-[14px] md:text-[16px] font-normal text-[#212121]  tracking-[-0.28px] md:tracking-[-0.32px]">
              {stat.description}
            </p>
          </div>
        ))}
      </div>

      {/* Get Started Button */}
      <div className="flex justify-center mb-10 md:mb-[72px]">
        <BrimaryButton
          href={consultationHref}
          arrowIcon={true}
          className="flex h-[48px] w-full md:w-auto px-[48px] md:px-[32px] justify-center items-center gap-2 rounded-[64px] bg-[#000] text-white"
        >
          Get Started
        </BrimaryButton>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs font-normal leading-[140%] mx-auto max-w-[700px] text-[rgba(33,33,33,0.6)] md:text-[rgba(0,0,0,0.6)]">
        Based on self-reported data from approximately 350,000 Rocky members on a personalized treatment plan, including compounded GLP-1 medications and consultations with medical professionals.
      </p>
    </div>
  );
};

export default UnmatchedResults;
