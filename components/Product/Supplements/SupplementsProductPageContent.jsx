"use client";

import Section from "@/components/utils/Section";
import { logger } from "@/utils/devLogger";
import dynamic from "next/dynamic";
import SupplementsProductDetails from "./SupplementsProductDetails";
import ImagesSection from "@/components/Supplements/ImagesSection";
import NightBoost from "@/components/Supplements/NightBoost";
import Recommended from "@/components/Supplements/Recommended";
import ComparingTable from "@/components/Supplements/ComparingTable";
import { memo, useState, useEffect } from "react";

// Dynamic imports for non-critical sections
const DynamicReviewsSection = dynamic(
    () => import("@/components/ReviewsSection"),
    {
        loading: () => (
            <div className="min-h-[300px] bg-[#F5F4EF] animate-pulse"></div>
        ),
        ssr: false,
    }
);

const DynamicHomeFaqsSection = dynamic(
    () => import("@/components/HomePage/HomeFaqsSection"),
    {
        loading: () => <div className="min-h-[200px] animate-pulse"></div>,
        ssr: false,
    }
);

const SupplementsProductPageContent = memo(({ clientProps, faqs }) => {
    const { product, variations, isLoading } = clientProps;
    const [recommendedProducts, setRecommendedProducts] = useState([]);
    const [loadingRecommended, setLoadingRecommended] = useState(false);

    // Fallback product slugs when no related products are available
    const fallbackProductSlugs = [
        "essential-gut-relief",
        "essential-mood-balance",
        "essential-night-boost",
        "hair-growth-support",
    ];

    // Fetch recommended products based on related_ids
    useEffect(() => {
        const fetchRecommendedProducts = async () => {
            // Always set loading to true initially
            setLoadingRecommended(true);

            try {
                const response = await fetch("/api/products/recommended", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        productIds: product?.related_ids || [],
                        fallbackSlugs: fallbackProductSlugs,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.products) {
                        setRecommendedProducts(data.products);
                    } else {
                        logger.error(
                            "Failed to fetch recommended products:",
                            data.error
                        );
                        setRecommendedProducts([]);
                    }
                } else {
                    logger.error("API request failed:", response.statusText);
                    setRecommendedProducts([]);
                }
            } catch (error) {
                logger.error("Error fetching recommended products:", error);
                setRecommendedProducts([]);
            } finally {
                setLoadingRecommended(false);
            }
        };

        fetchRecommendedProducts();
    }, [product?.related_ids]);

    // Define FAQs for different supplement products
    const getProductFAQs = () => {
        const productName = product?.name || "";
        const slug = product?.slug || "";

        // Hair Growth Support FAQs
        if (
            productName.toLowerCase().includes("hair growth") ||
            productName.toLowerCase().includes("hair-growth") ||
            slug.includes("hair-growth-support")
        ) {
            return [
                {
                    question: "How do I take Essential Follicle Support?",
                    answer: "Simply take 1 capsule twice daily with water. With 60 veggie capsules per bottle, you're set for a one-month journey to healthier hair.",
                },
                {
                    question:
                        "Is Essential Follicle Support suitable for vegetarians?",
                    answer: "Absolutely! Essential Follicle Support is formulated with veggie capsules and plant based ingredients, making it perfect for vegetarians.",
                },
                {
                    question: "Can women use Essential Follicle Support?",
                    answer: "Essential Follicle Support is designed specifically for men's hair health and is not intended for use by women.",
                },
                {
                    question: "Are there any side effects?",
                    answer: "Essential Follicle Support is generally well-tolerated. However, it's best to consult a healthcare professional before starting any new supplement.",
                },
                {
                    question: "Will Essential Follicle Support regrow my hair?",
                    answer: "Essential Follicle Support is designed to support hair health and growth. Results may vary, but it can contribute to fuller, healthier hair.",
                },
                {
                    question:
                        "Can I use Essential Follicle Support with other medications or supplements?",
                    answer: "If you're taking other medications or supplements, consult your healthcare professional before combining them with Essential Follicle Support.",
                },
                {
                    question: "How long until I see results?",
                    answer: "Results may vary, but many start noticing positive changes within three months of consistent use.",
                },
                {
                    question:
                        "Do I have to take Essential Follicle Support with food?",
                    answer: "Essential Follicle Support can be taken with or without food, based on your preference.",
                },
            ];
        }

        // Testosterone Support FAQs
        if (
            productName.toLowerCase().includes("testosterone") ||
            productName.toLowerCase().includes("t-boost") ||
            slug.includes("testosterone-support")
        ) {
            return [
                {
                    question: "How do I take Essential T-Boost?",
                    answer: "Take 1 capsule, twice daily of Essential T-Boost with water. Each bottle contains 60 vegan capsules, providing a one-month supply.",
                },
                {
                    question: "Is Essential T-Boost suitable for vegetarians?",
                    answer: "Yes, Testosterone support is formulated with vegan capsules and is suitable for vegetarians.",
                },
                {
                    question: "Can women use Essential T-Boost?",
                    answer: "Essential T-Boost is specifically designed to support healthy testosterone levels in men and is not intended for use by women.",
                },
                {
                    question:
                        "Are there any side effects associated with Essential T-Boost?",
                    answer: "Essential T-Boost is generally well-tolerated. However, as with any dietary supplement, individual responses may vary. It is always recommended to consult with a healthcare professional before starting any new supplement.",
                },
                {
                    question: "Will Essential T-Boost increase muscle mass?",
                    answer: "While Essential T-Boost may support muscle strength and vitality, it is not intended as a muscle-building supplement. Its primary focus is to support healthy testosterone levels and overall well-being.",
                },
                {
                    question:
                        "Can I use Essential T-Boost with other medications or supplements?",
                    answer: "If you are taking any medications or other supplements, it's essential to consult with your healthcare professional before using Essential T-Boost to ensure there are no potential interactions.",
                },
                {
                    question:
                        "How long should I use Essential T-Boost to see results?",
                    answer: "Individual responses may vary, but noticeable effects may be observed within a few weeks of consistent use. For optimal results, we recommend using Essential T-Boost as part of a healthy lifestyle and supplement regimen.",
                },
                {
                    question: "Can Essential T-Boost be taken with food?",
                    answer: "Essential T-Boost can be taken with or without food, depending on individual preferences. However, taking it with water may aid in faster absorption.",
                },
                {
                    question: "Is Essential T-Boost Health-US Approved?",
                    answer: "Yes- we are proud to offer supplements to our customers which are Health-US approved. This way we can guarantee safety & efficacy, and stand behind our product.",
                },
                {
                    question:
                        "Does Essential T-Boost have a Natural Product Number (NPN)?",
                    answer: "Yes- the NPN for Essential T-Boost is 80059283.",
                },
            ];
        }
        if (
            productName.toLowerCase().includes("gut relief") ||
            productName.toLowerCase().includes("gut-relief") ||
            slug.includes("essential-gut-relief")
        ) {
            return [
                {
                    question:
                        "1.⁠ ⁠What quality standards and certifications does Gut Relief meet?",
                    answer: "Gut Relief is produced in GMP-certified facilities and undergoes third-party testing in GLP-certified labs to ensure purity and potency. Every batch is screened for heavy metals, pesticides, micro-contaminants, and ingredient accuracy, following standards set by FDA-Approved and the Customer Food Inspection Agency. It's also non-GMO, gluten-free, caffeine-free, vegan, and contains no preservatives, artificial colors, flavors, or sweeteners.",
                },
                {
                    question:
                        "2.⁠ ⁠What ingredients are in Gut Relief and what do they do?",
                    answer: "Gut Relief features a powerful herbal blend of Sweet Fennel extract (to help reduce gas and bloating), Turmeric (to support digestion and reduce inflammation), and Milk Thistle (to support liver and gallbladder health).",
                },
                {
                    question:
                        "3.⁠ ⁠How and when should I take Gut Relief, and how soon might I feel a difference?",
                    answer: "Adults (19+) should take 1 capsule twice daily with water. Many users begin to feel relief from bloating and digestive discomfort within a few hours, while others may experience noticeable improvement after several days of consistent use.",
                },
                {
                    question:
                        "4.⁠ ⁠Can I take Gut Relief with other supplements or probiotics?",
                    answer: "Yes! Gut Relief is safe to use alongside probiotics and most other supplements. If you're on medication or managing a chronic condition, it's best to consult your healthcare provider first.",
                },
                {
                    question:
                        "5.⁠ ⁠Are there any precautions or side effects I should know about?",
                    answer: "Gut Relief is generally well-tolerated. Avoid combining it with alcohol or strong sedatives. If you're pregnant or breastfeeding, check with your doctor first. Stop use if you notice any adverse reactions.",
                },
                {
                    question:
                        "6.⁠ ⁠Is Gut Relief suitable for people with dietary restrictions?",
                    answer: "Absolutely—it's vegan, gluten-free, caffeine-free, non-GMO, and has no preservatives, artificial colors, flavors, or sweeteners.",
                },
                {
                    question:
                        "7.⁠ ⁠What form are the ingredients in, and why does it matter?",
                    answer: "Gut Relief uses potent herbal extracts, which are more concentrated than raw powders. This helps ensure you're getting a consistent amount of each ingredient to support digestive comfort and reduce bloating.",
                },
            ];
        }
        if (
            productName.toLowerCase().includes("mood balance") ||
            productName.toLowerCase().includes("mood-balance") ||
            slug.includes("essential-mood-balance")
        ) {
            return [
                {
                    question:
                        "1.⁠ ⁠What quality standards and certifications does Mood Balance meet?",
                    answer: "Mood Balance is made in GMP-certified (Good Manufacturing Practices) facilities and tested in GLP-certified labs to ensure purity, potency, and safety. Every batch is screened for heavy metals, pesticides, micro-contaminants, and ingredient accuracy, in line with standards set by FDA-Approved and the Customer Food Inspection Agency. It's also non-GMO and free from dairy, eggs, artificial preservatives, colors, sweeteners, yeast, and corn.",
                },
                {
                    question:
                        "2.⁠ ⁠What are the main benefits of taking Mood Balance?",
                    answer: "Each 500 mg capsule of Mood Balance (Ashwagandha root) helps balance mood, reduce stress, support a healthy cortisol response, benefit thyroid function, assist in blood sugar regulation, and may help control weight and food cravings.",
                },
                {
                    question:
                        "3.⁠ ⁠How and when should I take Mood Balance, and how long until I see results?",
                    answer: "Adults (19+) should take 1 capsule twice daily with a glass of water. Many users report feeling calmer and more balanced within a few days, with fuller benefits becoming noticeable after a few weeks of consistent use.",
                },
                {
                    question:
                        "4.⁠ ⁠Is Mood Balance safe for people with dietary restrictions?",
                    answer: "Yes! It's vegan, gluten-free, dairy-free, soy-free, and made with non-GMO ingredients. It also contains no artificial sweeteners, colors, or preservatives.",
                },
                {
                    question:
                        "5.⁠ ⁠Can I take Mood Balance with other supplements or medications?",
                    answer: "Generally safe, as Ashwagandha has no widespread contraindications. However, if you're taking medications—especially for thyroid, anxiety, or sleep—or managing a health condition, it's best to check with your healthcare provider first.",
                },
                {
                    question: "6.⁠ ⁠Are there any precautions or side effects?",
                    answer: "Avoid combining Mood Balance with alcohol, sedatives, or other calming supplements. If you're pregnant or breastfeeding, consult your doctor first. Discontinue use if you experience unusual symptoms.",
                },
                {
                    question:
                        "7.⁠ ⁠Where is the Ashwagandha sourced from, and what part of the plant is used?",
                    answer: "We source Ashwagandha root from its native region in India, using only the dried root—the part traditionally recognized in Ayurveda for its mood-balancing, adaptogenic benefits.",
                },
            ];
        }
        if (
            productName.toLowerCase().includes("night boost") ||
            productName.toLowerCase().includes("night-boost") ||
            slug.includes("essential-night-boost")
        ) {
            return [
                {
                    question:
                        "1.⁠ ⁠What quality standards and certifications does Night Boost meet?",
                    answer: "Night Boost is crafted with clinically researched, clean ingredients and undergoes third-party testing to verify purity and potency. Each batch is tested in GLP-certified labs for heavy metals, micro-contaminants, and ingredient integrity, following guidelines set by FDA-Approved and the Customer Food Inspection Agency. It also features IGEN-certified non-GMO ingredients and is made in facilities that follow GMP and ISO 17025 standards.",
                },
                {
                    question:
                        "2.⁠ ⁠What are the key ingredients and what do they do?",
                    answer: "Night Boost combines L‑Theanine, Magnesium Bisglycinate, Myo‑Inositol, Glycine, and GABA—a blend of amino acids and minerals that help reduce stress and anxiety, support relaxation, improve focus, and ease muscle tension.",
                },
                {
                    question:
                        "3.⁠ ⁠How and when should I take Night Boost, and how long until I feel a difference?",
                    answer: "Adults (19+) should take 2 capsules in the evening or before bedtime. Some people notice a calming effect within 30–60 minutes, while others may see the full benefits after a few days to a couple of weeks of consistent use.",
                },
                {
                    question: "4.⁠ ⁠Will it make me feel sleepy or drowsy?",
                    answer: "No—Night Boost is designed to help you feel calm yet alert. It promotes relaxation without causing drowsiness, making it suitable for use in the evening or as part of a wind-down routine.",
                },
                {
                    question:
                        "5.⁠ ⁠Is Night Boost suitable for people with allergies or dietary restrictions?",
                    answer: "Yes. It's vegan-friendly, gluten-free, dairy-free, soy-free, non-GMO, and contains no artificial colors, flavors, sweeteners, preservatives, or eggs.",
                },
                {
                    question:
                        "6.⁠ ⁠Can I take it alongside other supplements or medications?",
                    answer: "Generally, yes—Night Boost doesn't contain any known contraindicated ingredients. That said, if you're taking medications or managing a health condition, it's always best to check with your healthcare provider.",
                },
                {
                    question:
                        "7.⁠ ⁠Is it safe to use while pregnant or breastfeeding?",
                    answer: "If you're pregnant or breastfeeding, please consult your healthcare provider before using Night Boost, as with any supplement.",
                },
            ];
        }

        // Default FAQs for other supplements
        return [
            {
                question: "How should I take this supplement?",
                answer: "Follow the directions on the product label or consult with your healthcare professional for personalized guidance.",
            },
            {
                question: "Are there any side effects?",
                answer: "This supplement is generally well-tolerated. However, consult your healthcare professional before starting any new supplement.",
            },
            {
                question: "How long until I see results?",
                answer: "Results may vary by individual. Many people notice positive changes within a few weeks to months of consistent use.",
            },
        ];
    };

    // Define content for different supplement products
    const getProductContent = () => {
        const productName = product?.name || "";
        const slug = product?.slug || "";

        // Essential Night Boost content
        if (
            productName.toLowerCase().includes("night boost") ||
            slug.includes("essential-night-boost")
        ) {
            return {
                imageSlider: [
                    {
                        path: "/supplements/S1.jpg",
                        title: "Fall Asleep with Ease",
                        description:
                            "Helps you unwind and drift off naturally, without drowsiness.",
                    },
                    {
                        path: "/supplements/S2.jpg",
                        title: "Wake Up Clear & Energized",
                        description:
                            "Helps you unwind and drift off naturally, without drowsiness.",
                    },
                    {
                        path: "/supplements/S3.jpg",
                        title: "Gentle & Non-Habit Forming",
                        description:
                            "Supports your natural sleep cycle without dependency.",
                    },
                ],
                ingredients: {
                    title: "Essential Night Boost Ingredients Explained.",
                    description: "Essential Night Boost uses top ingredients.",
                    img: "/supplements/night_img.jpg",
                    bullets: [
                        {
                            title: "L-Theanine",
                            desc: "Promotes relaxation without drowsiness",
                        },
                        {
                            title: "Magnesium Bisglycinate",
                            desc: "Supports muscle relaxation and nervous system health",
                        },
                        {
                            title: "GABA (Gamma-Aminobutyric Acid)",
                            desc: "Helps calm the mind and reduce stress",
                        },
                        {
                            title: "Glycine",
                            desc: "Improves sleep quality and cognitive function",
                        },
                        {
                            title: "Inositol",
                            desc: "Supports mood balance and serotonin activity",
                        },
                    ],
                },
                comparison: {
                    title: "Why Essential Night Boost",
                    secTitle: "Melatonin Only",
                    thirdTitle: "Prescription Sleep Aids",
                    features: [
                        "Gentle & Non-Habit Forming",
                        "Supports Natural Sleep Cycle",
                        "No Morning Grogginess",
                        "Safe for Long-Term Use",
                        "Doesn't contain Additives or Chemicals",
                    ],
                    productCol: [true, true, true, true, true],
                    competitorCol1: [true, false, false, false, true],
                    competitorCol2: [false, false, false, false, false],
                },
            };
        }

        // Essential Mood Balance content
        if (
            productName.toLowerCase().includes("mood balance") ||
            productName.toLowerCase().includes("mood-balance") ||
            slug.includes("essential-mood-balance")
        ) {
            return {
                imageSlider: [
                    {
                        path: "/supplements/S4.jpg",
                        title: "Reduces Daily Stress",
                        description:
                            "Helps you feel more in control and less overwhelmed.",
                    },
                    {
                        path: "/supplements/S5.jpg",
                        title: "Promotes Emotional Stability",
                        description:
                            "Supports a steady, balanced mood throughout the day.",
                    },
                    {
                        path: "/supplements/S6.jpg",
                        title: "Eases Anxiety Naturally",
                        description:
                            "Helps calm racing thoughts and tension without harsh effects.",
                    },
                ],
                ingredients: {
                    title: "Essential Mood Boost Ingredients Explained.",
                    description: "Essential Mood Boost uses top ingredients.",
                    img: "/supplements/mood_image.jpg",
                    bullets: [
                        {
                            title: "Ashwagandha",
                            desc: "Powerful adaptogenic herb that helps your body manage stress and restore balance. Trusted for centuries in Ayurvedic medicine, it supports emotional well-being by reducing anxiety, improving mood, and promoting a calm, focused state of mind—naturally and without side effects.",
                        },
                    ],
                },
                comparison: {
                    title: "Why Essential Mood Boost",
                    secTitle: "Other supplements",
                    thirdTitle: "",
                    features: [
                        "Made in US",
                        "Third party tested for purity",
                        "No Drowsiness",
                        "Non GMO without fillers",
                        "Non-Habit Forming",
                    ],
                    productCol: [true, true, true, true, true],
                    competitorCol1: [false, false, true, false, true],
                    competitorCol2: [],
                },
            };
        }

        // Essential Gut Relief content
        if (
            productName.toLowerCase().includes("gut relief") ||
            slug.includes("essential-gut-relief")
        ) {
            return {
                imageSlider: [
                    {
                        path: "/supplements/S7.jpg",
                        title: "Relieves Bloating Fast",
                        description:
                            "Helps reduce that heavy, gassy feeling after meals.",
                    },
                    {
                        path: "/supplements/S8.jpg",
                        title: "Eases Indigestion",
                        description:
                            "Targets common symptoms like cramping, pressure, and fullness.",
                    },
                    {
                        path: "/supplements/S9.jpg",
                        title: "Supports Healthy Digestion",
                        description:
                            "Supports liver health and smoother digestion.",
                    },
                ],
                ingredients: {
                    title: "Essential Gut Relief Ingredients Explained.",
                    description:
                        "Essential Gut Relief uses premium ingredients.",
                    img: "/supplements/rel_image.jpg",
                    bullets: [
                        {
                            title: "Sweet Fennel",
                            desc: "Helps relax the digestive muscles to reduce bloating and gas",
                        },
                        {
                            title: "Turmeric",
                            desc: "Reduces gut inflammation and stimulates bile flow",
                        },
                        {
                            title: "Milk Thistle",
                            desc: "Supports liver function and helps detoxify the body.",
                        },
                    ],
                },
                comparison: {
                    title: "Why Essential Gut Relief",
                    secTitle: "Traditional Over-the-Counter Remedies",
                    thirdTitle: "",
                    features: [
                        "Long-Term Digestive Support",
                        "Supports Overall Digestion",
                        "Addresses Root Causes",
                        "Multi-Symptom Relief",
                        "Natural and quality tested",
                    ],
                    productCol: [true, true, true, true, true],
                    competitorCol1: [false, false, false, false, false],
                    competitorCol2: [],
                },
            };
        }

        // Hair Growth Support content
        if (
            productName.toLowerCase().includes("hair growth") ||
            productName.toLowerCase().includes("hair-growth") ||
            slug.includes("hair-growth-support")
        ) {
            return {
                imageSlider: [
                    {
                        path: "/supplements/hair1.jpg",
                        title: "Strength That Lasts",
                        description:
                            "Reinforces strands to reduce breakage and boost thickness.",
                    },
                    {
                        path: "/supplements/hair2.jpg",
                        title: "Fuel Fuller Growth",
                        description:
                            "Supports natural hair growth with key vitamins and botanicals.",
                    },
                    {
                        path: "/supplements/hair3.jpg",
                        title: "Nourish At The Root",
                        description:
                            "Feeds follicles with nutrients for a healthier scalp and resilient hair.",
                    },
                ],
                ingredients: {
                    title: "Essential Follicle Support Ingredients Explained.",
                    description:
                        "Essential Follicle Support uses premium ingredients.",
                    img: "/supplements/hair_img.jpg",
                    bullets: [
                        {
                            title: "Biotin",
                            desc: "Supports hair structure and promotes healthy hair growth",
                        },
                        {
                            title: "Collagen Peptides",
                            desc: "Provides building blocks for strong, healthy hair strands",
                        },
                        {
                            title: "Saw Palmetto",
                            desc: "Helps maintain healthy hair follicles and natural hair growth cycle",
                        },
                        {
                            title: "Iron",
                            desc: "Essential mineral for healthy hair growth and preventing hair loss",
                        },
                    ],
                },
                comparison: {
                    title: "Why Essential T-Boost",
                    secTitle: "Typical Boosters",
                    thirdTitle: null,
                    features: [
                        "Natural Energy Boost",
                        "Ayurvedic Formula",
                        "Libido + Desire Support",
                        "Clean, Plant-Based Ingredients",
                        "Daily Hormonal Balance",
                    ],
                    productCol: [true, true, true, true, true],
                    competitorCol1: [false, false, true, true, false],
                    competitorCol2: [],
                },
            };
        }

        // Testosterone Support content
        if (
            productName.toLowerCase().includes("testosterone") ||
            productName.toLowerCase().includes("t-boost") ||
            slug.includes("testosterone-support")
        ) {
            return {
                imageSlider: [
                    {
                        path: "/supplements/testosterone1.jpg",
                        title: "Unlock Lasting Energy",
                        description:
                            "Stay energized with natural ingredients that fight fatigue and boost stamina.",
                    },
                    {
                        path: "/supplements/testosterone2.jpg",
                        title: "Ignite Your Drive",
                        description:
                            "Enhance libido and performance with time-tested Ayurvedic aphrodisiacs.",
                    },
                    {
                        path: "/supplements/testosterone3.jpg",
                        title: "Balance Testosterone Naturally",
                        description:
                            "Support healthy hormone levels for improved mood, strength, and vitality.",
                    },
                ],
                ingredients: {
                    title: "Essential T-Boost Ingredients Explained.",
                    description:
                        "Essential T-Boost uses only premium ingredients.",
                    img: "/supplements/testosterone_img.jpg",
                    bullets: [
                        {
                            title: "Coenzyme Q10",
                            desc: "Supports heart health and cellular energy",
                        },
                        {
                            title: "Maca (Lepidium Meyenii, Root)",
                            desc: "Enhances energy, stamina, and libido",
                        },
                        {
                            title: "Grape Seed Extract",
                            desc: "Rich in antioxidants, promotes circulation and cell protection",
                        },
                        {
                            title: "L-Arginine",
                            desc: "Boosts blood flow and circulation",
                        },
                        {
                            title: "Tribulus (Tribulus Terrestris, Fruit)",
                            desc: "Supports testosterone levels and sexual health",
                        },
                    ],
                },
                comparison: {
                    title: "Why Essential T-Boost",
                    secTitle: "Typical Boosters",
                    thirdTitle: "",
                    features: [
                        "Natural Energy Boost",
                        "Ayurvedic Formula",
                        "Libido + Desire Support",
                        "Clean, Plant-Based Ingredients",
                        "Daily Hormonal Balance",
                    ],
                    productCol: [true, true, true, true, true],
                    competitorCol1: [false, false, false, false, false],
                    competitorCol2: [],
                },
            };
        }

        // Default content for other supplements
        return {
            imageSlider: [
                {
                    path: "/supplements/S1.jpg",
                    title: "Natural & Effective",
                    description:
                        "Made with premium ingredients for optimal results.",
                },
                {
                    path: "/supplements/S2.jpg",
                    title: "Science-Backed Formula",
                    description: "Developed by healthcare professionals.",
                },
                {
                    path: "/supplements/S3.jpg",
                    title: "Safe & Pure",
                    description: "Third-party tested for quality and purity.",
                },
            ],
            ingredients: {
                title: `${productName} Ingredients Explained.`,
                description: `${productName} uses premium ingredients.`,
                img: "/supplements/night_img.jpg",
                bullets: [
                    {
                        title: "Premium Ingredients",
                        desc: "Made with the highest quality natural ingredients",
                    },
                ],
            },
            comparison: {
                title: `Why ${productName}`,
                secTitle: "Other supplements",
                thirdTitle: "",
                features: [
                    "Made in US",
                    "Third party tested for purity",
                    "No Drowsiness",
                    "Non GMO without fillers",
                    "Non-Habit Forming",
                ],
                productCol: [true, true, true, true, true],
                competitorCol1: [false, false, true, false, true],
                competitorCol2: [],
            },
        };
    };

    const productContent = getProductContent();
    const productFAQs = getProductFAQs();

    // Early return for loading state
    if (!product && isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="min-h-[400px] animate-pulse bg-gray-100 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="supplements-product-page">
            {/* Hero Section with Product Details */}
            <SupplementsProductDetails
                product={product}
                variations={variations}
                isLoading={isLoading}
            />
            {/* Images Section */}
            <ImagesSection images={productContent.imageSlider} />
            {/* Ingredients Section */}
            <NightBoost
                title={productContent.ingredients.title}
                description={productContent.ingredients.description}
                img={productContent.ingredients.img}
                bullets={productContent.ingredients.bullets}
            />
            {/* Comparison Table */}
            {!product?.slug?.includes("hair-growth-support") && (
                <Section>
                    <ComparingTable
                        img={
                            product?.images?.[0]?.src ||
                            "/supplements/product.png"
                        }
                        title={productContent.comparison.title}
                        sec_title={productContent.comparison.secTitle}
                        third_title={productContent.comparison.thirdTitle}
                        f_col={productContent.comparison.features}
                        sec_col={productContent.comparison.productCol}
                        third_col={productContent.comparison.competitorCol1}
                        fourth_col={productContent.comparison.competitorCol2}
                    />
                </Section>
            )}
            {/* Recommended Products - Always show this section */}
            <Recommended
                products={recommendedProducts}
                isLoading={loadingRecommended}
            />
            {/* Reviews Section */}
            <Section bg="bg-[#F5F4EF]">
                <DynamicReviewsSection />
            </Section>
            {/* FAQs Section */}
            <Section>
                <DynamicHomeFaqsSection faqs={productFAQs} />
            </Section>
        </div>
    );
});

SupplementsProductPageContent.displayName = "SupplementsProductPageContent";

export default SupplementsProductPageContent;
