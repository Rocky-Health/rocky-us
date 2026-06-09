import DmSpringPromoHeader from "@/components/DmOffers/DmSpringPromoHeader";
import DmOffersHero from "@/components/DmOffers/DmOffersHero";
import DmOffersFaqsSection from "@/components/DmOffers/DmOffersFaqsSection";
import DmOffersGetStartedCtaSection from "@/components/DmOffers/DmOffersGetStartedCtaSection";
import DmOffersGoalSection from "@/components/DmOffers/DmOffersGoalSection";
import DmOffersHungerSignalsSection from "@/components/DmOffers/DmOffersHungerSignalsSection";
import DmOffersInStockMedicationsSection from "@/components/DmOffers/DmOffersInStockMedicationsSection";
import DmOffersMedicationTimelineSection from "@/components/DmOffers/DmOffersMedicationTimelineSection";
import DmOffersTestimonialsCarouselBlock from "@/components/DmOffers/DmOffersTestimonialsCarouselBlock";
import Footer from "@/components/Footer/Footer";
import DmOffersNav from "@/components/DmOffers/DmOffersNav";
import ReviewsSection from "@/components/ReviewsSection";
import DmOffersRockyInTheNews from "@/components/DmOffers/DmOffersRockyInTheNews";
import Section from "@/components/utils/Section";
import DmOffersPageLoader from "@/components/DmOffers/DmOffersPageLoader";
import EverFlowScript from "@/components/EverFlow/EverFlowScript";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Spring Offers",
  description:
    "Spring savings on GLP-1 weight loss plans. Personalized care, GLP-1 medications, and support from licensed clinicians.",
  vertical: "wl",
  noindex: true,
});

export default function DmOffersPage() {
    return (
        <DmOffersPageLoader>
            <main>
                <EverFlowScript
                    mode="click"
                    offerId={5096}
                    network="vyrov30g"
                />
                {/* <DmSpringPromoHeader />
            <DmOffersNav /> */}
                <DmOffersHero />
                <DmOffersRockyInTheNews />
                <DmOffersGoalSection />
                <DmOffersHungerSignalsSection />
                <DmOffersTestimonialsCarouselBlock />
                <DmOffersMedicationTimelineSection />
                <Section bg="bg-[#FAF3EF] !mb-0">
                    <ReviewsSection subheading="Over 350,000 customers. Here's what they're saying about their weight loss with MyRocky." />
                </Section>
                <Section bg="bg-gray-100 sm:!px-5 !px-0 ">
                    <DmOffersInStockMedicationsSection />
                </Section>
                <Section bg="bg-white">
                    <DmOffersFaqsSection />
                </Section>
                <DmOffersGetStartedCtaSection />

                {/* <Footer /> */}
            </main>
        </DmOffersPageLoader>
    );
}
