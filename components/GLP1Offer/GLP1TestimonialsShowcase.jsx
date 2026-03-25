"use client";

import { FaStar, FaCheckCircle } from "react-icons/fa";
import CustomImage from "@/components/utils/CustomImage";
import { featuredTestimonial, scatteredTestimonials } from "./data";

const ScatteredQuote = ({ quote, className }) => (
  <div className={`text-center md:text-left ${className}`}>
    <p className="headers-font text-[rgba(0,0,0,0.25)] text-[18px] md:text-[22px] font-[600] leading-[130%] mb-1">
      &ldquo;{quote}&rdquo;
    </p>
    <p className="flex items-center gap-1 justify-center md:justify-start text-[rgba(0,0,0,0.30)] text-[12px]">
      <FaCheckCircle className="text-[rgba(0,0,0,0.20)] w-3 h-3" />
      Verified Rocky Customer
    </p>
  </div>
);

const GLP1TestimonialsShowcase = () => {
  return (
    <div className="text-center overflow-visible relative">
      {/* Header */}
      <p className="poppins-font text-[rgba(0,0,0,0.60)] text-[14px] md:text-[16px] font-[400] mb-3">
        350,000+ Patients Agree
      </p>
      <div className="flex justify-center gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className="text-[#F5A623] w-7 h-7 md:w-9 md:h-9" />
        ))}
      </div>

      {/* Featured Quote */}
      <h2 className="headers-font text-black text-[28px] md:text-[42px] leading-[115%] tracking-[-0.56px] md:tracking-[-0.84px] mb-2">
        &ldquo;{featuredTestimonial.quote}{" "}
        <span className="text-[#AE7E56] italic">
          {featuredTestimonial.highlight}
        </span>
        &rdquo;
      </h2>
      <p className="flex items-center gap-2 justify-center text-[rgba(0,0,0,0.60)] text-[14px] mb-10 md:mb-16">
        <FaCheckCircle className="text-[#4CAF50] w-4 h-4" />
        {featuredTestimonial.attribution}
      </p>

      {/* Central Product Image - floating, centered on page */}
      <div className="hidden md:flex justify-center pointer-events-none" style={{ position: "absolute", left: 0, right: 0, top: "22%", zIndex: 10 }}>
        <div className="animate-float">
          <CustomImage
            src="/products/glp1-vial.png"
            alt="GLP-1 Medication"
            width={480}
            height={680}
            className="object-contain drop-shadow-xl"
          />
        </div>
      </div>

      {/* Scattered Testimonials */}
      <div className="relative max-w-[1100px] mx-auto min-h-[500px] md:min-h-[600px] hidden md:block">
        {/* Scattered quotes positioned around the image */}
        <ScatteredQuote
          quote={scatteredTestimonials[0]}
          className="absolute top-[5%] left-[2%] max-w-[250px]"
        />
        <ScatteredQuote
          quote={scatteredTestimonials[1]}
          className="absolute top-[5%] right-[2%] max-w-[250px]"
        />
        <ScatteredQuote
          quote={scatteredTestimonials[2]}
          className="absolute top-[35%] left-[5%] max-w-[250px]"
        />
        <ScatteredQuote
          quote={scatteredTestimonials[3]}
          className="absolute top-[35%] right-[2%] max-w-[250px]"
        />
        <ScatteredQuote
          quote={scatteredTestimonials[4]}
          className="absolute top-[60%] left-[2%] max-w-[250px]"
        />
        <ScatteredQuote
          quote={scatteredTestimonials[5]}
          className="absolute top-[60%] right-[2%] max-w-[250px]"
        />
        <ScatteredQuote
          quote={scatteredTestimonials[6]}
          className="absolute top-[82%] right-[5%] max-w-[250px]"
        />
      </div>

      {/* Mobile: stacked testimonials */}
      <div className="md:hidden space-y-6 mt-4">
        <div className="relative w-[200px] h-[300px] mx-auto mb-6 animate-float">
          <CustomImage
            src="/products/glp1-vial.png"
            alt="GLP-1 Medication"
            width={200}
            height={300}
            className="object-contain drop-shadow-xl"
          />
        </div>
        {scatteredTestimonials.slice(0, 4).map((quote, i) => (
          <div key={i} className="text-center px-4">
            <p className="headers-font text-[rgba(0,0,0,0.30)] text-[18px] font-[600] leading-[130%] mb-1">
              &ldquo;{quote}&rdquo;
            </p>
            <p className="flex items-center gap-1 justify-center text-[rgba(0,0,0,0.30)] text-[12px]">
              <FaCheckCircle className="text-[rgba(0,0,0,0.20)] w-3 h-3" />
              Verified Rocky Customer
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GLP1TestimonialsShowcase;
