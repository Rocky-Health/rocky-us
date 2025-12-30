import CustomImage from "@/components/utils/CustomImage";
import Trustpilot from "../Sex/Trustpilot";

const ratings = [
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20ED%20Page/ch-1.png",
        text: "2-Day discreet delivery",
    },
    {
        image: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20ED%20Page/ch-2.png",
        text: "FDA-Approved meds",
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

const HighestRated = () => {
    return (
        <div className=" w-[335px] md:!w-[calc(100%_-_50px)] md:max-w-[1184px] lg:w-full mx-auto  bg-white md:border md:border-solid md:border-[#E2E2E1] rounded-lg py-[32px] md:py-[40px] md:shadow-[0px_1px_1px_0px_#E2E2E1] ">
            <div className="lg:max-w-5xl mx-auto overflow-hidden">
                <h2 className="text-[22px] md:text-[30px] leading-[25.3px] md:leading-[33px] font-[450] text-center mx-auto md:tracking-[-0.02em] max-w-[271px] md:max-w-full headers-font">
                    US&apos;s highest rated online pharmacy
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
                <div className="pt-4 pb-8 md:pb-10">
                    <Trustpilot />
                </div>
                {/* Ratings List */}
                <div className="relative">
                    <div className="md:hidden bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -right-[5px] md:right-0 bottom-[0] w-[96px] h-[72px] z-10 rotate-[180deg]"></div>
                    <div className="md:hidden bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -left-[5px] md:left-0 bottom-[0] w-[96px] h-[72px] z-10"></div>

                    <div className="hidden md:flex justify-center gap-6 ">
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
                    <div className="flex md:hidden justify-center gap-6 animate-scroll-faster md:animate-none">
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
    );
};

export default HighestRated;
