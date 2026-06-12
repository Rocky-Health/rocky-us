import CustomImage from "@/components/utils/CustomImage";

const rockyFeaturesCardsMobile = [
  {
    title: "CA-Certified Pharmacy",
    image: "/convert_test/hospital.png",
  },
  {
    title: "Personalized Treatments",
    image: "/convert_test/spell-check 1.jpg",
  },
  {
    title: "1:1 Medical Support",
    image: "/convert_test/Vector.svg",
  },
  {
    title: "Trusted by 350K+ Canadians",
    image: "/convert_test/group 1.png",
  },
];

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
    title: "1:1 Medical Support",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/medical.png",
  },
  {
    title: "Trusted by 350K+ Canadians",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/Pre%20Sell/trusted.png",
  },
];

const RockyFeatures = ({ cards }) => {
  const dataToUse = cards ? cards : rockyFeaturesCards;
  return (
    <div className="w-full max-w-[1184px] mx-auto p-2 md:py-4 py-2">
      {/* Desktop: static centered list */}
      <div className="hidden lg:flex items-center justify-center gap-8">
        {dataToUse.map((card, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="relative rounded-2xl overflow-hidden w-[24px] h-[24px]">
              <CustomImage src={card.image} alt={card.title} fill sizes="24px" />
            </div>
            <h3 className="text-[16px] leading-[22.4px] font-[400]">
              {card.title}
            </h3>
          </div>
        ))}
      </div>

      {/* Mobile: static grid list */}
      <div className="lg:hidden grid grid-cols-1 gap-3 px-2">
        {dataToUse.map((card, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="relative rounded-2xl overflow-hidden w-[20px] h-[20px] flex-shrink-0">
              <CustomImage src={card.image} alt={card.title} fill sizes="20px" />
            </div>
            <h3 className="text-[14px] leading-[19.6px] font-[400]">
              {card.title}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RockyFeatures;
