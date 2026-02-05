import React from 'react';
import { TbChartArcs3 } from "react-icons/tb";
import { 
  FaShippingFast, 
  FaStethoscope, 
  FaTag, 
  FaFilePrescription,
  FaShieldAlt 
} from 'react-icons/fa';

const KeyFeatures = () => {
  const features = [
    {
      icon: TbChartArcs3,
      text: "Weight Loss Goal Guarantee."
    },
    {
      icon: FaShippingFast,
      text: "Always Free, 48hr Delivery."
    },
    {
      icon: FaStethoscope,
      text: "Clinician-led Plans & 24/7 Care Teams."
    },
    {
      icon: FaTag,
      text: "Honest Pricing."
    },
    {
      icon: FaFilePrescription,
      text: "400,000+ Prescriptions Written."
    },
    {
      icon: FaShieldAlt,
      text: "No Insurance. No Waitlist. No Hidden Fees."
    }
  ];

  return (
    <div className="w-full h-[388px] py-[40px] px-[20px] md:h-[202px] md:py-[48px] md:px-0">
      {/* Mobile: 2 columns, 3 rows */}
      <div className="grid grid-cols-2 gap-6 md:hidden max-w-[1184px] mx-auto" >
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center"
            >
              {/* Icon */}
              <div className="mb-[16px]">
                <IconComponent className="w-[24px] h-[24px] text-black" />
              </div>
              {/* Text */}
              <p className="text-[14px] font-normal text-[#000] text-center font-['Poppins'] leading-[140%]">
                {feature.text}
              </p>
            </div>
          );
        })}
      </div>

      {/* Desktop: Horizontal row */}
      <div className="hidden md:flex justify-center items-start gap-[24px]">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="flex flex-col items-center text-center max-w-[200px]"
            >
              {/* Icon */}
              <div className="mb-[16px]">
                <IconComponent className="w-[24px] h-[24px] text-black" />
              </div>
              {/* Text */}
              <p className="text-[16px] font-normal text-[#000] text-center font-['Poppins'] leading-[140%]">
                {feature.text}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeyFeatures;
