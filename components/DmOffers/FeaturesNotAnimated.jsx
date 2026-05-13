"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import CustomImage from "@/components/utils/CustomImage";

const rockyFeaturesCards = [
    {
        title: "CA-Certified Pharmacy",
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/hospital%201.png",
    },
    {
        title: "Personalized Treatments",
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/personalized.png",
    },
    {
        title: "Trusted by 350K+ Users",
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/trusted.png",
    },
    {
        title: "1:1 Medical Support",
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/medical.png",
    },
];

const ADVANCE_MS = 5000;
/** Slide strip transition — outgoing moves left / incoming enters from right */
const SLIDE_MS = 450;

function MobileFeaturesPanel({ cards, MobileBg }) {
    const dataToUse = cards;
    const n = dataToUse.length;
    /** […items, first again] — so last → first pans without reversing */
    const panels = n > 0 ? [...dataToUse, dataToUse[0]] : [];

    const [stripIndex, setStripIndex] = useState(0);
    const [noTransition, setNoTransition] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const stripIndexRef = useRef(0);

    useEffect(() => {
        stripIndexRef.current = stripIndex;
    }, [stripIndex]);

    useLayoutEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        const sync = () => setReducedMotion(mq.matches);
        sync();
        mq.addEventListener("change", sync);
        return () => mq.removeEventListener("change", sync);
    }, []);

    useEffect(() => {
        if (reducedMotion || n <= 1) return;
        const id = window.setInterval(() => {
            setStripIndex((p) => (p >= n ? p : p + 1));
        }, ADVANCE_MS);
        return () => window.clearInterval(id);
    }, [reducedMotion, n]);

    const wrapClassName = `lg:hidden w-full max-w-[1184px] mb-6 mx-auto border border-solid border-[#E2E2E1] rounded-2xl px-4 py-4  ${MobileBg ?? ""}`;

    const handleTransitionEnd = (e) => {
        if (e.propertyName !== "transform") return;
        if (stripIndexRef.current !== n) return;
        setNoTransition(true);
        setStripIndex(0);
        requestAnimationFrame(() => {
            requestAnimationFrame(() => setNoTransition(false));
        });
    };

    if (reducedMotion) {
        return (
            <div className={wrapClassName}>
                {dataToUse.map((card, index) => (
                    <div
                        key={index}
                        className={`${index !== dataToUse.length - 1 ? "mb-[15px] border-b border-solid border-[#E2E2E1] pb-[15px]" : ""}`}
                    >
                        <div className="flex items-center gap-2">
                            <div className="relative h-[24px] w-[24px] overflow-hidden rounded-2xl">
                                <CustomImage
                                    src={card.image}
                                    alt={card.title}
                                    fill
                                />
                            </div>
                            <h3 className="text-[16px] font-[400]">
                                {card.title}
                            </h3>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (n <= 1) {
        const card = dataToUse[0];
        return (
            <div className={wrapClassName}>
                <div className="flex  items-center justify-center gap-2">
                    <div className="relative h-[24px] w-[24px] shrink-0 overflow-hidden rounded-2xl">
                        <CustomImage src={card.image} alt={card.title} fill />
                    </div>
                    <h3 className="text-center text-[16px] font-[400] leading-snug">
                        {card.title}
                    </h3>
                </div>
            </div>
        );
    }

    const panelCount = panels.length;
    const slidePct = 100 / panelCount;
    const logicalIndex = stripIndex >= n ? 0 : stripIndex;

    return (
        <div className={wrapClassName}>
            <p className="sr-only" aria-live="polite">
                {dataToUse[logicalIndex].title}
            </p>
            <div className="relative w-full  overflow-hidden">
                <div
                    className={`flex flex-row ${
                        noTransition
                            ? "!transition-none"
                            : "transition-transform ease-out"
                    }`}
                    style={{
                        width: `${panelCount * 100}%`,
                        transform: `translateX(-${stripIndex * slidePct}%)`,
                        transitionDuration: noTransition
                            ? "0ms"
                            : `${SLIDE_MS}ms`,
                    }}
                    onTransitionEnd={handleTransitionEnd}
                >
                    {panels.map((card, idx) => (
                        <div
                            key={idx === n ? "loop-clone" : `slide-${idx}`}
                            className="flex shrink-0 items-center justify-center gap-2 px-1"
                            style={{ width: `${slidePct}%` }}
                            aria-hidden
                        >
                            <div className="relative h-[24px] w-[24px] shrink-0 overflow-hidden rounded-2xl">
                                <CustomImage src={card.image} alt="" fill />
                            </div>
                            <h3 className="text-center text-[16px] font-[400] leading-snug">
                                {card.title}
                            </h3>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const FeaturesNotAnimated = ({
    cards,
    bg = "bg-transparent",
    MobileBg = "bg-transparent",
}) => {
    const dataToUse = cards ? cards : rockyFeaturesCards;
    return (
        <div className="px-4">
            {/* Mobile: strip slides left; next panel enters from the right */}
            <MobileFeaturesPanel cards={dataToUse} MobileBg={MobileBg} />

            {/* Desktop View */}
            <div
                className={`relative hidden w-full max-w-[1184px] mx-auto overflow-hidden border border-solid border-[#E2E2E1] rounded-2xl py-4 lg:block ${bg ?? ""}`}
            >
                <div className="flex w-full items-center justify-center gap-12 overflow-hidden whitespace-nowrap">
                    {dataToUse.map((card, index) => (
                        <div key={index} className="flex-shrink-0">
                            <div className="flex h-[24px] items-center justify-center gap-2">
                                <div className="relative h-[24px] w-[24px] overflow-hidden rounded-2xl">
                                    <CustomImage
                                        src={card.image}
                                        alt={card.title}
                                        fill
                                    />
                                </div>
                                <h3 className="text-[13px] font-[400] leading-[22.4px]">
                                    {card.title}
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturesNotAnimated;
