"use client";

function StepPill({ step, wrapperClassName = "mb-5" }) {
  return (
    <div
      className={`${wrapperClassName} w-full rounded-full bg-[#ECE9E2] p-1 ring-1 ring-black/10`}
    >
      <div className="grid grid-cols-4 gap-1 text-center text-xs font-semibold poppins-font">
        {["01", "02", "03", "04"].map((label, i) => {
          const isActive = i === step;
          return (
            <div
              key={label}
              className={`rounded-full py-2 ${
                isActive
                  ? "bg-[#AE7E56] font-extrabold text-white"
                  : "text-black/50"
              }`}
            >
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Ed1QuestionCard({
  step,
  question,
  selected,
  onSelect,
  variant = "flow",
  flowDesktopHeightClass = "lg:h-[615px]",
}) {
  const isHeroVariant = variant === "hero";

  return (
    <article
      className={
        isHeroVariant
          ? "mx-auto w-full max-w-md rounded-3xl bg-white px-4 py-8 text-center shadow-2xl md:px-8 lg:mx-0 lg:h-[480px] lg:max-w-none lg:w-[448px] lg:rounded-2xl lg:p-8 lg:shadow-sm lg:ring-1 lg:ring-black/5"
          : `rounded-3xl bg-white px-4 py-16 text-center shadow-md md:px-8 md:py-24 lg:w-[976px] ${flowDesktopHeightClass}`
      }
    >
      <div
        className={
          isHeroVariant
            ? "mx-auto w-full"
            : "mx-auto flex h-full w-full max-w-md flex-col p-1"
        }
      >
        {isHeroVariant ? (
          <StepPill step={step} wrapperClassName="mb-7 lg:mb-5" />
        ) : (
          <StepPill step={step} />
        )}

        <h3
          className={`headers-font text-center text-[#0d1728] ${
            isHeroVariant
              ? "pb-4 text-2xl font-extrabold leading-snug md:text-3xl"
              : "mb-6 min-h-[84px] text-2xl font-extrabold leading-snug md:min-h-[96px] md:text-3xl"
          }`}
        >
          {question.title}
        </h3>

        <div className="space-y-4">
          {question.options.map((option) => {
            const isSelected = selected === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => onSelect(option)}
                className={`poppins-font flex h-14 w-full items-center justify-center rounded-2xl text-base font-medium transition-colors duration-200 ${
                  isSelected
                    ? "bg-[#AE7E56] text-white"
                    : "bg-[#ECE9E2] text-[#1b2431] hover:bg-[#E3D8CC] hover:text-[#111827]"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          className={`w-full text-center underline underline-offset-2 hover:text-[#AE7E56] ${
            isHeroVariant
              ? "headers-font mt-6 text-base font-semibold text-[#111827]"
              : "headers-font mt-6 text-base font-semibold text-[#111827] md:mt-auto"
          }`}
        >
          Skip and start online visit
        </button>
      </div>
    </article>
  );
}
