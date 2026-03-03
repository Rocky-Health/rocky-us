"use client";
import Section from "../utils/Section";
import ProductCard from "./ProductCard";
import { useRef, useState } from "react";

export default function TreatmentPlans({bg='bg-white'}) {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalBrandProducts = 4; // products[2] to products[5]

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.querySelector("div")?.offsetWidth || 0;
      const gap = 16; // gap-4 = 16px
      const scrollPosition = scrollLeft / (cardWidth + gap);
      const index = Math.round(scrollPosition);
      setActiveIndex(Math.min(index, totalBrandProducts - 1));
    }
  };

  const scrollToCard = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector("div")?.offsetWidth || 0;
      const gap = 16;
      container.scrollTo({
        left: index * (cardWidth + gap),
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  const products = [
    {
      label: "MOST POPULAR",
      activeIngeredient: "(GLP-1)",
      name: "Semaglutide",
      hasSale: true,
      price: "149",
      oldPrice: "300",
      description:
        "Same active ingredient as Ozempic. The popular and affordable alternative.",
      WLPrograme: true,
      image: "/bo4/semaglutide.png",
    },

    {
      label: "BEST RESULTS",
      activeIngeredient: "(GLP-1/GIP)",
      name: "Tirzepatide",
      hasSale: true,
      price: "249",
      oldPrice: "450",
      description:
        "Dual-action mechanism with the highest rated clinical weight loss.",
      WLPrograme: true,
      image: "/bo4/tirzepatide.png",
    },

    {
      activeIngeredient: "(GLP-1)",
      name: "Ozempic®",
      hasSale: false,
      price: "1310",
      description: "Name Brand Semaglutide Injection",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Ozempic.jpg",
      features: ["Same active ingredient as Wegovy", "Strong appetite control"],
    },

    {
      activeIngeredient: "(GLP-1/GIP)",
      name: "Mounjaro®",
      hasSale: false,
      price: "1410",
      description: "Name Brand Tirzepatide Injection",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Mounjaro.jpg",
      features: [
        "Dual-hormone mechanism for enhanced results",
        "Enhanced results vs other injectables",
      ],
    },

    {
      activeIngeredient: "(GLP-1)",
      name: "Wegovy®",
      hasSale: false,
      price: "1770",
      description: "Name Brand Semaglutide Injection",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Wegovy.jpg",
      features: [
        "Same active ingredient as Ozempic",
        "Strong appetite control",
      ],
    },

    {
      activeIngeredient: "(GLP-1)",
      name: "Rybelsus®",
      hasSale: false,
      price: "1310",
      description: "Name Brand Oral Semaglutide Pill",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Rybelsus.jpg",
      features: [
        "Mild weight loss effect compared to injectables",
        "Best suited for patients who are needle-averse",
      ],
    },
  ];
  return (
    <Section bg={`!px-0 ${bg}`}>
      <h2 className="subheaders-font px-5 text-[40px] leading-[115%] tracking-tight font-medium text-center mb-[16px]">
        <span className="text-[#AE7E56]">MyRocky</span> Treatment Plans
      </h2>
      <p className="md:text-[18px] px-5 tracking-tight text-center">
        Medication + Coaching + Support = Real Weight Loss Results.
      </p>

      <div className=" px-5 flex justify-center items-center gap-4 mt-[48px] mb-[48px] flex-col md:flex-row">
        <ProductCard product={products[0]} />
        <ProductCard product={products[1]} />
      </div>

      <h2 className="subheaders-font px-5 text-[48px] leading-[115%] tracking-tight font-medium text-center mb-[16px]">
        <span className="text-[#AE7E56] block">Brand Name GLP-1</span> Treatments
      </h2>

      {/* Desktop View */}
      <div className="hidden md:flex px-5 justify-center items-center gap-4 mt-[48px] mb-[48px]">
        <ProductCard product={products[2]} />
        <ProductCard product={products[3]} />
        <ProductCard product={products[4]} />
        <ProductCard product={products[5]} />
      </div>

      {/* Mobile Scrollable View */}
      <div className="md:hidden mt-[48px] mb-[48px] ">
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4 pl-4 ml-4"
        >
          <div className="flex-shrink-0 snap-start w-[75vw] max-w-[300px] ">
            <ProductCard product={products[2]} />
          </div>
          <div className="flex-shrink-0 snap-start w-[75vw] max-w-[300px]">
            <ProductCard product={products[3]} />
          </div>
          <div className="flex-shrink-0 snap-start w-[75vw] max-w-[300px]">
            <ProductCard product={products[4]} />
          </div>
          <div className="flex-shrink-0 snap-start w-[75vw] max-w-[300px]">
            <ProductCard product={products[5]} />
          </div>
        </div>

        {/* Pagination dots */}
        <div className="flex justify-center items-center mt-4">
          {Array.from({ length: totalBrandProducts }, (_, i) => (
            <button
              key={i}
              onClick={() => scrollToCard(i)}
              className={`h-2 transition-all duration-300 ${
                i === 0 ? "rounded-l-full" : ""
              } ${
                i === totalBrandProducts - 1 ? "rounded-r-full" : ""
              } ${
                activeIndex === i ? "w-8 bg-black" : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to product ${i + 1}`}
            />
          ))}
        </div>
      </div>

      <p className="text-center max-w-[878px] text-[14px] leading-[140%] text-[#00000066] tracking-tight mx-auto">
        *Compounded medications have not been evaluated or approved by the FDA
        for safety, efficacy, or quality. Your provider will work with you to
        determine what, if any, medication is right for your own healthcare
        needs. Visit our Medication Safety Information.
      </p>
    </Section>
  );
}
