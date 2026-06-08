/**
 * Trustpilot bootstrap-script loader (singleton).
 *
 * Every Trustpilot widget on the page shares ONE bootstrap script. Historically
 * each <ReviewsSection>-style component appended its own copy — and some even
 * removed + re-appended `#trustpilot-script` on mount — which forced the
 * ~bootstrap bundle (plus its main.js / trustboxes assets) to download several
 * times per page. This module loads the script exactly once and hands every
 * caller the same promise, so the network cost is paid a single time.
 *
 * Pair it with `useLazyTrustpilot` so the script is only requested once a
 * widget actually scrolls into view (keeps it off the initial page load).
 */

const SCRIPT_ID = "trustpilot-script";
const SCRIPT_SRC =
  "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";

let loadPromise = null;

/**
 * Load the Trustpilot bootstrap script once. Resolves when `window.Trustpilot`
 * is available; rejects (and resets so a later widget can retry) if it fails.
 *
 * @returns {Promise<void>}
 */
export function loadTrustpilotScript() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return Promise.resolve();
  }

  // Already initialised by a previous load.
  if (window.Trustpilot) return Promise.resolve();

  // A load is already in flight (or finished) — reuse it.
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);

    if (existing) {
      if (window.Trustpilot) {
        resolve();
      } else {
        existing.addEventListener("load", () => resolve(), { once: true });
        existing.addEventListener(
          "error",
          () => {
            loadPromise = null;
            reject(new Error("Trustpilot script failed to load"));
          },
          { once: true }
        );
      }
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Allow a later widget to retry the load.
      loadPromise = null;
      reject(new Error("Trustpilot script failed to load"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
