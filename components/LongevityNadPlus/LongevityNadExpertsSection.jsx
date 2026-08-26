"use client";

import CustomImage from "@/components/utils/CustomImage";
import NadCarouselControls, { useNadCarousel } from "./NadCarouselControls";

function CheckIcon() {
    return (
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#AE7E56]">
            <svg width="12" height="9" viewBox="0 0 12 9" fill="none" aria-hidden>
                <path
                    d="M1 4.5L4.2 7.5L11 1"
                    stroke="white"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </span>
    );
}

function ExpertCard({ expert }) {
    return (
        <article className="relative h-[420px] w-[280px] shrink-0 snap-start overflow-hidden rounded-2xl md:h-[480px] md:w-[356px]">
            <CustomImage
                src={expert.image}
                alt={`${expert.name}, ${expert.title}`}
                fill
                sizes="(max-width: 768px) 280px, 356px"
            />
        </article>
    );
}

// Same two team members and credentials already published on /about-us —
const EXPERTS = "/NAD+/redesign/experts";

const NAD_EXPERTS_US = [
    {
        name: "Dr. George Mankaryous",
        title: "M.D. CCFP",
        image: `${EXPERTS}/one.png`,
    },
    {
        name: "Dr. Mena Mirhom",
        title: "M.D. FAPA",
        image: `${EXPERTS}/two.png`,
    },
    {
        name: "Matthew Michael",
        title: "PharmD, MBA, RPh",
        image: `${EXPERTS}/three.png`,
    },
    {
        name: "Perihan Koussa",
        title: "PharmD, RPh",
        image: `${EXPERTS}/four.png`,
    },
    {
        name: "Aba Anton",
        title: "MPharm",
        image: `${EXPERTS}/five.png`,
    },
];

const NAD_EXPERTS_INTRO_US = {
    label: "Guided by leading medical experts",
    headingBlack: "Exceptional care through",
    headingAccent: "evidence-based treatments",
    bullets: [
        {
            title: "US licensed and regulated",
            description:
                "Fully licensed pharmacy and specialized experts, regulated to US standards.",
        },
        {
            title: "Efficient care powered by tech",
            description:
                "Better efficiency in treatments, patient-centered care and convenience.",
        },
        {
            title: "Healthcare, made accessible",
            description:
                "Get personalized medical support, available on demand.",
        },
    ],
};

const LongevityNadExpertsSection = ({
    label = NAD_EXPERTS_INTRO_US.label,
    headingBlack = NAD_EXPERTS_INTRO_US.headingBlack,
    headingAccent = NAD_EXPERTS_INTRO_US.headingAccent,
    bullets = NAD_EXPERTS_INTRO_US.bullets,
    experts = NAD_EXPERTS_US,
    bg = "bg-[#FAFAFA]",
}) => {
    const carousel = useNadCarousel();

    const bulletList = (
        <ul className="flex flex-col gap-6">
            {bullets.map((bullet) => (
                <li key={bullet.title} className="flex items-start gap-3">
                    <CheckIcon />
                    <div className="flex flex-col gap-1">
                        <p className="helvetica-text-font text-[16px] font-medium leading-[1.4] text-black">
                            {bullet.title}
                        </p>
                        <p className="helvetica-text-font text-[16px] leading-[1.5] text-black/65">
                            {bullet.description}
                        </p>
                    </div>
                </li>
            ))}
        </ul>
    );

    return (
        <section className={`w-full ${bg} py-14 md:py-[72px]`}>
            <div className="mx-auto max-w-[1200px]">
                <div className="flex flex-col gap-4 px-5">
                    <p className="dm-mono-font text-[12px] uppercase leading-none tracking-[0.04em] text-black">
                        {label}
                    </p>
                    <h2 className="helvetica-display-font text-[32px] font-medium leading-[1.18] tracking-[-0.64px] text-black md:text-[44px] md:tracking-[-0.88px]">
                        {headingBlack}
                        <br />
                        <span className="text-[#AE7E56]">{headingAccent}</span>
                    </h2>
                </div>

                <div className="mt-8 flex flex-col gap-8 md:mt-12 md:flex-row md:items-start md:gap-10">
                    <div className="hidden shrink-0 px-5 md:block md:w-[316px] md:pl-5 md:pr-0">
                        {bulletList}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div
                            ref={carousel.scrollRef}
                            onScroll={carousel.onScroll}
                            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 md:pl-0 md:pr-5"
                        >
                            {experts.map((expert) => (
                                <ExpertCard key={expert.name} expert={expert} />
                            ))}
                        </div>
                    </div>
                </div>

                <NadCarouselControls {...carousel} className="mt-8 px-5 md:mt-10" />

                <div className="mt-10 px-5 md:hidden">{bulletList}</div>
            </div>
        </section>
    );
};

export default LongevityNadExpertsSection;
