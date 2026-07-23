// TK-438: Server Component. The stateful steps live in the StepsClient island;
// the hero and MoreQuestions render as static HTML.
import StepsClient from "@/components/HRW/StepsClient";
import MoreQuestions from "@/components/MoreQuestions";
import RockyHeroSection from "@/components/HRW/RockyHeroSection";

export default function HowRockyWorks() {
  return (
    <>
      <RockyHeroSection />
      <StepsClient />
      <div className="pb-14 md:pb-24 max-w-[1184px] mx-auto">
        <MoreQuestions
          title="Your path to better health begins here."
          buttonText="Start Free Consultation"
          buttonWidth="md:w-[246px]"
          link="/assistance-center/"
        />
      </div>
    </>
  );
}
