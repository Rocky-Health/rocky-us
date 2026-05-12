import React from "react";
import Link from "next/link";
import {
    WL_MEDVI_HERO_MOBILE_ORDER,
    wlMedViHeroImageMap,
} from "@/components/MedViLanding/wlMedViHeroImages";
import CustomImage from "../utils/CustomImage";

/** Next calendar month's full English name from `date` (e.g. May → June, Dec → January). */
function getNextCalendarMonthName(date = new Date()) {
    const nextMonthStart = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    return nextMonthStart.toLocaleString("en-US", { month: "long" });
}

const CHECK_ITEMS = [
    { key: "w1", node: "Lose pounds of fat every week" },
    {
        key: "w2",
        node: (
            <>
                <strong className="font-semibold text-[#1a1a1a]">
                    MyRocky
                </strong>{" "}
                Guarantee
            </>
        ),
    },
    {
        key: "w3",
        node: (
            <>
                <strong className="font-semibold text-[#1a1a1a]">
                    No membership or hidden fees!
                </strong>{" "}
                Everything you need is included
            </>
        ),
    },
    {
        key: "w4",
        node: (
            <>
                <strong className="font-semibold text-[#1a1a1a]">
                    Start for just $149
                </strong>
                , no insurance required + free shipping
            </>
        ),
    },
    { key: "w5", node: "HSA/FSA Approved!" },
];

/** Rocky WL palette (matches GLP1 / body optimization landers) */
const BTN_PRIMARY = "bg-black hover:bg-[#2d2d2d] text-white shadow-sm";
const ACCENT_TEXT = "text-[#AE7E56]";
const CHECK_BG = "bg-[#AE7E56]";

const VARIANT_CLASSES = {
    tall: "aspect-[10/16] sm:min-h-[160px] h-full sm:max-h-full max-h-[200px] w-full",
    wide: "aspect-[16/11] w-full",
    square: "aspect-square w-full sm:max-h-full max-h-[200px] min-h-0",
    tallMid:
        "aspect-[4/5] sm:min-h-[140px] h-full sm:max-h-full max-h-[150px] w-full",
    veryTall:
        "aspect-[10/18] sm:min-h-[180px] h-full sm:max-h-full max-h-[200px] w-full",
    small: "aspect-square w-full max-w-[min(100%,300px)]  min-h-[100px]",
};

/** Intrinsic size per variant — matches aspect ratios in VARIANT_CLASSES for next/image */
const VARIANT_INTRINSIC_SIZE = {
    tall: { width: 500, height: 800 }, // 10:16
    wide: { width: 800, height: 550 }, // 16:11
    square: { width: 800, height: 800 },
    tallMid: { width: 640, height: 800 }, // 4:5
    veryTall: { width: 500, height: 900 }, // 10:18
    small: { width: 600, height: 600 },
};

const CheckIcon = () => (
    <span
        className={`shrink-0 mt-0.5 w-5 h-5 rounded-full ${CHECK_BG} flex items-center justify-center`}
        aria-hidden
    >
        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path
                d="M1 4l2.5 2.5L9 1"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    </span>
);

