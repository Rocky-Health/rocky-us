import Link from "next/link";
import Section from "@/components/utils/Section";

/**
 * Bottom funnel CTA — gradient band, headline + promo, primary link.
 */
export default function DmOffersGetStartedCtaSection({
    getStartedHref = "/glp1-pre-consultation-3",
    eyebrow = "GET STARTED",
}) {
    return (
        <Section bg="bg-[linear-gradient(120deg,#f6ea75_0%,#e7c48a_35%,#cb9468_68%,#b27856_100%)] bg-[length:180%_180%]">
            <div className="mx-auto flex  flex-col items-center  text-center ">
                <p className="font-poppins  font-semibold uppercase tracking-[0.02em] text-neutral-800 text-sm">
                    {eyebrow}
                </p>
                <h2 className="headers-font mt-5 text-balance  font-bold leading-[1.12] text-neutral-950 md:mt-6 text-5xl md:leading-[1.08] lg:text-[3.35rem]">
                    Ready to stop food cravings?{" "}
                    <br className="md:block hidden" />
                    get $150 off your <br className="md:block hidden" />{" "}
                    prescription instantly!
                </h2>
                <p className="font-poppins text-gray-600 max-w-[460px] mx-auto sm:mt-8 mt-6 sm:text-base text-sm">
                    It&apos;s not cheating, it&apos;s science! Lose up to 15% of
                    your body weight (1-2 lbs per week) with medically
                    supervised safe &amp; effective treatment from the comfort
                    of your home.*
                </p>
                <Link
                    href={getStartedHref}
                    className="mt-8 inline-flex min-w-[180px] items-center justify-center rounded-full bg-black sm:px-10 px-4 py-3.5 font-poppins text-[15px] font-semibold text-white transition-colors hover:bg-neutral-800 md:mt-10"
                >
                    Get started
                </Link>
            </div>
        </Section>
    );
}
