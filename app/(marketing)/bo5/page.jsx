import MarketingHeroSection from "@/components/Bo5/MarketingHeroSection";
import MinimalHeader from "@/components/Bo4/MinimalHeader";
import TreatmentPlans from "@/components/Bo4/TreatmentPlans";

import Trustpilot from "@/components/Navbar/Trustpilot";
import Section from "@/components/utils/Section";

import MemberResults from "@/components/WlOffer/MemberResults";

import WlFaqs from "@/components/Bo4/WlFaqs";
import AsSeenOn from "@/components/Bo4/AsSeenOn";
import ComparingTable from "@/components/Bo5/ComparingTable";

export default function BO5() {
  const consultationHref = "/wl-pre-consultation/";

  return (
    <>
      <Trustpilot />
      <MinimalHeader />
      <Section bg={`py-4 pb-[40px]`}>
        <MarketingHeroSection />

        <div className="block md:hidden">
          <br /> <br />
          <AsSeenOn removeTitle={false} mobileSlider={true} gray={true} />
        </div>
      </Section>

      <TreatmentPlans bg={`bg-[#F0EEEA]`} />
      <section className=" py-14 md:py-24 w-full overflow-hidden">
        <MemberResults consultationHref={consultationHref} />
      </section>

      <Section bg={`bg-[#F8F7F3]`}>
        <ComparingTable
        section_bg={`bg-[#F8F7F3]`}
        title={`The Rocky Difference`}
        desc={`Comprehensive care. Consistent results.See how Rocky compares.`}
        sec_title={`Others`}
        img={`https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp`}
        unique_col_bg={`white`}
        third_title={`Others`}
        f_col={[
          "Personalized treatment plans",
          "Regular check-ins with adjustments",
          "Lifestyle advice",
          "Diet information",
          "Improved microbiome",
          "Program costs",
          "Money-back Guarantee"
        ]}

        sec_col={[
          "Backed by lab data",
          "Pre-scheduled & on-demand",
          "Evidence-backed",
          "Personalized",
          "Backed by lab data",
          "$99/month",
          "6 months (See terms)"
        ]}

        third_col={[
          "Dosage only",
          "When issues arise",
          "Prescriptions only",
          "Either none or only",
          "None at all",
          "> $200/month",
          "None"
        ]}
      />
      </Section>

      <Section bg={`bg-[#F0EEEA]`}>
        <WlFaqs moreQTitle="Convenient, researched, trusted." />
      </Section>
    </>
  );
}
