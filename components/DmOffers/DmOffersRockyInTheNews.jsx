import CustomContainImage from "@/components/utils/CustomContainImage";

const rockyInTheNewsCards = [
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/bloomberg-logo.png",
        name: "Bloomberg",
        alt: "Bloomberg",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/yahoo-logo-grey.png",
        name: "Yahoo!",
        alt: "Yahoo!",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/The_Globe_and_Mail_Stretched_grey.png",
        name: "The Globe and Mail",
        alt: "The Globe and Mail",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/huf-magazine-grey.png",
        name: "HUF Magazine",
        alt: "HUF Magazine",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/influencive-grey.png",
        name: "Influencive",
        alt: "Influencive",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/market-watch-grey-new.png",
        name: "Market Watch",
        alt: "Market Watch",
    },
    // {
    //     image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/the-canadian-business-journal-logo.png",
    // },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/trendhunters.png",
        name: "Trendhunters",
        alt: "Trendhunters",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/voyage-grey.png",
        name: "Voyage",
        alt: "Voyage",
    },

    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/canhealth-logo-2x.png",
        name: "CanHealth",
        alt: "CanHealth",
    },
];

/** Logos that read small at the default strip size — bump height for these only */
const LARGER_PRESS_LOGO_NAMES = new Set([
    "Bloomberg",
    "Global News",
    "Canadian Business Journal",
]);

export default function DmOffersRockyInTheNews({ cards }) {
    const dataToUse = cards ? cards : rockyInTheNewsCards;
    return (
        <div className="px-5 sectionWidth:px-0">
            <div className="max-w-[1184px] mx-auto relative overflow-hidden w-full  py-10 ">
                <div className="md:hidden bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -right-[5px] md:right-0 top-[85px] w-[80px] h-[39px] z-10 rotate-[180deg] sm:block hidden"></div>
                <div className="md:hidden bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -left-[5px] md:left-0 top-[85px] w-[80px] h-[39px] z-10 sm:block hidden"></div>
                <div className="text-sm leading-[140%] font-medium mb-10 text-center">
                    MYROCKY IN THE NEWS
                </div>
                <div className=" items-center gap-[40px] md:gap-[82px] whitespace-nowrap w-fit h-[39px] relative animate-scroll sm:flex hidden">
                    {[
                        ...dataToUse,
                        ...dataToUse,
                        ...dataToUse,
                        ...dataToUse,
                    ].map((card, index) => {
                        const isLarger = LARGER_PRESS_LOGO_NAMES.has(card.name);

                        return (
                            <div
                                key={index}
                                className={`flex-shrink-0 inline-flex items-center justify-center ${
                                    isLarger
                                        ? "max-w-[min(280px,92vw)] md:max-w-[340px]"
                                        : "max-w-[min(240px,90vw)] md:max-w-[260px]"
                                }`}
                            >
                                <CustomContainImage
                                    src={card.image}
                                    // className="object-contain filter brightness-0 grayscale"
                                    width={isLarger ? 220 : 170}
                                    height={isLarger ? 56 : 42}
                                    sizes="(max-width: 767px) 40vw, 240px"
                                    className={`w-auto max-w-full object-contain brightness-0 ${
                                        isLarger ? "h-7 md:h-12" : "h-5 md:h-9"
                                    }`}
                                    alt={card.alt}
                                />
                            </div>
                        );
                    })}
                </div>
                <div className=" items-center gap-[40px] md:gap-[82px] whitespace-nowrap w-fit  relative flex-wrap sm:hidden flex justify-center">
                    {dataToUse.map((card, index) => {
                        const isLarger = LARGER_PRESS_LOGO_NAMES.has(card.name);

                        return (
                            <div
                                key={index}
                                className={`flex-shrink-0 inline-flex items-center justify-center ${
                                    isLarger
                                        ? "max-w-[min(280px,92vw)] md:max-w-[340px]"
                                        : "max-w-[min(240px,90vw)] md:max-w-[260px]"
                                }`}
                            >
                                <CustomContainImage
                                    src={card.image}
                                    // className="object-contain filter brightness-0 grayscale"
                                    width={isLarger ? 220 : 170}
                                    height={isLarger ? 56 : 42}
                                    sizes="(max-width: 767px) 40vw, 240px"
                                    className={`w-auto max-w-full object-contain brightness-0 ${
                                        isLarger ? "h-7 md:h-12" : "h-5 md:h-9"
                                    }`}
                                    alt={card.alt}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
