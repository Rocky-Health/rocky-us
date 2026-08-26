import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import CustomImage from "@/components/utils/CustomImage";

const BACKGROUND_IMAGE =
    "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/cta-bg.jpg";

export default function LongevityNadPlusBottomCtaSection({
    ctaHref = "/nad-consultation-quiz",
    ctaText = "Start Your Free Assessment",
    onCtaClick,
    isCtaLoading = false,
    heading = "Get the fuel your cells need to thrive.",
    subtext = "Free assessment. No commitment required.",
    ctaClassName = "",
} = {}) {
    return (
        <section
            id="bottom-cta-section"
            className="relative w-full min-h-[480px] md:min-h-[600px] overflow-hidden"
        >
            <CustomImage
                src={BACKGROUND_IMAGE}
                alt="Man stretching outdoors on a bridge"
                fill
                className="object-cover md:object-center object-left"
                sizes="100vw"
            />

            <div className="absolute inset-0 bg-[#0000004D]" aria-hidden />

            <div className="relative z-10 flex min-h-[inherit] items-center justify-center px-5 py-16 md:py-24">
                <div className="flex max-w-[720px] flex-col items-center text-center gap-4 md:gap-5">
                    <h2 className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-white">
                        {heading}
                    </h2>
                    <p className="helvetica-text-font text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.28px] md:tracking-[-0.32px] text-white/80">
                        {subtext}
                    </p>
                    {onCtaClick ? (
                        <button
                            type="button"
                            onClick={onCtaClick}
                            disabled={isCtaLoading}
                            className={`dm-mono-font inline-flex items-center justify-center gap-2 py-2.5 px-6 md:px-10 mt-2 rounded-full bg-white text-black text-sm md:text-base font-medium hover:bg-white/90 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed uppercase whitespace-nowrap${ctaClassName ? ` ${ctaClassName}` : ""}`}
                        >
                            {ctaText}
                            <FaArrowRightLong className="w-4 h-4" />
                        </button>
                    ) : (
                        <Link
                            href={ctaHref}
                            className={`dm-mono-font inline-flex items-center justify-center gap-2 py-2.5 px-6 md:px-10 mt-2 rounded-full bg-white text-black text-sm md:text-base font-medium hover:bg-white/90 transition-all duration-300   uppercase whitespace-nowrap${ctaClassName ? ` ${ctaClassName}` : ""}`}
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
