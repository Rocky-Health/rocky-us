import { FaArrowRight, FaStar } from "react-icons/fa";
import CustomImage from "../utils/CustomImage";
import Link from "next/link";
import Trustpilot from "../Sex/Trustpilot";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

const MarketingHeroSection = () => {
    var list = [
        {
            icon: "/bo4/1.svg",
            text: "<b> Lose 71%  </b> more weight vs medication alone.",
        },
        {
            icon: "/bo4/2.svg",
            text: "<b> Unlimited support </b>, 100% online.",
        },
        {
            icon: "/bo4/3.svg",
            text: "6-month <b> money-back guarantee </b>.",
        },

        {
            icon: "/bo4/4.svg",
            text: "<b> Lowest price</b>  guarantee .",
        },
    ];
    return (
        <>
            <div className="flex justify-between items-center flex-col md:flex-row gap-4">
                {/* Right side  */}
                <div>
                    <div className="flex justify-start items-center gap-1 mb-[8px]">
                        {[...Array(5)].map((_, i) => (
                            <FaStar key={i} className=" text-[#AE7E56]" />
                        ))}
                        <span className="md:text-[16px] text-[12px] leading-[140%]  font-medium">
                            TRUSTED BY 350K+ MEMBERS
                        </span>
                    </div>

                    <h1 className="headers-font md:text-[48px] text-[36px] leading-[120%] tracking-tight max-w-[560px]">
                        America’s #1 GLP-1
                        <span className="block headers-font text-[#AE7E56]">
                            Weight Loss Program
                        </span>
                    </h1>
                    <span className="block headers-font w-fit px-2 mt-2 bg-[#F5F4EF] text-[28px] md:text-[40px] leading-[140%] mb-[22px] md:mb-[0px]">
                        Now as low as $150 /mo
                    </span>

                    {/* List */}
                    <div className="hidden md:flex justify-start items-start flex-col mt-[32px] md:mb-[42px] mb-[22px]">
                        {list.map((item, index) => (
                            <div
                                key={index}
                                className="flex justify-start items-center gap-3 mt-4"
                            >
                                <CustomImage
                                    width={24}
                                    height={24}
                                    src={item.icon}
                                    alt=""
                                    className="w-6 h-6"
                                />
                                <span
                                    className="text-[14px] leading-[140%] "
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHtml(item.text),
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/glp2-pre-consultation"
                        className="md:flex hidden md:text-[16px] min-w-[320px] h-[48px] justify-center items-center leading-[140%]  font-medium bg-black px-[24px] rounded-full text-white py-[6px]"
                    >
                        Get Started <FaArrowRight className="inline ml-1" />
                    </Link>
                </div>

                {/* Left side  */}

                <div>
                    <CustomImage
                        width={560}
                        height={500}
                        src="/bo4/bo4HeroSec.webp"
                        alt=""
                        className="w-[300px] h-[300px] md:w-[560px] md:h-[500px] hidden md:block"
                    />
                    <CustomImage
                        width={335}
                        height={303}
                        src="/bo4/bo4HeroSecMobile.webp"
                        alt=""
                        className="w-[335px] h-[303px] block md:hidden mx-auto"
                    />

                    <div className="flex justify-center flex-col items-center md:hidden gap-[16px] mb-[20px]">
                        <Trustpilot />
                        <p className="text-center text-[14px] tracking-tight">
                            <b>Excellent </b>| <b>1,368+</b> reviews | 
                            <b>95.7%</b> success rate
                        </p>
                    </div>

                    {/* List */}
                    <div className="md:hidden flex justify-start items-start flex-col  md:mb-[42px] mb-[22px]">
                        {list.map((item, index) => (
                            <div
                                key={index}
                                className="flex justify-start items-center gap-3 mt-4"
                            >
                                <CustomImage
                                    width={21}
                                    height={21}
                                    src={item.icon}
                                    alt=""
                                    className="w-5 h-5"
                                />
                                <span
                                    className="text-[14px] leading-[140%] "
                                    dangerouslySetInnerHTML={{
                                        __html: sanitizeHtml(item.text),
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/glp2-pre-consultation"
                        className="flex md:hidden md:text-[16px] min-w-[320px] h-[48px] justify-center items-center leading-[140%]  font-medium bg-black px-[24px] rounded-full text-white py-[6px]"
                    >
                        Get Started <FaArrowRight className="inline ml-1" />
                    </Link>
                </div>
            </div>

            <div className="md:h-[152px] hidden mt-10 md:flex justify-between items-center">
                <div className="flex justify-center items-center gap-[10px]">
                    <CustomImage
                        src={`/bo4/Arrw.png`}
                        width={48}
                        height={48}
                        alt=""
                        className=""
                    />
                    <div>
                        <span className="text-[18px] leading-[140%] font-medium tracking-tight">
                            95.7% Program Success Rate
                        </span>
                        <div className="flex justify-start items-center gap-2">
                            <CustomImage
                                src={"/bo4/ppl.webp"}
                                width={44}
                                height={24}
                                alt=""
                                className=""
                            />
                            350,000+ Members
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-[10px]">
                    <CustomImage
                        src={`/bo4/google.png`}
                        width={48}
                        height={48}
                        alt=""
                        className=""
                    />
                    <div>
                        <span className="text-[18px] leading-[140%] font-medium tracking-tight">
                            Google
                        </span>
                        <div className="flex justify-start items-center gap-2">
                            <b>4.7 Rating | </b> 164 Reviews
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-[10px]">
                    <CustomImage
                        src={`/bo4/trustPilot.png`}
                        width={48}
                        height={48}
                        alt=""
                        className=""
                    />
                    <div>
                        <span className="text-[18px] leading-[140%] font-medium tracking-tight">
                            Trustpilot
                        </span>
                        <div className="flex justify-start items-center gap-2">
                            <b>Excellent | </b> 1,368 Reviews{" "}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center items-center gap-[10px]">
                    <CustomImage
                        src={`/bo4/rank.png`}
                        width={48}
                        height={48}
                        alt=""
                        className=""
                    />
                    <div>
                        <span className="text-[18px] leading-[140%] font-medium tracking-tight">
                            Ranked #1 GLP Provider
                        </span>
                        <div className="flex justify-start items-center gap-2">
                            <CustomImage
                                src={`/bo4/logos.webp`}
                                width={194}
                                height={24}
                                alt=""
                                className=""
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MarketingHeroSection;