function HeroImageCard({
    src,
    alt,
    variant,
    className = "",
    width,
    height,
    containerClassName = "",
}) {
    const shape = VARIANT_CLASSES[variant] || VARIANT_CLASSES.tall;
    const intrinsic =
        VARIANT_INTRINSIC_SIZE[variant] || VARIANT_INTRINSIC_SIZE.tall;
    const imgWidth = width ?? intrinsic.width;
    const imgWidthSm = width ? width / 2 : intrinsic.width / 2;
    const imgHeight = height ?? intrinsic.height;
    const imgHeightSm = height ? height / 2 : intrinsic.height / 2;
    const base = `rounded-[24px] lg:rounded-[28px] overflow-hidden shadow-sm ${shape} ${className} `;

    if (!src) {
        return (
            <div
                className={`${base} bg-[#E2E2E1]`}
                role="img"
                aria-label={alt || "Photo placeholder"}
            />
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <div
            className={`${containerClassName} ps-0 sm:pt-2 pt-2 sm:pe-2 pe-2 lg:p-2 overflow-hidden w-full h-full`}
        >
            <div className={`${base} overflow-hidden w-full h-full`}>
                <CustomImage
                    src={src}
                    alt={alt || ""}
                    className={` object-cover w-full h-full  hover:scale-105 transition-all duration-100 `}
                    loading="lazy"
                    width={imgWidth}
                    height={imgHeight}
                />
                {/* <img
                    src={src}
                    alt={alt || ""}
                    loading="lazy"
                    className={
                        "object-cover w-full h-full hover:scale-105 transition-all  duration-500 ease-in-out"
                    }
                /> */}
                {/* <CustomImage
                    src={src}
                    alt={alt || ""}
                    className={` object-cover w-full h-full  hover:scale-105 transition-all duration-100 sm:hidden block`}
                    loading="lazy"
                    width={imgWidthSm}
                    height={imgHeightSm}
                /> */}
            </div>
        </div>
    );
}

function ChecklistAndCta({ ctaHref }) {
    return (
        <div className="flex flex-col gap-7 lg:gap-8 w-full max-w-xl mx-auto lg:max-w-none text-left sm:px-4 px-2">
            <ul className="flex flex-col gap-1 sm:gap-2 md:gap-2.5 w-fit mx-auto">
                {CHECK_ITEMS.map(({ key, node }) => (
                    <li key={key} className="flex items-center sm:gap-3 gap-2">
                        <CheckIcon />
                        <span className="text-[#38312c] text-[14px] leading-snug">
                            {node}
                        </span>
                    </li>
                ))}
            </ul>

            <div className="flex justify-center lg:justify-center w-full">
                <Link
                    href={ctaHref}
                    className={`inline-flex items-center justify-center font-medium text-[13px] md:text-[15px] tracking-wide uppercase px-10 md:px-12 py-2 md:py-3 rounded-full transition-all duration-300 hover:translate-y-[-3px]  ${BTN_PRIMARY}`}
                >
                    AM I QUALIFIED?
                </Link>
            </div>
        </div>
    );
}

const MedViHero = ({ ctaHref = "/wl-pre-consultation" }) => {
    const headlineDeadlineMonth = getNextCalendarMonthName();
    const byId = wlMedViHeroImageMap();

    const mobileSlots = WL_MEDVI_HERO_MOBILE_ORDER.map((id) => byId[id]).filter(
        Boolean,
    );

    return (
        <section className="bg-[linear-gradient(180deg, #F5F4EF 0%, rgba(255, 255, 255, 0.00) 100%)] pb-12 md:pb-16 pt-8 md:pt-12">
            <div className="max-w-7xl mx-auto ">
                <div className="text-center max-w-4xl mx-auto sm:px-4 px-2 md:px-0">
                    <p className=" text-sm md:text-base mb-4 md:mb-5">
                        Join <strong className=" font-bold">500,000+</strong>{" "}
                        MyRocky patients
                    </p>

                    <h1 className="text-2xl sm:text-3xl md:text-[2.35rem] lg:text-[3rem] font-medium  !leading-tight subheaders-font tracking-normal">
                        Finally serious about weight loss? Shed your fat{" "}
                        <span className={`${ACCENT_TEXT} font-semibold`}>
                            by {headlineDeadlineMonth}
                        </span>{" "}
                        with personalized care and GLP-1 medication
                    </h1>
                </div>

                {/* Mobile / tablet: checklist then mosaic */}
                <div className="sm:hidden px-2  mt-10">
                    <ChecklistAndCta ctaHref={ctaHref} />
                </div>
                {/*<div className="md:hidden grid grid-cols-2 gap-3 mt-8">
                    {mobileSlots.map((item) => (
                        <HeroImageCard key={item.id} {...item} />
                    ))}
                </div> */}

                {/* Desktop: 5 Columns Exact Grid Layout */}
                <div className=" grid lg:grid-cols-5 sm:grid-cols-8 grid-cols-3 mt-8 px-0  lg:px-4 xl:px-0">
                    <div className="col-start-1 lg:col-span-1 col-span-1 row-start-1 row-span-2 mt-32 sm:block hidden">
                        <HeroImageCard
                            {...byId.leftTop}
                            variant="tall"
                            className="h-full rounded-none rounded-r-[24px]  "
                            containerClassName="!ps-0"
                        />
                    </div>

                    <div className="lg:col-start-2 col-start-2 lg:col-span-3 col-span-6 row-start-1  flex-col justify-center items-center pb-8 pt-2 sm:flex hidden">
                        <ChecklistAndCta ctaHref={ctaHref} />
                    </div>

                    <div className="lg:col-start-5 sm:col-start-8 col-start-3 lg:col-span-1 col-span-1 sm:row-start-1 row-start-2 sm:row-span-2 sm:mt-32 mt-0 sm:mb-0 mb-12">
                        <HeroImageCard
                            {...byId.rightTop}
                            variant="tall"
                            className="h-full rounded-r-none rounded-l-[24px] "
                            containerClassName="!pe-0 sm:!pe-0 "
                        />
                    </div>

                    <div className="lg:col-start-2 sm:col-start-2 col-start-1 lg:col-span-1 sm:col-span-2 col-span-1 sm:row-start-2 row-start-1">
                        <HeroImageCard
                            {...byId.centerSmall}
                            variant="square"
                            className="h-full rounded-l-none sm:rounded-l-[24px] "
                        />
                    </div>

                    <div className="lg:col-start-3 sm:col-start-4 col-start-2 lg:col-span-1 sm:col-span-2 col-span-1 sm:row-start-2 sm:row-span-2 row-start-1 lg:mb-40 md:mb-36 sm:mb-20 sm:mt-0 mt-12">
                        <HeroImageCard
                            {...byId.centerTall}
                            variant="tallMid"
                            className="h-full"
                        />
                    </div>

                    <div className="lg:col-start-4 sm:col-start-6 col-start-3 lg:col-span-1 sm:col-span-2 col-span-1 sm:row-start-2 sm:row-span-2 row-start-1">
                        <HeroImageCard
                            {...byId.centerVeryTall}
                            variant="veryTall"
                            className="h-full rounded-r-none sm:rounded-r-[24px] "
                            containerClassName="!pe-0 sm:!pe-2 "
                        />
                    </div>

                    <div className="lg:col-start-1 sm:col-start-1 col-start-1 lg:col-span-2 sm:col-span-3 col-span-2 sm:row-start-3 row-start-2">
                        <HeroImageCard
                            {...byId.leftBottom}
                            variant="wide"
                            className="rounded-l-none rounded-r-[24px] "
                            containerClassName="!ps-0 "
                        />
                    </div>

                    <div className="lg:col-start-5 col-start-8 lg:col-span-2 col-span-2 row-start-3 lg:mb-24 mb-12 lg:mr-0 mr-0 w-full sm:block hidden">
                        <HeroImageCard
                            {...byId.rightBottom}
                            variant="small"
                            className="rounded-none rounded-l-[24px] "
                            containerClassName="!pe-0"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default MedViHero;
