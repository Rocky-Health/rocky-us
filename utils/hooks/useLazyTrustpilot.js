"use client";

import { useEffect, useRef, useState } from "react";
import { loadTrustpilotScript } from "@/utils/trustpilot";
import { logger } from "@/utils/devLogger";

// Matches both the standard widget class and the `-img` rating variant used by
// the shared <TrustpilotWidget> component.
const WIDGET_SELECTOR = ".trustpilot-widget, .trustpilot-widget-img";

/**
 * Defer Trustpilot widget loading until it scrolls into view.
 *
 * Attach the returned `containerRef` to the element that wraps your
 * Trustpilot widget markup. The bootstrap script is only requested once that
 * element nears the viewport (via IntersectionObserver); on intersection every
 * widget inside the container is initialised. This keeps Trustpilot off the
 * initial page load while leaving the widgets fully functional for users who
 * scroll.
 *
 * @param {Object}  [options]
 * @param {string}  [options.rootMargin="300px"] Pre-load margin around viewport.
 * @param {number}  [options.timeout=8000]       ms to wait before flagging error.
 * @param {string}  [options.selector]           Override the widget selector.
 * @returns {{ containerRef: React.RefObject, isLoaded: boolean, hasError: boolean }}
 */
export function useLazyTrustpilot({
  rootMargin = "300px",
  timeout = 8000,
  selector = WIDGET_SELECTOR,
} = {}) {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    let cancelled = false;
    let timer = null;

    const init = () => {
      timer = setTimeout(() => {
        if (!cancelled && !window.Trustpilot) setHasError(true);
      }, timeout);

      loadTrustpilotScript()
        .then(() => {
          if (cancelled) return;
          clearTimeout(timer);
          if (!window.Trustpilot) {
            setHasError(true);
            return;
          }
          el.querySelectorAll(selector).forEach((widget) => {
            try {
              window.Trustpilot.loadFromElement(widget);
            } catch (error) {
              logger.error("Error loading TrustPilot widget:", error);
            }
          });
          setIsLoaded(true);
        })
        .catch((error) => {
          if (cancelled) return;
          clearTimeout(timer);
          logger.error("Failed to load TrustPilot script:", error);
          setHasError(true);
        });
    };

    // No IntersectionObserver (old browser / test env) — load immediately.
    if (!("IntersectionObserver" in window)) {
      init();
      return () => {
        cancelled = true;
        if (timer) clearTimeout(timer);
      };
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          obs.disconnect();
          init();
        }
      },
      { rootMargin }
    );
    observer.observe(el);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, [rootMargin, timeout, selector]);

  return { containerRef, isLoaded, hasError };
}
