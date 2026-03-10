import React from "react";
import CustomImage from "../../utils/CustomImage";

const WeightLossResultsStep = ({ onContinue }) => {
  return (
    <div className="w-full md:w-[520px] mx-auto px-5 md:px-0 flex flex-col min-h-screen">
      <div className="flex-grow mt-6">
        <h1 className="headers-font text-[26px] font-[450] md:font-medium md:text-[32px] md:leading-[115%] leading-[120%] tracking-[-1%] md:tracking-[-2%] mb-4">
          MyRocky creates long-term weight loss
        </h1>

        <p className="text-[14px] font-[400] md:text-[18px] leading-[140%] tracking-[0%] text-black mb-6">
          On average, MyRocky members lose 2-5x more weight vs. similar programs -
          without restrictive diets. Our holistic approach goes beyond just
          treatments - we help you develop habits for a healthier, happier you.
        </p>

        {/* Main Chart Card */}
        <div className="flex mb-[40px] justify-center items-center">
          <CustomImage
            src={"/wl-pre-consultation/Weight.png"}
            height="324"
            width="335"
            alt={"Weight Loss Results"}
          />
        </div>

        {/* Clinical study disclaimer */}
        <div className="text-[11px] mb-6 text-black text-left font-[400] leading-[140%] tracking-[0%]">
          *On average, through lifestyle changes, treatment and support, MyRocky
          members lose 12% of their weight in 6 months.
        </div>
      </div>

      {/* Continue Button - Positioned at bottom */}
      <div className="sticky bottom-0 py-4 bg-white">
        <button
          onClick={onContinue}
          className="w-full py-4 bg-black text-white rounded-full font-medium text-[16px] md:text-[18px] hover:bg-gray-800 transition-colors"
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default WeightLossResultsStep;
