"use client";
import CustomImage from "@/components/utils/CustomImage";
import { useRef, useState, useEffect } from "react";
import {
    FaCheckCircle,
    FaLongArrowAltRight,
    FaRegCheckCircle,
} from "react-icons/fa";
import ScrollArrows from "./ScrollArrows";
import CustomContainImage from "./utils/CustomContainImage";
import BrimaryButton from "./ui/buttons/BrimaryButton";
import Link from "next/link";
import HomeHeading from "./home/HomeHeading";

const teamCards = [
    {
        name: "Dr. George Mankaryous",
        title: "M.D. CCFP",
        logo1: {
            src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/g-logo1.png",
            width: "w-[73.04px] md:w-[97.39px]",
        },
        logo2: {
            src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/g-logo2.png",
            width: "w-[57px] md:w-[76px]",
        },
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/newhomepage/Dr.%20George%20Mankaryous%20-%20Desktop.webp",
    },
    {
        name: "Mina Rizk",
        title: "R.Ph. MPharm",
        logo1: {
            src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/mina-logo1.png",
            width: "w-[56.96px] md-w-[97.39px] ml-2 mt-1",
            obj: "!object-cover scale-150",
        },
        logo2: {
            src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/mina-logo2.png",
            width: "w-[67.5px] md:w-[97.39px]",
        },
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/newhomepage/Mina%20Rizk%20-%20Desktop.webp",
    },
    {
        name: "Dr. Mena Mirhom",
        title: "M.D. FAPA",
        logo1: {
            src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/m-logo1.png",
            width: "w-[161.14px] md:w-[214.86px]",
        },
        logo2: {
            src: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/m-logo2.png",
            width: "w-[53.52px] md:w-[71.36px]",
        },
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/newhomepage/Dr.%20Mena%20Mirhom%20-%20Desktop.webp",
    },
];

const trustedTeam = [
    {
        title: "Certified Specialists",
        description: "Over 20 years of experience in specialized medicine.",
    },
    {
        title: "Healthcare Reimagined",
        description:
            "Revolutionizing traditional\nmedicine to deliver personalized care for all.",
    },
    {
        title: "Technology-Powered Care",
        description:
            "Advanced digital solutions making healthcare more convenient,\neffective and patient-centered.",
    },
];

