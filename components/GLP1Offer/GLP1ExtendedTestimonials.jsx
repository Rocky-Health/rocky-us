"use client";

import { useEffect, useRef, useState } from "react";
import { logger } from "@/utils/devLogger";
import CustomContainImage from "@/components/utils/CustomContainImage";
import dynamic from "next/dynamic";
import TrustpilotReviewsFallback from "@/components/ui/trustpilotFallback/TrustpilotReviewsFallback";

const GLP1ExtendedTestimonials = () => {
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
      const existingScript = document.getElementById(
        "trustpilot-script-extended"
      );
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.id = "trustpilot-script-extended";
      script.src =
        "https://widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js";
      script.async = true;

      const initTrustpilot = () => {
        try {
          if (window.Trustpilot) {
            setIsScriptLoaded(true);
            clearTimeout(fallbackTimeout);
            const widgets =
              document.getElementsByClassName("trustpilot-widget");
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

  if (showFallback || hasError) {
    return (
      <div>
        <div className="text-center mb-10 md:mb-14">
          <h2 className="headers-font text-black text-[32px] md:text-[48px] leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] mb-4">
            There&apos;s a reason people are{" "}
            <span className="text-[#AE7E56]">raving about us.</span>
          </h2>
          <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[16px] md:text-[18px] font-[400] leading-[140%] max-w-[600px] mx-auto">
            Join the thousands of people who have trusted Rocky to help change
            their lives, achieving significant, lasting weight loss.
          </p>
        </div>
        <TrustpilotReviewsFallback />
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6 md:mb-10">
        <h2 className="headers-font text-black text-[32px] md:text-[48px] leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] mb-4">
          There&apos;s a reason people are{" "}
          <span className="text-[#AE7E56]">raving about us.</span>
        </h2>
        <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[16px] md:text-[18px] font-[400] leading-[140%] max-w-[600px] mx-auto">
          Join the thousands of people who have trusted Rocky to help change
          their lives, achieving significant, lasting weight loss.
        </p>
      </div>

      {/* Trustpilot Rating Badge */}
      <div className="flex items-center justify-center h-[100px] gap-4">
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
            className="trustpilot-widget w-[152px] h-[90px]"
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
                  logger.error("Error loading TrustPilot widget:", error);
                }
              }
            }}
          />
        )}
      </div>

      {/* Trustpilot Reviews Carousel */}
      {isClient && !hasError && !showFallback && (
        <div
          ref={trustpilotRef}
          className="trustpilot-widget"
          data-locale="en-US"
          data-template-id="54ad5defc6454f065c28af8b"
          data-businessunit-id="637cea41a90e1b4641b56036"
          data-style-height="240px"
          data-style-width="100%"
          data-theme="light"
          data-stars="4,5"
          data-review-languages="en"
          aria-label="Customer reviews from TrustPilot"
          style={{ minHeight: "240px" }}
        >
          <a
            href="https://www.trustpilot.com/review/myrocky.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Trustpilot
          </a>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(GLP1ExtendedTestimonials), {
  ssr: false,
});
