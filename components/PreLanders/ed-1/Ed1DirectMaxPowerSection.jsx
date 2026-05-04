import Image from "next/image";
import {
  FaBolt,
  FaChartLine,
  FaCheck,
  FaClock,
  FaFire,
  FaStar,
} from "react-icons/fa6";

const pillIconClass = "h-4 w-4 shrink-0 text-[#AE7E56]";

const FORMULA_PILLS = [
  {
    icon: FaFire,
    lead: "Apomorphine",
    rest: " to boost arousal",
  },
  {
    icon: FaChartLine,
    lead: "Sildenafil",
    rest: " to get harder faster",
  },
  {
    icon: FaClock,
    lead: "Tadalafil",
    rest: " to stay hard longer",
  },
  {
    icon: FaBolt,
    lead: null,
    rest: null,
    custom: (
      <>
        <span className="font-semibold text-white">Effects in 15 minutes</span>
        <span className="text-white/80"> or less*</span>
      </>
    ),
  },
];

const TRUST_CHECKS = [
  "No Heartburn",
  "Longer Bigger Faster",
  "3x Better Than Others",
];

function TrustCheckIcon() {
  return (
    <span
      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#AE7E56] text-[#1c1b19]"
      aria-hidden
    >
      <FaCheck className="h-2.5 w-2.5" strokeWidth={2.8} />
    </span>
  );
}

function RatingStars({ className = "" }) {
  return (
    <div
      className={`flex items-center gap-3 ${className}`}
      aria-label="Rated excellent 4.6 out of 5"
    >
      <span className="poppins-font text-sm font-medium text-white/90 md:text-base">
        Excellent 4.6
      </span>
      <span className="flex gap-0.5 text-emerald-500 lg:text-[#AE7E56]">
        {Array.from({ length: 5 }).map((_, i) => (
          <FaStar
            key={i}
            className="h-4 w-4 md:h-[1.125rem] md:w-[1.125rem]"
            aria-hidden
          />
        ))}
      </span>
    </div>
  );
}

/**
 * `/ed-1` — marketing strip (not the hero): headline + formula pills + product visual.
 * Palette: warm charcoal + Rocky gold `#AE7E56`.
 */
export default function Ed1DirectMaxPowerSection({
  productImageSrc = "/ed-1/directmax.png",
  productImageAlt = "DirectMax rapid dissolve packaging",
}) {
  return (
    <section
      id="ed1-directmax-power"
      className="relative overflow-x-hidden overflow-y-visible border-t border-white/10 bg-[#1c1b19] text-white"
      aria-labelledby="ed1-directmax-power-heading"
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/40" />

      <div className="relative mx-auto max-w-[1440px] px-5 py-12 md:py-16 lg:py-24">
        {/* Mobile: DirectMax | rating — matches reference header row */}
        <div className="mb-6 flex items-center justify-between gap-4 lg:hidden">
          <p className="headers-font text-lg font-semibold tracking-wide text-white">
            DirectMax
          </p>
          <RatingStars />
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,480px)] lg:items-start lg:gap-16 lg:px-5">
          <div className="min-w-0">
            <p className="headers-font mb-4 hidden text-lg font-semibold tracking-wide text-white/90 md:text-xl lg:block">
              DirectMax
            </p>

            <h2
              id="ed1-directmax-power-heading"
              className="headers-font text-balance text-center text-[2.15rem] font-bold leading-[1.08] tracking-tight text-white sm:text-[2.35rem] lg:text-left lg:text-[3.25rem] lg:leading-[1.02]"
            >
              <span className="inline lg:block">
                <span className="text-white">Stronger.</span>{" "}
                <span className="text-white">Faster.</span>
              </span>{" "}
              <span className="inline lg:mt-3 lg:block">
                <span className="text-[#AE7E56]">More Intense.</span>
              </span>
            </h2>

            <p className="poppins-font mx-auto mt-4 max-w-lg text-center text-sm font-medium uppercase tracking-[0.18em] text-white/70 lg:mx-0 lg:mt-5 lg:max-w-none lg:text-left lg:text-[0.8125rem] lg:tracking-[0.2em] lg:text-white/55">
              Fast-acting. Doctor-approved. Delivered discreetly.
            </p>

            <ul className="mx-auto mt-7 flex w-full max-w-xl flex-col gap-3 lg:mx-0 lg:mt-8 lg:max-w-xl">
              {FORMULA_PILLS.map((row) => {
                const Icon = row.icon;
                const key = row.lead ?? "effects";
                return (
                  <li
                    key={key}
                    className="poppins-font flex w-full items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] px-4 py-3.5 text-left text-sm backdrop-blur-sm sm:rounded-full md:text-[0.9375rem]"
                  >
                    <Icon className={pillIconClass} aria-hidden />
                    <span className="text-white/85">
                      {row.custom ? (
                        row.custom
                      ) : (
                        <>
                          <strong className="font-semibold text-white">
                            {row.lead}
                          </strong>
                          <span className="text-white/75">{row.rest}</span>
                        </>
                      )}
                    </span>
                  </li>
                );
              })}
            </ul>

            {/* Mobile: two trust lines on row 1, third centered below — tan chip + dark check */}
            <ul className="poppins-font mx-auto mt-6 flex max-w-md flex-wrap items-center justify-center gap-x-5 gap-y-3 text-center text-sm font-medium text-[#c9a882] lg:mx-0 lg:max-w-none lg:justify-start lg:gap-x-8 lg:text-left lg:text-[#AE7E56]">
              {TRUST_CHECKS.slice(0, 2).map((label) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <TrustCheckIcon />
                  {label}
                </li>
              ))}
              <li className="flex w-full basis-full justify-center lg:w-auto lg:basis-auto lg:justify-start">
                <span className="inline-flex items-center gap-2">
                  <TrustCheckIcon />
                  {TRUST_CHECKS[2]}
                </span>
              </li>
            </ul>

            {/* Mobile: two tabs between trust line and product card */}
            <div className="mx-auto mt-8 flex justify-center lg:hidden">
              <Image
                src="/ed-1/direct-max-tabs-2.png"
                alt="Direct Max: two fast-acting tabs"
                width={680}
                height={520}
                className="h-auto w-full max-w-[min(92vw,340px)] object-contain drop-shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>

          <div className="relative mx-auto flex w-full max-w-md flex-col items-center overflow-visible lg:mx-0 lg:max-w-none">
            <div className="mb-6 hidden w-full items-center justify-end gap-4 lg:flex">
              <RatingStars />
            </div>

            <div className="relative mt-2 w-full max-w-[420px] lg:mt-0 lg:max-w-[480px]">
              <div className="rounded-3xl bg-[#2a2826] p-5 shadow-2xl shadow-black/40 ring-1 ring-white/[0.08] sm:p-6 lg:rounded-2xl lg:bg-white/[0.04] lg:p-4 lg:ring-white/10">
                <Image
                  src={productImageSrc}
                  alt={productImageAlt}
                  width={640}
                  height={640}
                  className="mx-auto h-auto w-full max-w-[280px] object-contain sm:max-w-[320px] lg:max-w-none"
                  sizes="(min-width: 1024px) 480px, 90vw"
                  loading="lazy"
                />
              </div>
            </div>

            <p className="poppins-font mt-5 flex items-center justify-center gap-2 text-center text-sm text-white/85 lg:mt-6 lg:justify-start">
              <FaFire className="text-[#AE7E56]" aria-hidden />
              Trusted by over 175,000 customers
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
