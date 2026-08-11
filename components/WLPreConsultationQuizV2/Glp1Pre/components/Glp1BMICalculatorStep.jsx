"use client";

import React, { useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";
import CustomImage from "@/components/utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";
import RadioOption from "./RadioOption";

const Glp1BMICalculatorStep = ({
  userData,
  setUserData,
  onContinue,
  config,
  onAction,
}) => {
  const { weight: weightPounds, height = {}, bmi } = userData || {};
  const { feet: heightFeet = "", inches: heightInches = "" } = height;

  const weightRef = useRef(null);
  const continueRef = useRef(null);

  const goalWeightRef = useRef(null);

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
      // goalWeight is managed by its own onChange — don't overwrite it here
    }));
  }, [weightPounds, heightFeet, heightInches, setUserData]);

  const handleAction = () => {
    logger.log(config.showPopupAfterStep);
    if (config.showPopupAfterStep) {
      onAction("showPopup", config.showPopupAfterStep);
    } else {
      onContinue();
    }
  };

  const isEligible =
    bmi &&
    !isNaN(parseFloat(bmi)) &&
    parseFloat(bmi) >= 20 &&
    heightFeet !== "" &&
    heightInches !== "";

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full md:w-[580px] mx-auto flex-grow">
        <div className="rounded-[16px] overflow-hidden mb-10 w-fill  md:w-[710px] h-[223.44px] md:h-[386.86px] relative ">
          <CustomImage src="/glp-quiz/img-WL.jpg" alt="BMI calculator" fill sizes="(max-width: 768px) 100vw, 710px" />
        </div>

        <h1 className="text-[32px] leading-[115%] font-[450] mb-4 text-[#251F20] headers-font">
          Reach Your Goal Weight Fast{" "}
          <span className="text-[#AE7E56] headers-font">
            Without Restrictive Diets And Exercise.
          </span>
        </h1>

        <p className="text-[18px] leading-[140%] font-[400]  mb-4">
          Please answer the following questions so we can qualify you for
          medical weight loss.
        </p>

        <div className="w-full h-[1px] bg-gray-300 mb-4"></div>
        <h2
          className="text-[24px] leading-[90%] mb-[32px] headers-font"
          style={{ color: "rgb(31, 41, 55)" }}
        >
          What's Your Height And Weight{" "}
        </h2>

        <div className="flex  items-start justify-start gap-24 md:gap-60">
          <div className="mb-4">
            <label className="block mb-3 font-medium ">Feet</label>
            <div className="flex flex-col gap-2 mb-4">
              {[4, 5, 6, 7].map((ft) => (
                <RadioOption
                  key={ft}
                  value={ft}
                  label={`${ft} ft`}
                  selected={heightFeet === ft}
                  onClick={() =>
                    setUserData((prev) => ({
                      ...prev,
                      height: { ...prev.height, feet: ft },
                    }))
                  }
                />
              ))}
            </div>
          </div>

          <div className="mb-4 ">
            <label className="block mb-3 font-medium ">Inches</label>
            <div className="flex flex-col gap-2 mb-4">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((inch) => (
                <RadioOption
                  key={inch}
                  value={inch}
                  label={`${inch} in`}
                  selected={heightInches === inch}
                  onClick={() =>
                    setUserData((prev) => ({
                      ...prev,
                      height: { ...prev.height, inches: inch },
                    }))
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <div className="w-full h-[1px] bg-gray-300 mb-4"></div>
        <div className="mb-3">
          <label className="block mb-2 text-[14px] font-medium ">
            Weight (in lbs)
          </label>
          <input
            ref={weightRef}
            type="number"
            inputMode="decimal"
            enterKeyHint="done"
            className="h-[52px] w-full px-4 border border-[#E2E2E1] rounded-md bg-[#F9F9F9]"
            placeholder="250"
            value={
              weightPounds !== undefined && weightPounds !== null
                ? weightPounds
                : ""
            }
            onChange={(e) => {
              const value = e.target.value;
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
        <div className="w-full h-[1px] bg-gray-300 mb-4"></div>
        <div className="mb-3">
          <label className="block mb-2 text-[14px] font-medium ">
            What is your goal weight? *
          </label>
          <input
            ref={goalWeightRef}
            type="number"
            inputMode="decimal"
            enterKeyHint="done"
            className="h-[52px] w-full px-4 border border-[#E2E2E1] rounded-md bg-[#F9F9F9]"
            placeholder="250"
            value={userData?.goalWeight ?? ""}
            onChange={(e) => {
              const value = e.target.value;
              setUserData((prev) => ({
                ...prev,
                goalWeight: value === "" ? "" : parseInt(value, 10) || 0,
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
      </div>

      {/* <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] backdrop-blur-sm">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          <button
            ref={continueRef}
            className={`w-full py-3 flex items-center justify-center gap-2 ${
              isEligible ? "bg-black text-white" : "bg-gray-300 text-gray-700"
            } rounded-full h-[52px] font-medium border-none focus:outline-none focus:ring-0`}
            onClick={handleAction}
            disabled={!bmi || !isEligible}
            type="button"
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        </div>
      </div> */}
    </div>
  );
};

export default Glp1BMICalculatorStep;
