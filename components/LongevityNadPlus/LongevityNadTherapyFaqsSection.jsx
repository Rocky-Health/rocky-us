import Link from "next/link";
import NadPlusFaqItem from "./NadPlusFaqItem";
import { nadPlusFaqs } from "./data/longevityNadPlusData";
import { FaArrowRightLong } from "react-icons/fa6";

export default function LongevityNadTherapyFaqsSection({
  faqs = nadPlusFaqs,
  ctaHref = "/nad-consultation-quiz",
  ctaText = "Start Your Free Assessment",
  onCtaClick,
  isCtaLoading = false,
}) {
  return (
    <section className="bg-white w-full py-14 md:py-24">
      <div className="max-w-[1200px] mx-auto px-5">
        <div className="grid md:grid-cols-[minmax(0,360px)_1fr] lg:grid-cols-[minmax(0,400px)_1fr] gap-10 lg:gap-24 items-start">
          <div className="flex flex-col gap-3">
            <p className="dm-mono-font text-[12px] md:text-[14px] uppercase tracking-wide text-black font-medium">
              Got questions?
            </p>
            <h2 className="helvetica-display-font text-[40px] md:text-[48px] font-medium leading-[1.1] tracking-[-0.4px] md:tracking-[-0.48px] text-black">
              Frequently <br className="" /> Asked Questions.
            </h2>
            <p className="helvetica-text-font text-[14px] md:text-[16px] leading-[1.4] tracking-[-0.28px] md:tracking-[-0.32px]">
              Everything you need to know about NAD+.
            </p>
            {onCtaClick ? (
              <button
                type="button"
                onClick={onCtaClick}
                disabled={isCtaLoading}
                className="dm-mono-font  items-center justify-center self-start gap-2 py-2.5 px-10 rounded-full bg-black text-white text-base font-medium hover:bg-gray-800 transition-all mt-3 duration-300 uppercase md:inline-flex hidden disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ wordSpacing: "0.25em" }}
              >
                {ctaText} <FaArrowRightLong />
              </button>
            ) : (
              <Link
                href={ctaHref}
                className="dm-mono-font  items-center justify-center self-start gap-2 py-2.5 px-10 rounded-full bg-black text-white text-base font-medium hover:bg-gray-800 transition-all mt-3 duration-300 uppercase md:inline-flex hidden"
                style={{ wordSpacing: "0.25em" }}
              >
                {ctaText} <FaArrowRightLong />
              </Link>
            )}
          </div>

          <div>
            {faqs.map((faq, index) => (
              <NadPlusFaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                defaultOpen={index === 0}
              />
            ))}
          </div>

          {onCtaClick ? (
            <button
              type="button"
              onClick={onCtaClick}
              disabled={isCtaLoading}
              className="dm-mono-font inline-flex items-center justify-center self-start gap-2 py-2.5 px-10 rounded-full bg-black text-white text-base font-medium hover:bg-gray-800 transition-all mt-3 duration-300 uppercase w-full md:hidden disabled:opacity-70 disabled:cursor-not-allowed"
              style={{ wordSpacing: "0.25em" }}
            >
              {ctaText} <FaArrowRightLong />
            </button>
          ) : (
            <Link
              href={ctaHref}
              className="dm-mono-font inline-flex items-center justify-center self-start gap-2 py-2.5 px-10 rounded-full bg-black text-white text-base font-medium hover:bg-gray-800 transition-all mt-3 duration-300 uppercase w-full md:hidden"
              style={{ wordSpacing: "0.25em" }}
            >
              {ctaText} <FaArrowRightLong />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
