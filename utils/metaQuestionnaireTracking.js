/**
 * Meta questionnaire funnel tracking — emission helpers.
 *
 * Sends THREE targets per milestone:
 *   1. window.fbq("trackSingleCustom", pixelId, name, payload) — Meta Pixel (targeted)
 *   2. dataLayer meta mirror   (e.g. meta_quiz_step)        — GTM / debug
 *   3. dataLayer generic event (e.g. quiz_step)             — SPA funnel tools
 *
 * SSR-safe, never throws, gracefully degrades if fbq is missing.
 */

import { safePush, getOrCreateSessionId } from "@/utils/dataLayerHelper";
import {
  resolveMetaEventName,
  resolveCategory,
  buildSecondaryEventName,
  isNadSource,
  CATEGORY_PIXEL_MAP,
  SECONDARY_CATEGORY_PIXEL_MAP,
  DATALAYER_EVENT_NAMES,
  GENERIC_EVENT_NAMES,
} from "@/utils/metaBrowserEventConfig";

const DEBUG =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_META_QUIZ_DEBUG === "1";

/* ------------------------------------------------------------------ */
/*  Debug error helper                                                 */
/* ------------------------------------------------------------------ */

/**
 * Non-blocking error logger for Meta tracking.
 * Silent in production; only logs when NEXT_PUBLIC_META_QUIZ_DEBUG=1.
 */
