"use client";

import Link from "next/link";
import CustomImage from "@/components/utils/CustomImage";
import { productTiers } from "@/components/MedViLanding/data";
import ScrollReveal from "@/components/animations/ScrollReveal";
import { formatPrice } from "@/utils/priceFormatter";
import ScrollArrows from "@/components/ScrollArrows";
import { useRef } from "react";
import Image from "next/image";

// const TierCard = ({ tier, ctaHref }) => {
//   return (
//     <div className="sm:min-w-[340px] min-w-[300px] w-full rounded-[40px] pb-4  overflow-visible group bg-[#F5F4EF44] shadow">
//       <div className="relative w-full h-[300px] bg-[linear-gradient(180deg,#F0EEEA_0%,#F0EEEA_60%,rgba(255,255,255,0)_60%,rgba(255,255,255,0)_100%)] rounded-t-[40px] overflow-visible">
//         <div className="absolute inset-0 -top-10 -left-4 -right-4 flex items-center justify-center">
//           <CustomImage
//             src={tier.image}
//             alt={tier.name}
//             width={400}
//             height={500}
//             className="object-contain drop-shadow-lg scale-110 group-hover:translate-y-[-16px] transition-all duration-300"
//           />
//         </div>
//         {/* {tier.inStock && (
//                     <span className="absolute top-4 left-4 bg-[#4CAF50] text-white text-[12px] font-[600] px-3 py-1 rounded-md z-10">
//                         In Stock
//                     </span>
//                 )} */}
//       </div>

//       <div className="p-6 text-center">
//         <p className="poppins-font text-[#AE7E56] text-sm font-[400] mb-2">
//           Starting at{" "}
//           <span className=" font-[500]  headers-font">
//             ${formatPrice(tier.price)}
//           </span>
//         </p>
//         <h3 className="headers-font text-black text-[24px]  leading-[115%] mb-3">
//           {tier.name}
//         </h3>
//         <p className="poppins-font text-[rgba(0,0,0,0.60)] text-sm font-[400] mb-5">
//           {tier.subtitle}
//         </p>

//         <Link
//           href={ctaHref}
//           className="bg-black text-white rounded-full w-full text-[14px] font-[600] tracking-[0.5px] uppercase flex items-center justify-center py-3 hover:translate-y-[-3px] transition-all duration-300"
//         >
//           Get Started
//         </Link>
//       </div>
//     </div>
//   );
// };

const TierCard = ({ tier, ctaHref }) => {
  return (
    // Add 'isolation-auto' to ensure a clean stacking context
    <div className="sm:min-w-[340px] min-w-[300px] w-full rounded-[40px] pb-4 overflow-visible group bg-[#F5F4EF44] shadow isolation-auto">
      <div className="relative w-full h-[300px] bg-[linear-gradient(180deg,#F0EEEA_0%,#F0EEEA_60%,rgba(255,255,255,0)_60%,rgba(255,255,255,0)_100%)] rounded-t-[40px]">
        {/* 
           FIX 1: Add 'z-10' and 'transform-gpu' to the wrapper.
           FIX 2: Remove 'overflow-visible' from this specific div if the image doesn't NEED to bleed out sides.
        */}
        <Image
          src={tier.image}
          alt={tier.name}
          width={400}
          height={500}
          // FIX 3: Added 'will-change-transform' to hint to Safari to keep this layer in memory
          // FIX 4: Replaced 'drop-shadow-lg' with a standard shadow if it still disappears
          className="object-contain drop-shadow-lg scale-110 group-hover:-translate-y-4 transition-all duration-300 transform-gpu isolate select-none"
        />
      </div>

      <div className="p-6 text-center">
        <p className="poppins-font text-[#AE7E56] text-sm font-[400] mb-2">
          Starting at{" "}
          <span className=" font-[500]  headers-font">
            ${formatPrice(tier.price)}
          </span>
        </p>
        <h3 className="headers-font text-black text-[24px]  leading-[115%] mb-3">
          {tier.name}
        </h3>
        <p className="poppins-font text-[rgba(0,0,0,0.60)] text-sm font-[400] mb-5">
          {tier.subtitle}
        </p>

        <Link
          href={ctaHref}
          className="bg-black text-white rounded-full w-full text-[14px] font-[600] tracking-[0.5px] uppercase flex items-center justify-center py-3 hover:translate-y-[-3px] transition-all duration-300"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

const MedViProductTiers = ({ ctaHref = "#" }) => {
  const scrollContainerRef = useRef(null);

  return (
    <div className=" mx-auto py-20">
      <ScrollReveal>
        <div className="flex px-5 lg:items-center justify-between lg:px-10 pb-6 lg:flex-row flex-col">
          <h2 className="headers-font text-black sm:text-[28px] text-[24px] leading-[115%] tracking-[-0.72px] md:tracking-[-0.96px] mb-1 text-start">
            Trusted by experts.
            <span className="headers-font text-[#AE7E56] leading-[115%] tracking-[-0.72px] md:tracking-[-0.96px] mb-4 md:mb-6 block">
              priced for you.
            </span>
          </h2>
          <p className="poppins-font text-[rgba(0,0,0,0.70)] text-sm font-[400] leading-[140%] mb-10 md:mb-14 lg:max-w-[660px] lg:ms-auto text-start">
            Find the right GLP-1 medication with the confidence that comes from
            knowing it is{" "}
            <span className="text-[#AE7E56] font-[500]">doctor-approved</span>{" "}
            and budget-friendly.
          </p>
        </div>
      </ScrollReveal>
      <div className="relative">
        <ScrollArrows scrollContainerRef={scrollContainerRef} />
        <div
          ref={scrollContainerRef}
          className="flex gap-2 md:gap-4 items-start overflow-x-auto snap-x snap-mandatory no-scrollbar pt-12 pb-4"
        >
          {productTiers.map((tier, index) => (
            <ScrollReveal key={index} delay={index * 0.15}>
              <TierCard tier={tier} ctaHref={ctaHref} />
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MedViProductTiers;
