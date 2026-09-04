"use client";

import LongevityNadDeclineSection from "@/components/LongevityNadPlus/LongevityNadDeclineSection";
import LongevityNadPlusProtocolSection from "@/components/LongevityNadPlus/LongevityNadPlusProtocolSection";
import LongevityNadPlusResultsSection from "@/components/LongevityNadPlus/LongevityNadPlusResultsSection";
import LongevityNadPlusExpertPricingSection from "@/components/LongevityNadPlus/LongevityNadPlusExpertPricingSection";
import LongevityNadPlusHeroSection from "@/components/LongevityNadPlus/LongevityNadPlusHeroSection";
import LongevityNadPlusProductSection from "@/components/LongevityNadPlus/LongevityNadPlusProductSection";
import LongevityNadPlusTrustBar from "@/components/LongevityNadPlus/LongevityNadPlusTrustBar";
import LongevityNadWhatToExpectSection from "@/components/LongevityNadPlus/LongevityNadWhatToExpectSection";
import LongevityNadPlusBottomCtaSection from "@/components/LongevityNadPlus/LongevityNadPlusBottomCtaSection";
import LongevityNadPlusFaqsSection from "@/components/LongevityNadPlus/LongevityNadPlusFaqsSection";
import LongevityNadPlusHowRockyWorks from "@/components/LongevityNadPlus/LongevityNadPlusHowRockyWorks";
import LongevityNadPlusStickyCta from "@/components/LongevityNadPlus/LongevityNadPlusStickyCta";
import LongevityNadChatWidgetMobileFix from "@/components/LongevityNadPlus/LongevityNadChatWidgetMobileFix";
import { nadPlusFaqsV2 } from "@/components/LongevityNadPlus/data/longevityNadPlusData";
import { useNadCheckout } from "@/components/LongevityNadPlus/useNadCheckout";

// Green sourced from the shared Cross-Sell "Added to cart" pill
// (components/shared/CrossSellAddons.jsx -> bg-[#0D652D]). `!` important so it
// wins over each section's default bg-black / hover:bg-gray-800.
const CTA_GREEN = "!bg-[#0D652D] hover:!bg-[#0D652D]";
// Decline CTA is a white button on a dark photo, so force white text too.
const CTA_GREEN_ON_DARK = "!bg-[#0D652D] !text-white hover:!bg-[#0D652D]";
const CTA_GREEN_BAR = "!bg-[#0D652D]";

// Shared id between the hero's primary CTA and the sticky bar so the sticky
// bar only reveals once the hero button has scrolled out of view (mobile).
const HERO_CTA_ID = "nad-lp-hero-cta";

const LONGEVITY_NAD_PLUS_TRUST_ITEMS = [
    {
        label: "Certified Pharmacy",
        icon: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/icon-4.png",
    },
    {
        label: "Trusted by 350K+ patients",
        icon: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/icon-1.png",
    },
    {
        label: "Licensed Clinicians",
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
                headingAccent="NAD+ Injection"
                headingAfter="for Healthy Aging"
                priceLine="Only $199 a month"
                description="Boost your NAD+ levels without costly infusions, all from the comfort of home. With unlimited support from longevity experts."
                showSecondaryBtn={false}
                primaryBtnText="Add to Cart"
                primaryBtnClassName={CTA_GREEN}
                image="/NAD+/hero-nad.png"
                primaryBtnId={HERO_CTA_ID}
                onPrimaryClick={goToCheckout}
                isPrimaryLoading={isAdding}
            />

            <LongevityNadPlusTrustBar
                items={LONGEVITY_NAD_PLUS_TRUST_ITEMS}
                stopOnLargeScreens={true}
            />

            <LongevityNadDeclineSection
                ctaText="Add to Cart"
                ctaClassName={CTA_GREEN_ON_DARK}
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusProtocolSection alwaysShowLogosInBig />

            <LongevityNadPlusResultsSection />

            <LongevityNadPlusExpertPricingSection
                ctaText="Add to Cart"
                ctaClassName={CTA_GREEN}
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusProductSection
                bg="bg-[#FAFAFA]"
                name="NAD+ Injections"
                pricePrefix="Only"
                price="$199"
                priceAfter="a month"
                description="A simple way to support cellular health, energy production, and overall wellness, all from the comfort of home."
                checkPointsPosition="after"
                ctaText="Add to Cart"
                btnClassName="!md:w-fit !px-16 uppercase !text-sm !font-[500] !tracking-wide !bg-[#0D652D] hover:!bg-[#0D652D]"
                checkPointsHeading="What's included"
                checkPoints={[
                    "Free, discreet shipping",
                    "Licensed clinician oversight",
                    "Unlimited messaging support",
                    "No hidden fees",
                ]}
                banner="Same-day prescriptions  •  Free assessment"
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadWhatToExpectSection
                ctaText="Add to Cart"
                btnClassName={CTA_GREEN}
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusHowRockyWorks
                ctaText="Add to Cart"
                ctaClassName={CTA_GREEN}
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusFaqsSection
                faqs={nadPlusFaqsV2}
                ctaText="Add to Cart"
                ctaClassName={CTA_GREEN}
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusBottomCtaSection
                ctaText="Add to Cart"
                ctaClassName={CTA_GREEN_ON_DARK}
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadPlusStickyCta
                text="Add to Cart"
                barClassName={CTA_GREEN_BAR}
                revealAfterId={HERO_CTA_ID}
                onCtaClick={goToCheckout}
                isCtaLoading={isAdding}
            />

            <LongevityNadChatWidgetMobileFix />
        </main>
    );
}
