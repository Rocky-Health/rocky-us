"use client";
import { FaCheck, FaCheckCircle } from "react-icons/fa";
import CustomImage from "../utils/CustomImage";
import Section from "../utils/Section";
import { useRef, useState, useEffect, useCallback } from "react";

const Comprehensive = () => {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft } = container;
    const cardWidth = container.querySelector("[data-feature-card]")?.offsetWidth || 0;
    const gap = 16; // gap-4 = 16px
    const index = Math.round(scrollLeft / (cardWidth + gap));
    
    setActiveIndex(Math.min(Math.max(0, index), 3)); // 4 features total (0-3)
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


  const features = [
    {
      title: "Unlimited Medical Support",
      desktopImage: "/wl-offer/Unlimited-Desktop.jpg",
      mobileImage: "/wl-offer/Unlimited-Mobile.jpg",
      bullets: [
        "Chat with your medical provider at any time",
        "Lifestyle coaching and nutrition advice",
        "Ongoing care & check-ins, 100% online"
      ]
    },
    {
      title: "Plans Tailored To Your Biology",
      desktopImage: "/wl-offer/Plans-Tailored-to-Your-Biology-Desktop.jpg",
      mobileImage: "/wl-offer/Plans-Tailored-to-Your-Biology-Desktop.jpg",
      bullets: [
        "We use lab data to personalize your treatment plan",
        "A range of FDA-approved medications available",
        "Regular dose adjustments"
      ]
    },
    {
      title: "Track Everything In The App",
      desktopImage: "/wl-offer/Track-Everything-In-The-App-Desktop.jpg",
      mobileImage: "/wl-offer/Track-Everything-In-The-App-Mobile.jpg",
      bullets: [
        "Access your provider, treatments and health data",
        "Equipped with features to help you achieve better results"
      ]
    },
    {
      title: "On-Time Refills Guaranteed",
      desktopImage: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/On-Time-Refills-Guaranteed-Desktop.jpg",
      mobileImage: "https://myrocky.b-cdn.net/WP%20Images/wl-offer/On-Time-Refills-Guaranteed-Mobile.jpg",
      bullets: [
        "Reliable, fast & free delivery for every refill",
        "Discreet packaging"
      ]
    }
  ];
  return (
    <Section>
      <div className="w-full">
      <style dangerouslySetInnerHTML={{__html: `
        @media (min-width: 768px) {
          [data-card-height] {
            height: var(--desktop-height) !important;
          }
        }
        @media (max-width: 767px) {
          [data-mobile-img="0"] { height: 188px !important; }
          [data-mobile-img="1"] { height: 212.408px !important; }
          [data-mobile-img="2"] { height: 223.2px !important; }
          [data-mobile-img="3"] { height: 256px !important; }
        }
      `}} />
      <h2 className="text-center text-[32px] md:text-[48px] leading-[115%] tracking-tight font-[550] headers-font ">
        <span className="text-[#AE7E56] md:block">
          {" "}
          A comprehensive GLP-1 program {" "}
        </span>
        With Unmatched Results
      </h2>

      <p className="text-[16px] md:text-[18px] leading-[140%] max-w-[900px] mx-auto text-center">
        Our holistic approach goes beyond medication alone. With expert-led
        care, personalized treatments, and continuous support, you'll achieve
        faster, safer, and lasting results.
      </p>

      {/* Features Grid */}
      {/* Mobile: Horizontal Slider */}
      <div className="md:hidden mt-[40px]">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-4 pl-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {features.map((feature, index) => {
            const mobileAspectRatios = [null, '3/2', '56/47', '56/47'];
            const mobileAspectRatio = mobileAspectRatios[index];
            const isFirstCard = index === 0;
            
            return (
              <div
                key={index}
                data-feature-card
                className={`flex flex-col rounded-[16px] p-4 relative overflow-hidden flex-shrink-0 snap-start w-[80vw] max-w-[350px] ${
                  isFirstCard ? 'bg-[#F0EEEA]' : 'bg-[#F0EEEA]'
                }`}
              >
                {/* Image */}
                <div 
                  data-mobile-img={index}
                  className="relative w-full rounded-[16px] overflow-hidden mb-4 bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0"
                  style={{
                    ...(mobileAspectRatio && {
                      aspectRatio: mobileAspectRatio
                    }),
                    ...(!mobileAspectRatio && {
                      height: '188px'
                    })
                  }}
                >
                  <CustomImage
                    src={feature.mobileImage}
                    alt={feature.title}
                    fill
                    className={`object-cover ${index === 0 || index === 2 ? 'object-top' : 'object-center'}`}
                  />
                </div>

                {/* Content Container */}
                <div className="flex flex-col">
                  {/* Title */}
                  <h3 
                    className="text-[24px] headers-font leading-[110%] tracking-[-0.48px] capitalize mb-4 text-black"
                  >
                    {feature.title}
                  </h3>

                  {/* Bullet Points */}
                  <ul className="space-y-2">
                    {feature.bullets.map((bullet, bulletIndex) => (
                      <li key={bulletIndex} className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#AE7E56] text-white flex-shrink-0 mt-0.5">
                          <FaCheck className="w-3 h-3" />
                        </span>
                        <p className="text-base text-black leading-relaxed">{bullet}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex justify-center items-center mt-4 mb-8">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const container = scrollContainerRef.current;
                if (container) {
                  const cardWidth = container.querySelector("[data-feature-card]")?.offsetWidth || 0;
                  const gap = 16;
                  container.scrollTo({
                    left: index * (cardWidth + gap),
                    behavior: "smooth",
                  });
                }
              }}
              className={`h-2 transition-all duration-300 ${
                index === 0 ? "rounded-l-full" : ""
              } ${
                index === features.length - 1 ? "rounded-r-full" : ""
              } ${
                activeIndex === index ? "w-8 bg-black" : "w-2 bg-gray-300"
              }`}
              aria-label={`Go to feature ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Desktop: 2-Column Grid */}
      <div className="hidden md:flex flex-col md:flex-row gap-4 mb-8 md:mb-12 mt-[40px] md:mt-[48px]">
        {/* Left Column */}
        <div className="flex flex-col gap-4 w-full md:w-[calc(50%-8px)]">
          {features.map((feature, index) => {
            if (index % 2 !== 0) return null; // Skip odd indices (right column items)
            const heights = [460, 584, 584, 460];
            const height = heights[index] || 460;
            const isBigCard = height === 584;
            const isFirstCard = index === 0;
            const mobileHeights = [188, 212.408, 223.2, 256];
            const mobileAspectRatios = [null, '3/2', '56/47', '56/47'];
            const mobileHeight = mobileHeights[index];
            const mobileAspectRatio = mobileAspectRatios[index];
            
            return (
            <div
              key={index}
              data-card-height
              className={`flex flex-col rounded-[16px] p-4 md:p-6 relative overflow-hidden w-full md:w-[584px] ${
                isFirstCard ? 'md:bg-cover md:bg-center md:bg-no-repeat' : 'bg-[#F0EEEA]'
              }`}
              style={{ 
                '--desktop-height': `${height}px`,
                ...(isFirstCard && {
                  backgroundImage: `url(${feature.desktopImage})`
                })
              }}
            >
            {/* Image - Only show on mobile for first card, always show for others */}
            <div 
              data-mobile-img={index}
              className={`relative w-full rounded-[16px] overflow-hidden mb-4 md:mb-6 bg-gradient-to-br from-gray-200 to-gray-300 ${isFirstCard ? 'md:hidden' : ''} flex-shrink-0 ${isBigCard ? 'md:h-[372px]' : 'md:h-[300px]'}`}
              style={{
                ...(mobileAspectRatio && {
                  aspectRatio: mobileAspectRatio
                })
              }}
            >
              {/* Mobile Image */}
              <div className="md:hidden w-full h-full">
                <CustomImage
                  src={feature.mobileImage}
                  alt={feature.title}
                  fill
                  className={`object-cover ${index === 0 || index === 2 ? 'object-top' : 'object-center'}`}
                />
              </div>
              {/* Desktop Image - Only for non-first cards */}
              {!isFirstCard && (
                <div className="hidden md:block w-full h-full">
                  <CustomImage
                    src={feature.desktopImage}
                    alt={feature.title}
                    fill
                    className="object-cover object-top"
                  />
                </div>
              )}
            </div>

            {/* Content Container - Aligned to bottom */}
            <div className={`flex flex-col md:mt-auto ${isFirstCard ? 'relative z-10' : ''}`}>
              {/* Title */}
              <h3 
                className="text-[24px] md:text-[30px] headers-font md:font-[450] leading-[110%] tracking-[-0.48px] md:tracking-[-0.6px] capitalize mb-4 text-black"
              >
                {feature.title}
              </h3>

              {/* Bullet Points */}
              <ul className="space-y-2">
                {feature.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#AE7E56] text-white flex-shrink-0 mt-0.5">
                      <FaCheck className="w-3 h-3" />
                    </span>
                    <p className="text-base text-black leading-relaxed">{bullet}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
            );
          })}
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-4 w-full md:w-[calc(50%-8px)]">
          {features.map((feature, index) => {
            if (index % 2 === 0) return null; // Skip even indices (left column items)
            const heights = [460, 584, 584, 460];
            const height = heights[index] || 460;
            const isBigCard = height === 584;
            const mobileHeights = [188, 212.408, 223.2, 256];
            const mobileAspectRatios = [null, '3/2', '56/47', '56/47'];
            const mobileHeight = mobileHeights[index];
            const mobileAspectRatio = mobileAspectRatios[index];
            
            return (
            <div
              key={index}
              data-card-height
              className="flex flex-col rounded-[16px] bg-[#F0EEEA] p-4 md:p-6 w-full md:w-[584px]"
              style={{ '--desktop-height': `${height}px` }}
            >
              {/* Image */}
              <div 
                data-mobile-img={index}
                className={`relative w-full rounded-[16px] overflow-hidden mb-4 md:mb-6 bg-gradient-to-br from-gray-200 to-gray-300 flex-shrink-0 ${isBigCard ? 'md:h-[372px]' : 'md:h-[280px]'}`}
                style={{
                  ...(mobileAspectRatio && {
                    aspectRatio: mobileAspectRatio
                  })
                }}
              >
                {/* Mobile Image */}
                <div className="md:hidden w-full h-full">
                  <CustomImage
                    src={feature.mobileImage}
                    alt={feature.title}
                    fill
                    className="object-cover object-top"
                  />
                </div>
                {/* Desktop Image */}
                <div className="hidden md:block w-full h-full">
                  <CustomImage
                    src={feature.desktopImage}
                    alt={feature.title}
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </div>

              {/* Content Container - Aligned to bottom */}
              <div className="flex flex-col md:mt-auto">
                {/* Title */}
                <h3 
                  className="text-[24px] md:text-[30px] font-[500] md:font-[450] leading-[110%] tracking-[-0.48px] md:tracking-[-0.6px] capitalize text-black mb-4 headers-font"
                >
                  {feature.title}
                </h3>

                {/* Bullet Points */}
                <ul className="space-y-2">
                  {feature.bullets.map((bullet, bulletIndex) => (
                    <li key={bulletIndex} className="flex items-start gap-2">
                      <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#AE7E56] text-white flex-shrink-0 mt-0.5">
                        <FaCheck className="w-3 h-3" />
                      </span>
                      <p className="text-base text-black leading-relaxed">{bullet}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            );
          })}
        </div>
      </div>
      </div>
    </Section>
  );
};

export default Comprehensive;
