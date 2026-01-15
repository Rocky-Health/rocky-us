import Section from "@/components/utils/Section";
import WlFaqsSection from "@/components/BodyOptimization/WlFaqsSection";
import NewMoneyBack from "@/components/BodyOptimization/bo3/NewMoneyBack";
import NewPersonalizedTreatment from "@/components/BodyOptimization/bo3/NewPersonalizedTreatment";
import NewHealthSolutions from "@/components/BodyOptimization/bo3/NewHealthSolutions";
import NewEnhancesWellnessJourney from "@/components/BodyOptimization/bo3/NewEnhancesWellnessJourney";
import NewWlProducts from "@/components/BodyOptimization/bo3/NewWlProducts";
import NewWlCover from "@/components/BodyOptimization/bo3/NewWlCover";
import NewReviewsSection from "@/components/BodyOptimization/bo3/NewReviewsSection";
import NewRockyInTheNews from "@/components/BodyOptimization/bo3/NewRockyInTheNews";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BO3Page() {
  return (
    <main>
      <section className=" bg-[#F4F3EF]">
        <NewWlCover />
      </section>
      <Section bg={"bg-[#F5F4EF] pt-[160px] md:pt-[96px]"}>
        <NewWlProducts CardBtnColor="bg-[forestgreen]" />
      </Section>
      <Section>
        <NewEnhancesWellnessJourney />
      </Section>
      <NewRockyInTheNews />
      <Section>
        <NewHealthSolutions btnColor="bg-[forestgreen]" />
      </Section>
      <Section bg={"bg-[#F5F4EF]"}>
        <NewReviewsSection />
      </Section>
      <Section className="bg-[#fff]">
        <NewPersonalizedTreatment />
      </Section>
      <NewMoneyBack />
      <Section>
        <WlFaqsSection moreQTitle="Convenient, researched, trusted." />
      </Section>
    </main>
  );
}
