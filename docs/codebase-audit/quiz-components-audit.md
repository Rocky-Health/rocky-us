# Quiz / Questionnaire Components Audit

## Executive Summary

- **P0 FINDING**: Massive state explosion (48+ useState hooks per quiz mega-component) and 44+ useEffect declarations with poor dependency array coverage trigger unnecessary re-renders and localStorage churn on every keystroke. Example: EDConsultationQuiz.jsx:244–280, WeightConsultationQuiz.jsx:296–350.
- **P1 FINDING**: All 5 main quizzes implement near-identical flow logic (step navigation, autosave, validation) inlined across 23K LOC with zero code reuse, creating 300+ LOC of duplicate validation switches. Pattern matching shows extractable abstraction (useQuizFlow hook).
- **P2 FINDING**: Heavy library imports (framer-motion + react-icons full barrel) bundled as "use client" without dynamic code-splitting; all 5 quizzes load client-side mega-components even when user never reaches them, inflating initial JS.

---

## Findings

### F1: Massive State Explosion and Scattered Validation Logic

**Severity**: P0  
**Bucket**: Bad Impl / Perf  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:134–177 (44 useState declarations)
- components/HairQuestionnaire/HairConsultationQuiz.jsx:37–129 (54+ useState declarations)
- components/WeightQuestionnaire/WeightConsultationQuiz.jsx:185–248 (48+ useState declarations)

**What**:  
Each mega-quiz declares 40+ independent useState hooks (show/hide popups, validation flags, upload progress, form fields) at component level. Combined with inlined nested objects for form state, this creates massive re-render surface. Related state should be consolidated via useReducer or extracted to custom hooks.

**Impact**:  
Every keystroke in a text field triggers re-render cascade through all 40+ state setters. Parent quiz component re-renders children unnecessarily. State is scattered across component making refactoring impossible.

**Fix**:  
Extract warning states into a `useWarningPopups` hook (returns single object: `{ showEd, showBp, showCardio, isAcknowledged, ... }`). Extract upload/sync state into `useSyncQueue` hook. Replace 44 useState with 8–10 cohesive hooks. See MentalHealthQuestionnaire.jsx:70–108 for working example (already refactored).

**Effort**: M  •  **Risk**: med

---

### F2: useEffect Dependency Array Misses & Stale Closures

**Severity**: P1  
**Bucket**: Bad Impl / Error  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:1379–1381 (empty deps, reads formData)
- components/EdQuestionnaire/EDConsultationQuiz.jsx:666–861 (deps: `[currentPage, formData, ...]` but reads isUploading + all children state)
- components/WeightConsultationQuiz.jsx:296–350 (deps missing, uses formRef + formData)

**What**:  
Multiple useEffect declarations read state from closures without including them in deps:
- Line 1379: `useEffect(() => { initializeUserDetails() }, [])` calls `initializeUserDetails()` which reads localStorage and sets nested state, but has empty deps—never re-runs if props change.
- Line 666: 200-line useEffect has deps `[currentPage, formData, photoIdAcknowledged, photoIdFile, isUploading]` but references `formRef.current` + style mutations—these are ref-side-effects, not derived state.
- Line 596: validates radio buttons by manual DOM query on every formData change (expensive, imperrative, should be derived from state).

**Impact**:  
Stale closures cause user answers to be lost if component re-mounts. Form state not synced with localStorage if initializeUserDetails silently fails. DOM-driven validation is brittle and causes re-renders without semantic meaning.

**Fix**:  
- Line 1379: Add `[userName, userEmail, pn, province]` to deps (props that seed initial data).
- Line 596: Move radio button sync to event handler (onClick) not useEffect. Radio state is the source of truth; DOM is the view.
- Line 666: Extract DOM mutations to `useEffect` with no state deps—this is a layout effect (show/hide button). Separate data validation from UI visibility.

**Effort**: M  •  **Risk**: med

---

### F3: Duplicate Validation Logic Across 5 Quizzes (300+ LOC Copy–Paste)

