"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import ScrollArrows from "@/components/ScrollArrows";
import Image from "next/image";
import CustomImage from "../utils/CustomImage";

/**
 * Portrait image carousel.
 * Each entry: `{ src, alt }` — `src` is the image URL/path, `alt` is the
 * accessible description shown to screen-readers and on broken images.
 *
 * Replace the placeholder entries below with your actual images.
 */
export const DM_OFFERS_CAROUSEL_IMAGES = [
    {
        src: "https://myrocky.b-cdn.net/WP%20Images/glp-offer/customers/1.png",
        alt: "MyRocky member testimonial — weight loss journey",
    },
    {
        src: "https://myrocky.b-cdn.net/WP%20Images/glp-offer/customers/2.png",
        alt: "MyRocky member testimonial — weight loss journey",
    },
    {
        src: "https://myrocky.b-cdn.net/WP%20Images/glp-offer/customers/3.png",
        alt: "MyRocky member testimonial — weight loss journey",
    },
    {
        src: "https://myrocky.b-cdn.net/WP%20Images/glp-offer/customers/4.png",
        alt: "MyRocky member testimonial — weight loss journey",
    },
    {
        src: "https://myrocky.b-cdn.net/WP%20Images/glp-offer/customers/5.png",
        alt: "MyRocky member testimonial — weight loss journey",
    },
    {
        src: "https://myrocky.b-cdn.net/WP%20Images/glp-offer/customers/6.png",
        alt: "MyRocky member testimonial — weight loss journey",
    },
];

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
                    className="absolute -left-1 top-[50%] z-[99999] flex -translate-y-1/2 cursor-pointer touch-manipulation md:hidden text-white"
                >
                    <FaChevronLeft className="text-4xl" aria-hidden />
                </button>
            )}
            {isScrollable && !isAtEnd && (
                <button
                    type="button"
                    aria-label="Scroll testimonials right"
                    onClick={() => scrollDir("right")}
                    className="absolute -right-1 top-[50%] z-[99999] flex -translate-y-1/2 cursor-pointer touch-manipulation md:hidden text-white"
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
 * Portrait image testimonial carousel.
 *
 * Props:
 *   images           – array of `{ src, alt }` objects (defaults to DM_OFFERS_CAROUSEL_IMAGES)
 *   scrollAmount     – optional fixed scroll step in px; auto-measured when omitted
 */
export default function DmOffersVimeoCarousel({
    images = DM_OFFERS_CAROUSEL_IMAGES,
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
    }, [images.length, scrollAmountOverride]);

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
                    className="flex gap-5 overflow-x-auto scroll-smooth pb-1 pt-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] no-scrollbar md:gap-4 lg:gap-4 bg-[#FAF3EF]"
                >
                    {images.map((entry, index) => (
                        <div
                            key={`${entry.src}-${index}`}
                            className="sm:w-[min(52vw,300px)] w-full sm:px-0 px-8 shrink-0 snap-center md:w-[268px] lg:w-[300px]"
                        >
                            <div className="relative aspect-[9/16] w-full overflow-hidden rounded-3xl bg-neutral-950 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.35)] ring-1 ring-neutral-950/10">
                                <CustomImage
                                    src={entry.src}
                                    alt={
                                        entry.alt ||
                                        "MyRocky customer testimonial"
                                    }
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 52vw, 300px"
                                    className="object-cover"
                                    // draggable={false}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
