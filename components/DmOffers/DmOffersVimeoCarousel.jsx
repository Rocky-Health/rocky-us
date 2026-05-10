"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ScrollArrows from "@/components/ScrollArrows";

/** Portrait testimonial carousel — `{ vimeoId, title }` or `{ iframeSrc, title }` (titles feed iframe accessibility only). */
export const DM_OFFERS_VIMEO_VIDEOS = [
    {
        vimeoId: "1123949957",
        title: "MyRocky member testimonial — weight loss journey",
    },
    {
        vimeoId: "1123958880",
        title: "MyRocky member testimonial — weight loss journey",
    },
    {
        vimeoId: "1123965031",
        title: "MyRocky member testimonial — weight loss journey",
    },
    {
        vimeoId: "1123964421",
        title: "MyRocky member testimonial — weight loss journey",
    },
    {
        vimeoId: "1123986623",
        title: "MyRocky member testimonial — weight loss journey",
    },
    {
        vimeoId: "1123988338",
        title: "MyRocky member testimonial — weight loss journey",
    },
];

/** Fallback if layout not measured yet (e.g. first paint before children mount). */
const FALLBACK_SCROLL_STEP = 336;

function vimeoPlayerSrc(vimeoId) {
    const params = new URLSearchParams({
        badge: "0",
        autopause: "0",
        title: "0",
        byline: "0",
        portrait: "0",
        controls: "1",
        playsinline: "1",
        quality: "auto",
        dnt: "1",
    });
    return `https://player.vimeo.com/video/${vimeoId}?${params.toString()}`;
}

function iframeSrc(entry) {
    if (entry.iframeSrc) return entry.iframeSrc;
    if (entry.vimeoId) return vimeoPlayerSrc(entry.vimeoId);
    return "";
}

/**
 * Small-screen arrows only (`md:hidden`). Desktop uses {@link ScrollArrows} unchanged.
 */
function VimeoCarouselMobileScrollArrows({
    scrollContainerRef,
    scrollAmount,
    resyncKey,
}) {
    const [isScrollable, setIsScrollable] = useState(false);
    const [isAtStart, setIsAtStart] = useState(true);
    const [isAtEnd, setIsAtEnd] = useState(false);

    useEffect(() => {
        const scrollContainer = scrollContainerRef.current;
        if (!scrollContainer) return undefined;

        const sync = () => {
            setIsScrollable(
                scrollContainer.scrollWidth > scrollContainer.clientWidth + 1,
            );
            setIsAtStart(scrollContainer.scrollLeft <= 1);
            setIsAtEnd(
                scrollContainer.scrollLeft + scrollContainer.clientWidth >=
                    scrollContainer.scrollWidth - 1,
            );
        };

        sync();
        scrollContainer.addEventListener("scroll", sync, { passive: true });
        window.addEventListener("resize", sync);

        return () => {
            scrollContainer.removeEventListener("scroll", sync);
            window.removeEventListener("resize", sync);
        };
    }, [scrollContainerRef, resyncKey]);

    const scrollDir = (direction) => {
        scrollContainerRef.current?.scrollBy({
            left: direction === "right" ? scrollAmount : -scrollAmount,
            behavior: "smooth",
        });
    };

    return (
        <>
            {isScrollable && !isAtStart && (
                <button
                    type="button"
                    aria-label="Scroll testimonials left"
                    onClick={() => scrollDir("left")}
                    className="absolute -left-1 top-[50%] z-[99999] flex  -translate-y-1/2 cursor-pointer touch-manipulation md:hidden text-white"
                >
                    <FaChevronLeft className="text-4xl" aria-hidden />
                </button>
            )}
            {isScrollable && !isAtEnd && (
                <button
                    type="button"
                    aria-label="Scroll testimonials right"
                    onClick={() => scrollDir("right")}
                    className="absolute -right-1 top-[50%] z-[99999] flex  -translate-y-1/2 cursor-pointer touch-manipulation md:hidden text-white"
                >
                    <FaChevronRight className="text-4xl" aria-hidden />
                </button>
            )}
        </>
    );
}

