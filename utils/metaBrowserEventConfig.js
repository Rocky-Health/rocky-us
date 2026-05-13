/**
 * Meta browser-side event configuration for questionnaire funnels.
 * Aligns with existing CAPI obfuscation in utils/metaCapiConfig.js.
 *
 * DO NOT use health/medical/product-related terms in Meta event names.
 * Readable names stay in dataLayer only; fbq receives cryptic names.
 */

const META_DEBUG =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_META_QUIZ_DEBUG === "1";

/* ------------------------------------------------------------------ */
/*  Pixel IDs per category (mirrors FBPixelLoader PIXEL_IDS)           */
/* ------------------------------------------------------------------ */

export const CATEGORY_PIXEL_MAP = {
  ED: process.env.NEXT_PUBLIC_FB_PIXEL_ID_ED || "522677764108011",
  WL: process.env.NEXT_PUBLIC_FB_PIXEL_ID_WL || "1451450365779499",
  SMOKING: process.env.NEXT_PUBLIC_FB_PIXEL_ID_SMOKING || "1311848663202831",
  HL: process.env.NEXT_PUBLIC_FB_PIXEL_ID_HL || "754893718769214",
  SKINCARE: process.env.NEXT_PUBLIC_FB_PIXEL_ID_SKINCARE || "1843271713209245",
  OTHERS: process.env.NEXT_PUBLIC_FB_PIXEL_ID_OTHERS || "799609076328562",
};

/* ------------------------------------------------------------------ */
/*  Category base codes (aligned with CAPI CUSTOM_EVENT_NAMES)         */
/* ------------------------------------------------------------------ */

const CATEGORY_BASE = {
  ED: "RKY_TNT",
  WL: "RKY_FLW",
  HL: "RKY_VBE",
  SMOKING: "RKY_ZXT",
  SKINCARE: "RKY_LXS",
  OTHERS: "RKY_MXR",
};

/* ------------------------------------------------------------------ */
/*  Milestone suffixes                                                 */
/* ------------------------------------------------------------------ */

export const MILESTONES = {
  QUIZ_START: "QS",
  QUIZ_STEP: "QP",
  PRODUCT_SELECTION: "PS",
  PLAN_SELECTION: "PL",
  START_CHECKOUT: "SC",
};

/* ------------------------------------------------------------------ */
/*  Category resolution maps                                           */
/* ------------------------------------------------------------------ */

const FLOW_ID_MAP = {
  ed: "ED",
  "weight-loss": "WL",
  wl: "WL",
  hair: "HL",
  hl: "HL",
  smoking: "SMOKING",
  skincare: "SKINCARE",
  mh: "OTHERS",
};

/**
 * Explicit table of all known questionnaire_id values.
 * New questionnaires MUST be registered here before relying on prefix fallback.
 */
const QUESTIONNAIRE_ID_MAP = {
  "ed-consultation": "ED",
  "ed-pre-consultation": "ED",
  "hair-consultation": "HL",
  "hair-pre-consultation": "HL",
  "weight-consultation": "WL",
  "wl-pre-consultation-v1": "WL",
  "wl-flow-two": "WL",
  "wl-offer": "WL",
  "glp2-pre-consultation": "WL",
  "bo-simplified": "WL",
  "bo-simplified-2": "WL",
  "bo-weight-consultation": "WL",
  "acne-quiz": "SKINCARE",
  "anti-aging-quiz": "SKINCARE",
  "hyperpigmentation-quiz": "SKINCARE",
  "zonnic-consultation": "SMOKING",
  "mh-pre-consultation": "OTHERS",
  "mental-health": "OTHERS",
};

/* ------------------------------------------------------------------ */
/*  resolveCategory                                                    */
/* ------------------------------------------------------------------ */

/**
 * Three-tier category resolution:
 * 1. flow_id exact match
 * 2. questionnaire_id exact match
 * 3. questionnaire_id prefix heuristic (safety net)
 * 4. OTHERS fallback
 */
export function resolveCategory(flowId, questionnaireId) {
  if (flowId && FLOW_ID_MAP[flowId]) {
    return FLOW_ID_MAP[flowId];
  }

  if (questionnaireId && QUESTIONNAIRE_ID_MAP[questionnaireId]) {
    return QUESTIONNAIRE_ID_MAP[questionnaireId];
  }

  if (questionnaireId) {
    const qid = questionnaireId.toLowerCase();
    if (qid.startsWith("ed")) return "ED";
    if (qid.startsWith("hair")) return "HL";
    if (
      qid.startsWith("wl") ||
      qid.startsWith("bo") ||
      qid.startsWith("glp") ||
      qid.startsWith("weight")
    )
      return "WL";
    if (qid.startsWith("zonnic") || qid.startsWith("smoking")) return "SMOKING";
    if (
      qid.includes("acne") ||
      qid.includes("aging") ||
      qid.includes("pigment") ||
      qid.startsWith("skincare")
    )
      return "SKINCARE";
  }

  if (META_DEBUG) {
    try {
      console.warn("[META_TRACKING] Fallback to OTHERS:", {
        flowId,
        questionnaireId,
      });
    } catch (err) {
      // Guarded: only reachable if console.warn itself throws (e.g. test env)
    }
  }

  return "OTHERS";
}

/* ------------------------------------------------------------------ */
/*  resolveMetaEventName                                               */
/* ------------------------------------------------------------------ */

/**
 * Build obfuscated Meta browser event name.
 * e.g. resolveMetaEventName("weight-loss", "wl-offer", "QUIZ_START") => "RKY_FLW_QS"
 */
export function resolveMetaEventName(flowId, questionnaireId, milestone) {
  const cat = resolveCategory(flowId, questionnaireId);
  const base = CATEGORY_BASE[cat] || CATEGORY_BASE.OTHERS;
  const suffix = MILESTONES[milestone];
  if (!suffix) return base;
  return `${base}_${suffix}`;
}

/* ------------------------------------------------------------------ */
/*  Readable dataLayer event names                                     */
/* ------------------------------------------------------------------ */

/**
 * Meta-readable internal mirror names for GTM visibility / debugging.
 */
export const DATALAYER_EVENT_NAMES = {
  QUIZ_START: "meta_quiz_start",
  QUIZ_STEP: "meta_quiz_step",
  PRODUCT_SELECTION: "meta_product_selection",
  PLAN_SELECTION: "meta_plan_selection",
  START_CHECKOUT: "meta_start_checkout",
};

/**
 * Generic platform-agnostic milestone names for non-Meta consumers
 * (GTM, future tools).
 *
 * Milestone keys are uppercase internally, but all outbound uses
 * (generic `event`, `milestone` field) use these lowercase forms
 * so that event === milestone always holds.
 */
export const GENERIC_EVENT_NAMES = {
  QUIZ_START: "quiz_start",
  QUIZ_STEP: "quiz_step",
  PRODUCT_SELECTION: "product_selection",
  PLAN_SELECTION: "plan_selection",
  START_CHECKOUT: "start_checkout",
};
