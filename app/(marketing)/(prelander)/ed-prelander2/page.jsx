import FaqsSection from "@/components/FaqsSection";
import HowRockyWorks from "@/components/HowRockyWorks";
import EdHeroSection from "@/components/PreLanders/HeroSection";
import ReviewsSection from "@/components/ReviewsSection";
import Section from "@/components/utils/Section";

const faqs = [
    {
        question: "What is myRocky?",
        answer: "myRocky is a 100% online platform with a focus to normalize health topics that too often go unspoken and eliminate the stigma surrounding them. At myRocky, we make it easy for patients to connect to licensed healthcare professionals. We help with weight loss, sexual health, hair Loss, mental health and much more. We've built a simple & convenient online process which helps you connect to healthcare professionals in order to get customized treatment plans, shipped right to your door.",
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

export default function edPrelander2() {
    return (
        <main>
            <EdHeroSection
                bgImage="/ed-prelander-5/prelanderBg.jpg"
                title="Make her fall in love again"
                subTitle="Digital Healthcare for men without the wait time or stigma. Trusted by 350K+ Customers."
                btnText="Get Started →"
            ></EdHeroSection>

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
