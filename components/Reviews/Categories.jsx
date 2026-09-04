import CustomImage from "@/components/utils/CustomImage";
import Link from "next/link";

const coverCards = [
  {
    title: "Sexual Health",
    description: "Get Confidence Back In Bed",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/hero-1.webp",
    link: "/sex",
  },
  {
    title: "Weight Loss",
    description: "Better Wellness, Through Science",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/hero-2.webp",
    link: "/body-optimization",
  },
  // {
  //   title: "Mental Health",
  //   description: "Your Mental Health Matters",
  //   image:
  //     "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/hero-3.webp",
  //   link: "/mental-health",
  // },
  {
    title: "Hair Loss",
    description: "Stop Hair Loss In Its Tracks",
    image:
      "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/New%20Home%20Page/hero-4.webp",
    link: "/hair",
  },
  // {
  //   title: "Smoking Cessation",
  //   description: "A New Way To Quit",
  //   image: "https://myrocky.b-cdn.net/WP%20Images/Homepage/zonnic-hands.png",
  //   link: "/product/zonnic",
  // },
  // {
  //   title: "Recovery",
  //   description: "A Smarter Way To Recover",
  //   image: "https://myrocky.b-cdn.net/WP%20Images/dhm/DHMBlendPP.png?v=1",
  //   link: "/product/dhm-blend",
  // },
];

const Categories = () => {
  return (
    <div className="mx-auto text-center poppins-font">
      <h2 className="text-[40px] lg:text-[60px] leading-[46px] lg:leading-[69px]  tracking-[-0.01em] lg:tracking-[-0.02em] text-[#000000] headers-font">
        Men's Healthcare,
      </h2>
      <h2 className="font-[500] text-[30px] lg:text-[40px] leading-[42px] lg:leading-[56px]">
        made easy, quick & discreet
      </h2>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4 my-8 lg:my-14 justify-center items-center">
        {coverCards &&
          coverCards.map((card) => {
            return (
              <Link
                href={card.link}
                className="relative rounded-xl overflow-hidden shadow-lg w-full h-60 md:h-[275px]"
                aria-label={card.title}
                key={card.title}
              >
                <CustomImage src={card.image} alt={card.title} fill priority />
                <div className="absolute inset-0 text-start bg-black bg-opacity-40 flex flex-col justify-between py-4 px-2 md:p-4 md:px-[0.8rem]">
                  <h3 className="text-white text-[15px] font-[500]">
                    {card.title}
                  </h3>
                  <h4 className="text-white text-[19px] md:text-[20px] font-[450] leading-[33px] headers-font">
                    {card.description}
                  </h4>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default Categories;
