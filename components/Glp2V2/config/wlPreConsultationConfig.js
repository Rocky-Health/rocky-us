/**
 * wlPreConsultationConfig.js
 *
 * Quiz config for the GLP2 pre-consultation V2 flow.
 * This file is the single source of truth for all pages, questions, popups,
 * API field mapping, and persistence settings.
 *
 * ── How to wire up API submission ────────────────────────────────────────────
 * Set submission.url to your Next.js API route (e.g. "/api/wl-pre-consultation").
 * If url is null or omitted the engine skips the POST silently.
 *
 * fieldMap    : maps question/field id → backend field name
 * answerIdMap : maps option value → coded id the backend expects
 * extraData   : static fields always merged into every POST body
 * trigger     : "onComplete" | "onEveryPage" | "onSpecificPages"
 *               (only "onComplete" is wired by default; extend submitAnswers for others)
 *
 * ── Page schema ───────────────────────────────────────────────────────────────
 * {
 *   id: string,
 *   content: ContentBlock[],     // image | video | heading | paragraph
 *   questions: Question[],
 *   ctaLabel: string,            // default: "Continue"
 *   nextPage: string | fn(answers) => string | null,
 *   requirements: Requirement[], // optional; auto-derived from question.required when absent
 *   popup: PopupConfig,          // optional; fired on CTA click before navigation
 * }
 *
 * ── Question schema ───────────────────────────────────────────────────────────
 * {
 *   id: string,
 *   type: "radio" | "multi-select" | "form",
 *   title: string,
 *   titleStyle: string,          // optional Tailwind class override
 *   description: string,         // optional
 *   descriptionStyle: string,    // optional Tailwind class override
 *   required: boolean,
 *   optionLayout: "text-only" | "centered" | "horizontal" | "horizontal-reversed",
 *   options: Option[],           // for radio / multi-select
 *   fields: Field[],             // for form
 * }
 *
 * ── Option schema ─────────────────────────────────────────────────────────────
 * { value, label, description?, icon? }
 * Layout is set at the question level via optionLayout (shared by all options).
 *
 * ── Popup schema ─────────────────────────────────────────────────────────────
 * mode "page"    → { mode, content: ContentBlock[], cta: string }
 * mode "warning" → { mode, title, body, canContinue, ctaLabel, exitLabel,
 *                    exitAction: "back" | pageId, condition: fn }
 */

