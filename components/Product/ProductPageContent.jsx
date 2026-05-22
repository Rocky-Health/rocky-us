"use client";

import { useMemo } from "react";
import { ProductImage, ProductClient } from "@/components/Product";
import { sildenafilFaqs, tadalafilFaqs } from "./constants/edFaqs";
import BasicProductInfo from "./BasicProductInfo";
import Section from "@/components/utils/Section";
import MoreQuestions from "@/components/MoreQuestions";
import dynamic from "next/dynamic";
import { PRODUCT_TYPES } from "@/lib/constants/productTypes";

// Dynamically import non-critical components to improve initial load time
const DynamicProfessionalAdvice = dynamic(
    () => import("@/components/ProfessionalAdvice"),
    {
        loading: () => (
            <div className="min-h-[250px] bg-[#F5F4EF] animate-pulse"></div>
        ),
        ssr: false,
    },
);

// Use dynamic imports with loading=false to prevent render blocking for non-critical sections
const DynamicReviewsSection = dynamic(
    () => import("@/components/ReviewsSection"),
    {
        loading: () => (
            <div className="min-h-[300px] bg-[#F5F4EF] animate-pulse"></div>
        ),
        ssr: false,
    },
);

const DynamicHowRockyWorks = dynamic(
    () => import("@/components/HowRockyWorks"),
    {
        loading: () => <div className="min-h-[300px] animate-pulse"></div>,
        ssr: false,
    },
);

const DynamicFaqsSection = dynamic(() => import("@/components/FaqsSection"), {
    loading: () => <div className="min-h-[200px] animate-pulse"></div>,
    ssr: false,
});

/**
 * ProductPageContent Component
 * Client-side wrapper for product page content
 */
const ProductPageContent = ({ clientProps, faqs }) => {
    const {
        product,
        productType,
        variationType,
        variations,
        consultationLink,
        isLoading,
    } = clientProps;

    // Use memoization for FAQs processing to improve performance
    const formattedFaqs = useMemo(() => {
        try {
            const productSlug = product?.slug || "";

            if (productSlug === "sildenafil-viagra") {
                return sildenafilFaqs;
            }

            if (productSlug === "tadalafil-cialis") {
                return tadalafilFaqs;
            }

            // If in loading state or no faqs available, return minimal set
            if (isLoading || !faqs) {
                return [
                    {
                        question: "What is this product?",
                        answer: "Loading product information...",
                    },
                ];
            }

            // Default FAQs if none are available
            const defaultFaqs = [
                {
                    question: "What is this product?",
                    answer: `${
                        product?.name || "This product"
                    } is designed to help with specific health concerns. Always consult with your healthcare provider for personalized advice.`,
                },
                {
                    question: "How should I use this product?",
                    answer: "Always follow your healthcare provider's instructions and the directions provided with the product.",
                },
                {
                    question: "Are there any side effects?",
                    answer: "All medications may have side effects. Consult with your healthcare provider about potential side effects and how to manage them.",
                },
            ];

            // If faqs is not valid or empty, use default
            if (
                !faqs ||
                typeof faqs !== "object" ||
                (Array.isArray(faqs) && faqs.length === 0)
            ) {
                return defaultFaqs;
            }

            // If faqs is a string (which would explain the single letters)
            if (typeof faqs === "string") {
                return defaultFaqs;
            }

            // If we have a valid array of FAQs
            if (Array.isArray(faqs)) {
                const validFaqs = faqs
                    .filter((faq) => faq && typeof faq === "object")
                    .map((faq) => {
                        // If already in the right format
                        if (faq.question && faq.answer) {
                            return faq;
                        }

                        // If using title/text format
                        if (faq.title && faq.text) {
                            return {
                                question: faq.title,
                                answer: faq.text,
                            };
                        }

                        // Try to extract from other object structures
                        return null;
                    })
                    .filter(Boolean); // Remove nulls

                return validFaqs.length > 0 ? validFaqs : defaultFaqs;
            } else {
                // Not an array
                return defaultFaqs;
            }
        } catch (error) {
            // Fallback to safe default FAQs in case of any error
            return [
                {
                    question: "How can I learn more about this product?",
                    answer: "Contact our customer support team for more information about this product and its benefits.",
                },
            ];
        }
    }, [faqs, product?.name, isLoading]);

    return (
        <div>
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <ProductImage
                                src={
                                    product?.images?.[0]?.src || product?.image
                                }
                                alt={product?.name || ""}
                                priority
                            />
                        </div>
                    </div>

                    <div className="flex justify-center lg:justify-start">
                        {isLoading ? (
                            <BasicProductInfo product={product} />
                        ) : (
                            <ProductClient
                                product={product}
                                productType={productType}
                                variationType={variationType}
                                variations={variations}
                                consultationLink={consultationLink}
                            />
                        )}
                    </div>
                </div>
            </div>

            <Section bg="bg-[#F5F4EF]">
                <DynamicProfessionalAdvice
                    title="Get Professional<br>Advice"
                    points={[
                        "No GP or pharmacy visits needed.",
                        "Free initial consultation with healthcare providers.",
                        "Unlimited follow ups.",
                        "No GP or pharmacy visits needed.",
                    ]}
                    buttonText="Start Free Visit"
                    buttonLink={
                        productType === PRODUCT_TYPES.HAIR
                            ? "/hair-pre-consultation-quiz"
                            : "/ed-pre-consultation-quiz"
                    }
                    buttonLinkProps={{ prefetch: true }}
                    imageUrl="https://myrocky.b-cdn.net/WP%20Images/ED-bag.webp"
                    imageAlt="MyRocky professional advice"
                />
            </Section>

            <Section>
                <DynamicHowRockyWorks />
            </Section>

            <Section bg="bg-[#F5F4EF]">
                <DynamicReviewsSection />
            </Section>

            <Section>
                <DynamicFaqsSection
                    title="Your Questions, Answered"
                    subtitle="Frequently asked questions"
                    faqs={formattedFaqs}
                    name={product?.name}
                />
                <MoreQuestions link="/product-faq/" prefetch={true} />
            </Section>
        </div>
    );
};

export default ProductPageContent;
