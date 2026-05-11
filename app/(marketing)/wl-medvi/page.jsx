import MedViPromoBanner from "@/components/MedViLanding/MedViPromoBanner";
import MedViNav from "@/components/MedViLanding/MedViNav";
import MedViHero from "@/components/MedViLanding/MedViHero";
import MedViProductTiers from "@/components/MedViLanding/MedViProductTiers";
import MedViTestimonialsShowcase from "@/components/MedViLanding/MedViTestimonialsShowcase";
import MedViWeightCalculator from "@/components/MedViLanding/MedViWeightCalculator";
import MedViChangePhotoGrid from "@/components/MedViLanding/MedViChangePhotoGrid";
import MedViChangeStatsRow from "@/components/MedViLanding/MedViChangeStatsRow";
import MedViMetabolismSection from "@/components/MedViLanding/MedViMetabolismSection";
import MedViWhyItWorks from "@/components/MedViLanding/MedViWhyItWorks";
import MedViThreeStepProcess from "@/components/MedViLanding/MedViThreeStepProcess";
import MedViSupportSection from "@/components/MedViLanding/MedViSupportSection";
import MedViExtendedTestimonials from "@/components/MedViLanding/MedViExtendedTestimonials";
import MedViFaqsSection from "@/components/MedViLanding/MedViFaqsSection";
import MedViMoneyBackCTA from "@/components/MedViLanding/MedViMoneyBackCTA";
import MedViGoalSelector from "@/components/MedViLanding/MedViGoalSelector";
import MedViTrustBadgesRow from "@/components/MedViLanding/MedViTrustBadgesRow";
import RockyInTheNews from "@/components/MedViLanding/RockyInTheNews";
import Footer from "@/components/Footer/Footer";
import Section from "@/components/utils/Section";

export const dynamic = "force-dynamic";

export const metadata = {
    title: "Weight Loss Program | MyRocky",
    description:
        "Personalized GLP-1 weight loss care. Start for $149, free shipping, HSA/FSA eligible.",
};

export default function WlMedViPage() {
    const ctaHref = "/wl-pre-consultation";

    return (
        <>
            <MedViPromoBanner />
            <MedViNav ctaHref={ctaHref} />
            <main className="min-h-screen ">
                <MedViHero ctaHref={ctaHref} />
            </main>

            <RockyInTheNews />

            <Section bg="bg-white pt-10 md:pt-12">
                <MedViProductTiers ctaHref={ctaHref} />
            </Section>

            <Section bg="bg-white !py-0 md:!py-0">
                <MedViTestimonialsShowcase />
            </Section>

            <Section bg="bg-white">
                <MedViWeightCalculator ctaHref={ctaHref} />
            </Section>

            <Section bg="bg-white !px-0">
                <MedViChangePhotoGrid />
                <MedViChangeStatsRow />
            </Section>

            <Section bg="bg-white !py-0 md:!py-0">
                <MedViMetabolismSection ctaHref={ctaHref} />
            </Section>

            <Section>
                <MedViWhyItWorks />
            </Section>

            <Section bg="bg-white">
                <MedViThreeStepProcess ctaHref={ctaHref} />
            </Section>

            <Section bg="bg-white ">
                <MedViSupportSection />
            </Section>

            <Section bg="bg-white">
                <MedViExtendedTestimonials ctaHref={ctaHref} />
            </Section>

            <Section>
                <MedViFaqsSection />
            </Section>

            <MedViMoneyBackCTA ctaHref={ctaHref} />

            <Section bg="bg-white">
                <MedViGoalSelector ctaHref={ctaHref} />
            </Section>

            <MedViTrustBadgesRow className="mt-10 md:mt-12 lg:mt-14" />

            <Footer />
        </>
    );
}
