import HowRockyWorks from "@/components/HowRockyWorks";
import RockyFeatures from "@/components/RockyFeatures";
import RockyInTheNews from "@/components/RockyInTheNews";
import HomeCover from "@/components/HomePage/HomeCover";
import CoverSection from "@/components/utils/CoverSection";
import Section from "@/components/utils/Section";
import DoctorTrustedSolutions from "@/components/HomePage/DoctorTrustedSolutions";
import HomeProducts from "@/components/HomePage/HomeProducts";
import HomeFaqsSection from "@/components/HomePage/HomeFaqsSection";
import TeamSection from "@/components/TeamSection";
import RockyBlog from "@/components/RockyBlog";
import ReviewsSection from "@/components/ReviewsSection";
import ProudPartner from "@/components/ProudPartner";
import CouponCapture from "@/components/utils/CouponCapture";


export default async function Home() {
  return (
    <main>
      <CouponCapture />
      <CoverSection>
        <HomeCover />
        <RockyFeatures />
        <br />
        <br />
        <ProudPartner />
      </CoverSection>
      <Section bg={"bg-[#F5F4EF]"}>
        <HowRockyWorks />
      </Section>
      <Section>
        <DoctorTrustedSolutions />
      </Section>
      <RockyInTheNews />
      <Section bg={"bg-[#F5F4EF]"}>
        <ReviewsSection />
      </Section>
      <Section>
        <HomeProducts />
      </Section>
      <Section>
        <TeamSection />
      </Section>
      <RockyBlog />
      <Section>
        <HomeFaqsSection />
      </Section>
    </main>
  );
}
