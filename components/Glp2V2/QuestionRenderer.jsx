"use client";

import OptionRenderer from "./OptionRenderer";

// ── Shared input styles ───────────────────────────────────────────────────────
const INPUT_BASE =
  "w-full border-2 border-gray-200 rounded-[12px] px-4 py-3 text-[15px] outline-none focus:border-[#A7885A] transition-colors duration-150 bg-white";

/**
 * FormField — renders a single field inside a "form" type question.
 * fieldType: "text" | "number" | "select" | "textarea" | "date"
 */
function FormField({ field, value, onChange }) {
  const labelEl = field.label ? (
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {field.label}
    </label>
  ) : null;

  if (field.fieldType === "textarea") {
    return (
      <div className="mb-4">
        {labelEl}
        <textarea
          className={`${INPUT_BASE} min-h-[100px] resize-y`}
          placeholder={field.placeholder ?? ""}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    );
  }

  if (field.fieldType === "select") {
    return (
      <div className="mb-4">
        {labelEl}
        <select
          className={INPUT_BASE}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Select…</option>
          {(field.options ?? []).map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div className="mb-4">
      {labelEl}
      <input
        type={field.fieldType ?? "text"}
        className={INPUT_BASE}
        placeholder={field.placeholder ?? ""}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        min={field.min}
        max={field.max}
        step={field.step}
      />
    </div>
  );
}

/**
 * QuestionRenderer
 *
 * Routes a question config object to the correct input type.
 *
 * Supported types:
 *   "radio"        — single-select option cards
 *   "multi-select" — multi-toggle option cards
 *   "form"         — one or more labeled input fields
 *
 * The question's title/description accept optional className overrides via
 * titleStyle / descriptionStyle (Tailwind class strings).
 */
export default function QuestionRenderer({ question, answers, setAnswer }) {
  const {
    id,
    type,
    title,
    titleStyle,
    description,
    descriptionStyle,
    options = [],
    fields = [],
    optionLayout = "text-only",
  } = question;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleOptionSelect = (value) => {
    if (type === "radio") {
      setAnswer(id, value);
    } else if (type === "multi-select") {
      const current = Array.isArray(answers[id]) ? answers[id] : [];
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      setAnswer(id, next);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="mb-6">
      {/* Title */}
      <h2
        className={
          titleStyle ??
          "text-[22px] font-medium leading-[125%] tracking-[-0.5px] mb-2 text-gray-900"
        }
      >
        {title}
      </h2>

      {/* Optional description */}
      {description && (
        <p
          className={
            descriptionStyle ?? "text-sm text-gray-500 mb-4 leading-relaxed"
          }
        >
          {description}
        </p>
      )}

      {/* Radio / multi-select options */}
      {(type === "radio" || type === "multi-select") && (
        <div className="mt-4">
          {options.map((option) => {
            const isSelected =
              type === "radio"
                ? answers[id] === option.value
                : Array.isArray(answers[id]) &&
                  answers[id].includes(option.value);

            return (
              <OptionRenderer
                key={option.value}
                option={option}
                layout={optionLayout}
                selected={isSelected}
                onSelect={handleOptionSelect}
              />
            );
          })}
        </div>
      )}

      {/* Form fields */}
      {type === "form" && (
        <div className="mt-4">
          {fields.map((field) => (
            <FormField
              key={field.id}
              field={field}
              value={answers[field.id] ?? ""}
              onChange={(val) => setAnswer(field.id, val)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
