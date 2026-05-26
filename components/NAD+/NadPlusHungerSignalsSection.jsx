"use client";

import { useEffect, useRef, useState } from "react";
import CustomImage from "@/components/utils/CustomImage";
import { NAD_PLUS_HUNGER_SIGNALS_CONTENT } from "./nadPlusHungerSignalsData";

const PRODUCT_IMG =
    "https://myrocky.b-cdn.net/WP%20Images/wl-med/_When%20nothing%20else%20worked,%20Rocky%20did_.png";

const FLOAT_MOTION = {
    left: {
        hidden: "opacity-60 md:rotate-[20deg] rotate-[16deg]",
        show: "opacity-90 rotate-0",
    },
    top: {
        hidden: "opacity-60 md:rotate-[20deg] rotate-[16deg]",
        show: "opacity-90 rotate-0",
    },
    right: {
        hidden: "opacity-60 md:rotate-[20deg] rotate-[16deg]",
        show: "opacity-90 rotate-0",
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
                    className="object-contain drop-shadow-[0_12px_28px_rgba(174,126,86,0.15)]"
                    sizes="(max-width: 768px) 90px, 220px"
                />
            </div>
        </div>
    );
}

export default function NadPlusHungerSignalsSection({
    content = NAD_PLUS_HUNGER_SIGNALS_CONTENT,
}) {
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
        <section
            ref={sectionRef}
            className="relative w-full overflow-hidden bg-[#F5F4EF] px-4 pb-6 pt-8 md:px-6 md:pb-10 md:pt-10"
        >
            <FloatingProduct
                motion="left"
                staggerMs={0}
                show={floatsVisible}
                className="left-[-2%] top-[72%] z-0 block rotate-[-10deg] sm:top-[66%] sm:rotate-[-40deg] md:top-[60%] md:-rotate-[10deg] lg:top-[38%] xl:left-[1%] xl:top-[32%] xl:-rotate-[20deg]"
            />
            <FloatingProduct
                motion="top"
                staggerMs={110}
                show={floatsVisible}
                className="left-[40%] top-[-2%] z-0 block -translate-x-1/2 rotate-[104deg] sm:top-[-10%] lg:top-[-16%] xl:top-[-6%] xl:rotate-[94deg]"
            />
            <FloatingProduct
                motion="right"
                staggerMs={220}
                show={floatsVisible}
                className="right-[-4%] top-[70%] z-0 block rotate-[35deg] sm:top-[62%] sm:rotate-[90deg] md:right-[0%] md:top-[66%] md:rotate-[35deg] lg:right-[-2%] lg:top-[40%] xl:right-[1%] xl:top-[34%]"
            />

            <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-6 pt-16 text-center sm:gap-8 sm:pt-20 md:pt-24">
                <h2 className="pb-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                    {content.headline}
                </h2>

                <p className="text-center text-lg font-light leading-relaxed text-gray-600">
                    {content.body}
                </p>

                <p className="font-poppins text-xl font-semibold leading-snug text-gray-900 sm:text-2xl">
                    {content.testimonialsIntro}
                </p>
            </div>

            <div className="relative z-10 mx-auto flex justify-center pb-4 pt-6 sm:pb-8 sm:pt-10">
                <CustomImage
                    src="/dm-offers/dwnarrow.png"
                    alt=""
                    width={300}
                    height={300}
                    className="h-24 w-auto object-contain sm:h-32"
                    aria-hidden
                />
            </div>
        </section>
    );
}
