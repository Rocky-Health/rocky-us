import Image from "next/image";
import DmOffersVimeoCarousel from "./DmOffersVimeoCarousel";
import DmOffersFeaturesCtaBlock from "./DmOffersFeaturesCtaBlock";

export default function DmOffersTestimonialsCarouselBlock() {
    return (
        <div className="relative w-full bg-[#FAF3EF] px-4 pb-10 md:pb-14">
            <DmOffersVimeoCarousel />

            <DmOffersFeaturesCtaBlock
                hideFeatures={true}
                title="Ready to lose 15% of your body weight?"
                getStartedText="Let's Go!"
            />
        </div>
    );
}
