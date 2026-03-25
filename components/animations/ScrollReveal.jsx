"use client";

import { useInView } from "react-intersection-observer";

const ScrollReveal = ({
    children,
    delay = 0,
    className,
    threshold = 0.15,
}) => {
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold,
    });

    return (
        <div
            ref={ref}
            className={`${className || ""} ${inView ? "scroll-reveal-animate" : ""}`}
            style={delay && inView ? { animationDelay: `${delay}s` } : undefined}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
