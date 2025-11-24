"use client";

import Section from "@/components/utils/Section";
import dynamic from "next/dynamic";
import DhmBlendProductDetails from "./DhmBlendProductDetails";
import DhmBlendWhySection from "./DhmBlendWhySection";
import HowRockyWorks from "@/components/HowRockyWorks";
import { memo } from "react";
import DhmEasySection from "./DhmEasySection";
import DhmIngredients from "./DhmIngredients";

const DynamicReviewsSection = dynamic(
    () => import("@/components/ReviewsSection"),
    {
        loading: () => (
            <div className="min-h-[300px] bg-[#F5F4EF] animate-pulse"></div>
        ),
        ssr: false,
    }
);

const DynamicFaqsSection = dynamic(() => import("@/components/FaqsSection"), {
    loading: () => <div className="min-h-[200px] animate-pulse"></div>,
    ssr: false,
});

const DhmBlendProductPageContent = memo(({ clientProps }) => {
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
        <div className="dhm-blend-product-page">
            <div className="container mx-auto px-4 py-8">
                <DhmBlendProductDetails
                    product={product}
                    variations={variations}
                    isLoading={isLoading}
                />
            </div>

            <DhmBlendWhySection />

            <Section>
                <DhmEasySection />
            </Section>

            <Section>
                <DhmIngredients />
            </Section>

            <Section>
                <HowRockyWorks />
            </Section>

            <Section bg="bg-[#F5F4EF]">
                <DynamicReviewsSection />
            </Section>

            <Section>
                <DynamicFaqsSection
                    title="Your Questions, Answered"
                    subtitle="Frequently asked questions"
                    faqs={[
                        {
                            question: "What is DHM Blend?",
                            answer: "DHM Blend is a science-backed formula with DHM, L-Cysteine, Milk Thistle, Prickly Pear, and Vitamin B Complex. It's authorized for sale by FDA-Approved and designed to support recovery.",
                        },
                        {
                            question: "How does DHM Blend work?",
                            answer: "DHM Blend contains key ingredients that support your body's natural recovery processes. The formula includes Dihydromyricetin (DHM), which is the primary active ingredient, along with supporting ingredients like L-Cysteine, Milk Thistle, and Prickly Pear.",
                        },
                        {
                            question: "How do I take DHM Blend?",
                            answer: "For best results, take DHM Blend according to the directions on the package. Typically, it's recommended to take when needed for recovery support.",
                        },
                    ]}
                    name={product?.name}
                />
            </Section>
        </div>
    );
});

export default DhmBlendProductPageContent;
