"use client";

import { FaStar, FaCheckCircle } from "react-icons/fa";
import CustomImage from "@/components/utils/CustomImage";
import {
    featuredTestimonial,
    scatteredTestimonials,
} from "@/components/MedViLanding/data";

const ScatteredQuote = ({ quote, className }) => (
    <div className={`text-center md:text-left ${className}`}>
        <p className="headers-font text-[rgba(0,0,0,0.15)] sm:text-[22px] text-[18px] md:text-[26px] font-[500] leading-[130%] mb-1">
            &ldquo;{quote}&rdquo;
        </p>
        <p className="flex items-center gap-1 justify-center md:justify-start text-[rgba(0,0,0,0.12)] sm:text-[16px] text-[14px] font-medium">
            <FaCheckCircle className="text-[rgba(0,0,0,0.12)] w-4 h-4" />
            Verified Rocky Customer
        </p>
    </div>
);

const MedViTestimonialsShowcase = () => {
    return (
        <div className="text-center overflow-visible relative">
            <p className="poppins-font text-[rgba(0,0,0,0.60)] text-[14px]  font-[500] mb-3">
                350,000+ Patients Agree
            </p>
            <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                    <FaStar
                        key={i}
                        className="text-[#AE7E56aa] w-7 h-7 md:w-9 md:h-9"
                    />
                ))}
            </div>

            <div className="md:w-[70%] mx-auto ">
                <h2 className="headers-font text-[#000000] sm:text-[28px] text-[24px] md:text-[46px] leading-[115%] tracking-[-0.56px] md:tracking-[-0.84px] sm:mb-4 mb-2 font-light">
                    &quot;{featuredTestimonial.quote}{" "}
                    <span className="text-[#AE7E56] font-bold">
                        {featuredTestimonial.highlight}
                    </span>
                    &quot;
                </h2>
                <p className="flex items-center sm:gap-2 gap-1 sm:justify-end justify-center text-[rgba(0,0,0,0.80)] sm:text-[14px] text-[12px] font-medium mb-16 md:mb-20 sm:me-6">
                    <FaCheckCircle className="text-[#4CAF50] sm:w-4 w-3 sm:h-4 h-3" />
                    {featuredTestimonial.attribution}
                </p>
            </div>

            <div
                className="flex justify-center pointer-events-none sm:top-[22%] top-[22%]"
                style={{
                    position: "absolute",
                    left: 0,
                    right: 0,

                    zIndex: 10,
                }}
            >
                <div className="animate-float">
                    <CustomImage
                        src="https://myrocky.b-cdn.net/WP%20Images/wl-med/_When%20nothing%20else%20worked,%20Rocky%20did_.png"
                        alt="GLP-1 Medication"
                        width={400}
                        height={600}
                        className="object-contain drop-shadow-xl  md:w-[440px] w-[300px]"
                    />
                </div>
            </div>

            <div className="relative max-w-[1100px] mx-auto sm:min-h-[500px] min-h-[400px] md:min-h-[600px]  block  overflow-hidden">
                <ScatteredQuote
                    quote={scatteredTestimonials[0]}
                    className="absolute top-[5%] md:left-[2%] -left-[10%] max-w-[250px]"
                />
                <ScatteredQuote
                    quote={scatteredTestimonials[1]}
                    className="absolute top-[8%] md:right-[12%] -right-[10%] max-w-[260px]"
                />
                <ScatteredQuote
                    quote={scatteredTestimonials[2]}
                    className="absolute top-[30%] md:left-[10%] -left-[10%] max-w-[260px]"
                />
                <ScatteredQuote
                    quote={scatteredTestimonials[3]}
                    className="absolute top-[30%] md:right-[12%] -right-[10%] max-w-[260px]"
                />
                <ScatteredQuote
                    quote={scatteredTestimonials[4]}
                    className="md:block hidden absolute top-[65%] left-[10%] max-w-[260px]"
                />
                <ScatteredQuote
                    quote={scatteredTestimonials[5]}
                    className="md:block hidden absolute top-[65%] right-[10%] max-w-[260px]"
                />
                <ScatteredQuote
                    quote={scatteredTestimonials[6]}
                    className="md:block hidden absolute top-[80%] right-[40%] max-w-[260px]"
                />
                <ScatteredQuote
                    quote={scatteredTestimonials[7]}
                    className="md:block hidden absolute top-[8%] left-[30%] max-w-[250px]"
                />
                <ScatteredQuote
                    quote={scatteredTestimonials[8]}
                    className="md:block hidden absolute top-[36%] right-[40%] max-w-[260px]"
                />
                <ScatteredQuote
                    quote={scatteredTestimonials[9]}
                    className="md:block hidden absolute top-[88%] right-[9%] max-w-[250px]"
                />
            </div>

            <div className="hidden space-y-6 mt-4">
                <div className="relative w-[200px] h-[300px] mx-auto mb-6 animate-float">
                    <CustomImage
                        src="https://myrocky.b-cdn.net/WP%20Images/wl-med/_When%20nothing%20else%20worked,%20Rocky%20did_.png"
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

            <div className="flex justify-center pb-10 md:pt-20 pt-10">
                <CustomImage
                    src="/medvi/hsafsa1.png"
                    alt="HSA FSA logo"
                    width={250}
                    height={250}
                    className=""
                />
            </div>
        </div>
    );
};

export default MedViTestimonialsShowcase;
