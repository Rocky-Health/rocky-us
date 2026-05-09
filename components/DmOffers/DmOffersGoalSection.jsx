"use client";

import Image from "next/image";
import {
    FaCheck,
    FaClipboardList,
    FaStar,
    FaUserFriends,
    FaUserMd,
} from "react-icons/fa";
import { useCallback, useRef, useState } from "react";
import { BiSolidLeftArrow, BiSolidRightArrow } from "react-icons/bi";
import DmOffersFeaturesCtaBlock from "./DmOffersFeaturesCtaBlock";

const BEFORE_SRC = "/dm-offers/results2b.jpg";
const AFTER_SRC = "/dm-offers/results1b.jpg";

function BeforeAfterCompare() {
    const [pct, setPct] = useState(50);
    const dragging = useRef(false);
    const containerRef = useRef(null);

    const setFromClientX = useCallback((clientX) => {
        const el = containerRef.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        const x = Math.min(Math.max(clientX - r.left, 0), r.width);
        setPct(Math.round((x / r.width) * 100));
    }, []);

    const onPointerMove = useCallback(
        (e) => {
            if (!dragging.current) return;
            setFromClientX(e.clientX);
        },
        [setFromClientX],
    );

    const endDrag = useCallback(() => {
        dragging.current = false;
    }, []);

    const onPointerDown = useCallback(
        (e) => {
            dragging.current = true;
            const el = containerRef.current;
            if (el && typeof el.setPointerCapture === "function") {
                try {
                    el.setPointerCapture(e.pointerId);
                } catch {
                    /* ignore */
                }
            }
            setFromClientX(e.clientX);
        },
        [setFromClientX],
    );

    const clipBefore = `inset(0 ${100 - pct}% 0 0)`;

    return (
        <div
            ref={containerRef}
            className="relative aspect-square shrink-0  cursor-ew-resize select-none touch-none   bg-neutral-100 shadow-lg lg:mx-0 w-full max-w-2xl mx-auto before-after-container rounded-3xl overflow-hidden "
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            role="presentation"
        >
            <Image
                src={AFTER_SRC}
                alt="After weight loss transformation"
                fill
                className="pointer-events-none rounded-2xl object-contain w-full h-full"
                sizes="(max-width: 768px) 90vw, 420px"
            />

            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                <Image
                    src={BEFORE_SRC}
                    alt="Before weight loss transformation"
                    fill
                    className="object-contain w-full h-full"
                    sizes="420px"
                    style={{
                        clipPath: clipBefore,
                        WebkitClipPath: clipBefore,
                    }}
                />
            </div>

            <div
                className="pointer-events-none absolute inset-y-0 z-[3] flex w-[3px] items-center bg-white shadow-md"
                style={{ left: `calc(${pct}% - 1.5px)` }}
                aria-hidden
            >
                <span className="absolute left-1/2 top-1/2 flex  -translate-x-1/2 -translate-y-1/2 items-center justify-center text-3xl text-white">
                    <BiSolidLeftArrow className="" />
                    <BiSolidRightArrow className="" />
                </span>
            </div>

            <div className="pointer-events-none absolute left-3 top-3 z-[4] rounded-full bg-white/85 px-2.5 py-1 font-poppins text-sm font-semibold uppercase tracking-wide text-neutral-800 backdrop-blur-sm">
                BEFORE
            </div>
            <div className="pointer-events-none absolute right-3 top-3 z-[4] rounded-full bg-white/85 px-2.5 py-1 font-poppins text-sm font-semibold uppercase tracking-wide text-neutral-800 backdrop-blur-sm">
                AFTER
            </div>
        </div>
    );
}

function WeightShedCalculator() {
    const [weight, setWeight] = useState(288);
    const loss = Math.round(weight * 0.2);

    return (
        <div className="grow w-full rounded-3xl border border-neutral-100 bg-white px-6 py-10 shadow-[0_24px_60px_-32px_rgba(0,0,0,0.18)] lg:w-auto lg:px-10 lg:py-20">
            <h3 className="sm:text-3xl text-2xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-tight sm:text-left text-center">
                Let&apos;s See How much weight can you shed by next spring?
            </h3>
            <hr className="mt-5 border-neutral-200" />

            <p className="mt-8 text-center font-poppins text-sm font-medium text-neutral-600">
                Your current weight:
            </p>
            <div className="mt-3 w-fit mx-auto ">
                <label className="sr-only" htmlFor="dm-weight-input">
                    Current weight in pounds
                </label>
                <input
                    id="dm-weight-input"
                    type="number"
                    min={100}
                    max={400}
                    value={weight}
                    onChange={(e) =>
                        setWeight(
                            Math.min(
                                400,
                                Math.max(100, Number(e.target.value) || 100),
                            ),
                        )
                    }
                    className=" rounded-full border border-neutral-200 bg-white py-4 text-center font-poppins text-3xl tabular-nums text-[#1a1a1a] outline-none transition-shadow focus:border-neutral-300 focus:ring-2 focus:ring-[#5eb9f0]/35 md:text-[2rem]"
                />
                <span className="mt-2 block text-center font-poppins text-xs font-medium uppercase tracking-wide text-neutral-400">
                    lbs
                </span>
            </div>

            <div className="mt-8">
                <input
                    type="range"
                    min={100}
                    max={400}
                    step={1}
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    className="dm-weight-shed-slider h-[10px] w-full"
                    aria-valuemin={100}
                    aria-valuemax={400}
                    aria-valuenow={weight}
                    aria-label="Adjust current weight"
                />
                <div className="mt-2 flex justify-between font-poppins text-xs text-neutral-400">
                    <span>100 lbs</span>
                    <span>400 lbs</span>
                </div>
            </div>

            <div className="w-fit mx-auto">
                <div className="mt-10 inline-flex sm:h-[102px] h-[90px]  min-w-[229px] max-w-full items-center justify-between gap-8 rounded-[57px] bg-[linear-gradient(120deg,#f6ea75_0%,#e7c48a_35%,#cb9468_68%,#b27856_100%)] bg-[length:180%_180%] sm:px-[52px] px-8 py-0 font-poppins text-lg font-bold leading-6 text-[#1a1a1a]">
                    <span className="min-w-0 leading-6 text-end ">
                        You could
                        <span className="block">easily lose:</span>
                    </span>
                    <span className="shrink-0 tabular-nums text-4xl whitespace-break-spaces ">
                        {loss} lbs
                    </span>
                </div>
            </div>
        </div>
    );
}

export default function DmOffersGoalSection({
    getStartedHref = "/glp2-pre-consultation",
    pricingHref = "/glp1-offer-hero",
}) {
    return (
        <section className="w-full bg-gray-100  pb-10 pt-2 md:pb-12">
            <div className="overflow-hidden py-10  md:py-16">
                <h2 className="text-center sm:text-4xl text-3xl md:text-[54px] font-bold tracking-tight text-gray-900 max-w-5xl mx-auto mb-12 !leading-tight">
                    Finally Lose Weight Without Fighting Hunger, Dieting Harder,
                    or Feeling Miserable
                </h2>

                <div className="mb-10 flex flex-col lg:flex-row items-start lg:gap-10 gap-6 lg:max-w-7xl mx-auto ">
                    <BeforeAfterCompare />
                    <WeightShedCalculator />
                </div>

                <DmOffersFeaturesCtaBlock
                    getStartedHref={getStartedHref}
                    pricingHref={pricingHref}
                />
            </div>
        </section>
    );
}
