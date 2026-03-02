import FaqsSection from "@/components/FaqsSection";
import HowRockyWorks from "@/components/HowRockyWorks";
import EdHeroSection from "@/components/PreLanders/HeroSection";
import ReviewsSection from "@/components/ReviewsSection";
import Section from "@/components/utils/Section";
import { SexualHealthFaqs } from "@/components/PreLanders/data/SexualHealthFaqs";
import HeaderProudPartner from "@/components/Navbar/HeaderProudPartner";

export default function edPrelander() {
    return (
        <main>
            <HeaderProudPartner />
            <EdHeroSection
                desktopBgImage="/ed-prelander-5/prelander-background.png"
                mobileBgImage="/ed-prelander-5/ed.png"
                title="Not Feeling as Hard? Let MyRocky Help."
                subTitle="Digital Healthcare without the wait time or stigma. Trusted by 350,000+ men."
                btnText="Get Started →"
                quizHref="/ed-flow"
            />
            <Section bg={"bg-[#FFFFFF]"}>
                <HowRockyWorks />
            </Section>
            <Section bg={"bg-[#F5F4EF]"}>
                <ReviewsSection />
            </Section>
            <Section>
                <FaqsSection
                    faqs={SexualHealthFaqs}
                    title="Your Questions, Answered"
                    name="Meet MyRocky"
                    subtitle="Frequently asked questions"
                />
            </Section>
        </main>
    );
}
