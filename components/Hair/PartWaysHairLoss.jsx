"use client";

import { useRef } from "react";
import PartWaysHairLossCard from "./PartWaysHairLossCard";
import ScrollArrows from "../ScrollArrows";

const hairLossCards = [
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/nowhere.svg`,
    title: "revention",
    letter: "P",
    description:
      "Even if you have a full head of hair, you might want to get ahead of the game, especially if male pattern baldness runs in the family. After all, 2/3 of men will suffer from hair loss.",
  },
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/overall.svg`,
    title: "ll over thinning",
    letter: "A",
    description:
      "If you're seeing more of your scalp, it's still not too late. It's normal for hair follicles to close as men age. The treatment options we offer can help reactivate them.",
  },
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/receding.svg`,
    title: "eceding Hairline",
    letter: "R",
    description:
      "Often a combo of family history and aging, seeing more forehead is common for guys. With our help, we can prevent turning that forehead into a fivehead.",
  },
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/themes/salient-child/img/crown.svg`,
    title: "hinning at the crown",
    letter: "T",
    description:
      "For some men, androgenic alopecia results in the bald spot that everyone, except you, can see. This is due to the growth phase of hair follicles.",
  },
];

const PartWaysHairLoss = () => {
  const scrollContainerRef = useRef(null);

  return (
    <>
      <div>
        <h2 className="text-[32px] md:text-[48px] leading-[36.8px] md:leading-[55.2px] tracking-[-0.01em] md:tracking-[-0.02em] mb-3 md:mb-[8px] font-[550] capitalize headers-font">
          Is hair loss treatment right for you?
        </h2>
        <p className="text-[16px] md:text-[18px] leading-[24px] md:leading-[27px] tracking-[-0.02em] font-[400] mb-[20px] md:mb-[56px]">
          <span className="text-[18px] md:text-[24px] leading-[27px] md:leading-[36px] font-[600] md:Font-[500]">
            PART
          </span>{" "}
          ways with hair loss
        </p>
        <p className="text-[14px] md:text-[16px] leading-[19.6px] md:leading-[22.4px] font-[400] tracking-[-0.02em] md:tracking-[0] mb-10 md:mb-[56px]">
          If you answered yes, you're in the right place. Choosing between
          Prescription, OTC, and Natural products can be overwhelming, but our
          clinical process simplifies your hair (re)growth journey. Hair loss
          treatments take 3-6 months to show results, so the sooner you start,
          the better. your results. Our Prescription-only solutions along with
          our OTC and Natural options offer tailored solutions for every
          journey.
        </p>
      </div>
      <div className="overflow-x-auto !no-scrollbar relative">
        <div className=" mx-auto ">
          <div className="relative">
            <ScrollArrows scrollContainerRef={scrollContainerRef} />

            <div
              ref={scrollContainerRef}
              className="flex gap-2 md:gap-4 items-start overflow-x-auto snap-x snap-mandatory no-scrollbar"
            >
              {hairLossCards.map((card, index) => (
                <PartWaysHairLossCard key={index} {...card} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PartWaysHairLoss;
