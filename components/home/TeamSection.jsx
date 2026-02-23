"use client";

import ScrollArrows from "@/components/ScrollArrows";
import BrimaryButton from "@/components/ui/buttons/BrimaryButton";
import CustomContainImage from "@/components/utils/CustomContainImage";
import CustomImage from "@/components/utils/CustomImage";
import React, { useRef } from "react";
import { FaCheckCircle, FaRegCheckCircle } from "react-icons/fa";

const teamCards = [
  {
    name: "Dr. George Mankaryous",
    title: "M.D. CCFP",
    logo1: {
      src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/g-logo1.png",
      width: "w-[73.04px] md:w-[97.39px]",
    },
    logo2: {
      src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/g-logo2.png",
      width: "w-[57px] md:w-[76px]",
    },
    image: "https://myrocky.b-cdn.net/team-members/DrGeorge-Mankaryous.webp",
  },
  {
    name: "Mina Rizk",
    title: "R.Ph. MPharm",
    logo1: {
      src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/mina-logo1.png",
      width: "w-[56.96px] md-w-[97.39px] ml-2 mt-1",
      obj: "!object-cover scale-150",
    },
    logo2: {
      src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/mina-logo2.png",
      width: "w-[67.5px] md:w-[97.39px]",
    },
    image: "https://myrocky.b-cdn.net/team-members/DrMina-Rizk.webp",
  },
  {
    name: "Dr. Mena Mirhom",
    title: "M.D. FAPA",
    logo1: {
      src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/m-logo1.png",
      width: "w-[161.14px] md:w-[214.86px]",
    },
    logo2: {
      src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/m-logo2.png",
      width: "w-[53.52px] md:w-[71.36px]",
    },
    image: "https://myrocky.b-cdn.net/team-members/DrMena-Mirhom.webp",
  },
];

const trustedTeam = [
  {
    title: "Certified Specialists",
    description: "Over 20 years of experience in specialized medicine.",
  },
  {
    title: "Healthcare Reimagined",
    description:
      "Revolutionizing traditional medicine to deliver personalized care for all.",
  },
  {
    title: "Technology-Powered Care",
    description:
      "Advanced digital solutions making healthcare more convenient, effective and patient-centered.",
  },
];

