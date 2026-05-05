import React from "react";

const DEFAULT_LEFT = "/medvi/fireworks.gif";
const DEFAULT_RIGHT = "/medvi/fireworks.gif";

/**
 * Top promo strip (black). Drop GIFs at public/medvi/fireworks.gif and fireworks.gif.
 */
const MedViPromoBanner = ({
    fireworksLeftSrc = DEFAULT_LEFT,
    fireworksRightSrc = DEFAULT_RIGHT,
}) => {
    return (
        <div className="w-full bg-black py-3 px-4 md:py-3.5">
            <div className="max-w-4xl mx-auto flex items-center justify-center gap-2 sm:gap-4 md:gap-10">
                <div className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={fireworksLeftSrc}
                        alt=""
                        className="max-w-full max-h-full object-contain pointer-events-none"
                    />
                </div>

                <div className="flex flex-col items-center gap-1 min-w-0 ">
                    <div
                        className="rounded-full px-4 py-1.5 md:px-8 md:py-2 text-center shadow-sm max-w-[min(100%,520px)]"
                        style={{
                            background:
                                "linear-gradient(90deg, #f7e290 0%, #c5a059 100%)",
                        }}
                    >
                        <p className="text-black text-lg font-bold leading-tight tracking-wide">
                            SPRING Discount Applied!
                        </p>
                        <p className="text-black text-xs  font-normal leading-snug mt-0.5">
                            Just $149 + Fast, Free Shipping
                        </p>
                    </div>
                    <p className="text-white text-base text-center leading-tight tracking-normal pt-2">
                        + Fully backed by our guarantee!
                    </p>
                </div>

                <div className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={fireworksRightSrc}
                        alt=""
                        className="max-w-full max-h-full object-contain pointer-events-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default MedViPromoBanner;