export const wlPreConsultationConfig = {
  id: "glp2-pre-v2",
  persistenceKey: "glp2-pre-v2",

  // ── API submission ──────────────────────────────────────────────────────────
  submission: {
    // Set to your API route to enable form submission, e.g. "/api/wl-pre-consultation"
    // Leave null to skip the API call entirely.
    url: null,

    // Maps answer key (question.id or field.id) → backend field name
    fieldMap: {
      "q-sex": "biological_sex",
      "q-weight": "current_weight",
      "q-height-feet": "height_feet",
      "q-height-inches": "height_inches",
      "q-goal-weight": "goal_weight",
      "q-pace": "pace_preference",
      "q-sleep": "sleep_hours",
      "q-conditions": "medical_conditions",
      "q-willingness": "lifestyle_willingness",
      "q-priority": "medication_priority",
    },

    // Maps option values → coded ids the backend expects (omit if backend accepts strings)
    answerIdMap: {
      "q-pace": { fast: 1, moderate: 2, steady: 3 },
      "q-sleep": {
        "less-than-5": 1,
        "6-7": 2,
        "8-9": 3,
        "more-than-9": 4,
      },
      "q-priority": { affordability: 1, potency: 2 },
    },

    // Static fields always merged into the POST body
    extraData: {
      form_id: 6,
      action: "wl_pre_consultation_submit",
      source_site: process.env.NEXT_PUBLIC_SITE_URL || "https://www.myrocky.com",
    },

    // When to POST: "onComplete" fires submitAnswers() on the last page
    trigger: "onComplete",
  },

  // ── Pages ───────────────────────────────────────────────────────────────────
  pages: [
    // ── 1. Intro — content-only welcome screen ────────────────────────────────
    {
      id: "page-intro",
      content: [
        {
          type: "heading",
          text: "Let's find your ideal weight loss treatment",
        },
        {
          type: "paragraph",
          text: "Answer a few quick questions so we can match you with the right GLP-1 medication and plan.",
        },
      ],
      questions: [],
      ctaLabel: "Get Started",
      nextPage: "page-sex",
      // No requirements — content-only page, CTA is always enabled
    },

    // ── 2. Biological sex ─────────────────────────────────────────────────────
    {
      id: "page-sex",
      content: [],
      questions: [
        {
          id: "q-sex",
          type: "radio",
          title: "What was your biological sex at birth?",
          required: true,
          optionLayout: "text-only",
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ],
        },
      ],
      nextPage: "page-weight",
    },

    // ── 3. Current weight & height ────────────────────────────────────────────
    {
      id: "page-weight",
      content: [],
      questions: [
        {
          id: "q-weight-group",
          type: "form",
          title: "What is your current weight and height?",
          description: "We use this to calculate your BMI.",
          required: true,
          fields: [
            {
              id: "q-weight",
              fieldType: "number",
              label: "Current weight (lbs)",
              placeholder: "e.g. 185",
              required: true,
              min: 50,
              max: 600,
            },
            {
              id: "q-height-feet",
              fieldType: "number",
              label: "Height — feet",
              placeholder: "e.g. 5",
              required: true,
              min: 3,
              max: 8,
            },
            {
              id: "q-height-inches",
              fieldType: "number",
              label: "Height — inches",
              placeholder: "e.g. 10",
              required: true,
              min: 0,
              max: 11,
            },
          ],
        },
      ],
      nextPage: "page-goal-weight",
    },

    // ── 4. Goal weight ────────────────────────────────────────────────────────
    {
      id: "page-goal-weight",
      content: [],
      questions: [
        {
          id: "q-goal-group",
          type: "form",
          title: "What is your goal weight?",
          required: true,
          fields: [
            {
              id: "q-goal-weight",
              fieldType: "number",
              label: "Goal weight (lbs)",
              placeholder: "e.g. 160",
              required: true,
              min: 50,
              max: 600,
            },
          ],
        },
      ],
      nextPage: "page-pace",
    },

    // ── 5. Pace preference ────────────────────────────────────────────────────
    {
      id: "page-pace",
      content: [],
      questions: [
        {
          id: "q-pace",
          type: "radio",
          title: "How fast do you want to lose weight?",
          description: "Choose the pace that best fits your lifestyle.",
          required: true,
          optionLayout: "horizontal",
          options: [
            {
              value: "fast",
              label: "As fast as possible",
              description: "Aggressive — maximise medication potency",
            },
            {
              value: "moderate",
              label: "Moderate pace",
              description: "Balanced — effective with fewer side effects",
            },
            {
              value: "steady",
              label: "Slow and steady",
              description: "Gentle — focus on long-term sustainability",
            },
          ],
        },
      ],
      nextPage: "page-sleep",
    },

    // ── 6. Sleep hours ────────────────────────────────────────────────────────
    {
      id: "page-sleep",
      content: [],
      questions: [
        {
          id: "q-sleep",
          type: "radio",
          title: "On average, how many hours do you sleep per night?",
          required: true,
          optionLayout: "text-only",
          options: [
            { value: "less-than-5", label: "Less than 5 hours" },
            { value: "6-7", label: "6 – 7 hours" },
            { value: "8-9", label: "8 – 9 hours" },
            { value: "more-than-9", label: "More than 9 hours" },
          ],
        },
      ],
      nextPage: "page-conditions",
    },

    // ── 7. Medical conditions — with warning popup for thyroid ────────────────
    {
      id: "page-conditions",
      content: [],
      questions: [
        {
          id: "q-conditions",
          type: "multi-select",
          title: "Do any of the following apply to you?",
          description: "Select all that apply.",
          required: true,
          optionLayout: "text-only",
          options: [
            { value: "type2-diabetes", label: "Type 2 diabetes" },
            { value: "high-blood-pressure", label: "High blood pressure" },
            { value: "high-cholesterol", label: "High cholesterol" },
            { value: "sleep-apnea", label: "Sleep apnea" },
            { value: "thyroid", label: "Thyroid condition" },
            { value: "none", label: "None of the above" },
          ],
        },
      ],
      // Warning popup fires if user selected "thyroid" before navigating away
      popup: {
        mode: "warning",
        title: "Important notice",
        body: "Certain thyroid conditions may affect GLP-1 medication eligibility. Your prescribing physician will review this during your consultation and confirm the safest option for you.",
        canContinue: true,
        ctaLabel: "I understand, continue",
        condition: (answers) =>
          Array.isArray(answers["q-conditions"]) &&
          answers["q-conditions"].includes("thyroid"),
      },
      nextPage: "page-willingness",
    },

    // ── 8. Lifestyle willingness ──────────────────────────────────────────────
    {
      id: "page-willingness",
      content: [],
      questions: [
        {
          id: "q-willingness",
          type: "multi-select",
          title: "Which lifestyle changes are you open to making?",
          description: "Select all that apply.",
          required: true,
          optionLayout: "text-only",
          options: [
            { value: "reduce-calories", label: "Reduce caloric intake" },
            { value: "increase-activity", label: "Increase physical activity" },
            { value: "track-food", label: "Track food intake" },
            { value: "medication-only", label: "I prefer medication only" },
          ],
        },
      ],
      nextPage: "page-priority",
    },

    // ── 9. Medication priority — with "page" popup interlude before results ───
    {
      id: "page-priority",
      content: [],
      questions: [
        {
          id: "q-priority",
          type: "radio",
          title: "What matters most to you in a weight loss medication?",
          required: true,
          optionLayout: "horizontal",
          options: [
            {
              value: "affordability",
              label: "Affordability",
              description: "Lower monthly cost, proven results",
            },
            {
              value: "potency",
              label: "Maximum potency",
              description: "Most effective option currently available",
            },
          ],
        },
      ],
      // "page" popup shown after answering — informational interlude
      popup: {
        mode: "page",
        content: [
          {
            type: "heading",
            text: "Analysing your responses…",
          },
          {
            type: "paragraph",
            text: "Based on your answers we are identifying the best GLP-1 options for your profile. This only takes a moment.",
          },
        ],
        cta: "See my recommendation",
      },
      nextPage: "page-complete",
    },

    // ── 10. Completion — final page, no CTA ───────────────────────────────────
    {
      id: "page-complete",
      content: [
        {
          type: "heading",
          text: "You're all set!",
        },
        {
          type: "paragraph",
          text: "Your answers have been saved. A MyRocky physician will review your profile and recommend the right GLP-1 treatment for you.",
        },
        {
          type: "paragraph",
          text: "You'll receive a follow-up by email shortly.",
          className: "text-gray-500 text-sm leading-relaxed",
        },
      ],
      questions: [],
      // nextPage: null — no CTA button rendered on this page
      nextPage: null,
    },
  ],
};
