"use client";

import { FaLock } from "react-icons/fa6";

function normalizeMultiOptions(raw) {
  const list = Array.isArray(raw) ? raw : [];
  return list.map((option) =>
    typeof option === "string"
      ? { label: option, value: option }
      : { label: option.label, value: option.value },
  );
}

export default function PrEdQuiz2MultiSelectStep({
  step,
  selectedValues,
  onToggle,
  onContinue,
  onBack,
  canContinue: canContinueProp,
}) {
  const normalizedOptions = normalizeMultiOptions(step.options);
  const selectedSet = new Set(selectedValues || []);
  const canContinue =
    typeof canContinueProp === "boolean"
      ? canContinueProp
      : selectedSet.size > 0;

  /** Full-bleed steps use hideWizardHeader; Flow omits its back row, so we show one here (matches singleSelectQuiz). */
  const showInStepBack = Boolean(step.hideWizardHeader && onBack);

  return (
    <section className="wizard-content mx-auto w-full max-w-6xl px-4 pb-16 ">
      {showInStepBack ? (
        <div className="mx-auto max-w-xl pt-2">
          <button
            type="button"
            onClick={() => onBack()}
            className="inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-[#AE7E56]"
            aria-label="Go back"
          >
            <span className="text-lg">←</span>
          </button>
        </div>
      ) : null}

      <div className="wizard-step">
        <div className="step-fields mx-auto mt-6 flex max-w-xl flex-wrap">
          <div className="w-full">
            {step.eyebrow ? (
              <p className="poppins-font mb-3 text-sm font-medium tracking-wide text-[#AE7E56]">
                {step.eyebrow}
              </p>
            ) : null}
            <h1 className="headers-font mb-6 text-left text-[2em] font-extrabold leading-[1] text-[#0d1728]">
              {step.title}
            </h1>
            {step.subtitle ? (
              <p className="poppins-font pb-4 text-left text-base text-[#111827]/80">
                {step.subtitle}
              </p>
            ) : null}

            <div className="my-6 space-y-3">
              {normalizedOptions.map(({ label, value }) => {
                const isSelected = selectedSet.has(value);
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => onToggle(value)}
                    className={`poppins-font flex h-14 w-full items-center justify-between rounded-2xl px-5 text-left text-base font-medium transition-colors duration-200 ${
                      isSelected
                        ? "bg-[#AE7E56] text-white"
                        : "bg-[#ECE9E2] text-[#1b2431] hover:bg-[#E3D8CC] hover:text-[#111827]"
                    }`}
                  >
                    <span>{label}</span>
                    <span
                      className={`h-6 w-6 rounded-full border ${
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
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="wizard-navigation mt-8">
          <button
            type="button"
            onClick={() => onContinue?.()}
            disabled={!canContinue}
            className="headers-font block w-full rounded-full bg-[#1c1b19] px-6 py-4 text-lg font-bold text-white transition-colors duration-200 hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue
          </button>

          <div className="step-content mt-4">
            <div className="poppins-font mt-6 flex items-center justify-center gap-2 px-6 py-4 text-center text-sm text-black/65">
              <FaLock className="text-xs" aria-hidden />
              We protect your privacy. Your answers are protected by HIPAA.
            </div>

            <div
              className="mx-auto w-full border-t-[2px] border-white"
              aria-hidden
            />

            <div className="flex justify-center px-6 py-6">
              <img
                src="https://static.legitscript.com/seals/44796030.png"
                alt="LegitScript approved"
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
