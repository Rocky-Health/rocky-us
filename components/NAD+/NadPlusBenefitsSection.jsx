"use client";

import Image from "next/image";
import {
    FaBolt,
    FaBrain,
    FaPlus,
    FaStar,
    FaHeartbeat,
} from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";
import NadPlusFeaturesCtaBlock from "./NadPlusFeaturesCtaBlock";
import {
    NAD_PLUS_BENEFITS_CENTER_IMAGE,
    NAD_PLUS_BENEFITS_HEADER,
    NAD_PLUS_LEFT_BENEFITS,
    NAD_PLUS_RIGHT_BENEFITS,
    NAD_PLUS_TRUST_FEATURE_CARDS,
} from "./nadPlusBenefitsData";

const BENEFIT_ICONS = {
    energy: FaBolt,
    memory: FaBrain,
    inflammation: FaPlus,
    dna: HiSparkles,
    skin: FaStar,
    recovery: FaHeartbeat,
};

function BenefitCard({ title, description, iconKey }) {
    const Icon = BENEFIT_ICONS[iconKey];

    return (
        <article className="mx-auto flex w-full max-w-[260px] flex-col items-center text-center sm:max-w-[280px]">
            <span
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#F0E8DF] text-[#AE7E56]"
                aria-hidden
            >
                <Icon className="size-5" />
            </span>
            <h3 className="font-poppins text-base font-semibold leading-snug text-gray-900">
                {title}
            </h3>
            <p className="mt-2 font-poppins text-sm font-normal leading-relaxed text-gray-600">
                {description}
            </p>
        </article>
    );
}

export default function NadPlusBenefitsSection({
    getStartedHref = "/glp1-pre-consultation-3",
    pricingHref = "/glp1-pre-consultation-3",
    centerImageSrc = NAD_PLUS_BENEFITS_CENTER_IMAGE,
    centerImageAlt = "MyRocky NAD+ prescription vial",
    header = NAD_PLUS_BENEFITS_HEADER,
    leftBenefits = NAD_PLUS_LEFT_BENEFITS,
    rightBenefits = NAD_PLUS_RIGHT_BENEFITS,
    trustCards = NAD_PLUS_TRUST_FEATURE_CARDS,
}) {
    return (
        <section className="w-full bg-[#F5F4EF] pb-12 pt-10 md:pb-16 md:pt-14">
            <div className="mx-auto max-w-7xl px-4 md:px-6">
                <header className="mx-auto mb-10 max-w-3xl text-center md:mb-14">
                    <p className="mb-2 text-center text-lg font-light text-gray-600">
                        {header.eyebrow}
                    </p>
                    <h2 className="mt-3 pb-5 text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                        {header.title}
                    </h2>
                </header>
            </div>

            {/* Desktop / tablet: wider than 7xl so center art can scale up */}
            <div className="mx-auto hidden w-full max-w-[min(100%,1720px)] px-3 md:grid md:grid-cols-[minmax(0,1fr)_minmax(420px,54%)_minmax(0,1fr)] md:items-center md:gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(560px,56%)_minmax(0,1fr)] lg:gap-5 xl:gap-6 md:px-6 lg:px-8">
                <div className="flex flex-col items-center justify-center gap-8 lg:gap-10">
                    {leftBenefits.map((item) => (
                        <BenefitCard
                            key={item.id}
                            iconKey={item.id}
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </div>

                <div className="flex w-full items-center justify-center">
                    <Image
                        src={centerImageSrc}
                        alt={centerImageAlt}
                        width={960}
                        height={1440}
                        className="mx-auto h-auto w-full max-w-[min(100%,960px)] object-contain drop-shadow-xl"
                        priority
                    />
                </div>

                <div className="flex flex-col items-center justify-center gap-8 lg:gap-10">
                    {rightBenefits.map((item) => (
                        <BenefitCard
                            key={item.id}
                            iconKey={item.id}
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </div>
            </div>

            {/* Mobile */}
            <div className="mx-auto max-w-7xl px-4 md:hidden">
                <div className="flex justify-center">
                    <Image
                        src={centerImageSrc}
                        alt={centerImageAlt}
                        width={480}
                        height={720}
                        className="mx-auto h-auto w-full max-w-[min(100%,480px)] object-contain drop-shadow-lg"
                    />
                </div>
                <div className="mt-10 flex flex-col items-center gap-10">
                    {[...leftBenefits, ...rightBenefits].map((item) => (
                        <BenefitCard
                            key={item.id}
                            iconKey={item.id}
                            title={item.title}
                            description={item.description}
                        />
                    ))}
                </div>
            </div>

            <div className="mx-auto mt-12 max-w-7xl px-4 md:mt-14 md:px-6">
                <NadPlusFeaturesCtaBlock
                    getStartedHref={getStartedHref}
                    pricingHref={pricingHref}
                    cards={trustCards}
                    featuresBg="!max-w-7xl mb-2 bg-white/80 md:mb-4"
                />
            </div>
        </section>
    );
}
