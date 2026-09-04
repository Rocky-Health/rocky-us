import React from "react";
import PodcastHeader from "./PodcastHeader";
import PodcastImage from "./PodcastImage";
import StatisticCard from "./StatisticCard";
import SectionContainer from "./SectionContainer";

const PodcastsContent = () => {
  return (
    <SectionContainer
      bgColor="bg-[#F5F4EF]"
      paddingY="pt-6 pb-14 md:pt-20 md:pb-0"
      aria-label="Podcasts Section"
    >
      <div className="flex flex-col gap-8">
        <PodcastHeader />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="hidden md:block md:w-1/4">
            <StatisticCard
              value="10K+"
              title="Monthly Listeners"
              description="Join a community of over 10,000 tuning in every month."
              className="mb-[200px] flex flex-col gap-2"
              valueClassName="text-[70px] headers-font font-[550px] text-[#AE7E56] mb-2"
              titleClassName="text-2xl font-medium"
              descriptionClassName="text-lg"
              mobileFirst={true}
            />
          </div>

          <PodcastImage />

          <div className="flex flex-col gap-6 md:gap-4 md:w-1/4">
            <div className="flex flex-row gap-4 md:flex-col md:gap-2">
              <StatisticCard
                value="95%"
                title="Knowledge Gains"
                description="95% of our listeners gained actionable tips to enhance their health and well-being."
                className="flex flex-col flex-1 gap-1 md:mt-56"
                valueClassName="text-[40px] md:text-[70px] headers-font text-[#AE7E56]"
                titleClassName="text-base md:text-2xl font-medium"
                descriptionClassName="text-sm md:text-base"
                mobileFirst={true}
              />

              <StatisticCard
                value="10K+"
                title="Monthly Listeners"
                description="Join a community of over 10,000 tuning in every month for valuable health insights and discussions"
                className="flex flex-col flex-1 gap-1 md:hidden"
                valueClassName="text-[40px] headers-font text-[#AE7E56]"
                titleClassName="text-base font-medium"
                descriptionClassName="text-sm"
                mobileFirst={true}
              />
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
};

export default PodcastsContent;
