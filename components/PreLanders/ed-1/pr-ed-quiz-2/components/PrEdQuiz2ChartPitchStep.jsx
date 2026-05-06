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

export default function PrEdQuiz2ChartPitchStep({
  step,
  onContinue,
  canContinue,
}) {
  const src = step.imageSrc || "/ed-1/directmax-chart.jpg";
  const alt =
    step.imageAlt ||
    "Comparison chart: onset time for DirectMax, Tadalafil, and Sildenafil";
  const titleLine =
    step.titleLine || step.headline || "Get Hard";
  const subtitleBefore =
    step.subtitleBefore !== undefined ? step.subtitleBefore : "in just ";
  const subtitleHighlight =
    step.subtitleHighlight !== undefined ? step.subtitleHighlight : "15";
  const subtitleAfter =
    step.subtitleAfter !== undefined ? step.subtitleAfter : " minutes.";

  const hasCustomSubtitleLine =
    typeof step.subtitleLine === "string" && step.subtitleLine.trim().length > 0;

  const disclaimer =
    step.disclaimer ||
    "*On average, after medication dissolves. Based on a customer survey of active DirectMax patients.";

  return (
    <section className="mx-auto max-w-6xl pb-16 pt-4 md:pt-8">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-center lg:gap-12">
        <div className="relative w-full shrink-0 lg:w-[46%]">
          <div className="overflow-hidden rounded-3xl bg-[#0d1728] shadow-[0_20px_50px_-18px_rgba(13,23,40,0.28)] ring-1 ring-black/15">
            <img
              src={src}
              alt={alt}
              className="h-auto w-full object-cover"
              width={920}
              height={920}
            />
          </div>
        </div>

        <div className="flex w-full flex-col lg:w-[54%] lg:justify-center">
          <h2 className="headers-font text-center text-4xl font-black leading-[1.05] tracking-tight text-[#0d1728] sm:text-5xl md:text-left md:text-[3.25rem] lg:text-[3.75rem]">
            {titleLine}
          </h2>
          <p className="headers-font mt-2 text-center text-2xl font-black leading-tight text-[#0d1728] sm:text-3xl md:text-left md:text-[2rem] lg:text-[2.35rem]">
            {hasCustomSubtitleLine ? (
              step.subtitleLine
            ) : (
              <>
                {subtitleBefore}
                <span className="text-[#AE7E56]">{subtitleHighlight}</span>
                {subtitleAfter}
              </>
            )}
          </p>

          {disclaimer ? (
            <p className="poppins-font mt-8 text-center text-[11px] leading-relaxed text-[#1c1b19]/60 md:text-left md:text-xs">
              {disclaimer}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => onContinue?.()}
            disabled={!canContinue}
            className="headers-font relative mx-auto mt-10 flex w-full max-w-xl items-center justify-center overflow-hidden rounded-full bg-gradient-to-b from-[#2d2c2a] to-[#141312] px-6 py-4 text-base font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50 md:mx-0 md:rounded-3xl"
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
