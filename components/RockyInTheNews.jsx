import CustomContainImage from "./utils/CustomContainImage";

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
    // {
    //     image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/the-canadian-business-journal-logo.png",
    // },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/trendhunters.png",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/voyage-grey.png",
    },

    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/canhealth-logo-2x.png",
    },
];

const RockyInTheNews = ({ cards }) => {
    const dataToUse = cards ? cards : rockyInTheNewsCards;
    return (
        <div className="px-5 sectionWidth:px-0">
            <div className="max-w-[1184px] mx-auto relative overflow-hidden w-full border-t border-solid border-[#E2E2E1] py-10 ">
                <div className="md:hidden bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -right-[5px] md:right-0 top-[85px] w-[80px] h-[39px] z-10 rotate-[180deg]"></div>
                <div className="md:hidden bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -left-[5px] md:left-0 top-[85px] w-[80px] h-[39px] z-10"></div>
                <div className="text-sm leading-[140%] font-medium mb-6 text-center">
                    MYROCKY IN THE NEWS
                </div>
                <div className="flex items-center gap-[40px] md:gap-[82px] whitespace-nowrap w-fit h-[39px] relative animate-scroll">
                    {dataToUse.concat(dataToUse).map((card, index) => (
                        <div
                            key={index}
                            className="flex-shrink-0 min-w-[150px] max-w-[300px]"
                        >
                            <div className="relative rounded-2xl overflow-hidden w-full min-h-[25px] flex justify-center items-center filter grayscale brightness-0">
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
    );
};

export default RockyInTheNews;
