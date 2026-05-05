"use client";

import Link from "next/link";
import CustomImage from "@/components/utils/CustomImage";
import { productTiers } from "@/components/MedViLanding/data";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { formatPrice } from "@/utils/priceFormatter";
import ScrollArrows from "@/components/ScrollArrows";
import { useRef } from "react";

const TierCard = ({ tier, ctaHref }) => {
    return (
        <div className="min-w-[280px] md:min-w-[340px] w-full rounded-[40px] pb-4  overflow-visible group bg-[#F5F4EF44] shadow">
            <div className="relative w-full h-[300px] md:h-[380px] bg-[linear-gradient(180deg,#F0EEEA_0%,#F0EEEA_60%,rgba(255,255,255,0)_60%,rgba(255,255,255,0)_100%)] rounded-t-[40px] overflow-visible">
                <div className="absolute inset-0 -top-10 -left-4 -right-4 flex items-center justify-center">
                    <CustomImage
                        src={tier.image}
                        alt={tier.name}
                        width={320}
                        height={400}
                        className="object-contain drop-shadow-lg scale-110 group-hover:translate-y-[-16px] transition-all duration-300"
                    />
                </div>
                {/* {tier.inStock && (
                    <span className="absolute top-4 left-4 bg-[#4CAF50] text-white text-[12px] font-[600] px-3 py-1 rounded-md z-10">
                        In Stock
                    </span>
                )} */}
            </div>

            <div className="p-6 text-center">
                <p className="poppins-font text-[#AE7E56] text-sm font-[400] mb-2">
                    Starting at{" "}
                    <span className=" font-[500]  headers-font">
                        ${formatPrice(tier.price)}
                    </span>
                </p>
                <h3 className="headers-font text-black text-[24px]  leading-[115%] mb-3">
                    {tier.name}
                </h3>
                <p className="poppins-font text-[rgba(0,0,0,0.60)] text-sm font-[400] mb-5">
                    {tier.subtitle}
                </p>

                <Link
                    href={ctaHref}
                    className="bg-black text-white rounded-full w-full text-[14px] font-[600] tracking-[0.5px] uppercase flex items-center justify-center py-3 hover:translate-y-[-3px] transition-all duration-300"
                >
                    Get Started
                </Link>
            </div>
        </div>
    );
};

const MedViProductTiers = ({ ctaHref = "#" }) => {
    const scrollContainerRef = useRef(null);

    return (
        <div className="container mx-auto py-20">
            <ScrollReveal>
                <div className="flex items-center justify-between px-10 pb-6">
                    <h2 className="headers-font text-black text-[32px]  leading-[115%] tracking-[-0.72px] md:tracking-[-0.96px] mb-1 text-start">
                        Trusted by experts.
                        <span className="headers-font text-[#AE7E56] text-[32px]  leading-[115%] tracking-[-0.72px] md:tracking-[-0.96px] italic mb-4 md:mb-6 block">
                            priced for you.
                        </span>
                    </h2>
                    <p className="poppins-font text-[rgba(0,0,0,0.70)] text-sm font-[400] leading-[140%] mb-10 md:mb-14 max-w-[660px] ms-auto text-start">
                        Find the right GLP-1 medication with the confidence that
                        comes from knowing it is{" "}
                        <span className="text-[#AE7E56] font-[500]">
                            doctor-approved
                        </span>{" "}
                        and budget-friendly.
                    </p>
                </div>
            </ScrollReveal>
            <div className="relative">
                <ScrollArrows scrollContainerRef={scrollContainerRef} />
                <div
                    ref={scrollContainerRef}
                    className="flex gap-2 md:gap-4 items-start overflow-x-auto snap-x snap-mandatory no-scrollbar pt-12 pb-4"
                >
                    {productTiers.map((tier, index) => (
                        <ScrollReveal key={index} delay={index * 0.15}>
                            <TierCard tier={tier} ctaHref={ctaHref} />
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MedViProductTiers;
