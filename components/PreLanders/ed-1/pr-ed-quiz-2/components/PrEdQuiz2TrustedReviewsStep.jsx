"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function PrEdQuiz2TrustedReviewsStep({
  step,
  onContinue,
  canContinue,
}) {
  return (
    <section className="mx-auto max-w-[1320px] px-4 pb-16 pt-6">
      <h2 className="headers-font text-4xl md:text-6xl font-normal tracking-tight text-gray-900 text-center">
        {step.title}
      </h2>

      <Swiper
        className="testimonials-carousel mt-8"
        modules={[Autoplay]}
        spaceBetween={16}
        slidesPerView={1.15}
        breakpoints={{
          640: { slidesPerView: 1.35, spaceBetween: 16 },
          768: { slidesPerView: 3, spaceBetween: 16 },
          1024: { slidesPerView: 5, spaceBetween: 16 },
        }}
        grabCursor
        allowTouchMove={true}
        simulateTouch={true}
        loop={true}
        speed={550}
        watchOverflow={false}
        observer={true}
        observeParents={true}
        autoplay={{
          delay: 1200,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
        }}
      >
        {step.reviews?.map((review, idx) => (
          <SwiperSlide key={`${review.author}-${idx}`}>
            <article className="mb-2 rounded-xl bg-white p-6 shadow-md">
              <div className="mb-3 flex justify-center text-[#AE7E56]">
                ★★★★★
              </div>
              <h3 className="poppins-font mb-2 text-xl font-light text-gray-800">
                {review.title}
              </h3>
              <p className="poppins-font text-sm text-gray-600">{review.body}</p>
              <p className="poppins-font mt-4 text-sm font-medium text-gray-500">
                — {review.author}
              </p>
            </article>
          </SwiperSlide>
        ))}
      </Swiper>
      <p className="poppins-font mt-3 text-center text-xs text-[#1b2431]/65 md:text-sm">
        Swipe left or right to read more reviews
      </p>

      <button
        type="button"
        onClick={() => onContinue?.()}
        disabled={!canContinue}
        className="headers-font mx-auto mt-10 block w-full max-w-[640px] rounded-full bg-[#1c1b19] px-6 py-4 text-lg font-semibold text-white transition-colors duration-200 hover:bg-black/85 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {step.ctaLabel || "Continue"}
      </button>
    </section>
  );
}

