import ProductCards from "@/components/utils/ProductCards";
import ProductSection from "@/components/utils/ProductSection";

const MentalProductCard = [
  {
    LeadingProductCard: {
      title: "Medication Selection",
      subtitle: "Find the right treatment",
      link: "/mh-pre-quiz",
      image:
        "bg-[url('https://myrocky.b-cdn.net/WP%20Images/Mental%20Health/8de08f123712b5f0f53ae8673e9793c6.webp')]",
    },
    ProductCard: [
      {
        title: "Bupropion XL",
        description: "Generic for Wellbutrin XL®",
        buttonName: "Get Treatment",
        link: "/mh-pre-quiz/",
        image:
          "https://myrocky.b-cdn.net/WP%20Images/Mental%20Health/MH-Tablets%20(1).webp",
      },
      {
        title: "Citalopram",
        description: "Generic for Celexa®",
        buttonName: "Get Treatment",
        link: "/mh-pre-quiz/",
        image:
          "https://myrocky.b-cdn.net/WP%20Images/Mental%20Health/MH-Tablets%20(1).webp",
      },
      {
        title: "Escitalopram",
        description: "Generic for Cipralex®",
        buttonName: "Get Treatment",
        link: "/mh-pre-quiz/",
        image:
          "https://myrocky.b-cdn.net/WP%20Images/Mental%20Health/MH-Tablets%20(1).webp",
      },
      {
        title: "Fluoxetine",
        description: "Generic for Prozac®",
        buttonName: "Get Treatment",
        link: "/mh-pre-quiz/",
        image:
          "https://mycdn.myrocky.com/wp-content/uploads/20240403134012/MH-Capsules.png",
      },
      {
        title: "Paroxetine",
        description: "Generic for Paxil®",
        buttonName: "Get Treatment",
        link: "/mh-pre-quiz/",
        image:
          "https://myrocky.b-cdn.net/WP%20Images/Mental%20Health/MH-Tablets%20(1).webp",
      },
      {
        title: "Sertraline",
        description: "Generic for Zoloft®",
        buttonName: "Get Treatment",
        link: "/mh-pre-quiz/",
        image:
          "https://mycdn.myrocky.com/wp-content/uploads/20240403134012/MH-Capsules.png",
      },
      {
        title: "Trazadone",
        buttonName: "Get Treatment",
        link: "/mh-pre-quiz/",
        image:
          "https://myrocky.b-cdn.net/WP%20Images/Mental%20Health/MH-Tablets%20(1).webp",
      },
      {
        title: "Venlafaxine XR",
        description: "Generic for Effexor®",
        buttonName: "Get Treatment",
        link: "/mh-pre-quiz/",
        image:
          "https://mycdn.myrocky.com/wp-content/uploads/20240403134012/MH-Capsules.png",
      },
    ],
  },
];

const MentalProducts = () => {
  return (
    <>
      <div className="md:-mb-[40px]">
        <h2 className="text-[32px] md:text-5xl font-[550] leading-[36.8px] md:leading-[55.2px] tracking-[-0.01em]  md:tracking-[-0.02em] mb-3 md:mb-4 headers-font">
          Most Popular Treatments
        </h2>
        <p className="text-lg md:text-xl font-[400] leading-[25.2px] md:leading-[28px] ">
          Our clinical team has put together effective treatments for you.
        </p>
      </div>
      <ProductSection>
        <div className="flex gap-4 flex-nowrap">
          {MentalProductCard.map((card, index) => (
            <ProductCards key={index} cards={card} />
          ))}
        </div>
      </ProductSection>
    </>
  );
};

export default MentalProducts;
