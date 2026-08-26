"use client";

import Image from "next/image";
import Reveal from "@/components/utils/Reveal";
import { PROTOCOL_DATA } from "./data/longevityNadPlusData";
import CustomImage from "@/components/utils/CustomImage";

// Mobile grid: Blue Jays | Maple Leafs / NBA
const MOBILE_PARTNER_ORDER = [0, 1, 2];

const PartnerLogoItem = ({ partner, forceBigLogo = false }) => {
    const useBigLogo = forceBigLogo || partner.bigLogo;
    const logoWidth =
        partner.mobileLogoWidth ??
        (useBigLogo ? 72 : Math.round(partner.logoWidth * 2.25));
    const logoHeight =
        partner.mobileLogoHeight ??
        (useBigLogo ? 70 : Math.round(partner.logoHeight * 2.25));

    return (
        <div className="flex flex-col items-center px-3 py-8 text-center">
            <div
                className="relative mb-8"
                style={{ width: logoWidth, height: logoHeight }}
            >
                <CustomImage
                    src={partner.mobileLogo ?? partner.logo}
                    alt={partner.name}
                    fill
                    className="object-contain w-full h-full"
                />
            </div>
            <p className="helvetica-text-font font-medium text-[14px] md:text-[15px] leading-[1.4] tracking-[-0.16px] text-black">
                {partner.name}
            </p>
            <div className="my-3 h-px w-full max-w-[148px] border-t border-dotted border-black/25" />
            <p className="helvetica-text-font text-[10px] uppercase leading-[1.4] tracking-[0.04em] text-black/80 max-w-[148px]">
                {partner.subtitle}
            </p>
        </div>
    );
};

const PartnerCard = ({
    partner,
    className = "",
    style,
    objectPosition = "center",
}) => {
    const isGif = partner.image?.endsWith(".gif");
    return (
        <div
            className={`group relative rounded-2xl overflow-hidden bg-black ${className}`.trim()}
            style={style}
        >
            <Image
                src={partner.image}
                alt={partner.name}
                fill
                unoptimized={isGif}
                className="object-cover transition-all duration-300 group-hover:scale-[1.02] group-hover:brightness-110"
                style={{ objectPosition }}
            />
            {/* Double gradient overlay matching Figma */}
            <div
                className="absolute left-0 right-0 bottom-0 h-[211px]"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, #000000 100%)",
                }}
            />
            <div
                className="absolute left-0 right-0 bottom-0 h-[138px]"
                style={{
                    background:
                        "linear-gradient(180deg, rgba(0,0,0,0) 0%, #000000 100%)",
                }}
            />
            {/* Content */}
            <div className="absolute bottom-0 left-4 right-4 pb-4 flex flex-col gap-1.5">
                <div
                    className="relative"
                    style={{
                        width: partner.logoWidth,
                        height: partner.logoHeight,
                    }}
                >
                    <Image
                        src={partner.logo}
                        alt={partner.name}
                        width={partner.logoWidth}
                        height={partner.logoHeight}
                        className="object-contain"
                    />
                </div>
                <div>
                    <p className="helvetica-text-font font-medium text-[12px] leading-[1.4] tracking-[-0.16px] text-white uppercase">
                        {partner.name}
                    </p>
                    <p className="helvetica-text-font font-medium text-[10px] leading-[1.4] tracking-[0.04em] text-white/80 uppercase">
                        {partner.subtitle}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function LongevityNadPlusProtocolSection({
    alwaysShowLogosInBig = false,
    headline,
}) {
    return (
        <section className="bg-[#FAFAFA] w-full">
            <div className="flex flex-col items-center px-5 md:px-10 lg:px-[60px] xl:px-[120px] py-14 md:py-20 gap-12">
                <h2
                    className="helvetica-display-font text-[20px] md:text-[24px] font-medium leading-[1.2] tracking-[-0.2px] md:tracking-[-0.24px] text-black text-center uppercase"
                    style={{ wordSpacing: "0.3em" }}
                >
                    {headline ?? PROTOCOL_DATA.partnerHeadline}
                </h2>
                {/* Sports Partners Row */}
                <div className="max-w-[1200px] w-full flex flex-col items-center gap-12">
                    {!alwaysShowLogosInBig && (
                        <>
                            <div className="hidden w-full flex-row items-center justify-center gap-4 md:flex">
                                {/* w-[190px] keeps 3 cards + gaps inside the content width at the
                                    md breakpoint (768px, before lg's wider padding); lg+ grows to
                                    the full 240x340 design size. */}
                                {PROTOCOL_DATA.partners.map((partner) => (
                                    <PartnerCard
                                        key={partner.name}
                                        partner={partner}
                                        className="w-[190px] h-[269px] lg:w-[240px] lg:h-[340px]"
                                    />
                                ))}
                            </div>
                            <div className="w-full md:hidden">
                                <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth">
                                    {PROTOCOL_DATA.partners.map((partner) => (
                                        <PartnerCard
                                            key={partner.name}
                                            partner={partner}
                                            className="w-[200px] h-[280px] shrink-0 snap-start"
                                        />
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                    {alwaysShowLogosInBig && (
                        <Reveal y={20} duration={0.65} className="w-full">
                            <div className="md:flex grid grid-cols-2 md:justify-center md:items-center md:gap-10">
                                {MOBILE_PARTNER_ORDER.map((index) => {
                                    const partner = PROTOCOL_DATA.partners[index];
                                    return (
                                        <PartnerLogoItem
                                            key={partner.name}
                                            partner={partner}
                                            forceBigLogo
                                        />
                                    );
                                })}
                            </div>
                        </Reveal>
                    )}
                </div>
            </div>
        </section>
    );
}
