"use client";

import { useState } from "react";

export const formatPhoneNumber = (value) => {
  if (!value) return "";
  const digits = String(value).replace(/\D/g, "").slice(0, 10);
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6)
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

export const isValidPhone = (value) => {
  if (!value || typeof value !== "string") return false;
  const digits = value.replace(/\D/g, "");
  if (digits.length < 10) return false;
  if (/^0+$/.test(digits)) return false;
  return true;
};

/**
 * Controlled phone input with (XXX) XXX-XXXX masking and built-in validation.
 *
 * Props:
 *   value          – controlled formatted string
 *   onChange(v)    – called with the masked string on every keystroke
 *   onBlur         – forwarded to the <input>
 *   error          – external error message (takes precedence over internal)
 *   id / name / placeholder / required / disabled / className
 *   inputClassName – extra classes applied directly to the <input> element
 *   label          – if provided, renders a <label> above the input
 *   showError      – (default true) render red border + message on invalid blur
 */
const PhoneInput = ({
  value = "",
  onChange,
  onBlur,
  error,
  id = "phone",
  name = "phone",
  placeholder = "(___) ___-____",
  required = false,
  disabled = false,
  className = "",
  inputClassName = "",
  label,
  showError = true,
}) => {
  const [touched, setTouched] = useState(false);

  const handleChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    onChange?.(formatted);
  };

  const handleBlur = (e) => {
    setTouched(true);
    onBlur?.(e);
  };

  const internalError =
    showError && touched && !isValidPhone(value)
      ? "Please enter a valid phone number"
      : "";

  // External error (e.g. from form submit validation) takes precedence
  const displayError = error !== undefined ? error : internalError;
  const hasError = Boolean(displayError);

  return (
    <div className={className}>
      {label && (
        <label
          htmlFor={id}
          className="block text-[14px] font-medium text-[#212121] mb-2"
        >
          {label}
        </label>
      )}
      <input
        type="tel"
        id={id}
        name={name}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        maxLength={14}
        autoComplete="tel"
        className={
          inputClassName ||
          `block w-full rounded-[8px] h-[40px] text-md border px-4 focus:outline focus:outline-2 focus:outline-black focus:ring-0 focus:border-transparent ${
            hasError ? "border-red-500" : "border-gray-500"
          }`
        }
        style={inputClassName ? undefined : { outlineColor: "black" }}
      />
      {hasError && (
        <p className="text-red-500 text-sm mt-1">{displayError}</p>
      )}
    </div>
  );
};

export default PhoneInput;
