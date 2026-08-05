"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import CustomImage from "@/components/utils/CustomImage";
import { RESULTS_DATA } from "./data/longevityNadPlusData";

export const LONGEVITY_NAD_RESULTS_DEFAULTS = RESULTS_DATA;

function useCountUp({ from, to, duration = 1.5, delay = 0, trigger = true }) {
    const [value, setValue] = useState(from);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!trigger) {
            setValue(from);
            return;
        }

        const timeout = setTimeout(() => {
            const start = performance.now();
            const diff = to - from;

            const tick = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / (duration * 1000), 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setValue(Math.round(from + diff * eased));
                if (progress < 1) rafRef.current = requestAnimationFrame(tick);
            };

            rafRef.current = requestAnimationFrame(tick);
        }, delay * 1000);

        return () => {
            clearTimeout(timeout);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [trigger, from, to, duration, delay]);

    return value;
}

function StatArrowIcon() {
    return (
        <div className="flex h-12 w-12 shrink-0 items-center border border-black justify-center rounded-md bg-[#AE7E5633]">
            <svg
                width="30"
                height="30"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden
            >
                <path
                    d="M7 11V3M7 3L3.5 6.5M7 3L10.5 6.5"
                    stroke="black"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
}

function ResultStatItem({ value, description, trigger, delay = 0 }) {
    const animatedValue = useCountUp({
        from: 0,
        to: value,
        duration: 1.8,
        delay,
        trigger,
    });

    return (
        <div className="flex flex-col lg:items-start items-center px-0 py-2 lg:text-start text-center">
            <div className="mb-5 flex items-center gap-3">
                <StatArrowIcon />
                <p className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-black tabular-nums">
                    {animatedValue}%
                </p>
            </div>
            <div className="mb-4 h-px w-full max-w-[180px] border-t border-dotted border-black/60" />
            <p className="helvetica-text-font text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.28px] md:tracking-[-0.32px] text-black pe-3">
                {description}
            </p>
        </div>
    );
}

export default function LongevityNadPlusResultsSection({
    backgroundImage = LONGEVITY_NAD_RESULTS_DEFAULTS.backgroundImage,
    backgroundAlt = LONGEVITY_NAD_RESULTS_DEFAULTS.backgroundAlt,
    label = LONGEVITY_NAD_RESULTS_DEFAULTS.label,
    heading = LONGEVITY_NAD_RESULTS_DEFAULTS.heading,
    stats = LONGEVITY_NAD_RESULTS_DEFAULTS.stats,
    disclaimer = LONGEVITY_NAD_RESULTS_DEFAULTS.disclaimer,
}) {
    const { ref, inView } = useInView({
        triggerOnce: true,
        rootMargin: "0px 0px -100px 0px",
    });

    return (
        <section
            ref={ref}
            className="relative w-full overflow-hidden bg-[#F5F4EF] py-14 md:py-24"
        >
            <div className="absolute inset-0">
                <CustomImage
                    src={backgroundImage}
                    alt={backgroundAlt}
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                />
            </div>

            <div className="relative z-10 max-w-[1200px] mx-auto px-5">
                <header className="mx-auto mb-10 md:mb-14 flex max-w-[760px] flex-col items-center gap-3 text-center">
                    <p className="dm-mono-font text-[12px] md:text-[14px] uppercase tracking-wide text-black font-medium">
                        {label}
                    </p>
                    <h2 className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-black">
                        {heading}
                    </h2>
                </header>

                <div className="lg:flex grid grid-cols-2 gap-y-8  lg:gap-12 lg:items-center lg:justify-between">
                    {stats.map((stat, index) => (
                        <ResultStatItem
                            key={stat.description}
                            value={stat.value}
                            description={stat.description}
                            trigger={inView}
                            delay={index * 0.12}
                        />
                    ))}
                </div>

                <p className="mx-auto mt-10 md:mt-16 max-w-[720px] text-center helvetica-text-font text-[12px] leading-[1.4] tracking-[-0.16px] text-black/65">
                    {disclaimer}
                </p>
            </div>
        </section>
    );
}
