/**
 * Returns true when the user must not proceed and the disqualification modal should show.
 *
 * - `disqualifyingValues` (string[]): single-select value or multi-select option in this list → disqualify
 * - `safeContinueValues` (string[]): if set, only these answer values may continue (else disqualify)
 */
function singleSelectStoredValue(answerValue) {
  if (typeof answerValue === "string") return answerValue;
  if (
    answerValue &&
    typeof answerValue === "object" &&
    typeof answerValue.value === "string"
  ) {
    return answerValue.value;
  }
  return null;
}

export function shouldDisqualifyOnAnswer(step, answerValue) {
  if (!step) return false;

  const disc = step.disqualifyingValues;
  const safe = step.safeContinueValues;

  if (step.type === "singleSelectQuiz") {
    const stored = singleSelectStoredValue(answerValue);
    if (stored === null) return false;

    if (Array.isArray(disc) && disc.length > 0 && disc.includes(stored)) {
      return true;
    }
    if (Array.isArray(safe) && safe.length > 0 && !safe.includes(stored)) {
      return true;
    }
    return false;
  }

  if (step.type === "multiSelect") {
    if (!Array.isArray(answerValue)) return false;

    if (typeof step.solePassValue === "string") {
      const ok =
        answerValue.length === 1 && answerValue[0] === step.solePassValue;
      return !ok;
    }

    if (Array.isArray(disc) && disc.length > 0) {
      return answerValue.some((v) => disc.includes(v));
    }
    return false;
  }

  return false;
}
