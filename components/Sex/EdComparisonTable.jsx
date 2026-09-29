"use client";
import { FaCheckCircle } from "react-icons/fa";
import Image from "next/image";

const EdComparisonTable = ({ leftAlign = false }) => {

  const treatments = [
    {
      name: "Cialis",
      subtitle: "(Tadalafil)",
      image: "/ed-comparison/Cialis.png",
      onsetTime: "30-60 minutes",
      duration: "Up to 36 hours",
      frequency: "As needed",
      canTakeWithFood: true,
      prescriptionNeeded: true,
      costPerDose: "$17.25"
    },
    {
      name: "Viagra",
      subtitle: "(Sildenafil)",
      image: "/ed-comparison/Viagra.png",
      onsetTime: "30-60 minutes",
      duration: "4-6 hours",
      frequency: "As needed",
      canTakeWithFood: false,
      prescriptionNeeded: true,
      costPerDose: "$13.50"
    }
  ];

  const features = [
    "Onset Time",
    "How Long It Works",
    "Use Frequency",
    "Can Take with Food",
    "Prescription Needed",
    "Cost per dose"
  ];

  return (
    <div className="w-full">
      <div className={`${leftAlign ? 'text-left' : 'text-center'} mb-8 md:mb-12`}>
        <h2 className="text-[32px] md:text-5xl font-[550] leading-[36.8px] md:leading-[55.2px] tracking-[-0.01em] md:tracking-[-0.02em] mb-3 md:mb-4 headers-font">
          Find The Right ED Treatment For You
        </h2>
        <p className={`text-lg md:text-xl font-[400] leading-[25.2px] md:leading-[28px] max-w-[737px] ${leftAlign ? '' : 'mx-auto'}`}>
          Compare effectiveness, speed, side effects, and more to choose the best option with confidence.
        </p>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Drug Icons Header Row */}
        <div className="flex justify-center items-start mb-6 space-x-8">
          {treatments.map((treatment, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="w-12 h-12 mb-2 flex items-center justify-center rounded-full bg-gray-100">
                <Image
                  src={treatment.image}
                  alt={treatment.name}
                  width={32}
                  height={32}
                  className="object-contain"
                />
              </div>
              <div className="text-xs font-semibold text-black text-center h-8 flex items-center justify-center">
                {treatment.name}
              </div>
              <div className="text-xs text-black text-center">
                {treatment.subtitle}
              </div>
            </div>
          ))}
        </div>

        {/* Feature Rows */}
        <div className="space-y-0">
          {/* Onset Time */}
          <div className="p-3 border-b border-black/80">
            <div className="text-sm font-bold text-black mb-2 text-center">Onset Time</div>
            <div className="flex justify-between">
              {treatments.map((treatment, index) => (
                <div key={index} className="text-xs text-black text-center flex-1">
                  {treatment.onsetTime}
                </div>
              ))}
            </div>
          </div>

          {/* How Long It Works */}
          <div className="p-3 border-b border-black/80">
            <div className="text-sm font-bold text-black mb-2 text-center">How Long It Works</div>
            <div className="flex justify-between">
              {treatments.map((treatment, index) => (
                <div key={index} className="text-xs text-black text-center flex-1">
                  {treatment.duration}
                </div>
              ))}
            </div>
          </div>

          {/* Use Frequency */}
          <div className="p-3 border-b border-black/80">
            <div className="text-sm font-bold text-black mb-2 text-center">Use Frequency</div>
            <div className="flex justify-between">
              {treatments.map((treatment, index) => (
                <div key={index} className="text-xs text-black text-center flex-1">
                  {treatment.frequency}
                </div>
              ))}
            </div>
          </div>

          {/* Can Take with Food */}
          <div className="p-3 border-b border-black/80">
            <div className="text-sm font-bold text-black mb-2 text-center">Can Take with Food</div>
            <div className="flex justify-between">
              {treatments.map((treatment, index) => (
                <div key={index} className="flex justify-center flex-1">
                  {treatment.canTakeWithFood ? (
                    <FaCheckCircle className="text-black text-lg" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-400 rounded-full"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Prescription Needed */}
          <div className="p-3 border-b border-black/80">
            <div className="text-sm font-bold text-black mb-2 text-center">Prescription Needed</div>
            <div className="flex justify-between">
              {treatments.map((treatment, index) => (
                <div key={index} className="flex justify-center flex-1">
                  <FaCheckCircle className="text-black text-lg" />
                </div>
              ))}
            </div>
          </div>

          {/* Cost per dose */}
          <div className="p-3">
            <div className="text-sm font-bold text-black mb-2 text-center">Cost per dose</div>
            <div className="flex justify-between">
              {treatments.map((treatment, index) => (
                <div key={index} className="text-xs text-black text-center flex-1">
                  {treatment.costPerDose}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[800px] flex">
          <div className="w-1/4 min-w-[200px]">
            <div className="h-24 lg:h-32 flex items-center border-b border-black px-4">
              <span className="text-black font-semibold text-lg lg:text-xl">
                Feature
              </span>
            </div>
            {features.map((feature, index) => (
              <div
                key={index}
                className={`h-16 lg:h-20 flex items-center px-4 ${index < features.length - 1 ? 'border-b border-black' : ''}`}
              >
                <span className="text-sm lg:text-base text-black font-bold">
                  {feature}
                </span>
              </div>
            ))}
          </div>

          {treatments.map((treatment, treatmentIndex) => (
            <div
              key={treatmentIndex}
              className="w-1/4 min-w-[180px]"
            >
              <div className="h-24 lg:h-32 flex flex-col items-center justify-center border-b border-black/80 px-2">
                <div className="w-12 h-12 lg:w-16 lg:h-16 mb-1 flex items-center justify-center">
                  <Image
                    src={treatment.image}
                    alt={treatment.name}
                    width={40}
                    height={40}
                    className="object-contain lg:w-12 lg:h-12"
                  />
                </div>
                <div className="text-center">
                  <div className="text-sm lg:text-base font-semibold text-black">
                    {treatment.name}
                  </div>
                  <div className="text-xs lg:text-sm text-black">
                    {treatment.subtitle}
                  </div>
                </div>
              </div>

              <div className="h-16 lg:h-20 flex items-center justify-center border-b border-black/80 px-2">
                <span className="text-xs lg:text-sm text-black text-center">
                  {treatment.onsetTime}
                </span>
              </div>

              <div className="h-16 lg:h-20 flex items-center justify-center border-b border-black/80 px-2">
                <span className="text-xs lg:text-sm text-black text-center">
                  {treatment.duration}
                </span>
              </div>

              <div className="h-16 lg:h-20 flex items-center justify-center border-b border-black/80 px-2">
                <span className="text-xs lg:text-sm text-black text-center">
                  {treatment.frequency}
                </span>
              </div>

              <div className="h-16 lg:h-20 flex items-center justify-center border-b border-black/80 px-2">
                {treatment.canTakeWithFood ? (
                  <FaCheckCircle className="text-black text-lg" />
                ) : (
                  <div className="w-5 h-5 border-2 border-black rounded-full"></div>
                )}
              </div>

              <div className="h-16 lg:h-20 flex items-center justify-center border-b border-black/80 px-2">
                <FaCheckCircle className="text-black text-lg" />
              </div>

              <div className="h-16 lg:h-20 flex items-center justify-center px-2">
                <span className="text-sm lg:text-base text-black">
                  {treatment.costPerDose}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 text-[10px] lg:text-xs text-gray-600 max-w-4xl">
        <p>
          Cialis and Viagra are prescription medications intended to support healthy sexual function. As with any medication, 
          they may cause mild side effects such as headache, indigestion, flushing, or nasal congestion in some individuals. 
          Sublingual Tadalafil dissolves under the tongue, bypassing the stomach and reducing potential side effect. Always 
          consult with your healthcare provider to ensure these treatments are right for you.
        </p>
      </div>
    </div>
  );
};

export default EdComparisonTable;
