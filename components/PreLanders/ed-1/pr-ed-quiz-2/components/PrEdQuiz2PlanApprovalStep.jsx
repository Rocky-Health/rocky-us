"use client";

import { useEffect, useState } from "react";
import { logger } from "@/utils/devLogger";
import { addToCartEarly, finalizeFlowCheckout } from "@/utils/flowCartHandler";
import EdDosageSelection from "@/components/EDPreConsultationQuiz/EdDosageSelectionModal";

function FlameIcon({ className = "inline-block h-4 w-4 text-[#AE7E56]" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2c0 5 8 8 8 14a8 8 0 01-16 0c0-4 6-9 8-14z" />
    </svg>
  );
}

/** Line chart — trend up (replaces generic bar graphic). */
function ChartLineIcon({
  className = "mb-2 block h-5 w-5 shrink-0 text-[#AE7E56] sm:mb-3 sm:h-6 sm:w-6",
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 19h16" />
      <path d="M4 19V5" opacity="0.5" />
      <path d="M6 16l3.5-4 3 2.5L17 8l2 2.5" />
    </svg>
  );
}

function TruckSm() {
  return (
    <svg
      className="inline h-4 w-4 text-[#AE7E56]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14 18V6a1 1 0 00-1-1H4a1 1 0 00-1 1v11a1 1 0 001 1h1m12-1h1m-6 0a2 2 0 104 0m-5 0a2 2 0 11-4 0m5 0V9a1 1 0 011-1h2.293a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V18a1 1 0 01-1 1h-1"
      />
    </svg>
  );
}

