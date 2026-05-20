import React from "react";
import Image from "next/image";
import { FaCheckCircle } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";

function MerchHero() {
  // Image arrays for each column
  const leftColumnImages = [
    {
      src: "https://myrocky.b-cdn.net/WP%20Images/merch/hero1.webp",
      alt: "Person with braided hair sitting at table with white shirt",
    },
    {
      src: "https://myrocky.b-cdn.net/WP%20Images/merch/herp22.webp",
      alt: "Group of men in black hoodies with illuminated MYROCKY sign",
    },
  ];

  const rightColumnImages = [
    {
      src: "https://myrocky.b-cdn.net/WP%20Images/merch/hero33.webp",
      alt: "Man in black hoodie with plant background",
    },
    { src: "https://myrocky.b-cdn.net/WP%20Images/merch/hero44.webp", alt: "Two men on couch with Beatles book" },

  ];

  // Render image column function
  const renderImageColumn = (images, animationClass) => (
    <div className="relative overflow-hidden w-full h-[427px] md:w-[288px] md:h-full">
      <div className={`${animationClass} flex flex-col gap-[9.5px] md:gap-4`}>
        {/* First set of images */}
        {images.map((image, index) => (
          <div
            key={`first-${index}`}
            className="rounded-[10.67px] md:rounded-2xl overflow-hidden"
          >
            <Image
              src={image.src}
              alt={image.alt}
              className="w-full h-[237.06px] md:w-[288px] md:h-[400px] object-cover"
              width={288}
              height={400}
              loading="lazy"
              quality={85}
              sizes="(max-width: 768px) 100vw, 288px"
            />
          </div>
        ))}

        {/* Duplicate set for seamless loop */}
        {images.map((image, index) => (
          <div
            key={`duplicate-${index}`}
            className="rounded-[10.67px] md:rounded-2xl overflow-hidden"
          >
            <Image
              src={image.src}
              alt={image.alt}
              className="w-full h-[237.06px] md:w-[288px] md:h-[400px] object-cover"
              width={288}
              height={400}
              loading="lazy"
              quality={85}
              sizes="(max-width: 768px) 100vw, 288px"
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="lg:h-[680px]   bg-[#F5F4EF] overflow-hidden ">
        <div className="w-full md:max-w-[1200px] mx-auto h-full  flex items-center justify-center gap-20">
          <div className="flex flex-col lg:flex-row gap-[40px] md:gap-[80px]  xl:gap-[144px] items-center">
            {/* Left Section - Promotional Content */}
            <div className="md:w-[428px] md:h-[467px] my-auto  px-5">
              {/* Headline */}

              {/* Main Title */}
              <h1 className="pt-8 md:pt-0 lg:mb-4 mb-3 headers-font text-[40px] md:text-7xl  text-black  tracking-[-1%] leading-[115%] ">
                Merch, For the Culture.
              </h1>

              <p className="text-lg text-black font-[400] leading-[140%] tracking-[0%] mb-4 md:mb-8">
                Essential. Timeless. Original.
              </p>
              {/* Key Features */}
              <div className="flex flex-col gap-4 mb-6 md:mb-10">
                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="text-[#AE7E56] text-[17.5px] w-[17.5px] h-[17.5px]" />
                  <span className="text-black font-normal text-[16px] leading-[140%] tracking-[0%]">
                    Crafted in US
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="text-[#AE7E56] text-[17.5px] w-[17.5px] h-[17.5px]" />

                  <span className="text-black font-normal text-[16px] leading-[140%] tracking-[0%]">
                    Clean & Simple
                  </span>
                </div>

                <div className="flex items-center space-x-3">
                  <FaCheckCircle className="text-[#AE7E56] text-[17.5px] w-[17.5px] h-[17.5px]" />

                  <span className="text-black font-normal text-[16px] leading-[140%] tracking-[0%]">
                    Built to Last{" "}
                  </span>
                </div>
              </div>

              {/* Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 h-[48px] w-full md:w-[248px]">
                <a
                  href="#shop-banner"
                  className=" h-[48px] bg-black text-white px-8 py-4 rounded-full font-medium text-base tracking-[0%] leading-[140%] hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                >
                  <span>Shop The Collection</span>
                  <FaArrowRight width={18} height={18} />
                </a>
              </div>
            </div>

            {/* Right Section - Animated Image Grid */}
            <div className="md:w-[592px] md:h-[680px] grid grid-cols-2 md:gap-4 gap-[9.5px] h-full w-full px-5 overflow-hidden pb-0 md:p-0">
              {/* Left Column - Scrolling Up */}
              {renderImageColumn(leftColumnImages, "animate-scroll-up")}

              {/* Right Column - Scrolling Down */}
              {renderImageColumn(rightColumnImages, "animate-scroll-down")}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default MerchHero;
