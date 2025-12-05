"use client";

import { useRef } from "react";
import Link from "next/link";
import ScrollArrows from "../ScrollArrows";
import EdProductCard from "./EdProductCard";
import CustomImage from "../utils/CustomImage";
//  import HighesttRate from "../convert_test/Flows/HighestRate";
//  import EdComparisonTable from "../Sex/EdComparisonTable";

const EdProducts = ({ showonly }) => {
  const scrollContainerRef = useRef(null);

  // Filter products based on the showonly parameter
  const getFilteredProducts = () => {
    const productsMap = {
      cialis: cialisProduct,
      viagra: viagraProduct,
      // chewalis: chewalisProduct,
      variety: varietyPackProduct,
    };

    if (!showonly) {
      // If no filter is specified, show all products
      return [
        cialisProduct,
        viagraProduct,
        // chewalisProduct,
        varietyPackProduct,
      ];
    }

    // Convert to lowercase for case-insensitive matching
    const filter = showonly.toLowerCase();

    // If the filter matches a product name, return only that product
    if (productsMap[filter]) {
      return [productsMap[filter]];
    }

    // If no match is found, return all products as fallback
    return [cialisProduct, viagraProduct, chewalisProduct, varietyPackProduct];
  };

  const filteredProducts = getFilteredProducts();

  return (
    <>
      <div className="text-start mb-[23px] md:mb-[31px]">
        <h2 className="text-[32px] md:text-[48px] leading-[36.8px] md:leading-[53.52px] font-[550] tracking-[-0.01em] md:tracking-[-0.02em] headers-font mb-23 md:mb-[16px]">
          Choose Your Plan
        </h2>
        <p className="text-[18px] md:text-[20px] leading-[25.2px] md:leading-[30px] font-[400] ">
          Pause or cancel at any time
        </p>
      </div>
      <div className="overflow-x-auto !no-scrollbar relative">
        <div className="mx-auto">
          <div className="relative">
            {/* Only show scroll arrows when there's more than one product */}
            {filteredProducts.length > 1 && (
              <ScrollArrows scrollContainerRef={scrollContainerRef} />
            )}

            <div
              ref={scrollContainerRef}
              className={`flex gap-2 md:gap-4 items-start ${
                filteredProducts.length > 1
                  ? "overflow-x-auto snap-x snap-mandatory no-scrollbar"
                  : "justify-center"
              }`}
            >
              {filteredProducts.map((product, index) => (
                <div
                  key={index}
                  className={`${
                    filteredProducts.length === 1
                      ? "w-full max-w-[450px]"
                      : "flex-shrink-0"
                  }`}
                >
                  <EdProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ED Treatment Comparison Table */}
      {/* <div className="mt-12 mb-12">
        <EdComparisonTable leftAlign={true} />
      </div> */}

      {/* Find What's Best for Me Button */}
      <div className="flex justify-center mt-8 mb-8">
        <Link
          href="/ed-pre-consultation-quiz/"
          className="bg-white border-2 border-black text-black px-8 py-3 rounded-full flex items-center justify-center space-x-3 hover:bg-gray-50 transition font-medium"
        >
          <span>Find What's Best For Me</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 12H19M19 12L12 5M19 12L12 19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>

      {/* <div className="md:flex justify-center items-center mt-[50px] mb-[65px] hidden">
        <CustomImage
          src="/OCP-IMGS.webp"
          className="w-auto"
          width="344"
          height="100"
        />
      </div> */}
      {/* <div className="md:mt-0 mt-[33px]">
        <HighesttRate blockMode={true} />
      </div> */}

      <div className="md:hidden justify-center items-center flex mt-[32px]">
        <CustomImage
          src="/OCP-IMGS.webp"
          className="w-auto"
          width="344"
          height="100"
        />
      </div>
    </>
  );
};

export default EdProducts;

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
      {
        count: 6,
        genericPrice: 107,
        brandPrice: 450,
        variationId: "3287",
        brandVariationId: "3471",
      },
      {
        count: 8,
        genericPrice: 84,
        brandPrice: 600,
        variationId: "259",
        brandVariationId: "1422",
      },
      {
        count: 12,
        genericPrice: 126,
        brandPrice: 900,
        variationId: "1960",
        brandVariationId: "1962",
      },
    ],
    "quarterly-supply": [
      {
        count: 12,
        genericPrice: 126,
        brandPrice: 900,
        variationId: "260",
        brandVariationId: "1423",
      },
      {
        count: 24,
        genericPrice: 252,
        brandPrice: 1800,
        variationId: "261",
        brandVariationId: "1424",
      },
      {
        count: 36,
        genericPrice: 378,
        brandPrice: 2700,
        variationId: "1961",
        brandVariationId: "1967",
      },
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
      {
        count: 6,
        genericPrice: 76,
        brandPrice: 690,
        variationId: "3440",
        brandVariationId: "3467",
      },
      {
        count: 8,
        genericPrice: 64,
        brandPrice: 920,
        variationId: "233",
        brandVariationId: "1428",
      },
      {
        count: 12,
        genericPrice: 96,
        brandPrice: 1380,
        variationId: "234",
        brandVariationId: "1429",
      },
    ],
    "quarterly-supply": [
      {
        count: 12,
        genericPrice: 96,
        brandPrice: 1380,
        variationId: "235",
        brandVariationId: "1430",
      },
      {
        count: 24,
        genericPrice: 192,
        brandPrice: 2760,
        variationId: "236",
        brandVariationId: "1431",
      },
      {
        count: 36,
        genericPrice: 288,
        brandPrice: 4140,
        variationId: "237",
        brandVariationId: "1432",
      },
    ],
  },
};

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
      {
        count: "4/4",
        genericPrice: 112,
        brandPrice: 760,
        variationId: "37669,37668",
        brandVariationId: "1421,1427",
      },
      {
        count: "6/6",
        genericPrice: 183,
        brandPrice: 1140,
        variationId: "3440,3287",
        brandVariationId: "3471,3467",
      },
    ],
    "quarterly-supply": [
      {
        count: "6/6",
        genericPrice: 183,
        brandPrice: 1140,
        variationId: "3439,3438",
        brandVariationId: "3470,3466",
      },
      {
        count: "12/12",
        genericPrice: 263,
        brandPrice: 2280,
        variationId: "37673,37674",
        brandVariationId: "1423,1430",
      },
      {
        count: "18/18",
        genericPrice: 469,
        brandPrice: 3420,
        variationId: "3442,3437",
        brandVariationId: "3469,3465",
      },
    ],
  },
};
