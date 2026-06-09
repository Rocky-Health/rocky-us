"use client";

import { useState, useCallback } from "react";
import {
  peekQueue,
  isLastInSequence,
  getSequenceProgress,
  advanceQueue,
  clearQueue,
  buildQuizUrl,
  currentVertical,
  nextVertical,
} from "./questionnaireSequence";

/**
 * useQuizSequence
 *
 * Hook for questionnaire completion pages/steps to integrate with the
 * multi-questionnaire sequence.
 *
 * Usage:
 *   const { isSequenced, isLast, handleQuizComplete } = useQuizSequence(router);
 *
 *   - isSequenced:  true when a multi-quiz sequence is in progress
 *   - isLast:       true when this is the final quiz in the sequence
 *   - showIntermission: when true, render <QuestionnaireIntermission /> instead of
 *                       the normal completion screen
 *   - intermissionProps: props to pass directly to <QuestionnaireIntermission />
 *   - handleQuizComplete(purchasedProductName?): call when the quiz is done submitting.
 *     If a sequence is active and this is NOT the last quiz, it shows the intermission.
 *     Otherwise it falls through (caller should run their normal redirect).
 *
 * Returns:
 *   { isSequenced, isLast, showIntermission, intermissionProps, handleQuizComplete }
 */
export function useQuizSequence(router) {
  const [showIntermission, setShowIntermission] = useState(false);
  const [intermissionProps, setIntermissionProps] = useState(null);

  const queue = peekQueue();
  const isSequenced = queue !== null;
  const isLast = isSequenced ? isLastInSequence() : false;

  const handleQuizComplete = useCallback(
    (purchasedProductName) => {
      const activeQueue = peekQueue();

      if (!activeQueue) {
        // No sequence — fall through to caller's normal behavior
        return false;
      }

      if (isLastInSequence()) {
        // Last (or only) quiz in the sequence — clear queue and fall through
        clearQueue();
        return false;
      }

      // More quizzes ahead — show the intermission
      const progress = getSequenceProgress();
      const completedSlug = currentVertical();
      const nextSlug = nextVertical();

      if (!completedSlug || !nextSlug) {
        // Defensive: queue is in unexpected state, clear and fall through
        clearQueue();
        return false;
      }

      setIntermissionProps({
        completedVertical: completedSlug,
        nextVertical: nextSlug,
        sequenceN: progress.n,
        sequenceTotal: progress.total,
        onComplete: () => {
          const updatedQueue = advanceQueue();
          if (updatedQueue) {
            const nextQuizSlug = updatedQueue.verticals[updatedQueue.currentIndex];
            const url = buildQuizUrl(nextQuizSlug, updatedQueue, purchasedProductName);
            if (url) {
              router.push(url);
            } else {
              clearQueue();
              router.push("/");
            }
          } else {
            clearQueue();
            router.push("/");
          }
        },
      });

      setShowIntermission(true);
      return true; // Caller should NOT run its normal redirect
    },
    [router]
  );

  return {
    isSequenced,
    isLast,
    showIntermission,
    intermissionProps,
    handleQuizComplete,
  };
}
