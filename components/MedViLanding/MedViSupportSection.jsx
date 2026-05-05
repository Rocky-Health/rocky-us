import CustomImage from "@/components/utils/CustomImage";
import ScrollReveal from "@/components/animations/ScrollReveal";

const MedViSupportSection = () => {
    return (
        <ScrollReveal className="bg-[#f5f3f1] rounded-2xl md:rounded-3xl overflow-hidden md:px-28 px-4 sm:py-12 py-6">
            <div className="flex flex-col lg:flex-row items-center">
                <div className="w-full lg:w-[40%] p-6 md:p-10 md:pl-2">
                    <h2 className="headers-font text-black sm:text-[28px] text-[24px] leading-[115%] tracking-[-0.64px] mb-4 ">
                        Unlimited 24/7 support{" "}
                        <span className="text-[#AE7E56] font-[600]">
                            included
                        </span>
                        .
                    </h2>
                    <p className="poppins-font text-[rgba(0,0,0,0.70)] text-sm font-[400] leading-[150%] mb-6">
                        rather than against it &ndash; to reach your goal weight
                        and keep it that way. Rocky provides 24/7 access to a
                        dedicated team of specialists, ensuring you have the
                        support you need{" "}
                        <span className="text-[#AE7E56] font-[600]">
                            around the clock
                        </span>
                        . With unlimited appointments, messaging and support,
                        you can confidently reach out for guidance, ask
                        questions, or address concerns at any time.
                    </p>
                </div>
                <div className="w-full lg:w-[60%] flex gap-2 lg:gap-4 px-6 lg:p-10">
                    <div className="relative w-1/2 h-[200px] sm:h-[250px] lg:h-[350px] rounded-xl overflow-hidden  mt-6">
                        <CustomImage
                            src="/medvi/support-1.jpg"
                            alt="Couple cooking together"
                            fill
                            className="object-cover hover:scale-105 transition-all duration-300"
                        />
                    </div>
                    <div className="relative w-1/2 h-[200px] sm:h-[250px] lg:h-[350px] rounded-xl overflow-hidden">
                        <CustomImage
                            src="/medvi/zeplady.png"
                            alt="Couple relaxing on couch"
                            fill
                            className="object-cover object-[87%_center] lg:object-[93%_center] hover:scale-105 transition-all duration-300"
                        />
                    </div>
                </div>
            </div>
        </ScrollReveal>
    );
};

export default MedViSupportSection;
