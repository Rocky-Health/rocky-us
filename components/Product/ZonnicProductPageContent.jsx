"use client";

import Section from "@/components/utils/Section";
import BecomingSmokeFree from "@/components/Zonnic/BecomingSmokeFree";
import dynamic from "next/dynamic";
import ZonnicProductDetails from "./ZonnicProductDetails";
import HowRockyWorks from "@/components/HowRockyWorks";
import { memo } from "react";

// Dynamically import non-critical components to improve initial load time
// const DynamicProfessionalAdvice = dynamic(
//   () => import("@/components/ProfessionalAdvice"),
//   {
//     loading: () => (
//       <div className="min-h-[250px] bg-[#F5F4EF] animate-pulse"></div>
//     ),
//     ssr: false,
//   }
// );

// Use dynamic imports with loading=false to prevent render blocking for non-critical sections
const DynamicReviewsSection = dynamic(
  () => import("@/components/ReviewsSection"),
  {
    loading: () => (
      <div className="min-h-[300px] bg-[#F5F4EF] animate-pulse"></div>
    ),
    ssr: false,
  }
);

const DynamicEasySection = dynamic(
  () => import("@/components/Zonnic/EasySection"),
  {
    loading: () => <div className="min-h-[300px] animate-pulse"></div>,
    ssr: false,
  }
);

const DynamicZonnicFaqsSection = dynamic(
  () => import("@/components/Zonnic/ZonnicFaqsSection"),
  {
    loading: () => <div className="min-h-[200px] animate-pulse"></div>,
    ssr: false,
  }
);

const DynamicZonnicIngredients = dynamic(
  () => import("@/components/Zonnic/ZonnicIngredientsSection"),
  {
    loading: () => <div className="min-h-[300px] animate-pulse"></div>,
    ssr: false,
  }
);

const ZonnicProductPageContent = memo(({ clientProps }) => {
  const { product, variations, isLoading } = clientProps;

  // Early return for loading state
  if (!product && isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="min-h-[400px] animate-pulse bg-gray-100 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="zonnic-product-page">
      <div className="container mx-auto px-4 py-8">
        <ZonnicProductDetails
          product={product}
          variations={variations}
          isLoading={isLoading}
        />
      </div>

      <Section>
        <BecomingSmokeFree />
      </Section>

      <Section>
        <DynamicEasySection />
      </Section>

      <Section>
        <DynamicZonnicIngredients />
      </Section>

      {/* <Section bg="bg-[#F5F4EF]">
        <DynamicProfessionalAdvice
          title="Get Professional<br>Advice"
          points={[
            "No GP or pharmacy visits needed.",
            "Free initial consultation with healthcare providers.",
            "Unlimited follow ups.",
            "Support for your smoking cessation journey.",
          ]}
          buttonText="Start Free Visit"
          buttonLink={consultationLink || "/smoking-consultation"}
          buttonLinkProps={{ prefetch: true }}
          imageUrl="https://myrocky.b-cdn.net/WP%20Images/product%20v2/get-p-advice.png"
          imageAlt="MyRocky professional advice"
        />
      </Section> */}

      <Section>
        <HowRockyWorks />
      </Section>

      <Section bg="bg-[#F5F4EF]">
        <DynamicReviewsSection />
      </Section>

      <Section>
        <DynamicZonnicFaqsSection />
      </Section>
    </div>
  );
});

export default ZonnicProductPageContent;
