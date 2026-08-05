"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const DATA = [
    [10, 100],
    [15, 93],
    [19, 93],
    [22, 89],
    [25, 89],
    [31, 69],
    [33, 74],
    [35, 65],
    [38, 61],
    [41, 45],
    [43, 38],
    [47, 33],
    [51, 15],
    [55, 11],
    [60, 4],
    [64, -1],
    [69, -1],
    [73, -3],
    [80, -3],
];

const W = 480;
const H = 260;
const ML = 46;
const MR = 14;
const MT = 14;
const MB = 46;
const CW = W - ML - MR;
const CH = H - MT - MB;

const AGE_MIN = 10;
const AGE_MAX = 80;
const AGE_SPAN = AGE_MAX - AGE_MIN;

const PCT_MIN = -12.5;
const PCT_MAX = 112.5;
const PCT_SPAN = PCT_MAX - PCT_MIN;

const toX = (age) => ML + ((age - AGE_MIN) / AGE_SPAN) * CW;
const toY = (pct) => MT + (1 - (pct - PCT_MIN) / PCT_SPAN) * CH;

function getPctAtAge(age) {
    if (age <= DATA[0][0]) return DATA[0][1];
    if (age >= DATA.at(-1)[0]) return DATA.at(-1)[1];

    for (let i = 0; i < DATA.length - 1; i++) {
        const [a1, p1] = DATA[i];
        const [a2, p2] = DATA[i + 1];
        if (age >= a1 && age <= a2) {
            const t = (age - a1) / (a2 - a1);
            return p1 + t * (p2 - p1);
        }
    }

    return DATA[0][1];
}

function buildPath(data) {
    const pts = data.map(([a, p]) => [toX(a), toY(p)]);
    if (pts.length === 0) return "";
    let d = `M${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
    for (let i = 1; i < pts.length; i++) {
        d += ` L${pts[i][0].toFixed(2)},${pts[i][1].toFixed(2)}`;
    }
    return d;
}

const lineD = buildPath(DATA);
const areaD = `${lineD} L${toX(DATA.at(-1)[0]).toFixed(2)},${toY(PCT_MIN).toFixed(2)} L${toX(DATA[0][0]).toFixed(2)},${toY(PCT_MIN).toFixed(2)} Z`;

const X_TICKS = [20, 30, 40, 50, 60, 70];
const DOT_AGES = X_TICKS;
const Y_LABEL_TICKS = [0, 50, 100];

const C_LINE = "#AE7E56";
const C_LABEL = "#FFFFFF80";
const C_BORDER = "#FFFFFF80";
const C_REF_LINE = "rgba(255, 255, 255, 0.25)";

const DOT_POINTS = DOT_AGES.map((age) => ({
    age,
    x: toX(age),
    y: toY(getPctAtAge(age)),
}));

export default function NadChart() {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });

    return (
        <div
            ref={ref}
            className="w-full h-full rounded-2xl  bg-black/40 p-3 backdrop-blur-sm"
            style={{
                boxShadow: "0px 25px 50px -12px rgba(0, 0, 0, 0.35)",
            }}
        >
            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-full"
                aria-label="NAD+ decline with age"
            >
                <defs>
                    <linearGradient
                        id="nadPlusFill"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                        gradientUnits="objectBoundingBox"
                    >
                        <stop offset="0%" stopColor="rgba(174, 126, 86, 0.8)" />
                        <stop
                            offset="82.65%"
                            stopColor="rgba(174, 126, 86, 0)"
                        />
                    </linearGradient>

                    <clipPath id="nadPlusReveal">
                        <motion.rect
                            x={ML}
                            y={0}
                            height={H}
                            initial={{ width: 0 }}
                            animate={
                                inView ? { width: CW + MR + 2 } : { width: 0 }
                            }
                            transition={{
                                duration: 2.5,
                                ease: [0.22, 0.61, 0.36, 1],
                            }}
                        />
                    </clipPath>
                </defs>

                <line
                    x1={ML}
                    y1={MT + CH}
                    x2={ML + CW}
                    y2={MT + CH}
                    stroke={C_BORDER}
                    strokeWidth="1"
                />
                <line
                    x1={ML}
                    y1={MT}
                    x2={ML}
                    y2={MT + CH}
                    stroke={C_BORDER}
                    strokeWidth="1"
                />

                {Y_LABEL_TICKS.map((pct) => (
                    <line
                        key={`ref-${pct}`}
                        x1={ML}
                        y1={toY(pct)}
                        x2={ML + CW}
                        y2={toY(pct)}
                        stroke={C_REF_LINE}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                    />
                ))}

                <g clipPath="url(#nadPlusReveal)">
                    <path d={areaD} fill="url(#nadPlusFill)" />
                    <path
                        d={lineD}
                        stroke={C_LINE}
                        strokeWidth="1.8"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {DOT_POINTS.map(({ age, x, y }) => (
                        <circle
                            key={`dot-${age}`}
                            cx={x}
                            cy={y}
                            r={4.5}
                            fill="#000000"
                            stroke={C_LINE}
                            strokeWidth="1.5"
                        />
                    ))}
                </g>

                {Y_LABEL_TICKS.map((pct) => (
                    <text
                        key={`yl${pct}`}
                        x={ML - 7}
                        y={toY(pct) + 4}
                        textAnchor="end"
                        fill={C_LABEL}
                        fontSize="11"
                        fontFamily="'DM Mono', monospace"
                    >
                        {pct}%
                    </text>
                ))}

                {X_TICKS.map((age) => (
                    <text
                        key={`xl${age}`}
                        x={toX(age)}
                        y={MT + CH + 19}
                        textAnchor="middle"
                        fill={C_LABEL}
                        fontSize="11"
                        fontFamily="'DM Mono', monospace"
                    >
                        {age}
                    </text>
                ))}

                <text
                    x={ML + CW / 2}
                    y={H - 4}
                    textAnchor="middle"
                    fill={C_LABEL}
                    fontSize="9.5"
                    fontFamily="'DM Mono', monospace"
                    letterSpacing="2.5"
                >
                    AGE (YEARS)
                </text>
            </svg>
        </div>
    );
}
