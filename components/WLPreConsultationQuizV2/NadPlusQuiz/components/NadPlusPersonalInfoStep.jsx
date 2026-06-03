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
    if (!isValid) return;
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
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full rounded-xl border-2 border-[#E5E2DC] bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:border-[#A7885A] focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              Last Name
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full rounded-xl border-2 border-[#E5E2DC] bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:border-[#A7885A] focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
            What state will your medication be shipped to?
          </label>
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="w-full rounded-xl border-2 border-[#E5E2DC] bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:border-[#A7885A] focus:outline-none"
          >
            <option value="">Select a state</option>
            {US_STATES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
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
              onChange={(e) => setDobMonth(e.target.value)}
              className="w-full rounded-xl border-2 border-[#E5E2DC] bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:border-[#A7885A] focus:outline-none"
            >
              <option value="">Month</option>
              {MONTHS.map((m, i) => (
                <option key={m} value={String(i + 1)}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              Day
            </label>
            <select
              value={dobDay}
              onChange={(e) => setDobDay(e.target.value)}
              className="w-full rounded-xl border-2 border-[#E5E2DC] bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:border-[#A7885A] focus:outline-none"
            >
              <option value="">Day</option>
              {DAYS.map((d) => (
                <option key={d} value={String(d)}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              Year
            </label>
            <select
              value={dobYear}
              onChange={(e) => setDobYear(e.target.value)}
              className="w-full rounded-xl border-2 border-[#E5E2DC] bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:border-[#A7885A] focus:outline-none"
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={String(y)}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          disabled={!isValid}
          onClick={handleNext}
          className="mt-10 flex h-[52px] w-full max-w-4xl items-center justify-center gap-2 self-center rounded-full font-sans text-base font-medium text-white transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
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
