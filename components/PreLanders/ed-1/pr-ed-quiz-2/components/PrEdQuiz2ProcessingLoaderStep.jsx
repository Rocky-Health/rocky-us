"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

const R = 64;
const CX = 80;
const CY = 80;
const GOLD = "#AE7E56";
const WHITE = "#ffffff";

/** Smooth slowdown at the end — ring uses unrounded progress every frame so it moves fluidly. */
function easeOutQuart(t) {
  return 1 - (1 - t) ** 4;
}

function clamp01(v) {
  if (v <= 0) return 0;
  if (v >= 1) return 1;
  return v;
}

function easeOutQuad(t) {
  return 1 - (1 - t) * (1 - t);
}

export default function PrEdQuiz2ProcessingLoaderStep({
  step,
  destinationHref,
  onAdvance,
}) {
  const durationMs = step.durationMs ?? 4000;
  /** 0–1 eased — ring / percent */
  const [progress01, setProgress01] = useState(0);
  /** 0–1 linear wall clock — tag slots spread evenly across full duration */
  const [linear01, setLinear01] = useState(0);
  const percentDisplay = Math.min(100, Math.round(progress01 * 100));
  const doneRef = useRef(false);
  const onAdvanceRef = useRef(onAdvance);
  const reduceMotion = useReducedMotion();

  useLayoutEffect(() => {
    onAdvanceRef.current = onAdvance;
  }, [onAdvance]);

  const circumference = useMemo(() => 2 * Math.PI * R, []);
  const offset = circumference * (1 - progress01);

  const headline = step.headline || "Processing your information...";
  const checklist = Array.isArray(step.checklist) ? step.checklist : [];

  const instant = Boolean(reduceMotion);

  const headlineVariants = {
    hidden: instant ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: instant
        ? { duration: 0 }
        : { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const ringWrapVariants = {
    hidden: instant ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.94 },
    show: {
      opacity: 1,
      scale: 1,
      transition: instant
        ? { duration: 0 }
        : { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
    },
  };

  useEffect(() => {
    doneRef.current = false;

    const href = destinationHref || "";

    let raf;
    const started = performance.now();

    const frame = (now) => {
      const elapsed = now - started;
      const raw = Math.min(1, elapsed / durationMs);
      const eased = reduceMotion ? raw : easeOutQuart(raw);
      setLinear01(raw);
      setProgress01(eased);

      if (raw < 1) {
        raf = requestAnimationFrame(frame);
      } else if (!doneRef.current) {
        doneRef.current = true;
        setLinear01(1);
        setProgress01(1);
        const cb = onAdvanceRef.current;
        if (typeof cb === "function") {
          cb();
          return;
        }
        if (href && typeof window !== "undefined") {
          window.location.href = href;
        }
      }
    };

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      doneRef.current = false;
    };
  }, [destinationHref, durationMs, reduceMotion]);

  const n = checklist.length;

  return (
    <section
      className="wizard-content relative mx-auto flex w-full max-w-6xl flex-col items-center overflow-hidden px-4 pb-24 pt-10 md:pb-32 md:pt-16"
      aria-busy="true"
      aria-live="polite"
    >
      <motion.div
        className="relative z-[1] mx-auto flex h-[200px] w-[200px] items-center justify-center md:h-[220px] md:w-[220px]"
        variants={ringWrapVariants}
        initial="hidden"
        animate="show"
      >
        <div
          className="absolute inset-0 rounded-full shadow-inner ring-1 ring-[#AE7E56]/10"
          style={{ backgroundColor: WHITE }}
          aria-hidden
        />
        <div
          className="relative flex h-[188px] w-[188px] items-center justify-center md:h-[206px] md:w-[206px]"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percentDisplay}
          aria-label="Processing progress"
        >
          <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160" aria-hidden>
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={GOLD}
              strokeOpacity={0.22}
              strokeWidth="10"
            />
            <circle
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={GOLD}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              style={{ strokeDashoffset: offset }}
            />
          </svg>
          <span
            className="headers-font pointer-events-none absolute text-[2rem] font-bold tabular-nums tracking-tight md:text-[2.35rem]"
            style={{ color: GOLD }}
          >
            {percentDisplay}
            <span className="text-[0.65em] font-bold" style={{ color: GOLD }}>
              %
            </span>
          </span>
        </div>
      </motion.div>

      <motion.h2
        className="headers-font relative z-[1] mt-10 max-w-lg px-4 text-center text-[1.25rem] font-bold leading-snug md:mt-11 md:text-2xl"
        style={{ color: "#0d1728" }}
        variants={headlineVariants}
        initial="hidden"
        animate="show"
      >
        {headline}
      </motion.h2>

      {n > 0 ? (
        <ul className="relative z-[1] mx-auto mt-9 flex w-full max-w-sm flex-col gap-2.5 px-4 md:mt-11">
          {checklist.map((label, index) => {
            const rawReveal = instant
              ? 1
              : clamp01(linear01 * n - index);
            const easedReveal = instant ? 1 : easeOutQuad(rawReveal);
            const translateY = (1 - easedReveal) * 36;

            return (
              <li
                key={`${label}-${index}`}
                className="poppins-font rounded-full border border-white/25 py-3 text-center text-sm font-semibold shadow-sm md:text-[0.95rem]"
                style={{
                  backgroundColor: GOLD,
                  color: WHITE,
                  opacity: easedReveal,
                  transform: `translateY(${translateY}px)`,
                  boxShadow: "0 8px 20px -8px rgba(174, 126, 86, 0.45)",
                  willChange: instant ? undefined : "transform, opacity",
                }}
              >
                {label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </section>
  );
}
