"use client";

import { useState } from "react";
import { MdPlayArrow } from "react-icons/md";
import CustomContainImage from "../utils/CustomContainImage";

const LABEL_ACCENT = "text-[#B89968]";
const LABEL_HIGHLIGHT = "text-[#A88BB8]";

export const DM_OFFERS_MEDICATION_TIMELINE_STEPS = [
    {
        label: "Today",
        tone: "accent",
        action: "Get $150 off today!",
        color: "text-[#d9b596]",
    },
    {
        label: "In 1 day",
        tone: "accent",
        action: "Provider writes an Rx",
        color: "text-[#b89e73;]",
    },
    {
        label: "Within 1 day",
        tone: "accent",
        action: "Your order ships from our licensed US pharmacies",
        color: "text-[#c9a9c9]",
    },
    {
        label: "Free & discreet 1–2 day delivery",
        tone: "highlight",
        action: "Get your medication",
        color: "text-[#e7a1d9]",
    },
    {
        label: "Ongoing care & support with MyRocky Team",
        tone: "highlight",
        action: "Begin treatment",
        color: "text-[#c87ad4]",
    },
];

export const DM_OFFERS_MYROCKY_LOGO =
    "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/my-rocky-black.webp";

/** Swap for a WL quiz screenshot when available (`/public/dm-offers/…`). */
export const DM_OFFERS_TIMELINE_PHONE_SRC =
    "https://myrocky.b-cdn.net/WP%20Images/glp-offer/EnhancesCover.png";

export default function DmOffersMedicationTimelineSection({
    headline = "Get your weight loss meds in 1–2 days",
    subtitle = "Direct healthcare, without the long wait times or doctor denials.",
    steps = DM_OFFERS_MEDICATION_TIMELINE_STEPS,
    logoSrc = DM_OFFERS_MYROCKY_LOGO,
    phoneSrc = DM_OFFERS_TIMELINE_PHONE_SRC,
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
        <section className="w-full bg-[#FAF3EF] px-4 pt-2 pb-2 ">
            <div className="bg-white rounded-[54px] sm:p-8 p-4">
                <div className="mx-auto flex max-w-7xl py-14 md:py-20  flex-col items-center sm:gap-12 gap-6 lg:flex-row lg:items-start lg:gap-16 xl:gap-32">
                    <div className="flex-1 lg:max-w-xl lg:shrink">
                        <h2
                            className="
                        text-5xl font-thin text-gray-900/80 mb-4 leading-tight"
                        >
                            {headline}
                        </h2>
                        <p className="font-poppins text-base text-gray-700">
                            {subtitle}
                        </p>

                        <ul className="sm:mt-12 mt-8 divide-y divide-neutral-200 border-b border-neutral-200">
                            {steps.map(
                                (
                                    { label, tone = "accent", action, color },
                                    idx,
                                ) => {
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
                                                className="w-full rounded-xl py-3 text-left transition-colors "
                                            >
                                                <div
                                                    className={`font-poppins font-semibold tracking-wide text-xs mb-2 ${
                                                        color
                                                    }`}
                                                >
                                                    {label}
                                                </div>
                                                <div className="flex items-start gap-1 font-poppins text-lg font-semibold leading-snug text-neutral-900 md:leading-snug">
                                                    <MdPlayArrow
                                                        className={`shrink-0 text-neutral-800 md:text-2xl transition-transform duration-300 ease-out ${
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
                                },
                            )}
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
