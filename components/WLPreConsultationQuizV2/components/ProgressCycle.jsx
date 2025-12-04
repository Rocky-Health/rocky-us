"use client";

import React, { useEffect, useState } from "react";

const ProgressCycle = ({
  percent = 87,
  size = 120,
  strokeWidth = 10,
  showTitles = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  const fontSize = Math.round(size * 0.23);

  // Headings to show one after another
  const headings = [
    { prefix: "Harder", prefixColor: "#AE7E56", rest: "Erections" },
    { prefix: "Long Lasting", prefixColor: "#00B67A", rest: "Sex" },
    { prefix: "More confidence", prefixColor: "#00B67A", rest: "in bed" },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    let showTimer = null;
    let hideTimer = null;

    // display current heading for this long
    const DISPLAY_MS = 1400;
    // hide animation duration before moving to next
    const HIDE_MS = 280;

    // If we're already at the last heading, keep it visible and do nothing
    if (currentIndex >= headings.length - 1) {
      setIsVisible(true);
      return;
    }

    showTimer = setTimeout(() => {
      // hide current
      setIsVisible(false);
      // after hide, advance
      hideTimer = setTimeout(() => {
        setCurrentIndex((i) => Math.min(i + 1, headings.length - 1));
        setIsVisible(true);
      }, HIDE_MS);
    }, DISPLAY_MS);

    return () => {
      if (showTimer) clearTimeout(showTimer);
      if (hideTimer) clearTimeout(hideTimer);
    };
  }, [currentIndex]);

  return (
    <>
      <div className="mb-[60px]">
        {showTitles && (
          <>
            <p className="text-[16px] subheaders-font font-medium leading-[120%] mb-[24px]">
              We’ve got you covered
            </p>
            {/* overlapping headings container — fixed height prevents layout shift while fading */}
            <div style={{ position: "relative", minHeight: 56 }}>
              {headings.map((it, idx) => {
                const active = idx === currentIndex;
                const visible = active && isVisible;
                return (
                  <h2
                    key={idx}
                    className="subheaders-font text-black text-[26px] md:text-[32px] font-[550] leading-[120%] tracking-[-1%] md:tracking-[-2%] whitespace-nowrap"
                    style={{
                      position: "absolute",
                      left: 0,
                      top: 0,
                      width: "100%",
                      margin: 0,
                      opacity: visible ? 1 : 0,
                      transition: "opacity 320ms ease",
                      pointerEvents: visible ? "auto" : "none",
                      transform: "none",
                    }}
                  >
                    <span style={{ color: it.prefixColor }}>{it.prefix}</span>{" "}
                    {it.rest}
                  </h2>
                );
              })}
            </div>
          </>
        )}
      </div>
      <div className="relative mt-2" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
          aria-hidden
        >
          <defs>
            <linearGradient
              id="ed-progress-grad"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#AE7E56" />
              <stop offset="100%" stopColor="#EEDCC9" />
            </linearGradient>
          </defs>

          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#F3F4F6"
            strokeWidth={strokeWidth}
            fill="none"
          />

          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#ed-progress-grad)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            fill="none"
            style={{ transition: "stroke-dashoffset 600ms ease" }}
          />
        </svg>

        {/* Centered percentage */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-[40px] font-semibold text-[#AE7E56]">
            {percent}%
          </div>
        </div>
      </div>
    </>
  );
};

export default ProgressCycle;
