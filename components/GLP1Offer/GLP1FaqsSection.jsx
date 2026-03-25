import FaqsSection from "@/components/home/FaqsSection";
import MoreQuestions from "@/components/MoreQuestions";
import { faqs } from "./data";

const GLP1FaqsSection = () => {
  return (
    <div className="mx-auto py-12 md:py-[72px]">
      <FaqsSection
        faqs={faqs}
        title="Frequently asked questions"
        subtitle=""
        isFirstCardOpen={true}
      />
      <div className="w-full px-5 md:px-0">
        <MoreQuestions
          title="Convenient, researched, trusted."
          link="/faqs/"
          buttonWidth="w-full sm:w-auto sm:min-w-[295px]"
        />
      </div>
    </div>
  );
};

export default GLP1FaqsSection;
