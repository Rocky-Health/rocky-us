"use client";
import { useEffect, useRef, useState } from "react";
import { logger } from "@/utils/devLogger";
import CustomImage from "@/components/utils/CustomImage";
import dynamic from "next/dynamic";

const ReviewsSection = () => {
  const trustpilotRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  useEffect(() => {
    setIsClient(true);

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
        }
      };

      script.onload = initTrustpilot;
      script.onerror = () => {
        logger.error("Failed to load TrustPilot script");
        setHasError(true);
      };

      document.head.appendChild(script);

      if (window.Trustpilot) {
        initTrustpilot();
      }

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    }
  }, []);

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

  return (
    <div className="bg-[#F5F4EF]">
      <div className="max-w-7xl mx-auto p-3 py-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold">
          What People Are Saying
        </h2>
        <p className="mt-4 text-lg">
          Hear from real people who trusted MyRocky with their health.
        </p>
        <div className="flex items-center justify-center pt-3">
          <CustomImage
            src="https://myrocky.b-cdn.net/WP%20Images/Weight%20Loss/tp-profiles.webp"
            alt="TrustPilot"
            width={104}
            height={47}
          />
        </div>
        {hasError && (
          <div className="text-center py-4 text-red-500">
            <p>
              Unable to load reviews. Please check our TrustPilot page directly.
            </p>
            <a
              href="https://www.trustpilot.com/review/myrocky.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-red-700 transition-colors"
            >
              View reviews on TrustPilot
            </a>
          </div>
        )}

        {isClient && !hasError && (
          <div className="mt-6">
            <div
              ref={trustpilotRef}
              className="trustpilot-widget"
              data-locale="en-US"
              data-template-id="539adbd6dec7e10e686debee"
              data-businessunit-id="637cea41a90e1b4641b56036"
              data-style-height="700px"
              data-style-width="100%"
              data-theme="light"
              data-stars="4,5"
              data-review-languages="en"
              style={{ minHeight: "700px" }}
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
          </div>
        )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(ReviewsSection), {
  ssr: false,
});
