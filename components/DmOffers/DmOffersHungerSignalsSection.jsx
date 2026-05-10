"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import CustomImage from "../utils/CustomImage";

const PRODUCT_IMG =
    "https://myrocky.b-cdn.net/WP%20Images/wl-med/_When%20nothing%20else%20worked,%20Rocky%20did_.png";

const FLOAT_MOTION = {
    left: {
        hidden: "opacity-70  md:rotate-[20deg] rotate-[16deg]",
        show: " opacity-100 rotate-0",
    },
    top: {
        hidden: "opacity-70  md:rotate-[20deg] rotate-[16deg]",
        show: "opacity-100 rotate-0",
    },
    right: {
        hidden: "opacity-70  md:rotate-[20deg] rotate-[16deg]",
        show: " opacity-100 rotate-0",
    },
};
function FloatingProduct({ className, motion = "left", staggerMs = 0, show }) {
    const { hidden, show: showClasses } =
        FLOAT_MOTION[motion] ?? FLOAT_MOTION.left;
    return (
        <div
            className={`pointer-events-none absolute select-none ${className ?? ""}`}
            aria-hidden
        >
            <div
                style={{ transitionDelay: show ? `${staggerMs}ms` : "0ms" }}
                className={`relative h-[clamp(96px,25vw,300px)] w-[clamp(72px,18vw,220px)] transition-all duration-[3s] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform ${
                    show ? showClasses : hidden
                }`}
            >
                <CustomImage
                    src={PRODUCT_IMG}
                    alt=""
                    fill
                    className="object-contain drop-shadow-[0_12px_28px_rgba(0,0,0,0.12)]"
                    sizes="(max-width: 768px) 90px, 220px"
                />
            </div>
        </div>
    );
}

export default function DmOffersHungerSignalsSection() {
    const sectionRef = useRef(null);
    const [floatsVisible, setFloatsVisible] = useState(false);

    useEffect(() => {
        let reduceMotion = false;
        try {
            reduceMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
        } catch {
            reduceMotion = false;
        }
        if (reduceMotion) {
            setFloatsVisible(true);
            return;
        }

        const el = sectionRef.current;
        if (!el) return;

        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setFloatsVisible(true);
                    io.disconnect();
                }
            },
            { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
        );

        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div className="bg-gray-100">
            <section
                ref={sectionRef}
                className="relative w-full overflow-hidden rounded-t-[2rem] bg-[#FAF3EF] px-4 pb-0 md:rounded-t-[3.5rem] md:pt-16 "
                style={{ boxShadow: "0 -20px 30px -20px rgba(0, 0, 0, 0.3)" }}
            >
                {/* Decorative product art — single asset, floated like vials */}
                <FloatingProduct
                    motion="left"
                    staggerMs={0}
                    show={floatsVisible}
                    className="left-[-2%] lg:top-[38%] md:top-[60%] sm:top-[66%] top-[72%] z-0  xl:-rotate-[20deg] md:-rotate-[10deg] sm:rotate-[-40deg] rotate-[-10deg] block xl:left-[1%] xl:top-[32%]"
                />
                <FloatingProduct
                    motion="top"
                    staggerMs={110}
                    show={floatsVisible}
                    className="left-[40%] lg:top-[-16%] sm:top-[-10%] top-[-2%] z-0  -translate-x-1/2 xl:rotate-[94deg] rotate-[104deg] block xl:top-[-6%]"
                />
                <FloatingProduct
                    motion="right"
                    staggerMs={220}
                    show={floatsVisible}
                    className="lg:right-[-2%] md:right-[0%] right-[-4%] md:top-[66%] sm:top-[62%] top-[70%] lg:top-[40%] z-0   md:rotate-[35deg] sm:rotate-[90deg] rotate-[35deg] block xl:right-[1%] xl:top-[34%]"
                />

                <div className="relative z-10 mx-auto pt-20 sm:pt-16 xl:pt-32 flex max-w-3xl flex-col items-center gap-6 text-center">
                    <h2 className="headers-font text-4xl sm:text-6xl font-bold text-gray-800 ">
                        We&apos;ll help you turn off hunger signals and feel
                        full faster with GLP-1 treatment.
                    </h2>

                    <p className="font-poppins text-lg sm:text-xl text-gray-600 leading-relaxed my-4">
                        There&apos;s no shame in using medical weight loss to
                        support your health when traditional methods aren&apos;t
                        cutting it. MyRocky pairs you with licensed clinicians
                        dedicated to supporting your weight loss — so
                        you&apos;re never left guessing, stuck waiting, or on
                        your own.
                    </p>

                    <p className="font-poppins text-[26px] font-light text-gray-800/80">
                        Watch what our customers have to say about losing weight
                        with MyRocky:
                    </p>
                </div>

                <div className="relative z-10 mx-auto mt-0 sm:pt-10 pt-6 flex justify-center sm:pb-10 pb-6">
                    <CustomImage
                        src="/dm-offers/dwnarrow.png"
                        alt=""
                        width={300}
                        height={300}
                        className="sm:h-32 h-24 w-auto object-contain"
                        aria-hidden
                    />
                </div>
            </section>
        </div>
    );
}
