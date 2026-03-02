import FaqsSection from "@/components/FaqsSection";
import HowRockyWorks from "@/components/HowRockyWorks";
import ReviewsSection from "@/components/ReviewsSection";
import Section from "@/components/utils/Section";
import WlHeroSection from "@/components/WL/WlHeroSection";
import WLProgram from "@/components/WL/WLProgram";
import { WlFaqs } from "@/components/PreLanders/data/WlFaqs";

export default function WlPrelander3() {
    return (
        <main>
            <WlHeroSection
                h1="End your weight"
                h2=" war forever"
                p="With doctor-led personalized weight loss programs, trusted by 350K+ Customers."
                href="/body-optimization"
                btnText="Get Started →"
            ></WlHeroSection>

            <Section>
                <HowRockyWorks></HowRockyWorks>
            </Section>
            <Section bg={"bg-[#F5F4EF]"}>
                <ReviewsSection />
            </Section>

            <Section>
                <FaqsSection
                    faqs={WlFaqs}
                    title="Your Questions, Answered"
                    name="Meet MyRocky"
                    subtitle="Frequently asked questions"
                />
            </Section>
        </main>
    );
}
