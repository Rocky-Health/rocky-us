"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

const W = 480;
const H = 300;
const ML = 54;
const MR = 24;
const MT = 24;
const MB = 44;
const CW = W - ML - MR;
const CH = H - MT - MB;

const AGE_MIN = 20;
const AGE_MAX = 70;
const AGE_SPAN = AGE_MAX - AGE_MIN;

const PCT_MIN = 0;
const PCT_MAX = 100;
const PCT_SPAN = PCT_MAX - PCT_MIN;

const BRANCH_AGE = 40;
const BRANCH_PCT = 47;
const CURVE_TENSION = 6;

// Collinear points through the branch keep the white line smooth at the split.
const FULL_NATURAL_CURVE = [
    [20, 97],
    [30, 86],
    [36, 68],
    [39, 52],
    [BRANCH_AGE, BRANCH_PCT],
    [43, 41],
    [50, 30],
    [58, 20],
    [66, 14],
    [70, 12],
];

// Continues the white tangent through the branch, then curves upward.
const TREATMENT_TAIL = [
    [41, 48],
    [44, 53],
    [50, 63],
    [58, 73],
    [66, 78],
    [70, 79],
];

const X_TICKS = [20, 30, 40, 50, 60, 70];
const Y_GRID = [0, 25, 50, 75];

const C_WHITE = "rgba(255,255,255,0.95)";
const C_BRONZE = "#AE7E56";
const C_GRID = "rgba(255,255,255,0.18)";
const C_LABEL = "rgba(255,255,255,1)";

const toX = (age) => ML + ((age - AGE_MIN) / AGE_SPAN) * CW;
const toY = (pct) => MT + (1 - (pct - PCT_MIN) / PCT_SPAN) * CH;

function toPoints(data) {
    return data.map(([age, pct]) => [toX(age), toY(pct)]);
}

function getSegmentControlPoints(pts, i, tension = CURVE_TENSION) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];

    return {
        p1,
        p2,
        cp1x: p1[0] + (p2[0] - p0[0]) / tension,
        cp1y: p1[1] + (p2[1] - p0[1]) / tension,
        cp2x: p2[0] - (p3[0] - p1[0]) / tension,
        cp2y: p2[1] - (p3[1] - p1[1]) / tension,
    };
}

function cubicPoint(t, x0, y0, x1, y1, x2, y2, x3, y3) {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return {
        x: uuu * x0 + 3 * uu * t * x1 + 3 * u * tt * x2 + ttt * x3,
        y: uuu * y0 + 3 * uu * t * y1 + 3 * u * tt * y2 + ttt * y3,
    };
}

function getSmoothPathPointAtAge(data, age) {
    const pts = toPoints(data);
    const targetX = toX(age);

    for (let i = 0; i < pts.length - 1; i++) {
        const { p1, p2, cp1x, cp1y, cp2x, cp2y } = getSegmentControlPoints(
            pts,
            i,
        );
        const minX = Math.min(p1[0], p2[0]) - 0.5;
        const maxX = Math.max(p1[0], p2[0]) + 0.5;

        if (targetX < minX || targetX > maxX) continue;

        let lo = 0;
        let hi = 1;

        for (let step = 0; step < 24; step++) {
            const mid = (lo + hi) / 2;
            const pt = cubicPoint(
                mid,
                p1[0],
                p1[1],
                cp1x,
                cp1y,
                cp2x,
                cp2y,
                p2[0],
                p2[1],
            );

            if (pt.x < targetX) lo = mid;
            else hi = mid;
        }

        const t = (lo + hi) / 2;
        return cubicPoint(
            t,
            p1[0],
            p1[1],
            cp1x,
            cp1y,
            cp2x,
            cp2y,
            p2[0],
            p2[1],
        );
    }

    return { x: toX(age), y: toY(BRANCH_PCT) };
}

const BRANCH_POINT = getSmoothPathPointAtAge(FULL_NATURAL_CURVE, BRANCH_AGE);
BRANCH_POINT.x = toX(BRANCH_AGE);

function appendSmoothSegments(d, pts, tension = CURVE_TENSION) {
    for (let i = 0; i < pts.length - 1; i++) {
        const { p1, p2, cp1x, cp1y, cp2x, cp2y } = getSegmentControlPoints(
            pts,
            i,
            tension,
        );

        d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
    }

    return d;
}

function buildSmoothPath(data, tension = CURVE_TENSION) {
    const pts = toPoints(data);
    if (pts.length < 2) return "";

    let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
    return appendSmoothSegments(d, pts, tension);
}

