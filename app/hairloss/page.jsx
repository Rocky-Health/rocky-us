"use client";
import CoverSection from "@/components/utils/CoverSection";
import RockyInTheNews from "@/components/RockyInTheNews";
import ReviewsSection from "@/components/ReviewsSection";
import Section from "@/components/utils/Section";
import HowRockyWorks from "@/components/HowRockyWorks";
import TeamSection from "@/components/TeamSection";
import HairCover from "@/components/Hair/HairCover";
import AfterAndBeforSection from "@/components/Hair/AfterAndBeforSection";
import HairBlog from "@/components/Hair/HairBlog";
import PartWaysHairLoss from "@/components/Hair/PartWaysHairLoss";
import CouponCapture from "@/components/utils/CouponCapture";

export default function Hair() {
  return (
    <main>
      <CouponCapture />
      <CoverSection>
        <HairCover />
      </CoverSection>

      <Section>
        <AfterAndBeforSection />
      </Section>

      <RockyInTheNews />

      <Section>
        <HowRockyWorks />
      </Section>

      <Section bg={"bg-[#F5F4EF]"}>
        <ReviewsSection />
      </Section>

      <Section>
        <PartWaysHairLoss />
      </Section>

      <Section>
        <TeamSection />
      </Section>

      <HairBlog />
    </main>
  );
}
