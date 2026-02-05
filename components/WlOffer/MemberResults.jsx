"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';
import BrimaryButton from '@/components/ui/buttons/BrimaryButton';
import ScrollArrows from '@/components/ScrollArrows';

// Mock data for member results
// Total: 22 cards (7 + 8 + 7)
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

const MemberResults = ({ consultationHref = "/wl-offer-pre-consultation/" }) => {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Helper function to get card width
  const getCardWidth = useCallback(() => {
    return 240 + 8; // card width (240px) + gap (8px)
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft } = container;

    const cardWidth = getCardWidth();
    const index = Math.round(scrollLeft / cardWidth);
    const maxIndex = Math.max(0, members.length - 1);

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
  }, [handleScroll]);

  return (
    <div className="w-full overflow-hidden ">
      {/* Headline */}
      <div className="text-center md:mb-12 mb-10">
        <h2 className="text-[32px] md:text-[48px] font-[550] leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] capitalize headers-font mb-2 text-[#AE7E56]">
       Join 350,000+ Members
        </h2>
        <h2 className="text-[32px] md:text-[48px] font-[550] leading-[115%] tracking-[-0.64px] md:tracking-[-0.96px] capitalize headers-font text-black">
          Achieving Life-Changing Results.
        </h2>
      </div>

      {/* Member Results Grid */}
      <div className="w-full overflow-hidden mb-8 md:mb-12">
        {/* Mobile: Single horizontal scrolling row */}
        <div className="md:hidden relative px-5">
          <ScrollArrows scrollContainerRef={scrollContainerRef} scrollAmount={248} />
          <div
            ref={scrollContainerRef}
            className="flex gap-2 items-center overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
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
          {/* Mobile Scroll Indicator */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <div className="relative w-20 h-2 bg-[#EFEFEA] rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${100 / members.length}%`,
                  transform: `translateX(${activeIndex * 100}%)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Desktop: 3 rows (7, 8, 7) */}
        <div className="hidden md:block">
          {/* Row 1: 7 cards centered */}
          <div className="flex justify-center items-center gap-4 mb-4 overflow-hidden">
            {members.slice(0, 7).map((member, index) => (
              <div
                key={index}
                className="relative rounded-[16px] overflow-hidden shadow-md flex-shrink-0"
              >
                {/* Image Container - Desktop: 288px × 288px */}
                <div className="relative w-[288px] h-[288px] rounded-[16px] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
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
          
          {/* Row 2: 8 cards */}
          <div className="flex justify-center items-center gap-4 mb-4 overflow-hidden">
            {members.slice(7, 15).map((member, index) => (
              <div
                key={index + 7}
                className="relative rounded-[16px] overflow-hidden shadow-md flex-shrink-0"
              >
                {/* Image Container - Desktop: 288px × 288px */}
                <div className="relative w-[288px] h-[288px] rounded-[16px] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
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
          
          {/* Row 3: 7 cards centered */}
          <div className="flex justify-center items-center gap-4 overflow-hidden">
            {members.slice(15, 22).map((member, index) => (
              <div
                key={index + 15}
                className="relative rounded-[16px] overflow-hidden shadow-md flex-shrink-0"
              >
                {/* Image Container - Desktop: 288px × 288px */}
                <div className="relative w-[288px] h-[288px] rounded-[16px] overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
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
        </div>
      </div>

      {/* Call to Action Button */}
      <div className="flex justify-center">
        <BrimaryButton
          href={consultationHref}
          arrowIcon={true}
          className="flex h-[48px] md:px-[32px] justify-center items-center gap-2 rounded-[64px] bg-[#000] text-white w-[335px] md:w-auto"
        >
          Start Your Weight Loss Journey
        </BrimaryButton>
      </div>
    </div>
  );
};

export default MemberResults;
