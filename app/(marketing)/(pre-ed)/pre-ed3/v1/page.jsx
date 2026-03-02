import FaqsSection from "@/components/FaqsSection";
import HowRockyWorks from "@/components/HowRockyWorks";
import PreEd3HeroSection from "@/components/PreLanders/PreEd3HeroSection";
import ReviewsSection from "@/components/ReviewsSection";
import Section from "@/components/utils/Section";
import { SexualHealthFaqs } from "@/components/PreLanders/data/SexualHealthFaqs";
import { getVariantById } from "@/lib/constants/preEd3Variants";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function PreEd3V1() {
  const variant = getVariantById(1);

  return (
    <main>
      <PreEd3HeroSection
        desktopBgImage={variant.desktopImage}
        mobileBgImage={variant.mobileImage}
        titleLine1={variant.titleLine1}
        titleLine2={variant.titleLine2}
        subTitle="Digital Healthcare for men without the wait time or stigma."
        btnText="Get Started →"
        quizHref="/ed-pre-consultation-quiz"
        layout={variant.layout}
      ></PreEd3HeroSection>
      <Section bg={"bg-[#FFFFFF]"}>
        <HowRockyWorks />
      </Section>

      <Section bg={"bg-[#F5F4EF]"}>
        <ReviewsSection />
      </Section>
      <Section>
        <FaqsSection
          faqs={SexualHealthFaqs}
          title="Your Questions, Answered"
          name="Meet MyRocky"
          subtitle="Frequently asked questions"
        />
      </Section>
    </main>
  );
}
