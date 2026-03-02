import FaqsSection from "@/components/FaqsSection";
import ReviewsSection from "@/components/ReviewsSection";
import Section from "@/components/utils/Section";
import WlHeroSection from "@/components/WL/WlHeroSection";
import WLProgram from "@/components/WL/WLProgram";
import { WlFaqs } from "@/components/PreLanders/data/WlFaqs";
import { WeightLossProgramItems } from "@/components/PreLanders/data/WeightLossProgramItems";

export default function WlPrelander() {
  return (
    <main>
      <WlHeroSection
        h1="Get Your"
        h2="Confidence Back"
        p="Lose the weight and keep it off for good."
        href="body-optimization"
        btnText="Get Started →"
      ></WlHeroSection>

      <WLProgram ProgramWorksData={WeightLossProgramItems}> </WLProgram>

      <Section bg={"bg-[#F5F4EF]"}>
        <ReviewsSection />
      </Section>

      <Section>
        <FaqsSection
          faqs={WlFaqs}
          title="Your Questions, Answered"
          name="Meet MyRocky"
          subtitle="Frequently asked questions"
        />
      </Section>
    </main>
  );
}
