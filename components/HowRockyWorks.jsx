"use client";
import CustomImage from "@/components/utils/CustomImage";
import ScrollArrows from "./ScrollArrows";
import { useRef } from "react";

const howRockyWorksCards = [
    {
        step: "Step 1",
        title: "Choose Treatment",
        description: "Take the quiz or select the treatment you want.",
        image: "https://myrocky.b-cdn.net/WP%20Images/Step1.webp",
    },
    {
        step: "Step 2",
        title: "Create Profile",
        description: "Tell us more about yourself.",
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/newhomepage/Create%20profile.webp",
    },
    {
        step: "Step 3",
        title: "Fast & Free Delivery",
        description: "We'll deliver right to your doorstep.",
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/newhomepage/Fast%20&%20Free%20delivery.webp",
    },
];

const HowRockyWorks = ({ cards, title, subtitle }) => {
    const dataToUse = cards ? cards : howRockyWorksCards;
    const scrollContainerRef = useRef(null);

    return (
        <>
            <h2 className="text-[32px] md:text-5xl font-[550] leading-[36.8px] md:leading-[55.2px] tracking-[-0.01em]  md:tracking-[-0.02em] mb-3 md:mb-4 headers-font">
                {title || "How MyRocky Works"}
            </h2>
            <p className="text-base md:text-lg font-[400] leading-[22.4px] md:leading-[25.2px] mb-10 md:mb-14 max-w-[300px] md:max-w-full ">
                {subtitle || "Digital Healthcare without the long wait times"}
            </p>

            <div className="overflow-x-auto !no-scrollbar relative">
                <div className=" mx-auto ">
                    <div className="relative">
                        <ScrollArrows scrollContainerRef={scrollContainerRef} />
                        <div
                            ref={scrollContainerRef}
                            className="flex gap-2 md:gap-4 items-start overflow-x-auto snap-x snap-mandatory no-scrollbar"
                        >
                            {dataToUse &&
                                dataToUse.map((card) => {
                                    return (
                                        <div
                                            key={card.title}
                                            className="flex flex-col"
                                        >
                                            <div className="relative rounded-2xl overflow-hidden !w-[240px] md:!w-[384px] h-[300px] md:h-[480px]">
                                                <CustomImage
                                                    src={card.image}
                                                    alt={card.title}
                                                    fill
                                                />
                                                <div className="absolute top-6 left-6 backdrop-blur-sm text-black bg-[#FFFFFFCC] rounded-[4px] py-[7px] px-3 text-sm md:text-[14px] leading-[19.6px] font-[500] w-[76px] h-[24px] flex items-center justify-center ">
                                                    {card.step}
                                                </div>
                                            </div>
                                            <div className="text-left mt-4 md:mt-6">
                                                <h3 className="text-[22px] md:text-[30px] leading-[25.3px] md:leading-[33px] md:tracking-[-0.02em] font-[450] headers-font">
                                                    {card.title}
                                                </h3>
                                                <p className="text-base md:text-md leading-[22.4px] md:leading-[25.2px] text-[#212121] font-[400] mt-2 md:mt-4 ">
                                                    {card.description}
                                                </p>
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
