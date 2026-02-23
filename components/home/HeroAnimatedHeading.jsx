"use client";

import { useState, useEffect } from "react";

const HeroAnimatedHeading = ({
    staticText = "",
    words = [],
    accentColor = "#AE7E56",
    intervalMs = 3000,
    pauseMs = 500,
    className = "",
}) => {
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(false);
            setTimeout(() => {
                setCurrentWordIndex(
                    (prevIndex) => (prevIndex + 1) % words.length,
                );
                setIsAnimating(true);
            }, pauseMs);
        }, intervalMs);

        return () => clearInterval(interval);
    }, [words.length, intervalMs, pauseMs]);

    return (
        <h1
            className={`subheaders-font font-[400] md:text-[50px] text-[40px]  leading-[100%] tracking-[-3%] max-w-[500px] ${className}`}
        >
            {staticText}
            <span
                className={`inline-block transition-opacity duration-300 font-[600] ${
                    isAnimating ? "opacity-100" : "opacity-0"
                }`}
                style={{ color: accentColor }}
            >
                {words[currentWordIndex]}
            </span>
        </h1>
    );
};

export default HeroAnimatedHeading;
