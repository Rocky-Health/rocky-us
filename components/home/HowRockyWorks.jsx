"use client";
import ScrollArrows from "@/components/ScrollArrows";
import CustomImage from "@/components/utils/CustomImage";
import HomeHeading from "./HomeHeading";

import { useRef, useState } from "react";

const howRockyWorksCards = [
    {
        step: "Step 1",
        title: "Choose Treatment",
        description: "Take the quiz or select the treatment you want.",
        image: "/convert_test/step_1.jpg",
    },
    {
        step: "Step 2",
        title: "Create Profile",
        description: "Tell us more about yourself.",
        image: "/how-rocky-works/create-profile.webp",
    },
    {
        step: "Step 3",
        title: "Fast & Free Delivery",
        description: "We'll deliver right to your doorstep.",
        image: "/how-rocky-works/fast-delivary.webp",
    },
];

const HowRockyWorks = ({ cards, title, subtitle }) => {
    const dataToUse = cards ? cards : howRockyWorksCards;
    const scrollContainerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollLeft = container.scrollLeft;
            const cardWidth = container.querySelector("div")?.offsetWidth || 0;
            const gap = 16; // gap-4 = 1rem = 16px
            const scrollPosition = scrollLeft / (cardWidth + gap);
            const index = Math.round(scrollPosition);
            setActiveIndex(Math.min(index, dataToUse.length - 1));
        }
    };

    const scrollToCard = (index) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const cardWidth = container.querySelector("div")?.offsetWidth || 0;
            const gap = 16;
            container.scrollTo({
                left: index * (cardWidth + gap),
                behavior: "smooth",
            });
            setActiveIndex(index);
        }
    };

    return (
        <>
            <HomeHeading
                blackText="How"
                accentText="myrocky works"
                className="md:text-left text-center"
            />

            <div className="overflow-x-auto !no-scrollbar relative">
                <div className=" mx-auto ">
                    <div className="relative">
                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex flex-col gap-6 md:flex-row md:gap-4 md:items-start md:overflow-x-auto md:snap-x md:snap-mandatory no-scrollbar"
                        >
                            {dataToUse &&
                                dataToUse.map((card) => {
                                    return (
                                        <div
                                            key={card.image}
                                            className="flex flex-col"
                                        >
                                            <div className="relative overflow-hidden w-full md:!w-[384px] h-[350px] md:h-[480px]">
                                                <CustomImage
                                                    src={card.image}
                                                    alt={card.title}
                                                    fill
                                                />
                                            </div>
                                            <div className="text-left mt-4 md:mt-6">
                                                <p className="text-[16px] text-[#AE7E56] leading-[22.4px] font-[500] mb-[16px]">
                                                    {card.step}
                                                </p>
                                                <h3 className="text-[22px] md:text-[30px] leading-[25.3px] md:leading-[33px] md:tracking-[-0.02em] font-[450] headers-font">
                                                    {card.title}
                                                </h3>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HowRockyWorks;
