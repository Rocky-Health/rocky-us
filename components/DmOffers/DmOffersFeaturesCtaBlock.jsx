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

export default function DmOffersFeaturesCtaBlock({
    cards = DEFAULT_FEATURE_CARDS,
    featuresBg = "!max-w-7xl mb-16",
    getStartedHref = "/glp2-pre-consultation",
    pricingHref = "/glp1-offer-hero",
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
                <h2 className="text-center subheaders-font sm:text-5xl text-4xl font-normal text-gray-800/80 my-10">
                    {title}
                </h2>
            )}

            <div className="flex flex-col items-center gap-6 ">
                <div className="flex  gap-3 flex-row flex-wrap items-center sm:px-4 px-2 justify-center">
                    <Link
                        href={getStartedHref}
                        className="inline-flex py-3 sm:min-w-[180px] min-w-[140px] items-center justify-center rounded-full bg-black sm:px-8 px-4 font-poppins text-[15px] font-medium text-white transition-colors hover:bg-neutral-800"
                    >
                        {getStartedText}
                    </Link>
                    <Link
                        href={pricingHref}
                        className="inline-flex py-3 sm:min-w-[180px] min-w-[140px] items-center justify-center rounded-full border border-neutral-300 bg-white sm:px-8 px-4 font-poppins text-[15px] font-medium transition-all duration-300 hover:bg-neutral-50"
                    >
                        See pricing
                    </Link>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2  font-poppins text-xs opacity-90 px-4 sm:justify-start justify-center">
                    {trustItems.map(({ Icon, text }) => (
                        <span
                            key={text}
                            className="inline-flex items-center gap-1.5"
                        >
                            <Icon className="size-4" />
                            {text}
                        </span>
                    ))}
                </div>

                <div className="w-full px-4">
                    <Image
                        src={trustpilotSrc}
                        alt={trustpilotAlt}
                        width={270}
                        height={60}
                        className="mx-auto block h-auto w-full max-w-[300px] pt-4"
                    />
                </div>
            </div>
        </>
    );
}
