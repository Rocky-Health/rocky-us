/**
 * Generic conversion-funnel event emitter for Microsoft Clarity smart events.
 *
 * Mirrors the multi-target pattern in questionnaireTracking.js: every event is
 * pushed to dataLayer (GTM / GA4), fired as a named Clarity event (with optional
 * custom dimensions set first), and dispatched as a CustomEvent for any other
 * listener. Each target is independently guarded so a failure in one never
 * prevents the others -- tracking must never break the funnel.
 *
 * Pure, SSR-safe, no React. Used by the WL/GLP-1 funnel instrumentation
 * (quiz -> plan selection -> checkout) per TK-584 / TK-585 / TK-586.
 */

const FUNNEL_DEBUG =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_QS_TRACK_DEBUG === "1";

/**
 * Emit a named funnel event to every analytics target.
 *
 * @param {string} eventName  Snake_case event name (becomes the Clarity smart
 *                            event name and the dataLayer `event` value).
 * @param {{ clarity?: Record<string, *>, data?: Record<string, *> }} [opts]
 *        `clarity` -- custom dimensions set via clarity("set", key, value)
 *        before the event fires (so they segment the smart event in the
 *        Clarity dashboard). `data` -- extra fields pushed to dataLayer and
 *        included on the CustomEvent detail.
 */
export function trackFunnelEvent(eventName, { clarity = {}, data = {} } = {}) {
  if (typeof window === "undefined" || !eventName) return;

  if (FUNNEL_DEBUG) {
    try {
      console.info("[FUNNEL_TRACK]", eventName, { clarity, data });
    } catch (_) {}
  }

  // 1. dataLayer (GTM / GA4)
  try {
    if (window.dataLayer) {
      window.dataLayer.push({ event: eventName, ...data });
    }
  } catch (_) {}

  // 2. Clarity -- set custom dimensions, then fire the named smart event.
  try {
    if (typeof window.clarity === "function") {
      for (const [key, value] of Object.entries(clarity)) {
        if (value !== undefined && value !== null && value !== "") {
          window.clarity("set", key, String(value));
        }
      }
      window.clarity("event", eventName);
    }
  } catch (_) {}

  // 3. CustomEvent for any other listener
  try {
    window.dispatchEvent(
      new CustomEvent(eventName, { detail: { ...clarity, ...data } })
    );
  } catch (_) {}
}

/**
 * Fire a one-shot funnel event guarded by a mutable ref-like object, so a
 * repeatedly-rendered component reports the milestone only once per session.
 *
 * @param {{ current: boolean }} firedRef  A useRef() (or any { current } holder).
 * @param {string} eventName
 * @param {{ clarity?: object, data?: object }} [opts]
 */
export function trackFunnelEventOnce(firedRef, eventName, opts) {
  if (!firedRef || firedRef.current) return;
  firedRef.current = true;
  trackFunnelEvent(eventName, opts);
}
