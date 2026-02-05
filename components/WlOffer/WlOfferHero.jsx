"use client";

import Link from "next/link";
import { FaStar, FaArrowRight } from "react-icons/fa";
import CustomImage from "../utils/CustomImage";

const WlOfferHero = ({ consultationHref = "/wl-pre-consultation/" }) => {
  return (
    <section 
      className="relative overflow-hidden bg-[#F0EEEA]"
    >
      {/* Background Image - Desktop Only */}
      <div 
        className="hidden md:block absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{
          backgroundImage: "url('https://myrocky.b-cdn.net/WP%20Images/wl-offer/Hero-img-Desktop.jpg')"
        }}
      ></div>
      {/* Dark blue border on right */}
      
      <div className="relative z-10 max-w-[1200px] mx-auto px-4 md:px-0 lg:px-8 py-12 md:py-16 lg:py-24">
        {/* Hero Content */}
        <div className="text-left mb-12 md:mb-16 max-w-[475px]">
          {/* Rating and Program Title */}
          <div className="flex items-center justify-start gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="text-[#AE7E56] w-[18px] h-[18px] md:w-6 md:h-6" />
              ))}
            </div>
            <span className=" text-[#000] text-[12px] md:text-[16px] font-[500] leading-normal">
              America's #1 Weight Loss Program
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="headers-font text-[#000] text-[48px] md:text-[64px] font-[600] leading-[100%] md:leading-[110%] tracking-[-0.96px] md:tracking-[-1.28px] capitalize mb-4">
            Get 1 Month Of{" "}
            <span className="text-[#AE7E56] text-[66px] md:text-[88px] font-[600] leading-[100%] tracking-[-1.32px] md:tracking-[-1.76px] capitalize">GLP-1 FREE</span>
          </h1>

          {/* Offer Details */}
          <p className=" text-[#000] text-[14px] font-[400] leading-[140%] mb-6 md:mb-10 max-w-2xl">
            For a limited time, subscribe for 3 months and only pay for 2.
            <br className="hidden md:block"/>
            You'll be completely satisfied, or we'll fully refund you.
          </p>

          {/* CTA Button */}
          <Link
            href={consultationHref}
            className="flex w-full md:w-[320px] h-12 px-12 justify-center items-center gap-2 rounded-[64px] bg-black text-white hover:bg-gray-800 transition-colors duration-200"
          >
            Get started
            <FaArrowRight className="text-white" />
          </Link>
        </div>

        {/* Mobile Hero Image - Full Width */}
        <div className="md:hidden block -mx-4 w-[calc(100%+2rem)]">
          <CustomImage
            src="https://myrocky.b-cdn.net/WP%20Images/wl-offer/Hero-Mob.jpg"
            alt="Hero"
            width={800}
            height={210}
            className="w-full h-auto"
          />
        </div>

        {/* Bottom Section - Social Proof */}
        <div className="mt-12 md:mt-16 ">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-1 items-center  ">
            {/* Program Success Rate */}
            <div className="flex items-center gap-3">
              <div className="flex w-12 h-12 bg-white rounded-full items-center justify-center">
                <div className="w-6 h-6 md:w-6 md:h-6 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-full h-full">
                    <path d="M3.4 18L2 16.6L9.4 9.15L13.4 13.15L18.6 8H16V6H22V12H20V9.4L13.4 16L9.4 12L3.4 18Z" fill="#1C375D"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className=" text-[#000] text-[16px] font-[500] leading-[140%] tracking-[-0.32px] mb-[2px]">93.7% Program Success Rate</div>
                <div className="text-base md:text-sm text-[#000]  font-[500] md:font-[400] leading-[140%] tracking-[-0.32px] md:tracking-normal text-center flex items-center gap-2">
                  <CustomImage
                    src="https://myrocky.b-cdn.net/WP%20Images/wl-offer/frame.png"
                    alt="350,000+ Members"
                    width={44}
                    height={24}
                  />
                  350,000+ Members</div>
              </div>
            </div>

            {/* Google Reviews */}
            <div className="flex items-center gap-3">
              <div className="flex w-12 h-12 bg-white rounded-full items-center justify-center">
                <div className="w-6 h-6 md:w-6 md:h-6 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-full h-full">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.66 15.63 16.88 16.79 15.71 17.57V20.34H19.28C21.36 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M11.9997 23C14.9697 23 17.4597 22.02 19.2797 20.34L15.7097 17.57C14.7297 18.23 13.4797 18.63 11.9997 18.63C9.13969 18.63 6.70969 16.7 5.83969 14.1H2.17969V16.94C3.98969 20.53 7.69969 23 11.9997 23Z" fill="#34A853"/>
                    <path d="M5.84 14.09C5.62 13.43 5.49 12.73 5.49 12C5.49 11.27 5.62 10.57 5.84 9.91001V7.07001H2.18C1.43 8.55001 1 10.22 1 12C1 13.78 1.43 15.45 2.18 16.93L5.03 14.71L5.84 14.09Z" fill="#FBBC05"/>
                    <path d="M11.9997 5.38C13.6197 5.38 15.0597 5.94 16.2097 7.02L19.3597 3.87C17.4497 2.09 14.9697 1 11.9997 1C7.69969 1 3.98969 3.47 2.17969 7.07L5.83969 9.91C6.70969 7.31 9.13969 5.38 11.9997 5.38Z" fill="#EA4335"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className=" text-[#000] text-[16px] font-[500] leading-[140%] tracking-[-0.32px]">Google</div>
                <div className=" text-[#000] text-[16px] font-[400] leading-[140%] tracking-[-0.32px]"> <span className="poppins-font text-[#000] text-[14px] font-[500] leading-[140%] text-center">4.7 Rating | </span>164 Reviews</div>
              </div>
            </div>

            {/* Trustpilot Reviews */}
            <div className="flex items-center gap-3">
              <div className="flex w-12 h-12 bg-white rounded-full items-center justify-center">
                <div className="w-6 h-6 md:w-6 md:h-6 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="25" height="24" viewBox="0 0 25 24" fill="none" className="w-full h-full">
                    <path d="M25 9.17209H15.4534L12.5046 0L9.54663 9.17209L0 9.16279L7.73129 14.8372L4.77331 24L12.5046 18.3349L20.2267 24L17.2779 14.8372L25 9.17209Z" fill="#00B67A"/>
                    <path d="M17.9413 16.9116L17.2779 14.8372L12.5046 18.3349L17.9413 16.9116Z" fill="#005128"/>
                  </svg>
                </div>
              </div>
              <div>
                <div className=" text-[#000] text-[16px] font-[500] leading-[140%] tracking-[-0.32px]">Trustpilot</div>
                <div className=" text-[#000] text-[14px] font-[400] leading-[140%] text-center md:text-left"><span className=" text-[#000] text-[14px] font-[500] leading-[140%] ">Excellent </span>|1,368 Reviews</div>
              </div>
            </div>

            {/* Ranked #1 GLP Provider */}
            <div className="flex items-center gap-3 md:col-span-1">
              <div className="flex w-12 h-12 bg-white rounded-full items-center justify-center">    
              <div className="w-6 h-6 md:w-6 md:h-6 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-full h-full">
                  <path d="M6.44444 22V19.7778H10.8889V16.3333C9.98148 16.1296 9.1713 15.7454 8.45833 15.1806C7.74537 14.6157 7.22222 13.9074 6.88889 13.0556C5.5 12.8889 4.33796 12.2824 3.40278 11.2361C2.46759 10.1898 2 8.96296 2 7.55556V6.44444C2 5.83333 2.21759 5.31019 2.65278 4.875C3.08796 4.43981 3.61111 4.22222 4.22222 4.22222H6.44444V2H17.5556V4.22222H19.7778C20.3889 4.22222 20.912 4.43981 21.3472 4.875C21.7824 5.31019 22 5.83333 22 6.44444V7.55556C22 8.96296 21.5324 10.1898 20.5972 11.2361C19.662 12.2824 18.5 12.8889 17.1111 13.0556C16.7778 13.9074 16.2546 14.6157 15.5417 15.1806C14.8287 15.7454 14.0185 16.1296 13.1111 16.3333V19.7778H17.5556V22H6.44444ZM6.44444 10.6667V6.44444H4.22222V7.55556C4.22222 8.25926 4.42593 8.89352 4.83333 9.45833C5.24074 10.0231 5.77778 10.4259 6.44444 10.6667ZM17.5556 10.6667C18.2222 10.4259 18.7593 10.0231 19.1667 9.45833C19.5741 8.89352 19.7778 8.25926 19.7778 7.55556V6.44444H17.5556V10.6667Z" fill="#AE7E56"/>
                </svg>
                </div>
              </div>
              <div>
                <div className=" text-[#000] text-[16px] font-[500] leading-[140%] tracking-[-0.32px]">Ranked #1 GLP Provider</div>
                <div className="flex items-center">
                  <CustomImage
                    src="https://myrocky.b-cdn.net/WP%20Images/wl-offer/frame2.png"
                    alt="Ranked #1 GLP Provider"
                    width={194}
                    height={24}
                  />
        
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WlOfferHero;