const TeamSection = () => {
    const scrollContainerRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const scrollLeft = container.scrollLeft;
            const cardWidth = container.offsetWidth / 1.2;
            const index = Math.round(scrollLeft / cardWidth);
            setActiveIndex(index);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToCard = (index) => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const cardWidth = container.offsetWidth / 1.2;
        container.scrollTo({
            left: cardWidth * index,
            behavior: "smooth",
        });
    };

    return (
        <div>
            <div className="mb-[32px] md:mb-[72px]">
                <HomeHeading
                    blackText="Guided by"
                    accentText="top health professionals"
                />

                <p className="text-[16px] md:text-[18px] font-[400] leading-[25.2px] md:leading-[28px] max-w-[737px] tracking-[-0.03em] ">
                    MyRocky Health partners with leading experts to deliver
                    exceptional care through evidence-based treatment plans that
                    drive results.
                </p>
            </div>
            <div className="flex flex-col gap-[24px] md:gap-4 md:flex-row ">
                <div className="!w-full lg:!w-[355px]  !text-left pr-0 md:pr-[40px] ">
                    <ul className="!space-y-3 md:!space-y-4 !text-left md:w-[336px] !py-6 md:!py-10  !max-w-[336px]">
                        {trustedTeam.map((a) => (
                            <li
                                key={a.title}
                                className="!flex !items-start !gap-2 md:h-[80px] mb-[24px]"
                            >
                                <span className="!w-6 !h-6 !aspect-square mt-[2px] text-[#AE7E56] flex-shrink-0">
                                    <FaCheckCircle className="!w-5 !h-5 !aspect-square" />
                                </span>

                                <span>
                                    <p className="text-black poppins-font text-[16px] md:text-[18px] not-italic font-[500] leading-normal mb-[4px]">
                                        {a.title}
                                    </p>
                                    <span className="text-[rgba(0,0,0,0.65)] poppins-font text-[16px] not-italic font-normal leading-[140%]">
                                        {a.description
                                            .split("\n")
                                            .map((line, index, array) => (
                                                <span key={index}>
                                                    {line}
                                                    {index <
                                                        array.length - 1 && (
                                                        <br />
                                                    )}
                                                </span>
                                            ))}
                                    </span>
                                </span>
                            </li>
                        ))}
                    </ul>

                    <BrimaryButton
                        href="/about-us"
                        arrowIcon={true}
                        className="w-full mt-6 md:mt-8 text-center flex items-center justify-center bg-[#FFFFFF] py-3 px-6 rounded-full border-solid border-2 border-[black] hover:bg-gray-200"
                    >
                        <span className="text-sm font-medium">
                            Meet Our Team
                        </span>{" "}
                    </BrimaryButton>
                </div>
                <div className="overflow-x-auto !no-scrollbar relative">
                    <ScrollArrows scrollContainerRef={scrollContainerRef} />

                    <div className="mx-auto">
                        <div className="relative">
                            <div
                                ref={scrollContainerRef}
                                className="flex overflow-x-auto gap-2 items-start md:gap-4 snap-x snap-mandatory no-scrollbar"
                            >
                                {teamCards.map((card, index) => (
                                    <div
                                        key={index}
                                        className="!w-[300px] md:!w-[384px] md:h-[545px]"
                                    >
                                        <div className="relative rounded-2xl overflow-hidden w-[280px] md:w-[384px] h-[380px] md:h-[508px] mb-4 md:mb-6 ">
                                            <CustomImage
                                                fill
                                                src={card.image}
                                                alt={card.name}
                                                sizes="(max-width: 768px) 280px, 384px"
                                            />

                                            <div className="absolute   bottom-[-1px] w-full  px-[20px] py-[20px] md:px-[24px] md:py-[34px]">
                                                <h3 className="text-black text-[18px] lg:text-[20px] font-[500] leading-[20.7px] md:leading-[23px]">
                                                    {card.name}
                                                </h3>
                                                <p className="text-[#212121] text-[14px] lg:text-[16px] font-[400] leading-[19.6px] md:leading-[22.4px] mt-2">
                                                    {card.title}
                                                </p>

                                                {/* <div className="flex justify-start mt-4 space-x-3  w-full max-w-[230px] h-8">
                      <div className="relative w-full ">
                        <CustomImage fill src={card.logo1} />
                      </div>

                      <div className="relative w-full ">
                        <CustomImage fill src={card.logo2} />
                      </div>
                    </div> */}
                                                <div className="flex justify-start mt-4 space-x-3 w-full  h-6 md:h-8">
                                                    <div
                                                        className={`relative h-6 md:h-8 ${card.logo1.width}`}
                                                    >
                                                        <CustomContainImage
                                                            fill
                                                            src={card.logo1.src}
                                                            alt={`${card.name} logo 1`}
                                                            className={
                                                                card.logo1.obj
                                                            }
                                                        />
                                                    </div>
                                                    <div
                                                        className={`relative h-6 md:h-8 ${card.logo2.width}`}
                                                    >
                                                        <CustomContainImage
                                                            fill
                                                            src={card.logo2.src}
                                                            alt={`${card.name} logo 2`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Dots Navigation - Mobile Only */}
                    <div className="flex justify-center mt-4 md:hidden">
                        {teamCards.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToCard(index)}
                                className={`w-8 h-2 transition-all ${
                                    activeIndex === index
                                        ? "bg-[black] w-10 rounded-sm"
                                        : "bg-gray-300"
                                } ${index === 0 ? "rounded-tl-[64px] rounded-bl-[64px]" : ""} ${
                                    index === teamCards.length - 1
                                        ? "rounded-tr-[64px] rounded-br-[64px]"
                                        : ""
                                }`}
                                aria-label={`Go to card ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeamSection;
