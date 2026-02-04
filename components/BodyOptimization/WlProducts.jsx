"use client";

import ProductCard from "./ProductCard";
import { useRef } from "react";
import ScrollArrows from "../ScrollArrows";
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
    supplyStatus: "Supply available",
    ingredient: "Semaglutide",
    prescription: false,
    link: "/product/rybelsus/",
  },
];

const WlProducts = ({ CardBtnColor = null, productsVisible = true, consultationHref = "/wl-pre-consultation" }) => {
  const scrollContainerRef = useRef(null);

  return (
    <div>
      <h2 className="text-2xl lg:text-[48px]  lg:leading-[48px] mb-4 headers-font max-w-[650px]">
        Breakthrough medications, made simple.
      </h2>
      <ul
        className={`ml-3 lg:ml-0 text-base ${
          productsVisible ? "mb-[40px]" : ""
        }`}
      >
        <li className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-black"></span>
          <p>Helps you feel fuller, for longer</p>
        </li>
        <li className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-black"></span>
          <p>Improves body response to sugar</p>
        </li>
        <li className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-black"></span>
          <p>Prescribed 100% online</p>
        </li>
      </ul>
      {productsVisible && (
        <div className="overflow-x-auto !no-scrollbar relative">
          <div className=" mx-auto ">
            <div className="relative">
              <ScrollArrows scrollContainerRef={scrollContainerRef} />
              <div
                ref={scrollContainerRef}
                className="flex gap-2 md:gap-4 items-start overflow-x-auto snap-x snap-mandatory no-scrollbar"
              >
                {products.map((product, index) => (
                  <ProductCard
                    key={index}
                    product={product}
                    btnColor={CardBtnColor}
                    consultationHref={consultationHref}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WlProducts;