export function logMetaTrackingError(err, context = {}) {
  if (DEBUG) {
    try {
      console.warn("[META_TRACKING_ERROR]", { error: err, ...context });
    } catch (_) {
      // absolute last resort — never break the app
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Core emission                                                      */
/* ------------------------------------------------------------------ */

function emitMetaFunnelEvent(milestone, flowId, questionnaireId, params = {}) {
  if (typeof window === "undefined") return;

  try {
    const sessionId = getOrCreateSessionId();
    const eventId = `${milestone}_${sessionId}_${Date.now()}`;
    const obfuscatedName = resolveMetaEventName(flowId, questionnaireId, milestone);
    const dlEventName = DATALAYER_EVENT_NAMES[milestone];
    const genericEventName = GENERIC_EVENT_NAMES[milestone];
    const category = resolveCategory(flowId, questionnaireId);

    // NAD+ rides the LONGEVITY pixel but stays filterable via rky_cat:'NAD'.
    const nadTag = isNadSource(flowId, questionnaireId) ? "NAD" : null;

    const basePayload = {
      flow_id: flowId || null,
      questionnaire_id: questionnaireId || null,
      rk_session_id: sessionId,
      event_id: eventId,
      ...(nadTag && { rky_cat: nadTag }),
      ...params,
    };

    // 1. Meta Pixel — obfuscated, targeted at the correct pixel
    if (typeof window.fbq === "function") {
      const pixelId = CATEGORY_PIXEL_MAP[category] || CATEGORY_PIXEL_MAP.OTHERS;
      const fbqPayload = { ...basePayload };
      delete fbqPayload.content_name;
      // 5th-arg eventID is what Meta dedups on (custom_data event_id isn't).
      window.fbq("trackSingleCustom", pixelId, obfuscatedName, fbqPayload, {
        eventID: eventId,
      });

      // 1b. Secondary mirrors — for categories registered in
      // SECONDARY_CATEGORY_PIXEL_MAP, fire the same milestone to each
      // mirror pixel under a parallel event name (e.g. RKY_FLW_QS on the
      // primary becomes RKY_FLW_US_QS on the US-only WL mirror). Payload
      // is identical so EMQ stays in lockstep with the primary fire.
      // Wrapped in try/catch so a mirror failure cannot poison the primary.
      const mirrors = SECONDARY_CATEGORY_PIXEL_MAP[category] || [];
      for (const mirror of mirrors) {
        try {
          const mirrorName = buildSecondaryEventName(
            mirror.eventNameBase,
            milestone,
          );
          // Per-mirror event_id so each pixel's dedup namespace is
          // independent of the primary's.
          const mirrorPayload = { ...fbqPayload, event_id: `${eventId}_${mirror.eventNameBase}` };
          window.fbq(
            "trackSingleCustom",
            mirror.pixelId,
            mirrorName,
            mirrorPayload,
            { eventID: mirrorPayload.event_id },
          );
        } catch (mirrorErr) {
          logMetaTrackingError(mirrorErr, {
            flow_id: flowId,
            questionnaire_id: questionnaireId,
            milestone,
            scope: "secondary_mirror",
            mirror_pixel: mirror.pixelId,
          });
        }
      }
    }

    // 2. dataLayer — Meta-readable internal mirror
    if (dlEventName) {
      safePush({
        event: dlEventName,
        ...basePayload,
      });
    }

    // 3. dataLayer — generic platform-agnostic milestone event
    if (genericEventName) {
      const flowStepKey =
        (milestone === "QUIZ_START" || milestone === "QUIZ_STEP") &&
        flowId &&
        params.step_index != null
          ? `${flowId}_${params.step_index}`
          : undefined;

      safePush({
        event: genericEventName,
        milestone: genericEventName,
        flow_variant: questionnaireId || null,
        ...(flowStepKey !== undefined ? { flow_step_key: flowStepKey } : {}),
        ...basePayload,
      });
    }

    if (DEBUG) {
      try {
        console.log("[META_QUIZ]", milestone, obfuscatedName, basePayload);
      } catch (err) {
        logMetaTrackingError(err, { flow_id: flowId, questionnaire_id: questionnaireId, milestone, scope: "debug_log" });
      }
    }

    return { eventId, category, rky_cat: nadTag };
  } catch (err) {
    logMetaTrackingError(err, { flow_id: flowId, questionnaire_id: questionnaireId, milestone });
  }
}

/* ------------------------------------------------------------------ */
/*  Public helpers                                                     */
/* ------------------------------------------------------------------ */

export function trackMetaQuizStart({
  questionnaire_id,
  flow_id,
  step_index,
  step_slug,
  step_type,
}) {
  emitMetaFunnelEvent("QUIZ_START", flow_id, questionnaire_id, {
    step_index,
    step_slug,
    step_type,
  });
}

export function trackMetaQuizStep({
  questionnaire_id,
  flow_id,
  step_index,
  step_slug,
  step_type,
  transition,
}) {
  emitMetaFunnelEvent("QUIZ_STEP", flow_id, questionnaire_id, {
    step_index,
    step_slug,
    step_type,
    transition,
  });
}

// Post-purchase consultation tracking — emits CONSULTATION_START / CONSULTATION_STEP
// (CS / CP suffix) rather than the pre-purchase QS / QP events so consultation
// traffic stays out of the pre-purchase funnel metrics.
export function trackMetaConsultationStart({
  questionnaire_id,
  flow_id,
  step_index,
  step_slug,
  step_type,
}) {
  emitMetaFunnelEvent("CONSULTATION_START", flow_id, questionnaire_id, {
    step_index,
    step_slug,
    step_type,
  });
}

export function trackMetaConsultationStep({
  questionnaire_id,
  flow_id,
  step_index,
  step_slug,
  step_type,
  transition,
}) {
  emitMetaFunnelEvent("CONSULTATION_STEP", flow_id, questionnaire_id, {
    step_index,
    step_slug,
    step_type,
    transition,
  });
}

export function trackMetaProductSelection({
  questionnaire_id,
  flow_id,
  step_type,
  content_id,
  selection_type,
  selection_value,
}) {
  emitMetaFunnelEvent("PRODUCT_SELECTION", flow_id, questionnaire_id, {
    step_type: step_type || "product_selection",
    content_id,
    selection_type,
    selection_value,
  });
}

export function trackMetaPlanSelection({
  questionnaire_id,
  flow_id,
  step_type,
  content_id,
  selection_type,
  selection_value,
}) {
  emitMetaFunnelEvent("PLAN_SELECTION", flow_id, questionnaire_id, {
    step_type: step_type || "plan_selection",
    content_id,
    selection_type,
    selection_value,
  });
}

export function trackMetaStartCheckout({
  questionnaire_id,
  flow_id,
  step_type,
  content_id,
  value,
  currency,
}) {
  const result = emitMetaFunnelEvent("START_CHECKOUT", flow_id, questionnaire_id, {
    step_type: step_type || "checkout",
    content_id,
    value,
    currency: currency || "USD",
  });

  // Server-side CAPI mirror (TK-633). Fire-and-forget with the SAME event_id +
  // resolved category as the browser pixel fire so Meta dedups the pair into a
  // single Start Checkout event. keepalive lets it survive the page transition.
  if (result?.eventId && result?.category && typeof window !== "undefined") {
    try {
      fetch("/api/meta-capi/start-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          gateway: result.category,
          event_id: result.eventId,
          value,
          currency: currency || "USD",
          content_id,
          ...(result.rky_cat && { rky_cat: result.rky_cat }),
          event_source_url: window.location.href,
        }),
      }).catch(() => {});
    } catch (err) {
      logMetaTrackingError(err, {
        flow_id,
        milestone: "START_CHECKOUT",
        scope: "server_mirror",
      });
    }
  }
}
