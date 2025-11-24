import Link from "next/link";
import ListWithNumbers from "../ListWithNumbers";
import { FaLongArrowAltRight } from "react-icons/fa";
import CustomImage from "../utils/CustomImage";

const items = [
    "Initial Consultation $60",
    "Medication pricing ranges from $15 to $40 per month",
    "Follow-up consultations are $40 (patients require 1 to 2 annual follow-ups)",
];

const imobileItems1 = [
    "Access to Customer Licensed Clinicians",
    "Virtual appointment to determine treatment plan",
    "Review of Lab Work and initial prescription if eligible",
];
const imobileItems2 = [
    "FDA-Approved Medications",
    "Fast & Free Delivery",
    "Interactive counselling by Licensed Pharmacist",
];
const TransparentPricing = () => {
    return (
        <>
            <div className="max-w-[1184px] mx-auto px-5 sectionWidth:px-0 py-14 md:py-24 hidden md:block">
                <div className="flex justify-between">
                    <div>
                        <h1 className="text-3xl md:text-[48px] md:leading-[48px] font-[550] mb-4 headers-font">
                            Transparent Pricing
                        </h1>
                        <p className="max-w-sm">
                            Transparency is key. Our goal is to provide easy to
                            understand pricing.
                        </p>
                    </div>
                    <ListWithNumbers
                        items={items}
                        bgNumberGradient="bg-[linear-gradient(90deg,#D3876A_0%,#A55255_100%)]"
                    />
                </div>
                <div className="mt-[40px] sm:mt-[96px] sm:h-[80px] p-4 sm:px-[24px] sm:py-[18px] bg-[#F5F4EF] flex flex-col sm:flex-row gap-5 sm:gap-0 justify-between items-center rounded-[16px] mx-auto border-[0.5px] border-solid border-[#E2E2E1]">
                    <h1 className="text-[20px] md:text-[24px] leading-[23px] md:leading-[24px] font-[500] md:font-[450] max-w-[280px] md:max-w-full text-center md:headers-font">
                        Your path to better health begins here.
                    </h1>
                    <Link
                        href="/assistance-center/"
                        className="inline-flex items-center justify-center w-full sm:w-[172px] py-3 h-[44px] border border-solid border-[#000000] text-[14px] leading-[19.6px] font-[500] rounded-[64px] text-[#FFFFFF] bg-black hover:bg-gray-800 duration-100"
                    >
                        <span>Get Started</span>
                        <FaLongArrowAltRight className="ml-2" />
                    </Link>
                </div>
            </div>
            <div className=" px-5 pt-14 pb-20 md:hidden ">
                <div className="mb-[32px]">
                    <h1 className="text-[32px] leading-[115%] mb-4 headers-font">
                        Healthcare Options
                    </h1>
                    <p className=" text-[16px] leading-[140%] max-w-[298px]">
                        Affordable Healthcare, Accessible to All.
                    </p>
                </div>
                <div className="flex flex-col gap-[24px] pb-[56px]">
                    <div className="relative overflow-hidden rounded-[16px] w-full h-[335px] ">
                        <CustomImage
                            src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Mental%20Health%20Page/hc-1.webp"
                            fill
                        />
                    </div>
                    <div>
                        <h2 className="text-[32px] leading-[115%] tracking-[-0.01em] mb-[24px] headers-font">
                            Initial Medical Consultation for $99
                        </h2>
                        <ListWithNumbers
                            items={imobileItems1}
                            bgNumberGradient="bg-[linear-gradient(90deg,#D3876A_0%,#A55255_100%)]"
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-[24px] pt-[56px] pb-[16px]">
                    <div className="relative overflow-hidden rounded-[16px] w-full h-[335px] ">
                        <CustomImage
                            src="https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Mental%20Health%20Page/hc-2.webp"
                            fill
                        />
                    </div>
                    <div>
                        <h2 className="text-[32px] leading-[115%] tracking-[-0.01em] mb-[24px] headers-font">
                            Medications starting at $240 per month
                        </h2>
                        <ListWithNumbers
                            items={imobileItems2}
                            bgNumberGradient="bg-[linear-gradient(90deg,#D3876A_0%,#A55255_100%)]"
                        />
                    </div>
                </div>

                <div className="p-4 bg-[#F5F4EF] flex flex-col gap-5 justify-between items-center rounded-[16px] mx-auto border-[0.5px] border-solid border-[#E2E2E1]">
                    <h1 className="text-[20px] leading-[23px] font-[500] max-w-[280px] text-center">
                        Your path to better health begins here.
                    </h1>
                    <Link
                        href="/assistance-center/"
                        className="inline-flex items-center justify-center w-full py-3 h-[44px] border border-solid border-[#000000] text-[14px] leading-[19.6px] font-[500] rounded-[64px] text-[#FFFFFF] bg-black hover:bg-gray-800 duration-100"
                    >
                        <span>Get Started</span>
                        <FaLongArrowAltRight className="ml-2" />
                    </Link>
                </div>
            </div>
        </>
    );
};

export default TransparentPricing;