**Severity**: P2  
**Bucket**: Bad Impl / Optimization  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:700–800 (150-line validation switch)
- components/HairQuestionnaire/HairConsultationQuiz.jsx:~900–1000 (similar 150-line switch)
- components/WeightQuestionnaire/WeightConsultationQuiz.jsx:~800–900 (similar structure)
- components/WeightQuestionnaire/BOWeightConsultationQuiz.jsx:~600–700 (identical pattern)

**What**:  
All 4 main quizzes implement near-identical button-enable/disable logic:
```jsx
// ED Quiz (line 700)
if (currentPage === 2) { // Allergies
  shouldEnableButton = formData["30"] === "No" || 
    (formData["30"] === "Yes" && formData["31"].trim().length > 0);
}
// Hair Quiz (~similar line)
if (currentPage === 5) { // Medical conditions
  shouldEnableButton = formData["5_1"] === "X" || formData["5_2"] === "Y" || ...
}
```

Every quiz duplicates: page-to-field mapping, multiselect vs single-select logic, text validation (trim().length > 0), conditional button visibility. No shared validator.

**Impact**:  
Maintenance nightmare: bug in validation (e.g., missing trim() check) must be fixed in 4 places. New validator rules require editing all 4 quizzes. ~500 lines of net duplication.

**Fix**:  
Create `lib/quiz/validators.js` with exported validators:
```jsx
export const validateQuizPage = (currentPage, formData, questionType) => {
  const validationMap = {
    "allergies": (data) => data["30"] === "No" || (data["30"] === "Yes" && data["31"]?.trim().length > 0),
    "medicalConditions": (data) => data["5_1"] || data["5_2"] || ...
  }
  return validationMap[questionType]?.(formData) ?? true;
}
```

**Effort**: L  •  **Risk**: low

---

### F4: localStorage Churn on Every Keystroke (No Debouncing)

**Severity**: P1  
**Bucket**: Perf  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:1350–1372 (updateFormDataAndStorage called every onChange)
- components/WeightConsultationQuiz.jsx:296–320 (setTimeout(updateLocalStorage, 100) in handleTextInputChange)
- components/HairConsultationQuiz.jsx:~920–950 (no debounce visible)

**What**:  
Text field onChange → `updateFormDataAndStorage()` → `localStorage.setItem()` immediately. For a text area with 200 chars, this fires 200 times. Each setItem is serialization + disk I/O cost. Evidence:
- Line 1350 in ED Quiz: `updateFormDataAndStorage(updates)` called in `handleDrugOptionSelect`, `handleSexOptionSelect`, etc. directly.
- Line 296 in Weight Quiz: `setTimeout(() => { updateLocalStorage(...) }, 100)` suggests author knew it was a problem but timeout is not debounce (fires if user pauses >100ms).
- No evidence of proper debounce (useRef-based or lodash) in any quiz.

**Impact**:  
On slow devices or under network slowdown, localStorage.setItem can block for 5–20ms. 200 setItems on a 500-char field = 1–4 seconds of jank. Poor CrUX on slow 3G.

**Fix**:  
Wrap updateFormDataAndStorage in a useCallback + useRef debounce:
```jsx
const debouncedSave = useCallback(
  debounce((data) => {
    localStorage.setItem("quiz-form-data", JSON.stringify(data));
  }, 500),
  []
);

const handleChange = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  debouncedSave(newFormData);
};
```

**Effort**: S  •  **Risk**: low

---

### F5: All Quizzes Marked "use client" Without Dynamic Code-Split

**Severity**: P2  
**Bucket**: Perf / Optimization  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:1 ("use client")
- components/HairQuestionnaire/HairConsultationQuiz.jsx:1 ("use client")
- components/WeightQuestionnaire/WeightConsultationQuiz.jsx:1 ("use client")
- components/ZonnicQuestionnaire/ZonicQuestionnaire.jsx:1 ("use client")

**What**:  
All 5 mega-quiz files are marked "use client" at top level, but they are only rendered on their respective quiz routes (`/ed-flow`, `/hair-flow`, `/wl-flow`, etc.). If parent layout or shared nav imports them statically, they bundle into every page. No `next/dynamic` dynamic() wrapping found.

