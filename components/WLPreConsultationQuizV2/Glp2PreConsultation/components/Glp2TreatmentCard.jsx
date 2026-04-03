"use client";

import React from "react";
import CustomImage from "@/components/utils/CustomImage";

const renderBadge = (badge) => {
  const cleanBadge = String(badge || "")
    .replace(/^[^\w]+/u, "")
    .trim();

  if (!cleanBadge) return null;

  const isAffordable = /more affordable/i.test(cleanBadge);
  const isFastest = /fastest results/i.test(cleanBadge);

  if (!isAffordable && !isFastest) {
    return <div className="font-medium">{cleanBadge}</div>;
  }

  const colorClass = isAffordable ? "text-[#2ED296]" : "text-[#00598D]";

  return (
    <div className={`mt-1 flex items-center text-base leading-6 ${colorClass}`}>
      <div className="flex items-center justify-center">
        {isAffordable ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-4 mr-1"
          >
            <path d="M12 7.5a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
            <path
              fillRule="evenodd"
              d="M1.5 4.875C1.5 3.839 2.34 3 3.375 3h17.25c1.035 0 1.875.84 1.875 1.875v9.75c0 1.036-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 011.5 14.625v-9.75zM8.25 9.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM18.75 9a.75.75 0 00-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 00.75-.75V9.75a.75.75 0 00-.75-.75h-.008zM4.5 9.75A.75.75 0 015.25 9h.008a.75.75 0 01.75.75v.008a.75.75 0 01-.75.75H5.25a.75.75 0 01-.75-.75V9.75z"
              clipRule="evenodd"
            />
            <path d="M2.25 18a.75.75 0 000 1.5c5.4 0 10.63.722 15.6 2.075 1.19.324 2.4-.558 2.4-1.82V18.75a.75.75 0 00-.75-.75H2.25z" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="h-4 mr-1"
          >
            <path
              fillRule="evenodd"
              d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </div>
      <div className="text-xs md:text-base font-medium">{cleanBadge}</div>
    </div>
  );
};

const Glp2TreatmentCard = ({
  product,
  title,
  subtitle,
  badge,
  counterText,
  isSelected,
  onSelect,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSelect(product)}
      className={`w-full rounded-[8px] border p-3 md:p-4 text-left transition-colors ${
        isSelected
          ? "border-[#A7885A] bg-[#F7F2EA]"
          : "border-[#C7D1DA] bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="relative w-[72px] h-[72px] md:w-[94px] md:h-[94px] rounded-[4px] bg-[#E9F0F4] flex items-center justify-center shrink-0 overflow-hidden">
          <CustomImage src={product?.url || ""} alt={title} fill />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-xl leading-6 font-semibold pr-5">
            {title}
          </h3>
          <p className="text-xs md:text-base leading-5 text-[#455F77]">
            {subtitle}
          </p>
          {renderBadge(badge)}

          <p className="mt-1 flex items-center gap-1 font-semibold text-brand-500 text-xs md:text-sm">
            <span className="h-2 w-2 rounded-full bg-[#30B130] animate-pulse"></span>
            {counterText}
          </p>
        </div>

        <span
          className={`mt-1 w-[20px] h-[20px] md:w-[22px] md:h-[22px] rounded-full border-2 shrink-0 ${
            isSelected ? "border-[#A7885A] bg-[#A7885A]" : "border-[#9AAABB]"
          }`}
        />
      </div>
    </button>
  );
};

export default Glp2TreatmentCard;
