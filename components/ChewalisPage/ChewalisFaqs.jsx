import FaqsSection from "@/components/FaqsSection";
import MoreQuestions from "@/components/MoreQuestions";
const faqs = [
  {
    question:
      "How does MyRocky's Chewalis work faster than traditional ED medications like Viagra or Cialis?",
    answer:
      "MyRocky's Chewalis is designed for sublingual administration, allowing the mint to dissolve under the tongue. This delivery method enables the active ingredient, tadalafil, to be absorbed directly into the bloodstream through the blood vessels under the tongue, bypassing the digestive system for a quicker onset of action.",
  },
  {
    question: "How quickly does MyRocky's Chewalis start working?",
    answer:
      "Chewalis is a sublingual ED treatment that starts to work rapidly. Since it dissolves under the tongue, it typically begins to work in about 15 minutes, offering a swift response when timing matters.",
  },
  {
    question: "What is the duration of effectiveness for MyRocky's Chewalis?",
    answer:
      "Containing tadalafil, MyRocky's Chewalis offers an extended duration of action, remaining effective in the bloodstream for up to 36 hours, giving you ample flexibility for spontaneity.",
  },
  {
    question: "How long does it take for MyRocky's Chewalis to dissolve?",
    answer:
      "MyRocky's Chewalis is crafted to dissolve under the tongue within approximately 10 minutes. This slower dissolution rate ensures maximum absorption of the medication into your bloodstream, optimizing its effectiveness and speed.",
  },
  {
    question: "How does MyRocky's Chewalis compare to traditional ED pills?",
    answer:
      "Chewalis offers a unique advantage over traditional ED pills by dissolving under the tongue, which allows for quicker absorption into the bloodstream. This means you can experience its effects faster, making it ideal for spontaneous situations without the need for water or stomach digestion.",
  },
  {
    question: "Can I take MyRocky's Chewalis every day?",
    answer:
      "Yes, MyRocky's Chewalis is designed for daily use. Taking one mint daily helps maintain a consistent level of tadalafil in your system, which can enhance spontaneity by ensuring you're ready whenever the moment arises. Always follow the dosage recommendations provided by your healthcare provider.",
  },
  {
    question:
      "How should I store MyRocky's Chewalis to maintain its effectiveness?",
    answer:
      "To ensure maximum effectiveness, store MyRocky's Chewalis at room temperature away from moisture and heat. Keep the mints in their original packaging, and make sure the container is sealed properly after each use to preserve their freshness and potency.",
  },
];

const ChewalisFaqs = () => {
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

export default ChewalisFaqs;
