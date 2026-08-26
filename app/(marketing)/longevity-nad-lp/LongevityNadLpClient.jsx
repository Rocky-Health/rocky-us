"use client";

import LongevityNadDeclineSection from "@/components/LongevityNadPlus/LongevityNadDeclineSection";
import LongevityNadPlusProtocolSection from "@/components/LongevityNadPlus/LongevityNadPlusProtocolSection";
import LongevityNadPlusResultsSection from "@/components/LongevityNadPlus/LongevityNadPlusResultsSection";
import LongevityNadPlusExpertPricingSection from "@/components/LongevityNadPlus/LongevityNadPlusExpertPricingSection";
import LongevityNadPlusHeroSection from "@/components/LongevityNadPlus/LongevityNadPlusHeroSection";
import LongevityNadPlusProductSection from "@/components/LongevityNadPlus/LongevityNadPlusProductSection";
import LongevityNadPlusTrustBar from "@/components/LongevityNadPlus/LongevityNadPlusTrustBar";
import LongevityNadPressLogos from "@/components/LongevityNadPlus/LongevityNadPressLogos";
import HomeReviewsSection from "@/components/home/ReviewsSection";
import LongevityNadExpertsSection from "@/components/LongevityNadPlus/LongevityNadExpertsSection";
import LongevityNadWhatToExpectSection from "@/components/LongevityNadPlus/LongevityNadWhatToExpectSection";
import LongevityNadPlusBottomCtaSection from "@/components/LongevityNadPlus/LongevityNadPlusBottomCtaSection";
import LongevityNadPlusFaqsSection from "@/components/LongevityNadPlus/LongevityNadPlusFaqsSection";
import LongevityNadPlusHowRockyWorks from "@/components/LongevityNadPlus/LongevityNadPlusHowRockyWorks";
import LongevityNadPlusStickyCta from "@/components/LongevityNadPlus/LongevityNadPlusStickyCta";
import LongevityNadChatWidgetMobileFix from "@/components/LongevityNadPlus/LongevityNadChatWidgetMobileFix";
import { nadPlusFaqsV2 } from "@/components/LongevityNadPlus/data/longevityNadPlusData";
import { useNadCheckout } from "@/components/LongevityNadPlus/useNadCheckout";

// Shared id between the hero's primary CTA and the sticky bar so the sticky
// bar only reveals once the hero button has scrolled out of view (mobile).
const HERO_CTA_ID = "nad-lp-hero-cta";

const NAD_BENEFIT_ITEMS = [
    { label: "Energy levels", direction: "up" },
    { label: "Mental clarity", direction: "up" },
    { label: "Mood", direction: "up" },
    { label: "Sleep quality", direction: "up" },
    { label: "Recovery", direction: "up" },
    { label: "Cellular health", direction: "up" },
    { label: "At-home convenience", direction: "up" },
];

const LONGEVITY_NAD_PLUS_TRUST_ITEMS = [
    {
        label: "Licensed US Pharmacy",
        icon: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/icon-4.png",
    },
    {
        label: "Trusted by 350K+ patients",
        icon: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/icon-1.png",
    },
    {
        label: "Licensed US Clinicians",
        icon: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/icon-2.png",
    },
    {
        label: "Free Discreet Delivery",
        icon: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/icon-3.png",
    },
];

export default function LongevityNadLpClient() {
    const { goToCheckout, isAdding } = useNadCheckout();

    return (
        <main className="pb-0 md:pb-0  te-color longevity-fonts">
            <LongevityNadPlusHeroSection
                showReviews={true}
                reviewCount="1,500+"
                reviewRating="4.4"
                headingBefore=""
                headingAccent="NAD+ Therapy"
                headingAfter="for Healthy Aging"
                priceLine="Only $199 for a month supply"
                description="Boost your NAD+ levels without costly infusions, all from the comfort of home. Get a full month's supply with unlimited support from longevity experts."
                showSecondaryBtn={false}
                primaryBtnText="Get Started WITH NAD+"
                image="/NAD+/redesign/hero-couple.webp"
                imageAlt="Two people bumping fists after a workout"
                primaryBtnId={HERO_CTA_ID}
                onPrimaryClick={goToCheckout}
                isPrimaryLoading={isAdding}
            />

            <LongevityNadPlusTrustBar
                items={LONGEVITY_NAD_PLUS_TRUST_ITEMS}
                stopOnLargeScreens={true}
            />

            <LongevityNadDeclineSection
                label="NAD+: THE FUEL YOUR CELLS NEED"
                heading="NAD+ levels naturally decline with age."
                paragraphs={[
                    "NAD+ (Nicotinamide Adenine Dinucleotide) is a molecule your body naturally produces and uses to support cellular energy and function. As we get older, our NAD+ levels tend to decline.",
                    "It's one reason NAD+ has become an area of growing interest in longevity and healthy aging research.",
                    "NAD+ injections offer a direct way to supplement your body's natural NAD+ levels as part of a proactive approach to your health.",
                ]}
                chartTreatmentLabel="Stabilized NAD with treatment"
                chartNaturalLabel="Natural NAD decline with age"
                ctaText="Get Started WITH NAD+"
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusProtocolSection
                headline="Official partner of the world's best athletes"
            />

            <LongevityNadPlusResultsSection />

            <LongevityNadPlusExpertPricingSection
                description="In-clinic NAD+ sessions often run $600+ each, with consultations and follow-ups billed separately. Our at-home NAD+ therapy is $199 a month for a full month supply, with everything included: clinician oversight, a protocol built on clinical evidence, and discreet delivery to your door."
                benefitItems={NAD_BENEFIT_ITEMS}
                ctaText="Get Started WITH NAD+"
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusProductSection
                bg="bg-[#FAFAFA]"
                name="NAD+ Therapy"
                pricePrefix="Only"
                price="$199"
                priceAfter="/ month"
                description="A simple way to support cellular energy and healthy aging pathways, energy production, and overall wellness, all at the convenience of your home."
                checkPointsPosition="after"
                ctaText="Get Started WITH NAD+"
                btnClassName="!md:w-fit !px-16 uppercase !text-sm !font-[500] !tracking-wide"
                checkPointsHeading="What's included"
                checkPoints={[
                    "Free, discreet shipping",
                    "Licensed clinician oversight",
                    "Unlimited messaging support",
                    "No hidden fees",
                ]}
                banner="Same-day NAD+ prescriptions  •  Free assessment"
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPressLogos />

            <HomeReviewsSection />

            <LongevityNadWhatToExpectSection
                label="NAD+ THERAPY"
                ctaText="See if NAD+ is right for you"
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusHowRockyWorks
                title="How MyRocky NAD+ therapy works"
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadExpertsSection />

            <LongevityNadPlusFaqsSection
                faqs={nadPlusFaqsV2}
                subtitle="Everything you need to know about NAD, NAD+ and its benefits."
                ctaText="Find my treatment"
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusBottomCtaSection
                heading="Get the NAD+ your cells need to thrive."
                subtext="NAD+ injections are now available. Get your free consultation. No commitment required."
                ctaText="Start Your Free Assessment"
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusStickyCta
                text="Get Started"
                revealAfterId={HERO_CTA_ID}
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadChatWidgetMobileFix />
        </main>
    );
}
