"use client";

import Link from "next/link";
import Image from "next/image";
import { FaArrowRightLong } from "react-icons/fa6";
import CustomImage from "@/components/utils/CustomImage";

export const LONGEVITY_NAD_PLUS_HERO_DEFAULTS = {
    image: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/hero.png",
    imageAlt: "Athlete checking recovery on a running track",
    headingBefore: "Your Cells Are Running On",
    headingAccent: "Empty.",
    headingAfter: "",
    accentColor: "#AE7E56",
    description:
        "NAD+ supports energy, cellular repair, and healthy aging. After 30, levels decline. We prescribe what helps bring it back.",
    showReviews: false,
    reviewCount: "1,300",
    reviewRating: "4.4",
    priceLine: "",
    showSecondaryBtn: true,
    secondaryBtnText: "See the science",
    secondaryBtnScrollTo: "science",
    primaryBtnHref: "/nad-consultation-quiz",
    primaryBtnText: "Start Your Free Assessment",
};

function HeroReviews({ reviewCount, reviewRating }) {
    return (
        <button
            type="button"
            onClick={() =>
                window.open(
                    "https://www.trustpilot.com/review/myrocky.ca?utm_medium=trustbox&utm_source=MicroCombo",
                    "_blank",
                    "noopener,noreferrer",
                )
            }
            className="flex items-center gap-2 w-fit"
            aria-label={`${reviewCount} reviews on Trustpilot`}
        >
            <CustomImage
                src="/trustpilot/stars.png"
                alt=""
                width={96}
                height={18}
                className="h-[18px] w-[96px] object-contain"
            />
            <span className="helvetica-text-font font-medium text-[14px] leading-[1.4] tracking-[-0.28px] text-black underline-offset-2">
                {reviewCount} Reviews • <strong>{reviewRating}</strong>
            </span>
        </button>
    );
}

const LongevityNadPlusHeroSection = ({
    image = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.image,
    imageAlt = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.imageAlt,
    headingBefore = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.headingBefore,
    headingAccent = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.headingAccent,
    headingAfter = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.headingAfter,
    accentColor = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.accentColor,
    description = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.description,
    showReviews = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.showReviews,
    reviewCount = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.reviewCount,
    priceLine = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.priceLine,
    showSecondaryBtn = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.showSecondaryBtn,
    secondaryBtnText = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.secondaryBtnText,
    secondaryBtnScrollTo = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.secondaryBtnScrollTo,
    primaryBtnHref = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.primaryBtnHref,
    primaryBtnText = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.primaryBtnText,
    reviewRating = LONGEVITY_NAD_PLUS_HERO_DEFAULTS.reviewRating,
    onPrimaryClick,
    isPrimaryLoading = false,
    headingSizeClass = "text-[42px] md:text-[56px]",
    descriptionMaxWidthClass = "max-w-[510px]",
    primaryBtnClassName = "",
    primaryBtnId,
    ctaContainerClassName = "w-full md:max-w-[320px]",
}) => {
    const scrollToSection = () => {
        if (!secondaryBtnScrollTo) return;
        document
            .getElementById(secondaryBtnScrollTo)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <section className="bg-white">
            <div className="max-w-[1200px] mx-auto px-5 pt-10 md:pt-16 pb-12 md:pb-12">
                <div className="grid sm:grid-cols-2 gap-10 lg:gap-32 items-center">
                    <div className="flex flex-col gap-6">
                        {showReviews && (
                            <HeroReviews
                                reviewCount={reviewCount}
                                reviewRating={reviewRating}
                            />
                        )}

                        <h1 className={`helvetica-display-font ${headingSizeClass} font-medium leading-[1.1] tracking-[-0.42px] md:tracking-[-1.56px] text-black`}>
                            {headingBefore}{" "}
                            <span style={{ color: accentColor }}>
                                {headingAccent}
                            </span>
                            {headingAfter ? ` ${headingAfter}` : null}
                        </h1>

                        {priceLine ? (
                            <p className="helvetica-display-font text-[20px] md:text-[24px] font-medium leading-[1.2] tracking-[-0.2px] md:tracking-[-0.24px] text-black">
                                {priceLine}
                            </p>
                        ) : null}

                        <p className={`helvetica-text-font text-[16px] md:text-[18px] leading-[1.4] tracking-[-0.32px] text-black ${descriptionMaxWidthClass}`}>
                            {description}
                        </p>

                        <div className={`flex flex-col gap-3 ${ctaContainerClassName}`}>
                            {onPrimaryClick ? (
                                <button
                                    type="button"
                                    id={primaryBtnId}
                                    onClick={onPrimaryClick}
                                    disabled={isPrimaryLoading}
                                    className={`dm-mono-font inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-black text-white text-sm md:text-base font-medium hover:bg-gray-800 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed uppercase${primaryBtnClassName ? ` ${primaryBtnClassName}` : ""}`}
                                >
                                    {primaryBtnText}
                                    <FaArrowRightLong className="w-4 h-4" />
                                </button>
                            ) : (
                                <Link
                                    href={primaryBtnHref}
                                    className={`dm-mono-font inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-black text-white text-sm md:text-base font-medium hover:bg-gray-800 transition-all duration-300  uppercase${primaryBtnClassName ? ` ${primaryBtnClassName}` : ""}`}
                                >
                                    {primaryBtnText}
                                    <FaArrowRightLong className="w-4 h-4" />
                                </Link>
                            )}

                            {showSecondaryBtn && secondaryBtnScrollTo ? (
                                <button
                                    type="button"
                                    onClick={scrollToSection}
                                    className="dm-mono-font inline-flex items-center justify-center h-12 px-8 rounded-full border border-black text-black text-sm md:text-base font-medium hover:bg-gray-50 transition-all duration-300  uppercase"
                                >
                                    {secondaryBtnText}
                                </button>
                            ) : null}
                        </div>
                    </div>

                    <div className="relative w-full aspect-[4/4] xl:aspect-auto xl:w-[580px] xl:h-[600px] md:justify-self-end">
                        <div className="relative rounded-[24px] overflow-hidden w-full h-full">
                            <CustomImage
                                src={image}
                                alt={imageAlt}
                                fill
                                priority
                                className="object-cover object-center w-full h-full"
                                sizes="(max-width: 768px) 100vw, 580px"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LongevityNadPlusHeroSection;
