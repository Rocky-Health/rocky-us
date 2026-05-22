import React from "react";
import dynamic from "next/dynamic";
import Section from "@/components/utils/Section";

const DynamicHomeFaqsSection = dynamic(
    () => import("@/components/HomePage/HomeFaqsSection"),
    {
        loading: () => <div className="min-h-[200px] animate-pulse"></div>,
        ssr: false,
    }
);

const getProductFAQs = () => {
    // MyRocky Merchandise FAQs
    return [
        {
            question: "What size should I order?",
            answer: "Check our size chart to find your best fit. If you're between sizes, we recommend sizing up for a more relaxed feel.",
        },
        {
            question: "What materials are the products made of?",
            answer: "Our Garments are made of 100% Cotton Customer Milled Fabric.",
        },
        {
            question: "How do I care for my merch?",
            answer: "We recommend machine washing in cold water and air drying to maintain integrity. For hats, hand wash gently and air dry.",
        },
        {
            question: "Do you ship internationally?",
            answer: "As of now, we only ship to our fellow Customers.",
        },
        {
            question: "Can I return or exchange my order?",
            answer: "All merch and hats are final sale. For hygiene and safety reasons, we're unable to accept returns or exchanges on these items.",
        },
    ];
};

const MerchFaqs = () => {
    const productFAQs = getProductFAQs();
    return (
        <Section>
            <DynamicHomeFaqsSection
                faqs={productFAQs}
                name="Meet Your Daily Fit"
                isFirstCardOpen={false}
            />
        </Section>
    );
};

export default MerchFaqs;
