import CustomImage from "@/components/utils/CustomImage";
import Link from "next/link";
import { TiStar } from "react-icons/ti";
import { TiStarHalf } from "react-icons/ti";
import { MdDoNotDisturbAlt } from "react-icons/md";
import { FaRegCircleCheck } from "react-icons/fa6";

/** Line-art icons (30×24 viewBox), fill #1A1A1A — match marketing source */
function FeatureIconOnlineVisit(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            width={30}
            height={30}
            viewBox="0 0 24 24"
            aria-hidden
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.82322 3.82322C4.87011 3.77634 4.9337 3.75 5 3.75H18C18.0663 3.75 18.1299 3.77634 18.1768 3.82322C18.2237 3.87011 18.25 3.93369 18.25 4V13.5H19.75V4C19.75 3.53587 19.5656 3.09075 19.2374 2.76256C18.9092 2.43437 18.4641 2.25 18 2.25H5C4.53587 2.25 4.09075 2.43437 3.76256 2.76256C3.43437 3.09075 3.25 3.53587 3.25 4V20C3.25 20.4641 3.43437 20.9092 3.76256 21.2374C4.09075 21.5656 4.53587 21.75 5 21.75H9.97966V20.25H5C4.93369 20.25 4.87011 20.2237 4.82322 20.1768C4.77634 20.1299 4.75 20.0663 4.75 20V4C4.75 3.9337 4.77634 3.87011 4.82322 3.82322ZM10.25 9C10.25 8.30964 10.8096 7.75 11.5 7.75C12.1904 7.75 12.75 8.30964 12.75 9C12.75 9.69036 12.1904 10.25 11.5 10.25C10.8096 10.25 10.25 9.69036 10.25 9ZM11.5 6.25C9.98122 6.25 8.75 7.48122 8.75 9C8.75 10.5188 9.98122 11.75 11.5 11.75C13.0188 11.75 14.25 10.5188 14.25 9C14.25 7.48122 13.0188 6.25 11.5 6.25ZM13.9076 13.3146C14.3206 13.4489 14.6987 13.6733 15.0146 13.9714C15.3329 14.2719 15.58 14.6398 15.7378 15.0481L15.7421 15.059L15.742 15.0591L16.3617 16.7406L14.9543 17.2594L14.3368 15.5838C14.2595 15.3861 14.1394 15.208 13.985 15.0622C13.8293 14.9153 13.6427 14.805 13.4389 14.7395L13.4299 14.7366L13.4209 14.7334C12.1772 14.2984 10.8227 14.2984 9.57905 14.7334L9.57006 14.7366L9.561 14.7395C9.3572 14.805 9.17063 14.9153 9.01496 15.0622C8.86056 15.208 8.74043 15.3861 8.66319 15.5839L8.04573 17.2593L6.63826 16.7407L7.25796 15.0591L7.26203 15.048L7.26212 15.0481C7.41991 14.6398 7.667 14.2719 7.98532 13.9714C8.30122 13.6733 8.67933 13.4489 9.09236 13.3146C10.6515 12.7714 12.3485 12.7714 13.9076 13.3146ZM15.8131 22.3431L22.2661 15.5152L21.1759 14.4848L15.2627 20.7417L13.1321 18.5306L12.0519 19.5714L14.7279 22.3484L15.2733 22.9143L15.8131 22.3431Z"
                fill="#1A1A1A"
            />
        </svg>
    );
}

function FeatureIconPrescription(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            width={30}
            height={30}
            viewBox="0 0 24 24"
            aria-hidden
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.02299 2.25H8.57692H15.4231H15.977L16.1399 2.77944L16.4385 3.75H19H19.75V4.5V9V9.75H19H18.75V12.25V13V17V17.75V20C18.75 20.9665 17.9665 21.75 17 21.75H7C6.03351 21.75 5.25 20.9665 5.25 20V9.75H5H4.25V9V4.5V3.75H5H7.56145L7.86009 2.77944L8.02299 2.25ZM17.25 16.25V13.75H12.75V16.25H17.25ZM17.25 12.25H12H11.25V13V17V17.75H12H17.25V20C17.25 20.1381 17.1381 20.25 17 20.25H7C6.86193 20.25 6.75 20.1381 6.75 20V9.75H17.25V12.25ZM9.13085 3.75L8.83221 4.72056L8.66931 5.25H8.11538H5.75V8.25H18.25V5.25H15.8846H15.3307L15.1678 4.72056L14.8692 3.75H9.13085Z"
                fill="#1A1A1A"
            />
        </svg>
    );
}

