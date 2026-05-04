"use client";

import { useState } from "react";
import Image from "next/image";
import Ed1QuestionCard from "@/components/PreLanders/ed-1/Ed1QuestionCard";
import { FaBolt, FaCircleCheck, FaFire, FaRocket } from "react-icons/fa6";

const HERO_QUESTION = {
  id: "q1",
  title: (
    <>
      How do you want to <br />
      level up your sex life?
    </>
  ),
  options: ["Get harder, faster", "Longer Sex", "All the above"],
};

const benefitIconClass = "h-4 w-4 shrink-0 text-[#AE7E56]";

function HeroTwoTabsImage({ className = "" }) {
  return (
    <div className={`w-full max-w-[min(92vw,340px)] ${className}`}>
      <Image
        src="/ed-1/direct-max-tabs-2.png"
        alt="Direct Max: two fast-acting tabs"
        width={680}
        height={520}
        className="h-auto w-full drop-shadow-xl"
        priority
      />
    </div>
  );
}

function HeroBenefitHighlights({ className = "", align = "center" }) {
  const justify = align === "start" ? "justify-start" : "justify-center";
  const thirdRowMobile = align === "start" ? "justify-start" : "justify-center";

  return (
    <div
      className={`poppins-font flex flex-wrap gap-x-5 gap-y-2 text-sm text-black/70 sm:gap-x-6 lg:flex-nowrap lg:gap-x-6 ${justify} ${className}`}
    >
      <span className="inline-flex shrink-0 items-center gap-2">
        <FaRocket className={benefitIconClass} aria-hidden />
        Lasts 3x Longer
      </span>
      <span className="inline-flex shrink-0 items-center gap-2">
        <FaBolt className={benefitIconClass} aria-hidden />
        3x More Effective
      </span>
      <span
        className={`flex w-full basis-full ${thirdRowMobile} lg:inline-flex lg:w-auto lg:basis-auto lg:flex-none lg:justify-start`}
      >
        <span className="inline-flex shrink-0 items-center gap-2">
          <FaCircleCheck className={benefitIconClass} aria-hidden />
          Performance Guarantee
        </span>
      </span>
    </div>
  );
}

export default function Ed1DirectMaxHeroSection() {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const handleFirstQuestionSelect = (option) => {
    setSelectedAnswer(option);
    window.setTimeout(() => {
      const nextSection = document.getElementById("ed1-followup-questions");
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 180);
  };

  const trustLine = (
    <p className="poppins-font mt-4 flex items-center justify-center gap-2 text-center text-sm text-black/65">
      <FaFire className="text-[#AE7E56]" aria-hidden />
      Trusted by over 175,000 customers
    </p>
  );

  return (
    <section aria-label="MyRocky hero: unleash the best sex of your life and start the questionnaire.">
      <div className="relative bg-[#F5F4EF] lg:overflow-hidden">
        {/* Mobile: stacked hero + overlapping pills (same palette as desktop) */}
        <div className="relative overflow-hidden lg:hidden">
          <div className="relative px-5 pt-10">
            <div className="mx-auto max-w-[520px] text-center">
              <h2 className="headers-font text-[40px] font-semibold leading-[1.05] tracking-tight text-black">
                Unleash the best
                <br />
                <span className="text-[#AE7E56]">sex</span> of your life.
              </h2>
              <p className="poppins-font mt-5 text-[17px] leading-snug text-black/80">
                Fast acting formulas with up to 3x the power of generics — built
                for <span className="text-[#AE7E56]">maximum enjoyment.</span>
              </p>
              <HeroBenefitHighlights className="mt-5 max-w-[340px] mx-auto" />
              <p className="poppins-font mt-6 text-[19px] text-black/90">
                Limited Time{" "}
                <span className="font-semibold text-[#AE7E56]">33% OFF!</span>
              </p>
              <HeroTwoTabsImage className="mx-auto mt-6" />
            </div>
          </div>
        </div>

        <div className="relative z-[2] mx-auto max-w-[1440px] px-5 pb-10 pt-2 lg:px-10 lg:pb-16 lg:pt-14">
          {/* Desktop: marketing | 40px | card — col2 = 448px; col1 fills rest, copy capped at 596px */}
          <div className="grid lg:grid-cols-[1fr_448px] lg:items-start lg:justify-start lg:gap-[40px] xl:grid-cols-[596px_448px]">
            <div className="hidden min-w-0 max-w-[596px] text-left lg:block">
              <h2
                id="ed1-directmax-hero-heading"
                className="headers-font text-[46px] font-semibold leading-[0.95] tracking-tight text-black md:text-[56px]"
              >
                Unleash the best <span className="text-[#AE7E56]">sex</span>
                <br />
                of your life.
              </h2>
              <p className="poppins-font mt-6 max-w-[460px] text-[20px] font-normal leading-snug text-black/85">
                Fast acting formulas with up to 3x the power of generics – built
                for <span className="text-[#AE7E56]">maximum enjoyment.</span>
              </p>
              <HeroBenefitHighlights align="start" className="mt-5 max-w-md" />
              <p className="poppins-font mt-4 text-[20px] text-black/90">
                Limited Time{" "}
                <span className="font-semibold text-[#AE7E56]">33% OFF!</span>
              </p>
              <HeroTwoTabsImage className="mt-6" />
            </div>

            <div className="-mt-6 min-w-0 w-full lg:mt-0">
              <Ed1QuestionCard
                step={0}
                question={HERO_QUESTION}
                selected={selectedAnswer}
                onSelect={handleFirstQuestionSelect}
                variant="hero"
              />
              <div className="hidden lg:block">{trustLine}</div>
            </div>
          </div>

          <div className="lg:hidden">{trustLine}</div>
        </div>
      </div>
    </section>
  );
}
