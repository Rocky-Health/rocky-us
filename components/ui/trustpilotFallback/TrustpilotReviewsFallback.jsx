"use client";

import React, { useState } from "react";
import Image from "next/image";
import HomeHeading from "@/components/home/HomeHeading";

const TrustpilotReviewsFallback = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const reviews = [
        {
            id: 1,
            title: "Trisha was very helpful...",
            content:
                "Trisha was very helpful and got the issue resolved and my delivery back on track!",
            author: "Scott Robinson",
            rating: 5,
        },
        {
            id: 2,
            title: "Fantastic team!",
            content: "Fantastic team!",
            author: "Guy Legendre",
            rating: 5,
        },
        {
            id: 3,
            title: "Trisha Maxene was qui...",
            content: "Trisha Maxene was quick and helpful",
            author: "Tom Hart",
            rating: 5,
        },
        {
            id: 4,
            title: "Real service!",
            content: "Angela was... Superbe!",
            author: "Luc Trépanier",
            rating: 5,
        },
        {
            id: 5,
            title: "Truly reliable and supp...",
            content:
                "I had a great experience with MyRocky Health. They are dependable, quick to respond, and kept everything clear from start to finish.",
            author: "Trent Cathloy",
            rating: 5,
        },
    ];

    const nextReview = () => {
        setCurrentIndex((prev) => (prev + 1) % (reviews.length - 3)); // Show 4 cards, so max index is reviews.length - 4
    };

    const prevReview = () => {
        setCurrentIndex(
            (prev) => (prev - 1 + (reviews.length - 3)) % (reviews.length - 3),
        );
    };

    const handleClick = () => {
        window.open("https://www.trustpilot.com/review/myrocky.ca", "_blank");
    };

    const renderStars = (rating) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span key={i} className="text-green-500 text-sm">
                ★
            </span>
        ));
    };

    return (
        <div className="bg-[#F5F4EF] py-6 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Title and Subtitle */}
                {/* <h2 className="max-w-xs md:max-w-full text-center mx-auto text-3xl lg:text-[48px] md:leading-[35px] lg:leading-[48px] font-[550] headers-font mb-4">
          What People Are Saying
        </h2> */}
                <HomeHeading
                    blackText="What"
                    accentText="people are saying"
                    className="text-center mx-auto"
                />

                <p className="mt-4 text-lg text-center mb-8">
                    Hear from real people who trusted MyRocky with their health.
                </p>

                {/* Trustpilot Header */}
                <div
                    className="flex items-start justify-center gap-8 mb-6 cursor-pointer"
                    onClick={handleClick}
                >
                    {/* Profile Pictures - Using existing image */}
                    <div className="relative overflow-hidden w-[104px] h-[47px]">
                        <Image
                            src="https://myrocky.b-cdn.net/WP%20Images/Sexual%20Health/tp-profiles.webp"
                            alt="TrustPilot profiles"
                            width={104}
                            height={47}
                            className="w-full h-full object-contain"
                            priority={true}
                            unoptimized={true}
                        />
                    </div>

                    {/* Trustpilot branding with stars and score underneath */}
                    <div className="flex flex-col items-start">
                        {/* Trustpilot branding */}
                        <div className="flex items-center gap-2 mb-2">
                            <Image
                                src="/trustpilot/Shape.png"
                                alt="Trustpilot star"
                                width={20}
                                height={20}
                            />
                            <span className="text-gray-700 font-medium">
                                Trustpilot
                            </span>
                        </div>

                        {/* Stars and Rating - Using existing stars image */}
                        <div className="mb-2">
                            <div className="w-[96px] h-[18px] md:w-[106px] md:h-[20px]">
                                <Image
                                    src="/trustpilot/stars.png"
                                    alt="Trustpilot stars"
                                    width={106}
                                    height={20}
                                    className="w-full h-full object-contain"
                                    priority
                                />
                            </div>
                        </div>

                        <div className="text-gray-700 text-sm">
                            <span className="font-medium">TrustScore 4.3</span>{" "}
                            <span className="underline">1,274 reviews</span>
                        </div>
                    </div>
                </div>

                {/* Reviews Carousel */}
                <div className="relative cursor-pointer" onClick={handleClick}>
                    {/* Navigation Arrows */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            prevReview();
                        }}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Previous review"
                    >
                        <span className="text-gray-600 text-lg">‹</span>
                    </button>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            nextReview();
                        }}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Next review"
                    >
                        <span className="text-gray-600 text-lg">›</span>
                    </button>

                    {/* Reviews Container */}
                    <div className="flex overflow-hidden mx-12">
                        <div
                            className="flex transition-transform duration-300 ease-in-out"
                            style={{
                                transform: `translateX(-${currentIndex * 25}%)`,
                            }}
                        >
                            {reviews.map((review, index) => (
                                <div
                                    key={review.id}
                                    className="w-1/4 flex-shrink-0 px-2"
                                >
                                    <div className="bg-white rounded-lg shadow-sm p-4 h-48 flex flex-col">
                                        {/* Stars */}
                                        <div className="flex items-center gap-1 mb-3">
                                            {renderStars(review.rating)}
                                        </div>

                                        {/* Title */}
                                        <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1">
                                            {review.title}
                                        </h3>

                                        {/* Content */}
                                        <p className="text-gray-700 text-sm flex-grow line-clamp-4">
                                            {review.content}
                                        </p>

                                        {/* Author */}
                                        <div className="text-xs text-gray-500 mt-2">
                                            {review.author}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bottom Summary */}
                <div
                    className="text-center mt-6 cursor-pointer"
                    onClick={handleClick}
                >
                    <p className="text-gray-700 text-sm mb-2">
                        Rated 4.3 / 5 based on 1,274 reviews. Showing our 4 & 5
                        star reviews.
                    </p>
                    <div className="flex items-center justify-center gap-2">
                        <Image
                            src="/trustpilot/Shape.png"
                            alt="Trustpilot star"
                            width={16}
                            height={16}
                        />
                        <span className="text-gray-700 text-sm">
                            Trustpilot
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrustpilotReviewsFallback;
