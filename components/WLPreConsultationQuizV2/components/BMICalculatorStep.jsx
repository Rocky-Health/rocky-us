import React, { useEffect } from "react";
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
      PIPEDA Compliant server.
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

  const isEligible = bmi && !isNaN(parseFloat(bmi)) && parseFloat(bmi) >= 27;
  const bmiDisplay =
    bmi && !isNaN(parseFloat(bmi)) ? parseFloat(bmi).toFixed(1) : "--";

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full md:w-[520px] mx-auto flex-grow pb-24">
        <div className="mb-6">
          <label className="block mb-2">Your height is:</label>
          <div className="flex items-center mb-4 gap-2">
            <input
              type="number"
              min="0"
              className="h-[60px] w-full p-3 border border-gray-300 rounded-md "
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
            />
            <button
              className="min-w-[60px] h-[60px] p-3 text-2xl border border-gray-300 rounded-md flex items-center justify-center"
              onClick={() => {
                setUserData((prev) => ({
                  ...prev,
                  height: {
                    ...prev.height,
                    feet: Math.max(0, (parseInt(heightFeet) || 0) - 1),
                    inches: heightInches,
                  },
                  weight: weightPounds,
                }));
              }}
              type="button"
            >
              −
            </button>
            <button
              className="min-w-[60px] h-[60px] p-3 text-2xl border border-gray-300 rounded-md flex items-center justify-center"
              onClick={() => {
                setUserData((prev) => ({
                  ...prev,
                  height: {
                    ...prev.height,
                    feet: (parseInt(heightFeet) || 0) + 1,
                    inches: heightInches,
                  },
                  weight: weightPounds,
                }));
              }}
              type="button"
            >
              +
            </button>
          </div>

          <div className="flex items-center">
            <input
              type="number"
              min="0"
              className="h-[60px] w-full p-3 border border-gray-300 rounded-md mr-2"
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
            />
            <button
              className="min-w-[60px] h-[60px] p-3 text-2xl border border-gray-300 rounded-md flex items-center justify-center"
              onClick={() => {
                setUserData((prev) => ({
                  ...prev,
                  height: {
                    ...prev.height,
                    feet: heightFeet,
                    inches: Math.max(0, (parseInt(heightInches) || 0) - 1),
                  },
                  weight: weightPounds,
                }));
              }}
              type="button"
            >
              −
            </button>
            <button
              className="min-w-[60px] h-[60px] p-3 text-2xl border border-gray-300 rounded-md flex items-center justify-center ml-2"
              onClick={() => {
                setUserData((prev) => ({
                  ...prev,
                  height: {
                    ...prev.height,
                    feet: heightFeet,
                    inches: Math.min(11, (parseInt(heightInches) || 0) + 1),
                  },
                  weight: weightPounds,
                }));
              }}
              type="button"
            >
              +
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block mb-2">Your weight is:</label>
          <input
            type="number"
            className="h-[60px] w-full p-3 border border-gray-300 rounded-md"
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

      <div className="fixed bottom-0 left-0 w-full px-4 py-4 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.8)_37.51%,#FFFFFF_63.04%)]">
        <div className="w-full max-w-md mx-auto bg-white">
          {/* Eligibility message */}
          {!bmi ||
            (!isEligible && (
              <p className="text-center text-sm text-red-700 mb-2 font-bold">
                Based on your BMI ({bmiDisplay}), you may be not qualify for
                medical weight loss
              </p>
            ))}

          <button
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
