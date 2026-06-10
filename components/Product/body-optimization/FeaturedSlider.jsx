import CustomContainImage from "@/components/utils/CustomContainImage";

const FeaturedSliderImages = [
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/uploads/yahoo-logo-grey.png`,
    alt: "Yahoo",
  },
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/uploads/canhealth-logo-2x.png`,
    alt: "canhealth",
  },
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/uploads/huf-magazine-grey.png`,
    alt: "HUF magazine",
  },
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/uploads/influencive-grey.png`,
    alt: "influencive grey",
  },
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/uploads/market-watch-grey-new.png`,
    alt: "market watch grey",
  },
  {
    image:
      `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/uploads/The_Globe_and_Mail_Stretched_grey.png`,
    alt: "The Globe and Mail",
  },
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/uploads/trendhunters.png`,
    alt: "trendhunters",
  },
  {
    image: `${process.env.BASE_URL || "https://wpbe.myrocky.com"}/wp-content/uploads/voyage-grey.png`,
    alt: "Voyage",
  },
  {
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/canhealth-logo-2x.png",
    alt: "CanHealth",
  },
];

const FeaturedSlider = ({ title = "FEATURED IN", speed = "fast" }) => {
  // Determine animation speed class based on prop
  const animationSpeedClass =
    speed === "fast" ? "animate-scroll-fast" : "animate-scroll";

  return (
    <div className="px-5 md:px-0 max-w-[1184px] mx-auto">
      <div className="relative overflow-hidden w-full border-t border-solid border-[#E2E2E1] py-10">
        <div className="md:hidden bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -right-[5px] md:right-0 top-[85px] w-[80px] h-[39px] z-10 rotate-[180deg]"></div>
        <div className="md:hidden bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -left-[5px] md:left-0 top-[85px] w-[80px] h-[39px] z-10"></div>

        <div className="text-sm leading-[140%] font-medium mb-6 text-center">
          {title}
        </div>

        <div
          className={`flex items-center gap-[40px] md:gap-[82px] whitespace-nowrap w-fit h-[39px] relative ${animationSpeedClass}`}
        >
          {[...FeaturedSliderImages, ...FeaturedSliderImages].map(
            (card, index) => (
              <div
                key={index}
                className="flex-shrink-0 min-w-[150px] max-w-[300px]"
              >
                <div className="relative rounded-2xl overflow-hidden w-full min-h-[25px] flex justify-center items-center filter grayscale brightness-0">
                  <CustomContainImage
                    src={card.image}
                    alt={card.alt || "Featured logo"}
                    fill
                  />
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FeaturedSlider;