const TeamSection = () => {
  const scrollContainerRef = useRef(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollLeft = container.scrollLeft;
      const cardWidth = container.querySelector('div')?.offsetWidth || 0;
      const gap = 16; // md:gap-4 = 1rem = 16px
      const scrollPosition = scrollLeft / (cardWidth + gap);
      const index = Math.round(scrollPosition / 2); // Divide by 2 since we show 2 cards at a time
      setActiveIndex(Math.min(index, 1)); // Max index is 1 (0 or 1)
    }
  };

  const scrollToCard = (index) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const cardWidth = container.querySelector('div')?.offsetWidth || 0;
      const gap = 16;
      container.scrollTo({
        left: index * 2 * (cardWidth + gap), // Multiply by 2 since we show 2 cards
        behavior: "smooth",
      });
      setActiveIndex(index);
    }
  };

  return (
    <div>
      <div></div>
      <div className="flex flex-col gap-[24px] md:gap-4 md:flex-row ">
        <div className="!w-full lg:!w-[800px] md:h-[420px] !text-left  !px-6">
          <CustomImage
            src="/convert_test/Vector.svg"
            width="24"
            height="24"
            className={"mb-[10px]"}
          ></CustomImage>
          <h2 className="text-[36px] md:text-[48px] max-w-[300px] md:max-w-full font-[550] leading-[36.8px] md:leading-[55.2px] tracking-[-0.01em]  md:tracking-[-0.02em] mb-3 md:mb-4 headers-font">
            Led by Health Experts
          </h2>
          <p className="text-[16px] md:text-[18px] mt-[16px] mb-[40px] ">
            Rocky Health delivers expert, evidence-based care that gets results.
          </p>
          <ul className="!text-left">
            {trustedTeam.map((a, i) => (
              <li
                key={a.title}
                className={`!flex !items-start !gap-2  ${
                  i == trustedTeam.length - 1 ? "!mb-0" : "!mb-[32px]"
                }`}
              >
                <span className="!w-5 !h-5 mt-[2px]">
                  <FaCheckCircle className="text-[#AE7E56]" />
                </span>

                <span>
                  <p className="!text-[14px] md:!text-[16px] !font-[500] !leading-[19.6px] md:!leading-[22.4px] mb-[4px]">
                    {a.title}
                  </p>
                  <span className="!text-[14px] lg:!text-[16px] !font-[400] !leading-[19.6px] md:!leading-[22.4px]">
                    {a.description}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <BrimaryButton
            href="/about-us"
            arrowIcon={true}
            className="w-[200px] mt-6 md:mt-8 text-center flex items-center justify-center bg-[#FFFFFF] py-3 px-6 rounded-full border-solid border-2 border-[black] hover:bg-gray-200"
          >
            <span className="text-sm font-medium">Meet Our Team</span>{" "}
          </BrimaryButton>
        </div>
        <div className="overflow-x-auto !no-scrollbar relative">
          <ScrollArrows scrollContainerRef={scrollContainerRef} />

          <div className="mx-auto">
            <div className="relative">
              <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex overflow-x-auto gap-2 items-start md:gap-4 snap-x snap-mandatory no-scrollbar"
              >
                {teamCards.map((card, index) => (
                  <div
                    key={index}
                    className="!w-[300px] md:!w-[384px] md:h-[545px]"
                  >
                    <div className="relative rounded-2xl overflow-hidden w-[280px] md:w-[384px] h-[306px] md:h-[420px] mb-4 md:mb-6 ">
                      <CustomImage
                        fill
                        src={card.image}
                        alt={card.name}
                        className={
                          index === 0
                            ? "object-[-10px_-13px]"
                            : index === 1
                            ? "object-[0_10px]"
                            : "object-[0_-45px]"
                        }
                      />
                    </div>
                    <h3 className="text-black text-[18px] lg:text-[20px] font-[500] leading-[20.7px] md:leading-[23px]">
                      {card.name}
                    </h3>
                    <p className="text-[#212121] text-[14px] lg:text-[16px] font-[400] leading-[19.6px] md:leading-[22.4px] mt-2">
                      {card.title}
                    </p>

                    {/* <div className="flex justify-start mt-4 space-x-3  w-full max-w-[230px] h-8">
                      <div className="relative w-full ">
                        <CustomImage fill src={card.logo1} />
                      </div>

                      <div className="relative w-full ">
                        <CustomImage fill src={card.logo2} />
                      </div>
                    </div> */}
                    <div className="flex justify-start mt-4 space-x-3 w-full  h-6 md:h-8">
                      <div
                        className={`relative h-6 md:h-8 ${card.logo1.width}`}
                      >
                        <CustomContainImage
                          fill
                          src={card.logo1.src}
                          alt={`${card.name} logo 1`}
                          className={card.logo1.obj}
                        />
                      </div>
                      <div
                        className={`relative h-6 md:h-8 ${card.logo2.width}`}
                      >
                        <CustomContainImage
                          fill
                          src={card.logo2.src}
                          alt={`${card.name} logo 2`}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

    <div className="flex justify-center items-center mt-6 md:mt-24">
        {/* Dots Navigation */}
        <div className="flex justify-center mt-6">
          {[0, 1].map((index) => (
            <button
              key={index}
              onClick={() => scrollToCard(index)}
              className={`w-12 h-2 transition-colors duration-300 ${
                index === 0 ? "rounded-l-full" : "rounded-r-full"
              } ${
                activeIndex === index ? "bg-black" : "bg-gray-300"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default TeamSection;
