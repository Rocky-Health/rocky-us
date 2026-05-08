import Link from "next/link";
import CustomImage from "@/components/utils/CustomImage";
import ScrollReveal from "@/components/animations/ScrollReveal";

const MedViMetabolismSection = ({ ctaHref = "#" }) => {
    return (
        <ScrollReveal className="bg-[#F5F4EF] rounded-2xl lg:rounded-3xl overflow-hidden lg:px-28 px-4 sm:py-12 py-6">
            <div className="flex flex-col lg:flex-row items-center">
                <div className="w-full lg:w-[60%] flex gap-2 lg:gap-4 px-6 lg:p-10">
                    <div className="relative w-1/2 h-[200px] sm:h-[250px] lg:h-[350px] rounded-xl overflow-hidden  lg:mt-6">
                        <CustomImage
                            src="https://myrocky.b-cdn.net/WP%20Images/wl-med/We%20will%20fix%20your%20broken%20metabolism.%20-%2002.jpg"
                            alt="Couple cooking together"
                            fill
                            className="object-cover hover:scale-105 transition-all duration-300"
                        />
                    </div>
                    <div className="relative w-1/2 h-[200px] sm:h-[250px] lg:h-[350px] rounded-xl overflow-hidden">
                        <CustomImage
                            src="https://myrocky.b-cdn.net/WP%20Images/wl-med/We%20will%20fix%20your%20broken%20metabolism.%20-%2003.jpg"
                            alt="Couple relaxing on couch"
                            fill
                            className="object-cover object-[87%_center] lg:object-[93%_center] hover:scale-105 transition-all duration-300"
                        />
                    </div>
                </div>

                <div className="w-full lg:w-[40%] p-6 lg:p-10 lg:pl-2">
                    <h2 className="headers-font text-black sm:text-[28px] text-[24px] leading-[115%] tracking-[-0.64px] mb-4 ">
                        We will fix your broken metabolism.
                    </h2>
                    <p className="poppins-font text-[rgba(0,0,0,0.70)] text-sm font-[400] leading-[150%] mb-6">
                        Traditional diets don&apos;t work because nearly 70% of
                        weight is{" "}
                        <span className="text-[#AE7E56] font-[600]">
                            genetically determined
                        </span>
                        . With medication, you will work{" "}
                        <span className="text-[#AE7E56] font-[600]">
                            with your body
                        </span>{" "}
                        rather than against it &ndash; to reach your goal weight
                        and keep it that way.
                    </p>
                    <Link
                        href={ctaHref}
                        className="bg-black text-white rounded-full inline-flex items-center justify-center px-12 py-2.5 text-[14px] font-[600] tracking-[0.5px] uppercase hover:translate-y-[-3px] transition-all duration-300 hover:shadow-xl sm:w-fit w-full"
                    >
                        Get Started
                    </Link>
                </div>
            </div>
        </ScrollReveal>
    );
};

export default MedViMetabolismSection;
