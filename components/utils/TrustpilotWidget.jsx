"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { logger } from "@/utils/devLogger";
import CustomContainImage from "./CustomContainImage";

export default function TrustpilotWidget({
    fallbackSrc = "/dm-offers/trustpilot2.png",
    fallbackAlt = "Trustpilot rating",
}) {
    const trustpilotRef = useRef(null);
    const [isClient, setIsClient] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        setIsClient(true);

        const fallbackTimeout = setTimeout(() => {
            if (!isScriptLoaded && !hasError) {
                setShowFallback(true);
            }
        }, 5000);

        if (typeof window !== "undefined" && typeof document !== "undefined") {
            const existingScript = document.getElementById("trustpilot-script");
            if (existingScript) {
                existingScript.remove();
            }

            const script = document.createElement("script");
            script.id = "trustpilot-script";
            script.src =
                "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
            script.async = true;

            const initTrustpilot = () => {
                try {
                    if (window.Trustpilot) {
                        setIsScriptLoaded(true);
                        clearTimeout(fallbackTimeout);
                        const widgets = document.getElementsByClassName(
                            "trustpilot-widget-img",
                        );
                        for (let i = 0; i < widgets.length; i++) {
                            window.Trustpilot.loadFromElement(widgets[i]);
                        }
                    }
                } catch (error) {
                    logger.error("Error initializing TrustPilot:", error);
                    setHasError(true);
                    setShowFallback(true);
                }
            };

            script.onload = initTrustpilot;
            script.onerror = () => {
                logger.error("Failed to load TrustPilot script");
                setHasError(true);
                setShowFallback(true);
                clearTimeout(fallbackTimeout);
            };

            document.head.appendChild(script);

            if (window.Trustpilot) {
                initTrustpilot();
            }

            return () => {
                clearTimeout(fallbackTimeout);
                if (script.parentNode) {
                    script.parentNode.removeChild(script);
                }
            };
        }

        return () => {
            clearTimeout(fallbackTimeout);
        };
    }, [isScriptLoaded, hasError]);

    useEffect(() => {
        if (
            isClient &&
            isScriptLoaded &&
            trustpilotRef.current &&
            window.Trustpilot
        ) {
            try {
                window.Trustpilot.loadFromElement(trustpilotRef.current);
            } catch (error) {
                logger.error("Error initializing TrustPilot widget:", error);
                setHasError(true);
            }
        }
    }, [isClient, isScriptLoaded]);

    if (showFallback) {
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
        <div className="flex items-center justify-center h-[125px] gap-4 mt-[4px]">
            <div className="relative overflow-hidden w-[104px] h-[47px]">
                <CustomContainImage
                    fill
                    src="https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/tp-profiles.webp"
                    alt="TrustPilot"
                    priority={true}
                    unoptimized={true}
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
                    ref={(el) => {
                        if (el && isClient && window.Trustpilot) {
                            try {
                                window.Trustpilot.loadFromElement(el);
                            } catch (error) {
                                logger.error(
                                    "Error loading TrustPilot widget:",
                                    error,
                                );
                            }
                        }
                    }}
                />
            )}
        </div>
    );
}
