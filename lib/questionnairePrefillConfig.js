/**
 * Configuration for patient portal questionnaire prefill.
 * When redirect_to contains id, token, patient-token, we fetch questionnaire-filled-answers
 * and prefill + jump to first unanswered question.
 */
export const QUESTIONNAIRE_PREFILL_PATHS = [
  "/wl-consultation",
  "/ed-consultation-quiz",
  "/hair-main-questionnaire",
];

export const getPrefillStorageKey = (pathname) => {
  const key = pathname.replace(/\//g, "-").replace(/^-/, "");
  return `questionnaire-prefill-${key}`;
};

// Identity keys we never want flowing back into formData from a CRM-stored
// answer set. The backend resolves identity via body > profile > cookie on
// every request; if we let CRM-prefill push these into formData they'd get
// persisted to localStorage drafts and ride along in subsequent body
// submissions, defeating the profile tier. Both CRM dot-notation and the
// post-mapping underscore form are listed because the strip happens after
// the dot to underscore transform.
const IDENTITY_KEYS_TO_DROP = new Set([
  "131",
  "132",
  "158",
  "130_3",
  "130_6",
  "161_4",
  "wp_user_id",
  "created_by",
  // Dot-notation (pre-mapping) just in case a caller passes raw CRM keys.
  "130.3",
  "130.6",
  "161.4",
]);

export const mapCrmResponseToFormData = (crmData) => {
  const formKeyFromCrm = (k) => {
    if (k === "wl.weight") return "wl_weight";
    if (k === "wl.height") return "wl_height";
    if (k === "wl.BMI") return "wl_BMI";
    return k.replace(/\./g, "_");
  };
  const mapped = {};
  Object.keys(crmData).forEach((k) => {
    if (IDENTITY_KEYS_TO_DROP.has(k)) return; // skip CRM-side dotted identity keys
    const formKey = formKeyFromCrm(k);
    if (IDENTITY_KEYS_TO_DROP.has(formKey)) return; // skip post-mapped form-side keys
    const val = crmData[k];
    if (val != null && val !== "") {
      mapped[formKey] = val;
    }
  });
  return mapped;
};
