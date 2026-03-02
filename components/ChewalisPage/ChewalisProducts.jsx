"use client";

import { useRef } from "react";
import EdProductCard from "../EDPlans/EdProductCard";
import ScrollArrows from "../ScrollArrows";
import CustomImage from "../utils/CustomImage";

const ChewalisProducts = () => {
  const scrollContainerRef = useRef(null);

  return (
    <>
      <div className="text-start mb-[23px] md:mb-[31px]">
        <h2 className="text-[32px] md:text-[48px] leading-[36.8px] md:leading-[53.52px] font-[550] tracking-[-0.01em] md:tracking-[-0.02em] headers-font mb-23 md:mb-[16px]">
          Still prefer Pills?
        </h2>
        <p className="text-[18px] md:text-[20px] leading-[25.2px] md:leading-[30px] font-[400] ">
          MyRocky offers access to a range of ED treatment options to suit your
          needs.
        </p>
      </div>

      <div className="overflow-x-auto !no-scrollbar relative">
        <div className="mx-auto">
          <div className="relative">
            <ScrollArrows scrollContainerRef={scrollContainerRef} />

            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-2 items-start md:gap-4 snap-x snap-mandatory no-scrollbar"
            >
              <EdProductCard product={cialisProduct} />
              <EdProductCard product={viagraProduct} />
              {/* <EdProductCard product={chewalisProduct} /> */}
              <EdProductCard product={varietyPackProduct} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-between items-start mt-[32px] md:mt-[24px]">
        <div className="w-full md:w-[584px]">
          <p className="hidden lg:block text-[12px] font-[400] text-[#212121]">
            In US, erectile dysfunction medications are available
            over-the-counter (OTC) and may be obtained after a prescription.
            This medication will ensure proper dosage for legal and medical
            guidelines within the country. An important note: this document must
            not change the correct products, treating, and proper advice that a
            licensed healthcare provider can use. A licensed healthcare team can
            be sure you are getting the right care and treatment.
          </p>
        </div>
        <div className="relative mx-auto md:mr-0 w-[315px]  h-[48px] flex justify-center lg:justify-end mt-4 md:mt-0">
          <CustomImage src="/OCP-IMGS.webp" fill />
        </div>
      </div>
    </>
  );
};

export default ChewalisProducts;

// Product Data

const cialisProduct = {
  name: "Cialis",
  tagline: '"The weekender"',
  image:
    "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/webp-images/RockyHealth-cialis-400px.webp",
  activeIngredient: "Tadalafil",
  strengths: ["10mg", "20mg"],
  preferences: ["generic", "brand"],
  frequencies: {
    "monthly-supply": "One Month",
    "quarterly-supply": "Three Months",
  },
  pillOptions: {
    "monthly-supply": [
      { count: 8, genericPrice: 126, brandPrice: 170 },
      { count: 12, genericPrice: 184, brandPrice: 250 },
    ],
    "quarterly-supply": [
      { count: 12, genericPrice: 184, brandPrice: 250 },
      { count: 24, genericPrice: 358, brandPrice: 490 },
      { count: 36, genericPrice: 532, brandPrice: 730 },
    ],
  },
};

const viagraProduct = {
  name: "Viagra",
  tagline: '"The one-nighter"',
  image:
    "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/webp-images/RockyHealth-viagra-400px.webp",
  activeIngredient: "Sildenafil",
  strengths: ["50mg", "100mg"],
  preferences: ["generic", "brand"],
  frequencies: {
    "monthly-supply": "One Month",
    "quarterly-supply": "Three Months",
  },
  pillOptions: {
    "monthly-supply": [
      { count: 8, genericPrice: 98, brandPrice: 130 },
      { count: 12, genericPrice: 142, brandPrice: 190 },
    ],
    "quarterly-supply": [
      { count: 12, genericPrice: 142, brandPrice: 190 },
      { count: 24, genericPrice: 274, brandPrice: 370 },
      { count: 36, genericPrice: 406, brandPrice: 550 },
    ],
  },
};

// const chewalisProduct = {
//   name: "Chewalis",
//   tagline: '"The weekender"',
//   image:
//     "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/chewalis-ed.webp",
//   activeIngredient: "Tadalafil",
//   strengths: ["10mg", "20mg"],
//   preferences: ["generic"],
//   frequencies: {
//     "monthly-supply": "One Month",
//     "quarterly-supply": "Three Months",
//   },
//   pillOptions: {
//     "monthly-supply": [
//       { count: 4, genericPrice: 74, brandPrice: 74 },
//       { count: 8, genericPrice: 138, brandPrice: 138 },
//       { count: 12, genericPrice: 202, brandPrice: 202 },
//     ],
//     "quarterly-supply": [
//       { count: 12, genericPrice: 202, brandPrice: 202 },
//       { count: 24, genericPrice: 394, brandPrice: 394 },
//       { count: 36, genericPrice: 586, brandPrice: 586 },
//     ],
//   },
// };

const varietyPackProduct = {
  name: "Cialis + Viagra",
  tagline: '"The Variety Pack"',
  image:
    "https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/RockyHealth-variety-400px%20(1).webp",
  activeIngredient: "Tadalafil + Sildenafil",
  strengths: ["50mg & 100mg (Viagra)", "10mg & 20mg (Cialis)"],
  preferences: ["generic", "brand"],
  frequencies: {
    "monthly-supply": "One Month",
    "quarterly-supply": "Three Months",
  },
  pillOptions: {
    "monthly-supply": [
      { count: "4/4", genericPrice: 112, brandPrice: 160 },
      { count: "6/6", genericPrice: 163, brandPrice: 235 },
    ],
    "quarterly-supply": [
      { count: "6/6", genericPrice: 163, brandPrice: 235 },
      { count: "12/12", genericPrice: 316, brandPrice: 440 },
      { count: "18/18", genericPrice: 469, brandPrice: 685 },
    ],
  },
};
