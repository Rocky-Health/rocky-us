"use client";

import React, { useEffect, useState } from "react";
import { FaArrowRight, FaFemale, FaMale } from "react-icons/fa";

const ACCENT = "#A7885A";

const Glp1GenderStep = ({ userData, setUserData, onContinue }) => {
    const [selected, setSelected] = useState(() =>
        userData?.sex === "male" || userData?.sex === "female"
            ? userData.sex
            : null,
    );

    useEffect(() => {
        if (userData?.sex === "male" || userData?.sex === "female") {
            setSelected(userData.sex);
        }
    }, [userData?.sex]);

    const [error, setError] = useState(null);

    const handleCardClick = (value) => {
        if (error) setError(null);
        setSelected(value);
        setUserData((prev) => ({ ...prev, sex: value }));
    };

    const handleNext = () => {
        if (!selected) {
            setError("Please select an option to continue.");
            return;
        }
        setError(null);
        setUserData((prev) => ({ ...prev, sex: selected }));
        onContinue(selected);
    };

    const options = [
        {
            value: "male",
            label: "Male",
            Icon: FaMale,
        },
        {
            value: "female",
            label: "Female",
            Icon: FaFemale,
        },
    ];

    const iconClass =
        "mx-auto text-[5rem] leading-none text-[#251F20] md:text-[6.5rem]";

    return (
        <div className="flex w-full flex-col  pb-12 pt-6 px-2">
            <div className="mx-auto w-full max-w-4xl">
                <h1 className="subheaders-font text-[1.65rem] font-normal leading-[120%] tracking-[-0.02em] text-[#251F20] md:text-[2rem]">
                    Are you male or female?
                </h1>
                <p className="subheaders-font mt-4 text-base leading-[150%] text-[#251F20]/70">
                    This helps us understand your body complexity and hormones
                    so we can assess you better.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 md:gap-6">
                    {options.map(({ value, label, Icon }) => {
                        const isSel = selected === value;
                        return (
                            <button
                                key={value}
                                type="button"
                                onClick={() => handleCardClick(value)}
                                className={`flex flex-col items-center rounded-2xl border-2 bg-white px-4 py-6 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2 md:px-6 md:py-6 ${
                                    isSel
                                        ? "border-[#A7885A]"
                                        : "border-[#E8E4DF]"
                                }`}
                            >
                                <Icon className={iconClass} aria-hidden />
                                <span className="headers-font mt-4 text-lg text-[#251F20] md:text-xl">
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {error && (
                    <p className="text-red-500 text-[13px] mt-4 text-center">{error}</p>
                )}
                <button
                    type="button"
                    onClick={handleNext}
                    className="mt-4 flex h-[52px] w-full items-center justify-center gap-2 rounded-full font-sans text-base font-medium text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A7885A] focus-visible:ring-offset-2"
                    style={{ backgroundColor: ACCENT }}
                >
                    <span>Next</span>
                    <FaArrowRight className="text-sm" />
                </button>
            </div>
        </div>
    );
};

export default Glp1GenderStep;
