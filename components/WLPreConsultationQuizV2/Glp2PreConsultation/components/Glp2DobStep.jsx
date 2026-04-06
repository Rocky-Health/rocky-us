"use client";

import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";

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

const Glp2DobStep = ({ userData, setUserData, onContinue }) => {
  const parsedDob = (() => {
    const raw = userData?.dateOfBirth || "";
    if (!raw) return { month: "", day: "", year: "" };
    // Support "MM/DD/YYYY" or "YYYY-MM-DD"
    if (raw.includes("/")) {
      const [m, d, y] = raw.split("/");
      return { month: m || "", day: d || "", year: y || "" };
    }
    if (raw.includes("-")) {
      const [y, m, d] = raw.split("-");
      return { month: m || "", day: d || "", year: y || "" };
    }
    return { month: "", day: "", year: raw };
  })();

  const [month, setMonth] = useState(parsedDob.month);
  const [day, setDay] = useState(parsedDob.day);
  const [year, setYear] = useState(parsedDob.year);
  const [error, setError] = useState("");

  const daysInMonth = getDaysInMonth(month, year);
  const dayOptions = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1).padStart(2, "0"),
  );

  const isComplete =
    month !== "" &&
    day !== "" &&
    year !== "" &&
    year.length === 4;

  const handleContinue = () => {
    setError("");
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    if (!month || !day || !year || year.length !== 4) {
      setError("Please enter your complete date of birth.");
      return;
    }
    if (isNaN(y) || y < 1900 || y > new Date().getFullYear()) {
      setError("Please enter a valid year.");
      return;
    }

    const dob = new Date(y, m - 1, d);
    if (dob >= new Date()) {
      setError("Date of birth must be in the past.");
      return;
    }

    const formatted = `${String(m).padStart(2, "0")}/${String(d).padStart(2, "0")}/${y}`;
    setUserData((prev) => ({ ...prev, dateOfBirth: formatted }));
    onContinue?.();
  };

  return (
    <div className="w-full h-full flex flex-col px-4 md:px-0">
      <div className="w-full md:w-[580px] mx-auto flex-grow pb-32 md:pb-36">
        <h1 className="headers-font text-[28px] md:text-[32px] leading-[115%] text-[#251F20] mb-8">
          What is your date of birth?
        </h1>

        <div className="flex flex-col gap-5">
          {/* Month */}
          <div>
            <label className="block text-[14px] font-medium text-[#251F20] mb-2">
              Month
            </label>
            <div className="relative">
              <select
                value={month}
                onChange={(e) => {
                  setMonth(e.target.value);
                  // Reset day if it exceeds the new month's days
                  const newDays = getDaysInMonth(e.target.value, year);
                  if (day && parseInt(day, 10) > newDays) setDay("");
                  setError("");
                }}
                className="w-full h-[52px] border border-[#E2E2E1] rounded-[8px] px-4 pr-10 bg-white text-[15px] text-[#251F20] appearance-none focus:outline-none focus:border-[#AE7E56]"
              >
                <option value=""></option>
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">
                ▾
              </span>
            </div>
          </div>

          {/* Day */}
          <div>
            <label className="block text-[14px] font-medium text-[#251F20] mb-2">
              Day
            </label>
            <div className="relative">
              <select
                value={day}
                onChange={(e) => { setDay(e.target.value); setError(""); }}
                className="w-full h-[52px] border border-[#E2E2E1] rounded-[8px] px-4 pr-10 bg-white text-[15px] text-[#251F20] appearance-none focus:outline-none focus:border-[#AE7E56]"
              >
                <option value=""></option>
                {dayOptions.map((d) => (
                  <option key={d} value={d}>
                    {parseInt(d, 10)}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">
                ▾
              </span>
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[14px] font-medium text-[#251F20] mb-2">
              Year
            </label>
            <input
              type="number"
              inputMode="numeric"
              placeholder="1995"
              value={year}
              onChange={(e) => { setYear(e.target.value); setError(""); }}
              min="1900"
              max={new Date().getFullYear()}
              className="w-full h-[52px] border border-[#E2E2E1] rounded-[8px] px-4 bg-white text-[15px] text-[#251F20] focus:outline-none focus:border-[#AE7E56] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-[13px]">{error}</p>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] backdrop-blur-sm">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!isComplete}
            className={`w-full py-3 flex items-center justify-center gap-2 rounded-full h-[52px] font-medium border-none focus:outline-none focus:ring-0 ${
              isComplete
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

export default Glp2DobStep;
