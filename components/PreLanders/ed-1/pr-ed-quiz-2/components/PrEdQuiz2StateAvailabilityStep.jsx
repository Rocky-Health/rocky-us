"use client";

import usaMap from "@svg-maps/usa";
import { ALL_US_STATES } from "@/lib/constants/usStates";

function getStateNameFromCode(stateCode) {
  if (!stateCode) return "your state";
  const match = ALL_US_STATES.find((entry) => entry.value === stateCode);
  return match?.label || stateCode;
}

function tailWithBold48Hours(tail) {
  if (!tail || !tail.includes("48 hours")) return tail;
  const parts = tail.split("48 hours");
  return (
    <>
      {parts.map((segment, idx) =>
        idx < parts.length - 1 ? (
          <span key={`h-${idx}`}>
            {segment}
            <strong className="font-bold text-[#1c1b19]">48 hours</strong>
          </span>
        ) : (
          <span key={`t-${idx}`}>{segment}</span>
        ),
      )}
    </>
  );
}

export default function PrEdQuiz2StateAvailabilityStep({
  step,
  selectedStateCode,
  onContinue,
}) {
  const selectedId = (selectedStateCode || "").toLowerCase();
  const stateName = getStateNameFromCode(selectedStateCode);
  const titleTemplate = step.titleTemplate || "DirectMax is available in {stateName}";
  const titleHasStateToken = titleTemplate.includes("{stateName}");
  const [titleBeforeState, titleAfterState = ""] = titleHasStateToken
    ? titleTemplate.split("{stateName}")
    : ["", ""];
  const titlePlain = titleTemplate.replace("{stateName}", stateName);
  const bulletOne = (step.bullets?.[0] || "").replace("{stateName}", stateName);
  const bulletTwo = (step.bullets?.[1] || "").replace("{stateName}", stateName);

  const bulletTwoTail = bulletTwo.split(stateName).slice(1).join(stateName);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-14 pt-4 md:pb-14 md:pt-8">
      {/*
        Mobile (default): headlines → map → card + CTA (single column).
        md+: map left spanning 2 rows; headlines top-right; card + button bottom-right.
      */}
      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[1.05fr_1fr] md:gap-10 md:items-center">
        <div className="w-full text-center md:col-start-2 md:row-start-1 md:text-left">
          <h2 className="headers-font mb-2 md:mb-2">
            <span className="text-[3.4rem] font-bold leading-tight text-[#AE7E56] md:text-6xl">
              {step.titlePrefix || "Good news."}
            </span>
          </h2>
          <h3 className="headers-font px-1 text-3xl font-semibold leading-snug tracking-tight text-[#171d2c] md:px-0 md:text-5xl md:leading-tight">
            {titleHasStateToken ? (
              <>
                {titleBeforeState}
                <span className="state-name">{stateName}</span>
                {titleAfterState}
              </>
            ) : (
              titlePlain
            )}
          </h3>
        </div>

        <div className="mx-auto w-full max-w-[min(100%,380px)] md:col-start-1 md:row-start-1 md:row-span-2 md:max-w-none md:justify-self-start">
          <svg
            viewBox={usaMap.viewBox}
            role="img"
            aria-label="Map of USA"
            className="h-auto w-full"
          >
            {usaMap.locations.map((location) => {
              const isSelected = location.id === selectedId;
              return (
                <path
                  key={location.id}
                  d={location.path}
                  aria-label={location.name}
                  fill={isSelected ? "#1c1b19" : "#e4ddd2"}
                  stroke={isSelected ? "#AE7E56" : "#f5f1ea"}
                  strokeWidth={1.2}
                  className="transition-colors duration-200"
                />
              );
            })}
          </svg>
        </div>

        <div className="w-full md:col-start-2 md:row-start-2 md:justify-self-stretch">
          <div className="mb-5 rounded-[1.25rem] bg-white px-5 py-4 shadow-sm ring-1 ring-black/5 md:mb-6 md:rounded-2xl md:px-6 md:py-5 md:ring-[#AE7E56]/25">
            <p className="poppins-font mb-3 text-left text-[1em] leading-snug text-gray-500 md:text-[16px]">
              <span className="mr-1.5 align-middle text-[#AE7E56]" aria-hidden>
                ✓
              </span>
              {bulletOne}
            </p>
            <p className="poppins-font text-left text-[1em] leading-snug text-gray-500 md:text-[16px]">
              <span className="mr-1.5 align-middle text-[#AE7E56]" aria-hidden>
                ✓
              </span>
              {bulletTwo.split(stateName)[0]}
              <span className="font-semibold text-[#AE7E56]">{stateName}</span>
              {tailWithBold48Hours(bulletTwoTail)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onContinue?.()}
            className="headers-font mx-auto flex w-full max-w-full items-center justify-center rounded-[1.75rem] bg-[#1c1b19] px-6 py-3.5 text-base font-semibold text-white ring-1 ring-[#AE7E56]/35 transition-colors hover:bg-black md:mx-0 md:rounded-3xl md:py-4"
          >
            {step.ctaLabel || "Continue"}
          </button>
        </div>
      </div>
    </section>
  );
}