/** One slide step: prefer distance between 1st & 2nd cards (includes padding/gap); else width + flex gap. */
function measureScrollStep(container) {
    if (!container) return FALLBACK_SCROLL_STEP;
    const { children } = container;
    if (children.length >= 2) {
        const stride = children[1].offsetLeft - children[0].offsetLeft;
        if (stride > 0) return stride;
    }
    const first = children[0];
    if (!first) return FALLBACK_SCROLL_STEP;
    const gapRaw = getComputedStyle(container).gap;
    let gap =
        gapRaw.includes("px") || gapRaw.endsWith("%")
            ? Number.parseFloat(gapRaw)
            : 20;
    if (!Number.isFinite(gap) || gap < 0) gap = 20;
    const stride = first.getBoundingClientRect().width + gap;
    return stride > 0 ? stride : FALLBACK_SCROLL_STEP;
}

export default function DmOffersVimeoCarousel({
    videos = DM_OFFERS_VIMEO_VIDEOS,
    scrollAmount: scrollAmountOverride,
}) {
    const scrollContainerRef = useRef(null);
    const [scrollAmount, setScrollAmount] = useState(FALLBACK_SCROLL_STEP);
    const [scrollArrowsKey, setScrollArrowsKey] = useState(0);
    const lastScrollableRef = useRef(null);

    useLayoutEffect(() => {
        const el = scrollContainerRef.current;
        if (
            typeof scrollAmountOverride === "number" &&
            Number.isFinite(scrollAmountOverride)
        ) {
            setScrollAmount(scrollAmountOverride);
            return;
        }

        if (!el) return;

        const apply = () => {
            setScrollAmount(measureScrollStep(el));

            const scrollable = el.scrollWidth > el.clientWidth + 1;
            if (lastScrollableRef.current !== scrollable) {
                lastScrollableRef.current = scrollable;
                setScrollArrowsKey((k) => k + 1);
            }
        };

        apply();

        let ro;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(apply);
            ro.observe(el);
        }

        window.addEventListener("resize", apply);

        /** iframes can grow scrollWidth slightly after paint */
        const t = window.setTimeout(apply, 400);

        return () => {
            window.clearTimeout(t);
            ro?.disconnect();
            window.removeEventListener("resize", apply);
            lastScrollableRef.current = null;
        };
    }, [videos.length, scrollAmountOverride]);

    return (
        <div className="relative z-10 mx-auto w-full max-w-[1340px] pb-6  md:pb-10">
            <div className="relative md:px-1">
                <ScrollArrows
                    key={scrollArrowsKey}
                    scrollContainerRef={scrollContainerRef}
                    scrollAmount={scrollAmount}
                />
                <VimeoCarouselMobileScrollArrows
                    resyncKey={scrollArrowsKey}
                    scrollContainerRef={scrollContainerRef}
                    scrollAmount={scrollAmount}
                />
                <div
                    ref={scrollContainerRef}
                    className="flex gap-5 overflow-x-auto scroll-smooth  pb-1 pt-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] no-scrollbar md:gap-4  lg:gap-4 bg-[#FAF3EF]"
                >
                    {videos.map((entry, index) => {
                        const src = iframeSrc(entry);
                        if (!src) return null;
                        const { title } = entry;
                        return (
                            <div
                                key={`${src}-${index}`}
                                className="sm:w-[min(52vw,300px)] w-full sm:px-0 px-8 shrink-0 snap-center md:w-[268px] lg:w-[300px]"
                            >
                                <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-neutral-950 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-neutral-950/10">
                                    <iframe
                                        src={src}
                                        className="absolute inset-0 h-full w-full border-0"
                                        allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share"
                                        referrerPolicy="strict-origin-when-cross-origin"
                                        title={
                                            title ||
                                            "MyRocky customer testimonial video"
                                        }
                                        allowFullScreen
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
