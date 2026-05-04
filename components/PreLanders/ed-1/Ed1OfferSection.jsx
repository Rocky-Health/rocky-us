import Image from "next/image";
import Link from "next/link";

/** Closing offer block for `/ed-1` — regular page section (not the page hero). */
export default function Ed1OfferSection({
  ctaHref = "/ed-pre-consultation-quiz",
  ctaLabel = "Order Now",
  label = "Get started",
  titleBefore = "Ready for the best sex of your life?",
  titleAccent = "Get 33% OFF",
  titleAfter = "your prescription instantly!",
  description = "It's not cheating — it's science. Get the highest rated 3-in-1 fast-acting ED medication delivered discreetly in 1-2 days.",
  imageSrc = "/ed-1/4tabs.png",
  imageAlt = "ED medication",
}) {
  return (
    <section
      className="relative bg-black text-white"
      aria-labelledby="ed1-offer-heading"
    >
      <div className="mx-auto max-w-3xl px-6 py-24 text-center md:px-8">
        <div className="relative mx-auto mb-4 w-full max-w-xs">
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={320}
            height={208}
            className="mx-auto h-auto w-full object-contain drop-shadow-2xl"
          />
        </div>

        <p className="poppins-font mb-4 text-sm font-semibold uppercase tracking-wider text-[#AE7E56]">
          {label}
        </p>

        <h2
          id="ed1-offer-heading"
          className="headers-font mb-4 w-full text-[51px] font-bold leading-[1] tracking-[-0.02em] text-white md:mx-auto md:max-w-2xl md:text-[48px] md:leading-[1.12]"
        >
          {titleBefore} <span className="text-[#AE7E56]">{titleAccent}</span>{" "}
          {titleAfter}
        </h2>

        <p className="poppins-font mx-auto mb-8 max-w-md text-[14.5px] font-normal leading-relaxed text-white/85 md:max-w-lg md:text-base md:leading-[1.55]">
          {description}
        </p>

        <Link
          href={ctaHref}
          className="headers-font inline-block rounded-full bg-white px-8 py-4 text-lg font-bold text-black transition-colors duration-200 hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#AE7E56]"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
