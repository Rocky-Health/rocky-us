import ChangingResults from "@/components/Bo4/ChangingResults";
import Comprehensive from "@/components/Bo4/Comprehensive";
import MarketingHeroSection from "@/components/Bo4/MarketingHeroSection";
import MinimalHeader from "@/components/Bo4/MinimalHeader";
import TreatmentPlans from "@/components/Bo4/TreatmentPlans";
import Trustpilot from "@/components/Navbar/Trustpilot";
import Section from "@/components/utils/Section";

export default function Bo4() {
  return (
    <>
      <Trustpilot />
      <MinimalHeader />
      <Section bg={`py-4 pb-[40px]`}>
        <MarketingHeroSection />
      </Section>
      <ChangingResults />
      <TreatmentPlans />
      <Comprehensive />
    </>
  );
}
