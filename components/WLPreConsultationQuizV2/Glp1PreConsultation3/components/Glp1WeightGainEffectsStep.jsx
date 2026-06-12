"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";
const BG = "#F9F7F2";
const NONE_ID = "weight-effects-none";
const IMG = {
    down: "/glp-3-quiz/down--v1.png",
    comb: "/glp-3-quiz/001-hair-comb.png",
    inflammation: "/glp-3-quiz/inflammation.png",
    brain: "/glp-3-quiz/brain.png",
    deleteSign: "/glp-3-quiz/delete-sign--v1.png",
};

function toggleSelection(prev, id) {
    const list = Array.isArray(prev) ? prev : [];
    if (id === NONE_ID) {
        return list.includes(NONE_ID) ? [] : [NONE_ID];
    }
    const withoutNone = list.filter((x) => x !== NONE_ID);
    if (withoutNone.includes(id)) {
        return withoutNone.filter((x) => x !== id);
    }
    return [...withoutNone, id];
}

const EFFECT_OPTIONS = {
    male: [
        {
            id: "low-libido-ed",
            title: "Low Libido or Erectile Dysfunction",
            sub: null,
            image: IMG.down,
        },
        {
            id: "hair-loss",
            title: "Hair Loss",
            sub: null,
            image: IMG.comb,
        },
        {
            id: "skin-issues",
            title: "Skin Issues",
            sub: "Dry Skin, Acne, Etc",
            image: IMG.inflammation,
        },
        {
            id: "cognition-issues",
            title: "Cognition Issues",
            sub: "Brain Fog, Trouble Focusing, Memory Loss",
            image: IMG.brain,
        },
        {
            id: NONE_ID,
            title: "None of these",
            sub: null,
            image: IMG.deleteSign,
        },
    ],
    female: [
        {
            id: "low-libido",
            title: "Low Libido",
            sub: null,
            image: IMG.down,
        },
        {
            id: "hair-loss",
            title: "Hair Loss",
            sub: null,
            image: IMG.comb,
        },
        {
            id: "skin-issues",
            title: "Skin Issues",
            sub: "Dry Skin, Acne, Etc",
            image: IMG.inflammation,
        },
        {
            id: "cognition-issues",
            title: "Cognition Issues",
            sub: "Brain Fog, Trouble Focusing, Memory Loss",
            image: IMG.brain,
        },
        {
            id: NONE_ID,
            title: "None of these",
            sub: null,
            image: IMG.deleteSign,
        },
    ],
};

const Glp1WeightGainEffectsStep = ({ userData, setUserData, onContinue }) => {
    const isFemale = userData?.sex === "female";
    const variant = isFemale ? "female" : "male";
    const options = EFFECT_OPTIONS[variant];

    const optionIds = useMemo(() => options.map((o) => o.id), [options]);

    const [selected, setSelected] = useState(() =>
        Array.isArray(userData?.weightGainEffects)
            ? userData.weightGainEffects
            : [],
    );
    const [error, setError] = useState("");

    useEffect(() => {
        const list = Array.isArray(userData?.weightGainEffects)
            ? userData.weightGainEffects
            : [];
        const next = list.filter((id) => optionIds.includes(id));
        setSelected(next);
        if (next.length !== list.length) {
            setUserData((u) => ({ ...u, weightGainEffects: next }));
        }
    }, [userData?.weightGainEffects, optionIds, setUserData]);
    const headingPrefix = useMemo(
        () => (isFemale ? "Women" : "Men"),
        [isFemale],
    );

    const handleCardClick = (id) => {
        if (error) setError("");
        setSelected((prev) => {
            const next = toggleSelection(prev, id);
            setUserData((u) => ({ ...u, weightGainEffects: next }));
            return next;
        });
    };

    const handleNext = () => {
        if (!selected.length) {
            setError("Please select an option to continue.");
            return;
        }
        setError("");
        setUserData((u) => ({ ...u, weightGainEffects: selected }));
        onContinue(selected);
    };

    const imageWrapClass =
        "flex h-14 w-14 shrink-0 items-center justify-center md:h-16 md:w-16";

    return (
        <div className="w-full px-2 pb-12 lg:pt-6 pt-4">
            <div className="mx-auto w-full max-w-4xl">
                <h1 className="headers-font text-5xl font-normal leading-[125%] tracking-[-0.02em] text-[#251F20]">
                    {headingPrefix} experience{" "}
                    <span style={{ color: ACCENT }}>unique effects</span> from
                    weight gain.
                </h1>
                <p className="headers-font mt-4 text-3xl leading-[145%] text-[#251F20]/75">
                    Do you experience any of the following?
                </p>

                <div className="lg:mt-10 mt-6 flex flex-wrap justify-start gap-3  md:gap-4">
                    {options.map(({ id, title, sub, image }) => {
                        const isOn = selected.includes(id);
                        return (
                            <button
                                key={`${variant}-${id}`}
                                type="button"
                                onClick={() => handleCardClick(id)}
                                className={`flex min-h-[140px] w-[calc(50%-6px)]  flex-col items-center justify-center rounded-2xl border-2 bg-white px-4 py-6 text-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 sm:w-[calc(33.333%-11px)] md:min-h-[160px] md:px-5 md:py-6 ${
                                    isOn
                                        ? "border-[#A7885A]"
                                        : "border-[#E5E2DC]"
                                }`}
                            >
                                <div className={imageWrapClass} aria-hidden>
                                    <Image
                                        src={image}
                                        alt=""
                                        width={64}
                                        height={64}
                                        className="h-full w-full object-contain object-center"
                                    />
                                </div>
                                <span className="headers-font mt-3 text-xl font-normal leading-tight text-[#251F20]">
                                    {title}
                                </span>
                                {sub ? (
                                    <span className="headers-font mt-1 text-sm leading-snug text-[#251F20]/65">
                                        {sub}
                                    </span>
                                ) : null}
                            </button>
                        );
                    })}
                </div>

                {error && (
                    <p className="text-red-500 text-[13px] mt-10 mb-2 text-center">
                        {error}
                    </p>
                )}
                <button
                    type="button"
                    onClick={handleNext}
                    className={`flex h-[52px] w-full max-w-4xl items-center justify-center gap-2 rounded-full font-sans text-base font-medium text-white transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 ${error ? "" : "mt-10"}`}
                    style={{ backgroundColor: ACCENT }}
                >
                    <span>Next</span>
                    <FaArrowRight className="text-sm" />
                </button>
            </div>
        </div>
    );
};

export default Glp1WeightGainEffectsStep;
