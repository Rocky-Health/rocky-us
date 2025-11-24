import FaqsSection from "@/components/FaqsSection";
import HowRockyWorks from "@/components/HowRockyWorks";
import EdHeroSection from "@/components/PreLanders/HeroSection";
import ReviewsSection from "@/components/ReviewsSection";
import Section from "@/components/utils/Section";

const faqs = [
    {
        question: "What is Rocky?",
        answer: "Rocky is a 100% online platform with a focus to normalize men's health and eliminate the stigma surrounding it. At Rocky, we make it easy for patients to connect to licensed healthcare professionals. We specialize in medical conditions commonly experienced by men including Erectile Dysfunction and Hair Loss. We've built a simple & convenient online process which helps you connect to healthcare professionals in order to get customized treatment plans, shipped right to your door.",
    },
    {
        question: "How does Rocky work?",
        answer: "Rocky offers prescription and over-the-counter products. For prescription medication, you will need to complete an online medical intake/questionnaire...",
    },
    {
        question: "Who looks after you at Rocky?",
        answer: "Rocky is operated by Healthcare Professionals including Doctors, Nurse Practitioners, and Pharmacists. Our team is experienced and readily available...",
    },
    {
        question: "How does Rocky ensure patient privacy?",
        answer: "Rocky handles the privacy and security of all our customers with great care. Our platform meets all required regulatory compliance...",
    },
];

export default function edPrelander() {
    return (
        <main>
            <EdHeroSection
                bgImage="/ed-prelander-5/prelanderBg.jpg"
                title="Not Feeling as Hard? Let Rocky Help."
                subTitle="Digital Healthcare for men without the wait time or stigma. Trusted by 350K+ Customers."
                btnText="Get Started →"
            ></EdHeroSection>
            <Section bg={"bg-[#FFFFFF]"}>
                <HowRockyWorks />
            </Section>
            <Section bg={"bg-[#F5F4EF]"}>
                <ReviewsSection />
            </Section>
            <Section>
                <FaqsSection
                    faqs={faqs}
                    title="Your Questions, Answered"
                    name="Meet Rocky"
                    subtitle="Frequently asked questions"
                />
            </Section>
        </main>
    );
}
