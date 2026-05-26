"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { TiStar } from "react-icons/ti";
import ScrollArrows from "@/components/ScrollArrows";
import { NAD_PLUS_TESTIMONIALS } from "./nadPlusTestimonialsData";

export { NAD_PLUS_TESTIMONIALS };

/** Fallback if layout not measured yet (e.g. first paint before children mount). */
const FALLBACK_SCROLL_STEP = 336;

/**
 * Small-screen arrows only (`md:hidden`). Desktop uses {@link ScrollArrows} unchanged.
 */
function ImageCarouselMobileScrollArrows({
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
                    className="absolute -left-1 top-[50%] z-[99999] flex -translate-y-1/2 cursor-pointer touch-manipulation text-[#AE7E56] drop-shadow-sm md:hidden"
                >
                    <FaChevronLeft className="text-4xl" aria-hidden />
                </button>
            )}
            {isScrollable && !isAtEnd && (
                <button
                    type="button"
                    aria-label="Scroll testimonials right"
                    onClick={() => scrollDir("right")}
                    className="absolute -right-1 top-[50%] z-[99999] flex -translate-y-1/2 cursor-pointer touch-manipulation text-[#AE7E56] drop-shadow-sm md:hidden"
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

/**
 * Horizontal testimonial card carousel.
 *
 * Props:
 *   testimonials     – array of `{ title, quote, author }` objects
 *   scrollAmount     – optional fixed scroll step in px; auto-measured when omitted
 */
export default function NadPlusVimeoCarousel({
    testimonials = NAD_PLUS_TESTIMONIALS,
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

        /* images can shift layout slightly after paint */
        const t = window.setTimeout(apply, 400);

        return () => {
            window.clearTimeout(t);
            ro?.disconnect();
            window.removeEventListener("resize", apply);
            lastScrollableRef.current = null;
        };
    }, [testimonials.length, scrollAmountOverride]);

    return (
        <div className="relative z-10 mx-auto w-full max-w-[1340px] pb-6 md:pb-10">
            <div className="relative md:px-1">
                <ScrollArrows
                    key={scrollArrowsKey}
                    scrollContainerRef={scrollContainerRef}
                    scrollAmount={scrollAmount}
                />
                <ImageCarouselMobileScrollArrows
                    resyncKey={scrollArrowsKey}
                    scrollContainerRef={scrollContainerRef}
                    scrollAmount={scrollAmount}
                />
                <div
                    ref={scrollContainerRef}
                    className="flex gap-5 overflow-x-auto scroll-smooth bg-[#F5F4EF] pb-1 pt-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] no-scrollbar md:gap-4 lg:gap-4"
                >
                    {testimonials.map((entry, index) => (
                        <div
                            key={`${entry.title}-${index}`}
                            className="w-full shrink-0 snap-center px-3 sm:w-[min(60vw,380px)] sm:px-0 md:w-[340px] lg:w-[360px]"
                        >
                            <div className="flex min-h-[210px] w-full flex-col items-center rounded-2xl border border-[#E2E2E1] bg-white px-5 py-6 text-center shadow-sm sm:min-h-[230px] sm:px-6">
                                <div className="mb-3 flex items-center justify-center text-[#AE7E56]">
                                    {Array.from({ length: 5 }).map((_, starIdx) => (
                                        <TiStar
                                            key={`${entry.title}-star-${starIdx}`}
                                            className="size-4 sm:size-5"
                                            aria-hidden
                                        />
                                    ))}
                                </div>
                                <h3 className="mb-2 font-poppins text-base font-semibold text-gray-900 sm:text-lg">
                                    {entry.title}
                                </h3>
                                <p className="text-sm leading-relaxed text-gray-600 sm:text-[15px]">
                                    {entry.quote}
                                </p>
                                <span className="mt-3 text-xs text-gray-500">
                                    — {entry.author}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
