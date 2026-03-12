"use client";

import React, { useState, useEffect } from "react";
import { logger } from "@/utils/devLogger";
import Loader from "@/components/Loader";

const BOSimplifiedPlanSelectionStep = ({
  product,
  selectedPlan,
  setSelectedPlan,
  planOptions,
  planInclusions,
  onBack,
  onContinue,
}) => {
  const [isCheckoutLoading, setIsCheckoutLoading] = useState(false);

  const planValues = planOptions
    ? Object.values(planOptions)
    : [
        {
          id: "monthly",
          label: "Monthly Auto-Refill",
          subtitle: "Flexible. Pay as you go plan.",
          price: "$359",
          originalPrice: "$389",
          savings: "Save $30",
          subscriptionPeriod: "1_month",
          isDefault: true,
        },
      ];

  const monthlyPlan = planValues.find((p) => p.id === "monthly") || planValues[0];

  useEffect(() => {
    if (!selectedPlan && planValues.length > 0) {
      const defaultPlan = planValues.find((p) => p.isDefault) || planValues[0];
      setSelectedPlan(defaultPlan);
    }
  }, []);

  const handleContinue = async () => {
    if (!selectedPlan) return;
    try {
      setIsCheckoutLoading(true);
      await onContinue(selectedPlan);
    } finally {
      setIsCheckoutLoading(false);
    }
  };

  const getOrderSummaryPrice = () => {
    if (!selectedPlan) return product?.price || "$359";
    return selectedPlan.price;
  };

  if (!product) {
    return (
      <div className="w-full max-w-[720px] mx-auto px-4 py-8 text-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  const ingredient = product.ingredient || "GLP-1/GIP";
  const productImage = product.url || product.uri_popup || product.image;

  return (
    <div className="w-full min-h-screen  pb-24 relative">
      {/* bg-[#F9F7F4] */}
      {isCheckoutLoading && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}
      <div className="w-full max-w-[1200px] mx-auto px-4 md:px-6">
        {/* Header - full width */}
        <h1 className="headers-font text-[26px] md:text-[32px] font-[500] leading-[115%] tracking-[-1%] text-[#000000] text-center mb-6">
          Select Your Weight Loss Plan
        </h1>

        {/* 12-col grid: 1 left | 6 content | 4 order summary | 1 right */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
          {/* Left spacer - 1 col (desktop) */}
          <div className="hidden md:block md:col-span-1" />

          {/* Product + Plan content - 6 cols (desktop) */}
          <div className="md:col-span-6 space-y-4 border border-gray-200 bg-white p-3 rounded-2xl">
            {/* Product label */}
            <div className="flex items-center justify-between mt-2">
              <span className="text-[16px] font-[600] text-[#000000]">
                ({ingredient}) Weight loss
              </span>
              {/* <button
                type="button"
                onClick={onBack}
                className="px-3 py-1.5 rounded-full border border-gray-300 bg-gray-100 text-gray-600 text-sm font-[500] hover:bg-gray-200 transition-colors"
              >
                Remove
              </button> */}
            </div>

            {/* Product Card - warm brown background */}
            <div
              className="rounded-xl overflow-hidden shadow-md bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/wl-plane/Card.png')" }}
            >
              <div className="flex flex-col md:flex-row gap-3 items-center">
                <div className="w-[110px] h-[110px] shrink-0 bg-[#8B7355] overflow-hidden">
                  <img
                    src={productImage}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="flex-1 flex flex-row items-start justify-between gap-3 w-full">
                  <div>
                    <p className="text-white/90 text-sm leading-[200%]">Compounded</p>
                    <p className="text-white text-xl md:text-[23px] font-[500] leading-tight">
                      {product.name?.replace("Compounded ", "") || "Tirzepatide"}
                    </p>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded-[4px] bg-white/80 text-[#9F6E46] text-xs font-[500] self-start mr-3 md:mr-4">
                    {ingredient}
                  </span>
                </div>
              </div>
              {planInclusions && planInclusions.length > 0 && (
                    <div className="">
                      <p className="text-[#623F23] text-[16px] font-[500] uppercase tracking-wider bg-white/60 p-2">
                        YOUR PLAN INCLUDES:
                      </p>
                      <ul className="space-y-1.5 p-3">
                        {planInclusions.map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-white text-sm">
                            <img src="/wl-plane/check.png" alt="" className="h-5 w-5 shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
            </div>

            {/* Flexible monthly plan */}
            <div className="pb-4 border-b border-gray-200">
              <h2 className="text-[18px] md:text-[20px] font-[600] text-[#000000] mb-1">
                Flexible monthly plan
              </h2>
              <p className="text-[14px] text-[#666666] mb-4">
                Subscribe & save even more off retail.<br/> Pause or cancel anytime.
              </p>
              <div
                onClick={() => setSelectedPlan(monthlyPlan)}
                className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                  selectedPlan?.id === "monthly"
                    ? "border-[#A7885A] bg-white shadow-sm"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedPlan?.id === "monthly"
                          ? "border-[#A7885A] bg-[#A7885A]"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedPlan?.id === "monthly" && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="font-[600] text-[#000000]">{monthlyPlan?.label || "Monthly Auto-Refill"}</p>
                      <p className="text-sm text-[#666666]">{monthlyPlan?.subtitle || "Flexible. Pay as you go plan."}</p>
                      {monthlyPlan?.savings && (
                        <span
                          className={`inline-block mt-2 px-2 py-1 rounded-[4px] text-xs font-[500] ${
                            selectedPlan?.id === "monthly"
                              ? "bg-[#CEEAD6] text-[#0D652D]"
                              : "bg-[#F1F3F4] text-[#424242]"
                          }`}
                        >
                          {monthlyPlan.savings}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-[600] text-[#000000]">       {monthlyPlan?.originalPrice && (
                      <span className="text-[16px] text-[#999999] line-through">{monthlyPlan.originalPrice}</span>
                    )} {monthlyPlan?.price}/mo</span>
             
                  </div>
                </div>
              </div>
            </div>

            {/* Maximize results and savings */}
            <div>
              <h2 className="text-[18px] md:text-[20px] font-[600] text-[#000000] mb-1">
                Maximize results and savings
              </h2>
              <p className="text-[14px] text-[#666666] mb-4">
                Secure your supply and best savings.
              </p>
              <div className="grid grid-cols-1 gap-3">
                {planValues
                  .filter((p) => p.id !== "monthly")
                  .map((plan) => (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan)}
                      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        selectedPlan?.id === plan.id
                          ? "border-[#A7885A] bg-white shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                              selectedPlan?.id === plan.id ? "border-[#A7885A] bg-[#A7885A]" : "border-gray-300"
                            }`}
                          >
                            {selectedPlan?.id === plan.id && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            {plan.badge && (
                              <p className="text-xs text-[#666666] uppercase tracking-wider mb-0.5">{plan.badge}</p>
                            )}
                                                <p className="font-[600] text-[#000000]">{plan.label}</p>

                
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-[600] text-[#000000]"><span className="text-[16px] text-[#999999] line-through">{plan.originalPrice}</span> {plan.price}/mo</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                    <span
                              className={`inline-block ml-7 px-2 py-1 rounded-[4px] text-xs font-[500] ${
                                selectedPlan?.id === plan.id
                                  ? "bg-[#CEEAD6] text-[#0D652D]"
                                  : "bg-[#F1F3F4] text-[#424242]"
                              }`}
                            >
                              {plan.savings}
                            </span>
                            {plan.type && <p className="text-sm text-[#666666]">{plan.type}</p>}
                    
                    </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Order summary - 4 cols (desktop) */}
          <div className="md:col-span-4 space-y-4 sticky md:top-6">
            {/* Order summary card */}
            <div className="rounded-2xl bg-white border border-gray-200 p-4 md:p-6 shadow-sm">
              <h3 className="text-[18px] font-[600] text-[#000000] mb-4">
                Order summary
              </h3>
              <hr className="border-gray-200 mb-4" />
              <div className="flex justify-between items-center text-[15px] font-[400] text-[#000000] mb-4">
                <span>{product.name} <br/> ({ingredient})</span>
                <span>{getOrderSummaryPrice()}</span>
              </div>
              <hr className="border-gray-200 mb-4" />
              <div className="flex justify-between items-center text-[15px] font-[600] text-[#000000] mb-4">
                <span>Due today</span>
                <span>$0</span>
              </div>
              <p className="text-[13px] text-[#666666] leading-[140%]">
                You'll only be charged if your provider determines that you're eligible for the program. Before then, your transaction is a pre-authorization.
              </p>
            </div>

            {/* Program terms card */}
            <div className="rounded-2xl bg-white border border-gray-200 p-4 md:p-6 shadow-sm">
              <ul className="text-[12px] text-[#666666] space-y-2 list-disc list-inside">
                <li>Discounts apply to the first payment only.</li>
                <li>
                  The program includes a 180-day money-back guarantee.{" "}
                  <a href="#" className="underline text-[#666666] hover:text-[#000000]">Learn more.</a>
                </li>
                <li>Cancel anytime to stop future billing.</li>
                <li>Plans offer discounts for longer commitments.</li>
                <li>Medications ship monthly. Early cancellations are refunded at standard rate.</li>
              </ul>
            </div>
          </div>

          {/* Right spacer - 1 col (desktop) */}
          <div className="hidden md:block md:col-span-1" />
        </div>
      </div>

      {/* Footer Navigation - Fixed */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 z-50">
        <button
          onClick={onBack}
          disabled={isCheckoutLoading}
          className="order-2 sm:order-1 px-6 py-3 rounded-full border-2 border-gray-300 bg-white text-[#000000] font-[500] hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleContinue}
          disabled={!selectedPlan || isCheckoutLoading}
          className="order-1 sm:order-2 flex-1 sm:flex-initial px-6 py-3 rounded-full bg-[#000000] text-white font-[500] hover:bg-[#333333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCheckoutLoading
            ? "Processing..."
            : `Proceed - ${selectedPlan?.price || getOrderSummaryPrice()} →`}
          {!isCheckoutLoading && (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
};

export default BOSimplifiedPlanSelectionStep;
