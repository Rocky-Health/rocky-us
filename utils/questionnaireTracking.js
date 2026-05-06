/**
 * Questionnaire step tracking utilities.
 * Pure functions -- no React, SSR-safe.
 */

const QS_DEBUG =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_QS_TRACK_DEBUG === "1";

/* ------------------------------------------------------------------ */
/*  buildSafeStepId                                                    */
/* ------------------------------------------------------------------ */

function simpleHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Convert any raw step identifier to a URL-safe, deterministic slug.
 * Numbers pass through as their string form: 3 -> "3".
 * Non-alphanumeric chars become hyphens; consecutive hyphens collapse.
 * If the result is empty, falls back to "step-<hash>" for uniqueness.
 */
export function buildSafeStepId(raw) {
  const s = String(raw);
  const slug = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  if (slug.length > 0) return slug;
  return "step-" + simpleHash(s);
}

/* ------------------------------------------------------------------ */
/*  syncQuestionnaireStepToUrl                                         */
/* ------------------------------------------------------------------ */

/**
 * Update `qs` and optionally `qsi` query params via router.replace.
 * Preserves every other param and the hash fragment.
 * No-ops when the URL already matches.
 *
 * @param {{ stepSlug: string, stepIndex: number|null, router: object, pathname: string, searchParams: URLSearchParams }} opts
 */
export function syncQuestionnaireStepToUrl({
  stepSlug,
  stepIndex,
  router,
  pathname,
  searchParams,
}) {
  if (typeof window === "undefined") return;
  try {
    const currentQs = searchParams.get("qs");
    const currentQsi = searchParams.get("qsi");

    const wantQsi =
      typeof stepIndex === "number" && isFinite(stepIndex)
        ? String(stepIndex)
        : null;

    if (currentQs === stepSlug && currentQsi === wantQsi) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set("qs", stepSlug);
    if (wantQsi !== null) {
      params.set("qsi", wantQsi);
    } else {
      params.delete("qsi");
    }

    const hash = window.location.hash || "";
    const qs = params.toString();
    const url = qs ? pathname + "?" + qs + hash : pathname + hash;

    router.replace(url, { scroll: false });
  } catch (_) {
    // tracking must never break the app
  }
}

/* ------------------------------------------------------------------ */
/*  trackQuestionnaireStepView                                         */
/* ------------------------------------------------------------------ */

/**
 * Emit questionnaire_step_view to dataLayer, Clarity, and CustomEvent.
 * Each target is independently guarded -- a failure in one does not
 * prevent the others from firing.
 *
 * @param {object} payload  Safe, minimal payload (no PHI).
 */
export function trackQuestionnaireStepView(payload) {
  if (typeof window === "undefined") return;

  if (QS_DEBUG) {
    try {
      console.info("[QS_TRACK]", payload);
    } catch (_) { }
  }

  // 1. dataLayer (GTM / GA4)
  try {
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "questionnaire_step_view",
        ...payload,
      });
    }
  } catch (_) { }

  // 2. Clarity -- set fields then fire event (no payload in event call)
  try {
    if (typeof window.clarity === "function") {
      window.clarity("set", "qs_flow_id", String(payload.flow_id ?? ""));
      window.clarity(
        "set",
        "qs_questionnaire_id",
        String(payload.questionnaire_id ?? "")
      );
      window.clarity("set", "qs_step_id", String(payload.step_id ?? ""));
      window.clarity(
        "set",
        "qs_step_index",
        String(payload.step_index ?? "")
      );
      window.clarity("event", "questionnaire_step_view");
    }
  } catch (_) { }

  // 3. CustomEvent for any other listener
  try {
    window.dispatchEvent(
      new CustomEvent("questionnaire_step_view", { detail: payload })
    );
  } catch (_) { }
}
