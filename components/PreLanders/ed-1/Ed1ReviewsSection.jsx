"use client";
import { useEffect, useRef, useState } from "react";
import CustomContainImage from "@/components/utils/CustomContainImage";
import TrustpilotReviewsFallback from "@/components/ui/trustpilotFallback/TrustpilotReviewsFallback";
import { logger } from "@/utils/devLogger";
import dynamic from "next/dynamic";

const SCRIPT_ID = "trustpilot-script-ed1";

const Ed1ReviewsSectionInner = ({
  heading = "175K+ Very Happy Customers ;)",
  subtitle = "Real results, real people. Discover how we've transformed sex lives.",
}) => {
  const trustpilotRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  const headingClassName =
    "!text-6xl !font-normal !tracking-tight !leading-none lg:!text-[48px] lg:!leading-none lg:!font-[550] lg:!tracking-normal";
  useEffect(() => {
    setIsClient(true);

    const fallbackTimeout = setTimeout(() => {
      if (!isScriptLoaded && !hasError) {
        setShowFallback(true);
      }
    }, 5000);

    if (typeof window !== "undefined" && typeof document !== "undefined") {
      const existingScript = document.getElementById(SCRIPT_ID);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement("script");
      script.id = SCRIPT_ID;
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
              if (window.Trustpilot) {
                window.Trustpilot.loadFromElement(widgets[i]);
              }
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
      <TrustpilotReviewsFallback
        heading={heading}
        subtitle={subtitle}
        headingClassName={headingClassName}
      />
    );
  }

  return (
    <section className="reviews-section" aria-labelledby="ed1-reviews-heading">
      <h2
        id="ed1-reviews-heading"
        className={`max-w-xs md:max-w-full text-center mx-auto headers-font ${headingClassName}`}
      >
        {heading}
      </h2>
      <p className="mt-4 text-lg text-center">{subtitle}</p>

      <div className="flex items-center justify-center h-[125px] gap-4 mt-[56px]">
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
    </section>
  );
};

export default dynamic(() => Promise.resolve(Ed1ReviewsSectionInner), {
  ssr: false,
});
