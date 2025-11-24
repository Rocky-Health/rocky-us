"use client";

import RockyFeatures from "@/components/RockyFeatures";
import CoverSection from "@/components/utils/CoverSection";
import Section from "@/components/utils/Section";
import HowRockyWorks from "@/components/HowRockyWorks";
import RockyInTheNews from "@/components/RockyInTheNews";
import Categories from "@/components/Reviews/Categories";
import CustomImage from "@/components/utils/CustomImage";
import HeroSection from "@/components/shared/HeroSection";
import ReviewsSection from "@/components/Reviews/ReviewsSection";

const reviewsButtons = [
  {
    href: "#find-treatment",
    text: "Find your treatment",
    className:
      "bg-black text-white px-6 py-3 rounded-full flex items-center space-x-2 hover:bg-gray-800 transition",
    showArrow: false,
  },
];

export default function Home() {
  return (
    <div>
      <CoverSection bg={"bg-[#f7f9fb]"}>
        <HeroSection
          title="Don't just take our word for it"
          description="Join 350,000+ people in Us who trust Rocky for exceptional healthcare."
          buttons={reviewsButtons}
          imageSrc="https://myrocky.b-cdn.net/WP%20Images/Review%20Page/Reviews-section.webp"
          imageAlt="hero Image"
          imageWidth={600}
          imageHeight={400}
          imageClassName="object-contain bottom-0 md:absolute"
          containerClassName="py-8 px-6 lg:px-8"
          imageContainerClassName="w-full h-full relative"
        />
      </CoverSection>

      <br />
      <RockyFeatures />

      <br />

      <ReviewsSection />

      <Section>
        <HowRockyWorks />
      </Section>
      <RockyInTheNews />
      <div className="flex justify-center items-center mt-[24px] mb-4">
        <CustomImage
          src="/OCP-IMGS.webp"
          width="300"
          height="300"
        ></CustomImage>
      </div>
      <Section>
        <Categories />
      </Section>
    </div>
  );
}
