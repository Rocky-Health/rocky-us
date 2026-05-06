"use client";

export default function PrEdQuiz2ImageContinueStep({
  step,
  onContinue,
  canContinue,
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 pt-6">
      <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-14">
        <div className="hidden w-full shrink-0 md:block md:w-5/12">
          <img
            src={step.imageSrc}
            alt={step.imageAlt || "Question image"}
            className="w-full max-h-[520px] rounded-3xl object-cover object-top shadow-2xl"
          />
        </div>

        <div className="w-full md:w-7/12">
          {step.headlineLines?.length ? (
            <h2 className="headers-font mb-8 text-center font-extrabold leading-tight text-[#171d2c] md:text-left">
              {step.headlineLines.map((line, idx) => (
                <span key={`${line}-${idx}`} className="block">
                  {typeof line === "string" && line.includes("91%") ? (
                    <>
                      <span
                        className="inline"
                        style={{ fontSize: "clamp(3.5rem, 8vw, 6rem)" }}
                      >
                        91%
                      </span>
                      <span
                        className="inline"
                        style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
                      >
                        {" "}
                        {line.replace("91%", "").trim()}
                      </span>
                    </>
                  ) : (
                    <span style={{ fontSize: "clamp(1.75rem, 4vw, 3rem)" }}>
                      {line}
                    </span>
                  )}
                </span>
              ))}
            </h2>
          ) : null}

          <div className="mb-6 block md:hidden">
            <img
              src={step.imageSrc}
              alt={step.imageAlt || "Question image"}
              className="h-auto max-h-[520px] w-full rounded-3xl object-cover object-top shadow-2xl"
            />
          </div>

          {step.footnote ? (
            <p className="poppins-font mb-6 block text-left text-sm text-[#0d1728]/70 md:hidden">
              {step.footnote}
            </p>
          ) : null}

          <button
            type="button"
            onClick={() => onContinue?.()}
            disabled={!canContinue}
            className="headers-font block w-full rounded-full bg-[#1c1b19] px-6 py-4 text-lg font-semibold text-white transition-colors duration-200 hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {step.ctaLabel || "Continue"}
          </button>

          {step.footnote ? (
            <p className="poppins-font mt-6 hidden text-left text-sm text-[#0d1728]/70 md:block">
              {step.footnote}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
