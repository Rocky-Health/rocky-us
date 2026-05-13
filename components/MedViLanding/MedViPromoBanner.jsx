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
            <div className="max-w-xl mx-auto flex items-center justify-center gap-2 sm:gap-4 md:gap-10 relative">
                <div className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] flex items-center justify-center absolute left-0 z-5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={fireworksLeftSrc}
                        alt=""
                        className="max-w-full max-h-full object-contain pointer-events-none"
                    />
                </div>

                <div className="flex flex-col items-center gap-1 min-w-0 relative z-10">
                    <div
                        className="rounded-full sm:px-6 px-3 py-1.5  md:py-2 text-center shadow-sm max-w-[min(100%,460px)]"
                        style={{
                            background:
                                "linear-gradient(135deg,#fde68a,#c6a673,#c6a673)",
                        }}
                    >
                        <p className="text-black sm:text-lg text-base font-bold leading-tight tracking-wide">
                            SPRING Discount Applied!
                        </p>
                        <p className="text-black sm:text-xs text-[10px]  font-normal leading-snug mt-0">
                            Just $149 + Fast, Free Shipping
                        </p>
                    </div>
                    <p className="text-white sm:text-base text-xs text-center leading-tight tracking-normal pt-2">
                        + Fully backed by our guarantee!
                    </p>
                </div>

                <div className="shrink-0 w-11 h-11 sm:w-14 sm:h-14 md:w-[72px] md:h-[72px] flex items-center justify-center absolute right-0 z-5">
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
