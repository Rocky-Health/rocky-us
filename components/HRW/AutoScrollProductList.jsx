"use client";
import { useEffect, useState } from "react";
import CustomContainImage from "../utils/CustomContainImage";
import { formatPrice } from "@/utils/priceFormatter";

const cards = [
    {
        title: "Finasteride & Minoxidil Topical Foam",
        desc: "Prevents hair loss and regrows hair",
        price: "69.99",
        image: "https://myrocky.b-cdn.net/WP%20Images/Foam.webp",
    },
    {
        title: "Finasteride (Propecia)",
        desc: "Prevents hair loss",
        price: "109.99",

        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Finasteride.webp",
    },
    {
        title: "Wegovy®",
        desc: "Semaglutide injection",
        price: "229.99",

        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Wegovy.webp",
    },
];

export default function AnimatedStackScroll() {
    // const [activeIndex, setActiveIndex] = useState(0);

    // useEffect(() => {
    //   const timer = setInterval(() => {
    //     setActiveIndex((prev) => (prev + 1) % cards.length);
    //   }, 3000);

    //   return () => clearInterval(timer);
    // }, []);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % cards.length);
        }, 3000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative h-[299px] md:h-[524px] w-full md:w-1/2 mx-auto">
            {cards.map((card, idx) => {
                const offset =
                    (idx - activeIndex + cards.length) % cards.length;

                let scale = "scale-[0.8] md:scale-[0.8]";
                let translateY = "translate-y-[200px] md:translate-y-[360px]";
                let zIndex = "z-0";
                let opacity = "opacity-0";

                if (offset === 0) {
                    scale = "scale-[0.9] md:scale-[1]";
                    translateY = "translate-y-0";
                    zIndex = "z-0";
                    opacity = "opacity-100";
                } else if (offset === 1) {
                    scale = "scale-[0.85] md:scale-[0.95]";
                    translateY = "translate-y-[80px] md:translate-y-[140px]";
                    zIndex = "z-10";
                    opacity = "opacity-90";
                } else if (offset === 2) {
                    scale = "scale-[0.82] md:scale-[0.9]";
                    translateY = "translate-y-[140px] md:translate-y-[260px]";
                    zIndex = "z-20";
                    opacity = "opacity-70";
                }

                return (
                    <div
                        key={idx}
                        className={`absolute top-0 left-1/2 -translate-x-1/2  transition-all duration-700 ease-in-out ${scale} ${translateY} ${opacity} ${zIndex}`}
                    >
                        <div
                            className={`relative bg-white shadow-[0px_0px_29.93px_2.14px_#C5C5C585] rounded-[9.13px] md:rounded-[17.1px] border border-[#E7E5E5] p-[9.13px] md:p-[17px] w-[303.56px] md:w-[568px] h-[66.19px] md:h-[124px] flex items-center gap-4 z-10`}
                        >
                            <div className="relative overflow-hidden p-2 bg-[#EDEDED] rounded-[8.55px] !min-w-[47.93px] md:!min-w-[89.79px] !min-h-[47.93px] md:!min-h-[89.79px]">
                                <CustomContainImage src={card.image} fill />
                            </div>
                            <div className="w-full flex justify-between">
                                <div className="max-w-[298.24px]">
                                    <h3 className="text-[11.41px] md:text-[21.38px] text-[#4B4948] font-[600] leading-[115%]">
                                        {card.title}
                                    </h3>
                                    <p className="text-[9.13px] md:text-[17.1px] text-[#4B4948A3] font-[400] leading-[150%]">
                                        {card.desc}
                                    </p>
                                </div>
                                <div className="md:hidden">
                                    ${formatPrice(card.price)}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
