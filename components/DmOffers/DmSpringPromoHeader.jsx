import React from "react";
import CustomImage from "../utils/CustomImage";

const defaultTheme = {
    bannerSection: "bg-[#1a2332] px-4 py-4",
    pill: "w-fiy  rounded-full border border-[#f6d9c8] px-10 py-1.5 md:px-16",
    headline: "font-poppins text-[20px] font-bold leading-tight text-[#f7e1ab]",
    discountLine:
        "mt-0 font-poppins font-normal leading-snug text-white text-[12px]",
    ctaLine: "text-center font-poppins text-[16px] text-white font-medium",
    ctaUnderline: "underline decoration-white underline-offset-2",
    blossomIcon: "shrink-0 text-[#f472b6]",
    tickerSection: "marquee-container bg-[#e8eef5] py-1.5",
    tickerItem:
        "flex items-center gap-2 font-poppins  text-[#000] text-[13px] font-medium",
    tickerCheck: "text-[#000]",
};

const BlossomIcon = ({ className }) => (
    <CustomImage
        src="/dm-offers/sun.png"
        alt="Sun Icon"
        width={30}
        height={30}
        className={className}
    />
);

const FEATURES = [
    "Personalized Treatment Plans",
    "Certified Medical Professionals",
    "Safe & Effective Medications",
    "180k+ Happy Customers",
    "Accessible & Affordable",
];

const FeatureTickerRow = ({ duplicate, theme }) => (
    <ul
        className="flex shrink-0 items-center gap-8 whitespace-nowrap px-6 py-1 md:gap-14"
        aria-hidden={duplicate ? true : undefined}
    >
        {FEATURES.map((label) => (
            <li
                key={`${duplicate ? "d" : "a"}-${label}`}
                className={theme.tickerItem}
            >
                <span className={theme.tickerCheck} aria-hidden>
                    ✓
                </span>
                {label}
            </li>
        ))}
    </ul>
);

/**
 * DM offers landing strip: spring promo pill + infinite feature ticker.
 * Pass `theme` from `app/(marketing)/dm-offers/theme.js` via the page.
 */
const DmSpringPromoHeader = ({ theme: themeProp }) => {
    const theme = { ...defaultTheme, ...themeProp };

    return (
        <header className="w-full">
            <div className={`w-full ${theme.bannerSection}`}>
                <div className="mx-auto flex max-w-4xl flex-col items-center gap-2.5">
                    <div className={theme.pill}>
                        <div className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-3">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <BlossomIcon className={theme.blossomIcon} />
                                <div className="text-center">
                                    <p className={theme.headline}>
                                        Spring Discounts Applied!
                                    </p>
                                    <p className={theme.discountLine}>
                                        $150 OFF Semaglutide | $200 OFF
                                        Tirzepatide
                                    </p>
                                </div>
                                <BlossomIcon className={theme.blossomIcon} />
                            </div>
                        </div>
                    </div>
                    <p className={theme.ctaLine}>
                        Start now and enjoy a{" "}
                        <span className={theme.ctaUnderline}>
                            more confident body
                        </span>{" "}
                        by summer!
                    </p>
                </div>
            </div>

            <div className={theme.tickerSection}>
                <div className="flex w-max animate-scroll-fast">
                    <FeatureTickerRow theme={theme} />
                    <FeatureTickerRow duplicate theme={theme} />
                </div>
            </div>
        </header>
    );
};

export default DmSpringPromoHeader;
