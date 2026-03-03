"use client";
import CustomImage from "../utils/CustomImage";
import { useRef, useState, useEffect, useCallback } from "react";

const AsSeenOn = ({removeTitle = false, mobileSlider = false, gray = false}) => {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalLogos = 7;

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft } = container;
    const cardWidth = container.querySelector("[data-logo-item]")?.offsetWidth || 0;
    const gap = 32; // gap-8 = 32px
    const index = Math.round(scrollLeft / (cardWidth + gap));
    
    setActiveIndex(Math.min(Math.max(0, index), totalLogos - 1));
  }, [totalLogos]);

  useEffect(() => {
    if (!mobileSlider) return;
    
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll);
    handleScroll(); // initialize

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll, mobileSlider]);

  return (
    <>
      {!removeTitle && (
        <p className="text-center text-[14px] leading-[140%] md:mb-[26px] mb-[24px]">
          AS SEEN ON
        </p>
      )}
      
      {/* Conditional Mobile Slider */}
      {mobileSlider ? (
        <>
          {/* Mobile: Horizontal Slider */}
          <div className="md:hidden">
            <div
              ref={scrollContainerRef}
              className="flex gap-8 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-4 pl-4"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {Array.from({ length: totalLogos }).map((_, index) => (
                <div
                  key={index}
                  data-logo-item
                  className="flex justify-center items-center flex-shrink-0 snap-start w-[150px]"
                >
                  <CustomImage
                    src={`/bo4/logo${index + 1}.png`}
                    width={55}
                    height={30}
                    className={`object-contain ${gray ? 'grayscale' : ''}`}
                  />
                </div>
              ))}
            </div>

           
          </div>

          {/* Desktop: Original Layout */}
          <div className="hidden md:flex items-center md:justify-between justify-center gap-8 flex-wrap">
            {Array.from({ length: totalLogos }).map((_, index) => (
              <div
                key={index}
                className="flex justify-center items-center gap-8 mb-[24px]"
              >
                <CustomImage
                  src={`/bo4/logo${index + 1}.png`}
                  width={91}
                  height={50}
                  className="object-contain"
                />
              </div>
            ))}
          </div>
        </>
      ) : (
        /* Original Layout for Both Mobile and Desktop */
        <div className="flex items-center md:justify-between justify-center gap-8 flex-wrap">
          {Array.from({ length: totalLogos }).map((_, index) => (
            <div
              key={index}
              className="flex justify-center items-center gap-8 mb-[24px]"
            >
              <CustomImage
                src={`/bo4/logo${index + 1}.png`}
                width={91}
                height={50}
                className="object-contain"
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default AsSeenOn;
