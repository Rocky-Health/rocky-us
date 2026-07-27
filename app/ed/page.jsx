// TK-438: Server Component — no page-level hooks; interactive children keep
// their own "use client" boundary.
import HowRockyWorks from "@/components/HowRockyWorks";
import Section from "@/components/utils/Section";
import CoverSection from "@/components/utils/CoverSection";
import EdCover from "@/components/Ed/EdCover";
import RockyInTheNews2 from "@/components/RockyInTheNews2";
import ReviewsSection from "@/components/ReviewsSection";
import TeamSection from "@/components/TeamSection";
import FindTreatment from "@/components/Sex/FindTreatment";
import SexBlog from "@/components/Sex/SexBlog";
import EdProducts from "@/components/EDPlans/EdProducts";

export default function Sex() {
  return (
    <main>
      <CoverSection>
        <EdCover />
      </CoverSection>
      <Section>
        <EdProducts />
      </Section>
      <RockyInTheNews2 />
      <Section>
        <HowRockyWorks />
      </Section>
      <Section bg={"bg-[#F5F4EF]"}>
        <ReviewsSection />
      </Section>
      <Section>
        <FindTreatment />
      </Section>
      <Section>
        <TeamSection />
      </Section>
      <SexBlog />
    </main>
  );
}
