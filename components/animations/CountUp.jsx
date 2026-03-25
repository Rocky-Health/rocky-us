"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "react-intersection-observer";

const easeOut = (t) => 1 - Math.pow(1 - t, 3);

const CountUp = ({
    end,
    suffix = "",
    prefix = "",
    duration = 2,
    className,
}) => {
    const [displayValue, setDisplayValue] = useState(end);
    const hasAnimated = useRef(false);
    const rafRef = useRef(null);

    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.3,
    });

    useEffect(() => {
        if (!inView || hasAnimated.current) return;
        hasAnimated.current = true;

        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mq.matches) return;

        // Reset to 0 and animate up
        setDisplayValue(0);

        const durationMs = duration * 1000;
        let start = null;

        const tick = (now) => {
            if (!start) start = now;
            const elapsed = now - start;
            const progress = Math.min(elapsed / durationMs, 1);
            setDisplayValue(Math.round(easeOut(progress) * end));

            if (progress < 1) {
                rafRef.current = requestAnimationFrame(tick);
            }
        };

        rafRef.current = requestAnimationFrame(tick);

        return () => {
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [inView, end, duration]);

    return (
        <span ref={ref} className={className}>
            {prefix}
            {displayValue}
            {suffix}
        </span>
    );
};

export default CountUp;
