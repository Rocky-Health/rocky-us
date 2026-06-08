"use client";
import { useEffect, useState } from "react";
import CustomContainImage from "@/components/utils/CustomContainImage";
import dynamic from "next/dynamic";
import TrustpilotReviewsFallback from "@/components/ui/trustpilotFallback/TrustpilotReviewsFallback";
import { useLazyTrustpilot } from "@/utils/hooks/useLazyTrustpilot";

const ReviewsSection = () => {
  const [isClient, setIsClient] = useState(false);
  // Defer the Trustpilot bootstrap script until this section scrolls into view.
  const { containerRef, hasError } = useLazyTrustpilot();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Show fallback if the widget script failed to load or timed out.
  if (hasError) {
    return <TrustpilotReviewsFallback />;
  }

  return (
    <section
      ref={containerRef}
      className="reviews-section"
      aria-labelledby="reviews-heading"
    >
      <h2
        id="reviews-heading"
        className=" text-center mx-auto text-[36px] lg:text-[48px] leading-[115%] md:leading-[35px] lg:leading-[48px] font-[550] headers-font mb-4 w-[270px] md:w-full"
      >
        What People Are Saying
      </h2>

      <p className="text-center mx-auto text-[16px] lg:text-[18px] leading-[140%] tracking-[0%] text-[   #000000]  ">
        Our clinical team has put together effective treatments for you.
      </p>
      {/* TrustPilot Logos */}
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
          />
        )}
      </div>

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
    </section>
  );
};

export default dynamic(() => Promise.resolve(ReviewsSection), {
  ssr: false,
});
