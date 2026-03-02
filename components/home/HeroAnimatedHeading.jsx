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
    const [displayedLength, setDisplayedLength] = useState(0);
    const [phase, setPhase] = useState("typing"); // 'typing' | 'holding' | 'deleting'
    const currentWord = words[currentWordIndex] ?? "";
    const tickTimeoutRef = useRef(null);
    const holdTimeoutRef = useRef(null);

    useEffect(() => {
        if (words.length === 0) return;

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
    }, [phase, displayedLength, currentWord, currentWord.length, words.length]);

    useEffect(() => {
        return () => {
            if (holdTimeoutRef.current) clearTimeout(holdTimeoutRef.current);
        };
    }, []);

    const displayedText = currentWord.slice(0, displayedLength);

    return (
        <h1
            className={`subheaders-font font-[400] md:text-[50px] text-[40px]  leading-[100%] tracking-[1px] max-w-[500px] ${className}`}
        >
            {staticText}
            <span
                className="inline-block font-[600] subheaders-font"
                style={{ color: accentColor }}
            >
                {displayedText}
                <span
                    className="inline-block w-[2px] h-[0.9em] align-middle ml-[2px] bg-current animate-cursor-blink"
                    style={{ color: accentColor }}
                    aria-hidden
                />
            </span>
        </h1>
    );
};

export default HeroAnimatedHeading;