function BoltSm() {
  return (
    <svg className="inline h-4 w-4 text-[#AE7E56]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

function CheckSm() {
  return (
    <svg
      className="inline h-4 w-4 text-[#AE7E56]"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 12.5l2 2 5-5" />
    </svg>
  );
}

function ChevronDown({ open }) {
  return (
    <svg
      className={`h-5 w-5 shrink-0 text-[#1c1b19]/35 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function ContinueArrowIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M14 5l7 7m0 0l-7 7m7-7H3"
      />
    </svg>
  );
}

const ACC = [
  {
    id: "1",
    title: "Important Safety Information",
    body:
      "DirectMax contains active pharmaceutical ingredients. Always consult your prescriber before starting treatment. Not suitable for those taking nitrates or with certain cardiovascular conditions. Full safety information provided at time of prescribing.",
  },
  {
    id: "2",
    title: "What to know",
    body:
      "DirectMax typically takes effect within 15–30 minutes. Effects can last up to 36 hours. Take as needed, no more than once per day. Avoid alcohol and large fatty meals before use for best results.",
  },
  {
    id: "3",
    title: "Active Ingredients",
    body: (
      <>
        <strong className="text-[#0d1728]">Apomorphine 3mg</strong> — Boosts arousal
        signals in the brain.
        <br />
        <br />
        <strong className="text-[#0d1728]">Sildenafil 80mg</strong> — PDE5 inhibitor for
        stronger, faster erections.
        <br />
        <br />
        <strong className="text-[#0d1728]">Tadalafil 22mg</strong> — Long-acting PDE5
        inhibitor for sustained performance.
      </>
    ),
  },
];

export default function PrEdQuiz2PlanApprovalStep({
  step,
  patientInfoAnswer,
  recommendationAnswer,
}) {
  const firstRaw = patientInfoAnswer?.firstName?.trim();
  const titleHeading = firstRaw ? `${firstRaw}'s Approval` : "Your Approval";

  const selectedProduct = recommendationAnswer?.product;
  const selectedProductOptions = recommendationAnswer?.productOptions;
  const productSrc =
    selectedProduct?.image ||
    step.productImageSrc ||
    "https://assets.directmeds.com/direct-max/1/direct-max-tabs-3.png";
  const doctorSrc =
    step.doctorImageSrc || "https://assets.directmeds.com/direct-max/1/dr1.jpg";

  const timerMinutes = typeof step.timerMinutes === "number" ? step.timerMinutes : 15;
  const selectedPlanName = recommendationAnswer?.label?.trim() || "DirectMax";
  const selectedPlanStrength =
    recommendationAnswer?.subtitle?.trim() || "High Strength";
  const initialSeconds = timerMinutes * 60;
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [openAcc, setOpenAcc] = useState(() => new Set());
  const [continuing, setContinuing] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [showDosagePopup, setShowDosagePopup] = useState(false);
  const [selectedDose, setSelectedDose] = useState(() => {
    if (selectedPlanName === "Cialis") return "10mg";
    if (selectedPlanName === "Viagra") return "50mg";
    return "10/50mg";
  });

  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 0 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const mm = Math.floor(secondsLeft / 60);
  const ss = secondsLeft % 60;
  const timerLabel = `${mm}:${ss < 10 ? `0${ss}` : ss}`;

  const toggleAcc = (id) => {
    setOpenAcc((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleContinue = () => {
    setCheckoutError("");
    setShowDosagePopup(true);
  };

  const handleDosageContinue = async () => {
    if (continuing) return;
    setContinuing(true);
    setCheckoutError("");

    try {
      const fallbackByName =
        selectedPlanName === "Cialis"
          ? {
              variationId: "7617",
              price: 40,
              preference: "generic",
              frequency: "monthly-supply",
              pillCount: 8,
            }
          : selectedPlanName === "Viagra"
            ? {
                variationId: "7614",
                price: 45,
                preference: "generic",
                frequency: "monthly-supply",
                pillCount: 8,
              }
            : {
                variationId: "159404,159472",
                price: 79,
                preference: "generic",
                frequency: "monthly-supply",
                pillCount: 8,
              };

      const finalOptions = selectedProductOptions || fallbackByName;
      const variationId = String(finalOptions.variationId || "").trim();

      if (!variationId) {
        throw new Error("Missing product variation. Please reselect your treatment plan.");
      }

      const isVarietyPack = variationId.includes(",");
      const varietyPackId = isVarietyPack
        ? `variety_pack_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
        : null;

      const mainProduct = {
        id: variationId,
        name: selectedPlanName,
        price: Number(finalOptions.price || 0),
        image: productSrc,
        isSubscription: finalOptions.frequency === "monthly-supply",
        variationId,
        isVarietyPack,
        varietyPackId,
        variation: [
          {
            attribute: "Subscription Type",
            value:
              finalOptions.frequency === "monthly-supply"
                ? "Monthly Supply"
                : "Quarterly Supply",
          },
          {
            attribute: "Tabs frequency",
            value: `${finalOptions.pillCount || 8} ${
              finalOptions.preference === "brand" ? "(Brand)" : "(Generic)"
            }`,
          },
          {
            attribute: "Requested dose",
            value: selectedDose || "",
          },
        ],
      };

      const result = await addToCartEarly(mainProduct, "ed", {
        requireConsultation: true,
        varietyPackId,
      });

      if (!result?.success) {
        throw new Error(result?.error || "Failed to add product to cart.");
      }

      const checkoutUrl = finalizeFlowCheckout("ed", true);
      window.location.href = checkoutUrl;
    } catch (err) {
      logger.error("PrEdQuiz2 plan checkout error:", err);
      setCheckoutError(
        err?.message ||
          "There was an issue starting checkout. Please try again.",
      );
      setContinuing(false);
    }
  };

  return (
    <>
    <div className="overflow-x-hidden text-center">
      <div className="mx-auto flex min-h-[calc(100vh-0px)] w-full max-w-2xl flex-col items-center pb-16 pt-4 sm:pt-6 md:pt-8">
        <h1 className="headers-font mb-3 text-4xl font-extrabold text-[#0d1728] sm:text-5xl">
          {titleHeading}
        </h1>
        <p className="poppins-font mb-8 text-lg text-[#1c1b19]/85">
          {step.discountLinePrefix ?? "You're saving 33% on"}{" "}
          <strong className="headers-font text-[#AE7E56]">{selectedPlanName}</strong>{" "}
          {step.discountLineSuffix ?? "3-in-1 ED treatment plan"}
        </p>

        <div className="mb-5 w-full rounded-3xl bg-black py-2.5 text-center text-xs tracking-wide text-white/90 sm:text-sm">
          <div className="mx-auto max-w-7xl px-4">
            <span className="text-white/70">Your plan is approved for: </span>
            <span
              className="ml-2 font-semibold text-[#AE7E56] underline decoration-1 underline-offset-2"
              id="plan-timer"
            >
              {timerLabel}
            </span>
          </div>
        </div>

        <div className="relative mb-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={productSrc}
            alt="DirectMax tablets"
            className="object-contain drop-shadow-2xl"
            style={{ width: "clamp(160px, 45vw, 260px)" }}
            width={260}
            height={260}
          />
        </div>

        <p className="poppins-font max-w-xl pb-3 text-lg text-[#1c1b19] md:text-xl">
          {selectedPlanName} <span className="font-semibold text-[#AE7E56]">All-in-one</span>{" "}
          Treatment
          <br />
          <span className="text-xs text-[#1c1b19]/60">Performance Guaranteed</span>
        </p>

        <div className="mb-5 w-full rounded-3xl border border-[#AE7E56]/25 bg-white px-6 py-7 shadow-sm ring-1 ring-black/[0.04]">
          <p className="headers-font mb-5 text-2xl font-bold text-[#0d1728]">
            Selected for you based on
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {["Medical History", "Health Info", "ED Frequency"].map((label) => (
              <div
                key={label}
                className="whitespace-nowrap rounded-full border-2 border-[#AE7E56]/50 bg-[#F5F4EF] py-2.5 px-6 text-lg text-[#0d1728] transition hover:bg-[#AE7E56]/10"
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8 flex items-center justify-center gap-1.5 text-[#1c1b19]/85">
          <FlameIcon className="h-4 w-4 shrink-0 text-[#AE7E56]" />
          <span className="poppins-font text-sm sm:text-base">
            Trusted by over 175,000 customers
          </span>
        </div>

        <div className="w-full text-left">
          <div className="rounded-3xl border border-black/[0.06] bg-white p-6 shadow-[0_12px_40px_-24px_rgba(13,23,40,0.35)]">
            <h2 className="headers-font mb-2 text-4xl font-extrabold text-[#0d1728]">
              Your treatment details
            </h2>
            <p className="poppins-font mb-5 text-lg leading-relaxed text-[#1c1b19]/65">
              Based on your answers, here&apos;s our recommendation:
            </p>

            <p className="headers-font mb-4 text-base font-bold text-[#0d1728]">
              {selectedPlanName}:{" "}
              <span className="font-normal text-[#AE7E56]">{selectedPlanStrength}</span>
            </p>

            <div className="mb-6 grid grid-cols-3 gap-2 sm:gap-3">
              <div className="rounded-2xl border border-[#AE7E56]/30 bg-[#F5F4EF] p-3 ring-1 ring-[#AE7E56]/10 sm:p-4">
                <FlameIcon className="mb-2 block h-5 w-5 text-[#AE7E56] sm:mb-3 sm:h-6 sm:w-6" />
                <p className="headers-font mb-2 text-xs font-bold leading-tight text-[#0d1728] sm:mb-3 sm:text-sm">
                  Boost Arousal
                </p>
                <p className="poppins-font text-[10px] text-[#1c1b19]/80 sm:text-xs">
                  Apomorphine
                </p>
                <p className="text-[10px] text-[#1c1b19]/55 sm:text-xs">3mg</p>
              </div>
              <div className="rounded-2xl border border-[#AE7E56]/30 bg-[#F5F4EF] p-3 ring-1 ring-[#AE7E56]/10 sm:p-4">
                <ChartLineIcon />
                <p className="headers-font mb-2 text-xs font-bold leading-tight text-[#0d1728] sm:mb-3 sm:text-sm">
                  Get Harder
                </p>
                <p className="poppins-font text-[10px] text-[#1c1b19]/80 sm:text-xs">
                  Sildenafil
                </p>
                <p className="text-[10px] text-[#1c1b19]/55 sm:text-xs">80mg</p>
              </div>
              <div className="rounded-2xl border border-[#AE7E56]/30 bg-[#F5F4EF] p-3 ring-1 ring-[#AE7E56]/10 sm:p-4">
                <ChartLineIcon />
                <p className="headers-font mb-2 text-xs font-bold leading-tight text-[#0d1728] sm:mb-3 sm:text-sm">
                  Stay Hard Longer
                </p>
                <p className="poppins-font text-[10px] text-[#1c1b19]/80 sm:text-xs">
                  Tadalafil
                </p>
                <p className="text-[10px] text-[#1c1b19]/55 sm:text-xs">22mg</p>
              </div>
            </div>

            <div className="mb-6 flex items-start gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={doctorSrc}
                alt="Doctor"
                className="h-12 w-12 shrink-0 rounded-full object-cover"
                width={48}
                height={48}
              />
              <p className="poppins-font text-sm leading-relaxed text-[#1c1b19]/65">
                One of our team of doctors will review your responses and determine if
                treatment, including this option, is a good fit for you.
              </p>
            </div>

            <div className="mb-6 rounded-2xl bg-[#F5F4EF] p-6 text-center ring-1 ring-[#AE7E56]/15">
              <div className="mb-2 flex items-baseline justify-center gap-1">
                <span
                  className="headers-font font-extrabold text-[#0d1728]"
                  style={{ fontSize: "4rem", lineHeight: 1 }}
                >
                  81
                </span>
                <span className="headers-font text-2xl font-bold text-[#0d1728]">%</span>
              </div>
              <p className="poppins-font text-base text-[#1c1b19]/75">
                of men like you are satisfied with this treatment plan
              </p>
            </div>

            <div className="w-full border-t border-black/10">
              {ACC.map((item, idx) => {
                const open = openAcc.has(item.id);
                return (
                  <div
                    key={item.id}
                    className={idx < ACC.length - 1 ? "border-b border-black/10" : ""}
                  >
                    <button
                      type="button"
                      onClick={() => toggleAcc(item.id)}
                      className="poppins-font flex w-full items-center justify-between bg-transparent py-4 text-left text-base text-[#0d1728]"
                    >
                      <span>{item.title}</span>
                      <ChevronDown open={open} />
                    </button>
                    {open ? (
                      <div className="pb-4 text-sm leading-relaxed text-[#1c1b19]/70">
                        {item.body}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="mt-8">
              <button
                type="button"
                onClick={handleContinue}
                disabled={continuing}
                className="headers-font relative flex w-full items-center justify-center overflow-hidden rounded-3xl bg-black px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{step.ctaLabel || "Continue"}</span>
                <span className="ml-3 inline-flex" aria-hidden>
                  <ContinueArrowIcon />
                </span>
              </button>
              {checkoutError ? (
                <p className="poppins-font mt-3 text-sm text-red-600">{checkoutError}</p>
              ) : null}
            </div>

            <div className="my-8 flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-[#1c1b19]/75">
              <span>
                <TruckSm /> Fast Free Shipping
              </span>
              <span>
                <BoltSm /> Longer Bigger Faster
              </span>
              <span>
                <CheckSm /> 3x better than Viagra®
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center py-6 text-xl text-[#1c1b19]/40">
        <a
          href="https://www.legitscript.com/websites/?checker_keywords=directmeds.com"
          target="_blank"
          rel="noopener noreferrer"
          title="Verify LegitScript Approval for www.directmeds.com"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://static.legitscript.com/seals/183773.png"
            alt="Verify Approval for www.directmeds.com"
            width={73}
            height={79}
          />
        </a>
      </div>
    </div>
      <EdDosageSelection
        isOpen={showDosagePopup}
        onClose={() => setShowDosagePopup(false)}
        product={{ id: selectedProduct?.id, name: selectedPlanName }}
        selectedDose={selectedDose}
        setSelectedDose={setSelectedDose}
        onContinue={handleDosageContinue}
        currentPage={0}
        isLoading={continuing}
      />
    </>
  );
}
