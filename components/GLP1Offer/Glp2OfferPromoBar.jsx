import React from "react";

const TagIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2H7a2 2 0 0 0-2 2v5a2 2 0 0 0 .586 1.414l8 8a2 2 0 0 0 2.828 0l5-5a2 2 0 0 0 0-2.828l-8-8A2 2 0 0 0 12 2z" />
    <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);

const Glp2OfferPromoBar = () => {
  return (
    <div className="w-full bg-[#0a0a0a] py-2.5 px-4 flex flex-col items-center justify-center gap-1.5">
      <p className="flex items-center gap-1.5 text-white text-[13px] md:text-[14px] font-semibold leading-none">
        <TagIcon />
        Limited Time: $99 OFF
      </p>
      <span className="inline-flex items-center gap-1.5 bg-[#22c55e] text-white text-[12px] md:text-[13px] font-semibold px-4 py-1 rounded-full leading-none">
        $99 OFF
        <span className="font-normal">all weight loss plans</span>
      </span>
    </div>
  );
};

export default Glp2OfferPromoBar;
