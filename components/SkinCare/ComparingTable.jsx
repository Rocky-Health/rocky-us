"use client";
import { FaCheckCircle, FaRegTimesCircle } from "react-icons/fa";
import Image from "next/image";
import React from "react"

const ComparingTable = () => {
    const tableRef = React.useRef(null);

    const features = [
        "Clinically backed, personalized skin plans",
        "Regular check-ins with adjustments",
        "Dermatologist formulated treatments",
        "Skin type & concern profiling",
    ];

    const yourProduct = [true, true, true, true];
    const competitorA = [false, false, false, false];

    const gradientStyle = {
        background:
            "linear-gradient(348.23deg, #AE7E56 -6.68%, #F7EBE4 51.89%, #EFE2D7 88.25%)",
    };

    return (
        <div className="w-full bg-white">
            <div className="px-5 md:px-12 py-14 md:py-24 max-w-5xl mx-auto">
                <p className="block md:hidden text-black text-3xl font-medium mb-6">Why choose MyRocky ?</p>
                <div ref={tableRef} className="flex flex-row overflow-x-auto lg:overflow-x-hidden scrollbar-hide">
                    <div className="min-w-[120px] w-1/2 py-5">
                        <div className="h-24 lg:h-32 flex items-center border-b border-black">
                            <span className="text-black font-semibold text-start text-4xl w-full md:block hidden">
                                Why Choose <br /> MyRocky?
                            </span>
                        </div>
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="h-24 flex items-center border-b border-black px-2"
                            >
                                <span className="text-sm lg:text-base text-black">
                                    {feature}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="min-w-[100px] w-1/4 rounded-xl overflow-hidden py-5" style={gradientStyle}>
                        <div className="h-24 lg:h-32 flex items-center justify-center border-b border-black/80">
                            <Image
                                src="/skin-care/logo.png"
                                alt="MyRocky"
                                width={80}
                                height={80}
                                className="object-contain"
                            />
                        </div>
                        {yourProduct.map((value, i) => (
                            <div
                                key={i}
                                className="h-24 flex items-center justify-center border-b border-black/80 py-4"
                            >
                                {value ? (
                                    <FaCheckCircle className="text-black text-lg" />
                                ) : (
                                    <FaRegTimesCircle className="text-red-500 text-lg" />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className=" w-1/4 py-5">
                        <div className="h-24 lg:h-32 flex items-center justify-center border-b border-black ">
                            <span className="text-xs lg:text-base text-black text-center font-medium">
                                Other online providers
                            </span>
                        </div>
                        {competitorA.map((value, i) => (
                            <div
                                key={i}
                                className="h-24 flex items-center justify-center border-b border-black"
                            >
                                {value ? (
                                    <FaCheckCircle className="text-black text-lg" />
                                ) : (
                                    <FaRegTimesCircle className="text-black text-lg" />
                                )}
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </div >
    );
};

export default ComparingTable;
