"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FaArrowRight } from "react-icons/fa";

// ── Constants ──────────────────────────────────────────────────────────────────

const LOW_RATE = 0.015;
const HIGH_RATE = 0.01666;

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

function getDaysInMonth(month, year) {
  if (!month) return 31;
  const y = year ? parseInt(year, 10) : 2000;
  return new Date(y, parseInt(month, 10), 0).getDate();
}

function computePace(weight, goalWeight) {
  const w = parseFloat(weight) || 0;
  const g = parseFloat(goalWeight) || 0;
  if (w <= 0 || g <= 0) return null;
  const lossPerWeekLow = +(w * LOW_RATE).toFixed(1);
  const lossPerWeekHigh = +(w * HIGH_RATE).toFixed(1);
  const lbs = Math.max(w - g, 0);
  const weeksToGoal =
    lossPerWeekLow > 0 ? Math.round(lbs / lossPerWeekLow) : null;
  return { lossPerWeekLow, lossPerWeekHigh, weeksToGoal };
}

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Progress header with Rocky logo + step tabs */
const ProgressHeader = () => {
  const steps = ["Questions", "Info", "Payment", "Confirmation"];
  return (
    <header className="glp2-v2-header w-full bg-white border-b border-[#EBEBEB] sticky top-0 z-50 flex items-center">
      <div className="max-w-[680px] w-full mx-auto px-5 py-3 flex items-center justify-between">
        {/* Rocky Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp"
          alt="Rocky"
          className="h-7 w-auto object-contain"
        />

        {/* Step indicators */}
        <div className="flex items-center gap-1">
          {steps.map((step, i) => {
            const isActive = i === 0;
            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <span
                    className={`text-[11px] font-medium leading-none ${
                      isActive ? "text-[#251F20]" : "text-[#ADADAD]"
                    }`}
                  >
                    {step}
                  </span>
                  <span
                    className={`mt-1.5 w-[5px] h-[5px] rounded-full ${
                      isActive ? "bg-[#AE7E56]" : "bg-[#E2E2E1]"
                    }`}
                  />
                </div>
                {i < steps.length - 1 && (
                  <div className="w-5 h-px bg-[#E2E2E1] mb-1" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </header>
  );
};

/** Single radio option button */
const RadioOption = ({ id, label, selected, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(id)}
    className={`w-full min-h-[52px] rounded-[8px] border px-4 text-left flex items-center gap-3 bg-white transition-colors ${
      selected ? "border-[#AE7E56]" : "border-[#E2E2E1] hover:border-[#CFCFCF]"
    }`}
  >
    <span
      className={`w-[18px] h-[18px] rounded-full border-2 flex items-center justify-center shrink-0 ${
        selected ? "border-[#AE7E56]" : "border-[#CFCFCF]"
      }`}
    >
      {selected && <span className="w-2.5 h-2.5 rounded-full bg-[#AE7E56]" />}
    </span>
    <span className="text-[14px] text-[#251F20] font-medium">{label}</span>
  </button>
);

/** Single checkbox option button (multi-select) */
const CheckboxOption = ({ id, label, selected, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(id)}
    className={`w-full min-h-[52px] rounded-[8px] border px-4 text-left flex items-center gap-3 bg-white transition-colors ${
      selected ? "border-[#AE7E56]" : "border-[#E2E2E1] hover:border-[#CFCFCF]"
    }`}
  >
    <span
      className={`w-[18px] h-[18px] rounded-[4px] border-2 flex items-center justify-center shrink-0 ${
        selected ? "border-[#AE7E56]" : "border-[#CFCFCF]"
      }`}
    >
      {selected && <span className="w-2.5 h-2.5 rounded-[2px] bg-[#AE7E56]" />}
    </span>
    <span className="text-[14px] text-[#251F20] font-medium">{label}</span>
  </button>
);

/** Question section title */
const SectionTitle = ({ children }) => (
  <h2 className="text-[17px] font-semibold text-[#251F20] mb-4 leading-[130%]">
    {children}
  </h2>
);

// ── Main Component ──────────────────────────────────────────────────────────────

const Glp2PreV2SinglePage = () => {
  const router = useRouter();

  const [form, setForm] = useState({
    heightFeet: "",
    heightInches: "",
    weight: "",
    goalWeight: "",
    sex: "",
    dobMonth: "",
    dobDay: "",
    dobYear: "",
    pacePreference: "",
    sleepHours: "",
    willingness: [],
    weightChanged: "",
    medicationPriority: "",
    stateOfMind: "",
  });

  const set = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ── Derived values ───────────────────────────────────────────────────────────

  const bmi = useMemo(() => {
    const feet = parseFloat(form.heightFeet) || 0;
    const inches = parseFloat(form.heightInches) || 0;
    const weight = parseFloat(form.weight) || 0;
    if (feet > 0 && weight > 0) {
      const totalInches = feet * 12 + (inches || 0);
      return ((weight / (totalInches * totalInches)) * 703).toFixed(1);
    }
    return null;
  }, [form.heightFeet, form.heightInches, form.weight]);

  const paceProjection = useMemo(
    () => computePace(form.weight, form.goalWeight),
    [form.weight, form.goalWeight],
  );

  const daysInMonth = getDaysInMonth(form.dobMonth, form.dobYear);
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );

  // ── Willingness toggle (multi-select with "none" exclusivity) ───────────────

  const toggleWillingness = (value) => {
    setForm((prev) => {
      const current = prev.willingness || [];
      let next;
      if (value === "none") {
        next = current.includes("none") ? [] : ["none"];
      } else {
        const withoutNone = current.filter((v) => v !== "none");
        next = withoutNone.includes(value)
          ? withoutNone.filter((v) => v !== value)
          : [...withoutNone, value];
      }
      return { ...prev, willingness: next };
    });
  };

  // ── Validation ───────────────────────────────────────────────────────────────

  const isValid =
    form.heightFeet !== "" &&
    form.heightInches !== "" &&
    form.weight !== "" &&
    form.goalWeight !== "" &&
    form.sex !== "" &&
    form.dobMonth !== "" &&
    form.dobDay !== "" &&
    form.dobYear !== "" &&
    form.dobYear.length === 4 &&
    form.pacePreference !== "" &&
    form.sleepHours !== "" &&
    form.willingness.length > 0 &&
    form.weightChanged !== "" &&
    form.medicationPriority !== "" &&
    form.stateOfMind !== "";

  // ── Submit ───────────────────────────────────────────────────────────────────

  const handleNext = () => {
    if (!isValid) return;
    const payload = {
      height: { feet: form.heightFeet, inches: form.heightInches },
      weight: form.weight,
      bmi,
      goalWeight: form.goalWeight,
      sex: form.sex,
      dateOfBirth: `${form.dobMonth}/${form.dobDay}/${form.dobYear}`,
      pacePreference: form.pacePreference,
      sleepHours: form.sleepHours,
      willingness: form.willingness,
      weightChangedLastYear: form.weightChanged,
      medicationPriority: form.medicationPriority,
      stateOfMind: form.stateOfMind,
    };
    try {
      sessionStorage.setItem("glp2PreV2Answers", JSON.stringify(payload));
    } catch {
      // sessionStorage may be unavailable — continue silently
    }
    router.push("/glp2-pre-v2/info");
  };

  // ── Shared style shortcuts ───────────────────────────────────────────────────

  const inputCls =
    "w-full h-[52px] border border-[#E2E2E1] rounded-[8px] px-4 bg-[#F9F9F9] text-[14px] text-[#251F20] placeholder-[#ADADAD] focus:outline-none focus:border-[#AE7E56]";

  const selectCls =
    "w-full h-[52px] border border-[#E2E2E1] rounded-[8px] px-3 pr-8 bg-[#F9F9F9] text-[14px] text-[#251F20] appearance-none focus:outline-none focus:border-[#AE7E56]";

  const chevron = (
    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#888] text-[10px]">
      ▾
    </span>
  );

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-white">
      <ProgressHeader />

      {/* ── Cover image ──────────────────────────────────────────────────────── */}
      <div className="w-full max-w-[680px] mx-auto h-[200px] md:h-[260px] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/glp-quiz/BMI-img.jpg"
          alt="Weight loss"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── Form area ─────────────────────────────────────────────────────────── */}
      <div className="max-w-[680px] mx-auto px-5 pt-6 pb-32">
        {/* Headline */}
        <h1 className="headers-font text-[24px] md:text-[28px] font-semibold leading-[120%] text-[#251F20] mb-2">
          Reach your goal weight fast{" "}
          <span className="text-[#AE7E56]">
            without restrictive diets and exercise.
          </span>
        </h1>
        <p className="text-[14px] text-[#00000080] mb-8 leading-[155%]">
          Please answer the following questions so we can qualify you for
          medical weight loss.
        </p>

        {/* ── 1. Height & Weight ───────────────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle>What is your height and weight?</SectionTitle>

          {/* Height row */}
          <div className="flex gap-3 mb-3">
            <div className="flex-1 relative">
              <select
                value={form.heightFeet}
                onChange={(e) => set("heightFeet", e.target.value)}
                className={selectCls}
              >
                <option value="">Feet</option>
                {[3, 4, 5, 6, 7, 8].map((f) => (
                  <option key={f} value={f}>
                    {f} ft
                  </option>
                ))}
              </select>
              {chevron}
            </div>

            <div className="flex-1 relative">
              <select
                value={form.heightInches}
                onChange={(e) => set("heightInches", e.target.value)}
                className={selectCls}
              >
                <option value="">Inches</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {i} in
                  </option>
                ))}
              </select>
              {chevron}
            </div>
          </div>

          {/* Weight */}
          <input
            type="number"
            inputMode="decimal"
            placeholder="Weight (lbs)"
            value={form.weight}
            onChange={(e) => set("weight", e.target.value)}
            className={inputCls}
          />

          {/* BMI feedback */}
          {bmi && parseFloat(bmi) >= 27 && (
            <p className="text-[12px] text-[#AE7E56] mt-2 font-medium">
              BMI: {bmi} — You qualify for medical weight loss.
            </p>
          )}
          {bmi && parseFloat(bmi) < 27 && parseFloat(bmi) >= 20 && (
            <p className="text-[12px] text-[#888] mt-2">
              BMI: {bmi} — You may still qualify. A physician will confirm.
            </p>
          )}
          {bmi && parseFloat(bmi) < 20 && (
            <p className="text-[12px] text-red-500 mt-2">
              BMI: {bmi} — You may not qualify for medical weight loss.
            </p>
          )}
        </div>

        {/* ── 2. Goal Weight ───────────────────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle>What is your goal weight?</SectionTitle>
          <input
            type="number"
            inputMode="decimal"
            placeholder="Goal weight (lbs)"
            value={form.goalWeight}
            onChange={(e) => set("goalWeight", e.target.value)}
            className={inputCls}
          />
        </div>

        {/* ── 3. Sex ──────────────────────────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle>Are you male or female?</SectionTitle>
          <div className="flex gap-3">
            {[
              {
                value: "male",
                label: "Male",
                symbol: "♂",
                color: "text-[#4B9CD3]",
              },
              {
                value: "female",
                label: "Female",
                symbol: "♀",
                color: "text-[#E87CAC]",
              },
            ].map(({ value, label, symbol, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => set("sex", value)}
                className={`flex-1 h-[80px] rounded-[12px] border-2 flex flex-col items-center justify-center gap-1 transition-colors ${
                  form.sex === value
                    ? "border-[#AE7E56] bg-[#FDF6EF]"
                    : "border-[#E2E2E1] bg-white hover:border-[#CFCFCF]"
                }`}
              >
                <span className={`text-[28px] leading-none ${color}`}>
                  {symbol}
                </span>
                <span className="text-[13px] font-medium text-[#251F20]">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ── 4. Date of Birth ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle>What is your date of birth?</SectionTitle>
          <div className="flex gap-2">
            {/* Month */}
            <div className="flex-1 relative">
              <select
                value={form.dobMonth}
                onChange={(e) => {
                  set("dobMonth", e.target.value);
                  const newDays = getDaysInMonth(e.target.value, form.dobYear);
                  if (form.dobDay && parseInt(form.dobDay, 10) > newDays)
                    set("dobDay", "");
                }}
                className={selectCls}
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              {chevron}
            </div>

            {/* Day */}
            <div className="w-[88px] relative">
              <select
                value={form.dobDay}
                onChange={(e) => set("dobDay", e.target.value)}
                className={selectCls}
              >
                <option value="">Day</option>
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {parseInt(d, 10)}
                  </option>
                ))}
              </select>
              {chevron}
            </div>

            {/* Year */}
            <input
              type="number"
              inputMode="numeric"
              placeholder="Year"
              value={form.dobYear}
              min="1900"
              max={new Date().getFullYear()}
              onChange={(e) => set("dobYear", e.target.value)}
              className="w-[96px] h-[52px] border border-[#E2E2E1] rounded-[8px] px-3 bg-[#F9F9F9] text-[14px] text-[#251F20] placeholder-[#ADADAD] focus:outline-none focus:border-[#AE7E56] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>
        </div>

        {/* ── 5. Pace Preference ──────────────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle>
            {paceProjection
              ? `With medication, you'll lose ${paceProjection.lossPerWeekLow}–${paceProjection.lossPerWeekHigh} lbs/week. How is that pace for you?`
              : "How is this pace for you?"}
          </SectionTitle>
          <div className="space-y-2">
            {[
              { id: "works-for-me", label: "Works for me" },
              { id: "faster", label: "I want it faster" },
              { id: "too-fast", label: "That's too fast" },
            ].map((opt) => (
              <RadioOption
                key={opt.id}
                id={opt.id}
                label={opt.label}
                selected={form.pacePreference === opt.id}
                onChange={(v) => set("pacePreference", v)}
              />
            ))}
          </div>
        </div>

        {/* ── 6. Sleep Hours ───────────────────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle>
            How many hours of sleep do you usually get each night?
          </SectionTitle>
          <div className="space-y-2">
            {[
              { id: "less-than-5", label: "Less than 5 hours" },
              { id: "6-7", label: "6–7 hours" },
              { id: "8-9", label: "8–9 hours" },
              { id: "more-than-9", label: "More than 9 hours" },
            ].map((opt) => (
              <RadioOption
                key={opt.id}
                id={opt.id}
                label={opt.label}
                selected={form.sleepHours === opt.id}
                onChange={(v) => set("sleepHours", v)}
              />
            ))}
          </div>
        </div>

        {/* ── 7. Willingness ──────────────────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle>
            If clinically appropriate, are you willing to:
          </SectionTitle>
          <div className="space-y-2">
            {[
              {
                id: "reduce-caloric-intake",
                label: "Reduce your caloric intake alongside medication",
              },
              {
                id: "increase-physical-activity",
                label: "Increase your physical activity alongside medication",
              },
              { id: "none", label: "None of the above" },
            ].map((opt) => (
              <CheckboxOption
                key={opt.id}
                id={opt.id}
                label={opt.label}
                selected={form.willingness.includes(opt.id)}
                onChange={toggleWillingness}
              />
            ))}
          </div>
        </div>

        {/* ── 8. Weight Changed ────────────────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle>Has your weight changed in the last year?</SectionTitle>
          <div className="space-y-2">
            {[
              { id: "lost-significant", label: "Lost a significant amount" },
              { id: "lost-little", label: "Lost a little" },
              { id: "about-same", label: "About the same" },
              { id: "gained-little", label: "Gained a little" },
              {
                id: "gained-significant",
                label: "Gained a significant amount",
              },
            ].map((opt) => (
              <RadioOption
                key={opt.id}
                id={opt.id}
                label={opt.label}
                selected={form.weightChanged === opt.id}
                onChange={(v) => set("weightChanged", v)}
              />
            ))}
          </div>
        </div>

        {/* ── 9. Medication Priority ───────────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle>
            What matters most to you when choosing a medication?
          </SectionTitle>
          <div className="space-y-2">
            {[
              { id: "affordability", label: "Affordability" },
              { id: "potency", label: "Potency" },
            ].map((opt) => (
              <RadioOption
                key={opt.id}
                id={opt.id}
                label={opt.label}
                selected={form.medicationPriority === opt.id}
                onChange={(v) => set("medicationPriority", v)}
              />
            ))}
          </div>
        </div>

        {/* ── 10. State of Mind ────────────────────────────────────────────── */}
        <div className="mb-8">
          <SectionTitle>
            Let&apos;s better understand your current state of mind.
          </SectionTitle>
          <div className="space-y-2">
            {[
              { id: "ready", label: "I'm Ready!" },
              { id: "hopeful", label: "I'm feeling hopeful" },
              { id: "cautious", label: "I'm cautious" },
            ].map((opt) => (
              <RadioOption
                key={opt.id}
                id={opt.id}
                label={opt.label}
                selected={form.stateOfMind === opt.id}
                onChange={(v) => set("stateOfMind", v)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Fixed Next button ─────────────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 w-full px-5 pb-5 pt-3 z-50 bg-gradient-to-t from-white via-white/95 to-transparent">
        <div className="max-w-[680px] mx-auto">
          <button
            type="button"
            onClick={handleNext}
            disabled={!isValid}
            className={`w-full h-[52px] rounded-full flex items-center justify-center gap-2 text-[16px] font-semibold transition-colors ${
              isValid
                ? "bg-black text-white"
                : "bg-gray-300 text-gray-700 cursor-not-allowed"
            }`}
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Glp2PreV2SinglePage;
