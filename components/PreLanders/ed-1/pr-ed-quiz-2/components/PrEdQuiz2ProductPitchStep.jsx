"use client";

function iconClass() {
  return "h-5 w-5 shrink-0 text-[#AE7E56]";
}

function FlameIcon({ className = iconClass() }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 2c0 5 8 8 8 14a8 8 0 01-16 0c0-4 6-9 8-14z" />
    </svg>
  );
}

function CompassIcon({ className = iconClass() }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m15.5 8.5-3 7-1-3.5L8 11l7.5-2.5z"
      />
    </svg>
  );
}

function ClockIcon({ className = iconClass() }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" d="M12 7v6l3 2" />
    </svg>
  );
}

function BoltIcon({ className = iconClass() }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  );
}

function TruckIcon({ className = iconClass() }) {
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
        d="M14 18V6a1 1 0 00-1-1H4a1 1 0 00-1 1v11a1 1 0 001 1h1m12-1h1m-6 0a2 2 0 104 0m-5 0a2 2 0 11-4 0m5 0V9a1 1 0 011-1h2.293a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V18a1 1 0 01-1 1h-1"
      />
    </svg>
  );
}

function CheckCircleIcon({ className = iconClass() }) {
  return (
    <svg
      className={className}
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

const FEATURE_ICONS = {
  flame: FlameIcon,
  compass: CompassIcon,
  clock: ClockIcon,
  bolt: BoltIcon,
};

const FOOTER_ICONS = {
  truck: TruckIcon,
  bolt: BoltIcon,
  check: CheckCircleIcon,
};

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

export default function PrEdQuiz2ProductPitchStep({
  step,
  onContinue,
  canContinue,
}) {
  const src = step.imageSrc || "/ed-1/direct-max-pack.jpg";
  const alt =
    step.imageAlt || "DirectMax ED medication — product packaging overview";
  const headline =
    step.headline ||
    "Meet the highest rated ED treatment loved by over 175K+ men";
  const brandName = step.brandName || "DirectMax";
  const subHeadRest =
    step.subHeadRest ||
    " 3-in-1 fast-acting ED medication delivered discreetly in 1-2 days.";

  const features = Array.isArray(step.features)
    ? step.features
    : [
        {
          icon: "flame",
          before: "Apomorphine ",
          highlight: "to boost arousal",
        },
        {
          icon: "compass",
          before: "Sildenafil ",
          highlight: "to get harder faster",
        },
        {
          icon: "clock",
          before: "Tadalafil ",
          highlight: "to stay hard longer",
        },
        {
          icon: "bolt",
          before: "",
          highlight: "Effects in 15 minutes or less",
          trailing: "*",
        },
      ];

  const footerItems = Array.isArray(step.footerItems)
    ? step.footerItems
    : [
        { icon: "truck", label: "Fast Free Shipping" },
        { icon: "bolt", label: "Longer Bigger Faster" },
        { icon: "check", label: "3x better than Viagra®" },
      ];

  const disclaimer =
    step.disclaimer || "*Individual results may vary; not a clinical claim.";

  return (
    <section className="mx-auto max-w-6xl pb-16 pt-4 md:pt-8">
      <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch lg:gap-12">
        <div className="relative w-full shrink-0 lg:w-[44%]">
          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_20px_50px_-18px_rgba(13,23,40,0.18)] ring-1 ring-[#AE7E56]/25">
            <img
              src={src}
              alt={alt}
              className="h-auto w-full object-cover"
              width={800}
              height={800}
            />
          </div>
        </div>

        <div className="flex w-full flex-col lg:w-[56%] lg:justify-center">
          <h2 className="headers-font text-center text-3xl font-black leading-[1.12] text-[#0d1728] md:text-left md:text-4xl lg:text-[2.35rem] lg:leading-tight">
            {headline}
          </h2>

          <p className="poppins-font mt-5 text-center text-base leading-relaxed text-[#1c1b19] md:text-left md:text-lg">
            <span className="font-semibold text-[#AE7E56]">{brandName}</span>
            {subHeadRest}
          </p>

          <ul className="mt-8 flex flex-col gap-3">
            {features.map((row) => {
              const Icon = FEATURE_ICONS[row.icon] || FlameIcon;
              return (
                <li
                  key={`${row.icon}-${row.highlight || row.before}`}
                  className="poppins-font flex items-center gap-3 rounded-full border border-[#1c1b19]/15 bg-white px-4 py-3.5 text-left text-sm text-[#1c1b19] shadow-sm ring-1 ring-black/[0.03] md:text-base"
                >
                  <Icon />
                  <span>
                    {row.before}
                    {row.highlight ? (
                      <span className="font-semibold text-[#AE7E56]">
                        {row.highlight}
                      </span>
                    ) : null}
                    {row.trailing ? (
                      <span className="text-[#1c1b19]/80">{row.trailing}</span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            onClick={() => onContinue?.()}
            disabled={!canContinue}
            className="headers-font relative mt-10 flex w-full items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#2d2c2a] to-[#141312] px-6 py-4 text-base font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{step.ctaLabel || "Continue"}</span>
            <span className="ml-3 inline-flex" aria-hidden>
              <ContinueArrowIcon />
            </span>
          </button>

          {footerItems.length > 0 ? (
            <div className="mt-10 grid grid-cols-1 gap-6 border-t border-[#1c1b19]/10 pt-8 sm:grid-cols-3">
              {footerItems.map((item) => {
                const FI = FOOTER_ICONS[item.icon] || TruckIcon;
                return (
                  <div
                    key={item.label}
                    className="flex flex-col items-center gap-2 text-center"
                  >
                    <FI className="h-6 w-6 text-[#AE7E56]" />
                    <p className="poppins-font text-xs font-medium leading-snug text-[#1c1b19] md:text-sm">
                      {item.label}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : null}

          {disclaimer ? (
            <p className="poppins-font mt-6 text-center text-xs text-[#1c1b19]/55 md:text-left">
              {disclaimer}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
