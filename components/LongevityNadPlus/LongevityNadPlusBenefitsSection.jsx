"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRightLong } from "react-icons/fa6";
import CustomImage from "@/components/utils/CustomImage";
import NadChart from "./NadChart";

const CHART_CAPTION =
    "Approximate NAD+ levels relative to age 20 baseline, based on published research";

const SHARED_DESCRIPTION =
    "NAD+ levels decline steadily after age 30, losing up to 50% by your 40s. Restoring them is key to energy, longevity, and overall vitality.";

const BENEFIT_TABS = [
    {
        id: "absorption",
        label: "Absorption",
        description: SHARED_DESCRIPTION,
        image: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/absorption-bg.png",
        showChart: true,
    },
    {
        id: "energy",
        label: "Energy",
        description: SHARED_DESCRIPTION,
        image: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/energy-bg.png",
        overlayText:
            "Replenish NAD+ levels to support sustained energy, focus, and daily performance.",
    },
    {
        id: "recovery",
        label: "Recovery",
        description: SHARED_DESCRIPTION,
        image: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/recovery-bg.png",
        overlayText:
            "Enhance cellular repair and reduce fatigue to help your body recover faster.",
    },
    {
        id: "longevity",
        label: "Longevity",
        description: SHARED_DESCRIPTION,
        image: "https://myrocky.b-cdn.net/WP%20Images/longevity-nad-plus/longevity-bg.png",
        overlayText:
            "Support healthy aging by restoring NAD+ and promoting long-term cellular vitality.",
    },
];

const LongevityNadPlusBenefitsSection = ({
    onCtaClick,
    isCtaLoading = false,
} = {}) => {
    const [activeTab, setActiveTab] = useState(BENEFIT_TABS[0].id);
    const activeContent =
        BENEFIT_TABS.find((tab) => tab.id === activeTab) ?? BENEFIT_TABS[0];

    return (
        <section className="bg-[#FAFAFA] w-full">
            <div className="max-w-[1200px] mx-auto px-5 py-14 md:py-24">
                <div className="grid md:grid-cols-2 gap-10 md:gap-16">
                    <div className="flex flex-col gap-8 md:gap-10">
                        <ul className="flex flex-col gap-3">
                            {BENEFIT_TABS.map((tab) => {
                                const isActive = tab.id === activeTab;

                                return (
                                    <li key={tab.id}>
                                        <button
                                            type="button"
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`dm-mono-font flex items-center gap-3 text-left transition-colors ${
                                                isActive
                                                    ? "text-black"
                                                    : "text-[#00000066] hover:text-[#000000aa]"
                                            } uppercase`}
                                        >
                                            <span
                                                className={`helvetica-display-font text-3xl md:text-5xl leading-[115%] ${
                                                    isActive
                                                        ? "font-medium"
                                                        : "font-normal"
                                                }`}
                                            >
                                                {tab.label}
                                            </span>
                                            {isActive && (
                                                <FaArrowRightLong className="w-7 h-7 text-[#AE7E56] flex-shrink-0" />
                                            )}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>

                        <p className="helvetica-text-font text-base leading-[140%] text-black max-w-[480px] grow flex items-center">
                            {activeContent.description}
                        </p>

                        {onCtaClick ? (
                            <button
                                type="button"
                                onClick={onCtaClick}
                                disabled={isCtaLoading}
                                className="dm-mono-font inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-black text-white text-sm md:text-base font-medium hover:bg-gray-900 transition-all duration-300 hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 w-full md:w-fit uppercase"
                            >
                                Start Your Free Assessment
                                <FaArrowRightLong className="w-4 h-4" />
                            </button>
                        ) : (
                            <Link
                                href="/nad-consultation-quiz"
                                className="dm-mono-font inline-flex items-center justify-center gap-2 h-12 px-8 rounded-full bg-black text-white text-sm md:text-base font-medium hover:bg-gray-900 transition-all duration-300 hover:scale-105 w-full md:w-fit uppercase"
                            >
                                Start Your Free Assessment
                                <FaArrowRightLong className="w-4 h-4" />
                            </Link>
                        )}
                    </div>

                    <div className="relative min-h-[360px] md:min-h-[480px] rounded-[24px] overflow-hidden">
                        <AnimatePresence initial={false}>
                            <motion.div
                                key={activeContent.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{
                                    duration: 0.5,
                                    ease: "easeInOut",
                                }}
                                className="absolute inset-0"
                            >
                                <CustomImage
                                    src={activeContent.image}
                                    alt=""
                                    fill
                                    className="object-cover object-center"
                                    sizes="(max-width: 768px) 100vw, 560px"
                                />
                            </motion.div>
                        </AnimatePresence>

                        {activeContent.showChart ? (
                            <>
                                {/* <div className="absolute inset-0 z-[1] bg-black/35" /> */}

                                <div className="relative z-10 flex flex-col h-full min-h-[360px] md:min-h-[480px] p-6 md:p-8 gap-6 justify-evenly">
                                    <div className="flex items-center min-h-[220px] md:min-h-[280px]">
                                        <NadChart />
                                    </div>

                                    <AnimatePresence mode="wait">
                                        <motion.p
                                            key={activeContent.id}
                                            initial={{ opacity: 0, y: 24 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 16 }}
                                            transition={{
                                                duration: 0.45,
                                                ease: "easeOut",
                                            }}
                                            className="text-white text-sm text-center leading-[140%] tracking-[0.04em] max-w-[420px] mx-auto"
                                        >
                                            {CHART_CAPTION}
                                        </motion.p>
                                    </AnimatePresence>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                                <AnimatePresence mode="wait">
                                    <motion.p
                                        key={activeContent.id}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 16 }}
                                        transition={{
                                            duration: 0.45,
                                            ease: "easeOut",
                                        }}
                                        className="absolute bottom-6 md:bottom-8 left-0 right-0 z-10 px-6 md:px-10 text-white text-sm md:text-base text-center leading-[140%] max-w-[440px] mx-auto"
                                    >
                                        {activeContent.overlayText}
                                    </motion.p>
                                </AnimatePresence>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LongevityNadPlusBenefitsSection;
