"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const CARD_WIDTH = 282;
const GAP = 24;
const MOBILE_CARD_WIDTH = 280;
const MOBILE_GAP = 16;
const MOBILE_PADDING = 20;

function getDesktopMaxSlide(containerWidth, itemCount, cardWidth, gap) {
    const trackWidth = itemCount * cardWidth + (itemCount - 1) * gap;
    return Math.max(0, trackWidth - containerWidth);
}

const TIMELINE_ITEMS = [
    {
        week: "Week 1",
        title: "First Signs Of Energy",
        desc: "Subtle energy lift, improved morning alertness. Sleep may feel deeper.",
    },
    {
        week: "Week 2",
        title: "Mental Clarity Returns",
        desc: "Mental fog begins to lift. Focus sharpens. Patients report sustained energy without crashes. The compounding effect is beginning.",
    },
    {
        week: "Week 4",
        title: "Building Momentum",
        desc: "Recovery is faster. Workouts feel more productive. Sleep feels deeper and more restorative.",
    },
    {
        week: "Week 8",
        title: "Your Body Stops Fighting You",
        desc: "Energy is consistent, and mental focus lasts. Muscle recovery is faster. Patients often feel less joint pain and physical vitality.",
    },
    {
        week: "Week 12+",
        title: "Full effect. Your new baseline",
        desc: "Your body recovers faster and starts to rebuild. DNA repair is supported. It's about how well you age, not just how you feel today.",
    },
];

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
            <svg
                width="15"
                height="12"
                viewBox="0 0 15 12"
                fill="none"
                aria-hidden
            >
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

function TimelineCard({ item }) {
    return (
        <div className="flex flex-col gap-4 shrink-0">
            <div className="flex flex-col gap-4">
                <span className="helvetica-text-font font-medium text-[12px] leading-[1.4] tracking-[-0.16px] text-black uppercase">
                    {item.week}
                </span>
                <div className="w-full border-t border-dashed border-black/20" />
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="helvetica-display-font text-[20px] md:text-[24px] font-medium leading-[1.2] tracking-[-0.2px] md:tracking-[-0.24px] text-black">
                    {item.title}
                </h3>
                <p className="helvetica-text-font text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.28px] md:tracking-[-0.32px] text-black">
                    {item.desc}
                </p>
            </div>
        </div>
    );
}

