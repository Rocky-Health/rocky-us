import ChangingResults from "@/components/Bo4/ChangingResults";
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
      <Section>
        <MarketingHeroSection />
      </Section>
      <ChangingResults />
      <TreatmentPlans />
    </>
  );
}
