"use client";

import React, { useMemo, useState } from "react";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const LAST_DOSE_OPTIONS = [
    { id: "0-5-days", label: "0-5 days" },
    { id: "6-10-days", label: "6-10 days" },
    { id: "11-14-days", label: "11-14 days" },
    {
        id: "2-4-weeks",
        label: "More than 2 weeks ago but within the last 4 weeks",
    },
    { id: "more-than-4-weeks", label: "More than 4 weeks ago" },
];

const PRESCRIBER_OPTIONS = [
    { value: "", label: "-- Select Provider --" },
    { value: "personal-doctor", label: "Personal Doctor" },
    { value: "weight-loss-clinic", label: "Weight Loss Clinic" },
    { value: "henry-meds", label: "Henry Meds" },
    { value: "hims-hers", label: "Hims/Hers" },
    { value: "future-health", label: "Future Health" },
    { value: "ro", label: "Ro" },
    { value: "remedy-meds", label: "Remedy Meds" },
    { value: "mochi", label: "Mochi" },
    { value: "medvi", label: "Medvi" },
    { value: "eden", label: "Eden" },
    { value: "noom", label: "Noom" },
    { value: "other", label: "Other" },
];

const Glp1PriorWeightLossMedicationDetailsStep = ({
    userData,
    setUserData,
    onContinue,
}) => {
    const priorPath = userData?.glp1RecentGlp1WeightLoss;
    const isGlp1 = priorPath === "yes-glp1";

    const copy = useMemo(
        () =>
            isGlp1
                ? {
                      headingRest: " You have experience with GLP-1.",
                      listLabel:
                          "Please list the name, dose, and frequency of your GLP-1 medication.",
                      placeholder: "Ex: Semaglutide 1mg, once weekly",
                  }
                : {
                      headingRest:
                          " You have experience with weight loss medication.",
                      listLabel:
                          "Please list the name, dose, and frequency of your weight loss medication.",
                      placeholder: "Ex: Semaglutide 1mg, once weekly",
                  },
        [isGlp1],
    );

    const [medDetails, setMedDetails] = useState(
        () => userData?.priorMedNameDoseFrequency ?? "",
    );
    const [lastDose, setLastDose] = useState(
        () => userData?.priorMedLastDose ?? null,
    );
    const [prescriber, setPrescriber] = useState(
        () => userData?.priorMedPrescriber ?? "",
    );
    const [prescriberOther, setPrescriberOther] = useState(
        () => userData?.priorMedPrescriberOther ?? "",
    );

    const canContinue =
        medDetails.trim().length > 0 &&
        lastDose != null &&
        prescriber !== "" &&
        (prescriber !== "other" || prescriberOther.trim().length > 0);

    const handleNext = () => {
        if (!canContinue) return;
        const next = {
            ...userData,
            priorMedNameDoseFrequency: medDetails.trim(),
            priorMedLastDose: lastDose,
            priorMedPrescriber: prescriber,
            priorMedPrescriberOther:
                prescriber === "other" ? prescriberOther.trim() : "",
        };
        setUserData(next);
        onContinue?.(next);
    };

    return (
        <div className="flex h-full w-full flex-col px-4 md:px-0">
            <div className="mx-auto w-full max-w-4xl flex-grow pb-10">
                <h1 className="subheaders-font text-5xl font-normal leading-[115%] tracking-[-0.02em] text-[#251F20]">
                    <span style={{ color: ACCENT }}>Great,</span>
                    {copy.headingRest}
                </h1>

                <label className="mt-8 block">
                    <span className="subheaders-font text-2xl font-normal leading-[140%] text-[#251F20]">
                        {copy.listLabel}
                    </span>
                    <textarea
                        value={medDetails}
                        onChange={(e) => setMedDetails(e.target.value)}
                        placeholder={copy.placeholder}
                        rows={4}
                        className="mt-3 w-full resize-y rounded-xl border border-[#E2E2E1] bg-white px-4 py-3 text-[15px] leading-[140%] text-[#251F20] placeholder:text-[#9CA3AF] focus:border-[#A7885A] focus:outline-none focus:ring-1 focus:ring-[#A7885A]"
                    />
                </label>

                <p className="subheaders-font mt-8 text-2xl font-normal leading-[140%] text-[#251F20]">
                    When was your last dose of medication?
                </p>
                <div className="mt-3 space-y-2">
                    {LAST_DOSE_OPTIONS.map((opt) => {
                        const isSel = lastDose === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => setLastDose(opt.id)}
                                className={`flex min-h-[52px] w-full items-center gap-3 rounded-xl border bg-white px-4 py-3 text-left ${
                                    isSel
                                        ? "border-2"
                                        : "border border-[#E2E2E1]"
                                }`}
                                style={
                                    isSel ? { borderColor: ACCENT } : undefined
                                }
                            >
                                <span
                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                                        isSel
                                            ? "border-transparent"
                                            : "border-[#CFCFCF]"
                                    }`}
                                    style={
                                        isSel
                                            ? { backgroundColor: ACCENT }
                                            : undefined
                                    }
                                >
                                    {isSel ? (
                                        <span className="h-2 w-2 rounded-full bg-white" />
                                    ) : null}
                                </span>
                                <span className="text-[15px] font-medium text-black">
                                    {opt.label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8">
                    <p className="subheaders-font text-2xl font-normal leading-[140%] text-[#251F20]">
                        Who prescribed your weight loss medication?
                    </p>
                    <p className="mt-3 text-base font-normal leading-[140%] text-[#251F20]">
                        Select Provider:
                    </p>
                    <select
                        value={prescriber}
                        onChange={(e) => setPrescriber(e.target.value)}
                        className="mt-2 w-full rounded-xl border border-[#E2E2E1] bg-white px-4 py-3 text-[15px] text-[#251F20] focus:border-[#A7885A] focus:outline-none focus:ring-1 focus:ring-[#A7885A]"
                    >
                        {PRESCRIBER_OPTIONS.map((o) => (
                            <option key={o.value || "empty"} value={o.value}>
                                {o.label}
                            </option>
                        ))}
                    </select>
                </div>

                {prescriber === "other" ? (
                    <label className="mt-6 block">
                        <span className="text-base font-normal leading-[140%] text-[#251F20]">
                            If other, please describe
                        </span>
                        <textarea
                            value={prescriberOther}
                            onChange={(e) => setPrescriberOther(e.target.value)}
                            rows={3}
                            className="mt-2 w-full resize-y rounded-xl border border-[#E2E2E1] bg-white px-4 py-3 text-[15px] focus:border-[#A7885A] focus:outline-none focus:ring-1 focus:ring-[#A7885A]"
                        />
                    </label>
                ) : null}
            </div>

            <div className=" bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] px-0 pb-4 backdrop-blur-sm">
                <div className="w-full max-w-4xl">
                    <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canContinue}
                        className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 text-base font-medium text-white focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-600"
                        style={
                            canContinue
                                ? { backgroundColor: ACCENT }
                                : undefined
                        }
                    >
                        <span>Next</span>
                        <FaArrowRight />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Glp1PriorWeightLossMedicationDetailsStep;
