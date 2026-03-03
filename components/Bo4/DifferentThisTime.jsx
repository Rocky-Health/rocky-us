"use client";
import BrimaryButton from "../ui/buttons/BrimaryButton";
import CustomImage from "../utils/CustomImage";
import { useRef, useState, useEffect, useCallback } from "react";

const DifferentThisTime = () => {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft } = container;
    const cardWidth =
      container.querySelector("[data-different-card]")?.offsetWidth || 0;
    const gap = 32; // gap-8 = 32px
    const index = Math.round(scrollLeft / (cardWidth + gap));

    setActiveIndex(Math.min(Math.max(0, index), 2)); // 3 items total (0-2)
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // initialize

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const list = [
    {
      key: 1,
      image: "/bo4/blog1.png",
      title: "It’s about genetics, not willpower.",
      description:
        "Genetics influence up to 70% of body weight. By providing personalized care with real lab data, access to GLP-1s and nutrition guidance, we help you finally work with your body, not against it.",
    },
    {
      key: 2,
      image: "/bo4/blog2.png",
      title: "Obesity isn’t a cosmetic problem, it’s a medical one",
      description:
        "So instead of empty promises and quick fixes, we focus on the underlying causes, with a science-based, medical approach that leads to meaningful results.",
    },
    {
      key: 3,
      image: "/bo4/blog3.png",
      title: "It’s built around your already busy schedule",
      description:
        "Our plans integrate seamlessly into your existing routine, adapt to it, rather than the other way around. We’ll also give you the tools to build the habits you need to maintain results after the program.",
    },
  ];
  return (
    <>
      <h2 className="text-left md:text-center text-[32px] md:text-[48px] leading-[115%] tracking-tight font-[550] headers-font mb-[12px] ">
        Why It Will Be Different This Time
      </h2>

      <p className="text-left md:text-center text-[16px] md:text-[18px] leading-[140%]">
        Our program makes losing weight—and keeping it off—simple. Here’s why:
      </p>

      {/* Mobile: Horizontal Slider */}
      <div className="md:hidden mt-[32px]">
        <div
          ref={scrollContainerRef}
          className="flex gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-4 pl-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {list.map((item) => (
            <div
              key={item.key}
              data-different-card
              className="flex-shrink-0 snap-start w-[80vw] max-w-[350px]"
            >
              <CustomImage
                src={item.image}
                width={380}
                height={210}
                alt=""
                className="rounded-t-[16px] w-full h-auto"
              />
              <h3 className="text-[20px] font-medium leading-[120%] tracking-tight mt-4">
                {item.title}
              </h3>
              <p className="text-[14px] leading-[140%] mt-2">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex justify-center items-center mt-4">
          {list.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const container = scrollContainerRef.current;
                if (container) {
                  const cardWidth =
                    container.querySelector("[data-different-card]")
                      ?.offsetWidth || 0;
                  const gap = 32;
                  container.scrollTo({
                    left: index * (cardWidth + gap),
                    behavior: "smooth",
                  });
                }
              }}
              className={`h-2 transition-all duration-300 ${
                index === 0 ? "rounded-l-full" : ""
              } ${index === list.length - 1 ? "rounded-r-full" : ""} ${
                activeIndex === index ? "w-8 bg-black" : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to item ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: 3-Column Grid */}
      <div className="hidden md:grid md:grid-cols-3 gap-8 mt-[32px] md:mt-[56px]">
        {list.map((item) => (
          <div key={item.key}>
            <CustomImage
              src={item.image}
              width={380}
              height={210}
              alt=""
              className="rounded-t-[16px]"
            />
            <h3 className="text-[20px] md:text-[24px] font-medium leading-[120%] tracking-tight mt-4">
              {item.title}
            </h3>
            <p className="text-[14px] md:text-[16px] leading-[140%] mt-2">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center">
        <BrimaryButton
          href={"/wl-pre-consultation"}
          arrowIcon={true}
          className="flex h-[48px]  md:px-[32px] justify-center items-center gap-2 rounded-[64px] bg-[#000] text-white w-[335px] md:w-auto mt-[40px]"
        >
          See If You’re Eligible
        </BrimaryButton>
      </div>
    </>
  );
};

export default DifferentThisTime;
