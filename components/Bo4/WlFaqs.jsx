import MoreQuestions from "@/components/MoreQuestions";
import FaqsSection from "../home/FaqsSection";
const faqs = [
  {
    question: "How much does the Weight Loss Program cost?",
    answer:
      "The Weight Loss Program entails an initial health and medication consultation fee of $99. Following this, only the medication is charged monthly. The membership starts upon the prescription being issued by our healthcare providers. It's important to note that the initial consultation is a one-time fee cost of $99, and follow-up consultations (if necessary) are $40.",
  },
  {
    question: "Do you accept insurance?",
    answer:
      "To determine insurance coverage you will need to contact your insurance provider directly. We can provide you with a detailed invoice upon request, which you can submit to your insurance for reimbursement purposes.",
  },
  {
    question: "What can I expect after I sign up?",
    answer:
      "Upon completing the initial online consultation, a Rocky Healthcare provider will assess this and determine if you are eligible. Please check your account for messages from your clinician.",
  },
  // {
  //   question: "Why do I need a metabolic lab test?",
  //   answer:
  //     "",
  // },
  {
    question: "What are the side effects of GLP-1 medications?",
    answer:
      "Common side effects include nausea, vomiting, abdominal pain, constipation and/or diarrhea. More severe side effects are rare but can include pancreatitis, gallbladder disease, low blood sugar, severe allergies, visual disturbances, rapid heartbeat, and mood disturbances. This is not a full list and we encourage you to please consult with a clinician for further information.",
  },
  {
    question: "How do I schedule a call with my provider?",
    answer:
      "After submitting your questionnaire, you will be able to schedule a call with a licensed US healthcare provider. To request this, simply send a message to your provider through your account by clicking on messages. They will send you a link to schedule a call at your convenience.",
  },
  // {
  //   question: "What is the refund policy?",
  //   answer:""
  //  },
  // {
  //   question: "How do weight loss injections work?",
  //   answer:""
  //  },
  //  {
  //   question: "How can I get a weight loss medication prescription at Rocky?",
  //   answer: ""
  //  },

  // {
  //   question: "What type of weight loss medications does Rocky offer?",
  //   answer: ""
  //  },
];

const WlFaqs = ({ moreQTitle = null }) => {
  return (
    <div className="mx-auto">
      <FaqsSection
        faqs={faqs}
        blackText="Your Questions, Answered"
        accentText=""
        subtitle="Frequently asked questions"
      />
      <div className="showElement">
        <MoreQuestions
          bg="bg-[#fff] !w-[100%]"
          title="Convenient, effective, doctor-trusted."
          link="/wl-pre-consultation/"
          buttonText="Get Started"
          buttonWidth="md:w-[172px] w-[100%]"
          preventLayoutHide
        />
      </div>
    </div>
  );
};

export default WlFaqs;
