import Section from "../utils/Section";
import ProductCard from "./ProductCard";

export default function TreatmentPlans() {
  const products = [
    {
      label: "MOST POPULAR",
      activeIngeredient: "(GLP-1)",
      name: "Semaglutide",
      hasSale: true,
      price: "149",
      oldPrice: "300",
      description:
        "Same active ingredient as Ozempic. The popular and affordable alternative.",
      WLPrograme: true,
      image: "/bo4/semaglutide.png",
    },

    {
      label: "BEST RESULTS",
      activeIngeredient: "(GLP-1/GIP)",
      name: "Tirzepatide",
      hasSale: true,
      price: "249",
      oldPrice: "450",
      description:
        "Dual-action mechanism with the highest rated clinical weight loss.",
      WLPrograme: true,
      image: "/bo4/tirzepatide.png",
    },
  ];
  return (
    <Section>
      <h2 className="subheaders-font text-[40px] leading-[115%] tracking-tight font-medium text-center mb-[16px]">
        <span className="text-[#AE7E56]">MyRocky</span> Treatment Plans
      </h2>
      <p className="md:text-[18px] tracking-tight text-center">
        Medication + Coaching + Support = Real Weight Loss Results.
      </p>

      <div className="flex justify-center items-center gap-4">
        <ProductCard product={products[0]} />
        <ProductCard product={products[1]} />
      </div>
    </Section>
  );
}
