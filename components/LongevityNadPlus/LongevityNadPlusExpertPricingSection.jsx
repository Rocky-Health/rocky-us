"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import CustomImage from "@/components/utils/CustomImage";
import { EXPERT_PRICING_DATA } from "./data/longevityNadPlusData";
import {
  IoArrowUpCircleOutline,
  IoArrowDownCircleOutline,
} from "react-icons/io5";

function TrendIcon({ direction = "up" }) {
  const isUp = direction === "up";

  if (isUp) {
    return <IoArrowUpCircleOutline className="w-6 h-6 shrink-0" />;
  }

  return <IoArrowDownCircleOutline className="w-6 h-6 shrink-0" />;
}

function BenefitItem({ label, direction, marquee = false }) {
  return (
    <div
      className={`flex items-center gap-2 shrink-0 whitespace-nowrap ${
        marquee ? "px-8 md:px-12" : ""
      }`}
    >
      <TrendIcon direction={direction} />
      <span className="helvetica-text-font text-[14px] leading-[1.4] tracking-[-0.28px] text-black">
        {label}
      </span>
    </div>
  );
}

function BenefitsBar({ items }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [useMarquee, setUseMarquee] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      const container = containerRef.current;
      const track = trackRef.current;
      if (!container || !track) return;

      setUseMarquee(track.scrollWidth > container.clientWidth + 1);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    if (containerRef.current) observer.observe(containerRef.current);
    if (trackRef.current) observer.observe(trackRef.current);

    return () => observer.disconnect();
  }, [items]);

  const marqueeItems = [...items, ...items, ...items, ...items];

  return (
    <div
      ref={containerRef}
      className="mt-20 w-full container mx-auto px-5 overflow-hidden"
    >
      <div
        ref={trackRef}
        aria-hidden
        className="flex items-center justify-center gap-16 absolute invisible pointer-events-none h-0 overflow-hidden whitespace-nowrap"
      >
        {items.map((item) => (
          <BenefitItem key={`measure-${item.label}`} {...item} />
        ))}
      </div>

      {useMarquee ? (
        <div className="relative overflow-hidden w-full">
          <div className="pointer-events-none absolute left-0 top-0 z-[1] h-full w-16 bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)]" />
          <div className="pointer-events-none absolute right-0 top-0 z-[1] h-full w-16 bg-[linear-gradient(90deg,rgba(255,255,255,0)_0%,#ffffff_100%)]" />

          <div className="flex items-center whitespace-nowrap w-fit min-h-[32px] animate-scroll-press-logos">
            {marqueeItems.map((item, index) => (
              <BenefitItem key={`${item.label}-${index}`} {...item} marquee />
            ))}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-16 min-h-[32px]">
          {items.map((item) => (
            <BenefitItem key={item.label} {...item} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function LongevityNadPlusExpertPricingSection({
  heading = EXPERT_PRICING_DATA.heading,
  headingAccent = "Expert-guided NAD+,",
  description = EXPERT_PRICING_DATA.description,
  ctaText = EXPERT_PRICING_DATA.ctaText,
  ctaHref = EXPERT_PRICING_DATA.ctaHref,
  image = EXPERT_PRICING_DATA.image,
  imageMobile = EXPERT_PRICING_DATA.imageMobile,
  imageAlt = EXPERT_PRICING_DATA.imageAlt,
  overlayLabel = EXPERT_PRICING_DATA.overlayLabel,
  overlayItems = EXPERT_PRICING_DATA.overlayItems,
  benefitItems = EXPERT_PRICING_DATA.benefitItems,
  onCtaClick,
  isCtaLoading = false,
  ctaClassName = "",
}) {
  return (
    <section className="bg-white w-full py-14 md:py-20">
      <div className="max-w-[1200px] mx-auto px-5 ">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div className="relative h-[292.432px] md:min-h-[475px] rounded-[24px] overflow-hidden md:hidden">
            <CustomImage
              src={imageMobile || image}
              alt={imageAlt}
              fill
              className="!object-contain md:!object-cover object-center"
              sizes="(max-width: 1024px) 100vw, 580px"
            />
          </div>
          <div className="flex flex-col gap-6 md:gap-8 md:max-w-[520px]">
            <h2 className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-black">
              {headingAccent && heading.startsWith(headingAccent) ? (
                <>
                  <span className="text-[#AE7E56]">{headingAccent}</span>
                  {heading.slice(headingAccent.length)}
                </>
              ) : (
                heading
              )}
            </h2>
            <p className="helvetica-text-font text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.28px] md:tracking-[-0.32px] text-black">
              {description}
            </p>
            {onCtaClick ? (
              <button
                type="button"
                onClick={onCtaClick}
                disabled={isCtaLoading}
                className={`dm-mono-font inline-flex items-center justify-center gap-2 self-start py-3 px-16 rounded-full bg-black text-white text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-all duration-300 md:w-fit w-full disabled:opacity-70 disabled:cursor-not-allowed${ctaClassName ? ` ${ctaClassName}` : ""}`}
              >
                {ctaText}
                <FaArrowRightLong className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href={ctaHref}
                className={`dm-mono-font inline-flex items-center justify-center gap-2 self-start py-3 px-16 rounded-full bg-black text-white text-sm font-normal uppercase tracking-wide hover:bg-gray-800 transition-all duration-300  md:w-fit w-full${ctaClassName ? ` ${ctaClassName}` : ""}`}
              >
                {ctaText}
                <FaArrowRightLong className="w-4 h-4" />
              </Link>
            )}
          </div>

          <div className="relative min-h-[360px] md:min-h-[475px] rounded-[24px] overflow-hidden hidden md:block">
            <CustomImage
              src={image}
              alt={imageAlt}
              fill
              className="!object-contain object-center"
              sizes="(max-width: 1024px) 100vw, 580px"
            />
          </div>
        </div>
      </div>

      <BenefitsBar items={benefitItems} />
    </section>
  );
}
