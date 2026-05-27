"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Loader from "@/components/Loader";

const ACCENT = "#A7885A";

const NAD_PLUS_PRODUCT = {
  id: "490774",
  name: "NAD+",
  price: "$99",
  image: "/nad+/NAD+ product bottle.png",
};

const PLAN_FEATURES = [
  "New Rx shipped every 30 days",
  "Unlimited provider support",
  "Regular check-ins",
  "Wellness & lifestyle support",
];

const NadPlusPlanStep = ({ onContinue }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/checkout");
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = showLoader ? "hidden" : prev || "";
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [showLoader]);

  const handleGetStarted = async () => {
    if (isLoading) return;
    setIsLoading(true);
    try {
      await onContinue({
        id: "monthly",
        subscriptionPeriod: "1_month",
        price: "$99",
      });
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col px-4 pb-12 pt-6">
      {isLoading && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black bg-opacity-30">
          <Loader />
        </div>
      )}

      {showLoader && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center bg-white">
          <Loader />
        </div>
      )}

      <div className="mx-auto w-full max-w-md">
        <h1 className="headers-font text-4xl font-normal leading-[120%] tracking-[-0.02em] text-[#251F20] lg:text-5xl">
          Your NAD+ Plan
        </h1>
        <p className="mt-2 font-sans text-base leading-[145%] text-[#251F20]/70">
          Compounded NAD+ Injections — prescribed by a licensed provider and
          shipped to your door.
        </p>

        <div
          className="mt-8 overflow-hidden rounded-2xl border-2 bg-white"
          style={{ borderColor: ACCENT }}
        >
          <div
            className="px-6 py-3 text-center font-sans text-sm font-semibold text-white"
            style={{ backgroundColor: ACCENT }}
          >
            Monthly Auto-Refill
          </div>

          <div className="flex flex-col items-center px-6 py-6">
            <div className="relative h-[160px] w-[120px]">
              <Image
                src={NAD_PLUS_PRODUCT.image}
                alt="NAD+ injection vial"
                fill
                className="object-contain"
              />
            </div>

            <h2 className="headers-font mt-4 text-2xl font-normal text-[#251F20]">
              Compounded NAD+ Injections
            </h2>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="headers-font text-4xl font-normal text-[#251F20]">
                $99
              </span>
              <span className="font-sans text-base text-[#251F20]/60">
                /month
              </span>
            </div>

            <ul className="mt-6 w-full space-y-3">
              {PLAN_FEATURES.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <svg
                    className="mt-0.5 h-5 w-5 shrink-0"
                    viewBox="0 0 20 20"
                    fill="none"
                  >
                    <circle cx="10" cy="10" r="10" fill={ACCENT} />
                    <path
                      d="M6 10l3 3 5-5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-sans text-sm leading-snug text-[#251F20]">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          disabled={isLoading}
          onClick={handleGetStarted}
          className="mt-8 flex h-[52px] w-full items-center justify-center rounded-full font-sans text-base font-medium text-white transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45"
          style={{
            backgroundColor: ACCENT,
            "--tw-ring-color": ACCENT,
          }}
        >
          {isLoading ? "Processing..." : "Start Treatment — $99/mo"}
        </button>

        <p className="mt-3 text-center font-sans text-xs text-[#251F20]/50">
          Cancel anytime. If your prescription is not approved, you will receive
          a full refund.
        </p>
      </div>
    </div>
  );
};

export default NadPlusPlanStep;
