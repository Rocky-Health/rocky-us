import CustomContainImage from "@/components/utils/CustomContainImage";

const rockyInTheNewsCards = [
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/bloomberg-logo.png",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/yahoo-logo-grey.png",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/The_Globe_and_Mail_Stretched_grey.png",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/huf-magazine-grey.png",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/influencive-grey.png",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/market-watch-grey-new.png",
    },

    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/trendhunters.png",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/voyage-grey.png",
    },

    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/canhealth-logo-2x.png",
    },
    // {
    //     image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/the-canadian-business-journal-logo.png",
    // },
];

const RockyInTheNews = ({ cards }) => {
    const dataToUse = cards ? cards : rockyInTheNewsCards;
    return (
        <div className="px-5 sectionWidth:px-0">
            <div className="max-w-[1184px] mx-auto relative overflow-hidden w-full border-t border-solid border-[#E2E2E1] py-10 ">
                {/* Mobile Layout - Grid */}
                <div className="md:hidden">
                    {/* <div className="text-sm leading-[140%] font-medium mb-6 text-center">
            ROCKY IN THE NEWS
          </div> */}
                    <h5
                        className={`font-[500] text-black mb-[32px] md:text-[16px] headers-font leading-[100%] tracking-[1px] text-center `}
                    >
                        <span className="text-black subheaders-font">
                            Myrocky{" "}
                        </span>
                        <span className="text-[#AE7E56] font-[600] subheaders-font">
                            in the news
                        </span>
                    </h5>
                    <div className="grid grid-cols-2 gap-x-0 gap-y-6">
                        {dataToUse.map((card, index) => (
                            <div
                                key={index}
                                className={`flex-shrink-0 ${
                                    dataToUse.length % 2 !== 0 &&
                                    index === dataToUse.length - 1
                                        ? "col-span-2"
                                        : ""
                                }`}
                            >
                                <div
                                    className={`relative rounded-2xl overflow-hidden w-full max-h-[27px] flex justify-center items-center aspect-[3/1] ${
                                        dataToUse.length % 2 !== 0 &&
                                        index === dataToUse.length - 1
                                            ? "scale-[2]"
                                            : ""
                                    }`}
                                >
                                    <CustomContainImage
                                        src={card.image}
                                        className="object-contain"
                                        style={{
                                            filter: "grayscale(100%) brightness(0.4) contrast(1)",
                                        }}
                                        fill
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Desktop Layout - Horizontal Scrolling */}
                <div className="hidden md:flex items-center gap-8 md:gap-12 overflow-hidden relative">
                    {/* <div className="text-sm leading-[140%] font-medium whitespace-nowrap flex-shrink-0 z-20 relative bg-white pr-2">
                        ROCKY IN THE NEWS
                    </div> */}
                    <h5
                        className={`font-[500] text-black mb-1 text-[18px] subheaders-font leading-[100%] tracking-[1px]  `}
                    >
                        <span className="text-black subheaders-font">
                            Myrocky{" "}
                        </span>
                        <span className="text-[#AE7E56] font-[600] subheaders-font">
                            in the news
                        </span>
                    </h5>
                    <div className="flex-1 min-w-0 overflow-hidden relative">
                        <div className="flex items-center gap-[40px] md:gap-[82px] whitespace-nowrap w-fit h-[39px] relative animate-scroll">
                            {dataToUse.concat(dataToUse).map((card, index) => (
                                <div
                                    key={index}
                                    className="flex-shrink-0 min-w-[150px] max-w-[300px]"
                                >
                                    <div className="relative rounded-2xl overflow-hidden w-full min-h-[35px] flex justify-center items-center filter grayscale brightness-0">
                                        <CustomContainImage
                                            src={card.image}
                                            // className="object-contain filter brightness-0 grayscale"
                                            fill
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RockyInTheNews;
