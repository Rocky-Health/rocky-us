"use client";

import { useMemo, useState } from "react";
import { FaLock } from "react-icons/fa6";
import { ALL_US_STATES } from "@/lib/constants/usStates";

const MONTHS = [
  { value: "", label: "Month" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const YEARS = Array.from({ length: 120 }, (_, i) =>
  String(new Date().getFullYear() - 18 - i),
);

function computeAge(year, month, day) {
  if (!year || !month || !day) return null;
  const dob = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(dob.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const hasBirthdayPassed =
    now.getMonth() > dob.getMonth() ||
    (now.getMonth() === dob.getMonth() && now.getDate() >= dob.getDate());
  if (!hasBirthdayPassed) age -= 1;
  return age;
}

export default function PrEdQuiz2EligibilityStep({
  step,
  onContinue,
  onBack,
  selectedValues,
}) {
  const [sexAtBirth, setSexAtBirth] = useState(
    selectedValues?.sexAtBirth || "Male",
  );
  const [month, setMonth] = useState(selectedValues?.month || "");
  const [day, setDay] = useState(selectedValues?.day || "");
  const [year, setYear] = useState(selectedValues?.year || "");
  const [height, setHeight] = useState(selectedValues?.height || "");
  const [weight, setWeight] = useState(selectedValues?.weight || "");
  const [stateCode, setStateCode] = useState(selectedValues?.state || "");

  const age = useMemo(() => computeAge(year, month, day), [year, month, day]);
  const isEligible = sexAtBirth === "Male" && age !== null && age >= 18;
  const hasRequiredFields =
    month && day && year && height && weight.trim() && stateCode && isEligible;

  const handleSubmit = () => {
    if (!hasRequiredFields) return;
    onContinue?.({
      sexAtBirth,
      month,
      day,
      year,
      height,
      weight: weight.trim(),
      state: stateCode,
    });
  };

  return (
    <main className="wizard-content mx-auto max-w-6xl px-4 pb-16">
      <div className="mx-auto max-w-5xl px-6 pt-2">
        <button
          type="button"
          onClick={() => onBack?.()}
          className="inline-flex items-center gap-1 text-gray-600 transition duration-200 hover:text-blue-500"
          aria-label="Go back"
        >
          <span className="text-lg">←</span>
        </button>
      </div>

      <div className="wizard-step">
        <div className="step-content">
          <section className="w-full bg-[#F5F4EF] pt-4 md:pt-8">
            <div className="mx-auto max-w-xl">
              <h2
                className="headers-font mb-6 font-extrabold leading-tight text-[#171d2c]"
                style={{
                  fontSize: "clamp(2rem, 7vw, 3.25rem)",
                  lineHeight: 1.1,
                }}
              >
                {step.title}
              </h2>
              {step.subtitle ? (
                <p className="poppins-font mb-8 text-base leading-relaxed text-[#1b2431]/85">
                  {step.subtitle}
                </p>
              ) : null}

              <div className="mb-8 rounded-2xl bg-[#1c1b19] p-5 ring-1 ring-[#AE7E56]/25">
                <p className="poppins-font mb-1 text-sm font-semibold text-[#AE7E56]">
                  It's just like intake forms at the doctor.
                </p>
                <p className="poppins-font text-sm text-white/80">
                  Patients must be male (sex assigned at birth) and at least 18
                  years of age.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="step-fields mt-6 mx-auto flex max-w-xl flex-wrap">
        <div className="w-full">
          <div className="mb-5">
            <p className="poppins-font mb-3 text-sm">Sex assigned at birth</p>
            <div className="grid grid-cols-2 gap-3">
              {["Male", "Female"].map((option) => {
                const active = sexAtBirth === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSexAtBirth(option)}
                    className={`poppins-font rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      active
                        ? "bg-[#1c1b19] text-white"
                        : "bg-white text-[#1b2431]"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="w-full">
          <p className="poppins-font mb-3 text-sm text-[#5c6577]">
            Date of Birth
          </p>
        </div>

        <div className="w-1/3 sm:pr-2">
          <div className="mb-4">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="poppins-font w-full rounded-xl border border-[#d9dde3] bg-white px-3 py-3 text-sm text-[#1b2431]"
            >
              {MONTHS.map((m) => (
                <option
                  key={m.value || "month"}
                  value={m.value}
                  disabled={m.value === ""}
                >
                  {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-1/3 sm:pr-2">
          <div className="mb-4">
            <select
              value={day}
              onChange={(e) => setDay(e.target.value)}
              className="poppins-font w-full rounded-xl border border-[#d9dde3] bg-white px-3 py-3 text-sm text-[#1b2431]"
            >
              <option value="" disabled>
                Day
              </option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-1/3 sm:pr-2">
          <div className="mb-4">
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="poppins-font w-full rounded-xl border border-[#d9dde3] bg-white px-3 py-3 text-sm text-[#1b2431]"
            >
              <option value="" disabled>
                Year
              </option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="w-full">
          <div className="mb-4">
            <select
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="poppins-font w-full rounded-xl border border-[#d9dde3] bg-white px-3 py-3 text-sm text-[#1b2431]"
            >
              <option value="" disabled>
                Height
              </option>
              {Array.from({ length: 48 }, (_, i) => {
                const totalInches = 48 + i;
                const feet = Math.floor(totalInches / 12);
                const inches = totalInches % 12;
                const label = `${feet}' ${inches}"`;
                return (
                  <option key={totalInches} value={totalInches}>
                    {label}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="w-full">
          <div className="mb-4">
            <input
              type="text"
              value={weight}
              onChange={(e) => setWeight(e.target.value.replace(/[^\d]/g, ""))}
              className="poppins-font w-full rounded-xl border border-[#d9dde3] bg-white px-3 py-3 text-sm text-[#1b2431]"
              placeholder="Weight (in lbs)"
            />
          </div>
        </div>

        <div className="w-full">
          <div className="mb-4">
            <select
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="poppins-font w-full rounded-xl border border-[#d9dde3] bg-white px-3 py-3 text-sm text-[#1b2431]"
            >
              {ALL_US_STATES.map((entry) => (
                <option
                  key={`${entry.value}-${entry.label}`}
                  value={entry.value}
                  disabled={entry.value === ""}
                >
                  {entry.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-xl">
        <div className="wizard-navigation mt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!hasRequiredFields}
            className="headers-font flex w-full items-center justify-center rounded-3xl bg-[#1c1b19] px-6 py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{step.ctaLabel || "Continue"}</span>
            <span className="ml-3">→</span>
          </button>

          <div className="step-content mt-4">
            <div className="poppins-font mt-6 flex items-center justify-center gap-2 px-6 py-4 text-center text-sm text-[#5c6577]">
              <FaLock className="text-xs text-gray-500" aria-hidden />
              <span>
                We protect your privacy. Your answers are protected by HIPAA.
              </span>
            </div>

            <div className="flex justify-center border-t border-white border-opacity-10 px-6 py-6">
              <img
                src="https://static.legitscript.com/seals/183773.png"
                alt="Verify Approval for www.directmeds.com"
                width={73}
                height={79}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
