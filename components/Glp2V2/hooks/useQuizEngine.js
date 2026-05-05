"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

function readPersistedState(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`quiz-state-${key}`);
    if (!raw) return null;
    const saved = JSON.parse(raw);
    if (!saved?.savedAt || Date.now() - saved.savedAt > TTL_MS) return null;
    return saved;
  } catch {
    return null;
  }
}

/**
 * useQuizEngine
 *
 * Generic quiz state engine. Pass a config object (see wlPreConsultationConfig.js
 * for the full schema) and get back everything needed to drive the quiz UI.
 *
 * State is persisted to localStorage under quiz-state-{config.persistenceKey}.
 * Stale state (> 24 h) is automatically discarded on mount.
 * State is cleared from localStorage after a successful submitAnswers() call.
 *
 * If config.submission.url is absent/null the API call is skipped silently.
 */
export function useQuizEngine(config) {
  const { pages, persistenceKey, submission } = config;

  // Build O(1) id→page lookup map
  const pageMap = useMemo(
    () => Object.fromEntries(pages.map((p) => [p.id, p])),
    [pages]
  );

  // ── State ────────────────────────────────────────────────────────────────────
  // Initialise with defaults; localStorage restoration happens in useEffect
  // to avoid SSR/hydration mismatches.
  const [currentPageId, setCurrentPageId] = useState(pages[0]?.id ?? null);
  const [pageHistory, setPageHistory] = useState([]);
  const [answers, setAnswersState] = useState({});
  const [activePopup, setActivePopup] = useState(null);
  const [isMovingForward, setIsMovingForward] = useState(true);

  // ── Restore persisted state after mount ───────────────────────────────────
  useEffect(() => {
    const saved = readPersistedState(persistenceKey);
    if (!saved) return;
    // Guard: make sure the saved page still exists in the current config
    if (saved.currentPageId && pageMap[saved.currentPageId]) {
      setCurrentPageId(saved.currentPageId);
    }
    if (Array.isArray(saved.pageHistory)) {
      setPageHistory(saved.pageHistory);
    }
    if (saved.answers && typeof saved.answers === "object") {
      setAnswersState(saved.answers);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist on every state change ─────────────────────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(
        `quiz-state-${persistenceKey}`,
        JSON.stringify({
          currentPageId,
          pageHistory,
          answers,
          savedAt: Date.now(),
        })
      );
    } catch {
      // localStorage may be full or unavailable — fail silently
    }
  }, [currentPageId, pageHistory, answers, persistenceKey]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const currentPage = pageMap[currentPageId] ?? pageMap[pages[0]?.id];

  const currentPageIndex = useMemo(
    () => pages.findIndex((p) => p.id === currentPageId),
    [pages, currentPageId]
  );

  const progress = useMemo(() => {
    if (pages.length <= 1) return 0;
    return Math.round((currentPageIndex / (pages.length - 1)) * 100);
  }, [currentPageIndex, pages.length]);

  /**
   * canAdvance — true when the user may press Continue on the current page.
   *
   * Rules (applied in order):
   *  1. Explicit page.requirements (type: "answered" | "custom")
   *  2. Auto-derived from question.required (and field.required for "form" type)
   *
   * Content-only pages (no questions, no requirements) always return true.
   */
  const canAdvance = useMemo(() => {
    if (!currentPage) return false;

    // 1. Explicit requirements
    for (const req of currentPage.requirements ?? []) {
      if (req.type === "answered") {
        for (const qId of req.questionIds ?? []) {
          const v = answers[qId];
          const empty = Array.isArray(v) ? v.length === 0 : v == null || v === "";
          if (empty) return false;
        }
      } else if (req.type === "custom") {
        if (!req.validate(answers)) return false;
      }
    }

    // 2. Auto-derived from required questions
    for (const q of currentPage.questions ?? []) {
      if (q.type === "form") {
        // For form questions, respect individual field.required flags
        // only when the parent question itself is required
        if (!q.required) continue;
        for (const f of q.fields ?? []) {
          if (!f.required) continue;
          const v = answers[f.id];
          if (v == null || v === "") return false;
        }
      } else if (q.required) {
        const v = answers[q.id];
        const empty = Array.isArray(v) ? v.length === 0 : v == null || v === "";
        if (empty) return false;
      }
    }

    return true;
  }, [currentPage, answers]);

  // ── Actions ────────────────────────────────────────────────────────────────

  /** Update a single answer. For multi-select, pass the full array. */
  const setAnswer = useCallback((questionId, value) => {
    setAnswersState((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  /**
   * Advance to the next page.
   * If the current page defines a popup whose condition passes, the popup is
   * shown first; actual navigation happens when resolvePopup(true) is called.
   */
  const goNext = useCallback(() => {
    if (!currentPage) return;

    const nextId =
      typeof currentPage.nextPage === "function"
        ? currentPage.nextPage(answers)
        : currentPage.nextPage;

    if (!nextId) return;

    // Check for a popup that intercepts navigation
    if (currentPage.popup) {
      const popup = currentPage.popup;
      const conditionMet =
        typeof popup.condition === "function" ? popup.condition(answers) : true;
      if (conditionMet) {
        // Store the resolved target page inside the popup so resolvePopup can use it
        setActivePopup({ ...popup, _nextPageId: nextId });
        return;
      }
    }

    setIsMovingForward(true);
    setPageHistory((prev) => [...prev, currentPageId]);
    setCurrentPageId(nextId);
  }, [currentPage, answers, currentPageId]);

  /** Navigate back to the previous page using the history stack. */
  const goBack = useCallback(() => {
    if (pageHistory.length === 0) return;
    setIsMovingForward(false);
    const newHistory = [...pageHistory];
    const prevId = newHistory.pop();
    setPageHistory(newHistory);
    setCurrentPageId(prevId);
  }, [pageHistory]);

  /**
   * Resolve the active popup.
   * proceed=true  → advance to popup._nextPageId
   * proceed=false → execute popup.exitAction ("back" | page-id) or go back
   */
  const resolvePopup = useCallback(
    (proceed) => {
      const popup = activePopup;
      setActivePopup(null);

      if (!proceed) {
        const exit = popup?.exitAction;
        if (!exit || exit === "back") {
          // Go back to previous page (same as pressing the back button)
          if (pageHistory.length > 0) {
            const newHistory = [...pageHistory];
            const prevId = newHistory.pop();
            setPageHistory(newHistory);
            setIsMovingForward(false);
            setCurrentPageId(prevId);
          }
        } else {
          // Jump to a specific page ID
          setIsMovingForward(false);
          setCurrentPageId(exit);
        }
        return;
      }

      // proceed = true: advance to the page that was queued before the popup
      if (popup?._nextPageId) {
        setIsMovingForward(true);
        setPageHistory((prev) => [...prev, currentPageId]);
        setCurrentPageId(popup._nextPageId);
      }
    },
    [activePopup, currentPageId, pageHistory]
  );

  /**
   * Submit answers to the configured API endpoint.
   * Skipped silently if config.submission.url is absent or null.
   * On success, clears localStorage for this quiz.
   */
  const submitAnswers = useCallback(async () => {
    if (!submission?.url) return null;

    const { url, fieldMap = {}, answerIdMap = {}, extraData = {} } = submission;

    const mappedAnswers = Object.entries(answers).reduce((acc, [qId, val]) => {
      const fieldName = fieldMap[qId] ?? qId;
      const mappedVal = answerIdMap[qId]?.[val] ?? val;
      acc[fieldName] = mappedVal;
      return acc;
    }, {});

    const body = { ...extraData, ...mappedAnswers };

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();

      // Clear persisted state after a successful submission
      if (typeof window !== "undefined") {
        localStorage.removeItem(`quiz-state-${persistenceKey}`);
      }

      return data;
    } catch {
      return null;
    }
  }, [answers, submission, persistenceKey]);

  return {
    // State
    currentPage,
    currentPageId,
    pageHistory,
    answers,
    activePopup,
    isMovingForward,
    progress,
    canAdvance,
    // Actions
    setAnswer,
    goNext,
    goBack,
    resolvePopup,
    submitAnswers,
  };
}
