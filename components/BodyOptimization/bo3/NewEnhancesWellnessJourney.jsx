"use client";

import AccordionList from "@/components/AccordionList";
import { useRef, useState, useEffect, useCallback } from "react";
import CustomContainImage from "@/components/utils/CustomContainImage";

const accordionData = [
  {
    subtitle: "Today",
    title: "Start your initial consultation ($99)",
    content:
      "Share your health history and weight loss goals with us online to get started. Same day appointment to meet our licensed medical provider.",
    image: "https://myrocky.b-cdn.net/WP%20Images/bo3/new/Startyour.jpg",
    isFirst: true,
  },
  {
    subtitle: "In 3 days",
    title: "Take a lab test",
    content:
      "If you're a candidate for treatment, our clinician will provide you with the appropriate lab requisition or alternatively you can provide us with recent results.",
    image: "https://myrocky.b-cdn.net/WP%20Images/bo3/new/Takealabtest.jpg",
  },
  {
    subtitle: "Within 3 days",
    title: "Provider writes an Rx",
    content:
      "You will have the opportunity to ask any questions you may have prior to a prescription being issued. Your clinician will provide you with advice best suited to your needs.",
    image: "https://myrocky.b-cdn.net/WP%20Images/bo3/new/Provider.jpg",
  },
  {
    subtitle: "Free & Discreet 2-Day Delivery",
    title: "Get your medication",
    content:
      "Your medication will arrive within 1-2 business days. Sometimes it may take longer depending on where you live.",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/bo3/new/Getyourmedication.jpg",
  },
  {
    subtitle: "On-going care & support",
    title: "Begin treatment",
    content:
      "You'll have access to your clinician and the pharmacy team at all times should you have any questions.",
    image: "https://myrocky.b-cdn.net/WP%20Images/bo3/new/Begintreatment.jpg",
  },
];

const EnhancesWellnessJourney = () => {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Helper function to get card width
  const getCardWidth = useCallback(() => {
    return typeof window !== "undefined" && window.innerWidth >= 768
      ? 320 + 16 // md:gap-4 (16px)
      : 280 + 8; // gap-2 (8px) for mobile
  }, []);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft } = container;

    const cardWidth = getCardWidth();
    const index = Math.round(scrollLeft / cardWidth);
    const maxIndex = Math.max(0, accordionData.length - 1);

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
    <>
      <h2 className="text-center text-[32px] md:text-5xl font-[550] leading-[36.8px] md:leading-[55.2px] tracking-[-0.01em]  md:tracking-[-0.02em] mb-3 md:mb-4 headers-font">
        How MyRocky Enhances Your Wellness Journey
      </h2>
      <p className="text-center mx-auto text-base md:text-lg font-[400] leading-[22.4px] md:leading-[25.2px] mb-10 md:mb-14 max-w-[300px] md:max-w-full ">
        Digital Healthcare, without the long wait times.
      </p>

      {/* Mobile Layout */}
      <div className="md:hidden">
        {/* Horizontal Scrolling Cards */}
        <div className="relative mb-6">
          <div
            ref={scrollContainerRef}
            className="flex gap-2 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {accordionData.map((item, index) => (
              <div key={index} className="flex-shrink-0 snap-start w-[280px]">
                {item.image && (
                  <div className="relative w-full h-[320px] overflow-hidden rounded-[16px]">
                    <CustomContainImage
                      src={item.image}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="mt-6">
                  <p className="text-[#AE7E56] text-[13px] font-medium leading-normal poppins-font mb-2">
                    {item.subtitle}
                  </p>
                  <h3 className="text-base text-black font-medium leading-[140%] tracking-[-0.32px] poppins-font mb-4">
                    {item.title}
                  </h3>
                  <p className="text-sm text-black font-normal leading-[140%] poppins-font">
                    {item.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center items-center gap-2 mt-4">
            <div className="relative w-20 h-2 bg-[#EFEFEA] rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-black rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${100 / accordionData.length}%`,
                  transform: `translateX(${activeIndex * 100}%)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <AccordionList data={accordionData} />
      </div>
    </>
  );
};

export default EnhancesWellnessJourney;
