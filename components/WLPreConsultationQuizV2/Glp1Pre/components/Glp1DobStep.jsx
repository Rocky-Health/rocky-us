"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import RadioOption from "./RadioOption";

const MIN_YEAR = 1920;
const MAX_YEAR = 2008;

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

const Glp1DobStep = ({
  userData,
  setUserData,
  onContinue,
  hideContinueButton = false,
}) => {
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
    month !== "" && day !== "" && year !== "" && year.length === 4;

  useEffect(() => {
    if (!hideContinueButton) return;
    if (!isComplete) return;

    const formatted = `${month}/${day}/${year}`;
    setUserData((prev) => ({ ...prev, dateOfBirth: formatted }));
  }, [hideContinueButton, isComplete, month, day, year, setUserData]);

  const handleContinue = () => {
    setError("");
    const y = parseInt(year, 10);
    const m = parseInt(month, 10);
    const d = parseInt(day, 10);

    if (!month || !day || !year || year.length !== 4) {
      setError("Please enter your complete date of birth.");
      return;
    }
    if (isNaN(y) || y < MIN_YEAR || y > MAX_YEAR) {
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
      <div className="w-full md:w-[580px] mx-auto flex-grow pb-12">
        <h1 className="headers-font text-[28px] md:text-[32px] leading-[115%] text-[#251F20] mb-8">
          What is your date of birth?
        </h1>

        <div className="flex flex-col gap-5">
          <div className="flex  items-start justify-start gap-10 md:gap-60">
            {/* Month */}
            <div>
              <label className="block text-[14px] font-medium text-[#251F20] mb-2">
                Month
              </label>
              <div className="flex flex-col gap-2">
                {MONTHS.map((m) => (
                  <RadioOption
                    key={m.value}
                    value={m.value}
                    label={m.label}
                    selected={month === m.value}
                    onClick={() => {
                      setMonth(m.value);
                      setError("");
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Day */}
            <div>
              <label className="block text-[14px] font-medium text-[#251F20] mb-2">
                Day
              </label>
              <div className="flex flex-col gap-2">
                {dayOptions.map((d) => (
                  <RadioOption
                    key={d}
                    value={d}
                    label={parseInt(d, 10)}
                    selected={day === d}
                    onClick={() => {
                      setDay(d);
                      setError("");
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Year */}
          <div>
            <label className="block text-[14px] font-medium text-[#251F20] mb-2">
              Year
            </label>
            <select
              value={year}
              onChange={(e) => {
                setYear(e.target.value);
                setError("");
              }}
              min={MIN_YEAR}
              max={MAX_YEAR}
              className="w-full h-[52px] border border-[#E2E2E1] rounded-[8px] px-4 bg-white text-[15px] text-[#251F20] focus:outline-none focus:border-[#AE7E56] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            >
              <option value=""></option>
              {Array.from(
                { length: MAX_YEAR - MIN_YEAR + 1 },
                (_, i) => MIN_YEAR + i,
              ).map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-red-500 text-[13px]">{error}</p>}
        </div>
      </div>

      {!hideContinueButton && (
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
      )}
    </div>
  );
};

export default Glp1DobStep;
