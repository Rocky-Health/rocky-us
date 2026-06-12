"use client";

import React, { useEffect, useRef, useState } from "react";
import { logger } from "@/utils/devLogger";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";

const Glp2BMICalculatorStep = ({
  userData,
  setUserData,
  onContinue,
  config,
  onAction,
}) => {
  const { weight: weightPounds, height = {}, bmi } = userData || {};
  const { feet: heightFeet = "", inches: heightInches = "" } = height;

  const feetRef = useRef(null);
  const inchesRef = useRef(null);
  const weightRef = useRef(null);
  const continueRef = useRef(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const feetNum = parseFloat(heightFeet) || 0;
    const inchesNum = parseFloat(heightInches) || 0;
    const weightNum = parseFloat(weightPounds) || 0;
    let bmiValue = "";

    if (feetNum > 0 && inchesNum >= 0 && inchesNum < 12 && weightNum > 0) {
      const heightInInches = feetNum * 12 + inchesNum;
      bmiValue = (
        (weightNum / (heightInInches * heightInInches)) *
        703
      ).toFixed(2);
    }

    setUserData((prev) => ({
      ...prev,
      bmi: bmiValue,
      height: { feet: heightFeet, inches: heightInches },
      weight: weightPounds,
    }));
  }, [weightPounds, heightFeet, heightInches, setUserData]);

  const feetNum = parseFloat(heightFeet);
  const inchesNum = parseFloat(heightInches);
  const weightNum = parseFloat(weightPounds);
  const hasAllInputs =
    feetNum > 0 &&
    !isNaN(inchesNum) &&
    inchesNum >= 0 &&
    inchesNum < 12 &&
    weightNum > 0;

  const isEligible = bmi && !isNaN(parseFloat(bmi)) && parseFloat(bmi) >= 20;

  const handleAction = () => {
    if (!hasAllInputs) {
      setError("Please enter your height and weight.");
      return;
    }
    if (!isEligible) {
      setError(
        "Based on the information provided, you're not eligible for medical weight loss.",
      );
      return;
    }
    setError("");
    logger.log(config.showPopupAfterStep);
    if (config.showPopupAfterStep) {
      onAction("showPopup", config.showPopupAfterStep);
    } else {
      onContinue();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full md:w-[580px] mx-auto flex-grow pb-32 md:pb-36">
        <div className="rounded-[16px] overflow-hidden mb-10 w-fill  md:w-[580px] h-[223.44px] md:h-[386.86px] relative ">
          <CustomImage src="/glp-quiz/BMI-img.jpg" alt="BMI calculator" fill />
        </div>

        <h1 className="text-[32px] leading-[115%] font-[450] mb-4 text-[#251F20] headers-font">
          Reach Your Goal Weight Fast{" "}
          <span className="text-[#AE7E56] headers-font">
            Without Restrictive Diets And Exercise.
          </span>
        </h1>

        <p className="text-[18px] leading-[140%] font-[400] text-[#00000099] mb-10">
          Let&apos;s calculate your BMI to make sure you're a good candidate for
          medical weight loss.
        </p>

        <h2 className="text-[24px] leading-[90%] mb-[32px] headers-font">
          What's Your Height And Weight{" "}
        </h2>

        <div className="mb-4">
          <label className="block mb-2 text-[14px] font-medium text-[#00000099]">
            Height (in feet and inches)
          </label>
          <div className="flex items-center mb-4 gap-2 sm:flex-row flex-col">
            <input
              ref={feetRef}
              type="number"
              inputMode="decimal"
              min="0"
              enterKeyHint="next"
              className="h-[52px] w-full px-[14px] py-[16px] border border-[#E2E2E1] rounded-md bg-[#F9F9F9]"
              placeholder="Feet (3-8)"
              value={
                heightFeet !== undefined && heightFeet !== null
                  ? heightFeet
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (error) setError("");
                setUserData((prev) => ({
                  ...prev,
                  height: {
                    ...prev.height,
                    feet: value === "" ? "" : parseInt(value, 10) || 0,
                    inches: heightInches,
                  },
                  weight: weightPounds,
                }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  inchesRef.current?.focus();
                }
              }}
            />

            <input
              ref={inchesRef}
              type="number"
              inputMode="decimal"
              min="0"
              enterKeyHint="next"
              className="h-[52px] w-full px-4 border border-[#E2E2E1] rounded-md bg-[#F9F9F9]"
              placeholder="Inches (0-11)"
              value={
                heightInches !== undefined && heightInches !== null
                  ? heightInches
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                if (error) setError("");
                setUserData((prev) => ({
                  ...prev,
                  height: {
                    ...prev.height,
                    feet: heightFeet,
                    inches: value === "" ? "" : parseInt(value, 10) || 0,
                  },
                  weight: weightPounds,
                }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  weightRef.current?.focus();
                }
              }}
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="block mb-2 text-[14px] font-medium text-[#00000099]">
            Weight (in lbs)
          </label>
          <input
            ref={weightRef}
            type="number"
            inputMode="decimal"
            enterKeyHint="done"
            className="h-[52px] w-full px-4 border border-[#E2E2E1] rounded-md bg-[#F9F9F9]"
            placeholder="Weight (in lbs)"
            value={
              weightPounds !== undefined && weightPounds !== null
                ? weightPounds
                : ""
            }
            onChange={(e) => {
              const value = e.target.value;
              if (error) setError("");
              setUserData((prev) => ({
                ...prev,
                weight: value === "" ? "" : parseInt(value, 10) || 0,
                height: {
                  feet: heightFeet,
                  inches: heightInches,
                },
              }));
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                continueRef.current?.focus();
              }
            }}
          />
        </div>

        {error && <p className="text-red-500 text-[13px] mt-1">{error}</p>}
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] backdrop-blur-sm">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          <button
            ref={continueRef}
            className="w-full py-3 flex items-center justify-center gap-2 bg-black text-white rounded-full h-[52px] font-medium border-none focus:outline-none focus:ring-0"
            onClick={handleAction}
            type="button"
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Glp2BMICalculatorStep;
