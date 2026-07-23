"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";
import Reveal from "@/components/utils/Reveal";
import CustomImage from "@/components/utils/CustomImage";

function useCountUp({
    from,
    to,
    duration = 1.5,
    delay = 0,
    decimals = 0,
    trigger = true,
}) {
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
                const current = from + diff * eased;
                setValue(Number(current.toFixed(decimals)));
                if (progress < 1) rafRef.current = requestAnimationFrame(tick);
            };

            rafRef.current = requestAnimationFrame(tick);
        }, delay * 1000);

        return () => {
            clearTimeout(timeout);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [trigger, from, to, duration, delay, decimals]);

    return value;
}

const BACKGROUND_IMAGE =
    "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/run.png";

const LongevityNadPlusScienceSection = () => {
    const { ref: sectionRef, inView } = useInView({
        triggerOnce: true,
        rootMargin: "0px 0px -100px 0px",
    });

    const percentValue = useCountUp({
        from: 0,
        to: 50,
        duration: 2.2,
        delay: 0.3,
        trigger: inView,
    });

    return (
        <section
            id="science"
            ref={sectionRef}
            className="w-full bg-black scroll-mt-24"
        >
            <div className="relative min-h-[420px] md:min-h-[640px] overflow-hidden w-full">
                <CustomImage
                    src={BACKGROUND_IMAGE}
                    alt="Runner in motion on a track"
                    fill
                    className="object-cover object-center"
                    sizes="100vw"
                />

                <div className="relative z-10 flex min-h-[inherit] h-full items-center justify-center md:justify-end px-5 py-14 md:py-20">
                    <div className="w-full max-w-[1200px] mx-auto flex justify-center md:justify-end ">
                        <div className="flex max-w-[420px] flex-col items-center text-center md:items-start  gap-2">
                            <Reveal
                                as="p"
                                y={20}
                                className="helvetica-display-font text-xs md:text-sm font-normal uppercase text-white mx-auto"
                            >
                                The Science of Decline
                            </Reveal>

                            <Reveal
                                as="p"
                                y={20}
                                delay={0.15}
                                className="helvetica-display-font text-[120px] md:text-[160px] font-medium leading-none text-white text-center mx-auto my-4"
                                style={{
                                    textShadow:
                                        "0px 0px 40px rgba(255, 255, 255, 0.1)",
                                }}
                            >
                                {percentValue}%
                            </Reveal>

                            <Reveal
                                as="p"
                                y={20}
                                delay={0.3}
                                className="helvetica-text-font text-lg  leading-[140%] text-white text-center max-w-[320px] mx-auto"
                            >
                                Your NAD+ levels drop by{" "}
                                <span className="font-medium">half</span> between
                                age 30 and 60.
                            </Reveal>

                            <Reveal
                                as="p"
                                y={20}
                                delay={0.45}
                                className="helvetica-text-font text-lg  leading-[140%] text-white/85 max-w-[360px] mx-auto"
                            >
                                That's when fatigue sets in, focus slips,
                                recovery slows, and aging accelerates.
                            </Reveal>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LongevityNadPlusScienceSection;