function FeatureIconShieldCheck(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            width={30}
            height={30}
            viewBox="0 0 24 24"
            aria-hidden
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.2548 2.29463L12 2.20264L11.7453 2.29463L2.74526 5.54478L2.25 5.72363V6.25019V10.9286C2.25002 15.2236 4.70206 18.0045 7.0673 19.6752C8.25 20.5106 9.42779 21.0826 10.3076 21.4457C10.7486 21.6277 11.1177 21.7584 11.379 21.8444C11.5097 21.8873 11.6137 21.9192 11.6865 21.9407C11.723 21.9514 11.7516 21.9596 11.7719 21.9653L11.796 21.972L11.8033 21.9739L11.8057 21.9746L11.8066 21.9748C11.807 21.9749 11.8073 21.975 12 21.2502L11.8073 21.975L12 22.0263L12.1927 21.975L12 21.2502C12.1927 21.975 12.193 21.9749 12.1934 21.9748L12.1943 21.9746L12.1967 21.9739L12.204 21.972L12.2281 21.9653C12.2484 21.9596 12.277 21.9514 12.3135 21.9407C12.3863 21.9192 12.4903 21.8873 12.621 21.8444C12.8823 21.7584 13.2514 21.6277 13.6924 21.4457C14.5722 21.0826 15.75 20.5106 16.9327 19.6752C19.298 18.0045 21.75 15.2236 21.75 10.9286L21.75 6.25019L21.75 5.72363L21.2547 5.54478L12.2548 2.29463ZM12.1525 20.4194C12.095 20.4383 12.044 20.4545 12 20.4683C11.956 20.4545 11.905 20.4383 11.8476 20.4194C11.6167 20.3435 11.2826 20.2253 10.8799 20.0591C10.0722 19.7258 9.00002 19.2039 7.93272 18.45C5.79797 16.9421 3.75001 14.5622 3.75 10.9286V6.77675L12 3.79745L20.25 6.77675L20.25 10.9286C20.25 14.5622 18.2021 16.9421 16.0673 18.45C15 19.2039 13.9278 19.7258 13.1201 20.0591C12.7174 20.2253 12.3833 20.3435 12.1525 20.4194ZM11.8345 8.16356C10.6165 6.94554 8.63926 6.94554 7.42124 8.16356C6.20322 9.38158 6.20322 11.3588 7.42124 12.5768L7.4212 12.5769L7.42756 12.5831L11.476 16.5366L12 17.0484L12.524 16.5366L16.5724 12.5831L16.5725 12.5831L16.5788 12.5768C17.7968 11.3588 17.7968 9.38158 16.5788 8.16356C15.3607 6.94554 13.3835 6.94554 12.1655 8.16356L12 8.32905L11.8345 8.16356ZM8.4819 9.22422C9.11414 8.59198 10.1416 8.59198 10.7738 9.22422L11.4697 9.92004L12 10.4504L12.5303 9.92004L13.2261 9.22422C13.8584 8.59198 14.8859 8.59198 15.5181 9.22422C16.1494 9.85551 16.1503 10.8808 15.521 11.5133L12 14.9517L8.47905 11.5133C7.84966 10.8808 7.85061 9.85551 8.4819 9.22422Z"
                fill="#1A1A1A"
            />
        </svg>
    );
}

function FeatureIconTruckCheck(props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            width={30}
            height={30}
            viewBox="0 0 24 24"
            aria-hidden
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.25 3.25H4H9.25H10H14H14.75H20H20.75V4V13H19.25V4.75H14.75V9V9.75H14H10H9.25V9V4.75H4.75V18.9972C4.75 19.0301 4.75649 19.0626 4.7691 19.093C4.7817 19.1234 4.80018 19.151 4.82347 19.1742C4.84676 19.1974 4.8744 19.2158 4.90481 19.2284C4.93523 19.2409 4.96781 19.2473 5.0007 19.2472L12.9979 19.2248L13.0021 20.7248L5.0049 20.7472C4.77467 20.7478 4.54658 20.703 4.3337 20.6154C4.12081 20.5277 3.92731 20.3989 3.76429 20.2364C3.60127 20.0738 3.47193 19.8807 3.38368 19.668C3.29543 19.4554 3.25 19.2274 3.25 18.9972V4V3.25ZM10.75 4.75V8.25H13.25V4.75H10.75ZM21.0223 16.0383L16.8913 20.0463L16.3417 20.5795L15.82 20.019L13.951 18.011L15.049 16.989L16.3963 18.4365L19.9777 14.9617L21.0223 16.0383Z"
                fill="#1A1A1A"
            />
        </svg>
    );
}

const StarRow = () => (
    <div className="flex items-center gap-0 mb-0.5" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
            <TiStar key={i} className="sm:size-6 size-4 text-black" />
        ))}
        <TiStarHalf className="sm:size-6 size-4 text-black" />
    </div>
);

const FEATURE_ITEMS = [
    {
        Icon: FeatureIconOnlineVisit,
        text: "100% online medical visit. Injections and oral options available.",
    },
    {
        Icon: FeatureIconPrescription,
        text: "Prescription & telemed visits included. No insurance required.",
    },
    {
        Icon: FeatureIconShieldCheck,
        text: "Same price, every dose. No hidden fees.",
    },
    {
        Icon: FeatureIconTruckCheck,
        text: "Free shipping. Arrives in 1–2 days.",
    },
];

