
import Comprehensive from "@/components/Bo4/Comprehensive";
import MarketingHeroSection from "@/components/Bo4/MarketingHeroSection";
import MinimalHeader from "@/components/Bo4/MinimalHeader";
import TreatmentPlans from "@/components/Bo4/TreatmentPlans";
import WlFaqsSection from "@/components/BodyOptimization/WlFaqsSection";
import Trustpilot from "@/components/Navbar/Trustpilot";
import Section from "@/components/utils/Section";

import ExclusiveFeatures from "@/components/Bo4/ExclusiveFeatures";
import HowItWorks from "@/components/BO4/HowItWorks";
import MemberResults from "@/components/WlOffer/MemberResults";
import MoneyBack from "@/components/WlOffer/MoneyBack";
import UnmatchedResults from "@/components/WlOffer/UnmatchedResults";
import AsSeenOn from "@/components/Bo4/AsSeenOn";
import DifferentThisTime from "@/components/Bo4/DifferentThisTime";
import WlFaqs from "@/components/Bo4/WlFaqs";

export default function Bo4() {
    const consultationHref = "/wl-pre-consultation/";

  return (
    <>
      <Trustpilot />
      <MinimalHeader />
      <Section bg={`py-4 pb-[40px]`}>
        <MarketingHeroSection />
      </Section>
      <section className="bg-[#F0EEEA] py-14 md:py-24 w-full overflow-hidden">
        <MemberResults consultationHref={consultationHref} />
      </section>
      <TreatmentPlans />

      <Comprehensive />
      
       <Section >
        <ExclusiveFeatures consultationHref={consultationHref} />
      </Section>

      <Section>
        <HowItWorks consultationHref={consultationHref} />
      </Section>

      <Section>
          <MoneyBack />
      </Section>


      <Section bg={`bg-[#F8F7F3]`}>
        <UnmatchedResults consultationHref={consultationHref} />
      </Section>

      <Section>
        <AsSeenOn />
      </Section>


    <Section>
      <DifferentThisTime  />
    </Section>


      <Section bg={`bg-[#F0EEEA]`}>
        <WlFaqs moreQTitle="Convenient, researched, trusted." />
      </Section>
    
    </>
  );
}
