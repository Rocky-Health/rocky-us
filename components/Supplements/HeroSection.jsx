"use client";
import { FaCheckCircle } from "react-icons/fa";
import CustomImage from "../utils/CustomImage";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa6";
import Link from "next/link";
import CollapsibleDiv from "./CollapsibleDiv";
import { useRef } from "react";

const HeroSection = ({
  SliderImages = [
    "/supplements/product.png",
    "/supplements/product.png",
    "/supplements/product.png",
    "/supplements/product.png",
  ],

  product = "Essential Night Boost",
}) => {
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };
  return (
    <>
      <div className="max-w-[1184px] mx-auto lg:pb-[48px] border-b-[3px] border-b-[#EFEFEF]">
        {/* Desktop Version */}
        <div className="hidden lg:flex flex-col mt-[40px] lg:flex-row items-start justify-between gap-6">
          {/* Left Side: Slider */}
          <div className="w-full lg:w-[63%]">
            <div className="bg-[#F5F4F3] w-auto  rounded-lg relative p-6">
              {/* BestSeller Label */}
              <div className="absolute top-[20px] left-[20px] bg-[#FAEDA7] border-[2px] border-[#F5F4F3] rounded-md px-3 py-1">
                <p className="font-[POPPINS] font-medium text-[14px] leading-[100%] tracking-[0px]">
                  Best Seller
                </p>
              </div>
              {/* Slider Image */}
              <div
                ref={sliderRef}
                className="flex overflow-x-auto snap-x snap-mandatory touch-pan-x scroll-smooth whitespace-nowrap scrollbar-hide"
              >
                {SliderImages.map((image, index) => (
                  <div key={index} className="flex-shrink-0 w-full snap-start">
                    <CustomImage
                      src={image}
                      height="1000"
                      width="1000"
                    ></CustomImage>
                  </div>
                ))}
              </div>
              <div className="flex justify-center items-center gap-4">
                <div>
                  <div
                    onClick={scrollLeft}
                    className="bg-white rounded-full p-2"
                  >
                    <FaArrowLeft />
                  </div>
                </div>

                {SliderImages.map((thumbnail, index) => (
                  <div
                    key={index}
                    className="w-[80px] h-[80px] bg-white rounded-lg flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-blue-500 transition"
                    onClick={() => {
                      if (sliderRef.current) {
                        sliderRef.current.scrollTo({
                          left: (index - 1) * sliderRef.current.offsetWidth,
                          behavior: "smooth",
                        });
                      }
                    }}
                  >
                    <CustomImage
                      src={thumbnail}
                      height="1000"
                      width="1000"
                    ></CustomImage>
                  </div>
                ))}

                <div>
                  <div
                    onClick={scrollRight}
                    className="bg-white rounded-full p-2"
                  >
                    <FaArrowRight />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-left items-center gap-2 mt-[8px]">
              <div className="bg-[#F5F4F3] rounded-[10px]">
                <p className="font-poppins font-medium leading-[100%]  text-[13px] tracking-[0px] px-3 py-1">
                  Made in US
                </p>
              </div>
              <div className="bg-[#F5F4F3] rounded-[10px]">
                <p className="font-poppins font-medium leading-[100%]  text-[13px] tracking-[0px] px-3 py-1">
                  Non GMO - no fillers or chemicals
                </p>
              </div>
              <div className="bg-[#F5F4F3] rounded-[10px]">
                <p className="font-poppins font-medium  leading-[100%]  text-[13px] tracking-[0px] px-3 py-1">
                  Third-party tested for purity and potency
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="w-full lg:w-[40%] p-2">
            <h1 className="text-[32px] lg:text-[40px] font-[550]  leading-[115%] tracking-[-2%] mb-[6px]">
              {product}
            </h1>
            <h2 className="text-[13px] lg:text-[16px] font-medium  leading-[115%] tracking-[-2%] mb-[16px]">
              60 capsules
            </h2>
            <p className="text-[14px] leading-[100%] font-[POPPINS] font-normal text-[#212121] mb-[24px]">
              Night Boost gives you a natural sleep aid.
            </p>
            <ul className="mb-[24px]">
              <li className="flex items-center gap-2 mb-[8px]">
                <FaCheckCircle className="text-[#AE7E56] text-[20px]" />
                <span className="font-[POPPINS] leading-[130%] text-[14px] font-normal  ">
                  Sleep deeper and wake up refreshed
                </span>
              </li>
              <li className="flex items-center gap-2 mb-[8px]">
                <FaCheckCircle className="text-[#AE7E56] text-[20px]" />
                <span className="font-[POPPINS] leading-[130%] text-[14px] font-normal  ">
                  Ease your body into calm
                </span>
              </li>
              <li className="flex items-center gap-2 mb-[8px]">
                <FaCheckCircle className="text-[#AE7E56] text-[20px]" />
                <span className="font-[POPPINS] leading-[130%] text-[14px] font-normal  ">
                  Help your body relax
                </span>
              </li>
            </ul>
            {/* Frequency Options */}
            <p className="text-[14px] font-[POPPINS] font-medium leading-[140%] tracking-[0px] mb-[8px]">
              Frequency:
            </p>
            <div className=" ">
              <div className="bg-[#F5F4EF] p-[16px] border-[1px]   rounded-t-2xl border-[#D9D9D5]">
                <div className=" flex justify-between items-start  mb-[8px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="subscribe"
                      name="subscribe"
                      value="subscribe"
                      className="accent-[#AE7E56] w-[20px] h-[20px]"
                    />
                    <label
                      htmlFor="Subscribe & Save"
                      className="text-[16px] font-[550] leading-[100%] tracking-[0px]"
                    >
                      Subscribe & Save
                    </label>

                    {/* Discount Label */}
                    <span className="flex justify-center items-center bg-white border-[1px] border-[#D9D9D9] rounded-xl leading-[100%] h-[8px] p-[8px] font-[POPPINS] font-medium text-[12px]">
                      25% Off
                    </span>
                  </div>
                  <div className="text-end">
                    {/* Price Before */}
                    <span className="font-[450] text-[16px] mr-[4px] line-through">
                      $40.00
                    </span>
                    {/* Current Price */}
                    <span className="font-[550] text-[16px] ">$30.00</span>
                    {/* Serving Charge */}
                    <p className="text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px]">
                      $0.50/Serving
                    </p>
                  </div>
                </div>

                {/* Select Options */}
                <select className="h-[32px] mb-[4px] w-full bg-white border-[1px] border-[#D9D9D5] rounded-xl px-4 text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px] ">
                  <option value="each-30-days">
                    Delivery every 30 days (Most popular)
                  </option>
                </select>

                <p className="text-[10px] px-2 font-[POPPINS] font-normal leading-[100%] tracking-[0px]">
                  Pause, skip, or cancel at any time
                </p>
              </div>

              {/* Second Option */}
              <div className="p-[16px] border-[1px]   rounded-b-2xl border-[#D9D9D5]">
                <div className=" flex justify-between items-start mb-[8px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="oneTime"
                      name="subscribe"
                      value="oneTime"
                      className="accent-[#AE7E56] w-[20px] h-[20px]"
                    />
                    <label
                      htmlFor="One-Time Purchase"
                      className="text-[16px] font-[550] leading-[100%] tracking-[0px]"
                    >
                      One-Time Purchase
                    </label>
                  </div>
                  <div className="text-end">
                    {/* Current Price */}
                    <span className="font-[550] text-[16px] pl-1 text-right">
                      $40.00
                    </span>
                    {/* Serving Charge */}
                    <p className="text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px] ">
                      $0.75/Serving
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="#"
              className="bg-black mb-[24px] rounded-full px-6 mt-[24px] h-[48px] text-white font-[POPPINS] flex justify-between items-center"
            >
              <span className="text-[16px] leading-[130%] font-semibold  ">
                Add to Cart
              </span>
              <div>
                {/* Price Before */}
                <span className="font-[400] text-[16px] mr-[4px] line-through">
                  $40.00
                </span>
                {/* Current Price */}
                <span className="font-[600] text-[16px] ">$30.00</span>
              </div>
            </Link>

            {/* Collabsed Div */}
            <div>
              <CollapsibleDiv
                show={true}
                title="What is Night Boost?"
                description="Night boost is a natural sleep support supplement made with gentle,
                            effective ingredients like L-theanine, magnesium bisglycinate, GABA,
                            glycine, and inositol—formulated to help your body relax and ease into
                            a deep, restful sleep."
              />

              <CollapsibleDiv
                title="Why Night Boost?"
                description="Night boost is a natural sleep support supplement made with gentle,
                            effective ingredients like L-theanine, magnesium bisglycinate, GABA,
                            glycine, and inositol—formulated to help your body relax and ease into
                            a deep, restful sleep."
              />

              <CollapsibleDiv
                title="How to take Night Boost?"
                description="Night boost is a natural sleep support supplement made with gentle,
                            effective ingredients like L-theanine, magnesium bisglycinate, GABA,
                            glycine, and inositol—formulated to help your body relax and ease into
                            a deep, restful sleep."
              />
            </div>

            <div className="border-[1px] border-[#D9D9D5]  rounded-lg p-6 mt-[24px]">
              <CustomImage
                src="/supplements/LogosHS.png"
                height="1000"
                width="1000"
              ></CustomImage>
            </div>
          </div>
        </div>

        {/* 
        
        /*
        /*
        /*
        /*
          Mobile Version
        /*
        /*
        /*
        /*
        */}
        <div className="flex lg:hidden flex-col mt-[40px] lg:flex-row items-start justify-between gap-6">
          {/* Left Side: Slider */}
          <div className="w-full lg:w-[63%]">
            <div className="pl-[20px]">
              <h1 className="text-[32px] lg:text-[40px] font-[550]  leading-[115%] tracking-[-2%] mb-[6px]">
                {product}
              </h1>
              <h2 className="text-[13px] lg:text-[16px] font-medium  leading-[115%] tracking-[-2%] mb-[16px]">
                60 capsules
              </h2>
              <p className="text-[14px] leading-[100%] font-[POPPINS] font-normal text-[#212121] mb-[24px]">
                Night Boost gives you a natural sleep aid.
              </p>
            </div>
            <div className="bg-[#F5F4F3] w-auto  rounded-lg relative p-6">
              {/* BestSeller Label */}
              <div className="absolute top-[20px] left-[20px] bg-[#FAEDA7] border-[2px] border-[#F5F4F3] rounded-md px-3 py-1">
                <p className="font-[POPPINS] font-medium text-[14px] leading-[100%] tracking-[0px]">
                  Best Seller
                </p>
              </div>
              {/* Slider Image */}
              <div
                ref={sliderRef}
                className="flex overflow-x-auto snap-x snap-mandatory touch-pan-x scroll-smooth whitespace-nowrap scrollbar-hide"
              >
                {SliderImages.map((image, index) => (
                  <div key={index} className="flex-shrink-0 w-full snap-start">
                    <CustomImage
                      src={image}
                      height="1000"
                      width="1000"
                    ></CustomImage>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center items-center gap-4">
              {SliderImages.map((thumbnail, index) => (
                <div
                  key={index}
                  className="w-[80px] h-[80px] bg-white rounded-lg flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-blue-500 transition"
                  onClick={() => {
                    if (sliderRef.current) {
                      sliderRef.current.scrollTo({
                        left: (index - 1) * sliderRef.current.offsetWidth,
                        behavior: "smooth",
                      });
                    }
                  }}
                >
                  <CustomImage
                    src={thumbnail}
                    height="1000"
                    width="1000"
                  ></CustomImage>
                </div>
              ))}
            </div>

            <div className="flex overflow-x-auto scrollbar-hide whitespace-nowrap gap-4 mt-[8px]">
              <div className="bg-[#F5F4F3] rounded-[10px]">
                <p className="font-poppins font-medium leading-[100%]  text-[13px] tracking-[0px] px-3 py-1">
                  Made in US
                </p>
              </div>
              <div className="bg-[#F5F4F3] rounded-[10px] w-fit ">
                <p className="font-poppins font-medium leading-[100%]  text-[13px] tracking-[0px] px-3 py-1">
                  Non GMO - no fillers or chemicals
                </p>
              </div>
              <div className="bg-[#F5F4F3] rounded-[10px] w-fit ">
                <p className="font-poppins font-medium  leading-[100%]  text-[13px] tracking-[0px] px-3 py-1">
                  Third-party tested for purity and potency
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Details */}
          <div className="w-full lg:w-[40%] p-2">
            <ul className="mb-[24px]">
              <li className="flex items-center gap-2 mb-[8px]">
                <FaCheckCircle className="text-[#AE7E56] text-[20px]" />
                <span className="font-[POPPINS] leading-[130%] text-[14px] font-normal  ">
                  Sleep deeper and wake up refreshed
                </span>
              </li>
              <li className="flex items-center gap-2 mb-[8px]">
                <FaCheckCircle className="text-[#AE7E56] text-[20px]" />
                <span className="font-[POPPINS] leading-[130%] text-[14px] font-normal  ">
                  Ease your body into calm
                </span>
              </li>
              <li className="flex items-center gap-2 mb-[8px]">
                <FaCheckCircle className="text-[#AE7E56] text-[20px]" />
                <span className="font-[POPPINS] leading-[130%] text-[14px] font-normal  ">
                  Help your body relax
                </span>
              </li>
            </ul>
            {/* Frequency Options */}
            <p className="text-[14px] font-[POPPINS] font-medium leading-[140%] tracking-[0px] mb-[8px]">
              Frequency:
            </p>
            <div className=" ">
              <div className="bg-[#F5F4EF] p-[16px] border-[1px]   rounded-t-2xl border-[#D9D9D5]">
                <div className=" flex justify-between items-start  mb-[8px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="subscribe"
                      name="subscribe"
                      value="subscribe"
                      className="accent-[#AE7E56] w-[20px] h-[20px]"
                    />
                    <label
                      htmlFor="Subscribe & Save"
                      className="text-[16px] font-[550] leading-[100%] tracking-[0px]"
                    >
                      Subscribe & Save
                      <span className="block leading-[100%] mt-[2px]  font-[POPPINS] font-medium text-[12px]">
                        <b>25% off</b> first order
                      </span>
                    </label>
                  </div>
                  <div className="text-end">
                    {/* Price Before */}
                    <span className="font-[450] text-[16px] mr-[4px] line-through">
                      $40.00
                    </span>
                    {/* Current Price */}
                    <span className="font-[550] text-[16px] ">$30.00</span>
                    {/* Serving Charge */}
                    <p className="text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px]">
                      $0.50/Serving
                    </p>
                  </div>
                </div>

                {/* Select Options */}
                <select className="h-[32px] mb-[4px] w-full bg-white border-[1px] border-[#D9D9D5] rounded-xl px-4 text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px] ">
                  <option value="each-30-days">
                    Delivery every 30 days (Most popular)
                  </option>
                </select>

                <p className="text-[10px] px-2 font-[POPPINS] font-normal leading-[100%] tracking-[0px]">
                  Pause, skip, or cancel at any time
                </p>
              </div>

              {/* Second Option */}
              <div className="p-[16px] border-[1px]   rounded-b-2xl border-[#D9D9D5]">
                <div className=" flex justify-between items-start mb-[8px]">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="oneTime"
                      name="subscribe"
                      value="oneTime"
                      className="accent-[#AE7E56] w-[20px] h-[20px]"
                    />
                    <label
                      htmlFor="One-Time Purchase"
                      className="text-[16px] font-[550] leading-[100%] tracking-[0px]"
                    >
                      One-Time Purchase
                    </label>
                  </div>
                  <div className="text-end">
                    {/* Current Price */}
                    <span className="font-[550] text-[16px] pl-1 text-right">
                      $40.00
                    </span>
                    {/* Serving Charge */}
                    <p className="text-[12px] font-[POPPINS] font-normal leading-[100%] tracking-[0px] ">
                      $0.75/Serving
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Link
              href="#"
              className="bg-black mb-[24px] rounded-full px-6 mt-[24px] h-[48px] text-white font-[POPPINS] flex justify-between items-center"
            >
              <span className="text-[16px] leading-[130%] font-semibold  ">
                Add to Cart
              </span>
              <div>
                {/* Price Before */}
                <span className="font-[400] text-[16px] mr-[4px] line-through">
                  $40.00
                </span>
                {/* Current Price */}
                <span className="font-[600] text-[16px] ">$30.00</span>
              </div>
            </Link>

            {/* Collabsed Div */}
            <div>
              <CollapsibleDiv
                show={true}
                title="What is Night Boost?"
                description="Night boost is a natural sleep support supplement made with gentle,
                            effective ingredients like L-theanine, magnesium bisglycinate, GABA,
                            glycine, and inositol—formulated to help your body relax and ease into
                            a deep, restful sleep."
              />

              <CollapsibleDiv
                title="Why Night Boost?"
                description="Night boost is a natural sleep support supplement made with gentle,
                            effective ingredients like L-theanine, magnesium bisglycinate, GABA,
                            glycine, and inositol—formulated to help your body relax and ease into
                            a deep, restful sleep."
              />

              <CollapsibleDiv
                title="How to take Night Boost?"
                description="Night boost is a natural sleep support supplement made with gentle,
                            effective ingredients like L-theanine, magnesium bisglycinate, GABA,
                            glycine, and inositol—formulated to help your body relax and ease into
                            a deep, restful sleep."
              />
            </div>

            <div className="border-[1px] border-[#D9D9D5]  rounded-lg p-6 mt-[24px]">
              <CustomImage
                src="/supplements/LogosHS.png"
                height="1000"
                width="1000"
              ></CustomImage>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
