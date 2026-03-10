"use client";
import CoverSection from "@/components/utils/CoverSection";
import WlCover from "@/components/BodyOptimization/WlCover";
import RockyFeatures from "@/components/RockyFeatures";
import RockyInTheNews from "@/components/RockyInTheNews";
import ReviewsSection from "@/components/ReviewsSection";
import Section from "@/components/utils/Section";
import EnhancesWellnessJourney from "@/components/BodyOptimization/EnhancesWellnessJourney";
import HealthSolutions from "@/components/BodyOptimization/HealthSolutions";
import PersonalizedTreatment from "@/components/BodyOptimization/PersonalizedTreatment";
import MoneyBack from "@/components/MoneyBack";
import WlFaqsSection from "@/components/BodyOptimization/WlFaqsSection";
import ResultSection from "@/components/BodyOptimization/ResultSection";
import { Suspense } from "react";
import { useAutoApplyCoupon } from "@/lib/hooks/useAutoApplyCoupon";

function CouponCapture() {
  useAutoApplyCoupon();
  return null;
}

export default function BodyOptimization() {
  return (
    <main>
      <Suspense fallback={null}>
        <CouponCapture />
      </Suspense>
      <CoverSection>
        <WlCover />
      </CoverSection>
      <RockyFeatures />

      <Section>
        <ResultSection />
      </Section>

      <Section bg={"bg-[#F5F4EF]"}>
        <EnhancesWellnessJourney />
      </Section>
      <RockyInTheNews />

      <Section>
        <HealthSolutions />
      </Section>
      <Section bg={"bg-[#F5F4EF]"}>
        <ReviewsSection />
      </Section>
      <Section>
        <PersonalizedTreatment />
      </Section>
      <Section bg={"bg-[#F7F8FB]"}>
        <MoneyBack />
      </Section>
      <Section>
        <WlFaqsSection />
      </Section>
    </main>
  );
}
