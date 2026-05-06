"use client";

import { FaLock } from "react-icons/fa6";

function ContinueArrowIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
}

export default function PrEdQuiz2SingleSelectQuizStep({
  step,
  selectedAnswer,
  onSelect,
  onFollowUpChange,
  onContinue,
  onBack,
  canContinue: canContinueProp,
}) {
  const options = Array.isArray(step.options) ? step.options : [];
  const isObjectAnswer =
    selectedAnswer &&
    typeof selectedAnswer === "object" &&
    typeof selectedAnswer.value === "string";
  const selectedValue = isObjectAnswer
    ? selectedAnswer.value
    : typeof selectedAnswer === "string"
      ? selectedAnswer
      : null;
  const followUpText = isObjectAnswer ? (selectedAnswer.followUp ?? "") : "";
  const showFollowUp =
    Boolean(step.followUpWhenValue) && selectedValue === step.followUpWhenValue;

  const canContinue =
    typeof canContinueProp === "boolean" ? canContinueProp : Boolean(selectedValue);
  const fieldName = step.fieldName || "quiz_single_select";
  const followUpFieldName =
    step.followUpFieldName || `${fieldName}_detail`;
  // Unified with q7 (confidence): Rocky gold eyebrow + gold/beige option pills throughout.

  return (
    <section className="wizard-content mx-auto w-full max-w-6xl px-4 pb-16">
      <div className="mx-auto max-w-xl pt-2">
        <button
          type="button"
          onClick={() => onBack?.()}
          className="inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-[#AE7E56]"
          aria-label="Go back"
        >
          <span className="text-lg">←</span>
        </button>
      </div>

      <div className="wizard-step">
        <div className="step-fields mx-auto mt-6 flex max-w-xl flex-wrap">
          <div className="w-full">
            <div className="wizard-field mb-4">
              {step.eyebrow ? (
                <p className="poppins-font mb-3 text-sm font-medium tracking-wide text-[#AE7E56]">
                  {step.eyebrow}
                </p>
              ) : null}
              <h2
                className="headers-font mb-6 text-left text-4xl font-black leading-snug text-[#0d1728]"
                style={{ lineHeight: 1 }}
              >
                {step.title}
              </h2>
              <p className="sr-only">{step.title}</p>

              <div className="my-6 space-y-3">
                {options.map((opt) => {
                  const label = typeof opt === "string" ? opt : opt.label;
                  const value = typeof opt === "string" ? opt : opt.value;
                  const isSelected = selectedValue === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => onSelect(value)}
                      className={`poppins-font quiz-option flex w-full cursor-pointer items-center justify-between rounded-2xl px-5 py-4 text-left text-base font-medium transition-colors duration-200 ${
                        isSelected
                          ? "bg-[#AE7E56] text-white"
                          : "bg-[#ECE9E2] text-[#1b2431] hover:bg-[#E3D8CC] hover:text-[#111827]"
                      }`}
                    >
                      <span className="option-text">{label}</span>
                      <span
                        className={`option-dot h-6 w-6 shrink-0 rounded-full border ${
                          isSelected
                            ? "border-white bg-white"
                            : "border-[#D4D4D8] bg-transparent"
                        }`}
                        aria-hidden
                      />
                    </button>
                  );
                })}
              </div>

              {showFollowUp ? (
                <div className="mt-3 rounded-2xl border border-black/10 bg-white p-4">
                  {step.followUpLabel ? (
                    <label
                      htmlFor={`${followUpFieldName}-textarea`}
                      className="poppins-font mb-2 block text-sm text-black/55"
                    >
                      {step.followUpLabel}
                    </label>
                  ) : null}
                  <textarea
                    id={`${followUpFieldName}-textarea`}
                    name={followUpFieldName}
                    value={followUpText}
                    onChange={(e) => onFollowUpChange?.(e.target.value)}
                    rows={4}
                    className="poppins-font w-full resize-y rounded-xl border border-black/10 bg-[#F9F8F5] px-3 py-2 text-base text-[#1b2431] outline-none ring-0 focus:border-[#AE7E56]"
                  />
                </div>
              ) : null}

              <input type="hidden" name={fieldName} value={selectedValue || ""} readOnly />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="wizard-navigation mt-8">
          <button
            type="button"
            onClick={() => onContinue?.()}
            disabled={!canContinue}
            className="headers-font relative flex w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#2d2c2a] to-[#141312] px-6 py-4 font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{step.ctaLabel || "Continue"}</span>
            <span className="btn-arrow ml-3 inline-flex" aria-hidden>
              <ContinueArrowIcon />
            </span>
          </button>

          <div className="step-content mt-4">
            <div className="poppins-font mt-6 flex items-center justify-center gap-2 px-6 py-4 text-center text-sm text-black/65">
              <FaLock className="text-xs" aria-hidden />
              We protect your privacy. Your answers are protected by HIPAA.
            </div>

            <div className="mx-auto w-full border-t border-white/10" aria-hidden />

            <div className="footer-badge flex justify-center px-6 py-6">
              <img
                src="https://static.legitscript.com/seals/44796030.png"
                alt="LegitScript approved"
                width={73}
                height={79}
                className="h-[79px] w-[73px] object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
