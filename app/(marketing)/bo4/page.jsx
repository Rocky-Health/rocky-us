"use client";
import Comprehensive from "@/components/Bo4/Comprehensive";
import MarketingHeroSection from "@/components/Bo4/MarketingHeroSection";
import MinimalHeader from "@/components/Bo4/MinimalHeader";
import TreatmentPlans from "@/components/Bo4/TreatmentPlans";
import Trustpilot from "@/components/Navbar/Trustpilot";
import Section from "@/components/utils/Section";

import ExclusiveFeatures from "@/components/Bo4/ExclusiveFeatures";
import HowItWorks from "@/components/Bo4/HowItWorks";

import MoneyBack from "@/components/WlOffer/MoneyBack";
import UnmatchedResults from "@/components/WlOffer/UnmatchedResults";
import AsSeenOn from "@/components/Bo4/AsSeenOn";
import DifferentThisTime from "@/components/Bo4/DifferentThisTime";
import WlFaqs from "@/components/Bo4/WlFaqs";
import Footer from "@/components/Bo4/Footer";
import ChangingResults from "@/components/Bo4/ChangingResults";

export default function Bo4() {
    const consultationHref = "/glp2-pre-consultation";

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
        /* MyRocky navigation header */
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
            </Section>
            <section className="bg-[#F0EEEA] py-14 md:py-24 w-full overflow-hidden">
                <ChangingResults href={consultationHref} />
            </section>
            <TreatmentPlans />

            <Comprehensive />

            <Section>
                <ExclusiveFeatures consultationHref={consultationHref} />
            </Section>

            <Section>
                <HowItWorks consultationHref={consultationHref} />
            </Section>
            <hr className="max-w-[1200px] mx-auto px-5 md:px-0" />
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
                <DifferentThisTime href={consultationHref} />
            </Section>

            <Section bg={`bg-[#F0EEEA]`}>
                <WlFaqs
                    moreQTitle="Convenient, researched, trusted."
                    href={consultationHref}
                />
            </Section>

            <Footer />
        </main>
    );
}
