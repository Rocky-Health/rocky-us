import FaqsSection from "@/components/FaqsSection";
import MoreQuestions from "@/components/MoreQuestions";
const faqs = [
    {
        question: "What is anxiety?",
        answer: "Anxiety is your body's response to stress. It's a common experience, but if you find yourself dealing with persistent, overwhelming worry or fear that disrupts your daily life, you might have an anxiety disorder.",
    },
    {
        question: "Do I need anxiety treatment?",
        answer: "If your anxiety feels uncontrollable, persistent, or hinders your ability to function, seeking treatment can be beneficial. Frequent panic attacks or intense worry may also indicate the need for treatment. Consult a healthcare provider to discuss anxiety treatment options.",
    },
    {
        question: "What anxiety treatments are available?",
        answer: "We provide various FDA-Approved medications prescribed by licensed Customer healthcare professionals. These daily medications are intended for managing long-term anxiety. We also provide a hub where you can find self-help resources.",
    },
    {
        question: "What is depression?",
        answer: "Depression, also known as major depressive disorder, presents with a range of symptoms. These can include prolonged feelings of sadness, disinterest in daily activities, disrupted sleep patterns, and emotions such as guilt or a sense of purposelessness.",
    },
    {
        question: "How can depression be addressed?",
        answer: "Depression can be treated through various approaches. This includes, but not limited to, medications, therapy or speaking to a licensed specialist. Our experts will guide you down the right path.",
    },
    {
        question: "What kinds of depression treatments are available?",
        answer: "Every person is treated with a personalized plan to match their needs. We provide different treatment options to guide you after your assessment. We provide various FDA-Approved medications prescribed by licensed Customer healthcare professionals. These daily medications are intended for managing long-term depression. We also provide a hub where you can find self-help resources.",
    },
    {
        question: "Does health insurance cover my treatment?",
        answer: "Treatment coverage varies among plans and provinces, with specific eligibility criteria. To make the most of available coverage, we can provide you with an invoice post-purchase to submit for an insurance claim. Your insurance provider will then reimburse you according to your plan.",
    },
];

const MentalFaqsSection = () => {
    return (
        <div className="mx-auto">
            <FaqsSection
                faqs={faqs}
                title="Your MH Questions, Answered"
                subtitle="Frequently asked questions"
                name="Meet MH"
            />
            <MoreQuestions link="/faqs/#mental-health/" />
        </div>
    );
};

export default MentalFaqsSection;