function buildTreatmentPath(naturalCurve, tailData, tension = CURVE_TENSION) {
    const branchIdx = naturalCurve.findIndex(([age]) => age === BRANCH_AGE);
    const prev = naturalCurve[Math.max(branchIdx - 1, 0)];
    const prevPt = toPoints([prev])[0];
    const branchPt = BRANCH_POINT;
    const tailPts = toPoints([[BRANCH_AGE, BRANCH_PCT], ...tailData]);

    const tx = branchPt.x - prevPt[0];
    const ty = branchPt.y - prevPt[1];
    const tangentLen = Math.hypot(tx, ty) || 1;

    let d = `M${branchPt.x.toFixed(2)},${branchPt.y.toFixed(2)}`;

    if (tailPts.length < 2) return d;

    const next = tailPts[1];
    const after = tailPts[2] ?? next;

    const cp1x = branchPt.x + (tx / tangentLen) * (tangentLen * 0.42);
    const cp1y = branchPt.y + (ty / tangentLen) * (tangentLen * 0.42);
    const cp2x = next[0] - (after[0] - branchPt.x) / tension;
    const cp2y = next[1] - (after[1] - branchPt.y) / tension;

    d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${next[0].toFixed(2)},${next[1].toFixed(2)}`;

    if (tailPts.length > 2) {
        d = appendSmoothSegments(d, tailPts.slice(1), tension);
    }

    return d;
}

function buildTreatmentBandPath(naturalCurve, tailData) {
    let d = buildTreatmentPath(naturalCurve, tailData);

    const bottomRev = toPoints(
        [...naturalCurve.filter(([age]) => age >= BRANCH_AGE)].reverse(),
    );
    d += ` L${bottomRev[0][0].toFixed(2)},${bottomRev[0][1].toFixed(2)}`;
    d = appendSmoothSegments(d, bottomRev);

    return `${d} Z`;
}

function buildAreaPath(lineData, closeAgeStart, closeAgeEnd) {
    const lineD = buildSmoothPath(lineData);
    return `${lineD} L${toX(closeAgeEnd).toFixed(2)},${toY(PCT_MIN).toFixed(2)} L${toX(closeAgeStart).toFixed(2)},${toY(PCT_MIN).toFixed(2)} Z`;
}

const naturalLineD = buildSmoothPath(FULL_NATURAL_CURVE);
const naturalAreaD = buildAreaPath(FULL_NATURAL_CURVE, 20, 70);
const treatmentLineD = buildTreatmentPath(FULL_NATURAL_CURVE, TREATMENT_TAIL);
const treatmentBandD = buildTreatmentBandPath(
    FULL_NATURAL_CURVE,
    TREATMENT_TAIL,
);

function ChartDot({ cx, cy, color = "white", visible = true }) {
    return (
        <motion.circle
            cx={cx}
            cy={cy}
            r={5}
            fill={color === "bronze" ? C_BRONZE : C_WHITE}
            initial={{ opacity: 0, scale: 0 }}
            animate={
                visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }
            }
            transition={{ duration: 0.35, delay: 2.2 }}
        />
    );
}

function useCountUp({ from, to, duration = 1.5, delay = 0, trigger = true }) {
    const [value, setValue] = useState(from);
    const rafRef = useRef(null);

    useEffect(() => {
        if (!trigger) {
            setValue(from);
            return;
        }

        const timeout = setTimeout(() => {
            const start = performance.now();
            const diff = to - from;

            const tick = (now) => {
                const elapsed = now - start;
                const progress = Math.min(elapsed / (duration * 1000), 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                setValue(Math.round(from + diff * eased));
                if (progress < 1) rafRef.current = requestAnimationFrame(tick);
            };

            rafRef.current = requestAnimationFrame(tick);
        }, delay * 1000);

        return () => {
            clearTimeout(timeout);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [trigger, from, to, duration, delay]);

    return value;
}

export default function NadDeclineTreatmentChart({ treatmentLabel = "With NAD+ support", naturalLabel = "Natural decline with age" }) {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });
    const percentValue = useCountUp({
        from: 0,
        to: 50,
        duration: 2.2,
        delay: 0.2,
        trigger: inView,
    });

    return (
        <div
            ref={ref}
            className="w-full rounded-2xl bg-black/45 backdrop-blur-sm md:p-8 p-4"
            style={{
                boxShadow: "0px 25px 50px -12px rgba(0, 0, 0, 0.45)",
            }}
        >
            <div className="flex items-start justify-between gap-6 mb-5">
                <p className="helvetica-text-font text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.28px] md:tracking-[-0.32px] text-white">
                    NAD+ levels{" "}
                    <span className="font-medium">decrease 50%</span>{" "}
                    <br className="hidden md:block" /> by your 40s.
                </p>
                <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center justify-center w-10 h-10 rounded-md bg-white/20 border border-white">
                        <svg
                            width="30"
                            height="30"
                            viewBox="0 0 14 14"
                            fill="none"
                            aria-hidden
                        >
                            <path
                                d="M7 3v8M7 11l-3-3M7 11l3-3"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <span className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-white">
                        {percentValue}%
                    </span>
                </div>
            </div>

            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-auto"
                aria-label="NAD+ decline with age and stabilization with treatment"
            >
                <defs>
                    <linearGradient
                        id="nadEarlyWhiteFill"
                        x1={toX(20)}
                        y1={MT}
                        x2={toX(20)}
                        y2={MT + CH}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop offset="0%" stopColor="rgba(255,255,255,0.32)" />
                        <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                    </linearGradient>
                    <linearGradient
                        id="nadTreatmentBandFill"
                        x1={toX(BRANCH_AGE)}
                        y1={MT}
                        x2={toX(BRANCH_AGE)}
                        y2={MT + CH}
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop
                            offset="0%"
                            stopColor="rgba(174, 126, 86, 0.65)"
                        />
                        <stop
                            offset="100%"
                            stopColor="rgba(174, 126, 86, 0.06)"
                        />
                    </linearGradient>
                    <clipPath id="nadDeclineReveal">
                        <motion.rect
                            x={ML - 8}
                            y={0}
                            height={H}
                            initial={{ width: 0 }}
                            animate={
                                inView ? { width: CW + MR + 10 } : { width: 0 }
                            }
                            transition={{
                                duration: 2.5,
                                ease: [0.22, 0.61, 0.36, 1],
                            }}
                        />
                    </clipPath>
                </defs>

                <text
                    x={14}
                    y={MT + CH / 1.8}
                    textAnchor="middle"
                    fill={C_LABEL}
                    fontSize="16"
                    fontFamily="'DM Mono', monospace"
                    letterSpacing="1.2"
                    transform={`rotate(-90, 14, ${MT + CH / 2})`}
                >
                    NAD+ Levels
                </text>

                {Y_GRID.map((pct) => (
                    <line
                        key={`grid-${pct}`}
                        x1={ML}
                        y1={toY(pct)}
                        x2={ML + CW}
                        y2={toY(pct)}
                        stroke={C_GRID}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                ))}

                <g clipPath="url(#nadDeclineReveal)">
                    <path d={naturalAreaD} fill="url(#nadEarlyWhiteFill)" />
                    <path
                        d={treatmentBandD}
                        fill="url(#nadTreatmentBandFill)"
                    />
                    <path
                        d={naturalLineD}
                        stroke={C_WHITE}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d={treatmentLineD}
                        stroke={C_BRONZE}
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </g>

                <ChartDot
                    cx={toX(20)}
                    cy={toY(97)}
                    color="white"
                    visible={inView}
                />
                <ChartDot
                    cx={BRANCH_POINT.x}
                    cy={BRANCH_POINT.y}
                    color="bronze"
                    visible={inView}
                />
                <ChartDot
                    cx={toX(70)}
                    cy={toY(12)}
                    color="white"
                    visible={inView}
                />
                <ChartDot
                    cx={toX(70)}
                    cy={toY(79)}
                    color="bronze"
                    visible={inView}
                />

                {X_TICKS.map((age) => (
                    <text
                        key={`xl-${age}`}
                        x={toX(age)}
                        y={MT + CH + 24}
                        textAnchor="middle"
                        fill={C_LABEL}
                        fontSize="14"
                        fontFamily="'DM Mono', monospace"
                    >
                        {age}
                    </text>
                ))}

                <text
                    x={toX(50)}
                    y={toY(76) - 18}
                    textAnchor="start"
                    fill={C_LABEL}
                    fontSize="13"
                    fontFamily="monospace"
                >
                    {treatmentLabel}
                </text>
                <text
                    x={toX(50)}
                    y={toY(12) + 20}
                    textAnchor="start"
                    fill={C_LABEL}
                    fontSize="13"
                    fontFamily="monospace"
                >
                    {naturalLabel}
                </text>
            </svg>

            <p className="helvetica-text-font text-[11px] md:text-xs text-white/60 leading-[140%] mt-3 md:mt-4">
                Illustrative chart based on published research. Individual
                results may vary.
            </p>
        </div>
    );
}
