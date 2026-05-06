"use client";

export default function PrEdQuiz2DisqualificationModal({
  open,
  onReviewAnswers,
  supportUrl = "https://myrocky.com/contact/",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-start overflow-y-auto bg-[linear-gradient(180deg,#1c1b19_0%,#0f0f0e_100%)] px-5 pb-12 pt-14 text-center sm:justify-center sm:pt-10"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pr-ed-dq-title"
    >
      <div className="w-full max-w-lg rounded-3xl border border-[#AE7E56]/30 bg-[#F5F4EF] px-6 py-8 text-[#0d1728] shadow-[0_24px_60px_rgba(0,0,0,0.4)] sm:px-8">
        <div className="flex flex-col items-center">
        <div
          className="mb-4 flex h-[4.25rem] w-[4.25rem] items-center justify-center rounded-full border border-[#AE7E56]/35 bg-[#F1E7DB]"
          aria-hidden
        >
          <svg
            className="h-8 w-8 text-[#AE7E56]"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <p className="poppins-font mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-[#AE7E56]">
          Disqualified
        </p>

        <h1
          id="pr-ed-dq-title"
          className="headers-font mb-4 text-3xl font-black leading-tight text-[#0d1728] sm:text-4xl"
        >
          It looks like you may not qualify for treatment.
        </h1>

        <p className="poppins-font mb-2 max-w-md text-base leading-relaxed text-[#1b2431]">
          Based on your answers, it appears that you may not be a good fit for myRocky
          treatment at this time.
        </p>
        <p className="poppins-font mb-8 max-w-md text-sm leading-relaxed text-[#4b5563]">
          If you feel this is inaccurate, please review your answers and make any necessary
          corrections.
        </p>

        <button
          type="button"
          onClick={onReviewAnswers}
          className="headers-font flex w-full max-w-md items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#2d2c2a] to-[#141312] px-6 py-4 text-base font-semibold text-white transition duration-200 hover:opacity-95"
        >
          <span className="text-lg" aria-hidden>
            ←
          </span>
          Review My Answers
        </button>

        <p className="poppins-font mt-6 max-w-md text-xs text-black/55">
          Need help?{" "}
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#AE7E56] underline underline-offset-2 transition hover:text-[#8f6645]"
          >
            Contact Rocky Support
          </a>
        </p>

        <div className="mt-6 border-t border-[#AE7E56]/20 pt-6">
          <div className="relative mx-auto h-[79px] w-[73px] overflow-hidden rounded-2xl">
            <img
              src="https://static.legitscript.com/seals/44796030.png"
              alt="LegitScript approved"
              width={73}
              height={79}
              className="h-[79px] w-[73px] object-contain opacity-95"
              loading="lazy"
            />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
