import { ProductImage, ProductClient } from "@/components/Product";
import BasicProductInfo from "../BasicProductInfo";
import HowItWorksVideo from "./HowItWorksVideo";
import HowRockyWorks from "./HowRockyWorks";
import VideoTestimonials from "./VideoTestimonials";
import PropTypes from "prop-types";
import FeaturedSlider from "./FeaturedSlider";
import FaqsSection from "@/components/FaqsSection";
import MoreQuestions from "@/components/MoreQuestions";
import {
  ozempicFaqs,
  mounjaroFaqs,
  wegovyFaqs,
  rybelsusFaqs,
} from "./constants/faqs";
import ResultSection from "@/components/BodyOptimization/ResultSection";
import ProductDisplay from "./ProductDisplay";

const BodyOptimizationProductPageContent = ({ clientProps }) => {
  const { product } = clientProps;

  const productSlug = product?.slug || "";

  const getFaqsByProductSlug = (slug) => {
    if (!slug) return ozempicFaqs;

    const slugLower = slug.toLowerCase();

    if (slugLower.includes("ozempic")) return ozempicFaqs;
    if (slugLower.includes("mounjaro")) return mounjaroFaqs;
    if (slugLower.includes("wegovy")) return wegovyFaqs;
    if (slugLower.includes("rybelsus")) return rybelsusFaqs;

    return ozempicFaqs;
  };

  const productFaqs = getFaqsByProductSlug(productSlug);

  return (
    <div className="px-5 md:px-0 py-14 md:py-24">
      <ProductDisplay product={product} productSlug={productSlug} />

      <HowItWorksVideo productSlug={productSlug} />
      <HowRockyWorks />
      <div className="max-w-[1184px] mx-auto px-0 my-16">
        <ResultSection />
      </div>
      <VideoTestimonials />
      <FeaturedSlider />
      <FaqsSection
        faqs={productFaqs}
        title="Your Questions, Answered"
        name="Meet MyRocky"
        subtitle="Frequently asked questions"
        isFirstCardOpen={true}
      />
      <div className="max-w-[1184px] mx-auto px-0">
        <MoreQuestions link="/faqs/" />
      </div>
    </div>
  );
};

BodyOptimizationProductPageContent.propTypes = {
  clientProps: PropTypes.shape({
    product: PropTypes.shape({
      name: PropTypes.string,
      images: PropTypes.arrayOf(
        PropTypes.shape({
          src: PropTypes.string,
        })
      ),
      image: PropTypes.string,
      slug: PropTypes.string,
      price: PropTypes.string,
      short_description: PropTypes.string,
    }),
    productType: PropTypes.any,
    variationType: PropTypes.any,
    variations: PropTypes.any,
    consultationLink: PropTypes.string,
    isLoading: PropTypes.bool,
  }).isRequired,
};

export default BodyOptimizationProductPageContent;
