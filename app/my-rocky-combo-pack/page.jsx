"use client";
import LearnMore from "@/components/ComboPack/LearnMore";
import ProductSection from "@/components/ComboPack/ProductSection";
import FaqsSection from "@/components/FaqsSection";
import AfterAndBeforSection from "@/components/Hair/AfterAndBeforSection";
import ProductSkeleton from "@/components/Product/ProductSkeleton";
import Section from "@/components/utils/Section";
import { useState } from "react";

const products = [
    {
        id: "1",
        name: "MyRocky Hair Kit",
        description:
            "A power house combination of prescription and natural hair products.",
        img: "https://mycdn.myrocky.com/wp-content/uploads/20240403135520/RockyHealth-HQ-88-scaled.jpg",
        items: [
            { name: "Finasteride", quantity: "1X", size: "1 mg tablet(s)" },
            { name: "Minoxidil", quantity: "1X", size: "60 ml / 2 fl oz" },
            {
                name: "Essential IX Shampoo",
                quantity: "1X",
                size: "240 ml / 8 fl oz",
            },
        ],
        subscriptionOptions: [
            {
                id: "monthly",
                value: "monthly",
                text: "1 Month Supply",
                price: "$90",
                productId: "784",
                subscriptionPeriod: "1_month_24",
            },
            {
                id: "quarterly",
                value: "quarterly",
                text: "3 Months Supply",
                price: "$220",
                productId: "397049",
                subscriptionPeriod: "3_month_24",
            },
        ],
        isHairKit: true,
    },
    {
        id: "2",
        name: "Prescription Hair Kit",
        description: "A combination of prescription and OTC hair products.",
        img: "https://mycdn.myrocky.com/wp-content/uploads/20240403135519/RockyHealth-HQ-84-scaled.jpg",
        items: [
            { name: "Finasteride", quantity: "1X", size: "1 mg tablet(s)" },
            { name: "Minoxidil", quantity: "1X", size: "60 ml / 2 fl oz" },
        ],
        subscriptionInfo: {
            productId: "6288",
            period: "3_month_24",
            price: "$180",
            regularPrice: "$240",
            discount: "25% discount",
        },
        isPrescriptionKit: true,
    },
    {
        id: "3",
        name: "Organic Hair Kit",
        description:
            "Improve the health of your scalp and provide your hair with the right environment to thrive. Our all natural and organic products have the ingredients to do just that.",
        img: "https://mycdn.myrocky.com/wp-content/uploads/20240403135521/RockyHealth-HQ-86-scaled.jpg",
        items: [
            {
                name: "Essential IX Shampoo",
                quantity: "1X",
                size: "240 ml / 8 fl oz",
            },
            {
                name: "Essential V Oil",
                quantity: "1X",
                size: "60 ml / 2 fl oz",
            },
        ],
        subscriptionOptions: [
            {
                id: "monthly",
                value: "monthly",
                text: "1 Month Supply",
                price: "$45",
                productId: "786",
                subscriptionPeriod: "1_month_24",
            },
            {
                id: "quarterly",
                value: "quarterly",
                text: "3 Months Supply",
                price: "$120",
                productId: "391886",
                subscriptionPeriod: "3_month_24",
            },
        ],
        isOrganicKit: true,
    },
];

// Items are a single product details in combo packages and not the same combo products
const items = [
    {
        id: 1,
        name: "Finasteride",
        img: "https://mycdn.myrocky.com/wp-content/uploads/20240403135529/RockyHealth-HQ-81-scaled.jpg",
        size: "1 mg tablet(s)",
    },
    {
        id: 2,
        name: "Minoxidil",
        img: "https://mycdn.myrocky.com/wp-content/uploads/20240403135528/RockyHealth-HQ-80-scaled.jpg",
        size: "60 ml / 2 fl oz",
    },
    {
        id: 3,
        name: "Essential IX Shampoo",
        img: "https://mycdn.myrocky.com/wp-content/uploads/20240403135526/RockyHealth-HQ-78-scaled.jpg",
        size: "240 ml / 8 fl oz",
    },
    {
        id: 4,
        name: "Essential V Oil",
        img: "https://mycdn.myrocky.com/wp-content/uploads/20240403135331/RockyHealth-HQ-85-scaled.jpg",
        size: "60 ml / 2 fl oz",
    },
];

const faqs = [
    {
        question: "What is myRocky?",
        answer: "myRocky is a 100% online platform with a focus to normalize health topics that too often go unspoken and eliminate the stigma surrounding them. At myRocky, we make it easy for patients to connect to licensed healthcare professionals. We help with weight loss, sexual health, hair Loss, mental health and much more. We've built a simple & convenient online process which helps you connect to healthcare professionals in order to get customized treatment plans, shipped right to your door.",
    },
    {
        question: "How does MyRocky work?",
        answer: "MyRocky offers prescription and over-the-counter products. For prescription medication, you will need to complete an online medical intake/questionnaire...",
    },
    {
        question: "Who looks after you at MyRocky?",
        answer: "MyRocky is operated by Healthcare Professionals including Doctors, Nurse Practitioners, and Pharmacists. Our team is experienced and readily available...",
    },
    {
        question: "How does MyRocky ensure patient privacy?",
        answer: "MyRocky handles the privacy and security of all our customers with great care. Our platform meets all required regulatory compliance...",
    },
];

export default function CompoPack() {
    const [loading, setLoading] = useState(false);
    return (
        <>
            <main>
                {loading ? (
                    <ProductSkeleton />
                ) : (
                    <ProductSection products={products} />
                )}
                <Section>
                    <AfterAndBeforSection />
                </Section>
                <Section bg="bg-gray-100">
                    <LearnMore products={items} />
                </Section>
                <Section>
                    <FaqsSection
                        faqs={faqs}
                        title="Your Questions, Answered"
                        name="Meet MyRocky"
                        subtitle="Frequently asked questions"
                    />
                </Section>
            </main>
        </>
    );
}
