"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const NadPlusLastQuestionStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onQuizChromeVisibilityChange,
}) => {
  const field = stepConfig?.field || "hasInfoForMedicalTeam";
  const detailsField = stepConfig?.detailsField || "medicalTeamDetails";

  const [selected, setSelected] = useState(userData?.[field] || null);
  const [details, setDetails] = useState(userData?.[detailsField] || "");

  useEffect(() => {
    onQuizChromeVisibilityChange?.(false);
    return () => onQuizChromeVisibilityChange?.(false);
  }, [onQuizChromeVisibilityChange]);

  const handleSelect = (id) => {
    setSelected(id);
    setUserData((prev) => ({ ...prev, [field]: id }));
  };

  const handleNext = () => {
    if (!selected) return;
    const updated = { ...userData, [field]: selected };
    if (selected === "yes" && details) {
      updated[detailsField] = details;
    }
    setUserData(updated);
    onContinue(updated);
  };

  return (
    <div className="flex w-full flex-col px-2 pb-12 lg:pt-6 pt-4">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
        <h1 className="headers-font text-5xl font-normal leading-[120%] tracking-[-0.02em] text-[#251F20]">
          Last Question
        </h1>

        <h2 className="mt-6 headers-font text-3xl font-normal leading-[130%] text-[#251F20]">
          Do you have any further information which you would like our medical
          team to know?{" "}
          <span className="text-[#C45C4A]" aria-hidden>*</span>
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-3">
          {["yes", "no"].map((id) => {
            const isSel = selected === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isSel}
                onClick={() => handleSelect(id)}
                className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-4 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 ${
                  isSel ? "border-[#A7885A]" : "border-[#E5E2DC]"
                }`}
              >
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                    isSel
                      ? "border-[#A7885A] bg-[#A7885A]"
                      : "border-[#ccc] bg-white"
                  }`}
                  aria-hidden
                >
                  {isSel && (
                    <span className="block h-2 w-2 rounded-full bg-white" />
                  )}
                </span>
                <span className="font-sans text-base capitalize leading-snug text-[#251F20]">
                  {id === "yes" ? "Yes" : "No"}
                </span>
              </button>
            );
          })}
        </div>

        {selected === "yes" && (
          <div className="mt-4">
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              Provide details here. Please do not include urgent or emergency
              medical information.
            </label>
            <textarea
              value={details}
              onChange={(e) => {
                setDetails(e.target.value);
                setUserData((prev) => ({
                  ...prev,
                  [detailsField]: e.target.value,
                }));
              }}
              rows={4}
              className="w-full rounded-xl border-2 border-[#E5E2DC] bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:border-[#A7885A] focus:outline-none"
              placeholder="Enter your details here..."
            />
          </div>
        )}

        <button
          type="button"
          disabled={!selected}
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

export default NadPlusLastQuestionStep;
