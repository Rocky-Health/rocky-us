"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowRightLong } from "react-icons/fa6";

export default function LongevityNadPlusStickyCta({
    href = "/nad-consultation-quiz",
    text = "Get Started",
    hideNearId = "bottom-cta-section",
    revealAfterId,
    onCtaClick,
    isCtaLoading = false,
    barClassName = "",
}) {
    // Gated by revealAfterId, the bar must not flash above the fold on load, so
    // it starts hidden until the reveal element scrolls past. Without the gate
    // it starts visible — the original behavior.
    const [showByBottom, setShowByBottom] = useState(true);
    const [scrolledPast, setScrolledPast] = useState(false);

    useEffect(() => {
        const target = document.getElementById(hideNearId);
        if (!target) {
            setShowByBottom(true);
            return;
        }

        // IntersectionObserver stays accurate through momentum scrolling and
        // the mobile URL-bar collapse/expand. The previous scroll listener
        // compared rect.top against window.innerHeight, which goes stale
        // mid-scroll on real devices (the toolbar resize changes innerHeight
        // between sparse momentum scroll events) and let the bar detach from
        // the viewport bottom during fast scrolls.
        const observer = new IntersectionObserver(([entry]) => {
            // Visible only while the bottom CTA section is still below the
            // viewport — same semantics as the old rect.top >= innerHeight.
            setShowByBottom(
                !entry.isIntersecting && entry.boundingClientRect.top > 0
            );
        });
        observer.observe(target);

        return () => observer.disconnect();
    }, [hideNearId]);

    useEffect(() => {
        if (!revealAfterId) return;

        const target = document.getElementById(revealAfterId);
        if (!target) return;

        // Reveal the bar only after the hero CTA has left the top of the
        // viewport (scrolled up and out), so it never overlaps the hero button.
        const observer = new IntersectionObserver(
            ([entry]) => {
                setScrolledPast(entry.boundingClientRect.bottom <= 0);
            },
            { threshold: 0 }
        );
        observer.observe(target);

        return () => observer.disconnect();
    }, [revealAfterId]);

    // With revealAfterId, also require the hero CTA to be scrolled past;
    // otherwise fall back to the original bottom-CTA-only behavior.
    const visible = revealAfterId ? scrolledPast && showByBottom : showByBottom;

    return (
        // The fixed shell is never transformed or transitioned — animating a
        // fixed element directly is what let mobile browsers strand it
        // mid-viewport while re-anchoring bottom:0 during fast scrolls. The
        // slide in/out lives on the inner wrapper instead.
        <div className="pointer-events-none fixed bottom-0 left-0 right-0 z-50 overflow-hidden md:hidden">
            <div
                className={`pointer-events-auto bg-black pb-[env(safe-area-inset-bottom)] transition-transform duration-300 ${
                    visible ? "translate-y-0" : "translate-y-full"
                }${barClassName ? ` ${barClassName}` : ""}`}
            >
                {onCtaClick ? (
                    <button
                        type="button"
                        onClick={onCtaClick}
                        disabled={isCtaLoading}
                        className="dm-mono-font flex w-full items-center justify-center gap-2 py-5 text-sm font-medium uppercase tracking-[0.12em] text-white disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {text}
                        <FaArrowRightLong className="h-4 w-4" />
                    </button>
                ) : (
                    <Link
                        href={href}
                        className="dm-mono-font flex w-full items-center justify-center gap-2 py-5 text-sm font-medium uppercase tracking-[0.12em] text-white"
                    >
                        {text}
                        <FaArrowRightLong className="h-4 w-4" />
                    </Link>
                )}
            </div>
        </div>
    );
}
