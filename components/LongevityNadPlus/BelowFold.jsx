"use client";

import dynamic from "next/dynamic";

// Below-the-fold sections of the NAD+ LP — loaded client-only (ssr:false) so
// framer-motion + swiper stay out of the page's initial render path (TBT).
// Hero + TrustBar remain eager in the page.
const sk = (h) => () => <div className={`w-full ${h} animate-pulse bg-black/5`} />;

const LongevityNadPlusScienceSection = dynamic(
  () => import("@/components/LongevityNadPlus/LongevityNadPlusScienceSection"),
  { ssr: false, loading: sk("min-h-[400px]") },
);
const LongevityNadPlusBenefitsSection = dynamic(
  () => import("@/components/LongevityNadPlus/LongevityNadPlusBenefitsSection"),
  { ssr: false, loading: sk("min-h-[600px]") },
);
const LongevityNadPlusProductSection = dynamic(
  () => import("@/components/LongevityNadPlus/LongevityNadPlusProductSection"),
  { ssr: false, loading: sk("min-h-[600px]") },
);
const NADSupportsCarousel = dynamic(
  () => import("@/components/LongevityNadPlus/NADSupportsCarousel"),
  { ssr: false, loading: sk("min-h-[500px]") },
);
const WhatToExpectSection = dynamic(
  () => import("@/components/LongevityNadPlus/WhatToExpectSection"),
  { ssr: false, loading: sk("min-h-[500px]") },
);
const LongevityNadPlusHowRockyWorks = dynamic(
  () => import("@/components/LongevityNadPlus/LongevityNadPlusHowRockyWorks"),
  { ssr: false, loading: sk("min-h-[500px]") },
);
const LongevityNadPlusFaqsSection = dynamic(
  () => import("@/components/LongevityNadPlus/LongevityNadPlusFaqsSection"),
  { ssr: false, loading: sk("min-h-[400px]") },
);
const LongevityNadPlusBottomCtaSection = dynamic(
  () => import("@/components/LongevityNadPlus/LongevityNadPlusBottomCtaSection"),
  { ssr: false, loading: sk("min-h-[400px]") },
);

export default function BelowFold({ onCtaClick, isCtaLoading = false } = {}) {
  return (
    <>
      <LongevityNadPlusScienceSection />
      <LongevityNadPlusBenefitsSection
        onCtaClick={onCtaClick}
        isCtaLoading={isCtaLoading}
      />
      <LongevityNadPlusProductSection
        onCtaClick={onCtaClick}
        isCtaLoading={isCtaLoading}
      />
      <NADSupportsCarousel />
      <WhatToExpectSection
        onCtaClick={onCtaClick}
        isCtaLoading={isCtaLoading}
      />
      <LongevityNadPlusHowRockyWorks
        onCtaClick={onCtaClick}
        isCtaLoading={isCtaLoading}
      />
      <LongevityNadPlusFaqsSection
        onCtaClick={onCtaClick}
        isCtaLoading={isCtaLoading}
      />
      <LongevityNadPlusBottomCtaSection
        onCtaClick={onCtaClick}
        isCtaLoading={isCtaLoading}
      />
    </>
  );
}
