import React, { useEffect, useRef } from "react";
import { logger } from "@/utils/devLogger";

const BMICalculatorStep = ({
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

  const PrivacyText = () => (
    <p className="text-xs text-gray-500 my-6">
      We respect your privacy. All of your information is securely stored on our
      HIPAA Compliant server.
    </p>
  );

  const handleAction = () => {
    logger.log(config.showPopupAfterStep);
    if (config.showPopupAfterStep) {
      onAction("showPopup", config.showPopupAfterStep); // This should open the 'longTermBenefits' popup
    } else {
      onContinue();
    }
  };

  const isEligible = bmi && !isNaN(parseFloat(bmi)) && parseFloat(bmi) >= 20;
  const bmiDisplay =
    bmi && !isNaN(parseFloat(bmi)) ? parseFloat(bmi).toFixed(1) : "--";

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full md:w-[520px] mx-auto flex-grow pb-32">
        <p className="mb-[24px] text-[#AE7E56] font-poppins font-medium text-base leading-[140%] tracking-normal align-middle">
          This helps calculate your BMI (Body Mass Index), a general screening
          tool for body composition.
        </p>
        <div className="mb-[16px]">
          <label className="block mb-2 text-[14px] font-medium">
            How tall are you?
          </label>
          <div className="flex items-center mb-4 gap-2">
            <input
              ref={feetRef}
              type="number"
              min="0"
              enterKeyHint="next"
              className="h-[60px] w-full p-3 border border-gray-300 rounded-md text-[16px] "
              placeholder="Feet"
              value={
                heightFeet !== undefined && heightFeet !== null
                  ? heightFeet
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                setUserData((prev) => ({
                  ...prev,
                  height: {
                    ...prev.height,
                    feet: value === "" ? "" : parseInt(value) || 0,
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
              min="0"
              enterKeyHint="next"
              className="h-[60px] w-full p-3 border border-gray-300 rounded-md mr-2 text-[16px] "
              placeholder="Inches"
              value={
                heightInches !== undefined && heightInches !== null
                  ? heightInches
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                setUserData((prev) => ({
                  ...prev,
                  height: {
                    ...prev.height,
                    feet: heightFeet,
                    inches: value === "" ? "" : parseInt(value) || 0,
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

        <div className="mb-[16px]">
          <label className="block mb-2 text-[14px] font-medium">
            How much do you currently weigh?
          </label>
          <input
            ref={weightRef}
            type="number"
            enterKeyHint="done"
            className="h-[60px] w-full p-3 border border-gray-300 rounded-md text-[16px] "
            placeholder="Weight (Pounds)"
            value={
              weightPounds !== undefined && weightPounds !== null
                ? weightPounds
                : ""
            }
            onChange={(e) => {
              const value = e.target.value;
              setUserData((prev) => ({
                ...prev,
                weight: value === "" ? "" : parseInt(value) || 0,
                height: { feet: heightFeet, inches: heightInches },
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

        <div className="bg-gradient-to-b from-[#F5F4EF] to-[#F7F7F7]/0 flex justify-center items-center flex-col rounded-md p-6 mb-6 h-[181px]">
          <div className="text-center">
            <p className="text-sm mb-2">Your BMI</p>
            <p className="text-6xl font-bold">{bmi || 0}</p>
          </div>
        </div>

        <PrivacyText />
      </div>

      <div className="fixed bottom-0 left-0 w-full px-4 pb-4 flex items-center justify-center z-50 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_37.51%,#FFFFFF_63.04%)] backdrop-blur-sm">
        <div className="w-[335px] md:w-[520px] max-w-xl">
          {/* Eligibility message */}
          {!bmi ||
            (!isEligible && (
              <p className="text-center text-sm text-red-700 mb-2 font-bold">
                Based on your BMI ({bmiDisplay}), you may be not qualify for
                medical weight loss
              </p>
            ))}

          <button
            ref={continueRef}
            className={`w-full py-3 ${
              isEligible ? "bg-black text-white" : "bg-gray-300 text-gray-700"
            }  rounded-full h-[52px] font-medium border-none focus:outline-none focus:ring-0`}
            onClick={handleAction}
            disabled={!bmi || !isEligible}
            type="button"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
export default BMICalculatorStep;
