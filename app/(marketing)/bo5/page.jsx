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
  const products = [
    {
      label: "MOST POPULAR",
      activeIngeredient: "(GLP-1)",
      name: "Semaglutide",
      hasSale: true,
      price: "150",
      oldPrice: "279",
      description:
        "Same active ingredient as Ozempic. The popular and affordable alternative.",
      WLPrograme: true,
      image: "/bo4/semaglutide.png",
      features: [
        "Prescriptions (if eligible)",
        "Clinically proven standard of care",
        "Provider Check-ins & Unlimited Support",
        "Lifestyle, Nutrition & Mental Coaching",
        "Exclusive tools to help your journey",
      ],
    },

    {
      label: "BEST RESULTS",
      activeIngeredient: "(GLP-1/GIP)",
      name: "Tirzepatide",
      hasSale: true,
      price: "240",
      oldPrice: "389",
      description:
        "Dual-action mechanism with the highest rated clinical weight loss.",
      WLPrograme: true,
      image: "/bo4/tirzepatide.png",
      features: [
        "Targets 2 hunger pathways (GLP-1 & GIP)",
        "Less side effects",
        "Faster results",
      ],
      UpperBtnLabel: "#1 RATED FOR RESULTS",
    },

    {
      activeIngeredient: "(GLP-1)",
      name: "Ozempic®",
      hasSale: false,
      price: "1409",
      description: "Name Brand Semaglutide Injection",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Ozempic.jpg",
      features: ["Same active ingredient as Wegovy", "Strong appetite control"],
    },

    {
      activeIngeredient: "(GLP-1/GIP)",
      name: "Mounjaro®",
      hasSale: false,
      price: "1509",
      description: "Name Brand Tirzepatide Injection",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Mounjaro.jpg",
      features: [
        "Dual-hormone mechanism for enhanced results",
        "Enhanced results vs other injectables",
      ],
    },

    {
      activeIngeredient: "(GLP-1)",
      name: "Wegovy®",
      hasSale: false,
      price: "1869",
      description: "Name Brand Semaglutide Injection",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Wegovy.jpg",
      features: [
        "Same active ingredient as Ozempic",
        "Strong appetite control",
      ],
    },

    {
      activeIngeredient: "(GLP-1)",
      name: "Rybelsus®",
      hasSale: false,
      price: "1409",
      description: "Name Brand Oral Semaglutide Pill",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Rybelsus.jpg",
      features: [
        "Mild weight loss effect compared to injectables",
        "Best suited for patients who are needle-averse",
      ],
    },
  ];

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

      <TreatmentPlans productList={products} bg={`bg-[#F0EEEA]`} />
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
            "Money-back Guarantee",
          ]}
          sec_col={[
            "Backed by lab data",
            "Pre-scheduled & on-demand",
            "Evidence-backed",
            "Personalized",
            "Backed by lab data",
            "$99/month",
            "6 months <u>(See terms)</u>",
          ]}
          third_col={[
            "Dosage only",
            "When issues arise",
            "Prescriptions only",
            "Either none or only",
            "None at all",
            "> $200/month",
            "None",
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
