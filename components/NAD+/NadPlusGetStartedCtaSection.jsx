import Link from "next/link";
import Section from "@/components/utils/Section";

/**
 * Bottom funnel CTA — gradient band, headline + promo, primary link.
 */
export default function NadPlusGetStartedCtaSection({
    getStartedHref = "/nad-plus-quiz",
    eyebrow = "GET STARTED",
}) {
    return (
        <Section bg="bg-desktop-aging-gradient md:bg-[linear-gradient(120deg,#F5F4EF_0%,#EFE5DC_40%,#BCA889_75%,#AE7E56_100%)]">
            <div className="mx-auto flex  flex-col items-center  text-center ">
                <p className="font-poppins  font-semibold uppercase tracking-[0.02em] text-neutral-800 text-sm">
                    {eyebrow}
                </p>
                <h2 className="headers-font mt-5 text-balance  font-bold leading-[1.12] text-neutral-950 md:mt-6 text-5xl md:leading-[1.08] lg:text-[3.35rem]">
                    Ready to Elevate Your Energy?
                    <br className="md:block hidden" />
                    Get up to $100 OFF your
                    <br className="md:block hidden" /> prescription instantly!
                </h2>
                <p className="font-poppins text-gray-600 max-w-[460px] mx-auto sm:mt-8 mt-6 sm:text-base text-sm">
                    It&apos;s not cheating, it&apos;s science! Reclaim your
                    youth with medically supervised safe &amp; effective
                    treatment from the comfort of your home.
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
