"use client";

import Link from "next/link";
import CustomImage from "@/components/utils/CustomImage";
import { productTiers } from "./data";
import ScrollReveal from "@/components/animations/ScrollReveal";

const TierCard = ({ tier, ctaHref }) => {
  return (
    <div className="w-full rounded-2xl border border-[#E2E2E1] bg-white overflow-visible">
      {/* Product Image */}
      <div className="relative w-full h-[300px] md:h-[380px] bg-[#F0EEEA] rounded-t-2xl overflow-visible">
        <div className="absolute inset-0 -top-10 -left-4 -right-4 flex items-center justify-center">
          <CustomImage
            src={tier.image}
            alt={tier.name}
            width={320}
            height={400}
            className="object-contain drop-shadow-lg"
          />
        </div>
        {tier.inStock && (
          <span className="absolute top-4 left-4 bg-[#4CAF50] text-white text-[12px] font-[600] px-3 py-1 rounded-md z-10">
            In Stock
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-6 md:p-8 text-center">
        <h3 className="headers-font text-black text-[24px] md:text-[28px] leading-[115%] mb-2">
          {tier.name}
        </h3>
        <p className="poppins-font text-[rgba(0,0,0,0.60)] text-[16px] font-[400] mb-4">
          {tier.subtitle}
        </p>
        <p className="poppins-font text-[16px] font-[400] mb-6">
          Starting at{" "}
          <span className="text-[#AE7E56] font-[700] text-[32px] md:text-[40px] headers-font">
            ${tier.price}
          </span>
        </p>
        <Link
          href={ctaHref}
          className="bg-black text-white rounded-full w-full h-[52px] text-[14px] font-[600] tracking-[0.5px] uppercase flex items-center justify-center"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

const GLP1ProductTiers = ({ ctaHref = "#" }) => {
  return (
    <div className="text-center">
      <ScrollReveal>
        <h2 className="headers-font text-black text-[36px] md:text-[48px] leading-[115%] tracking-[-0.72px] md:tracking-[-0.96px] mb-1">
          Trusted by experts.
        </h2>
        <h2 className="headers-font text-[#AE7E56] text-[36px] md:text-[48px] leading-[115%] tracking-[-0.72px] md:tracking-[-0.96px] italic mb-4 md:mb-6">
          priced for you.
        </h2>
        <p className="poppins-font text-[rgba(0,0,0,0.70)] text-[16px] md:text-[18px] font-[400] leading-[140%] mb-10 md:mb-14 max-w-[700px] mx-auto">
          Find the right GLP-1 medication with the confidence that comes from
          knowing it is{" "}
          <span className="text-[#AE7E56] font-[500]">doctor-approved</span> and
          budget-friendly.
        </p>
      </ScrollReveal>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-[900px] mx-auto">
        {productTiers.map((tier, index) => (
          <ScrollReveal key={index} delay={index * 0.15}>
            <TierCard tier={tier} ctaHref={ctaHref} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  );
};

export default GLP1ProductTiers;
