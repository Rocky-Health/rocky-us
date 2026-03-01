import React from "react";
import CrossSellPopup from "./CrossSellPopupBase";

// Male-specific add-on products
const maleAddOnProducts = [
    {
        id: "262914", // Essential T-Boost - Match ED flow
        name: "Essential T-Boost",
        title: "Essential T-Boost", // Add title field for compatibility
        price: 35, // Use number format to match ED flow
        quantity: "60 Capsules", // Match ED flow
        frequency: "30-days supply", // Match ED flow
        imageUrl:
            "https://mycdn.myrocky.com/wp-content/uploads/20250908134137/t-boost.png",
        image: "https://mycdn.myrocky.com/wp-content/uploads/20250908134137/t-boost.png", // Add image field
        bulletPoints: [
            "Helps improve overall testosterone levels",
            "Enhances libido",
            "Promotes a sense of well-being",
        ],
        showInfoIcon: true,
        dataType: "simple",
        dataVar: "",
        dataAddToCart: "262914",
        faqContent: `
      <p class="mb-4"><strong>Q: What is Essential T-Boost?</strong><br>
        A: Essential T-Boost is a supplement designed to support healthy testosterone levels in men.</p>
      <p class="mb-4"><strong>Q: How do I take Essential T-Boost?</strong><br>
        A: Take one capsule daily with food, or as directed by your healthcare provider.</p>
      <p class="mb-4"><strong>Q: How long does it take to see results?</strong><br>
        A: While individual results may vary, many users report benefits within 2-4 weeks of consistent use.</p>
    `,
    },
    {
        id: "490612",
        name: "Essential Night Boost",
        price: "30.00",
        imageUrl: "/supplements/night-boost.webp",
        bulletPoints: [
            "Made in US",
            "Non GMO - no fillers or chemicals",
            "Third party tested for purity",
        ],
        showInfoIcon: true,
        dataType: "simple",
        dataVar: "",
        dataAddToCart: "490612",
    },
    {
        id: "490621",
        name: "Essential Mood Balance",
        price: "36.00",
        imageUrl: "/supplements/mood.webp",
        bulletPoints: [
            "Made in US",
            "Non GMO - no fillers or chemicals",
            "Third party tested for purity",
        ],
        showInfoIcon: true,
        dataType: "simple",
        dataVar: "",
        dataAddToCart: "490621",
    },
    {
        id: "490636",
        name: "Essential Gut Relief",
        price: "36.00",
        imageUrl: "/supplements/gut.webp",
        bulletPoints: [
            "Made in US",
            "Non GMO - no fillers or chemicals",
            "Third party tested for purity",
        ],
        showInfoIcon: true,
        dataType: "simple",
        dataVar: "",
        dataAddToCart: "490636",
    },
    {
        id: "353755", // Dad Hat - CORRECT ID
        name: "MyRocky Essential Cap",
        price: "25",
        imageUrl:
            "https://mycdn.myrocky.com/wp-content/uploads/20250918120236/rocky-hat.png",
        bulletPoints: ["One size fits all", "Adjustable strap", "Cotton twill"],
        dataType: "simple",
        dataVar: "",
        dataAddToCart: "353755",
    },
    // {
    //   id: "93366",
    //   name: "Essential Follicle Support",
    //   price: "39.00",
    //   imageUrl:
    //     "https://myrocky.com/wp-content/uploads/RockyHealth-Proofs-HQ-111-Hair-1-500x500.jpg",
    //   bulletPoints: [
    //     "Made in US",
    //     "Non GMO - no fillers or chemicals",
    //     "Third party tested for purity",
    //   ],
    //   showInfoIcon: true,
    // },
];

const MaleCrossSellPopup = ({
    isOpen,
    onClose,
    mainProduct,
    onCheckout,
    selectedProductId,
}) => {
    return (
        <CrossSellPopup
            isOpen={isOpen}
            onClose={onClose}
            mainProduct={mainProduct}
            addOnProducts={maleAddOnProducts}
            onCheckout={onCheckout}
            selectedProductId={selectedProductId}
        />
    );
};

export default MaleCrossSellPopup;
