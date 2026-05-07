"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { prEdQuiz2Config } from "../config/prEdQuiz2Config";
import { shouldDisqualifyOnAnswer } from "../utils/prEdQuiz2Disqualify";
import { logger } from "@/utils/devLogger";

/** Key on `history.state` so browser Back/Forward maps to quiz steps. */
const PR_ED_QUIZ2_HISTORY_STEP_KEY = "prEdQuiz2Step";

/** Survives refresh so plan approval can still read `firstName`. */
export const PR_ED_QUIZ2_PATIENT_STORAGE_KEY = "prEdQuiz2Patient";
const PR_ED_QUIZ2_DATA_KEY = "quiz-form-data";
const PR_ED_QUIZ2_DATA_EXPIRY_KEY = "quiz-form-data-expiry";
const PR_ED_QUIZ2_CRM_META_KEY = "prEdQuiz2CrmMeta";

function isClient() {
  return typeof window !== "undefined";
}

function setWithExpiry(key, value, ttlMs) {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(value));
  localStorage.setItem(PR_ED_QUIZ2_DATA_EXPIRY_KEY, String(Date.now() + ttlMs));
}

function getWithExpiry(key) {
  if (!isClient()) return null;
  const expiry = Number(localStorage.getItem(PR_ED_QUIZ2_DATA_EXPIRY_KEY) || 0);
  if (!expiry || Date.now() > expiry) {
    localStorage.removeItem(key);
    localStorage.removeItem(PR_ED_QUIZ2_DATA_EXPIRY_KEY);
    return null;
  }
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function mapSharedAnswersToEdFields(answers, steps) {
  const byStepId = {};
  steps.forEach((s, idx) => {
    byStepId[s.id] = answers[idx];
  });
  const form = {};

  // q5: patient identity/contact (used to prevent empty/wrong-contact CRM entries)
  if (byStepId.q5?.firstName) form["130_3"] = String(byStepId.q5.firstName).trim();
  if (byStepId.q5?.lastName) form["130_6"] = String(byStepId.q5.lastName).trim();
  if (byStepId.q5?.email) form["131"] = String(byStepId.q5.email).trim().toLowerCase();
  if (byStepId.q5?.phone) form["132"] = String(byStepId.q5.phone).trim();

  // q4: DOB + state/province
  if (byStepId.q4?.year && byStepId.q4?.month && byStepId.q4?.day) {
    const y = String(byStepId.q4.year).padStart(4, "0");
    const m = String(byStepId.q4.month).padStart(2, "0");
    const d = String(byStepId.q4.day).padStart(2, "0");
    form["158"] = `${y}-${m}-${d}`;
  }
  if (byStepId.q4?.state) form["161_4"] = String(byStepId.q4.state).trim();

  // q4: sex at birth -> old field 1
  if (byStepId.q4?.sexAtBirth) form["1"] = byStepId.q4.sexAtBirth;

  // q18: allergies -> old fields 30, 31
  if (byStepId.q18) {
    form["30"] = byStepId.q18.value === "yes" ? "Yes" : "No";
    if (byStepId.q18.value === "yes" && byStepId.q18.followUp) form["31"] = byStepId.q18.followUp;
  }

  // q20: recreational drugs -> old field group 23_*
  if (Array.isArray(byStepId.q20)) {
    form["23_1"] = byStepId.q20.includes("cocaine") ? "Cocaine" : "";
    form["23_6"] = byStepId.q20.includes("poppers_amyl_butyl_nitrate") ? "Poppers" : "";
    form["23_5"] = byStepId.q20.includes("none_of_these") ? "None of these apply" : "";
  }

  // q17: currently taking meds -> old field 25
  if (byStepId.q17?.value) {
    form["25"] = byStepId.q17.value === "yes" ? "Yes" : "No";
  }

  // q19: nitrates -> old field group 27_*
  if (Array.isArray(byStepId.q19)) {
    form["27_1"] = byStepId.q19.includes("nitroglycerin")
      ? "Glyceral Trinitrate spray or tablets"
      : "";
    form["27_2"] = byStepId.q19.includes("isosorbide_mononitrate")
      ? "Isosorbide Mononitrate"
      : "";
    form["27_3"] = byStepId.q19.includes("isosorbide_dinitrate")
      ? "Isosorbide Dinitrate"
      : "";
    form["27_7"] = byStepId.q19.includes("none_of_these") ? "None of these apply" : "";
  }

  // q13: prior ED meds -> old field 2
  if (byStepId.q13?.value) {
    form["2"] = byStepId.q13.value === "yes" ? "Yes" : "No";
  }

  // q25: blood pressure -> old field 45
  if (byStepId.q25?.value) {
    const bpMap = {
      normal_approx_120_80: "120/80 or lower (Normal)",
      high_above_130_90: "141/91 to 179/99  (High)",
      low_below_110_70: "121/81 to 140/90 (Above Normal)",
      very_low_below_100_65: "I don't know my blood pressure",
      not_sure: "I don't know my blood pressure",
    };
    form["45"] = bpMap[byStepId.q25.value] || "";
  }

  // Remove empty values before POST
  return Object.fromEntries(
    Object.entries(form).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  );
}

function writeCookie(name, value, maxAgeSeconds = 60 * 60 * 6) {
  if (!isClient()) return;
  if (value === undefined || value === null || value === "") return;
  document.cookie = `${name}=${encodeURIComponent(String(value))}; path=/; max-age=${maxAgeSeconds}; samesite=lax`;
}

function syncIdentityCookiesFromAnswers(answers, steps) {
  const byStepId = {};
  steps.forEach((s, idx) => {
    byStepId[s.id] = answers[idx];
  });
  const q5 = byStepId.q5 || {};
  const q4 = byStepId.q4 || {};

  // Keep backend cookie-based identity aligned with current quiz identity.
  writeCookie("displayName", q5.firstName);
  writeCookie("lastName", q5.lastName);
  writeCookie("userEmail", q5.email);
  writeCookie("phone", q5.phone);
  if (q4?.year && q4?.month && q4?.day) {
    const y = String(q4.year).padStart(4, "0");
    const m = String(q4.month).padStart(2, "0");
    const d = String(q4.day).padStart(2, "0");
    writeCookie("DOB", `${y}-${m}-${d}`);
  }
  writeCookie("province", q4.state);
}

async function submitSharedAnswersToEdApi({ answers, steps, currentStep, crmMeta }) {
  const mapped = mapSharedAnswersToEdFields(answers, steps);
  if (!Object.keys(mapped).length) return crmMeta;

  const q5Index = steps.findIndex((s) => s.id === "q5");
  // Submit only after auth step is completed (step after login/register).
  if (q5Index >= 0 && currentStep <= q5Index) return crmMeta;

  const q5Answer = q5Index >= 0 ? answers[q5Index] : null;
  const identity = {
    firstName: String(q5Answer?.firstName || "").trim(),
    lastName: String(q5Answer?.lastName || "").trim(),
    email: String(q5Answer?.email || "").trim().toLowerCase(),
  };

  // Require identity after auth to avoid blank/wrong-contact records.
  if (!identity.firstName || !identity.lastName || !identity.email) {
    return crmMeta;
  }

  // If user email changed, force a fresh CRM create cycle.
  const safeMeta =
    crmMeta?.email && crmMeta.email !== identity.email
      ? { id: "", token: "", entrykey: "", email: identity.email }
      : { ...(crmMeta || {}), email: identity.email };

  const payload = {
    form_id: 2,
    action: "ed_questionnaire_data_upload",
    id: safeMeta?.id || "",
    token: safeMeta?.token || "",
    stage: "consultation-after-checkout",
    page_step: currentStep + 1,
    completion_state: "Partial",
    completion_percentage: Math.round(((currentStep + 1) / Math.max(steps.length, 1)) * 100),
    source_site: "https://myrocky.com",
    ...mapped,
  };

  try {
    // Ensure backend /api/ed cookie fallbacks use current quiz identity, not stale account cookies.
    syncIdentityCookiesFromAnswers(answers, steps);

    const res = await fetch("/api/ed", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data?.error) {
      logger.warn("pr-ed-quiz-2 CRM sync failed:", data?.msg || data?.error_message || res.status);
      return safeMeta;
    }
    const nextMeta = {
      id: data?.id || safeMeta?.id || "",
      token: data?.token || safeMeta?.token || "",
      entrykey: data?.entrykey || safeMeta?.entrykey || "",
      email: identity.email,
    };
    if (isClient()) {
      localStorage.setItem(PR_ED_QUIZ2_CRM_META_KEY, JSON.stringify(nextMeta));
    }
    return nextMeta;
  } catch (err) {
    logger.warn("pr-ed-quiz-2 CRM sync request error:", err?.message || err);
    return safeMeta;
  }
}

function isReactSyntheticEvent(payload) {
  return (
    payload !== null &&
    typeof payload === "object" &&
    typeof payload.preventDefault === "function" &&
    "nativeEvent" in payload
  );
}

function mergeHistoryState(patch) {
  if (typeof window === "undefined") return patch;
  const cur = window.history.state;
  const base =
    cur && typeof cur === "object" && !Array.isArray(cur) ? { ...cur } : {};
  return { ...base, ...patch };
}

function readQsiFromUrl() {
  try {
    const qsi = new URLSearchParams(window.location.search).get("qsi");
    if (qsi !== null) {
      const n = Number(qsi);
      if (Number.isFinite(n)) return n;
    }
  } catch (_) {}
  return null;
}

export function usePrEdQuiz2Flow(destinationHref) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [crmMeta, setCrmMeta] = useState({});
  const [showDisqualificationModal, setShowDisqualificationModal] = useState(false);
  const currentStepRef = useRef(0);
  const crmMetaRef = useRef({});
  const submitQueueRef = useRef(Promise.resolve());

  useLayoutEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);
  useEffect(() => {
    crmMetaRef.current = crmMeta;
  }, [crmMeta]);

  const steps = prEdQuiz2Config.steps;
  const totalSteps = steps.length;
  const activeStep = steps[currentStep];
  const resolvedDestinationHref =
    destinationHref || prEdQuiz2Config.defaultDestinationHref;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  /**
   * Init: resolve starting step from history.state, then ?qsi= URL param,
   * then default to 0. This covers refresh, browser back, and direct links.
   */
  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    const restored = getWithExpiry(PR_ED_QUIZ2_DATA_KEY);
    if (restored?.answers && typeof restored.answers === "object") {
      setAnswers(restored.answers);
    }
    if (typeof restored?.currentStep === "number") {
      setCurrentStep(Math.max(0, Math.min(restored.currentStep, totalSteps - 1)));
    }
    try {
      const rawMeta = localStorage.getItem(PR_ED_QUIZ2_CRM_META_KEY);
      if (rawMeta) setCrmMeta(JSON.parse(rawMeta));
    } catch (_) {}

    // 1. history.state is most reliable after refresh or back navigation.
    const fromState = window.history.state?.[PR_ED_QUIZ2_HISTORY_STEP_KEY];
    if (
      typeof fromState === "number" &&
      fromState >= 0 &&
      fromState < totalSteps
    ) {
      setCurrentStep(fromState);
      return;
    }

    // 2. ?qsi= written by tracking (syncQuestionnaireStepToUrl).
    const fromUrl = readQsiFromUrl();
    if (fromUrl !== null && fromUrl >= 0 && fromUrl < totalSteps) {
      window.history.replaceState(
        mergeHistoryState({ [PR_ED_QUIZ2_HISTORY_STEP_KEY]: fromUrl }),
        "",
        window.location.href,
      );
      setCurrentStep(fromUrl);
      return;
    }

    // 3. Default: start at step 0.
    window.history.replaceState(
      mergeHistoryState({ [PR_ED_QUIZ2_HISTORY_STEP_KEY]: 0 }),
      "",
      window.location.href,
    );
  }, [totalSteps]);

  /**
   * Browser Back/Forward: read step from history.state, fall back to ?qsi=.
   * The ?qsi= fallback is needed because tracking's syncQuestionnaireStepToUrl
   * uses router.replace which may overwrite history.state.
   */
  useEffect(() => {
    const onPopState = (event) => {
      let step = event.state?.[PR_ED_QUIZ2_HISTORY_STEP_KEY];

      if (typeof step !== "number") {
        const fromUrl = readQsiFromUrl();
        if (fromUrl !== null) step = fromUrl;
      }

      if (
        typeof step === "number" &&
        Number.isFinite(step) &&
        step >= 0 &&
        step < prEdQuiz2Config.steps.length
      ) {
        setCurrentStep(step);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const canSelectCurrentStep = useMemo(() => {
    if (activeStep?.type !== "multiSelect") return true;
    if (currentStep === 0) return true;
    return Boolean(answers[currentStep - 1]);
  }, [activeStep, answers, currentStep]);

  const selectedAnswer = answers[currentStep] ?? null;

  const requiresSelection =
    activeStep?.type === "multiSelect" ||
    activeStep?.type === "singleSelectQuiz";

  const hasSelectionForCurrentStep = useMemo(() => {
    if (!requiresSelection) return true;
    if (activeStep?.type === "multiSelect") {
      // At least one option required; steps with `solePassValue` show the DQ popup on Continue
      // if the selection is not exactly the pass value (see shouldDisqualifyOnAnswer).
      return Array.isArray(selectedAnswer) && selectedAnswer.length > 0;
    }
    if (activeStep?.type === "singleSelectQuiz") {
      if (!selectedAnswer) return false;
      if (typeof selectedAnswer === "string") return true;
      if (
        typeof selectedAnswer === "object" &&
        selectedAnswer !== null &&
        typeof selectedAnswer.value === "string"
      ) {
        if (
          activeStep.followUpWhenValue &&
          selectedAnswer.value === activeStep.followUpWhenValue
        ) {
          return Boolean(String(selectedAnswer.followUp || "").trim());
        }
        return true;
      }
      return false;
    }
    return Boolean(selectedAnswer);
  }, [requiresSelection, activeStep, selectedAnswer]);

  const selectAnswer = (option) => {
    if (!canSelectCurrentStep || !activeStep) return;

    if (
      activeStep.type === "singleSelectQuiz" &&
      activeStep.followUpWhenValue
    ) {
      if (option === activeStep.followUpWhenValue) {
        setAnswers((prev) => {
          const prevAns = prev[currentStep];
          const preserved =
            typeof prevAns === "object" &&
            prevAns !== null &&
            "value" in prevAns &&
            prevAns.value === option
              ? (prevAns.followUp ?? "")
              : "";
          return {
            ...prev,
            [currentStep]: { value: option, followUp: preserved },
          };
        });
      } else {
        setAnswers((prev) => ({
          ...prev,
          [currentStep]: { value: option },
        }));
      }
      return;
    }

    setAnswers((prev) => ({ ...prev, [currentStep]: option }));
  };

  const updateSingleSelectFollowUp = (text) => {
    if (!activeStep?.followUpWhenValue) return;
    setAnswers((prev) => {
      const cur = prev[currentStep];
      const base =
        typeof cur === "object" &&
        cur !== null &&
        typeof cur.value === "string"
          ? cur
          : { value: activeStep.followUpWhenValue, followUp: "" };
      return { ...prev, [currentStep]: { ...base, followUp: text } };
    });
  };

  const toggleMultiSelectAnswer = (option) => {
    if (!canSelectCurrentStep || !activeStep) return;
    if (
      activeStep.type === "multiSelect" &&
      typeof activeStep.solePassValue === "string"
    ) {
      const sole = activeStep.solePassValue;
      setAnswers((prev) => {
        const existing = Array.isArray(prev[currentStep])
          ? [...prev[currentStep]]
          : [];
        if (option === sole) {
          if (existing.includes(sole)) {
            return { ...prev, [currentStep]: existing.filter((x) => x !== sole) };
          }
          return { ...prev, [currentStep]: [sole] };
        }
        const withoutSole = existing.filter((x) => x !== sole);
        if (withoutSole.includes(option)) {
          return { ...prev, [currentStep]: withoutSole.filter((x) => x !== option) };
        }
        return { ...prev, [currentStep]: [...withoutSole, option] };
      });
      return;
    }

    setAnswers((prev) => {
      const existing = Array.isArray(prev[currentStep])
        ? prev[currentStep]
        : [];
      const next = existing.includes(option)
        ? existing.filter((item) => item !== option)
        : [...existing, option];
      return { ...prev, [currentStep]: next };
    });
  };

  const closeDisqualificationModal = useCallback(() => {
    setShowDisqualificationModal(false);
  }, []);

  const continueStep = (stepPayload) => {
    if (!hasSelectionForCurrentStep) return;

    const stepIndex = currentStepRef.current;
    const stepsCount = prEdQuiz2Config.steps.length;
    const stepDef = prEdQuiz2Config.steps[stepIndex];

    let valueForStep = answers[stepIndex];
    if (
      !isReactSyntheticEvent(stepPayload) &&
      typeof stepPayload !== "undefined"
    ) {
      valueForStep = stepPayload;
    }

    if (shouldDisqualifyOnAnswer(stepDef, valueForStep)) {
      setShowDisqualificationModal(true);
      return;
    }

    const hasExplicitPayload =
      !isReactSyntheticEvent(stepPayload) && typeof stepPayload !== "undefined";
    const nextAnswers = hasExplicitPayload
      ? { ...answers, [stepIndex]: stepPayload }
      : { ...answers };

    // Keep state/storage in sync for both payload and non-payload steps.
    setAnswers(nextAnswers);
    if (isClient()) {
      setWithExpiry(
        PR_ED_QUIZ2_DATA_KEY,
        { answers: nextAnswers, currentStep: stepIndex },
        60 * 60 * 1000,
      );
    }

    // Fire-and-forget shared-question CRM sync on every Continue.
    submitQueueRef.current = submitQueueRef.current.then(async () => {
      const meta = await submitSharedAnswersToEdApi({
        answers: nextAnswers,
        steps: prEdQuiz2Config.steps,
        currentStep: stepIndex,
        crmMeta: crmMetaRef.current,
      });
      crmMetaRef.current = meta || {};
      setCrmMeta(meta || {});
    });

    // Persist patient info across refreshes for the plan approval step.
    if (
      hasExplicitPayload &&
      typeof stepPayload === "object" &&
      stepPayload !== null &&
      typeof stepPayload.firstName === "string" &&
      stepPayload.firstName.trim()
    ) {
      try {
        sessionStorage.setItem(
          PR_ED_QUIZ2_PATIENT_STORAGE_KEY,
          JSON.stringify(stepPayload),
        );
      } catch (_) {}
    }

    if (stepIndex === stepsCount - 1) {
      window.location.href = resolvedDestinationHref;
      return;
    }

    const nextStep = Math.min(stepIndex + 1, stepsCount - 1);
    if (isClient()) {
      setWithExpiry(
        PR_ED_QUIZ2_DATA_KEY,
        { answers: nextAnswers, currentStep: nextStep },
        60 * 60 * 1000,
      );
    }
    window.history.pushState(
      mergeHistoryState({ [PR_ED_QUIZ2_HISTORY_STEP_KEY]: nextStep }),
      "",
      window.location.href,
    );
    setCurrentStep(nextStep);
  };

  const goBack = () => {
    if (currentStepRef.current > 0) window.history.back();
  };

  return {
    activeStep,
    currentStep,
    totalSteps,
    selectedAnswer,
    hasSelectionForCurrentStep,
    canSelectCurrentStep,
    isFirstStep,
    isLastStep,
    selectAnswer,
    updateSingleSelectFollowUp,
    toggleMultiSelectAnswer,
    continueStep,
    goBack,
    resolvedDestinationHref,
    answers,
    showDisqualificationModal,
    closeDisqualificationModal,
  };
}
