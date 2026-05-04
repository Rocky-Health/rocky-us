import Image from "next/image";
import Link from "next/link";

/**
 * `/ed-1` only — cream + gold palette site-wide.
 * Mobile: centered stack + lifestyle below CTA; tabs graphic hidden until `lg`.
 * Desktop: two columns + overlapping tabs on the left.
 */
export default function Ed1DirectMaxHighlightSection({
  ctaHref = "/ed-pre-consultation-quiz",
  ctaLabel = "Order Now",
  headlineHighlight = "Max performance",
  headlineAfter = "shipped in 1-2 days.",
  subheadline = "A triple-action formula built to boost arousal, get you harder fast, and help you stay ready longer.",
  pillsImageSrc = "/ed-1/direct-max-tabs-2.png",
  pillsImageAlt = "Direct Max Tabs",
  lifestyleImageSrc = "/ed-1/directmax-lifestyle1.jpg",
  lifestyleImageAlt = "DirectMax in a real-life setting",
}) {
  return (
    <section
      className="relative overflow-visible border-t-[12px] border-solid border-[#AE7E56] bg-[#F5F4EF]"
      aria-labelledby="ed1-directmax-highlight-heading"
    >
      {/* Tabs graphic: `lg+` only — hidden on mobile */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden px-5 md:px-8 lg:block lg:px-10">
        <div className="mx-auto flex w-full max-w-[1440px] -translate-y-1/2 justify-start">
          <div className="relative mt-2 overflow-visible lg:mt-2">
            <Image
              src={pillsImageSrc}
              alt={pillsImageAlt}
              width={534}
              height={393}
              sizes="(max-width: 1024px) 90vw, 534px"
              className="relative z-10 h-auto w-full max-w-[533.5px] max-h-[392.56px] object-contain object-left drop-shadow-2xl lg:translate-y-2"
              loading="lazy"
            />
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 gap-8 px-5 py-24 md:gap-10 md:px-8 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-14 lg:px-10 lg:pb-20 lg:pt-[clamp(9rem,14vw,13rem)] xl:gap-16">
        <div className="mx-auto min-w-0 max-w-xl text-center md:text-left lg:mx-0 lg:max-w-none">
          <h2
            id="ed1-directmax-highlight-heading"
            className="headers-font mb-6 text-balance text-4xl font-extrabold leading-[1] tracking-tight md:text-6xl md:leading-[1]"
          >
            <span className="text-[#AE7E56]">{headlineHighlight}</span>{" "}
            <span className="text-black">{headlineAfter}</span>
          </h2>
          <p className="poppins-font mx-auto mb-4 max-w-xl text-lg font-semibold leading-snug text-black/90 md:mx-0 md:text-xl md:font-normal md:leading-snug">
            {subheadline}
          </p>
          <p className="poppins-font mx-auto mb-8 max-w-xl text-base font-normal leading-relaxed text-black/80 md:mx-0">
            DirectMax is a prescription-only, doctor-reviewed ED solution
            designed for men who want results—not guesswork. Its
            three-ingredient approach supports arousal and response from
            multiple angles, helping you get harder faster, stay ready longer,
            and feel more confident when it matters. With{" "}
            <span className="headers-font font-semibold text-black">
              Rapid Dissolve Tablets
            </span>
            , discreet delivery, and a simple online visit, you can upgrade your
            performance without awkward appointments or pharmacy lines.
          </p>
          <p className="poppins-font mx-auto mb-4 max-w-xl text-lg font-medium text-black md:mx-0 md:text-xl">
            Limited Time{" "}
            <span className="font-bold text-[#AE7E56]">33% OFF</span>
          </p>
          <Link
            href={ctaHref}
            className="headers-font mx-auto inline-flex rounded-full bg-black px-8 py-4 text-lg font-bold text-white transition-colors duration-200 hover:bg-black/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AE7E56] md:mx-0"
          >
            {ctaLabel}
          </Link>
        </div>

        <div className="relative min-w-0 max-w-full overflow-hidden rounded-2xl bg-black/[0.03] shadow-lg ring-1 ring-black/5 lg:max-w-[584px]">
          <Image
            src={lifestyleImageSrc}
            alt={lifestyleImageAlt}
            width={1024}
            height={1024}
            className="h-auto w-full object-contain"
            sizes="(max-width: 1023px) 100vw, 584px"
          />
        </div>
      </div>
    </section>
  );
}
