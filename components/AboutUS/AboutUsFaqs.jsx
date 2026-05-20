import FaqsSection from "@/components/FaqsSection";
import MoreQuestions from "@/components/MoreQuestions";
const faqs = [
    {
        question: "What is myRocky?",
        answer: "myRocky is a 100% online platform with a focus to normalize health topics that too often go unspoken and eliminate the stigma surrounding them. At myRocky, we make it easy for patients to connect to licensed healthcare professionals. We help with weight loss, sexual health, hair Loss, mental health and much more. We've built a simple & convenient online process which helps you connect to healthcare professionals in order to get customized treatment plans, shipped right to your door.",
    },
    {
        question: "How does MyRocky work?",
        answer: "MyRocky offers prescription and over-the-counter products. For prescription medication, you will need to complete an online medical intake/questionnaire...",
    },
    {
        question: "Who looks after you at MyRocky?",
        answer: "MyRocky is operated by Healthcare Professionals including Doctors, Nurse Practitioners, and Pharmacists. Our team is experienced and readily available...",
    },
    {
        question: "How does MyRocky ensure patient privacy?",
        answer: "MyRocky handles the privacy and security of all our customers with great care. Our platform meets all required regulatory compliance...",
    },
];

const HomeFaqsSection = () => {
    return (
        <>
            <FaqsSection
                faqs={faqs}
                title="Your Questions, Answered"
                name="Meet MyRocky"
                subtitle="Frequently asked questions"
            />
            <MoreQuestions link="/faqs/" />
        </>
    );
};

export default HomeFaqsSection;
