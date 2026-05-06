"use client";

function PhysiciansCaptionText({ text }) {
  const idx = text.indexOf(" Certified");
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <br />
      {text.slice(idx + 1)}
    </>
  );
}

function LockIcon({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
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

export default function PrEdQuiz2HealthInfoIntroStep({
  step,
  onContinue,
  canContinue,
}) {
  const src =
    step.imageSrc || "/ed-1/dr1.jpg";
  const alt = step.imageAlt || "Physician";
  const caption =
    step.imageCaption || "All medications prescribed by Certified Physicians.";
  const headline =
    step.headline || "Looking great! Let's get some info about your health.";
  const body =
    step.body ||
    "Our board-certified physicians use the information in the following questions to tailor your treatment.";
  const privacy =
    step.privacyNotice || "Your answers are private and HIPAA protected.";

  return (
    <section className="mx-auto max-w-6xl pb-16 pt-6">
      <div className="flex flex-col items-center gap-8 md:flex-row md:gap-14">
        <div className="relative hidden w-full shrink-0 md:block md:w-5/12">
          <img
            src={src}
            alt={alt}
            className="w-full max-h-[520px] rounded-3xl object-cover object-top shadow-2xl"
          />
          <div
            className="absolute bottom-4 right-4 max-w-xs rounded-xl px-4 py-3 text-right backdrop-blur-[8px]"
            style={{ background: "rgba(255,255,255,0.72)" }}
          >
            <p className="text-xs font-semibold leading-snug text-[#171d2c]">
              <PhysiciansCaptionText text={caption} />
            </p>
          </div>
        </div>

        <div className="w-full md:w-7/12">
          <h2 className="mb-8 text-center md:text-left">
            <span className="headers-font block text-3xl font-black leading-tight text-[#171d2c] md:text-5xl">
              {headline}
            </span>
          </h2>

          <div className="relative mb-6 block md:hidden">
            <img
              src={src}
              alt={alt}
              className="h-auto w-full max-h-[min(520px,68svh)] rounded-3xl object-cover object-top shadow-2xl"
            />
            <div
              className="absolute bottom-4 right-4 max-w-xs rounded-xl px-4 py-3 text-right backdrop-blur-[8px]"
              style={{ background: "rgba(255,255,255,0.72)" }}
            >
              <p className="text-xs font-semibold leading-snug text-[#171d2c]">
                <PhysiciansCaptionText text={caption} />
              </p>
            </div>
          </div>

          <p className="mb-8 text-2xl text-gray-500">{body}</p>

          <div className="mb-6 flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3">
            <LockIcon className="h-[1.125rem] w-[1.125rem] shrink-0 text-[#5c6577]" />
            <p className="text-sm font-semibold text-[#5c6577]">{privacy}</p>
          </div>

          <button
            type="button"
            onClick={() => onContinue?.()}
            disabled={!canContinue}
            className="headers-font relative flex w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#2d2c2a] to-[#141312] px-6 py-4 font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
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
