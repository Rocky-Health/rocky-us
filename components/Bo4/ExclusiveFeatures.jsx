"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { FaHeart } from 'react-icons/fa6';

// Custom Chart Icon
const ChartIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className={className}>
    <g clipPath="url(#clip0_chart_icon)">
      <path d="M10 22C11.1 22 12 22.9 12 24C12 25.1 11.1 26 10 26C8.9 26 8 25.1 8 24C8 22.9 8.9 22 10 22ZM17 18C18.1 18 19 18.9 19 20C19 21.1 18.1 22 17 22C15.9 22 15 21.1 15 20C15 18.9 15.9 18 17 18ZM24 22C25.1 22 26 22.9 26 24C26 25.1 25.1 26 24 26C22.9 26 22 25.1 22 24C22 22.9 22.9 22 24 22ZM30 16V14H4V2H2V28C2 29.1 2.9 30 4 30H30V28H4V16H30ZM10 8C11.1 8 12 8.9 12 10C12 11.1 11.1 12 10 12C8.9 12 8 11.1 8 10C8 8.9 8.9 8 10 8ZM17 8C18.1 8 19 8.9 19 10C19 11.1 18.1 12 17 12C15.9 12 15 11.1 15 10C15 8.9 15.9 8 17 8ZM28 2C29.1 2 30 2.9 30 4C30 5.1 29.1 6 28 6C26.9 6 26 5.1 26 4C26 2.9 26.9 2 28 2Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_chart_icon">
        <rect width="32" height="32" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// Custom AI Health Icon
const AIHealthIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className={className}>
    <path d="M22 11V9H18V11H19V18H18V20H22V18H21V11H22ZM28.6182 25.9732L26.8946 22.5106C26.5557 21.8298 25.4444 21.8298 25.1055 22.5106L22 28.7497L20.8945 26.5284C20.7251 26.1881 20.3789 25.9732 20 25.9732H16V27.9821H19.3818L21.1054 31.4447C21.2748 31.7851 21.621 31.9999 21.9999 31.9999C22.3788 31.9999 22.725 31.7851 22.8944 31.4447L25.9999 25.2056L27.1054 27.4269C27.2748 27.7673 27.621 27.9821 27.9999 27.9821H31.9999V25.9732H28.6182ZM13 9H10L6.5034 20H8.5022L9.104 18H13.8821L14.5005 20H16.5005L13 9ZM9.7058 16.0001L11.3342 10.5889L11.5901 10.5865L13.2637 16.0001H9.7058ZM2 2H28V17H30V0H0V30H11V28H2V2Z" fill="currentColor"/>
  </svg>
);

// Custom Book/Guide Icon
const BookIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className={className}>
    <g clipPath="url(#clip0_book_icon)">
      <path d="M26 10H19V12H26V10Z" fill="currentColor"/>
      <path d="M26 15H19V17H26V15Z" fill="currentColor"/>
      <path d="M26 20H19V22H26V20Z" fill="currentColor"/>
      <path d="M13 10H6V12H13V10Z" fill="currentColor"/>
      <path d="M13 15H6V17H13V15Z" fill="currentColor"/>
      <path d="M13 20H6V22H13V20Z" fill="currentColor"/>
      <path d="M28 5H4C3.46973 5.00053 2.96133 5.21141 2.58637 5.58637C2.21141 5.96133 2.00053 6.46973 2 7V25C2.00053 25.5303 2.21141 26.0387 2.58637 26.4136C2.96133 26.7886 3.46973 26.9995 4 27H28C28.5303 26.9995 29.0387 26.7886 29.4136 26.4136C29.7886 26.0387 29.9995 25.5303 30 25V7C29.9995 6.46973 29.7886 5.96133 29.4136 5.58637C29.0387 5.21141 28.5303 5.00053 28 5ZM4 7H15V25H4V7ZM17 25V7H28V25H17Z" fill="currentColor"/>
    </g>
    <defs>
      <clipPath id="clip0_book_icon">
        <rect width="32" height="32" fill="white"/>
      </clipPath>
    </defs>
  </svg>
);

// Custom Injection/Medical Icon
const InjectionIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" className={className}>
    <path d="M5.04714 14.753C4.84514 14.525 4.74414 14.2575 4.74414 13.9506C4.74414 13.6437 4.84414 13.3787 5.04414 13.1556L9.08881 9.13328L7.34414 7.36662L6.63314 8.07762C6.41003 8.29984 6.14492 8.41095 5.83781 8.41095C5.53092 8.41095 5.26736 8.30106 5.04714 8.08128C4.84514 7.87973 4.74414 7.62317 4.74414 7.31162C4.74414 7.00006 4.84414 6.73695 5.04414 6.52228L8.02214 3.54429C8.24525 3.32206 8.51025 3.21095 8.81714 3.21095C9.12403 3.21095 9.3877 3.32495 9.60814 3.55295C9.80992 3.76206 9.91081 4.02195 9.91081 4.33262C9.91081 4.64328 9.81081 4.89906 9.61081 5.09995L8.89981 5.83328L10.6441 7.57762L14.6888 3.51095C14.9119 3.30362 15.1769 3.19995 15.4838 3.19995C15.7907 3.19995 16.0553 3.30362 16.2775 3.51095C16.485 3.73429 16.5888 3.9994 16.5888 4.30628C16.5888 4.61317 16.485 4.87773 16.2775 5.09995L15.2221 6.14428L26.0331 16.9333C26.4554 17.3704 26.6665 17.8977 26.6665 18.5153C26.6665 19.1328 26.4554 19.6536 26.0331 20.0776L24.6108 21.5109L30.5331 27.4223H27.3998L23.0441 23.0666L21.6221 24.5C21.1981 24.9222 20.6773 25.1333 20.0595 25.1333C19.4419 25.1333 18.9146 24.9222 18.4775 24.5L7.68881 13.6889L6.63314 14.7443C6.41003 14.9592 6.14492 15.0666 5.83781 15.0666C5.53092 15.0666 5.26736 14.9621 5.04714 14.753ZM9.22214 12.1333L20.0331 22.9443L24.4441 18.5223L21.8888 15.9556L19.7108 18.1333C19.5035 18.3482 19.2461 18.4574 18.9388 18.4609C18.6313 18.4647 18.3766 18.3647 18.1748 18.1609C17.9544 17.9387 17.8441 17.6748 17.8441 17.3693C17.8441 17.0637 17.9553 16.7998 18.1775 16.5776L20.3555 14.4L17.7998 11.8443L15.6221 14.0223C15.3988 14.2369 15.1337 14.3443 14.8268 14.3443C14.5199 14.3443 14.2554 14.2369 14.0331 14.0223C13.8331 13.8147 13.7331 13.5575 13.7331 13.2506C13.7331 12.9437 13.8331 12.6787 14.0331 12.4556L16.2108 10.2776L13.6441 7.71095L9.22214 12.1333Z" fill="currentColor"/>
  </svg>
);

