import CustomImage from "@/components/utils/CustomImage";

const rockyFeaturesCards = [
  {
    title: "CA-Certified Pharmacy",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/hospital%201.png",
  },
  {
    title: "Personalized Treatments",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/personalized.png",
  },
  {
    title: "Trusted by 350K+ Canadians",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/trusted.png",
  },
  {
    title: "1:1 Medical Support",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/medical.png",
  },
];

const FeaturesNotAnimated = ({
  cards,
  bg = "bg-transparent",
  MobileBg = "bg-transparent",
}) => {
  const dataToUse = cards ? cards : rockyFeaturesCards;
  return (
    <>
      {/* Mobile View */}
      <div
        className={`lg:hidden w-full max-w-[1184px] mx-auto border border-solid border-[#E2E2E1] rounded-2xl px-[24px] py-[24px] ${MobileBg ? MobileBg : ""}`}
      >
        {dataToUse.map((card, index) => (
          <div
            key={card.title ?? index}
            className={` ${index !== dataToUse.length - 1 ? "mb-[15px] border-b border-solid border-[#E2E2E1] pb-[15px]" : ""}`}
          >
            <div className="flex items-center gap-2">
              <div className="relative rounded-2xl overflow-hidden w-[24px] h-[24px]">
                <CustomImage src={card.image} alt={card.title} fill />
              </div>
              <h3 className="text-[16px]  font-[400]">{card.title}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div
        className={`hidden lg:block overflow-hidden relative w-full max-w-[1184px] mx-auto border border-solid border-[#E2E2E1] rounded-2xl py-4  ${bg ? bg : ""}`}
      >
        <div className="flex items-center whitespace-nowrap w-fit overflow-hidden lg:pl-[50px]">
          {dataToUse.map((card, index) => (
            <div key={card.title ?? index} className="w-[271px] flex-shrink-0">
              <div className="flex items-center gap-2 h-[24px] justify-center">
                <div className="relative rounded-2xl overflow-hidden w-[24px] h-[24px]">
                  <CustomImage src={card.image} alt={card.title} fill />
                </div>
                <h3 className="text-[16px] leading-[22.4px] font-[400]">
                  {card.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FeaturesNotAnimated;
