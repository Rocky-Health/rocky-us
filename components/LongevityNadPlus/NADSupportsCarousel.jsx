"use client";

import { useEffect, useRef, useState } from "react";
import CustomImage from "@/components/utils/CustomImage";

const CARD_WIDTH = 282;
const GAP = 24;
const MOBILE_CARD_WIDTH = 280;
const MOBILE_GAP = 16;
const MOBILE_PADDING = 20;

function getDesktopMaxSlide(containerWidth, itemCount, cardWidth, gap) {
    const trackWidth = itemCount * cardWidth + (itemCount - 1) * gap;
    return Math.max(0, trackWidth - containerWidth);
}

const NAD_ITEMS = [
    {
        img: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/ned-plus-support-1.jpg",
        title: "Focus",
        desc: "Powers the brain's most energy-hungry processes. Sharper, longer.",
    },
    {
        img: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/ned-plus-support-2.jpg",
        title: "Energy",
        desc: "Fuels mitochondria directly. Not a stimulant. The actual source.",
    },
    {
        img: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/ned-plus-support-3.jpg",
        title: "Recovery",
        desc: "Supports cellular repair after training, travel, or high-demand periods.",
    },
    {
        img: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/ned-plus-support-4.png",
        title: "Sleep",
        desc: "Regulates circadian rhythm for more consistent, restorative rest.",
    },
    {
        img: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/ned-plus-support-5.jpg",
        title: "Longevity",
        desc: "Activates sirtuins, proteins linked to DNA repair and aging pathways.",
        // objectPosition: "left center",
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

function SupportCard({ item, imageHeight }) {
    return (
        <div className="flex flex-col gap-4 shrink-0">
            <div
                className="relative overflow-hidden rounded-2xl"
                style={{ height: imageHeight }}
            >
                <CustomImage
                    src={item.img}
                    alt={item.title}
                    fill
                    className="object-cover"
                    style={
                        item.objectPosition
                            ? { objectPosition: item.objectPosition }
                            : undefined
                    }
                    sizes="387px"
                />
            </div>
            <div className="flex flex-col gap-2">
                <h3 className="helvetica-text-font text-base font-medium text-black leading-normal">
                    {item.title}
                </h3>
                <p className="helvetica-text-font text-sm text-black/70 leading-[140%]">
                    {item.desc}
                </p>
            </div>
        </div>
    );
}

export default function NADSupportsCarousel() {
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
                NAD_ITEMS.length,
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
    const [activeIndex, setActiveIndex] = useState(0);
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
        setActiveIndex(Math.max(0, Math.min(NAD_ITEMS.length - 1, idx)));
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
        <section className="bg-[#FAFAFA] w-full overflow-x-clip lg:overflow-x-visible py-14 md:py-24 px-5">
            <div className="max-w-[1200px] mx-auto ">
                {/* Mobile / tablet scroll */}
                <div className="lg:hidden flex flex-col gap-8">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="helvetica-display-font text-[32px] font-medium text-black leading-[115%]">
                            What NAD+
                            <br />
                            Supports
                        </h2>
                        <div className="flex gap-3 shrink-0">
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
                        {NAD_ITEMS.map((item, i) => (
                            <div
                                key={item.title}
                                className="snap-start"
                                style={{
                                    width: `${MOBILE_CARD_WIDTH}px`,
                                    paddingRight:
                                        i === NAD_ITEMS.length - 1
                                            ? `${MOBILE_PADDING}px`
                                            : 0,
                                }}
                            >
                                <SupportCard item={item} imageHeight="387px" />
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-1.5">
                        {NAD_ITEMS.map((_, i) => (
                            <div
                                key={i}
                                className="h-[2px] flex-1 transition-colors duration-300"
                                style={{
                                    backgroundColor:
                                        i === activeIndex
                                            ? "#000000"
                                            : "rgba(0, 0, 0, 0.12)",
                                }}
                            />
                        ))}
                    </div>
                </div>

                {/* Desktop */}
                <div className="hidden lg:block">
                    <div className="flex items-center justify-between mb-10 gap-6">
                        <h2 className="helvetica-display-font text-[42px] md:text-[48px] font-medium text-black leading-[115%]">
                            What NAD+ Supports
                        </h2>
                        <div className="flex gap-3 shrink-0">
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
                            {NAD_ITEMS.map((item) => (
                                <div
                                    key={item.title}
                                    className="shrink-0"
                                    style={{ width: `${CARD_WIDTH}px` }}
                                >
                                    <SupportCard
                                        item={item}
                                        imageHeight="387px"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
