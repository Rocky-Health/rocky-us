"use client";

import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import CustomImage from "@/components/utils/CustomImage";
import { useRef, useState, useEffect } from "react";

const HOW_ROCKY_WORKS_CARDS = [
  {
    step: "Step 1",
    title: "Online Assessment",
    description: "Tell us about your health",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/step-1.png",
  },
  {
    step: "Step 2",
    title: "Free & Fast Delivery",
    description: "To your door, in discreet packaging",
    image: "/NAD+/step-2.png",
  },
  {
    step: "Step 3",
    title: "Ongoing Care & Support",
    description: "To help you succeed",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/dr-mirhom.png",
  },
];

function StepCard({ card, className = "" }) {
  return (
    <div className={`relative rounded-2xl overflow-hidden ${className}`}>
      <CustomImage
        src={card.image}
        alt={`${card.title}, ${card.description}`}
        width={374}
        height={530}
        className="w-full h-auto object-cover"
      />
    </div>
  );
}

function ArrowBtn({ onClick, disabled, dir, label }) {
  const path =
    dir === "prev"
      ? "M13.5 6H1.5m0 0L7 11M1.5 6L7 1"
      : "M1.5 6h12m0 0L8 1m5.5 5L8 11";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="dm-mono-font w-10 h-10 rounded-full border border-black/50 flex items-center justify-center transition-colors disabled:opacity-30 hover:bg-black/5 disabled:cursor-not-allowed uppercase"
    >
      <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden>
        <path
          d={path}
          stroke="black"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

const LongevityNadPlusHowRockyWorks = ({
  cards,
  title,
  ctaHref = "/nad-consultation-quiz",
  ctaText = "Start Your Free Assessment",
  onCtaClick,
  isCtaLoading = false,
  ctaClassName = "",
}) => {
  const dataToUse = cards ?? HOW_ROCKY_WORKS_CARDS;
  const scrollContainerRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollContainerRef.current) return;
      const scrollLeft = scrollContainerRef.current.scrollLeft;
      const cardWidth =
        scrollContainerRef.current.children[0]?.offsetWidth + 16;
      setActiveSlide(Math.round(scrollLeft / cardWidth));
    };

    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSlide = (index) => {
    if (!scrollContainerRef.current) return;
    const cardWidth = scrollContainerRef.current.children[0]?.offsetWidth + 16;
    scrollContainerRef.current.scrollTo({
      left: cardWidth * index,
      behavior: "smooth",
    });
  };

  const goPrev = () => scrollToSlide(Math.max(0, activeSlide - 1));
  const goNext = () =>
    scrollToSlide(Math.min(dataToUse.length - 1, activeSlide + 1));

  return (
    <section className="bg-[#FAFAFA] w-full py-14 md:py-24">
      <div className="max-w-[1200px] mx-auto px-5">
        <h2 className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-black mb-8 md:mb-12">
          {title || "How MyRocky Works"}
        </h2>

        <div className="hidden md:grid md:grid-cols-3 gap-4">
          {dataToUse.map((card) => (
            <StepCard key={card.title} card={card} />
          ))}
        </div>

        <div className="md:hidden px-5">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar -mx-5 "
          >
            {dataToUse.map((card) => (
              <StepCard
                key={card.title}
                card={card}
                className="w-[280px] shrink-0 snap-start"
              />
            ))}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <ArrowBtn
              onClick={goPrev}
              disabled={activeSlide === 0}
              dir="prev"
              label="Previous"
            />
            <ArrowBtn
              onClick={goNext}
              disabled={activeSlide === dataToUse.length - 1}
              dir="next"
              label="Next"
            />
          </div>
        </div>

        <div className="flex justify-center mt-10 md:mt-12">
          {onCtaClick ? (
            <button
              type="button"
              onClick={onCtaClick}
              disabled={isCtaLoading}
              className={`dm-mono-font inline-flex items-center justify-center gap-2 py-3 md:px-8 rounded-full bg-black text-white md:text-base text-sm font-medium hover:bg-gray-800 transition-all duration-300 uppercase md:w-fit w-full disabled:opacity-70 disabled:cursor-not-allowed${ctaClassName ? ` ${ctaClassName}` : ""}`}
              style={{ wordSpacing: "0.25em" }}
            >
              {ctaText}
              <FaArrowRightLong className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={ctaHref}
              className={`dm-mono-font inline-flex items-center justify-center gap-2 py-3 md:px-8 rounded-full bg-black text-white md:text-base text-sm font-medium hover:bg-gray-800 transition-all duration-300 uppercase  md:w-fit w-full${ctaClassName ? ` ${ctaClassName}` : ""}`}
              style={{ wordSpacing: "0.25em" }}
            >
              {ctaText}
              <FaArrowRightLong className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
};

export default LongevityNadPlusHowRockyWorks;
