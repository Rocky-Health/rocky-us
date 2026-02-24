"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  buildSafeStepId,
  syncQuestionnaireStepToUrl,
  trackQuestionnaireStepView,
} from "@/utils/questionnaireTracking";

function normalizeIndex(val) {
  if (typeof val === "number" && isFinite(val)) return val;
  if (typeof val === "string" && val !== "" && isFinite(Number(val)))
    return Number(val);
  return null;
}

function inferTransition(
  isFirstRender,
  initialHasQs,
  prevIndex,
  nextIndex
) {
  if (isFirstRender) {
    return initialHasQs ? "resume" : "unknown";
  }
  if (prevIndex !== null && nextIndex !== null) {
    if (nextIndex > prevIndex) {
      return nextIndex - prevIndex > 1 ? "jump" : "forward";
    }
    if (nextIndex < prevIndex) return "back";
  }
  return "unknown";
}

/**
 * Observes step state and emits URL + tracking signals.
 * Purely side-effect based -- returns nothing, never modifies step state.
 *
 * @param {{ questionnaireId: string, stepId: *, stepIndex: *, flowId: string|null, stepType: string }} opts
 */
export function useQuestionnaireStepTracking({
  questionnaireId,
  stepId,
  stepIndex,
  flowId = null,
  stepType = "other",
}) {
  const router = useRouter();
  const pathname = usePathname();

  const trackingRef = useRef({
    lastSignature: null,
    prevStepSlug: null,
    prevStepIndex: null,
  });

  const initialHasQsRef = useRef(null);

  if (initialHasQsRef.current === null && typeof window !== "undefined") {
    try {
      const sp = new URLSearchParams(window.location.search);
      initialHasQsRef.current = sp.has("qs") || sp.has("qsi");
    } catch (_) {
      initialHasQsRef.current = false;
    }
  }

  const shouldSkip =
    stepId === null || stepId === undefined || stepId === "";

  const stepSlug = shouldSkip ? null : buildSafeStepId(stepId);
  const nIdx = normalizeIndex(stepIndex);

  useEffect(() => {
    if (shouldSkip || stepSlug === null) return;

    const sig = `${questionnaireId}|${stepSlug}|${nIdx ?? "x"}`;
    const t = trackingRef.current;

    if (t.lastSignature === sig) return;

    const isFirstRender = t.lastSignature === null;
    const transition = inferTransition(
      isFirstRender,
      initialHasQsRef.current,
      t.prevStepIndex,
      nIdx
    );

    const payload = {
      flow_id: flowId,
      questionnaire_id: questionnaireId,
      step_id: stepSlug,
      step_index: nIdx,
      step_type: stepType,
      transition,
      source_step_id: t.prevStepSlug,
      ts: Date.now(),
    };

    const searchParams = new URLSearchParams(window.location.search);
    syncQuestionnaireStepToUrl({
      stepSlug,
      stepIndex: nIdx,
      router,
      pathname,
      searchParams,
    });

    trackQuestionnaireStepView(payload);

    t.lastSignature = sig;
    t.prevStepSlug = stepSlug;
    t.prevStepIndex = nIdx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepSlug, nIdx]);
}
