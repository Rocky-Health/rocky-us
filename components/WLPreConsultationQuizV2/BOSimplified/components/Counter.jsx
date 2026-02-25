"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";

// Separate Counter component for BO2/BO3 simplified flow
// This is completely independent from the default WL flow Counter
const Counter = ({
    seconds = 3,
    texts = [],
    title,
    onAction,
    nextPopup = "YourWeightPopup",
}) => {
    const [visibleTextIndex, setVisibleTextIndex] = useState(0);
    const [count, setCount] = useState(seconds);
    const [progress, setProgress] = useState(0);
    const animationFrameRef = useRef(null);
    const startTimeRef = useRef(null);

    // Use requestAnimationFrame for smoother animations in Safari
    useEffect(() => {
        startTimeRef.current = Date.now();

        const animate = () => {
            const elapsed = (Date.now() - startTimeRef.current) / 1000;
            const remaining = Math.max(0, seconds - elapsed);
            const newCount = Math.ceil(remaining);

            setCount(newCount);

            // Calculate smooth progress
            const newProgress = Math.min(1, elapsed / seconds);
            setProgress(newProgress);

            if (remaining > 0) {
                animationFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [seconds]);

    useEffect(() => {
        if (count <= 0 && typeof onAction === "function" && nextPopup) {
            const timeout = setTimeout(() => {
                onAction("showPopup", nextPopup);
            }, 500); // 500ms delay
            return () => clearTimeout(timeout);
        }
    }, [count, onAction, nextPopup]);

    useEffect(() => {
        if (!texts || texts.length === 0) return;
        if (visibleTextIndex < texts.length - 1) {
            const interval = (seconds * 1000) / texts.length;
            const textTimer = setTimeout(() => {
                setVisibleTextIndex((prev) => prev + 1);
            }, interval);
            return () => clearTimeout(textTimer);
        }
    }, [visibleTextIndex, texts, seconds]);

    const size = 150;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    // Memoize progress calculation to avoid unnecessary recalculations
    const strokeDashoffset = useMemo(() => {
        return circumference - progress * circumference;
    }, [progress, circumference]);

    return (
        <div>
            <div className="flex justify-center">
                <div
                    className="relative w-[150px] h-[150px] flex justify-center items-center mb-[72px]"
                    style={{
                        willChange: "transform",
                        transform: "translateZ(0)",
                        backfaceVisibility: "hidden",
                    }}
                >
                    <svg
                        width={size}
                        height={size}
                        className="absolute top-0 left-0"
                        style={{
                            willChange: "transform",
                            transform: "translateZ(0)",
                            shapeRendering: "geometricPrecision",
                        }}
                    >
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#F0E6DA"
                            strokeWidth={strokeWidth}
                            fill="none"
                            style={{
                                shapeRendering: "geometricPrecision",
                            }}
                        />
                        <circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="#AE7E56"
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                            style={{
                                willChange: "stroke-dashoffset",
                                transform: "translateZ(0)",
                                backfaceVisibility: "hidden",
                                shapeRendering: "geometricPrecision",
                                // Remove CSS transition - let requestAnimationFrame handle smoothness
                            }}
                        />
                    </svg>
                    {count > 0 ? (
                        <span
                            className="relative text-[#AE7E56] text-[32px] z-10"
                            style={{
                                willChange: "transform",
                                transform: "translateZ(0)",
                            }}
                        >
                            {count}
                        </span>
                    ) : (
                        <span
                            className="absolute inset-0 flex items-center justify-center z-10"
                            style={{
                                willChange: "transform",
                                transform: "translateZ(0)",
                            }}
                        >
                            <svg
                                width={size}
                                height={size}
                                viewBox={`0 0 ${size} ${size}`}
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                style={{
                                    willChange: "transform",
                                    transform: "translateZ(0)",
                                    shapeRendering: "geometricPrecision",
                                }}
                            >
                                <path
                                    d={`M${size * 0.32} ${size * 0.48} L${size * 0.48} ${
                                        size * 0.64
                                    } L${size * 0.68} ${size * 0.32}`}
                                    stroke="#AE7E56"
                                    strokeWidth="8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </span>
                    )}
                </div>
            </div>
            {title && (
                <p className="headers-font font-medium text-[26px] leading-[120%] mb-[16px]">
                    {title}
                </p>
            )}

            {texts && texts.length > 0 && (
                <>
                    {texts.map((item, index) => (
                        <p
                            key={index}
                            className={`text-[16px] leading-[140%] mb-[4px] text-[#AE7E56] transition-opacity duration-700 ${
                                index <= visibleTextIndex
                                    ? "opacity-100"
                                    : "opacity-0"
                            }`}
                            style={{
                                transition: "opacity 0.7s",
                                willChange: "opacity",
                                transform: "translateZ(0)",
                            }}
                        >
                            {item}
                        </p>
                    ))}
                </>
            )}

            <p className="text-[10px] text-[#00000059] leading-[140%] mt-[40px]">
                We respect your privacy. All of your information is securely
                stored on our HIPAA Compliant server.
            </p>
        </div>
    );
};

export default Counter;