const TRUST_ITEMS = [
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

function HeroFigure() {
    const heroImage = "/dm-offers/hero2.png";

    return (
        <div className="relative mx-auto w-full max-w-[440px] lg:max-w-none">
            <div className="relative z-10 flex justify-center pt-4">
                <div className="relative aspect-square w-[min(100%,580px)] ">
                    <CustomImage
                        src={heroImage}
                        alt="Happy customer — medical weight loss with GLP-1"
                        fill
                        className="object-top !object-contain"
                        sizes="(max-width: 1024px) 90vw, 580px"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * DM offers: split hero with gradient card, checklist, and figure + vials.
 */
export default function DmOffersHero({
    getStartedHref = "/glp2-pre-consultation",
    pricingHref = "/glp1-offer-hero",
}) {
    return (
        <section className="w-full px-4 pt-2 md:px-6 ">
            <div className="rounded-[58px] overflow-hidden w-full bg-[linear-gradient(120deg,#f6ea75_0%,#e7c48a_35%,#cb9468_68%,#b27856_100%)] bg-[length:180%_180%] md:px-7 px-4 py-10 md:py-16">
                <div className="flex sm:flex-row flex-col items-center gap-10 lg:gap-14 max-w-7xl mx-auto">
                    <div className="flex flex-col order-1 lg:w-[50%]">
                        <div className="mb-4 flex  items-center gap-1 text-[13px] text-[#3d4556] md:text-[14px]">
                            <StarRow />
                            <span className="font-poppins font-normal sm:text-sm text-xs">
                                (4.8) Excellent! Over 350,000+ happy customers
                            </span>
                        </div>

                        <div className="flex justify-between items-center">
                            <div className="lg:w-full w-[60%]">
                                <h1 className="headers-font text-3xl font-extrabold leading-[100%] md:leading-[1.12] tracking-wide text-gray-900 sm:text-5xl lg:text-6xl lg:leading-[1.1] ">
                                    Lose 1-2lbs per week!
                                    <p className="font-poppins text-base font-normal text-gray-900 lg:hidden inline ps-2 leading-[1] md:leading-[1.12]">
                                        The proven way to lose 15% of your body
                                        weight fast!
                                    </p>
                                </h1>

                                <p className="mt-8 font-poppins text-base font-normal text-gray-900 lg:block hidden">
                                    The proven way to lose 15% of your body
                                    weight fast!
                                </p>
                            </div>
                            <div className=" lg:hidden block lg:w-auto w-[40%]">
                                <HeroFigure />
                            </div>
                        </div>

                        <p className="mt-4 font-poppins  leading-relaxed text-sm text-gray-800 md:pe-16">
                            Starting at{" "}
                            <strong className="font-bold text-2xl sm:text-3xl">
                                $147
                            </strong>{" "}
                            — Doctor-prescribed GLP-1 treatment{" "}
                            <strong className="">
                                delivered to your door in 1-2 days.
                            </strong>{" "}
                            No insurance. No hidden fees. No clinic visits.
                        </p>

                        <ul className="mt-6 flex flex-col gap-2">
                            {FEATURE_ITEMS.map(({ Icon, text }) => (
                                <li
                                    key={text}
                                    className="flex items-center text-gray-800 text-sm sm:text-base font-medium gap-2"
                                >
                                    <span className="">
                                        <Icon className="shrink-0" />
                                    </span>
                                    <p className="">{text}</p>
                                </li>
                            ))}
                        </ul>

                        <div className="mt-8 flex gap-3 flex-row flex-wrap items-center sm:px-4 sm:justify-start justify-center">
                            <Link
                                href={getStartedHref}
                                className="inline-flex py-3 sm:min-w-[180px] items-center justify-center rounded-full bg-black sm:px-8 px-4 font-poppins text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800"
                            >
                                Get started
                            </Link>
                            <Link
                                href={pricingHref}
                                className="inline-flex py-3 sm:min-w-[180px] items-center justify-center rounded-full border border-neutral-300 bg-white sm:px-8 px-4 font-poppins text-[15px] font-semibold transition-all duration-300 hover:bg-neutral-50"
                            >
                                See pricing
                            </Link>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 pt-2 font-poppins text-xs opacity-90 px-4 sm:justify-start justify-center">
                            {TRUST_ITEMS.map(({ Icon, text }) => (
                                <span
                                    key={text}
                                    className="inline-flex items-center gap-1.5"
                                >
                                    <Icon className="size-4" />
                                    {text}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="hidden lg:block order-2 md:w-[50%]">
                        <HeroFigure />
                    </div>
                </div>
            </div>
        </section>
    );
}
