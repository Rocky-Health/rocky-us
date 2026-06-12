"use client";
import CustomImage from "../utils/CustomImage";
import CustomContainImage from "../utils/CustomContainImage";
import { usePathname } from "next/navigation";
import { partners } from "./partnersData";

const HeaderProudPartner = () => {
    const pathname = usePathname();
    const isGlpHeroPage =
        pathname === "/glp1-offer-hero" || pathname === "/glp2-offer-hero";
    const visiblePartners = isGlpHeroPage
        ? partners.filter((partner) => partner.name !== "Toronto Maple Leafs")
        : partners;

    return (
        <div className="bg-[#003876] text-white py-2">
            {/* Desktop view - static display */}
            <div className="hidden md:flex items-center justify-center">
                <span className="font-[500] text-[18px]">Proud partner</span>
                <div className="px-3">
                    <div className="w-0 h-8 origin-top-left outline outline-1 outline-offset-[-0.50px] outline-white/50"></div>
                </div>

                {visiblePartners.map((partner, index) => (
                    <div key={index} className="flex items-center">
                        <div className="flex items-center gap-1">
                            <div
                                className={`relative overflow-hidden ${partner.desktopSize}`}
                            >
                                {partner.useContain ? (
                                    <CustomContainImage
                                        src={partner.logo}
                                        alt={partner.name}
                                        fill
                                        sizes="64px"
                                    />
                                ) : (
                                    <CustomImage
                                        src={partner.logo}
                                        alt={partner.name}
                                        fill
                                        sizes="64px"
                                    />
                                )}
                            </div>
                            <span className="font-[500] text-[18px]">
                                {partner.name}
                            </span>
                        </div>
                        {index < visiblePartners.length - 1 && (
                            <div className="px-4">
                                <div className="w-0 h-8 origin-top-left outline outline-1 outline-offset-[-0.50px] outline-white/50"></div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Mobile view - scrolling display */}
            <div className="md:hidden flex items-center justify-center pl-[10px] md:pl-0">
                {/* Fixed "Proud partner" text */}
                <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="font-[500] text-[12px]">
                        Proud partner
                    </span>
                    {/* <div className="w-0 h-8 origin-top-left outline outline-1 outline-offset-[-0.50px] outline-white/50"></div> */}
                </div>

                {/* Scrolling container */}
                <div
                    className={`relative overflow-hidden ${isGlpHeroPage ? "" : "flex-1"}`}
                >
                    {/* Gradient overlays - fade in when scroll starts */}
                    {isGlpHeroPage ? null : (
                        <>
                            <div className="bg-[linear-gradient(270deg,#00387600_0%,#003876_100%)] absolute left-0 w-[80px] h-full z-[1] animate-gradient-delayed"></div>
                            <div className="bg-[linear-gradient(270deg,#00387600_0%,#003876_100%)] absolute right-0 w-[80px] h-full z-[1] rotate-180 animate-gradient-delayed"></div>
                        </>
                    )}

                    {/* Partners container */}
                    <div
                        className={`flex items-center whitespace-nowrap w-fit overflow-hidden ${isGlpHeroPage ? "" : "animate-partner-scroll"}`}
                    >
                        {visiblePartners
                            .concat(isGlpHeroPage ? [] : visiblePartners)
                            .concat(isGlpHeroPage ? [] : visiblePartners)
                            .map((partner, index, array) => (
                                <div
                                    key={index}
                                    className="flex items-center flex-shrink-0"
                                >
                                    <div
                                        className={`flex items-center  ${isGlpHeroPage ? "px-1.5 sm:gap-2 gap-1" : "px-3 gap-2"}`}
                                    >
                                        <div
                                            className={`relative overflow-hidden ${partner.mobileSize}`}
                                        >
                                            {partner.useContain ? (
                                                <CustomContainImage
                                                    src={partner.logo}
                                                    alt={partner.name}
                                                    fill
                                                    sizes="56px"
                                                />
                                            ) : (
                                                <CustomImage
                                                    src={partner.logo}
                                                    alt={partner.name}
                                                    fill
                                                    sizes="56px"
                                                />
                                            )}
                                        </div>
                                        <span className="font-[500] text-[12px]">
                                            {partner.name}
                                        </span>
                                    </div>
                                    <div
                                        className={`w-0 h-8 origin-top-left outline outline-1 outline-offset-[-0.50px] outline-white/50 ${isGlpHeroPage ? "mx-0.5" : "mx-3"} ${isGlpHeroPage && index === array.length - 1 ? "hidden" : ""}`}
                                    ></div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeaderProudPartner;
