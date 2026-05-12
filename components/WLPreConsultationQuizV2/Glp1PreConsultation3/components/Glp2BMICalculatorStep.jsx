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
    onQuizChromeVisibilityChange,
}) => {
    const { weight: weightPounds, height = {}, bmi } = userData || {};
    const { feet: heightFeet = "", inches: heightInches = "" } = height;

    const feetRef = useRef(null);
    const inchesRef = useRef(null);
    const weightRef = useRef(null);
    const continueRef = useRef(null);
    const [bmiDisqualShown, setBmiDisqualShown] = useState(false);

    useEffect(() => {
        onQuizChromeVisibilityChange?.(bmiDisqualShown);
    }, [bmiDisqualShown, onQuizChromeVisibilityChange]);

    useEffect(() => {
        return () => {
            onQuizChromeVisibilityChange?.(false);
        };
    }, [onQuizChromeVisibilityChange]);

    useEffect(() => {
        const feetNum = parseInt(heightFeet, 10);
        const inchRaw =
            heightInches === "" ||
            heightInches === undefined ||
            heightInches === null
                ? NaN
                : parseInt(heightInches, 10);
        const inchesNum = Number.isFinite(inchRaw) ? inchRaw : NaN;
        const weightNum = parseFloat(weightPounds) || 0;
        let bmiValue = "";

        const feetOk = Number.isFinite(feetNum) && feetNum >= 4 && feetNum <= 6;
        const inchesOk =
            Number.isFinite(inchesNum) && inchesNum >= 0 && inchesNum <= 11;

        if (feetOk && inchesOk && weightNum > 0) {
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

    const feetOptions = [4, 5, 6];
    const inchesOptions = Array.from({ length: 12 }, (_, i) => i);

    const feetSelectValue = feetOptions.includes(parseInt(heightFeet, 10))
        ? String(parseInt(heightFeet, 10))
        : "";
    const inchParsed = parseInt(heightInches, 10);
    const inchesSelectValue =
        heightInches === "" ||
        heightInches === undefined ||
        heightInches === null ||
        Number.isNaN(inchParsed)
            ? ""
            : inchesOptions.includes(inchParsed)
              ? String(inchParsed)
              : "";

    const handleAction = () => {
        logger.log(config.showPopupAfterStep);
        if (config.showPopupAfterStep) {
            onAction("showPopup", config.showPopupAfterStep);
        } else {
            onContinue();
        }
    };

    const bmiNum =
        bmi !== undefined && bmi !== null && bmi !== "" ? parseFloat(bmi) : NaN;
    const hasValidBmi = Number.isFinite(bmiNum);

    const handleNextClick = () => {
        if (!hasValidBmi) return;
        if (bmiNum < 27) {
            setBmiDisqualShown(true);
            return;
        }
        setBmiDisqualShown(false);
        handleAction();
    };

    const handleCheckAgain = () => {
        setBmiDisqualShown(false);
    };

    if (bmiDisqualShown && hasValidBmi && bmiNum < 27) {
        return (
            <div className="flex min-h-[100dvh] w-full flex-col bg-[#F5F4EF]">
                <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-start px-6 pb-16 pt-20 text-center">
                    <h2 className="subheaders-font mb-10 text-3xl md:text-5xl font-normal leading-[120%] tracking-[-0.02em] text-[#000]">
                        It looks like you may not qualify...
                    </h2>
                    <p className="mb-2 font-sans text-base font-semibold uppercase tracking-[0.02em] text-[#251F20]/80">
                        Your BMI:
                    </p>
                    <p className="headers-font mb-20 text-5xl font-normal leading-none text-[#251F20]">
                        {bmiNum.toFixed(2)}
                    </p>
                    <p className="headers-font mb-12  text-xl leading-[110%] text-[#251F20]">
                        To qualify for GLP-1 Medications your BMI needs to be 27
                        or higher. Please check your answers again to verify
                        your BMI.
                    </p>
                    <button
                        type="button"
                        onClick={handleCheckAgain}
                        className="headers-font text-lg font-medium text-[#251F20] hover:underline decoration-2 underline-offset-[6px] transition-opacity hover:opacity-80"
                    >
                        Check Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full w-full flex-col">
            <div className="mx-auto w-full flex-grow pb-4">
                <div className="rounded-[16px] overflow-hidden lg:mb-10 mb-6 w-full h-[400px] lg:h-[480px] relative">
                    <CustomImage
                        src="https://myrocky.b-cdn.net/WP%20Images/glp-offer/step1-hdr.jpg"
                        alt="Medical weight loss"
                        fill
                        className="object-contain object-center"
                    />
                </div>

                <h1 className="text-[42px] lg:text-[45px] leading-[115%] font-[450] mb-4 text-[#251F20] subheaders-font">
                    Reach your goal weight fast{" "}
                    <span className="text-[#AE7E56] headers-font">
                        without restrictive diets and exercise.
                    </span>
                </h1>

                <p className="text-sm leading-[140%] font-[400] text-[#00000099] mb-10">
                    Let&apos;s calculate your BMI to make sure you're a good
                    candidate for medical weight loss.
                </p>

                <h2 className="headers-font mb-8 text-3xl leading-[90%]">
                    What is your height and weight?
                </h2>

                <div>
                    <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                        <div className="w-full">
                            <label
                                className="mb-2 block text-lg font-medium text-[#000000]"
                                htmlFor="glp1-pc3-height-feet"
                            >
                                Feet
                            </label>
                            <select
                                id="glp1-pc3-height-feet"
                                ref={feetRef}
                                className={`h-[52px] w-full cursor-pointer appearance-none rounded-md border border-[#E2E2E1] bg-[#F9F9F9] bg-[length:12px] bg-[right_14px_center] bg-no-repeat px-[14px] py-[16px] pr-10 ${!feetSelectValue ? "text-[#000]" : "text-[#000]"}`}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                }}
                                value={feetSelectValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setUserData((prev) => ({
                                        ...prev,
                                        height: {
                                            ...prev.height,
                                            feet: value === "" ? "" : value,
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
                            >
                                <option value="" disabled hidden>
                                    Select feet
                                </option>
                                {feetOptions.map((ft) => (
                                    <option key={ft} value={String(ft)}>
                                        {ft}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="w-full">
                            <label
                                className="mb-2 block text-lg font-medium text-[#000000]"
                                htmlFor="glp1-pc3-height-inches"
                            >
                                Inches
                            </label>
                            <select
                                id="glp1-pc3-height-inches"
                                ref={inchesRef}
                                className={`h-[52px] w-full cursor-pointer appearance-none rounded-md border border-[#E2E2E1] bg-[#F9F9F9] bg-[length:12px] bg-[right_14px_center] bg-no-repeat px-4 pr-10 ${!inchesSelectValue ? "text-[#000]" : "text-[#000]"}`}
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                                }}
                                value={inchesSelectValue}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setUserData((prev) => ({
                                        ...prev,
                                        height: {
                                            ...prev.height,
                                            feet: heightFeet,
                                            inches: value === "" ? "" : value,
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
                            >
                                <option value="" disabled hidden>
                                    Select inches
                                </option>
                                {inchesOptions.map((inch) => (
                                    <option key={inch} value={String(inch)}>
                                        {inch}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block mb-2 text-lg font-medium text-[#000000]">
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
                            setUserData((prev) => ({
                                ...prev,
                                weight:
                                    value === ""
                                        ? ""
                                        : parseInt(value, 10) || 0,
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

                <div className="w-full max-w-4xl">
                    <button
                        ref={continueRef}
                        className={`flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 font-medium focus:outline-none focus:ring-0 ${
                            hasValidBmi
                                ? "bg-[#A7885A] text-white"
                                : "cursor-not-allowed bg-gray-300 text-gray-700"
                        }`}
                        onClick={handleNextClick}
                        disabled={!hasValidBmi}
                        type="button"
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                </div>

                <div className="mx-auto mt-10 flex w-full max-w-xl flex-col items-center gap-6 rounded-2xl bg-[#F9F7F2] px-4 py-8 sm:px-8">
                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8">
                        <div className="relative h-auto w-[min(300px,85vw)] shrink-0 aspect-[30/2]">
                            <CustomImage
                                src="/glp-3-quiz/trustpilot.png"
                                alt="Excellent rating on Trustpilot"
                                fill
                                className="object-cover object-center w-full h-full"
                            />
                        </div>
                    </div>
                    <div className="relative h-[79px] w-[73px] shrink-0">
                        <CustomImage
                            src="https://static.legitscript.com/seals/44796030.png"
                            alt="LegitScript Certified"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Glp2BMICalculatorStep;
