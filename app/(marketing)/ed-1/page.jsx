import Ed1DirectMaxHeroSection from "@/components/PreLanders/ed-1/Ed1DirectMaxHeroSection";
import Ed1DirectMaxHighlightSection from "@/components/PreLanders/ed-1/Ed1DirectMaxHighlightSection";
import Ed1DirectMaxPowerSection from "@/components/PreLanders/ed-1/Ed1DirectMaxPowerSection";
import Ed1DirectMaxQuestionFlowSection from "@/components/PreLanders/ed-1/Ed1DirectMaxQuestionFlowSection";
import Ed1OfferSection from "@/components/PreLanders/ed-1/Ed1OfferSection";
import Ed1FaqsSection from "@/components/PreLanders/ed-1/Ed1FaqsSection";
import Ed1ReviewsSection from "@/components/PreLanders/ed-1/Ed1ReviewsSection";
// import Ed1SeenOnSection from "@/components/PreLanders/ed-1/Ed1SeenOnSection";
import Section from "@/components/utils/Section";
import NewRockyInTheNews from "@/components/BodyOptimization/bo3/NewRockyInTheNews";

export default function Ed1Page() {
  return (
    <main>
      <Ed1DirectMaxHeroSection />
      {/* <Ed1SeenOnSection /> */}
      <NewRockyInTheNews />

      <Ed1DirectMaxQuestionFlowSection />
      <Ed1DirectMaxPowerSection />

      <Ed1DirectMaxHighlightSection />
      <Section bg="bg-[#F5F4EF]">
        <Ed1ReviewsSection />
      </Section>
      <Section bg="bg-[#F5F4EF]">
        <Ed1FaqsSection />
      </Section>

      <Ed1OfferSection />
    </main>
  );
}
