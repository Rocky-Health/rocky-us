"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Native-scroll carousel state: progress for the rail plus prev/next availability. */
export function useNadCarousel() {
    const scrollRef = useRef(null);
    const [progress, setProgress] = useState(0);
    const [thumbRatio, setThumbRatio] = useState(1);
    const [canPrev, setCanPrev] = useState(false);
    const [canNext, setCanNext] = useState(false);

    const sync = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const { scrollLeft, clientWidth, scrollWidth } = el;
        const maxScroll = scrollWidth - clientWidth;
        setThumbRatio(scrollWidth > 0 ? Math.min(1, clientWidth / scrollWidth) : 1);
        setProgress(maxScroll > 0 ? scrollLeft / maxScroll : 0);
        setCanPrev(scrollLeft > 4);
        setCanNext(scrollLeft < maxScroll - 4);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return undefined;
        sync();
        const ro = new ResizeObserver(sync);
        ro.observe(el);
        window.addEventListener("resize", sync);
        return () => {
            ro.disconnect();
            window.removeEventListener("resize", sync);
        };
    }, [sync]);

    const scrollByCard = useCallback((dir) => {
        const el = scrollRef.current;
        if (!el) return;
        // One "page" is a card plus its gap; fall back to 80% of the viewport.
        const first = el.firstElementChild;
        const step = first instanceof HTMLElement
            ? first.getBoundingClientRect().width + 16
            : el.clientWidth * 0.8;
        el.scrollBy({ left: dir * step, behavior: "smooth" });
    }, []);

    return {
        scrollRef,
        onScroll: sync,
        progress,
        thumbRatio,
        canPrev,
        canNext,
        goPrev: () => scrollByCard(-1),
        goNext: () => scrollByCard(1),
    };
}

function ArrowButton({ onClick, disabled, dir, label }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition-colors ${
                disabled
                    ? "border-black/15 text-black/25"
                    : "border-black/25 text-black hover:bg-black/5"
            }`}
        >
            <svg width="15" height="12" viewBox="0 0 15 12" fill="none" aria-hidden>
                <path
                    d={
                        dir === "prev"
                            ? "M6 1L1 6M1 6L6 11M1 6H14"
                            : "M9 1L14 6M14 6L9 11M14 6H1"
                    }
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    );
}

/** Progress rail on the left, circular prev/next on the right. */
export default function NadCarouselControls({
    progress,
    thumbRatio,
    canPrev,
    canNext,
    goPrev,
    goNext,
    className = "",
}) {
    const travel = Math.max(0, 1 - thumbRatio);

    return (
        <div className={`flex items-center gap-6 ${className}`.trim()}>
            <div className="relative h-px flex-1 bg-[#E2E2E1]">
                <span
                    className="absolute top-[-0.5px] h-0.5 bg-black transition-[left] duration-200"
                    style={{
                        width: `${thumbRatio * 100}%`,
                        left: `${progress * travel * 100}%`,
                    }}
                />
            </div>
            <div className="flex shrink-0 gap-3">
                <ArrowButton onClick={goPrev} disabled={!canPrev} dir="prev" label="Previous" />
                <ArrowButton onClick={goNext} disabled={!canNext} dir="next" label="Next" />
            </div>
        </div>
    );
}
