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

    {
      activeIngeredient: "(GLP-1)",
      name: "Ozempic®",
      hasSale: false,
      price: "1310",
      description: "Name Brand Semaglutide Injection",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Ozempic.jpg",
      features: ["Same active ingredient as Wegovy", "Strong appetite control"],
    },

    {
      activeIngeredient: "(GLP-1/GIP)",
      name: "Mounjaro®",
      hasSale: false,
      price: "1410",
      description: "Name Brand Tirzepatide Injection",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Mounjaro.jpg",
      features: [
        "Dual-hormone mechanism for enhanced results",
        "Enhanced results vs other injectables",
      ],
    },

    {
      activeIngeredient: "(GLP-1)",
      name: "Wegovy®",
      hasSale: false,
      price: "1770",
      description: "Name Brand Semaglutide Injection",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Wegovy.jpg",
      features: [
        "Same active ingredient as Ozempic",
        "Strong appetite control",
      ],
    },

    {
      activeIngeredient: "(GLP-1)",
      name: "Rybelsus®",
      hasSale: false,
      price: "1310",
      description: "Name Brand Oral Semaglutide Pill",
      WLPrograme: true,
      image:
        "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/wl/Rybelsus.jpg",
      features: [
        "Mild weight loss effect compared to injectables",
        "Best suited for patients who are needle-averse",
      ],
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

      <div className="flex justify-center items-center gap-4 mt-[48px] mb-[48px]">
        <ProductCard product={products[0]} />
        <ProductCard product={products[1]} />
      </div>

      <h2 className="subheaders-font text-[48px] leading-[115%] tracking-tight font-medium text-center mb-[16px]">
        <span className="text-[#AE7E56]">Brand Name GLP-1</span> Treatments
      </h2>

      <div className="flex justify-center items-center gap-4 mt-[48px] mb-[48px]">
        <ProductCard product={products[2]} />
        <ProductCard product={products[3]} />
        <ProductCard product={products[4]} />
        <ProductCard product={products[5]} />
      </div>

      <p className="text-center max-w-[878px] text-[14px] leading-[140%] text-[#00000066] tracking-tight mx-auto">
        *Compounded medications have not been evaluated or approved by the FDA
        for safety, efficacy, or quality. Your provider will work with you to
        determine what, if any, medication is right for your own healthcare
        needs. Visit our Medication Safety Information.
      </p>
    </Section>
  );
}
