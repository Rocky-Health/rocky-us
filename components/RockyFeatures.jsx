import CustomImage from "@/components/utils/CustomImage";

const rockyFeaturesCards = [
  // {
  //   title: "US-Certified Pharmacy",
  //   image:
  //     "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/hospital%201.png",
  // },
  {
    title: "Personalized Treatments",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/personalized.png",
  },
  {
    title: "Trusted by 350K+ Users",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/trusted.png",
  },
  {
    title: "1:1 Medical Support",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/medical.png",
  },
];

const RockyFeatures = ({ cards }) => {
  const dataToUse = cards ? cards : rockyFeaturesCards;
  return (
    <div className="overflow-hidden relative w-full  mx-auto border border-solid border-[#E2E2E1] rounded-2xl py-4 max-w-[900px]">
      <div className="bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] lg:bg-white absolute -right-[5px] md:right-0 w-[80px] h-[24px] z-[1] rotate-[180deg]"></div>
      <div className="bg-[linear-gradient(270deg,rgba(255,255,255,0)_0%,#ffffff_100%)] absolute -left-[5px] md:left-0 w-[80px] h-[24px] z-[1]"></div>

      <div className="flex items-center whitespace-nowrap w-fit overflow-hidden lg:animate-none  animate-scroll lg:pl-[50px]">
        {dataToUse.concat(dataToUse).map((card, index) => (
          <div key={index} className="w-[271px] flex-shrink-0">
            <div className="flex items-center gap-2 h-[24px] justify-center">
              <div className="relative rounded-2xl overflow-hidden w-[24px] h-[24px]">
                <CustomImage src={card.image} alt={card.title} fill sizes="24px" />
              </div>
              <h3 className="text-[16px] leading-[22.4px] font-[400]">
                {card.title}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RockyFeatures;
