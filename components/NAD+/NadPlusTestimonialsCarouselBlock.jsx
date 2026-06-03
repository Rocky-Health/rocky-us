import NadPlusVimeoCarousel from "./NadPlusVimeoCarousel";
import NadPlusFeaturesCtaBlock from "./NadPlusFeaturesCtaBlock";

export default function NadPlusTestimonialsCarouselBlock() {
    return (
        <div className="relative w-full bg-[#F5F4EF] px-4 pb-10 pt-0 md:pb-14">
            <NadPlusVimeoCarousel />

            <NadPlusFeaturesCtaBlock
                hideFeatures={true}
                title="Ready to start your journey?"
                getStartedText="Let's Go!"
            />
        </div>
    );
}
