"use client";

import CustomImage from "@/components/utils/CustomImage";
import Section from "@/components/utils/Section";
import Link from "next/link";
import RockyFeatures from "./RockyFeatures";
import { useState } from "react";
import ProudPartnerLine from "@/components/ProudPartnerLine";
import HeroAnimatedHeading from "./HeroAnimatedHeading";
import CardTitle from "./CardTitle";

const HeroSection = ({ onOpenMenu }) => {
  const [TapActive, setTapActive] = useState("Services");

  const changeActiveTab = (type) => {
    setTapActive(type);
  };

  const handleServiceClick = (e) => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const services = [
    {
      title: "Lose weight",
      blackText: "Lose",
      accentText: "weight",
      subtitle: "Better Wellness, Through Science",
      image: "/home/CroppedWL.png",
      link: "/body-optimization",
      width: 250,
      height: 250,
      mobile_width: 140,
    },
    {
      title: "Regrow hair",
      blackText: "Regrow",
      accentText: "hair",
      subtitle: "",
      image: "/home/h_loss.png",
      link: "/hairloss",
      width: 1000,
      height: 1000,
      mobile_width: 244,
    },

    {
      title: "Improve your sex life",
      blackText: "Improve your",
      accentText: "sex life",
      subtitle: "Gain Confidence Back In Bed",
      image: "/home/sex1.png",
      link: "/sex",
      width: 220,
      height: 220,
      mobile_width: 120,
    },
  ];

  const Medications = [
    {
      name: "Cialis®",
      image: "/home/cialis.webp",
      link: "/product/cialis",
    },
    {
      name: "Viagra®",
      image: "/home/viagara.webp",
      link: "/product/viagra",
    },
    {
      name: "Ozempic®",
      image: "/home/ozempic.webp",
      link: "/product/ozempic",
    },
    {
      name: "Wegovy®",
      image: "/home/wegovy.webp",
      link: "/product/wegovy",
    },

    {
      name: "The Growth Plan",
      image: "/home/hair.webp",
      link: "/my-rocky-combo-pack?#prescription-hair-kit",
    },

    {
      name: "Chewalis",
      image: "/home/chewalis.webp",
      link: "/product/chewable-tadalafil",
    },
  ];

  const renderMedName = (name) => {
    if (name === "The Growth Plan") {
      return (
        <>
          <span className="md:hidden">
            The
            <br />
            Growth Plan
          </span>
          <span className="hidden md:inline">The Growth Plan</span>
        </>
      );
    } else if (name === "The Acne Cream") {
      return (
        <>
          <span className="hidden md:inline">{name}</span>
          <span className="md:hidden block">Acne</span>
        </>
      );
    }
    return name;
  };

  const features = [
    "Tailored treatment plans",
    "Unlimited medical support",
    "100% online & discreet",
  ];

  const fetures2 = [
    // {
    //   title: "CA-Certified Pharmacy",
    //   image: "/skin-care/icon1.svg",
    // },
    {
      title: "Personalized Treatments",
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/personalized.png",
    },
    {
      title: "Trusted by 350K+ Users",
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/trusted.png",
    },
    {
      title: "1:1 Medical Support",
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/medical.png",
    },
  ];
  return (
    <>
      <Section bg={`py-6 bg-white`}>
        {/* Hero Header */}
        <div className="flex flex-col lg:flex-row  items-start gap-8 md:gap-60 mb-12 ">
          <div className="">
            <HeroAnimatedHeading
              staticText="Online healthcare made "
              words={["Simple", "Convenient", "For You"]}
            />
          </div>

          {/* Features List */}
          <div className="flex flex-col gap-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#C19A6B] flex items-center justify-center flex-shrink-0">
                  <svg
                    width="12"
                    height="10"
                    viewBox="0 0 12 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1 5L4.5 8.5L11 1.5"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span className="text-[16px] md:text-[15px] text-black">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-b pb-[16px] font-[500] border-gray-200 flex justify-start items-start gap-[24px] mb-[24px]">
          <p
            className={`text-[16px] md:text-[20px] font-[500] leading-[115%] tracking-tight text-black cursor-pointer ${TapActive == "Services" ? "opacity-100 border-b border-black pb-[16px] -mb-[16px]" : "opacity-50"}`}
            onClick={() => changeActiveTab("Services")}
          >
            Treatments
          </p>
          <p
            className={`text-[16px] md:text-[20px] leading-[115%] tracking-tight text-black cursor-pointer ${TapActive == "Medications" ? "opacity-100 border-b border-black pb-[16px] -mb-[16px]" : "opacity-50"}`}
            onClick={() => changeActiveTab("Medications")}
          >
            Medications
          </p>
        </div>

        {TapActive == "Services" && (
          <>
            <div>
              {/* Services Grid */}
              <div className="grid-cols-1 md:grid-cols-7 gap-[8px] md:gap-[16px] mb-12 hidden md:grid">
                {services.map((service, index) => (
                  <Link
                    key={index}
                    href={service.link}
                    onClick={handleServiceClick}
                    className={`group relative bg-[#F0EEEA] rounded-[8px] overflow-hidden hover:shadow-lg h-[200px] md:h-[280px] transition-shadow duration-300 ${
                      index % 3 === 0 ? "md:col-span-3" : "md:col-span-2"
                    }`}
                  >
                    {/* Hover background overlay - opacity transitions (bg-image itself cannot transition) */}
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        backgroundImage:
                          "url('https://myrocky.b-cdn.net/WP%20Images/Global%20Images/card_bg.png')",
                      }}
                      aria-hidden
                    />
                    {/* Background Image */}
                    <CustomImage
                      src={service.image}
                      alt={service.title}
                      width={service.width}
                      height={service.height}
                      className={`object-cover absolute bottom-0 right-0`}
                    />

                    {/* Content - Top positioned */}
                    <div className="absolute subheader-font top-[16px] left-[16px] md:top-[24px] md:left-[24px]">
                      {/* <h3
                                                className={`font-[500] text-black mb-1 ${
                                                    index === 0
                                                        ? "text-[24px] md:text-[26px]"
                                                        : "text-[24px] md:text-[26px]"
                                                }`}
                                            >
                                                {service.title}
                                            </h3> */}
                      <CardTitle
                        blackText={service.blackText}
                        accentText={service.accentText}
                      />
                    </div>

                    {/* Arrow Icon - Bottom Right */}
                    <div className="absolute bottom-6 left-6 ">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M4 10H16M16 10L10 4M16 10L10 16"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </>
        )}

        {TapActive == "Medications" && (
          <>
            <div className="grid md:grid-cols-4 md:gap-[15px] grid-cols-2 gap-[8px] mb-12 ">
              {Medications.map((med) => {
                return (
                  <Link
                    key={med.name}
                    href={med.link}
                    className="bg-[#F0EEEA] w-[161px] h-[161px] md:w-[288px] md:h-[288px] relative rounded-[8px] md:px-[24px] md:py-[28px] px-[16px] overflow-hidden group flex flex-col"
                  >
                    <div className="flex justify-center items-center h-full">
                      <CustomImage
                        src={med.image}
                        width={134}
                        height={134}
                        className={`md:w-[134px] md:h-[134px] w-[84px] h-[84px]`}
                      />
                    </div>
                    <div className="absolute bottom-2 md:bottom-4 left-0 right-0 px-[16px] md:px-[24px] flex justify-between items-end">
                      <p className="text-[16px] md:text-[20px] font-[500] leading-[140%] ">
                        {renderMedName(med.name)}
                      </p>
                      <div>
                        <div className="w-[24px] h-[24px] md:w-[32px] md:h-[32px] rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4 10H16M16 10L10 4M16 10L10 16"
                              stroke="black"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <div className=" rounded-[24px] bg-white p-2 border border-1 border-gray-200">
          {/* Bottom CTA Section */}
          <div className="flex flex-col md:flex-row items-center justify-between bg-white border-b border-gray-200 m-2 md:p-4">
            <div className="flex items-center gap-4 mb-6 md:mb-0">
              <div className="flex ">
                <div className="relative md:w-[89px] w-[84px]">
                  <CustomImage
                    src="/home/happier.png"
                    width={89}
                    height={64}
                    className="md:w-[89px] md:h-[64px] w-[84px] h-[60]"
                  />
                </div>
              </div>
              <p className="text-[18px] md:text-[24px] font-medium">
                Better care for a healthier, happier you
              </p>
            </div>

            <button
              onClick={onOpenMenu}
              className="bg-black w-full md:w-auto text-white px-8 md:py-4 py-2  h-[48px] rounded-full text-[16px]  hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              Explore All Treatments
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 10H16M16 10L10 4M16 10L10 16"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <RockyFeatures cards={fetures2} />
        </div>

        <div className="mx-auto flex justify-center items-center mt-[32px]  md:mt-[48px]">
          <ProudPartnerLine
            sectionClassName="w-[285px]"
            section={true}
            isCover={true}
            bg="bg-transparent max-w-[285px]"
          />
        </div>
      </Section>
    </>
  );
};

export default HeroSection;
