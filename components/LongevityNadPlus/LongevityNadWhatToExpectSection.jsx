import Link from "next/link";
import { FaArrowRightLong } from "react-icons/fa6";
import { WHAT_TO_EXPECT_DATA } from "./data/longevityNadPlusData";

export const LONGEVITY_NAD_WHAT_TO_EXPECT_DEFAULTS = WHAT_TO_EXPECT_DATA;

function TimelineRow({ item, isFirstItem = false }) {
    return (
        <article
            className={`grid md:grid-cols-[1fr_1fr] grid-cols-2 gap-3 md:gap-16 py-8 md:py-10 border-t border-dashed border-black/20 ${isFirstItem ? "border-t-0" : ""}`}
        >
            <div className="flex flex-col gap-2 ">
                <p className="helvetica-text-font font-medium text-[12px] leading-[1.4] tracking-[-0.16px] text-black uppercase">
                    {item.week}
                </p>
                <h3 className="helvetica-display-font text-[20px] md:text-[24px] font-medium leading-[1.2] tracking-[-0.2px] md:tracking-[-0.24px] text-black">
                    {item.title}
                </h3>
            </div>
            <p className="helvetica-text-font text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.28px] md:tracking-[-0.32px] text-black md:self-center max-w-[640px]">
                {item.desc}
            </p>
        </article>
    );
}

export default function LongevityNadWhatToExpectSection({
    bg = LONGEVITY_NAD_WHAT_TO_EXPECT_DEFAULTS.bg,
    label = LONGEVITY_NAD_WHAT_TO_EXPECT_DEFAULTS.label,
    heading = LONGEVITY_NAD_WHAT_TO_EXPECT_DEFAULTS.heading,
    items = LONGEVITY_NAD_WHAT_TO_EXPECT_DEFAULTS.items,
    ctaText = LONGEVITY_NAD_WHAT_TO_EXPECT_DEFAULTS.ctaText,
    ctaHref = LONGEVITY_NAD_WHAT_TO_EXPECT_DEFAULTS.ctaHref,
    btnClassName = LONGEVITY_NAD_WHAT_TO_EXPECT_DEFAULTS.btnClassName,
    onCtaClick,
    isCtaLoading = false,
}) {
    const ctaClassName = `inline-flex items-center justify-center gap-2 py-3  md:px-10 rounded-full bg-black text-white md:text-base text-sm font-medium hover:bg-gray-800 transition-all duration-300  md:w-fit w-full ${btnClassName ? ` ${btnClassName}` : ""}`;
    return (
        <section className={`${bg} w-full py-14 md:py-24`}>
            <div className="max-w-[1200px] mx-auto px-5">
                <header className="flex flex-col gap-2 mb-2">
                    <p className="dm-mono-font text-[12px] md:text-[14px] uppercase tracking-wide text-black font-medium">
                        {label}
                    </p>
                    <h2 className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-black">
                        {heading}
                    </h2>
                </header>

                <div className="flex flex-col">
                    {items.map((item, index) => (
                        <TimelineRow
                            key={item.week}
                            item={item}
                            isFirstItem={index === 0}
                        />
                    ))}
                </div>

                <p className="helvetica-text-font text-[12px] leading-[1.4] tracking-[-0.16px] text-black/60 mt-6 md:mt-8 max-w-[640px]">
                    Results and timelines vary by individual experience.
                </p>

                <div className="flex justify-center mt-10 md:mt-12">
                    {onCtaClick ? (
                        <button
                            type="button"
                            onClick={onCtaClick}
                            disabled={isCtaLoading}
                            className={`dm-mono-font ${ctaClassName} disabled:opacity-70 disabled:cursor-not-allowed uppercase`}
                        >
                            {ctaText}
                            <FaArrowRightLong className="w-4 h-4" />
                        </button>
                    ) : (
                        <Link href={ctaHref} className={ctaClassName}>
                            {ctaText}
                            <FaArrowRightLong className="w-4 h-4" />
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
