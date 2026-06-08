"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import CustomContainImage from "@/components/utils/CustomContainImage";
import dynamic from "next/dynamic";
import TrustpilotReviewsFallback from "@/components/ui/trustpilotFallback/TrustpilotReviewsFallback";
import { useLazyTrustpilot } from "@/utils/hooks/useLazyTrustpilot";

/** Two-column "raving about us" strip — matches MYROCKY lander comp (sage + charcoal). */
function MedViRavingIntro({ ctaHref = "/wl-pre-consultation" }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between sm:gap-8 gap-4 lg:gap-10 xl:gap-16 mb-10 md:mb-12 lg:mb-14 text-left sm:px-8 px-0">
      <h2 className="headers-font text-[#33302E] sm:text-[28px] text-[24px] leading-[115%] tracking-[-0.64px] lg:max-w-[min(100%,520px)] lg:flex-1">
        There&apos;s a reason people are{" "}
        <span className="text-[#AE7E56] font-[600] block">
          raving about us.
        </span>
      </h2>
      <div className="flex w-full flex-col lg:max-w-[min(100%,600px)]">
        <p className="poppins-font text-[#666666] text-sm font-[400] leading-[150%] mb-6">
          Join the thousands of people who have trusted{" "}
          <span className="font-medium text-[#33302E]">MyRocky</span> to help
          change their lives, achieving significant,{" "}
          <span className="font-medium text-[#AE7E56]">
            lasting weight loss.
          </span>
        </p>
        <Link
          href={ctaHref}
          className="bg-black text-white rounded-full inline-flex items-center justify-center px-12 py-2.5 text-[14px] font-[600] tracking-[0.5px] uppercase hover:translate-y-[-3px] transition-all duration-300 hover:shadow-xl sm:w-fit w-full"
        >
          I&apos;M READY, LET&apos;S GO
        </Link>
      </div>
    </div>
  );
}

const MedViExtendedTestimonials = ({ ctaHref = "/wl-pre-consultation" }) => {
  const [isClient, setIsClient] = useState(false);
  const { containerRef, hasError } = useLazyTrustpilot();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (hasError) {
    return (
      <div>
        <MedViRavingIntro ctaHref={ctaHref} />
        <TrustpilotReviewsFallback />
      </div>
    );
  }

  return (
    <div ref={containerRef}>
      <MedViRavingIntro ctaHref={ctaHref} />

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
    </div>
  );
};

export default dynamic(() => Promise.resolve(MedViExtendedTestimonials), {
  ssr: false,
});
