"use client";
import Link from "next/link";
import CustomImage from "../utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";
import { useRef, useState } from "react";

const ChangingResults = () => {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const totalImages = 5;

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const imageWidth = container.querySelector("div")?.offsetWidth || 0;
      const gap = 8; // gap-[8px]
      const scrollPosition = scrollLeft / (imageWidth + gap);
      const index = Math.round(scrollPosition);
      setActiveIndex(Math.min(index, totalImages - 1));
    }
  };

  const scrollToImage = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const imageWidth = container.querySelector("div")?.offsetWidth || 0;
      const gap = 8;
      container.scrollTo({
        left: index * (imageWidth + gap),
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  return (
    <>
      <div className="bg-[#F0EEEA] md:py-[72px] py-[40px] overflow-x-hidden">
        <div className="text-center md:mb-[48px]">
          <h2 className="md:text-[48px] text-[#AE7E56] px-[15px] text-[32px] subheaders-font font-medium leading-[115%] tracking-tight ">
            Join 350,000+ Members
          </h2>

          <h2 className="md:text-[48px]  px-[20px] text-[32px] subheaders-font font-medium leading-[115%] tracking-tight ">
            Achieving Life Changing Results.
          </h2>
        </div>

        <div className="hidden md:flex justify-center flex-col items-center gap-[16px] my-[48px]">
          <CustomImage
            src={`/bo4/album_1.webp`}
            width={2500}
            height={288}
            alt=""
            className=""
          />
          <CustomImage
            src={`/bo4/album_3.webp`}
            width={2500}
            height={288}
            alt=""
            className=""
          />
          <CustomImage
            src={`/bo4/album_2.webp`}
            width={2500}
            height={288}
            alt=""
            className=""
          />
        </div>

        <div className="md:hidden mt-[40px]">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-[8px] overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4"
          >
            {Array.from({ length: totalImages }, (_, i) => (
              <div
                key={i}
                className="flex-shrink-0 snap-center rounded-[16px]"
              >
                <CustomImage
                  src={`/bo4/Before & After-${i}.png`}
                  width={240}
                  height={240}
                  alt=""
                  className="w-[240px] h-[240px] object-contain"
                />
              </div>
            ))}
          </div>
          
          {/* Pagination dots */}
          <div className="flex justify-center items-center mt-4">
            {Array.from({ length: totalImages }, (_, i) => (
              <button
                key={i}
                onClick={() => scrollToImage(i)}
                className={`h-2 transition-all duration-300 ${
                  i === 0 ? "rounded-l-full" : ""
                } ${
                  i === totalImages - 1 ? "rounded-r-full" : ""
                } ${
                  activeIndex === i
                    ? "w-8 bg-black"
                    : "w-2 bg-gray-300"
                }`}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-center items-center gap-[10px]">
            <Link
              href={"/wl-pre-consultation"}
              className="md:text-[18px] leading-[140%] font-medium bg-black px-[24px] rounded-full text-white py-[10px] mt-[32px] inline-block"
            >
              Start Your Weight Loss Journey{" "}
              <FaArrowRight className="inline ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangingResults;
