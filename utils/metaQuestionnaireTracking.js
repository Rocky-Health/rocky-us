/**
 * Meta questionnaire funnel tracking — emission helpers.
 *
 * Sends THREE targets per milestone:
 *   1. window.fbq("trackCustom", obfuscatedName, payload)  — Meta Pixel
 *   2. dataLayer meta mirror   (e.g. meta_quiz_step)        — GTM / debug
 *   3. dataLayer generic event (e.g. quiz_step)             — heatmap.com / SPA funnel tools
 *
 * SSR-safe, never throws, gracefully degrades if fbq is missing.
 */

import { safePush, getOrCreateSessionId } from "@/utils/dataLayerHelper";
import {
  resolveMetaEventName,
  DATALAYER_EVENT_NAMES,
  GENERIC_EVENT_NAMES,
} from "@/utils/metaBrowserEventConfig";

const DEBUG =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_META_QUIZ_DEBUG === "1";

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

    const basePayload = {
      flow_id: flowId || null,
      questionnaire_id: questionnaireId || null,
      rk_session_id: sessionId,
      event_id: eventId,
      ...params,
    };

    // 1. Meta Pixel — obfuscated, no content_name
    if (typeof window.fbq === "function") {
      const fbqPayload = { ...basePayload };
      delete fbqPayload.content_name;
      window.fbq("trackCustom", obfuscatedName, fbqPayload);
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
      } catch (_) {}
    }
  } catch (_) {
    // tracking must never break the app
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
  emitMetaFunnelEvent("START_CHECKOUT", flow_id, questionnaire_id, {
    step_type: step_type || "checkout",
    content_id,
    value,
    currency: currency || "USD",
  });
}
