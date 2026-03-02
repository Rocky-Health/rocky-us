"use client";
import React from "react";
import Image from "next/image";

const GetSocialWithMyRocky = () => {
  const socialImages = [
    {
      id: 1,
      src: "https://myrocky.b-cdn.net/WP%20Images/merch/new.webp",
      alt: "Person with curly hair wearing black top with green plants background",
      width: 330,
      height: 470,
      mobileWidth: 250,
      mobileHeight: 284,
    },
    {
      id: 2,
      src: "https://myrocky.b-cdn.net/WP%20Images/merch/new2.webp",
      alt: "Person with dreadlocks wearing black long-sleeved top and bucket hat",
      width: 330,
      height: 470,
      mobileWidth: 250,
      mobileHeight: 284,
    },
    {
      id: 3,
      src: "https://myrocky.b-cdn.net/WP%20Images/merch/new3.webp",
      alt: "Group of five people wearing black MyRocky merchandise",
      width: 330,
      height: 470,
      mobileWidth: 250,
      mobileHeight: 284,
    },
    {
      id: 4,
      src: "https://myrocky.b-cdn.net/WP%20Images/merch/new4.webp",
      alt: "Three people in black MyRocky merchandise with green plants",
      width: 330,
      height: 470,
      mobileWidth: 250,
      mobileHeight: 284,
    },
    {
      id: 5,
      src: "https://myrocky.b-cdn.net/WP%20Images/merch/new5.webp",
      alt: "Person from back wearing black crop top and beanie",
      width: 330,
      height: 470,
      mobileWidth: 250,
      mobileHeight: 284,
    },
    {
      id: 6,
      src: "https://myrocky.b-cdn.net/WP%20Images/merch/new6.webp",
      alt: "Person with curly hair wearing black top with green plants background",
      width: 330,
      height: 470,
      mobileWidth: 250,
      mobileHeight: 284,
    },
  ];

  return (
    <div className="lg:py-24 py-14 bg-[#F5F4EF] overflow-hidden ">
      <div className="w-full">
        {/* Header */}
        <div className="max-w-[1200px] mx-auto md:mb-24 px-5 md:px-8 flex md:items-start items-center gap-4 md:gap-0 flex-col md:flex-row md:justify-between justify-center">
          <h2 className="text-center md:text-left md:text-5xl text-[32px]  text-black headers-font leading-[115%] tracking-[-2%]">
            Get Social With MyRocky
          </h2>
          <div className=" bg-black md:h-[48px] md:w-[161px] h-[55px] w-[189px]  flex items-center justify-center text-white px-6  rounded-[64px] md:text-[16px] text-[20px] font-medium leading-[140%] tracking-[0%]">
            #MyRockyMerch
          </div>
        </div>

        {/* Enhanced Marquee Gallery */}
        <div className="w-full py-8 md:py-0 marquee-container">
          <div className="flex items-center min-w-max animate-marquee-seamless">
            {/* Create seamless alternating pattern - triple the images for smooth loop */}
            {[...Array(3)].map((_, setIndex) =>
              socialImages.map((image, index) => {
                return (
                  <div
                    key={`set-${setIndex}-${image.id}`}
                    className="flex-shrink-0 mx-1 md:mx-5 marquee-item"
                  >
                    <div
                      className={`rounded-[16px] overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 ${
                        index % 2 === 0
                          ? "w-[250px] h-[362px] md:w-[330px] md:h-[470px] rounded-[16px]"
                          : "w-[250px] h-[284px] md:w-[330px] md:h-[370px] rounded-[16px]"
                      }`}
                    >
                      <Image
                        src={image.src}
                        alt={image.alt}
                        width={330}
                        height={470}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                        loading="lazy"
                        quality={85}
                        sizes="(max-width: 768px) 140px, 330px"
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="max-w-[1200px] mx-auto text-center md:mt-14 px-4">
          <div className="max-w-[277px] md:max-w-[645px] mx-auto">
            <p className="text-[#000000] md:text-lg text-base font-[400] leading-[115%] tracking-[-2%]">
              Join the community and tag{" "}
              <span className="font-medium text-[#AE7E56]">#MyRockyMerch</span>{" "}
              for a chance to be featured!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetSocialWithMyRocky;