export default function WhatToExpectSection({
    onCtaClick,
    isCtaLoading = false,
} = {}) {
    const [slideX, setSlideX] = useState(0);
    const [maxSlideX, setMaxSlideX] = useState(0);
    const desktopContainerRef = useRef(null);
    const step = CARD_WIDTH + GAP;

    useEffect(() => {
        const el = desktopContainerRef.current;
        if (!el) return;
        const measure = () => {
            const w = el.getBoundingClientRect().width;
            const maxSlide = getDesktopMaxSlide(
                w,
                TIMELINE_ITEMS.length,
                CARD_WIDTH,
                GAP,
            );
            setMaxSlideX(maxSlide);
            setSlideX((x) => Math.min(x, maxSlide));
        };
        measure();
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const isAtStart = slideX <= 1;
    const isAtEnd = maxSlideX <= 1 || slideX >= maxSlideX - 1;
    const goPrev = () => setSlideX((x) => Math.max(0, x - step));
    const goNext = () => setSlideX((x) => Math.min(maxSlideX, x + step));

    const touchStartRef = useRef(null);
    const onTouchStart = (e) => {
        touchStartRef.current = e.touches[0].clientX;
    };
    const onTouchEnd = (e) => {
        if (touchStartRef.current === null) return;
        const delta = touchStartRef.current - e.changedTouches[0].clientX;
        touchStartRef.current = null;
        if (Math.abs(delta) > 40) delta > 0 ? goNext() : goPrev();
    };

    const mobileScrollRef = useRef(null);
    const [mobileIndex, setMobileIndex] = useState(0);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(true);

    const syncMobileScroll = () => {
        const el = mobileScrollRef.current;
        if (!el) return;
        const { scrollLeft, clientWidth, scrollWidth } = el;
        setCanScrollPrev(scrollLeft > 4);
        setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 4);
        const step = MOBILE_CARD_WIDTH + MOBILE_GAP;
        const idx = Math.round(scrollLeft / step);
        setMobileIndex(Math.max(0, Math.min(TIMELINE_ITEMS.length - 1, idx)));
    };

    useEffect(() => {
        syncMobileScroll();
        window.addEventListener("resize", syncMobileScroll);
        return () => window.removeEventListener("resize", syncMobileScroll);
    }, []);

    const onMobileScroll = () => {
        syncMobileScroll();
    };

    const mobileGoPrev = () => {
        const el = mobileScrollRef.current;
        if (!el) return;
        el.scrollTo({
            left: Math.max(0, el.scrollLeft - (MOBILE_CARD_WIDTH + MOBILE_GAP)),
            behavior: "smooth",
        });
    };

    const mobileGoNext = () => {
        const el = mobileScrollRef.current;
        if (!el) return;
        el.scrollTo({
            left: el.scrollLeft + (MOBILE_CARD_WIDTH + MOBILE_GAP),
            behavior: "smooth",
        });
    };

    return (
        <section className="bg-white w-full overflow-x-clip lg:overflow-x-visible py-14 md:py-24 px-5">
            <div className="max-w-[1200px] mx-auto">
                {/* Mobile / tablet scroll */}
                <div className="lg:hidden flex flex-col gap-8">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex flex-col gap-2">
                            <p className="dm-mono-font text-[12px] md:text-[14px] uppercase tracking-wide text-black font-medium">
                                Your Journey
                            </p>
                            <h2 className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-black">
                                What to Expect
                            </h2>
                        </div>
                        <div className="flex gap-3 shrink-0 pt-1">
                            <ArrowBtn
                                onClick={mobileGoPrev}
                                disabled={!canScrollPrev}
                                dir="prev"
                                label="Previous"
                            />
                            <ArrowBtn
                                onClick={mobileGoNext}
                                disabled={!canScrollNext}
                                dir="next"
                                label="Next"
                            />
                        </div>
                    </div>

                    <div
                        ref={mobileScrollRef}
                        onScroll={onMobileScroll}
                        className="flex overflow-x-auto snap-x snap-mandatory w-full -mx-5 px-5"
                        style={{
                            gap: `${MOBILE_GAP}px`,
                            scrollPaddingLeft: `${MOBILE_PADDING}px`,
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                        }}
                    >
                        {TIMELINE_ITEMS.map((item, i) => (
                            <div
                                key={item.week}
                                className="snap-start"
                                style={{
                                    width: `${MOBILE_CARD_WIDTH}px`,
                                    paddingRight:
                                        i === TIMELINE_ITEMS.length - 1
                                            ? `${MOBILE_PADDING}px`
                                            : 0,
                                }}
                            >
                                <TimelineCard item={item} />
                            </div>
                        ))}
                    </div>

                    {onCtaClick ? (
                        <button
                            type="button"
                            onClick={onCtaClick}
                            disabled={isCtaLoading}
                            className="dm-mono-font inline-flex items-center justify-center h-12 px-8 rounded-full bg-black text-white text-base font-medium hover:bg-gray-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                        >
                            See if NAD+ is right for you
                        </button>
                    ) : (
                        <Link
                            href="/nad-consultation-quiz"
                            className="dm-mono-font inline-flex items-center justify-center h-12 px-8 rounded-full bg-black text-white text-base font-medium hover:bg-gray-900 transition-colors uppercase"
                        >
                            See if NAD+ is right for you
                        </Link>
                    )}
                </div>

                {/* Desktop */}
                <div className="hidden lg:block">
                    <div className="flex items-start justify-between mb-10 gap-6">
                        <div className="flex flex-col gap-2">
                            <p className="dm-mono-font text-[12px] md:text-[14px] uppercase tracking-wide text-black font-medium">
                                Your Journey
                            </p>
                            <h2 className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-black">
                                What to Expect
                            </h2>
                        </div>
                        <div className="flex gap-3 shrink-0 pt-2">
                            <ArrowBtn
                                onClick={goPrev}
                                disabled={isAtStart}
                                dir="prev"
                                label="Previous"
                            />
                            <ArrowBtn
                                onClick={goNext}
                                disabled={isAtEnd}
                                dir="next"
                                label="Next"
                            />
                        </div>
                    </div>

                    <div
                        ref={desktopContainerRef}
                        className="[clip-path:inset(0_-100vw_0_0)]"
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        <div
                            className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                            style={{
                                gap: `${GAP}px`,
                                transform: `translateX(-${slideX}px)`,
                            }}
                        >
                            {TIMELINE_ITEMS.map((item) => (
                                <div
                                    key={item.week}
                                    className="shrink-0"
                                    style={{ width: `${CARD_WIDTH}px` }}
                                >
                                    <TimelineCard item={item} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12">
                        {onCtaClick ? (
                            <button
                                type="button"
                                onClick={onCtaClick}
                                disabled={isCtaLoading}
                                className="dm-mono-font inline-flex items-center justify-center py-3 px-8 rounded-full bg-black text-white text-base font-medium hover:bg-gray-900 transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase"
                            >
                                See if NAD+ is right for you
                            </button>
                        ) : (
                            <Link
                                href="/nad-consultation-quiz"
                                className="dm-mono-font inline-flex items-center justify-center py-3 px-8 rounded-full bg-black text-white text-base font-medium hover:bg-gray-900 transition-all duration-300 hover:scale-105  uppercase"
                            >
                                See if NAD+ is right for you
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
