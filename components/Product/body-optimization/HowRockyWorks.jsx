"use client";
import React, { useState } from "react";
import TimelineStep from "./TimelineStep";
import DecorativeImage from "./DecorativeImage";
import { timelineSteps } from "./constants/timelineData";

const HowRockyWorks = () => {
  const [expandedSection, setExpandedSection] = useState("consultation");

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="w-full max-w-[1184px] mx-auto mt-0 md:-mt-32 mb-8">
      <div className="bg-white relative rounded-2xl shadow-md p-6 md:py-[96px] md:px-[100px]">
        <div className="flex flex-col md:flex-row">
          {/* Title */}
          <div className="w-full text-center md:text-start md:w-1/3 mb-6 md:mb-0 ">
            <h2 className="text-[32px] text-[#000000] headers-font font-[550]">
              How MyRocky helps you lose weight
            </h2>
            <p className="text-[#212121] text-sm md:text-base mt-4">
              MyRocky helps you lose weight by offering doctor-trusted,
              personalized treatments with fast, discreet delivery and ongoing
              medical support.
            </p>
          </div>

          {/* Timeline */}
          <div className="w-full md:w-2/3 relative">
            <div className="absolute left-[16px] top-0 bottom-0 w-[2px] bg-[#E2E2E1]"></div>

            {/* timeline steps */}
            {timelineSteps.map((step, index) => (
              <React.Fragment key={step.section}>
                <TimelineStep
                  section={step.section}
                  headTitle={step.headTitle}
                  title={step.title}
                  timeframe={step.timeframe}
                  content={step.content}
                  hasCircle={step.hasCircle}
                  expandedSection={expandedSection}
                  toggleSection={toggleSection}
                  iconSrc={step.iconSrc}
                  isFirstItem={index === 0}
                />
                {step.image && index < timelineSteps.length - 1 && (
                  <DecorativeImage
                    src={step.image}
                    alt="Process illustration"
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowRockyWorks;
