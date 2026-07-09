import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import CustomImage from "@/components/utils/CustomImage";
import NadDeclineTreatmentChart from "./NadDeclineTreatmentChart";

export const LONGEVITY_NAD_DECLINE_DEFAULTS = {
    backgroundImage:
        "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/run-v2.png",
    backgroundAlt: "Runner in motion on a track",
    label: "THE FUEL YOUR CELLS NEED",
    heading: "Reverse age-related NAD+ decline",
    paragraphs: [
        "As we age, our bodies face a natural decline in NAD+ levels. A shift that impacts your energy, vitality and overall health.",
        "NAD+ decline is normal — accepting it doesn't have to be. By supplementing with NAD+ injections, you can support your body's natural energy production as you age.",
    ],
    ctaHref: "/nad-consultation-quiz",
    ctaText: "Get Started",
};

export default function LongevityNadDeclineSection({
    backgroundImage = LONGEVITY_NAD_DECLINE_DEFAULTS.backgroundImage,
    backgroundAlt = LONGEVITY_NAD_DECLINE_DEFAULTS.backgroundAlt,
    label = LONGEVITY_NAD_DECLINE_DEFAULTS.label,
    heading = LONGEVITY_NAD_DECLINE_DEFAULTS.heading,
    paragraphs = LONGEVITY_NAD_DECLINE_DEFAULTS.paragraphs,
    ctaHref = LONGEVITY_NAD_DECLINE_DEFAULTS.ctaHref,
    ctaText = LONGEVITY_NAD_DECLINE_DEFAULTS.ctaText,
    sectionId = "science",
    onCtaClick,
    isCtaLoading = false,
    chartTreatmentLabel,
    chartNaturalLabel,
    ctaClassName = "",
}) {
    return (
        <section
            id={sectionId}
            className="relative w-full bg-black scroll-mt-24 overflow-hidden"
        >
            <div className="absolute inset-0">
                <CustomImage
                    src={backgroundImage}
                    alt={backgroundAlt}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                />
                {/* <div className="absolute inset-0 bg-black/55" aria-hidden /> */}
            </div>

            <div className="relative z-10 max-w-[1200px] mx-auto px-5 py-14 md:py-20">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <div className="flex flex-col gap-5 md:gap-6">
                        <p className="dm-mono-font text-[12px] md:text-[14px] uppercase tracking-wide text-white font-medium">
                            {label}
                        </p>
                        <h2 className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-white">
                            {heading}
                        </h2>
                        <div className="flex flex-col gap-6 md:max-w-[480px]">
                            {paragraphs.map((paragraph) => (
                                <p
                                    key={paragraph}
                                    className="helvetica-text-font text-[16px] md:text-[18px] leading-[1.4] tracking-[-0.32px] text-white md:max-w-[520px]"
                                >
                                    {paragraph}
                                </p>
                            ))}
                        </div>
                        {onCtaClick ? (
                            <button
                                type="button"
                                onClick={onCtaClick}
                                disabled={isCtaLoading}
                                className={`dm-mono-font items-center justify-center gap-2 self-start py-2.5 px-20 rounded-full bg-white text-black text-sm  font-medium hover:bg-white/80 transition-all duration-300 uppercase mt-4 tracking-wide md:inline-flex  hidden disabled:opacity-70 disabled:cursor-not-allowed${ctaClassName ? ` ${ctaClassName}` : ""}`}
                            >
                                {ctaText}
                                <FaArrowRightLong className="w-4 h-4" />
                            </button>
                        ) : (
                            <Link
                                href={ctaHref}
                                className={`dm-mono-font items-center justify-center gap-2 self-start py-2.5 px-20 rounded-full bg-white text-black text-sm  font-medium hover:bg-white/80 transition-all duration-300 uppercase mt-4 tracking-wide md:inline-flex  hidden${ctaClassName ? ` ${ctaClassName}` : ""}`}
                            >
                                {ctaText}
                                <FaArrowRightLong className="w-4 h-4" />
                            </Link>
                        )}
                    </div>

                    <div className="w-full md:max-w-[520px] lg:max-w-none lg:justify-self-end">
                        <NadDeclineTreatmentChart treatmentLabel={chartTreatmentLabel} naturalLabel={chartNaturalLabel} />
                    </div>

                    {onCtaClick ? (
                        <button
                            type="button"
                            onClick={onCtaClick}
                            disabled={isCtaLoading}
                            className={`dm-mono-font inline-flex items-center justify-center gap-2 self-start py-2.5 px-20 rounded-full bg-white text-black text-sm  font-medium hover:bg-white/80 transition-all duration-300 uppercase mt-0 tracking-wide md:hidden disabled:opacity-70 disabled:cursor-not-allowed${ctaClassName ? ` ${ctaClassName}` : ""}`}
                        >
                            {ctaText}
                            <FaArrowRightLong className="w-4 h-4" />
                        </button>
                    ) : (
                        <Link
                            href={ctaHref}
                            className={`dm-mono-font inline-flex items-center justify-center gap-2 self-start py-2.5 px-20 rounded-full bg-white text-black text-sm  font-medium hover:bg-white/80 transition-all duration-300 uppercase mt-0 tracking-wide md:hidden ${ctaClassName ? ` ${ctaClassName}` : ""}`}
                        >
                            {ctaText}
                            <FaArrowRightLong className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
