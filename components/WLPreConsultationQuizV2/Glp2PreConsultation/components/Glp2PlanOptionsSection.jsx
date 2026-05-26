"use client";

import React from "react";
import { formatPriceUI } from "@/utils/priceFormatter";

const PLAN_SUPPLY_BY_ID = {
  monthly: "4 Week Supply",
  "3month": "12 Week Supply",
  "6month": "24 Week Supply",
  "12month": "48 Week Supply",
};

const PLAN_COPY_BY_ID = {
  monthly: {
    title: "Monthly Plan",
    badge: "",
    subtitle: "The new you, delivered to your door monthly",
  },
  "3month": {
    title: "3-Month Plan",
    badge: "Most Popular",
    subtitle: "Receive your 3 month supply in a single shipment!",
  },
  "6month": {
    title: "6-Month Plan",
    badge: "",
    subtitle: "Your ultimate plan to guaranteed success and your consistency",
  },
  "12month": {
    title: "12-Month Plan",
    badge: "Best Deal",
    subtitle: "Commit to a year of progress and save on your new self",
  },
};

const BADGE_STYLE_BY_TEXT = {
  "Most Popular": "bg-[#e0f8ef] text-[#1c7e5a]",
  "Best Deal": "bg-[#d9eff6] text-[#015b76]",
};

const Glp2PlanOptionsSection = ({
  planValues,
  selectedPlan,
  onSelectPlan,
  disabled = false,
}) => {
  return (
    <div className="w-full md:w-[620px] mx-auto mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center rounded-full bg-[#A7885A] text-white text-sm font-semibold px-3 py-1">
          Step 2
        </span>
        <h2 className="subheadres-font text-xl md:text-[32px] leading-[115%] font-[400] text-[#000000]">
          Select Your Plan
        </h2>
      </div>

      <p className="text-[#4E657C] text-base mb-4">
        Lock in your savings without a big upfront payment-use free financing or
        pay in full with your card.
      </p>

      <div className="space-y-3">
        {planValues.map((plan) => {
          const isSelected = selectedPlan?.id === plan.id;
          const supplyText = PLAN_SUPPLY_BY_ID[plan.id] || "";
          const planCopy = PLAN_COPY_BY_ID[plan.id] || {};
          const title = planCopy.title || plan.label;
          const subtitle = planCopy.subtitle || plan.subtitle || "";
          const savingsText = String(plan.savings || "")
            .replace(/^save\s*/i, "")
            .trim();
          const hasCustomBadge = Object.prototype.hasOwnProperty.call(
            planCopy,
            "badge",
          );
          const badge = hasCustomBadge ? planCopy.badge : plan.badge || "";
          return (
            <button
              key={plan.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPlan?.(plan)}
              className={`w-full rounded-[8px] border p-5 text-left transition-colors ${
                isSelected
                  ? "border-[#A7885A] bg-[#F7F2EA]"
                  : "border-[#C7D1DA] bg-white"
              } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <div>
                <div className="flex items-center gap-2 justify-between sm:justify-start">
                  <h3 className="font-[600] text-[#000000]">{title}</h3>
                  {badge && (
                    <p
                      className={`rounded-full px-3 py-1 text-xs md:text-sm text-center whitespace-nowrap ${
                        BADGE_STYLE_BY_TEXT[badge] ||
                        "bg-[#EEF2F7] text-[#4B5563]"
                      }`}
                    >
                      {badge}
                    </p>
                  )}
                </div>
                <div className="mt-2 flex items-start justify-between gap-4">
                  <p className="md:text-sm text-xs text-[#666666]">
                    {subtitle}
                  </p>
                  <p className="text-[#000000] whitespace-nowrap">
                    {supplyText}
                  </p>
                </div>
              </div>

              {plan.savings && !plan.recurringNote && (
                <div className="mt-3 rounded-[4px] border border-dashed border-[#9ED3B3] text-[#21A957] text-center py-2 text-sm md:text-base font-semibold">
                  You are saving {savingsText}
                </div>
              )}

              {plan.id === "monthly" ? (
                <div className="mt-3 rounded-[4px] bg-[#A7885A] text-center py-3 px-3">
                  <p className="text-base leading-snug text-white font-bold">
                    Select Plan ·{" "}
                    {!plan.recurringNote && plan.originalPrice && (
                      <span className="line-through font-normal opacity-80">
                        ${formatPriceUI(plan.originalPrice)}/month
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-white/90 mt-0.5 uppercase tracking-wide">
                    PAY ONLY{" "}
                    <span className="font-bold">
                      ${formatPriceUI(plan.price)}
                    </span>{" "}
                    {plan.recurringNote ? (
                      <span className="normal-case font-normal opacity-90 ml-1">
                        · {plan.recurringNote}
                      </span>
                    ) : (
                      "LIMITED OFFER"
                    )}
                  </p>
                </div>
              ) : (
                <div className="mt-3 rounded-[4px] bg-[#A7885A] text-center py-3">
                  <p className="text-xl leading-none text-white">
                    Select Plan ·{" "}
                    <span className="font-normal">
                      ${formatPriceUI(plan.price)}/mo
                    </span>
                  </p>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Glp2PlanOptionsSection;
