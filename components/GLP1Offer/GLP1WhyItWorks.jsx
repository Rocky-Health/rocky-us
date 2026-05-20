import { whyItWorksStats } from "./data";
import ScrollReveal from "@/components/animations/ScrollReveal";
import CountUp from "@/components/animations/CountUp";

const parseStatValue = (value) => {
  const match = value.match(/^([\d.]+)(.*)/);
  if (match) return { number: parseFloat(match[1]), suffix: match[2] };
  return null;
};

const GLP1WhyItWorks = () => {
  return (
    <div className="text-center">
      <ScrollReveal>
        <h2 className="headers-font text-black text-[32px] md:text-[48px] leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] mb-4">
          Why are so many patients signing up for MyRocky?{" "}
          <span className="text-[#AE7E56]">It works.</span>
        </h2>
        <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[16px] md:text-[18px] font-[400] leading-[140%] mb-10 md:mb-14">
          On average, patients in the MyRocky program lose 15-20% of their body
          weight.
        </p>
      </ScrollReveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {whyItWorksStats.map((stat, index) => {
          const parsed = parseStatValue(stat.value);
          return (
            <ScrollReveal
              key={index}
              delay={index * 0.1}
              className="bg-[#F5E6DA] rounded-2xl p-6 md:p-8 flex flex-col items-center text-center"
            >
              <span className="headers-font text-[40px] md:text-[56px] text-[#AE7E56] leading-[100%] mb-3">
                {parsed ? (
                  <CountUp end={parsed.number} suffix={parsed.suffix} />
                ) : (
                  stat.value
                )}
              </span>
              <span className="poppins-font text-[13px] md:text-[14px] text-black font-[400] leading-[140%]">
                {stat.label}
              </span>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
};

export default GLP1WhyItWorks;