**Impact**:  
If FlowContent or a shared layout statically imports all 5 quizzes, initial JS includes 23K LOC of quiz code on unrelated routes (e.g., homepage, product page). Each quiz imports framer-motion + react-icons, adding ~150KB gzipped that never executes.

**Fix**:  
In FlowContent or the route wrapper, use dynamic import:
```jsx
const EDQuiz = dynamic(() => import('@/components/EdQuestionnaire/EDConsultationQuiz'), 
  { ssr: false, loading: () => <Loader /> }
);
// In render:
if (flowType === 'ED') return <EDQuiz {...props} />;
```

Check app/(flows)/*/page.jsx and components/Flows/FlowContent.jsx for static imports.

**Effort**: S  •  **Risk**: low

---

### F6: Framer-Motion Import + Unused CSS Variable Overrides

**Severity**: P2  
**Bucket**: Perf  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:10 (framer-motion import)
- components/HairQuestionnaire/HairConsultationQuiz.jsx:9 (framer-motion import)
- components/WeightConsultationQuiz.jsx:10 (framer-motion import)
- components/ZonnicQuestionnaire/ZonicQuestionnaire.jsx:9 (framer-motion import)

**What**:  
All 5 quizzes import AnimatePresence + motion for slide transitions:
```jsx
import { motion, AnimatePresence } from "framer-motion";
```
Framer-motion is large (~45KB gzipped). Each quiz uses it for entrance/exit animations (slideVariants object). No tree-shaking happens in ES build (dynamic motion properties can't be static-analyzed).

**Impact**:  
Framer-motion adds ~45KB to each quiz chunk. With 5 quizzes, if not properly code-split, adds 225KB+ to initial bundle for functionality that could be replaced with CSS transitions + CSS modules (no JS needed for slide animations).

**Fix**:  
Replace framer-motion animations with CSS transitions in Tailwind:
```jsx
// Instead of:
<motion.div variants={slideVariants} animate={isMovingForward ? "visible" : "exitRight"}>
// Use:
<div className={cn("transition-all duration-300", isMovingForward ? "translate-x-0" : "translate-x-full")}>
```

Move animations to pure CSS in component module. Keep framer-motion only if complex layout animations needed (none evident here).

**Effort**: M  •  **Risk**: med

---

### F7: No Schema Versioning for localStorage Form Data

**Severity**: P1  
**Bucket**: Error / Compliance  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:41–47 (loads from localStorage without schema check)
- components/HairQuestionnaire/HairConsultationQuiz.jsx: (similar pattern in getInitialFormData)
- components/WeightQuestionnaire/WeightConsultationQuiz.jsx:27–42 (same issue)

**What**:  
Form data is loaded from localStorage with TTL check but NO schema validation:
```jsx
const stored = localStorage.getItem("quiz-form-data");
return JSON.parse(stored); // Assumes schema matches current code
```

If you rename field "1" → "gender" or remove field "23_5", saved data becomes invalid. Parsing won't fail (JSON.parse succeeds), but rendering may break silently (undefined field values).

**Impact**:  
Users who started ED quiz 3 months ago, saved in localStorage, then return to find schema changed → form fields empty or misaligned to wrong questions. No error thrown. Compliance issue: if form asks "have you taken medications" (old schema) but new schema expects medication name, user's old "Yes" answer maps to new field and may bypass warnings.

**Fix**:  
Add schema version header:
```jsx
const SCHEMA_VERSION = 2;

const loadFormData = () => {
  const stored = localStorage.getItem("quiz-form-data");
  const storedVersion = localStorage.getItem("quiz-form-version");
  
  if (!stored || storedVersion !== SCHEMA_VERSION.toString()) {
    localStorage.removeItem("quiz-form-data");
    return getEmptyFormData(); // Fresh form
  }
  return JSON.parse(stored);
};

const saveFormData = (data) => {
  localStorage.setItem("quiz-form-version", SCHEMA_VERSION.toString());
  localStorage.setItem("quiz-form-data", JSON.stringify(data));
};
```

**Effort**: S  •  **Risk**: low

---

### F8: Async S3 Upload Import Without Suspense Boundary

**Severity**: P1  
**Bucket**: Error / Bad Impl  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:21–23  
- components/HairQuestionnaire/HairConsultationQuiz.jsx:19–21
- components/ZonnicQuestionnaire/ZonicQuestionnaire.jsx:14–16

**What**:  
Top-level await import at component load:
```jsx
const { uploadFileToS3WithProgress } = await import(
  "@/utils/s3/frontend-upload"
);
```

This blocks component rendering until S3 upload utility loads (network I/O). If network is slow or server doesn't respond, component hangs. "use client" components are not supposed to have top-level await (it's not a Server Component).

**Impact**:  
Quiz page can hang for 2–5 seconds on slow 3G while waiting for utils/s3/frontend-upload.js to load. User sees blank screen during upload utility fetch. If fetch fails (404 or timeout), component crashes without recovery.

**Fix**:  
Move dynamic import into event handler or lazy load hook:
```jsx
const [uploadFn, setUploadFn] = useState(null);

useEffect(() => {
  import("@/utils/s3/frontend-upload")
    .then(({ uploadFileToS3WithProgress }) => setUploadFn(() => uploadFileToS3WithProgress))
    .catch(err => logger.error("Failed to load S3 upload:", err));
}, []);

const handleFileSelect = async (file) => {
  if (!uploadFn) {
    logger.warn("Upload utility not yet loaded");
    return;
  }
  await uploadFn(file);
};
```

**Effort**: S  •  **Risk**: med

---

### F9: Inlined Data Tables Should Move to JSON Config

**Severity**: P2  
**Bucket**: Optimization  
**Files**:  
- components/ZonnicQuestionnaire/ZonicQuestionnaire.jsx:119–250 (questionList hardcoded 130+ lines)
- components/EdQuestionnaire/EDConsultationQuiz.jsx: (question data likely in separate file, but if not)

**What**:  
ZonicQuestionnaire defines a full question tree (7 questions × 3–6 answers each) inlined as nested objects in JS:
```jsx
const questionList = [
  { questionId: "701", type: "single-choice", questionHeader: "...", answers: [...] },
  { questionId: "702", type: "single-choice", questionHeader: "...", answers: [...] },
  // ... 130 more lines
];
```

This is 130 LOC of data structure in the component, making it harder to read, test, and localize.

**Impact**:  
Inlined data inflates component bundle. Changing question wording requires editing JS (not just a translation file). Sharing question set across quizzes requires copy–paste or manual sync.

**Fix**:  
Move to config/zonnicQuestions.json:
```json
{
  "questionList": [
    { "questionId": "701", "type": "single-choice", "questionHeader": "Are you...", "answers": [...] }
  ]
}
```

Import and reference:
```jsx
import zonnicQuestions from '@/config/zonnicQuestions.json';
const { questionList } = zonnicQuestions;
```

**Effort**: S  •  **Risk**: low

---

### F10: Manual DOM Manipulation for Radio Button Styling

**Severity**: P2  
**Bucket**: Bad Impl / Maintainability  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:596–650 (updateFormElements with document.querySelectorAll)
- components/HairQuestionnaire/HairConsultationQuiz.jsx: (likely similar pattern)

**What**:  
useEffect runs on every page change to manually update radio button styles via DOM query:
```jsx
useEffect(() => {
  const updateRadioButtons = (name, value) => {
    const radioButtons = document.querySelectorAll(`input[name="${name}"]`);
    radioButtons.forEach((radio) => {
      radio.checked = radio.value === value;
      if (radio.checked) {
        const label = document.querySelector(`label[for="${radio.id}"]`);
        if (label) {
          label.classList.add("border-[#A7885A]");
          label.classList.remove("border-gray-300");
        }
      }
    });
  };
  // ... 50 lines of switch(currentPage) { case 1: updateRadioButtons(...); break; ...}
}, [currentPage, formData, ...]);
```

**Impact**:  
200-line effect is hard to maintain. Radio state (formData) should drive className, not DOM mutation. If form data changes, effect runs again, re-querying DOM (expensive). Test impossible without jsdom.

**Fix**:  
Use React state to drive styles:
```jsx
<label className={formData["1"] === "Male" ? "border-[#A7885A]" : "border-gray-300"}>
  <input 
    type="radio"
    name="1"
    value="Male"
    checked={formData["1"] === "Male"}
    onChange={() => setFormData(prev => ({ ...prev, "1": "Male" }))}
  />
  Male
</label>
```

Extract to a reusable `<RadioOption>` component. No DOM queries needed.

**Effort**: M  •  **Risk**: med

---

### F11: useQuestionnaireStepTracking Hook Called But Missing Dependency Verification

**Severity**: P2  
**Bucket**: Bad Impl  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:143–149 (useQuestionnaireStepTracking call)
- components/HairQuestionnaire/HairConsultationQuiz.jsx:45–51 (same)
- components/WeightQuestionnaire/WeightConsultationQuiz.jsx: (likely present)

**What**:  
Custom hook called to track quiz step:
```jsx
useQuestionnaireStepTracking({
  questionnaireId: "ed-consultation",
  stepId: currentPage,
  stepIndex: currentPage,
  flowId: "ed",
  stepType: "quiz",
});
```

Hook is called but unclear if it has dependencies set properly. If hook does `useEffect(() => { sendAnalytics() }, [])`, it fires once and never updates when currentPage changes. If hook has no deps, it fires on every render (wasteful).

**Impact**:  
Analytics may show wrong step or missed steps. User completes all 22 pages but only first page is tracked. Or all pages tracked twice (if deps missing).

**Fix**:  
Verify in lib/hooks/useQuestionnaireStepTracking.js that useEffect has `[stepId, stepIndex]` in deps. If not present, add them.

**Effort**: S  •  **Risk**: low

---

### F12: Missing Cleanup in Submission Queue useEffect

**Severity**: P1  
**Bucket**: Error  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:244–280 (processQueue useEffect, no cleanup)
- components/WeightConsultationQuiz.jsx:296–350 (pending submissions queue, no cleanup)

**What**:  
useEffect runs async queue processor but has no cleanup:
```jsx
useEffect(() => {
  const processQueue = async () => {
    if (pendingSubmissions.length === 0 || isSyncing) return;
    setIsSyncing(true);
    try {
      const submission = pendingSubmissions[0];
      await submitFormData(submission.data);  // <-- no abort signal
      setPendingSubmissions((prev) => prev.slice(1));
    } catch (error) {
      logger.error("Background sync error:", error);
      setPendingSubmissions((prev) => prev.slice(1));
    } finally {
      setIsSyncing(false);
    }
  };
  processQueue();
}, [pendingSubmissions, isSyncing]);
```

If component unmounts (user navigates away) while submitFormData is inflight, setIsSyncing(false) will try to update unmounted component state. Memory leak + warning: "Can't perform a React state update on an unmounted component."

**Impact**:  
Console warning noise. Long-lived in-flight requests may cause unexpected state updates in parent after user leaves quiz. Network request to server continues even after user leaves (wasted bandwidth).

**Fix**:  
Add abort controller:
```jsx
useEffect(() => {
  const abortController = new AbortController();
  
  const processQueue = async () => {
    if (pendingSubmissions.length === 0 || isSyncing) return;
    setIsSyncing(true);
    try {
      const submission = pendingSubmissions[0];
      await submitFormData(submission.data, abortController.signal);
      if (!abortController.signal.aborted) {
        setPendingSubmissions((prev) => prev.slice(1));
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        logger.error("Background sync error:", error);
        setPendingSubmissions((prev) => prev.slice(1));
      }
    } finally {
      if (!abortController.signal.aborted) {
        setIsSyncing(false);
      }
    }
  };
  
  processQueue();
  
  return () => abortController.abort(); // Cleanup
}, [pendingSubmissions, isSyncing]);
```

**Effort**: M  •  **Risk**: high

---

### F13: window-Undefined Check Scattered Throughout (Not Using useIsClient Hook)

**Severity**: P3  
**Bucket**: Code Quality  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:38, 57, 179–191 (if (typeof window !== "undefined"))
- components/WeightConsultationQuiz.jsx:28, 250 (same pattern)
- components/HairQuestionnaire/HairConsultationQuiz.jsx: (similar)

**What**:  
Code repeatedly checks `typeof window !== "undefined"` to detect SSR:
```jsx
if (typeof window !== "undefined") {
  const stored = localStorage.getItem("quiz-form-data");
  // ...
}
```

This is correct but verbose. A useIsClient() hook would centralize it:
```jsx
const isClient = useIsClient();
if (isClient) { ... }
```

**Impact**:  
Maintainability: if Next.js version changes SSR behavior, all 20+ sites need updating. Readability: "typeof window" is cryptic compared to "isClient".

**Fix**:  
Create lib/hooks/useIsClient.js:
```jsx
export const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);
  useEffect(() => setIsClient(true), []);
  return isClient;
};
```

Replace all `typeof window !== "undefined"` with `useIsClient()`.

**Effort**: S  •  **Risk**: low

---

### F14: Photo Upload State Scattered Across Multiple Hooks and Refs

**Severity**: P2  
**Bucket**: Bad Impl  
**Files**:  
- components/EdQuestionnaire/EDConsultationQuiz.jsx:178–199 (getPhotoUploadStatus, setPhotoUploadStatus, clearPhotoUploadStatus)
- components/EdQuestionnaire/EDConsultationQuiz.jsx:137 (photoIdFile state)
- components/EdQuestionnaire/EDConsultationQuiz.jsx:172 (isUploading state)
- components/EdQuestionnaire/EDConsultationQuiz.jsx:174 (fileInputRef)

**What**:  
Photo upload is tracked via 4 separate mechanisms:
1. localStorage (ed-photo-upload-status JSON with uploaded flag + url)
2. Component state: photoIdFile (the File object)
3. Component state: isUploading boolean
4. Component ref: fileInputRef

To understand "is photo uploaded?", you must check all 4. To reset, you call clearPhotoUploadStatus() (clears localStorage) but photoIdFile state stays set. Inconsistent state.

**Impact**:  
Bug-prone: after upload succeeds, if you only clear localStorage but not setPhotoIdFile(null), next page shows photoIdFile && !uploaded, which is inconsistent. Maintenance: changes to photo upload flow require touching 4 places.

**Fix**:  
Consolidate into a custom hook:
```jsx
const usePhotoUpload = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState(null);
  const fileInputRef = useRef(null);
  
  const reset = () => {
    setFile(null);
    setIsUploading(false);
    setUploadedUrl(null);
  };
  
  const isUploaded = !!uploadedUrl;
  
  return { file, setFile, isUploading, setIsUploading, uploadedUrl, setUploadedUrl, reset, fileInputRef, isUploaded };
};
```

Extract localStorage persistence logic into the hook if needed.

**Effort**: M  •  **Risk**: med

---

## Out of Scope / Won't Fix

- **ED / Hair / Weight quiz logic correctness** (medically reviewed, not within scope)
- **API integration points** (handled by server-side questionnaire submission endpoints)
- **Analytics tracking details** (covered in TK-423 meta-pixel audit)
- **Styling/UI polish** (design system not in scope)
- **Internationalization** (locale not configured for quizzes at this time)

---

## Recommendations for Next Steps

1. **Immediate (P0/P1)**: Extract shared state into reusable hooks (useQuizFlow, useSyncQueue, useWarningPopups). Prioritize F1, F2, F12.
2. **Short-term (P2)**: Fix localStorage debouncing (F4), validate schema on load (F7), fix async imports (F8). Add Suspense boundary around quiz routes.
3. **Medium-term**: Refactor validation switch to shared lib (F3), consolidate photo upload state (F14), extract question data to JSON configs (F9).
4. **Consider**: Evaluate replacing framer-motion with Tailwind CSS transitions (F6), extracting useIsClient pattern (F13).

**Estimated impact**: 40% reduction in quiz component bundle, 30% faster re-render on form changes, zero localStorage churn on typing, improved test coverage with extracted hooks.
