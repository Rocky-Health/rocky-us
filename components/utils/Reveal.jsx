"use client";

import { useInView } from "react-intersection-observer";

/**
 * Lightweight scroll-reveal wrapper — a CSS-only replacement for the ubiquitous
 * framer-motion `motion.div initial={{opacity:0,y:40}} whileInView={{opacity:1,y:0}}`
 * pattern. Uses react-intersection-observer (already a dependency) for the
 * viewport trigger and plain CSS transitions for the animation, so the
 * component that renders it no longer needs to ship framer-motion.
 *
 * The animation is tuned via CSS custom properties so a single `.reveal` rule
 * covers fade-up (default), plain fade (y=0) and scale-in (scale<1).
 *
 * Props:
 *   as        - element/tag to render (default "div")
 *   y         - translateY distance in px before reveal (default 40; 0 = fade only)
 *   scale     - starting scale before reveal (default 1; e.g. 0.95 for scale-in)
 *   delay     - transition delay in seconds (for staggering, e.g. index * 0.15)
 *   duration  - transition duration in seconds (default 0.6)
 *   rootMargin- IntersectionObserver rootMargin (default mirrors the old
 *               framer viewport margin "0px 0px -100px 0px")
 *   once      - reveal once and stop observing (default true)
 */
const Reveal = ({
  as: Tag = "div",
  children,
  className = "",
  y = 40,
  scale = 1,
  delay = 0,
  duration = 0.6,
  rootMargin = "0px 0px -100px 0px",
  once = true,
  style,
  ...rest
}) => {
  const { ref, inView } = useInView({ triggerOnce: once, rootMargin });

  const revealStyle = {
    ...(y !== 40 ? { "--reveal-y": `${y}px` } : null),
    ...(scale !== 1 ? { "--reveal-scale": scale } : null),
    ...(delay ? { "--reveal-delay": `${delay}s` } : null),
    ...(duration !== 0.6 ? { "--reveal-dur": `${duration}s` } : null),
    ...style,
  };

  return (
    <Tag
      ref={ref}
      className={`reveal${inView ? " is-visible" : ""}${className ? ` ${className}` : ""}`}
      style={revealStyle}
      {...rest}
    >
      {children}
    </Tag>
  );
};

export default Reveal;
