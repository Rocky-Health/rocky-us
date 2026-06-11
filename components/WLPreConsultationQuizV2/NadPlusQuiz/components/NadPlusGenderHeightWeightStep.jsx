"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const MaleIcon = () => (
  <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="14" r="10" fill="#251F20"/>
    <path d="M40 28C32 28 26 32 26 38V58H34V92H46V58H54V38C54 32 48 28 40 28Z" fill="#251F20"/>
  </svg>
);

const FemaleIcon = () => (
  <svg width="80" height="100" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="14" r="10" fill="#251F20"/>
    <path d="M40 28C32 28 26 32 26 38V50L22 72H34L36 58H38V92H42V58H44L46 72H58L54 50V38C54 32 48 28 40 28Z" fill="#251F20"/>
  </svg>
);

const FEET_OPTIONS = [3, 4, 5, 6, 7, 8];
const INCHES_OPTIONS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const NadPlusGenderHeightWeightStep = ({
  stepConfig,
  userData,
  setUserData,
  onContinue,
  onQuizChromeVisibilityChange,
}) => {
  const [sex, setSex] = useState(userData?.sex || null);
  const [feet, setFeet] = useState(userData?.height?.feet || "5");
  const [inches, setInches] = useState(userData?.height?.inches || "0");
  const [weight, setWeight] = useState(userData?.weight || "");

  useEffect(() => {
    onQuizChromeVisibilityChange?.(false);
    return () => onQuizChromeVisibilityChange?.(false);
  }, [onQuizChromeVisibilityChange]);

  const [error, setError] = useState("");

  const handleSelectSex = (value) => {
    if (error) setError("");
    setSex(value);
    setUserData((prev) => ({ ...prev, sex: value }));
  };

  const isValid = sex && weight && Number(weight) > 0;

  const handleNext = () => {
    if (!sex) {
      setError("Please select your gender.");
      return;
    }
    if (!weight || !(Number(weight) > 0)) {
      setError("Please enter your height and weight.");
      return;
    }
    setError("");
    const updated = {
      ...userData,
      sex,
      height: { feet, inches },
      weight: Number(weight),
    };
    setUserData(updated);
    onContinue(updated);
  };

  return (
    <div className="flex w-full flex-col px-2 pb-12 lg:pt-6 pt-4">
      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center">
        <h2 className="headers-font text-3xl font-normal leading-[130%] text-[#251F20] lg:text-4xl">
          Are you male or female?
        </h2>
        <p className="mt-2 font-sans text-base leading-[145%] text-[#251F20]/70">
          This helps us understand your body complexity and hormones so we can assess you better.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-4">
          {[
            { id: "male", label: "Male", Icon: MaleIcon },
            { id: "female", label: "Female", Icon: FemaleIcon },
          ].map(({ id, label, Icon }) => {
            const isSel = sex === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={isSel}
                onClick={() => handleSelectSex(id)}
                className={`flex flex-col items-center justify-center rounded-2xl border-2 bg-white px-4 py-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 ${
                  isSel ? "border-[#A7885A] shadow-sm" : "border-[#E5E2DC]"
                }`}
              >
                <Icon />
                <span className="headers-font mt-2 text-lg text-[#251F20]">{label}</span>
              </button>
            );
          })}
        </div>

        <h2 className="headers-font mt-10 text-3xl font-normal leading-[130%] text-[#251F20] lg:text-4xl">
          What is your height and weight?
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              Feet
            </label>
            <select
              value={feet}
              onChange={(e) => {
                setFeet(e.target.value);
                setUserData((prev) => ({
                  ...prev,
                  height: { ...prev.height, feet: e.target.value },
                }));
              }}
              className="w-full rounded-xl border-2 border-[#E5E2DC] bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:border-[#A7885A] focus:outline-none"
            >
              {FEET_OPTIONS.map((f) => (
                <option key={f} value={String(f)}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
              Inches
            </label>
            <select
              value={inches}
              onChange={(e) => {
                setInches(e.target.value);
                setUserData((prev) => ({
                  ...prev,
                  height: { ...prev.height, inches: e.target.value },
                }));
              }}
              className="w-full rounded-xl border-2 border-[#E5E2DC] bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:border-[#A7885A] focus:outline-none"
            >
              {INCHES_OPTIONS.map((i) => (
                <option key={i} value={String(i)}>{i}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="mb-1 block font-sans text-base font-medium text-[#251F20]">
            Weight (in lbs)
          </label>
          <input
            type="number"
            inputMode="numeric"
            value={weight}
            onChange={(e) => {
              if (error) setError("");
              setWeight(e.target.value);
              setUserData((prev) => ({ ...prev, weight: Number(e.target.value) }));
            }}
            placeholder="Enter your weight"
            className="w-full rounded-xl border-2 border-[#E5E2DC] bg-white px-4 py-3 font-sans text-base text-[#251F20] focus:border-[#A7885A] focus:outline-none"
          />
        </div>

        {error && (
          <p className="text-red-500 text-[13px] mt-4 text-center">{error}</p>
        )}
        <button
          type="button"
          onClick={handleNext}
          className="mt-4 flex h-[52px] w-full max-w-4xl items-center justify-center gap-2 self-center rounded-full font-sans text-base font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2"
          style={{ backgroundColor: ACCENT }}
        >
          <span>Next</span>
          <FaArrowRight className="text-sm" />
        </button>
      </div>
    </div>
  );
};

export default NadPlusGenderHeightWeightStep;
