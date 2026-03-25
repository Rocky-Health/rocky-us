import Link from "next/link";
import CustomImage from "@/components/utils/CustomImage";
import ScrollReveal from "@/components/animations/ScrollReveal";

const GLP1MetabolismSection = ({ ctaHref = "#" }) => {
  return (
    <ScrollReveal className="bg-[#F5F4EF] rounded-2xl md:rounded-3xl overflow-hidden">
      <div className="flex flex-col md:flex-row items-center">
        {/* Images */}
        <div className="w-full md:w-1/2 flex gap-2 md:gap-4 p-6 md:p-10">
          <div className="relative w-1/2 h-[250px] md:h-[350px] rounded-xl overflow-hidden">
            <CustomImage
              src="/bo3/gemini.png"
              alt="Couple cooking together"
              fill
              className="object-cover"
            />
          </div>
          <div className="relative w-1/2 h-[250px] md:h-[350px] rounded-xl overflow-hidden mt-6">
            <CustomImage
              src="/bo3/NDWL.jpg"
              alt="Couple relaxing on couch"
              fill
              className="object-cover object-[87%_center] md:object-[93%_center]"
            />
          </div>
        </div>

        {/* Text */}
        <div className="w-full md:w-1/2 p-6 md:p-10 md:pl-4">
          <h2 className="headers-font text-black text-[32px] md:text-[42px] leading-[115%] tracking-[-0.64px] mb-4 md:mb-6">
            We will fix your broken metabolism.
          </h2>
          <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[16px] md:text-[18px] font-[400] leading-[150%] mb-6">
            Traditional diets don&apos;t work because nearly 70% of weight is{" "}
            <span className="text-[#AE7E56] font-[600]">
              genetically determined
            </span>
            . With medication, you will work{" "}
            <span className="text-[#AE7E56] font-[600]">with your body</span>{" "}
            rather than against it &ndash; to reach your goal weight and keep it
            that way.
          </p>
          <Link
            href={ctaHref}
            className="bg-black text-white rounded-full inline-flex items-center justify-center px-8 h-[48px] text-[14px] font-[600] tracking-[0.5px] uppercase"
          >
            Get Started
          </Link>
        </div>
      </div>
    </ScrollReveal>
  );
};

export default GLP1MetabolismSection;
