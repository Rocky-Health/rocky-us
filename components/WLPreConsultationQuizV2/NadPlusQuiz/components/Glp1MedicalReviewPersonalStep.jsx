"use client";

import React, { useEffect, useState } from "react";

const ACCENT = "#A7885A";
const HIGH_RATE = 0.0175;

function estimateWeeksToGoal(weight, goalWeight) {
    const w = parseFloat(weight) || 0;
    const g = parseFloat(goalWeight) || 0;
    const lbs = Math.max(w - g, 0);
    const lossPerWeek = w * HIGH_RATE;
    if (lossPerWeek <= 0 || lbs <= 0) return null;
    return Math.max(1, Math.ceil(lbs / lossPerWeek));
}

const INPUT_CLASS =
    "w-full h-[52px] rounded-[8px] border border-[#E2E2E1] bg-white px-4 text-[15px] text-[#251F20] focus:outline-none focus:border-[#A7885A]";

const SELECT_CLASS =
    "w-full h-[52px] appearance-none rounded-[8px] border border-[#E2E2E1] bg-white px-4 pr-10 text-[15px] text-[#251F20] focus:outline-none focus:border-[#A7885A]";

const Glp1MedicalReviewPersonalStep = ({
    config,
    userData,
    setUserData,
    onContinue,
}) => {
    const fields = config?.fields || [];
    const firstNameField = fields.find((f) => f.id === "firstName");
    const lastNameField = fields.find((f) => f.id === "lastName");
    const provinceField = fields.find((f) => f.id === "province");

    const [firstName, setFirstName] = useState(userData?.firstName || "");
    const [lastName, setLastName] = useState(userData?.lastName || "");
    const [province, setProvince] = useState(userData?.province || "");
    const [errors, setErrors] = useState({});

    const clearFieldError = (field) =>
        setErrors((prev) => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });

    useEffect(() => {
        setFirstName(userData?.firstName || "");
        setLastName(userData?.lastName || "");
        setProvince(userData?.province || "");
    }, [userData?.firstName, userData?.lastName, userData?.province]);

    const bmiRaw = userData?.bmi;
    const bmiDisplay =
        bmiRaw !== undefined && bmiRaw !== null && String(bmiRaw).trim() !== ""
            ? Number.isFinite(Number(bmiRaw))
                ? Number(bmiRaw).toFixed(0)
                : String(bmiRaw)
            : "—";

    const weightRaw = userData?.weight;
    const weightDisplay =
        weightRaw !== undefined &&
        weightRaw !== null &&
        String(weightRaw).trim() !== ""
            ? String(weightRaw)
            : "—";

    const goalRaw = userData?.goalWeight;
    const goalDisplay =
        goalRaw !== undefined &&
        goalRaw !== null &&
        String(goalRaw).trim() !== ""
            ? String(goalRaw)
            : "—";

    const weeksToGoal = estimateWeeksToGoal(
        userData?.weight,
        userData?.goalWeight,
    );

    const eligibilityLead =
        config?.eligibilityLead || "Let's proceed to check your eligibility.";

    const privacyNote =
        config?.privacyNote ||
        "Your information is never shared and is protected by HIPAA.";

    const stateOptions =
        provinceField?.options?.filter((o) => o.value !== "") || [];

    const handleSubmit = () => {
        const newErrors = {};
        if (!firstName.trim()) newErrors.firstName = "Please enter your first name.";
        if (!lastName.trim()) newErrors.lastName = "Please enter your last name.";
        if (String(province).trim() === "") newErrors.province = "Please select your state.";
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setUserData((prev) => ({
            ...prev,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            province,
        }));
        onContinue?.();
    };

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow lg:pb-10 pb-6">
                <h1
                    className="subheaders-font text-5xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20] text-center"
                    style={{ color: ACCENT }}
                >
                    Your Medical Review
                </h1>

                <div className=" space-y-4 py-4 text-[15px] leading-[150%] text-[#251F20]">
                    <p>
                        <span className="font-semibold">BMI: </span>
                        <span>{bmiDisplay}</span>
                    </p>
                    <p className="">
                        <span className="font-semibold">Current Weight: </span>
                        <span>
                            {weightDisplay}
                            {weightDisplay !== "—" ? " lbs" : ""}
                        </span>
                    </p>
                    <p className="flex flex-wrap items-baseline gap-x-1">
                        <span className="font-semibold">Goal Weight: </span>
                        <span>
                            {goalDisplay}
                            {goalDisplay !== "—" ? " lbs" : ""}
                        </span>
                        {weeksToGoal != null && goalDisplay !== "—" && (
                            <span className="underline decoration-1 underline-offset-2 font-semibold">
                                within {weeksToGoal} weeks
                            </span>
                        )}
                    </p>
                </div>

                <p className="subheaders-font border-y border-[#E2E2E1] py-4 text-base font-normal leading-[145%] text-[#251F20] mb-4">
                    You are a{" "}
                    <strong className="font-semibold">strong candidate</strong>{" "}
                    for medical weight loss with a{" "}
                    <strong className="font-semibold">94% chance</strong> of
                    successful treatment if qualified.
                </p>

                <h2 className="subheaders-font mb-6  font-normal leading-[120%] text-[#251F20] text-3xl">
                    {eligibilityLead}
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-4">
                    <div>
                        {firstNameField?.label && (
                            <label
                                className="mb-2 block text-xl font-normal text-[#251F20]"
                                htmlFor="nad-plus-med-review-first"
                            >
                                {firstNameField.label}
                            </label>
                        )}
                        <input
                            id="nad-plus-med-review-first"
                            name="firstName"
                            type="text"
                            autoComplete="given-name"
                            className={`${INPUT_CLASS} ${errors.firstName ? "border-red-500 focus:border-red-500" : ""}`}
                            placeholder={firstNameField?.placeholder || ""}
                            value={firstName}
                            onChange={(e) => { setFirstName(e.target.value); clearFieldError("firstName"); }}
                        />
                        {errors.firstName && (
                            <p className="text-red-500 text-[13px] mt-1">{errors.firstName}</p>
                        )}
                    </div>
                    <div>
                        {lastNameField?.label && (
                            <label
                                className="mb-2 block text-xl font-normal text-[#251F20]"
                                htmlFor="nad-plus-med-review-last"
                            >
                                {lastNameField.label}
                            </label>
                        )}
                        <input
                            id="nad-plus-med-review-last"
                            name="lastName"
                            type="text"
                            autoComplete="family-name"
                            className={`${INPUT_CLASS} ${errors.lastName ? "border-red-500 focus:border-red-500" : ""}`}
                            placeholder={lastNameField?.placeholder || ""}
                            value={lastName}
                            onChange={(e) => { setLastName(e.target.value); clearFieldError("lastName"); }}
                        />
                        {errors.lastName && (
                            <p className="text-red-500 text-[13px] mt-1">{errors.lastName}</p>
                        )}
                    </div>
                </div>

                {provinceField && (
                    <div className="mt-8">
                        <label
                            className="mb-2 block text-xl font-normal text-[#251F20]"
                            htmlFor="nad-plus-med-review-state"
                        >
                            {provinceField.label}
                        </label>
                        <div className="relative">
                            <select
                                id="nad-plus-med-review-state"
                                name="province"
                                value={province}
                                onChange={(e) => { setProvince(e.target.value); clearFieldError("province"); }}
                                className={`${SELECT_CLASS} ${errors.province ? "border-red-500 focus:border-red-500" : ""}`}
                            >
                                <option value="">- State -</option>
                                {stateOptions.map((opt) => (
                                    <option
                                        key={opt.value ?? opt.id}
                                        value={opt.value ?? opt.id}
                                    >
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#888]">
                                ▾
                            </span>
                        </div>
                        {errors.province && (
                            <p className="text-red-500 text-[13px] mt-1">{errors.province}</p>
                        )}
                    </div>
                )}

                <p className="mx-auto lg:mt-10 mt-6 max-w-xl text-center text-sm leading-[140%] text-[#251F20]">
                    {privacyNote}
                </p>
            </div>

            <div className=" bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] px-0 pb-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        style={{ backgroundColor: ACCENT }}
                        className="headers-font flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 font-medium text-white focus:outline-none focus:ring-0"
                    >
                        <span>Next</span>
                        <span aria-hidden className="text-lg leading-none">
                            →
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glp1MedicalReviewPersonalStep;
