"use client";

import { useState } from "react";
import Link from "next/link";
import CustomImage from "../utils/CustomImage";
import { FaCheckCircle } from "react-icons/fa";
import { formatPriceUI } from "@/utils/priceFormatter";

const RecommendCard = ({ product }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const toggleTooltip = () => setShowTooltip(!showTooltip);

    // Extract product data with fallbacks (updated for new API structure)
    const productName = product?.name || "Product";
    const productImage =
        product?.images?.[0]?.src || "/supplements/product.png";
    const productPrice = product?.price || "0.00";
    const productSlug = product?.slug;
    const productLink = productSlug ? `/product/${productSlug}` : "#";

    // Extract key benefits from product metadata (updated for new structure)
    const getProductBenefits = () => {
        const metaData = product?.meta_data;

        if (!metaData) {
            return ["Premium Quality", "Doctor-Backed Formula", "Made in US"];
        }

        const benefits = [];

        // Look for benefit fields in metadata
        for (let i = 1; i <= 4; i++) {
            const benefitKey = `key_benefits_0_benefit_${i}`;
            const benefitMeta = metaData.find(
                (meta) => meta.key === benefitKey
            );
            if (benefitMeta && benefitMeta.value && benefitMeta.value.trim()) {
                benefits.push(benefitMeta.value);
            }
        }

        // Limit to 3 benefits for card display
        const limitedBenefits = benefits.slice(0, 3);

        // Fallback to default benefits if none found
        if (limitedBenefits.length === 0) {
            return ["Premium Quality", "Doctor-Backed Formula", "Made in US"];
        }

        // Pad with default benefits if we have less than 3
        while (limitedBenefits.length < 3) {
            const defaults = [
                "Premium Quality",
                "Doctor-Backed Formula",
                "Made in US",
            ];
            const nextDefault = defaults[limitedBenefits.length];
            if (nextDefault && !limitedBenefits.includes(nextDefault)) {
                limitedBenefits.push(nextDefault);
            } else {
                break;
            }
        }

        return limitedBenefits;
    };

    const productDescription = getProductBenefits();

    return (
        <div className="bg-[#F6F6F5] relative rounded-2xl border-[0.5px] border-[#E2E2E1] min-w-[270px] max-w-[270px] md:min-w-[282px] md:max-w-[282px] min-h-[400px] max-h-[400px] md:min-h-[440px] md:max-h-[440px] flex-shrink-0 flex flex-col  pt-[32px] px-[24px] pb-[24px] ">
            <CustomImage
                src={productImage}
                width={200}
                height={200}
                className="w-[150px] h-[150px] md:w-[200px] md:h-[200px] rounded-full mx-auto mb-[10px]"
                alt={productName}
            />
            <div className="relative w-full ">
                <h2
                    onClick={toggleTooltip}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="overflow-hidden text-ellipsis  cursor-help font-[550]  headers-font text-[15px] lg:text-[20px] leading-[110%] tracking-[-2%] mb-[6px] line-clamp-2"
                >
                    {productName}
                </h2>
                {/* Tooltip */}
                {showTooltip && (
                    <div className="absolute top-full left-0 z-10 mt-1 w-fit bg-black text-white text-xs p-2 rounded shadow-md">
                        {productName}
                    </div>
                )}
            </div>
            {/* Description - flex-grow to take up available space */}
            <div className="my-[10px] mb-[24px]">
                {productDescription.map((desc, index) => (
                    <div
                        key={index}
                        className="flex  justify-start items-center gap-[6px] mb-[8px]"
                    >
                        <FaCheckCircle className="text-[#AE7E56] text-[12px] flex-shrink-0" />
                        <span className="overflow-hidden text-ellipsis font-[POPPINS] text-[12px] lg:text-[14px] font-normal tracking-[0px] leading-[100%] line-clamp-1">
                            {desc}
                        </span>
                    </div>
                ))}
            </div>

            {/* View Product Button - always at bottom */}
            <Link
                href={productLink}
                className="group bg-white w-full py-3 px-6 rounded-full flex justify-between hover:bg-black hover:text-white transition-colors"
            >
                <span className="font-[POPPINS] font-semibold text-[13px] lg:text-[15px] text-[#000000] group-hover:text-white">
                    View
                </span>
                <span className="font-[POPPINS] font-semibold text-[13px] lg:text-[15px] text-[#000000] group-hover:text-white">
                    $
                    {formatPriceUI(productPrice)}
                </span>
            </Link>
        </div>
    );
};

export default RecommendCard;
