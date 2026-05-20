import Link from "next/link";
import ScrollReveal from "@/components/animations/ScrollReveal";

const GLP1StatsSection = ({ ctaHref = "#" }) => {
  return (
    <div className="flex flex-col md:flex-row items-start gap-8 md:gap-16">
      {/* Left: Heading */}
      <ScrollReveal className="w-full md:w-1/2">
        <h2 className="headers-font text-black text-[36px] md:text-[48px] leading-[115%] tracking-[-0.72px] md:tracking-[-0.96px]">
          The results speak for themselves.
        </h2>
      </ScrollReveal>

      {/* Right: Description + CTA */}
      <ScrollReveal delay={0.15} className="w-full md:w-1/2">
        <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[16px] md:text-[18px] font-[400] leading-[160%] mb-6">
          Sometimes you have to see it to believe it. GLP-1 medication can be{" "}
          <span className="text-[#AE7E56] font-[600]">life-changing</span> and
          improves mood, sleep, energy and longevity. Results are from MyRocky
          patients.
        </p>
        <Link
          href={ctaHref}
          className="bg-black text-white rounded-full inline-flex items-center justify-center px-8 h-[48px] text-[14px] font-[600] tracking-[0.5px] uppercase"
        >
          I&apos;m Ready, Let&apos;s Go
        </Link>
      </ScrollReveal>
    </div>
  );
};

export default GLP1StatsSection;
