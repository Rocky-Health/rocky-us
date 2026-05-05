import { whyItWorksStats } from "@/components/GLP1Offer/data";
import ScrollReveal from "@/components/animations/ScrollReveal";
import CountUp from "@/components/animations/CountUp";

const parseStatValue = (value) => {
    const match = value.match(/^([\d.]+)(.*)/);
    if (match) return { number: parseFloat(match[1]), suffix: match[2] };
    return null;
};

const MedViWhyItWorks = () => {
    return (
        <div className="text-center">
            <ScrollReveal>
                <h2 className="headers-font text-black sm:text-[28px] text-[24px] leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] mb-4">
                    Why are so many patients signing up for Rocky?{" "}
                    <span className="text-[#AE7E56] font-[600]">It works.</span>
                </h2>
                <p className="poppins-font text-[rgba(0,0,0,0.70)] text-sm font-[400] leading-[140%] mb-10">
                    On average, patients in the Rocky program lose 15-20% of
                    their body weight.
                </p>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {whyItWorksStats.map((stat, index) => {
                    const parsed = parseStatValue(stat.value);
                    return (
                        <ScrollReveal
                            key={index}
                            delay={index * 0.1}
                            className="bg-[#AE7E5622] sm:rounded-[36px] rounded-xl sm:p-10 px-4 py-6 flex sm:flex-col sm:justify-center items-center sm:text-center gap-2 sm:gap-0"
                        >
                            <span className="headers-font text-[40px] md:text-[56px] text-[#AE7E56] leading-[100%] sm:mb-3 sm:min-w-auto min-w-24 text-start sm:text-center">
                                {parsed ? (
                                    <CountUp
                                        end={parsed.number}
                                        suffix={parsed.suffix}
                                    />
                                ) : (
                                    stat.value
                                )}
                            </span>
                            <span className="poppins-font text-[13px] md:text-[14px] text-black font-[400] leading-[140%] tracking-wide text-start sm:text-center">
                                {stat.label}
                            </span>
                        </ScrollReveal>
                    );
                })}
            </div>
        </div>
    );
};

export default MedViWhyItWorks;
