import NadPlusHero from "@/components/NAD+/NadPlusHero";
import NadPlusFaqsSection from "@/components/NAD+/NadPlusFaqsSection";
import NadPlusGetStartedCtaSection from "@/components/NAD+/NadPlusGetStartedCtaSection";
import NadPlusBenefitsSection from "@/components/NAD+/NadPlusBenefitsSection";
import NadPlusHungerSignalsSection from "@/components/NAD+/NadPlusHungerSignalsSection";
import NadPlusInStockMedicationsSection from "@/components/NAD+/NadPlusInStockMedicationsSection";
import NadPlusMedicationTimelineSection from "@/components/NAD+/NadPlusMedicationTimelineSection";
import NadPlusHowItWorksSection from "@/components/NAD+/NadPlusHowItWorksSection";
import NadPlusComparisonTableSection from "@/components/NAD+/NadPlusComparisonTableSection";
import NadPlusTestimonialsCarouselBlock from "@/components/NAD+/NadPlusTestimonialsCarouselBlock";
import ReviewsSection from "@/components/ReviewsSection";
import NadPlusRockyInTheNews from "@/components/NAD+/NadPlusRockyInTheNews";
import Section from "@/components/utils/Section";
import NadPlusPageLoader from "@/components/NAD+/NadPlusPageLoader";

export const metadata = {
  title: "NAD+ | MyRocky",
  description:
    "NAD+ therapy for cellular energy and healthy aging. Personalized care and support from licensed clinicians.",
};

export default function DirectMedsNadPlusPage() {
  return (
    <NadPlusPageLoader>
      <main>
        <NadPlusHero />
        <NadPlusRockyInTheNews />
        <NadPlusBenefitsSection />
        <NadPlusHungerSignalsSection />
        <NadPlusTestimonialsCarouselBlock />
        <NadPlusMedicationTimelineSection />
        <NadPlusHowItWorksSection />
        <NadPlusComparisonTableSection />
        <Section bg="bg-[#F5F4EF] sm:!px-5 !px-0 ">
          <NadPlusInStockMedicationsSection />
        </Section>
        <Section bg="bg-[#F5F4EF]">
          <NadPlusFaqsSection />
        </Section>
        <NadPlusGetStartedCtaSection />
      </main>
    </NadPlusPageLoader>
  );
}
