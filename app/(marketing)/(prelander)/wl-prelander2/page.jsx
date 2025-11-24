import FaqsSection from "@/components/FaqsSection";
import ReviewsSection from "@/components/ReviewsSection";
import Section from "@/components/utils/Section";
import WlHeroSection from "@/components/WL/WlHeroSection";
import WLProgram from "@/components/WL/WLProgram";

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

const WeightLossProgramItems = [
    {
        id: "1",
        time: "Today",
        title: "Start your initial consultation ($99)",
        description:
            "Share your health history and weight loss goals with us online to get started. Same day appointment to meet our licensed medical provider.",
    },
    {
        id: "2",
        time: "In 3 days",
        title: "Take a lab test",
        description:
            "Share your health history and weight loss goals with us online to get started. Same day appointment to meet our licensed medical provider.",
    },
    {
        id: "3",
        time: "Within 1 week",
        title: "Provider writes an Rx",
        description:
            "Share your health history and weight loss goals with us online to get started. Same day appointment to meet our licensed medical provider.",
    },
    {
        id: "4",
        time: "Free & Discreet 2-Day Delivery",
        title: "Get your medication",
        description:
            "Share your health history and weight loss goals with us online to get started. Same day appointment to meet our licensed medical provider.",
    },

    {
        id: "5",
        time: "On-going care & support",
        title: "Begin treatment",
        description:
            "Share your health history and weight loss goals with us online to get started. Same day appointment to meet our licensed medical provider.",
    },
];

export default function WlPrelander2() {
    const HeroSectionOnclick = () => {};

    return (
        <main>
            <WlHeroSection
                h1="Break Free"
                h2="from the scale"
                p="With doctor-led personalized weight loss programs, trusted by 350K+ Customers."
                onClick={null}
                btnText="Get Started →"
            ></WlHeroSection>

            <WLProgram ProgramWorksData={WeightLossProgramItems}></WLProgram>

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
