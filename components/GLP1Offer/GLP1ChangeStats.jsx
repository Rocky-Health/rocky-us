import { changeStats } from "./data";
import ScrollReveal from "@/components/animations/ScrollReveal";
import CountUp from "@/components/animations/CountUp";

const parseStatValue = (value) => {
  const match = value.match(/^([\d.]+)(.*)/);
  if (match) return { number: parseFloat(match[1]), suffix: match[2] };
  return null;
};

const GLP1ChangeStats = () => {
  return (
    <div className="text-center">
      <ScrollReveal>
        <h2 className="headers-font text-black text-[36px] md:text-[48px] leading-[115%] tracking-[-0.72px] md:tracking-[-0.96px] mb-4">
          The change we&apos;ve all been waiting for.
        </h2>
        <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[16px] md:text-[18px] font-[400] leading-[140%] mb-10 md:mb-14 max-w-[600px] mx-auto">
          Join the over 350,000+ MyRocky patients and we&apos;ll help you finally
          get real, lasting results.
        </p>
      </ScrollReveal>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
        {changeStats.map((stat, index) => {
          const parsed = parseStatValue(stat.value);
          return (
            <ScrollReveal
              key={index}
              delay={index * 0.15}
              className={`flex flex-col items-center text-center py-8 md:py-4 ${
                index < changeStats.length - 1
                  ? "border-b md:border-b-0 md:border-r border-[#E2E2E1]"
                  : ""
              }`}
            >
              <span className="headers-font text-[48px] md:text-[64px] text-[#AE7E56] leading-[100%] mb-2">
                {parsed ? (
                  <CountUp end={parsed.number} suffix={parsed.suffix} />
                ) : (
                  stat.value
                )}
              </span>
              <span className="poppins-font text-[14px] md:text-[16px] text-black font-[400] leading-[140%] max-w-[220px]">
                {stat.label}
              </span>
            </ScrollReveal>
          );
        })}
      </div>
      <p className="poppins-font text-[rgba(0,0,0,0.40)] text-[11px] font-[400] leading-[140%] mt-6">
        *Data based on clinical trials over the first 6 months of treatment.
      </p>
    </div>
  );
};

export default GLP1ChangeStats;