const ExclusiveFeatures = () => {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const { scrollLeft } = container;
    const cardWidth = container.querySelector("[data-feature-card]")?.offsetWidth || 0;
    const gap = 24; // gap-6 = 24px
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
      icon: AIHealthIcon,
      title: "AI Health Assistant",
      description: "Personalized lifestyle, exercise, sleep and nutrition advice. Includes proactive notifications, reminders and tracking to develop healthier habits and get better results.",
      integrationNote: "Integrates with Apple Health Center"
    },
    {
      icon: ChartIcon,
      title: "Weight Loss Progress Tracker",
      description: "Log your weight, set goals, and monitor changes over time."
    },
    {
      icon: InjectionIcon,
      title: "Injection Tracker",
      description: "Gain confidence knowing you're on track and getting the most out of your treatment."
    },
    {
      icon: BookIcon,
      title: "Integrated Treatment Guides",
      description: "Receive customized guides that offer support tailored to wherever you are in your treatment plan."
    }
  ];

  return (
    <div className="w-full">
      {/* Headline */}
      <div className="text-center mb-6">
        <h2 className="text-center text-[32px] md:text-[48px] leading-[115%] tracking-tight font-[550] headers-font">
          <span className="text-[#AE7E56]">Exclusive Features </span>{' '}
          <span className="text-black">To Support Your Health & Weight Loss Journey</span>
        </h2>
      </div>

      {/* Sub-headline */}
      <p className="text-center w-full md:max-w-[573px] text-[16px] md:text-[18px] font-normal text-black mb-12 mx-auto leading-[140%]">
        Everything you need to stay on track, build better habits, and achieve lasting results—all in one seamless platform.
      </p>

      {/* Feature Cards Grid */}
      {/* Mobile: Horizontal Slider */}
      <div className="md:hidden">
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth pb-4 pl-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                data-feature-card
                className="bg-[#F5F4EF] rounded-2xl p-6 flex flex-col flex-shrink-0 snap-start w-[85vw] max-w-[400px]"
              >
                {/* Icon and Integration Note */}
                <div className="flex items-start justify-between mb-6">
                  <div className="w-8 h-8 flex items-center justify-center max-h-[32px]">
                    {IconComponent && (
                      <IconComponent className="w-full h-full text-black" />
                    )}
                  </div>
                  {feature.integrationNote && (
                    <div className="flex items-center gap-1 ">
                      <span className="text-[10px] font-normal text-black text-right leading-none w-[103px] mr-[8px]">{feature.integrationNote}</span>
                      <span className="bg-white w-[32px] h-[32px] aspect-square flex items-start justify-end rounded-[8px] p-1"> <FaHeart className="text-red-500 text-xs" /></span>
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-[20px] font-medium text-black mb-3 leading-[140%]">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-base font-normal text-[#000] leading-normal flex-grow">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Mobile Scroll Indicator */}
        <div className="flex justify-center items-center mt-4">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                const container = scrollContainerRef.current;
                if (container) {
                  const cardWidth = container.querySelector("[data-feature-card]")?.offsetWidth || 0;
                  const gap = 24;
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
      <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="bg-[#F5F4EF] rounded-2xl p-6 flex flex-col md:w-[584px] md:h-[216px]"
            >
              {/* Icon and Integration Note */}
              <div className="flex items-start justify-between mb-6">
                <div className="w-8 h-8 flex items-center justify-center max-h-[32px]">
                  {IconComponent && (
                    <IconComponent className="w-full h-full text-black" />
                  )}
                </div>
                {feature.integrationNote && (
                  <div className="flex items-center gap-1 ">
                    <span className="text-[10px] font-normal text-black text-right leading-none w-[103px] mr-[8px]">{feature.integrationNote}</span>
                    <span className="bg-white w-[32px] h-[32px] aspect-square flex items-start justify-end rounded-[8px] p-1"> <FaHeart className="text-red-500 text-xs" /></span>
                   
                  </div>
                )}
              </div>

              {/* Title */}
              <h3 className="text-[20px] font-medium text-black mb-3 leading-[140%]">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-base font-normal text-[#000] leading-normal flex-grow md:max-w-[570px]">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExclusiveFeatures;
