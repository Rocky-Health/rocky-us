import React from 'react';
import CustomImage from '@/components/utils/CustomImage';
import BrimaryButton from '@/components/ui/buttons/BrimaryButton';
import { FaCheck } from 'react-icons/fa6';

const ComprehensiveProgram = () => {
  const consultationHref = "/wl-pre-consultation/";

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
      {/* Headline */}
      <div className="text-center mb-6 md:mb-8">
        <h2 className="text-[32px] md:text-[48px] lg:text-[56px] font-[550] leading-[115%] tracking-tight headers-font mb-4">
          <span 
            className="text-[#AE7E56] text-center text-[32px] font-[600] leading-[115%] tracking-[-0.64px] capitalize headers-font"

          > 
            A comprehensive GLP-1 program
          </span>
          {` `}
          <span className="text-black">With Unmatched Results</span>
        </h2>
        <p 
          className="text-[16px] md:text-[18px] text-black text-center font-normal leading-[140%] max-w-3xl mx-auto"
        >
        Our holistic approach goes beyond medication alone. With expert-led care, personalized treatments, and continuous support, you'll achieve faster, safer, and lasting results.
        </p>
      </div>

      {/* Features Grid */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 md:mb-12">
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
              <ul className="space-y-3">
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

      {/* Call to Action Button */}
      <div className="flex justify-center mb-10 md:mb-[72px]">
        <BrimaryButton
          href={consultationHref}
          arrowIcon={true}
          className="flex h-[48px] w-full md:w-auto md:px-[32px] justify-center items-center gap-2 rounded-[64px] bg-[#000] text-white"
        >
          Start Your Weight Loss Journey
        </BrimaryButton>
      </div>
    </div>
  );
};

export default ComprehensiveProgram;
