"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CustomImage from "@/components/utils/CustomImage";
import ListWithIcons from "@/components/ListWithIcons";
import { FaArrowRightLong } from "react-icons/fa6";

const HeroSection = ({
  title,
  description,
  items,
  buttons,
  imageSrc,
  imageAlt,
  imageWidth,
  imageHeight,
  imageClassName,
  showCountdown = true,
  hideDescriptionOnMobile = false,
  containerClassName = "",
  imageContainerClassName = "",
}) => {
  const countdownDuration = 4 * 24 * 60 * 60 * 1000; // 4 days in milliseconds
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [deliveryDay, setDeliveryDay] = useState("");

  useEffect(() => {
    // Only run this code on the client side
    if (typeof window === "undefined") return;

    let targetTime = new Date();
    const savedTime = localStorage.getItem("deliveryTargetTime");
    if (savedTime) {
      targetTime = new Date(savedTime);
      if (new Date() > targetTime) {
        localStorage.removeItem("deliveryTargetTime");
        setNewTargetTime();
      }
    } else {
      setNewTargetTime();
    }

    function setNewTargetTime() {
      targetTime = new Date();
      targetTime.setTime(targetTime.getTime() + countdownDuration);
      localStorage.setItem("deliveryTargetTime", targetTime);
    }

    function updateCountdown() {
      const now = new Date();
      const timeDifference = targetTime - now;
      if (timeDifference > 0) {
        setTimeLeft({
          hours: Math.floor(
            (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          ),
          minutes: Math.floor(
            (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
          ),
          seconds: Math.floor((timeDifference % (1000 * 60)) / 1000),
        });
      } else {
        setNewTargetTime();
      }
    }

    function updateDeliveryDay() {
      const options = { weekday: "long" };
      setDeliveryDay(targetTime.toLocaleDateString(undefined, options));
    }

    updateDeliveryDay();
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className={`mx-auto grid md:grid-cols-2 gap-8 items-center relative ${containerClassName}`}
    >
      <div className="max-w-[500px]">
        <h1 className="text-3xl lg:text-[48px] font-semibold leading-tight mb-3">
          {title}
        </h1>

        {items && <ListWithIcons items={items} />}

        {description && (
          <p
            className={`text-lg mb-5 ${
              hideDescriptionOnMobile ? "md:hidden pb-5" : ""
            }`}
          >
            {description}
          </p>
        )}

        {buttons && buttons.length > 0 && (
          <div className="flex flex-col lg:flex-row gap-2">
            {buttons.map((button, index) => (
              <Link key={index} href={button.href} className={button.className}>
                <span
                  className={
                    button.textClassName ||
                    "text-[14px] leading-[19.6px] md:leading-[21px] font-[500] md:font-[400]"
                  }
                >
                  {button.text}
                </span>
                {button.showArrow !== false && <FaArrowRightLong />}
              </Link>
            ))}
          </div>
        )}

        {showCountdown && (
          <div className="mt-5">
            <p className="mb-2">Order within</p>
            <div className="flex items-center gap-1 text-lg font-semibold mb-2">
              <div className="rounded-md p-2 text-center bg-white text-[#D3876A]">
                {timeLeft.hours}h
              </div>
              :
              <div className="rounded-md p-2 text-center bg-white text-[#D3876A]">
                {timeLeft.minutes}m
              </div>
              :
              <div className="rounded-md p-2 text-center bg-white text-[#D3876A]">
                {timeLeft.seconds}s
              </div>
            </div>
            <p>
              for delivery by{" "}
              <span className="text-gradient font-bold text-[#D3876A]">
                {deliveryDay}
              </span>
            </p>
          </div>
        )}
      </div>

      <div
        className={
          imageContainerClassName ||
          "overflow-hidden w-full relative rounded-3xl h-[335px] md:h-[500px]"
        }
      >
        <CustomImage
          src={imageSrc}
          alt={imageAlt}
          width={imageWidth}
          height={imageHeight}
          fill={!imageWidth || !imageHeight}
          className={imageClassName}
        />
      </div>
    </section>
  );
};

export default HeroSection;
