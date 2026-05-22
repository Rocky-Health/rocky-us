import CustomImage from "@/components/utils/CustomImage";
import CustomContainImage from "./utils/CustomContainImage";
import Trustpilot from "@/components/Sex/Trustpilot";

const ratings = [
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20ED%20Page/ch-1.png",
        text: "2-Day discreet delivery",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20ED%20Page/ch-2.png",
        text: "FDA Approved meds",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20ED%20Page/ch-3.png",
        text: "Free same-day prescription",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20ED%20Page/ch-4.png",
        text: "Free unlimited medical support",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20ED%20Page/ch-5.png",
        text: "Lowest price guarantee",
    },
];

const news = [
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
const RockyInTheNews2 = () => {
    return (
        <section className="bg-[#F6F8FB] py-10 pt-[7rem] md:pt-[4rem] mt-[10rem] relative ">
            {/* Ratings Section */}
            <div className=" w-[335px] md:!w-[calc(100%_-_50px)] md:max-w-[1184px] lg:w-full mx-auto  bg-white border border-solid border-[#E2E2E1] rounded-lg py-[32px] md:py-[40px] shadow-[0px_1px_1px_0px_#E2E2E1] absolute -translate-x-2/4 left-2/4 -top-[10rem]">
                <div className="overflow-hidden mx-auto lg:max-w-5xl">
                    <h2 className="text-[22px] md:text-[30px] leading-[25.3px] md:leading-[33px] font-[450] text-center mx-auto md:tracking-[-0.02em] max-w-[271px] md:max-w-full headers-font">
                        The United States highest rated online pharmacy
                    </h2>

                    {/* Trustpilot Widget */}
                    {/* <div className="flex items-center justify-center h-auto mt-4  mb-[32px] md:mb-[40px] gap-4">
            <div className="trustpilot-widget scale-[.9]">
              <iframe
                template-id="5419b6ffb0d04a076446a9af"
                title="Customer reviews powered by Trustpilot"
                loading="auto"
                src="https://widget.trustpilot.com/trustboxes/5419b6ffb0d04a076446a9af/index.html?templateId=5419b6ffb0d04a076446a9af&businessunitId=637cea41a90e1b4641b56036#locale=en-US&styleHeight=20px&styleWidth=100%25&styleColor=black&theme=light"
                className="w-full h-[20px] border-none"
              ></iframe>
            </div>
          </div> */}

                    {/* <div
            id="trustpilot-container"
            className="trustpilot-widget w-[152px] h-[90px] flex items-center justify-center mx-auto mt-5 "
            data-locale="en-US"
            data-template-id="53aa8807dec7e10d38f59f32"
            data-businessunit-id="637cea41a90e1b4641b56036"
            data-style-height="150px"
            data-style-width="100%"
            style={{ position: "relative" }}
          /> */}
                    <div className="mb-8 md:mb-10 mt-4">
                        <Trustpilot />
                    </div>

                    {/* Ratings List */}
                    <div className="relative ">
                        <div className="md:hidden bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -right-[5px] md:right-0 bottom-[0] w-[96px] h-[72px] z-10 rotate-[180deg]"></div>
                        <div className="md:hidden bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -left-[5px] md:left-0 bottom-[0] w-[96px] h-[72px] z-10"></div>

                        <div className=" gap-6 justify-center hidden md:flex">
                            {ratings.map((item, index) => (
                                <div
                                    key={index}
                                    className="text-center min-w-[120px] max-w-[130px]"
                                >
                                    <div className="w-[24px] h-[24px] md:w-[32px] md:h-[32px] mx-auto mb-2 relative">
                                        <CustomImage
                                            src={item.image}
                                            alt={item.text}
                                            className="object-cover rounded-2xl"
                                            fill
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                        <div className="flex md:hidden gap-6 justify-center animate-scroll-faster md:animate-none">
                            {[...ratings, ...ratings].map((item, index) => (
                                <div
                                    key={index}
                                    className="text-center min-w-[120px] max-w-[130px]"
                                >
                                    <div className="w-[24px] h-[24px] md:w-[32px] md:h-[32px] mx-auto mb-2 relative">
                                        <CustomImage
                                            src={item.image}
                                            alt={item.text}
                                            className="object-cover rounded-2xl"
                                            fill
                                        />
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* News Section */}
            <div className="max-w-[1184px] mx-auto relative overflow-hidden w-full md:pt-16 mt-[30px]">
                <div className="text-sm leading-[140%] font-medium mb-6 text-center">
                    MYROCKY IN THE NEWS
                </div>
                <div className="flex items-center gap-[40px] md:gap-[82px] whitespace-nowrap w-fit h-[39px] relative animate-scroll">
                    {news.concat(news).map((card, index) => (
                        <div key={index} className="flex-shrink-0 w-[150px]">
                            <div className="relative  overflow-hidden w-full min-h-[25px] flex justify-center items-center">
                                <CustomContainImage
                                    src={card.image}
                                    className="object-contain w-full h-full filter brightness-0 grayscale"
                                    fill
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RockyInTheNews2;
