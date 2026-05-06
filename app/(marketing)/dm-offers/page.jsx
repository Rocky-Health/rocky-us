import DmSpringPromoHeader from "@/components/DmOffers/DmSpringPromoHeader";
import DmOffersHero from "@/components/DmOffers/DmOffersHero";
import DmOffersGoalSection from "@/components/DmOffers/DmOffersGoalSection";
import Footer from "@/components/Footer/Footer";
import DmOffersNav from "@/components/DmOffers/DmOffersNav";
import RockyInTheNews from "@/components/RockyInTheNews";

export const metadata = {
    title: "Spring Offers | Rocky",
    description:
        "Spring savings on GLP-1 weight loss plans. Personalized care, GLP-1 medications, and support from licensed clinicians.",
};

export default function DmOffersPage() {
    return (
        <main>
            <DmSpringPromoHeader />
            <DmOffersNav />
            <DmOffersHero />
            <RockyInTheNews />
            <DmOffersGoalSection />

            <Footer />
        </main>
    );
}
