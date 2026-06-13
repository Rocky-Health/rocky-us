"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import CustomContainImage from "./CustomContainImage";
import { useLazyTrustpilot } from "@/utils/hooks/useLazyTrustpilot";

export default function TrustpilotWidget({
    fallbackSrc = "/dm-offers/trustpilot2.png",
    fallbackAlt = "Trustpilot rating",
}) {
    const [isClient, setIsClient] = useState(false);
    const { containerRef, hasError } = useLazyTrustpilot();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (hasError) {
        return (
            <div className="w-full px-4">
                <Image
                    src={fallbackSrc}
                    alt={fallbackAlt}
                    width={270}
                    height={60}
                    className="mx-auto block h-auto w-full max-w-[300px] pt-4"
                />
            </div>
        );
    }

    return (
        <div ref={containerRef} className="flex items-center justify-center h-[125px] gap-4 mt-[4px]">
            <div className="relative overflow-hidden w-[104px] h-[47px]">
                <CustomContainImage
                    fill
                    src="https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/tp-profiles.webp"
                    alt="TrustPilot"
                    sizes="104px"
                />
            </div>
            {isClient && (
                <div
                    className="trustpilot-widget-img w-[152px] h-[90px]"
                    data-locale="en-US"
                    data-template-id="53aa8807dec7e10d38f59f32"
                    data-businessunit-id="637cea41a90e1b4641b56036"
                    data-style-height="150px"
                    data-style-width="100%"
                    style={{ position: "relative" }}
                    aria-label="TrustPilot rating"
                />
            )}
        </div>
    );
}
