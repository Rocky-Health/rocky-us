"use client";
import { useLazyTrustpilot } from "@/utils/hooks/useLazyTrustpilot";

const Trustpilot = () => {
  // Defer the Trustpilot bootstrap script until the widget scrolls into view.
  const { containerRef } = useLazyTrustpilot();

  return (
    <div ref={containerRef} className="text-black text-center ">
      <div
        className="trustpilot-widget text-black relative scale-[.9]"
        data-locale="en-US"
        data-template-id="5419b6ffb0d04a076446a9af"
        data-businessunit-id="637cea41a90e1b4641b56036"
        data-style-height="20px"
        data-style-width="100%"
      >
        <a
          href="https://www.trustpilot.com/review/myrocky.ca"
          target="_blank"
          rel="noopener noreferrer"
        >
          Trustpilot
        </a>
      </div>
    </div>
  );
};

export default Trustpilot;
