"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useQuizEngine } from "./hooks/useQuizEngine";
import QuizPageRenderer from "./QuizPageRenderer";
import PopupRenderer from "./PopupRenderer";
import QuestionnaireNavbar from "@/components/EdQuestionnaire/QuestionnaireNavbar";
import { ProgressBar } from "@/components/EdQuestionnaire/ProgressBar";

const slideVariants = {
  hiddenRight: { x: "100%", opacity: 0 },
  hiddenLeft: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exitRight: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exitLeft: {
    x: "100%",
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

/**
 * QuizEngine
 *
 * Top-level orchestrator. Accepts a `config` prop (see wlPreConsultationConfig.js)
 * and renders the complete quiz UI:
 *
 *   ┌─────────────────────────────────────┐
 *   │  QuestionnaireNavbar (back button)  │  ← outside animation, always visible
 *   │  ProgressBar                        │  ← outside animation, always visible
 *   │ ┌─────────────────────────────────┐ │
 *   │ │  QuizPageRenderer               │ │  ← slides in/out with AnimatePresence
 *   │ │  (content blocks + questions    │ │
 *   │ │   + CTA button)                 │ │
 *   │ └─────────────────────────────────┘ │
 *   │  [PopupRenderer — warning overlay]  │  ← rendered above everything when active
 *   └─────────────────────────────────────┘
 *
 * "page" popups (informational interludes) are handled inside QuizPageRenderer
 * and replace the page content without an overlay.
 * "warning" popups are rendered here as a full-screen overlay via PopupRenderer.
 */
export default function QuizEngine({ config }) {
  const engine = useQuizEngine(config);

  const {
    currentPage,
    currentPageId,
    pageHistory,
    isMovingForward,
    activePopup,
    progress,
    goBack,
    resolvePopup,
  } = engine;

  if (!currentPage) return null;

  return (
    <div className="flex flex-col min-h-screen bg-white subheaders-font font-medium">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      {/* currentPage > 1 shows the back button; pageHistory.length maps to that */}
      <QuestionnaireNavbar
        onBackClick={goBack}
        currentPage={pageHistory.length + 1}
      />

      {/* ── Progress bar ───────────────────────────────────────────────────── */}
      <ProgressBar progress={progress} />

      {/* ── Animated page area ─────────────────────────────────────────────── */}
      <div className="flex-1 relative overflow-hidden">
        <AnimatePresence mode="wait" custom={isMovingForward}>
          <motion.div
            key={currentPageId}
            custom={isMovingForward}
            variants={slideVariants}
            initial={isMovingForward ? "hiddenRight" : "hiddenLeft"}
            animate="visible"
            exit={isMovingForward ? "exitRight" : "exitLeft"}
          >
            <QuizPageRenderer page={currentPage} engine={engine} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Warning popup overlay (rendered outside the animation layer) ───── */}
      {activePopup?.mode === "warning" && (
        <PopupRenderer popup={activePopup} onResolve={resolvePopup} />
      )}
    </div>
  );
}
