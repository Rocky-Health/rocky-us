import Image from "next/image";
import Link from "next/link";
import { FaRegCircleCheck } from "react-icons/fa6";
import { MdDoNotDisturbAlt } from "react-icons/md";
import FeaturesNotAnimated from "./FeaturesNotAnimated";

const DEFAULT_FEATURE_CARDS = [
    {
        title: "US-Certified Pharmacy",
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/hospital%201.png",
    },
    {
        title: "Personalized Treatments",
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/personalized.png",
    },
    {
        title: "Trusted by 350K+ Users",
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/trusted.png",
    },
    {
        title: "1:1 Medical Support",
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/medical.png",
    },
];

const DEFAULT_TRUST_ITEMS = [
    {
        Icon: MdDoNotDisturbAlt,
        text: "No Hidden Fees",
    },
    {
        Icon: MdDoNotDisturbAlt,
        text: "No Monthly Membership",
    },
    {
        Icon: FaRegCircleCheck,
        text: "Cancel Anytime",
    },
];

export default function NadPlusFeaturesCtaBlock({
    cards = DEFAULT_FEATURE_CARDS,
    featuresBg = "!max-w-7xl mb-16",
    getStartedHref = "/glp1-pre-consultation-3",
    pricingHref = "/glp1-pre-consultation-3",
    trustItems = DEFAULT_TRUST_ITEMS,
    trustpilotSrc = "/dm-offers/trustpilot.png",
    trustpilotAlt = "Trustpilot rating",
    hideFeatures = false,
    getStartedText = "Get started",
    title = "",
}) {
    return (
        <>
            {hideFeatures ? null : (
                <FeaturesNotAnimated cards={cards} bg={featuresBg} />
            )}
            {title && (
                <h2 className="my-10 text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                    {title}
                </h2>
            )}

            <div
                className={`flex flex-col items-center gap-8 md:gap-10 ${hideFeatures ? "" : "mt-8 md:mt-10"}`}
            >
                <div className="flex flex-row flex-wrap items-center justify-center gap-3 px-2 sm:px-4">
                    <Link
                        href={getStartedHref}
                        className="inline-flex min-w-[140px] items-center justify-center rounded-full bg-black px-4 py-3 font-poppins text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 sm:min-w-[180px] sm:px-8"
                    >
                        {getStartedText}
                    </Link>
                    <Link
                        href={pricingHref}
                        className="inline-flex min-w-[140px] items-center justify-center rounded-full border border-[#E2E2E1] bg-white px-4 py-3 font-poppins text-[15px] font-semibold text-gray-900 shadow-sm transition-all duration-300 hover:bg-[#F0E8DF] sm:min-w-[180px] sm:px-8"
                    >
                        See pricing
                    </Link>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 font-poppins text-xs text-gray-600 sm:justify-start">
                    {trustItems.map(({ Icon, text }) => (
                        <span
                            key={text}
                            className="inline-flex items-center gap-1.5"
                        >
                            <Icon className="size-4 text-[#AE7E56]" />
                            {text}
                        </span>
                    ))}
                </div>

                <div className="w-full px-4 pt-2 md:pt-4">
                    <Image
                        src={trustpilotSrc}
                        alt={trustpilotAlt}
                        width={270}
                        height={60}
                        className="mx-auto block h-auto w-full max-w-[300px]"
                    />
                </div>
            </div>
        </>
    );
}
