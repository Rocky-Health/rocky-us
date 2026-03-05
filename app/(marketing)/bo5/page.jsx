"use client";

import MarketingHeroSection from "@/components/Bo5/MarketingHeroSection";
import MinimalHeader from "@/components/Bo4/MinimalHeader";
import TreatmentPlans from "@/components/Bo4/TreatmentPlans";

import Trustpilot from "@/components/Navbar/Trustpilot";
import Section from "@/components/utils/Section";

import MemberResults from "@/components/WlOffer/MemberResults";

import WlFaqs from "@/components/Bo4/WlFaqs";
import AsSeenOn from "@/components/Bo4/AsSeenOn";
import ComparingTable from "@/components/Bo5/ComparingTable";
import StartYourJourney from "@/components/Bo5/StartYourJourney";
import Footer from "@/components/Bo4/Footer";
import ChangingResults from "@/components/Bo4/ChangingResults";

export default function BO5() {
  const consultationHref = "/wl-pre-consultation/";

  return (
    <main>
    <style jsx global>{`
        /* Hide ALL headers by default */
        header,
        nav,
        .header,
        .navbar,
        /* Main navigation */
        #site-header, 
        .main-header, 
        .default-navbar,
        #main-menu,
        #off-canvas-menu,
        .site-navigation,
        #masthead,
        /* Hide menu navigation */
        div:has(a[href*="Sexual Health"]),
        div:has(a[href*="Hair Loss"]),
        div:has(a[href*="Body Optimization"]),
       
        /* Toronto Maple Leafs header */
        div:has(> span:contains("Toronto Maple Leafs")),
        div:has(> span:contains("Proud partner")),
        div[class*="bg-[#003876]"],
        /* Rocky navigation header */
        .rocky-header,
        .rocky-navbar,
        .rocky-navigation,
        div:has(> img[alt="rocky"]),
        div:has(> a:contains("Sexual Health")),
        div:has(> a:contains("Hair Loss")),
        div:has(> a:contains("Body Optimization")),
        div:has(> a:contains("Mental Health")),
        div:has(> a:contains("Recovery")),
        div:has(> a:contains("Smoking Cessation")),
        /* Footer selectors */
        footer:not(.questionnaire-footer),
        footer.bg-black,
        footer[className*="bg-black"],
        .bg-white.flex.justify-between.items-center.p-4,
        #site-footer,
        .site-footer,
        .main-footer,
        .footer-widgets,
        .footer-bottom,
        #colophon,
        .footer-area,
        .footer-container {
          display: none !important;
        }

        
        body {
          padding-top: 0 !important;
          margin-top: 0 !important;
          padding-bottom: 0 !important;
          margin-bottom: 0 !important;
        }

       
      `}</style>

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
        <ChangingResults btnTxt={`Claim my discount`} />
      </section>

      <Section bg={`bg-[#F8F7F3]`}>
        <ComparingTable
        section_bg={`bg-[#F8F7F3]`}
        title={`The <span class='text-[#AE7E56]'>Rocky</span> Difference`}
        desc={`Comprehensive care. Consistent results. See how Rocky compares.`}
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
          "6 months <u>(See terms)</u>"
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

      <Section>
        <StartYourJourney />
      </Section>

        <Section bg={`bg-[#F0EEEA]`}>
        <WlFaqs moreQTitle="Convenient, researched, trusted." />
      </Section>

      <Footer />
    </main>
  );
}
