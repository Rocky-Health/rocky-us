"use client";

import { useState } from "react";
import { MdPlayArrow } from "react-icons/md";
import CustomContainImage from "../utils/CustomContainImage";

const ROCKY_ACCENT = "text-[#AE7E56]";
const ROCKY_ACCENT_SOFT = "text-[#BCA889]";

export const NAD_PLUS_MEDICATION_TIMELINE_STEPS = [
    {
        label: "Today",
        action: "Get Up To $100 Off Today!",
        color: ROCKY_ACCENT,
    },
    {
        label: "In 1 day",
        action: "Provider writes an Rx",
        color: ROCKY_ACCENT,
    },
    {
        label: "Within 1 day",
        action: "Your order ships from our licensed US pharmacies",
        color: ROCKY_ACCENT_SOFT,
    },
    {
        label: "Free & Discreet 2-Day Delivery",
        action: "Get your medication",
        color: ROCKY_ACCENT_SOFT,
    },
    {
        label: "On-going care & support with MyRocky Nursing Staff",
        action: "Begin treatment",
        color: ROCKY_ACCENT_SOFT,
    },
];

export const NAD_PLUS_MYROCKY_LOGO =
    "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp";

export const NAD_PLUS_TIMELINE_PHONE_SRC = "/nad+/Get your NAD+ 1.png";

export default function NadPlusMedicationTimelineSection({
    headline = "Get your NAD+ meds in just 1–2 days.",
    subtitle = "Direct healthcare, without the long wait times or doctor denials.",
    steps = NAD_PLUS_MEDICATION_TIMELINE_STEPS,
    logoSrc = NAD_PLUS_MYROCKY_LOGO,
    phoneSrc = NAD_PLUS_TIMELINE_PHONE_SRC,
    phoneAlt = "Start your MyRocky visit on your phone",
}) {
    const [openByIndex, setOpenByIndex] = useState({});

    const toggleRow = (index) => {
        setOpenByIndex((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    return (
        <section className="w-full bg-[#F5F4EF] px-4 pb-10 pt-0 md:pb-14">
            <div className="rounded-[54px] border border-[#E2E2E1] bg-white p-4 sm:p-8">
                <div className="mx-auto flex max-w-7xl py-14 md:py-20  flex-col items-center sm:gap-12 gap-6 lg:flex-row lg:items-start lg:gap-16 xl:gap-32">
                    <div className="flex-1 lg:max-w-xl lg:shrink">
                        <h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                            {headline}
                        </h2>
                        <p className="font-poppins text-base font-light text-gray-600">
                            {subtitle}
                        </p>

                        <ul className="mt-8 divide-y divide-[#E2E2E1] border-b border-[#E2E2E1] sm:mt-12">
                            {steps.map(({ label, action, color }, idx) => {
                                    const isOpen = !!openByIndex[idx];
                                    return (
                                        <li
                                            key={`${label}-${idx}`}
                                            className="py-0"
                                        >
                                            <button
                                                type="button"
                                                aria-expanded={isOpen}
                                                onClick={() => toggleRow(idx)}
                                                className="w-full rounded-xl py-3 text-left transition-colors"
                                            >
                                                <div
                                                    className={`mb-2 font-poppins text-xs font-semibold tracking-wide ${color}`}
                                                >
                                                    {label}
                                                </div>
                                                <div className="flex items-start gap-1 font-poppins text-lg font-semibold leading-snug text-gray-900 md:leading-snug">
                                                    <MdPlayArrow
                                                        className={`shrink-0 text-[#AE7E56] transition-transform duration-300 ease-out md:text-2xl ${
                                                            isOpen
                                                                ? "rotate-90"
                                                                : "rotate-0"
                                                        }`}
                                                        aria-hidden
                                                    />
                                                    <span>{action}</span>
                                                </div>
                                            </button>
                                        </li>
                                    );
                            })}
                        </ul>
                    </div>

                    <div className="relative overflow-hidden rounded-[16px] flex w-full md:w-[552px] aspect-square sm:aspect-auto sm:h-[540px] lg:h-[640px] justify-center lg:justify-start lg:shadow-lg">
                        <CustomContainImage
                            src={phoneSrc}
                            alt={phoneAlt}
                            fill
                            className="object-contain w-full h-full object-[center_top] shadow-lg "
                            sizes=""
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
