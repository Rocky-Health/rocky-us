"use client";
import HowRockyWorks from "@/components/HowRockyWorks";
import Section from "@/components/utils/Section";
import SexBlog from "@/components/Sex/SexBlog";
import CoverSection from "@/components/utils/CoverSection";
import SexCover from "@/components/Sex/SexCover";
import RockyInTheNews2 from "@/components/RockyInTheNews2";
import ReviewsSection from "@/components/ReviewsSection";
import FindTreatment from "@/components/Sex/FindTreatment";
import TeamSection from "@/components/TeamSection";
import FaqsSection from "@/components/FaqsSection";
import EdComparisonTable from "@/components/Sex/EdComparisonTable";
import EdProducts from "@/components/EDPlans/EdProducts";
import { Suspense } from "react";
import { useAutoApplyCoupon } from "@/lib/hooks/useAutoApplyCoupon";

const edFaqs = [
  {
    question: "What is erectile dysfunction (ED)?",
    answer:
      "ED is the ongoing difficulty in getting or keeping an erection firm enough for satisfying sex.",
  },
  {
    question: "How common is ED?",
    answer:
      "ED is very common. About 1 in 2 men over 40 experience it. Younger men can be affected too, around 1 in 4 under 40 report some ED. The chance increases with age: roughly 40% of men by age 40 and over 70% by age 70.",
  },
  {
    question: "What causes ED?",
    answer:
      "ED can have many causes. Physical conditions such as diabetes, high blood pressure, heart disease, nerve problems, or low testosterone can interfere with erections. Psychological factors like stress, anxiety, depression, or relationship issues may also play a role. Lifestyle habits including smoking, drinking alcohol, poor sleep, weight gain, or lack of exercise can further increase the risk.",
  },
  {
    question: "Can ED be temporary?",
    answer:
      "Yes. Stress, poor sleep, or even too much alcohol can cause short-term ED. If it keeps happening however, it's worth checking out.",
  },
  {
    question: "Is ED linked to other health problems?",
    answer:
      "Yes. ED can be an early sign of heart disease, high blood pressure, or diabetes.",
  },
  {
    question: "Can stress or anxiety cause ED?",
    answer:
      "Definitely. Worrying about performance can make it worse, creating a cycle that's hard to break without help.",
  },
  {
    question: "How can I improve ED?",
    answer:
      "Healthy lifestyle changes can make a real difference. Regular exercise improves blood flow, hormone balance, and confidence. Cutting back on processed foods, alcohol, and smoking also lowers the risk.",
  },
  {
    question: "Can ED be cured?",
    answer:
      "In some cases, yes. If ED is caused by psychological factors such as stress, anxiety, or depression, counselling or therapy can help. When lifestyle issues like smoking, lack of exercise, poor sleep, or alcohol use are the main triggers, making healthy changes can also cure the problem. If ED is linked to underlying medical conditions, it may not be curable, but effective treatments can manage symptoms and restore sexual function.",
  },
];

function CouponCapture() {
  useAutoApplyCoupon();
  return null;
}

export default function Sex() {
  return (
    <main>
      <Suspense fallback={null}>
        <CouponCapture />
      </Suspense>
      <CoverSection>
        <SexCover />
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
      <Section>
        <EdComparisonTable />
      </Section>
      {/* <Section>
        <FaqsSection
          title="General Erectile Dysfunction (ED) FAQs"
          subtitle="Common questions about erectile dysfunction"
          faqs={edFaqs}
        />
      </Section> */}
      <SexBlog />
    </main>
  );
}
