"use client";

import NewProductCard from "@/components/WlOffer/NewProductCard";
import { useRef, useState, useEffect, useCallback } from "react";
import ScrollArrows from "@/components/ScrollArrows";
const products = [
  {
    name: "Ozempic ",
    image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/ozempic.jpg",
    supplyStatus: "Limited supply",
    ingredient: "Semaglutide",
    prescription: true,
    link: "/product/ozempic/",
  },
  {
    name: "Mounjaro",
    image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Mounjaro.jpg",
    supplyStatus: "Supply available",
    ingredient: "Tirzepatide",
    prescription: true,
    link: "/product/mounjaro/",
  },
  {
    name: "Wegovy",
    image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Wegovy.jpg",
    supplyStatus: "Supply available",
    ingredient: "Semaglutide",
    prescription: true,
    link: "/product/wegovy/",
  },
  {
    name: "Rybelsus",
    image: "/wl-offer/Rybelsus.jpg",
    supplyStatus: "Limited supply",
    ingredient: "Semaglutide",
    prescription: false,
    link: "/product/rybelsus/",
  },
];

const WlProducts = ({ CardBtnColor = null, productsVisible = true, consultationHref = "/wl-pre-consultation" }) => {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Helper function to get card width
  const getCardWidth = useCallback(() => {
    return typeof window !== "undefined" && window.innerWidth >= 768
      ? 272 + 16 // md:gap-4 (16px) - adjust based on your card width
      : 272 + 8; // gap-2 (8px) - adjust based on your card width
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft } = container;

    const cardWidth = getCardWidth();
    const index = Math.round(scrollLeft / cardWidth);
    const maxIndex = Math.max(0, products.length - 1);

    setActiveIndex(Math.min(Math.max(0, index), maxIndex));
  }, [getCardWidth]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // initialize

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, productsVisible]);

  return (
    <div>
      <h2 className="text-center w-full md:max-w-[710px] md:mx-auto headers-font text-[#000] text-[32px] md:text-[48px] leading-none md:leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] capitalize mb-8 md:mb-12">
      Doctor-trusted weight loss
    <span className="text-[#AE7E56]">   treatment options </span>
      </h2>

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
                <NewProductCard product={product} btnColor={CardBtnColor} consultationHref={consultationHref} />
              </div>
            ))}
          </div>
          {/* Mobile Scroll Indicator */}
          <div className="flex justify-center items-center gap-2 mt-4 md:hidden">
            <div className="relative w-20 h-2 bg-[#EFEFEA] rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${100 / products.length}%`,
                  transform: `translateX(${activeIndex * 100}%)`,
                }}
              />
            </div>
          </div>
        </div>
      )}
     
    </div>
  );
};

export default WlProducts;
