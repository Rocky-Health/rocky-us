"use client";

import NewProductCard from "@/components/BodyOptimization/bo3/NewProductCard";
import { useRef } from "react";
import ScrollArrows from "@/components/ScrollArrows";
import { FaCheck } from "react-icons/fa6";
const products = [
  {
    name: "Ozempic ",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Weight%20Loss//new-ozempic.webp",
    supplyStatus: "Limited supply",
    ingredient: "Semaglutide",
    prescription: true,
    link: "/product/ozempic/",
  },
  {
    name: "Mounjaro",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Weight%20Loss/new-mounjaro.webp",
    supplyStatus: "Supply available",
    ingredient: "Tirzepatide",
    prescription: true,
    link: "/product/mounjaro/",
  },
  {
    name: "Wegovy",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Weight%20Loss//new-wegovy.webp",
    supplyStatus: "Supply available",
    ingredient: "Semaglutide",
    prescription: true,
    link: "/product/wegovy/",
  },
  {
    name: "Rybelsus",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Weight%20Loss/Rybelsus-latest.webp",
    supplyStatus: "Limited supply",
    ingredient: "Semaglutide",
    prescription: false,
    link: "/product/rybelsus/",
  },
];

const WlProducts = ({ CardBtnColor = null, productsVisible = true }) => {
  const scrollContainerRef = useRef(null);

  return (
    <div>
      <h2 className="headers-font text-[#000] text-[36px] md:text-[48px] leading-[115%]  md:leading-normal tracking-[-0.72px] md:tracking-[-0.96px] mb-4 max-w-[235px] md:max-w-none">
        Breakthrough medications, made simple.
      </h2>
      <ul
        className={` lg:ml-0 text-base space-y-3 ${
          productsVisible ? "mb-[32px]" : ""
        }`}
      >
        <li className="flex items-center gap-3">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#AE7E56] text-white">
            <FaCheck className="w-3 h-3" />
          </span>
          <p>Helps you feel fuller, for longer</p>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#AE7E56] text-white">
            <FaCheck className="w-3 h-3" />
          </span>
          <p>Improves body response to sugar</p>
        </li>
        <li className="flex items-center gap-3">
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#AE7E56] text-white">
            <FaCheck className="w-3 h-3" />
          </span>
          <p>Prescribed 100% online</p>
        </li>
      </ul>
      {productsVisible && (
        <div className="relative">
          <ScrollArrows scrollContainerRef={scrollContainerRef} />
          <div
            ref={scrollContainerRef}
            className="flex gap-2 md:gap-4 items-start overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {products.map((product, index) => (
              <div key={index} className="flex-shrink-0 snap-start">
                <NewProductCard product={product} btnColor={CardBtnColor} />
              </div>
            ))}
          </div>
        </div>
      )}
      <p className="poppins-font text-[rgba(0,0,0,0.60)] text-[12px] font-[400] leading-[140%] not-italic mt-8 md:mt-6 md:text-center max-w-[994px] mx-auto">
        In clinical trials, Ozempic and Mounjaro patients with a weight-related
        condition and with BMI ≥30, or BMI ≥27 lost 15% and 20% of their weight
        on average, when paired with diet and exercise changes (compared to 2.4%
        and 3.1%, with diet and exercise alone).
      </p>
    </div>
  );
};

export default WlProducts;
