"use client";

import React, { useState } from "react";
import CustomImage from "@/components/utils/CustomImage";

function RockyInTheNews() {
    const [imageErrors, setImageErrors] = useState({});

    const companyLogos = [
        {
            name: "Yahoo!",
            alt: "Yahoo!",
            logo: "/merch/yahoo-logo-grey.png.png",
            width: 98.6,
            height: 26.4,
        },
        {
            name: "CanHealth",
            alt: "CanHealth",
            logo: "/merch/canhealth-logo-2x.png.png",
            width: 98.6,
            height: 24.6,
        },
        {
            name: "HUF Magazine",
            alt: "HUF Magazine",
            logo: "/merch/huf-magazine-grey.png.png",
            width: 74,
            height: 19,
        },
        {
            name: "Market Watch",
            alt: "Market Watch",
            logo: "/merch/market-watch-grey-new.png.png",
            width: 98.6,
            height: 24.6,
        },
        {
            name: "The Globe and Mail",
            alt: "The Globe and Mail",
            logo: "/merch/The_Globe_and_Mail_Stretched_grey.png.png",
            width: 90,
            height: 25,
        },
        {
            name: "The Customer Business Journal",
            alt: "The Customer Business Journal",
            logo: "/merch/the-canadian-business-journal-logo.png.png",
            width: 143,
            height: 39,
        },
        {
            name: "Voyage",
            alt: "Voyage",
            logo: "/merch/voyage-grey.png.png",
            width: 60,
            height: 31,
        },
    ];

    const handleImageError = (companyName) => {
        setImageErrors((prev) => ({ ...prev, [companyName]: true }));
    };

    const renderLogo = (company) => {
        if (imageErrors[company.name]) {
            // Fallback to text if image failed to load
            return (
                <div className="text-lg font-medium text-gray-700 text-center">
                    {company.name}
                </div>
            );
        }

        return (
            <CustomImage
                src={company.logo}
                alt={company.alt}
                width={company.width}
                height={company.height}
                className="object-contain"
                onError={() => handleImageError(company.name)}
            />
        );
    };

    return (
        <div className="bg-white  h-[163px] py-[40px]">
            <div className=" mx-auto px-4 h-[123px] ">
                {/* Title */}
                <div className="text-center mb-6">
                    <h2 className="text-sm font-medium text-black ">
                        ROCKY IN THE NEWS
                    </h2>
                </div>

                {/* Company Logos */}
                <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-[82px] h-[40px] ">
                    {companyLogos.map((company, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-center  "
                            title={company.name}
                        >
                            {renderLogo(company)}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RockyInTheNews;
