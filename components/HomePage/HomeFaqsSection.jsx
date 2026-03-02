import FaqsSection from "@/components/FaqsSection";
import MoreQuestions from "@/components/MoreQuestions";
const faqs = [
  {
    question: "What is MyRocky?",
    answer:
      "MyRocky is a 100% online platform with a focus to normalize men's health and eliminate the stigma surrounding it. At MyRocky, we make it easy for patients to connect to licensed healthcare professionals. We specialize in medical conditions commonly experienced by men including Erectile Dysfunction and Hair Loss. We've built a simple & convenient online process which helps you connect to healthcare professionals in order to get customized treatment plans, shipped right to your door.",
  },
  {
    question: "How does MyRocky work?",
    answer:
      "MyRocky offers prescription and over-the-counter products. For Prescription medication, you will need to complete an online medical intake/ questionnaire pertaining to the medical condition you are interested in treating. This step covers your medical history, medical conditions, medication you currently take, etc. A licensed healthcare provider then takes a look at your information and assesses whether or not you are a good candidate for any particular treatment. If a healthcare professional determines a treatment is right for you, it is delivered by MyRocky Pharmacy straight to your doorstep.",
  },
  {
    question: "Who looks after you at MyRocky?",
    answer:
      "MyRocky is operated by Healthcare Professionals including Doctors, Nurse Practitioners, and Pharmacists. Our team is experienced and readily available to ensure your needs are met. You can contact any member of the team by portal message, or emailing the respective departments directly.",
  },
  {
    question: "How does MyRocky ensure patient privacy?",
    answer:
      "MyRocky handles the privacy and security of all our customers with great care. Our platform meets all required regulatory compliance, as well having systems in place to ensure all information provided is secured. Any medical or personal information provided is only accessed by the medical team managing your care.",
  },
];

const HomeFaqsSection = ({ faqs: dynamicFaqs, title, name, subtitle , isFirstCardOpen}) => {
  // Use dynamic FAQs if provided, otherwise use default FAQs
  const faqsToUse = dynamicFaqs || faqs;

  return (
    <>
      <FaqsSection
        faqs={faqsToUse}
        title={title || "Your Questions, Answered"}
        name={name || "Meet MyRocky"}
        subtitle={subtitle || "Frequently asked questions"}
        isFirstCardOpen={isFirstCardOpen !== undefined ? isFirstCardOpen : true}
      />
      <MoreQuestions link="/faqs/" />
    </>
  );
};

export default HomeFaqsSection;
