"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa";

const ACCENT = "#A7885A";

const NadPlusTestimonialStep = ({
  onContinue,
  onQuizChromeVisibilityChange,
}) => {
  useEffect(() => {
    onQuizChromeVisibilityChange?.(false);
    return () => onQuizChromeVisibilityChange?.(false);
  }, [onQuizChromeVisibilityChange]);

  return (
    <div className="flex h-full w-full flex-col px-5 md:px-0">
      <div className="mx-auto w-full max-w-4xl flex-grow pb-32 md:pb-36">
        <div className="mb-10">
          <h1 className="headers-font text-3xl font-medium leading-[125%] text-[#251F20]">
            &quot;Nad+ has really helped my{" "}
            <span style={{ color: ACCENT }}>energy and mind.</span> I&apos;ve
            never experienced anything like it. I&apos;m in my 70&apos;s and I
            have more{" "}
            <span style={{ color: ACCENT }}>energy and confidence</span> Than
            I&apos;ve had in years!&quot;
          </h1>
        </div>

        <div className="relative mb-6 h-[400px] w-full overflow-hidden rounded-[18px] lg:h-[500px]">
          <Image
            src="/nad+/review-img.png"
            alt="Steve enjoying life with the benefits of Prescription NAD+"
            fill
            className="object-cover"
          />
        </div>

        <p className="headers-font text-start text-base font-normal leading-[120%] text-black">
          Steve is <span className="font-bold">enjoying</span>{" "}
          <em>life</em> with the benefits of Prescription NAD+
        </p>
      </div>

      <div className="fixed bottom-0 left-0 z-50 flex w-full items-center justify-center bg-[linear-gradient(180deg,rgba(245,244,239,0)_0%,rgba(245,244,239,0.8)_37.51%,#F5F4EF_63.04%)] px-4 pb-4 backdrop-blur-sm">
        <div className="w-full max-w-4xl sm:px-20 lg:px-0">
          <button
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-full border-none py-3 text-base font-medium text-white focus:outline-none focus:ring-0"
            onClick={() => onContinue?.()}
            type="button"
            style={{ backgroundColor: ACCENT }}
          >
            <span>Next</span>
            <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NadPlusTestimonialStep;
