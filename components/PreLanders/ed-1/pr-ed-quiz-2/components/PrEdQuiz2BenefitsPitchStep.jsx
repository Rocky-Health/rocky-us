"use client";

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

export default function PrEdQuiz2BenefitsPitchStep({
  step,
  onContinue,
  canContinue,
}) {
  const src = step.imageSrc || "/ed-1/man-benefits.jpg";
  const alt =
    step.imageAlt ||
    "Man in a light shirt on a neutral background";
  const headline =
    step.headline ||
    "Now you'll be fully ready when it matters most.";
  const statValue = step.statValue ?? "89%";
  const statLead = step.statLead ?? "of men prefer ";
  const statPhraseA = step.statPhraseA ?? "apomorphine + sildenafil";
  const statMid = step.statMid ?? " to ";
  const statPhraseB = step.statPhraseB ?? "sildenafil alone";
  const statTrailing = step.statTrailing ?? "*";

  const disclaimer =
    step.disclaimer ||
    "*On average, after medication dissolves. Based on a customer survey of active DirectMax patients.";

  return (
    <section className="mx-auto max-w-6xl pb-16 pt-4 md:pt-8">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <div className="relative w-full shrink-0 lg:w-[44%]">
          <div className="relative mx-auto aspect-square max-w-[min(100%,420px)] overflow-hidden rounded-3xl shadow-[0_20px_50px_-18px_rgba(13,23,40,0.22)] ring-1 ring-[#AE7E56]/20 lg:max-w-none">
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover"
              width={800}
              height={800}
            />
          </div>
        </div>

        <div className="flex w-full flex-col lg:w-[56%] lg:pt-2">
          <h2 className="headers-font text-center text-3xl font-black leading-[1.12] text-[#0d1728] md:text-left md:text-4xl lg:text-[2.35rem]">
            {headline}
          </h2>

          <div className="mt-8 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/[0.05] sm:p-6 md:mt-10">
            <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-6">
              <span className="headers-font shrink-0 text-center text-5xl font-black tabular-nums leading-none text-[#0d1728] sm:text-left sm:text-6xl">
                {statValue}
              </span>
              <p className="poppins-font text-center text-base leading-snug text-[#1c1b19] sm:text-left sm:text-lg">
                {statLead}
                <span className="font-semibold text-[#AE7E56]">{statPhraseA}</span>
                {statMid}
                <span className="font-semibold text-[#AE7E56]">{statPhraseB}</span>
                {statTrailing}
              </p>
            </div>
          </div>

          {disclaimer ? (
            <p className="poppins-font mt-4 text-center text-[11px] leading-relaxed text-[#1c1b19]/55 md:text-left md:text-xs">
              {disclaimer}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => onContinue?.()}
            disabled={!canContinue}
            className="headers-font relative mx-auto mt-10 flex w-full max-w-xl items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#2d2c2a] to-[#141312] px-6 py-4 text-base font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 md:mx-0"
          >
            <span>{step.ctaLabel || "Continue"}</span>
            <span className="ml-3 inline-flex" aria-hidden>
              <ContinueArrowIcon />
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
