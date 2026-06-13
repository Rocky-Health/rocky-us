"use client";

import { useState, useEffect } from "react";
import CustomContainImage from "@/components/utils/CustomContainImage";
import dynamic from "next/dynamic";
import TrustpilotReviewsFallback from "@/components/ui/trustpilotFallback/TrustpilotReviewsFallback";
import { useLazyTrustpilot } from "@/utils/hooks/useLazyTrustpilot";

const GLP1ExtendedTestimonials = () => {
  const [isClient, setIsClient] = useState(false);
  const { containerRef, hasError } = useLazyTrustpilot();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (hasError) {
    return (
      <div>
        <div className="text-center mb-10 md:mb-14">
          <h2 className="headers-font text-black text-[32px] md:text-[48px] leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] mb-4">
            There&apos;s a reason people are{" "}
            <span className="text-[#AE7E56]">raving about us.</span>
          </h2>
          <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[16px] md:text-[18px] font-[400] leading-[140%] max-w-[600px] mx-auto">
            Join the thousands of people who have trusted MyRocky to help change
            their lives, achieving significant, lasting weight loss.
          </p>
        </div>
        <TrustpilotReviewsFallback />
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <div className="text-center mb-6 md:mb-10">
        <h2 className="headers-font text-black text-[32px] md:text-[48px] leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] mb-4">
          There&apos;s a reason people are{" "}
          <span className="text-[#AE7E56]">raving about us.</span>
        </h2>
        <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[16px] md:text-[18px] font-[400] leading-[140%] max-w-[600px] mx-auto">
          Join the thousands of people who have trusted MyRocky to help change
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
            sizes="104px"
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
          />
        )}
      </div>

      {/* Trustpilot Reviews Carousel */}
      {isClient && (
        <div
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
