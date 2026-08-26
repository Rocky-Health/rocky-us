import Link from "next/link";
import CustomImage from "@/components/utils/CustomImage";
import { PRODUCT_DATA } from "./data/longevityNadPlusData";
import { FaArrowRightLong } from "react-icons/fa6";

export const LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS = PRODUCT_DATA;

const DEFAULT_BTN_CLASS =
    "inline-flex items-center justify-center gap-2 py-3 px-8 rounded-full bg-black text-white text-sm md:text-base font-medium hover:bg-gray-800 transition-all duration-300 md:w-fit w-full";

const CheckIcon = () => (
    <svg
        className="w-5 h-5 flex-shrink-0 text-[#AE7E56]"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden
    >
        <path
            d="M4 10.5L8 14.5L16 6.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);

function CheckPointsBlock({ heading, items }) {
    if (!items?.length) return null;

    return (
        <div className="flex flex-col gap-4">
            {heading ? (
                <p className="helvetica-display-font text-[20px] md:text-[24px] font-medium leading-[1.2] tracking-[-0.2px] md:tracking-[-0.24px] text-black pt-4 pb-2">
                    {heading}
                </p>
            ) : null}
            <ul className="flex flex-col gap-4">
                {items.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                        <CheckIcon />
                        <span className="helvetica-text-font font-medium text-[16px] leading-[1.4] tracking-[-0.32px] text-black">
                            {feature}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

const LongevityNadPlusProductSection = ({
    bg = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.bg,
    imageBg = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.imageBg,
    image = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.image,
    imageAlt = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.imageAlt,
    banner = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.banner,
    bannerClassName = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.bannerClassName,
    name = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.name,
    pricePrefix = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.pricePrefix,
    price = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.price,
    priceAfter = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.priceAfter,
    description = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.description,
    ctaText = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.ctaText,
    ctaHref = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.ctaHref,
    btnClassName = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.btnClassName,
    checkPointsHeading = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.checkPointsHeading,
    checkPoints = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.checkPoints,
    checkPointsPosition = LONGEVITY_NAD_PLUS_PRODUCT_DEFAULTS.checkPointsPosition,
    onCtaClick,
    isCtaLoading = false,
}) => {
    const checksBeforeBtn = checkPointsPosition === "before";

    const checkPointsBlock = (
        <CheckPointsBlock heading={checkPointsHeading} items={checkPoints} />
    );

    const ctaClassName = `${DEFAULT_BTN_CLASS}${btnClassName ? ` ${btnClassName}` : ""}`;

    const ctaButton = onCtaClick ? (
        <button
            type="button"
            onClick={onCtaClick}
            disabled={isCtaLoading}
            className={`dm-mono-font ${ctaClassName} disabled:opacity-70 disabled:cursor-not-allowed uppercase`}
        >
            {ctaText} <FaArrowRightLong />
        </button>
    ) : (
        <Link href={ctaHref} className={ctaClassName}>
            {ctaText} <FaArrowRightLong />
        </Link>
    );

    return (
        <section className={`${bg} w-full`}>
            <div className="max-w-[1200px] mx-auto px-5 py-14 md:py-24">
                <div className="grid md:grid-cols-2 overflow-hidden">
                    <div
                        className="relative min-h-[320px] md:min-h-[500px] rounded-xl overflow-hidden"
                        style={{ backgroundColor: imageBg }}
                    >
                        <CustomImage
                            src={image}
                            alt={imageAlt}
                            fill
                            className="object-cover object-center"
                            sizes="(max-width: 768px) 100vw, 560px"
                        />

                        {banner ? (
                            <div className="absolute top-5 md:top-7 left-1/2 -translate-x-1/2 z-10 max-w-[calc(100%-2rem)]">
                                <p
                                    className={`helvetica-text-font whitespace-nowrap text-[12px] md:text-[14px] leading-[1.43] text-black bg-white/40 backdrop-blur-md rounded-full text-center px-6 py-2.5 ${bannerClassName ? ` ${bannerClassName}` : ""}`}
                                >
                                    {banner}
                                </p>
                            </div>
                        ) : null}
                    </div>

                    <div className="flex flex-col justify-center gap-6 md:gap-8  md:py-0 py-10 md:ps-20 ">
                        <div className="flex flex-col gap-1">
                            <h2 className="helvetica-display-font text-[24px] md:text-[32px] font-medium leading-[1.15] tracking-[-0.24px] md:tracking-[-0.32px] text-black">
                                {name}
                            </h2>
                            <p className="helvetica-display-font text-[24px] md:text-[30px] font-medium leading-[1.2] tracking-[-0.24px] md:tracking-[-0.3px] text-black flex items-center gap-1">
                                {price}
                                {priceAfter ? (
                                    <span className="helvetica-text-font text-[14px] leading-[1.4] tracking-[-0.28px] self-end text-[#000000A6]">
                                        {priceAfter}
                                    </span>
                                ) : (
                                    ""
                                )}
                            </p>
                        </div>

                        <p className="helvetica-text-font text-[16px] leading-[1.4] tracking-[-0.32px] text-[#000000A6]">
                            {description}
                        </p>

                        {checksBeforeBtn ? checkPointsBlock : null}
                        {ctaButton}
                        {!checksBeforeBtn ? checkPointsBlock : null}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LongevityNadPlusProductSection;
