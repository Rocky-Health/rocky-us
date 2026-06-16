"use client";

import { useState, useEffect, useRef } from "react";

const TYPING_SPEED_MS = 120;
const DELETING_SPEED_MS = 120;
const HOLD_AFTER_TYPING_MS = 1200;

const HeroAnimatedHeading = ({
    staticText = "",
    words = [],
    accentColor = "#AE7E56",
    intervalMs = 3000,
    pauseMs = 500,
    className = "",
}) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    // Render the FIRST WORD FULLY at first paint and gate the type/delete loop
    // on first interaction. Chrome logs a new (later) LCP each time the
    // animation paints longer text, so an idle lab run measured LCP at the
    // moment the longest word finished typing (~8.4s). With the first word
    // complete up front and the loop gated, LCP locks at first paint while
    // real users still get the animation the instant they move/scroll/touch.
    const [displayedLength, setDisplayedLength] = useState(
        () => (words[0] ?? "").length
    );
    const [phase, setPhase] = useState("holding"); // 'typing' | 'holding' | 'deleting'
    const [started, setStarted] = useState(false);
    const currentWord = words[currentWordIndex] ?? "";
    const tickTimeoutRef = useRef(null);
    const holdTimeoutRef = useRef(null);

    useEffect(() => {
        const events = ["pointerdown", "touchstart", "keydown", "scroll", "mousemove"];
        const start = () => {
            setStarted(true);
            setPhase("deleting");
            events.forEach((ev) => window.removeEventListener(ev, start, true));
        };
        events.forEach((ev) =>
            window.addEventListener(ev, start, {
                passive: true,
                capture: true,
                once: true,
            })
        );
        return () =>
            events.forEach((ev) => window.removeEventListener(ev, start, true));
    }, []);

    useEffect(() => {
        if (words.length === 0 || !started) return;

        const clearTickTimer = () => {
            if (tickTimeoutRef.current) {
                clearTimeout(tickTimeoutRef.current);
                tickTimeoutRef.current = null;
            }
        };

        if (phase === "typing") {
            if (displayedLength < currentWord.length) {
                tickTimeoutRef.current = setTimeout(() => {
                    setDisplayedLength((prev) => prev + 1);
                }, TYPING_SPEED_MS);
            } else if (currentWord.length > 0) {
                setPhase("holding");
                if (holdTimeoutRef.current)
                    clearTimeout(holdTimeoutRef.current);
                holdTimeoutRef.current = setTimeout(() => {
                    holdTimeoutRef.current = null;
                    setPhase("deleting");
                }, HOLD_AFTER_TYPING_MS);
            }
        } else if (phase === "deleting") {
            if (displayedLength > 0) {
                tickTimeoutRef.current = setTimeout(() => {
                    setDisplayedLength((prev) => prev - 1);
                }, DELETING_SPEED_MS);
            } else {
                setCurrentWordIndex((prev) => (prev + 1) % words.length);
                setPhase("typing");
            }
        }

        return clearTickTimer;
    }, [phase, displayedLength, currentWord, currentWord.length, words.length, started]);

    useEffect(() => {
        return () => {
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
        };
    }, []);

    const displayedText = currentWord.slice(0, displayedLength);
    // Reserve the widest word's space so the heading never re-wraps while
    // typing/deleting. Without this, every wrap shifted all content below the
    // h1 — Lighthouse measured intermittent CLS spikes up to ~0.8.
    const longestWord = words.reduce(
        (a, b) => (b.length > a.length ? b : a),
        ""
    );

    return (
        <h1
            className={`subheaders-font font-[400] md:text-[50px] text-[40px]  leading-[100%] tracking-[1px] max-w-[500px] ${className}`}
        >
            {staticText}
            <span
                className="relative inline-block font-[600] subheaders-font"
                style={{ color: accentColor }}
            >
                {/* invisible spacer keeps the line box constant */}
                <span className="invisible" aria-hidden>
                    {longestWord}
                </span>
                <span className="absolute inset-y-0 left-0 whitespace-nowrap">
                    {displayedText}
                    <span
                        className="inline-block w-[2px] h-[0.9em] align-middle ml-[2px] bg-current animate-cursor-blink"
                        style={{ color: accentColor }}
                        aria-hidden
                    />
                </span>
            </span>
        </h1>
    );
};

export default HeroAnimatedHeading;
