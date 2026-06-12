"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const US_STATES = [
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

const YEARS = Array.from({ length: 2008 - 1940 + 1 }, (_, i) => 2008 - i);

const NadPlusPersonalInfoStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onQuizChromeVisibilityChange,
}) => {
  const [firstName, setFirstName] = useState(userData?.firstName || "");
  const [lastName, setLastName] = useState(userData?.lastName || "");
  const [province, setProvince] = useState(userData?.province || "");
  const [dobMonth, setDobMonth] = useState(userData?.dateOfBirth?.month || "");
  const [dobDay, setDobDay] = useState(userData?.dateOfBirth?.day || "");
  const [dobYear, setDobYear] = useState(userData?.dateOfBirth?.year || "");
  const [errors, setErrors] = useState({});

  const clearFieldError = (field) =>
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });

  useEffect(() => {
    onQuizChromeVisibilityChange?.(false);
    return () => onQuizChromeVisibilityChange?.(false);
  }, [onQuizChromeVisibilityChange]);

  const isValid =
    firstName.trim() &&
    lastName.trim() &&
    province &&
    dobMonth &&
    dobDay &&
    dobYear;

  const handleNext = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = "Please enter your first name.";
    if (!lastName.trim()) newErrors.lastName = "Please enter your last name.";
    if (!province) newErrors.province = "Please select your state.";
    if (!dobMonth) newErrors.dobMonth = "Please select your birth month.";
    if (!dobDay) newErrors.dobDay = "Please select your birth day.";
    if (!dobYear) newErrors.dobYear = "Please select your birth year.";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const updated = {
      ...userData,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      province,
      dateOfBirth: { month: dobMonth, day: dobDay, year: dobYear },
    };
    setUserData(updated);
    onContinue(updated);
  };

  return (
    <div className="flex w-full flex-col px-2 pb-12 lg:pt-6 pt-4">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
        <h1 className="headers-font text-5xl font-normal leading-[120%] tracking-[-0.02em] text-[#251F20]">
          Good News! You qualify for our{" "}
          <span style={{ color: ACCENT }}>lowest NAD+ pricing!</span>
        </h1>
        <p className="mt-2 font-sans text-base leading-[145%] text-[#251F20]/70">
          On the next page you&apos;ll choose your medication plan.
        </p>

        <h2 className="mt-8 headers-font text-3xl font-normal leading-[130%] text-[#251F20]">
          First Let&apos;s get your info:
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              First Name
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
              className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:outline-none ${errors.firstName ? "border-red-500 focus:border-red-500" : "border-[#E5E2DC] focus:border-[#A7885A]"}`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-[13px] mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => { setLastName(e.target.value); clearFieldError("lastName"); }}
              className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:outline-none ${errors.lastName ? "border-red-500 focus:border-red-500" : "border-[#E5E2DC] focus:border-[#A7885A]"}`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-[13px] mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
            What state will your medication be shipped to?
          </label>
          <select
            value={province}
            onChange={(e) => { setProvince(e.target.value); clearFieldError("province"); }}
            className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:outline-none ${errors.province ? "border-red-500 focus:border-red-500" : "border-[#E5E2DC] focus:border-[#A7885A]"}`}
          >
            <option value="">Select a state</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          {errors.province && (
            <p className="text-red-500 text-[13px] mt-1">{errors.province}</p>
          )}
        </div>

        <h2 className="mt-8 headers-font text-3xl font-normal leading-[130%] text-[#251F20]">
          When were you born?
        </h2>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <div>
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              Month
            </label>
            <select
              value={dobMonth}
              onChange={(e) => { setDobMonth(e.target.value); clearFieldError("dobMonth"); }}
              className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:outline-none ${errors.dobMonth ? "border-red-500 focus:border-red-500" : "border-[#E5E2DC] focus:border-[#A7885A]"}`}
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
            {errors.dobMonth && (
              <p className="text-red-500 text-[13px] mt-1">{errors.dobMonth}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              Day
            </label>
            <select
              value={dobDay}
              onChange={(e) => { setDobDay(e.target.value); clearFieldError("dobDay"); }}
              className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:outline-none ${errors.dobDay ? "border-red-500 focus:border-red-500" : "border-[#E5E2DC] focus:border-[#A7885A]"}`}
            >
              <option value="">Day</option>
              {DAYS.map((d) => (
                <option key={d} value={String(d)}>{d}</option>
              ))}
            </select>
            {errors.dobDay && (
              <p className="text-red-500 text-[13px] mt-1">{errors.dobDay}</p>
            )}
          </div>
          <div>
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              Year
            </label>
            <select
              value={dobYear}
              onChange={(e) => { setDobYear(e.target.value); clearFieldError("dobYear"); }}
              className={`w-full rounded-xl border-2 bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:outline-none ${errors.dobYear ? "border-red-500 focus:border-red-500" : "border-[#E5E2DC] focus:border-[#A7885A]"}`}
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
            {errors.dobYear && (
              <p className="text-red-500 text-[13px] mt-1">{errors.dobYear}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="mt-10 flex h-[52px] w-full max-w-4xl items-center justify-center gap-2 self-center rounded-full font-sans text-base font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2"
          style={{ backgroundColor: ACCENT }}
        >
          <span>Next</span>
          <FaArrowRight className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default NadPlusPersonalInfoStep;
