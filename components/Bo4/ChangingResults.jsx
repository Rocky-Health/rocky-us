"use client";
import Link from "next/link";
import CustomImage from "../utils/CustomImage";
import { FaArrowRight } from "react-icons/fa";
import { useRef, useState } from "react";

const ChangingResults = ({btnTxt = `Start Your Weight Loss Journey`}) => {
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

  const members = [
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/one.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/two.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-03.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/foure.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-05.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-06.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-07.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/eight.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-09.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/ten.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-11.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-12.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-13.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/forteen.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-15.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/sixteen.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/seventeen.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-18.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/nineteen.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/twiny.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/twiny-one.jpg" },
    { image: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/Before-After-22.jpg" },
];

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

        <div className="md:hidden mt-[40px] pl-[20px]">
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex gap-[8px] overflow-x-auto snap-x snap-mandatory no-scrollbar pb-4"
          >
             {members.map((member, index) => (
              <div
                key={index}
                className="relative rounded-[16px] overflow-hidden shadow-md flex-shrink-0 snap-start"
              >
                {/* Image Container - Mobile: 240px × 240px with aspect-ratio 1/1 */}
                <div className="relative w-[240px] h-[240px] rounded-[16px] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300" style={{ aspectRatio: '1/1' }}>
                  {/* Image or Placeholder */}
                  {member.image ? (
                    <img
                      src={member.image}
                      alt="Member transformation"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 via-gray-250 to-gray-300 flex items-center justify-center">
                      <div className="text-gray-400 text-xs text-center px-2">
                        Before & After
                      </div>
                    </div>
                  )}
                </div>
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
              {btnTxt}{" "}
              <FaArrowRight className="inline ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangingResults;
