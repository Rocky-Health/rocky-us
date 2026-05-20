import React from "react";
import CrossSellPopup from "./CrossSellPopupBase";

// Female-specific add-on products
const femaleAddOnProducts = [
    {
        id: "287539", // Perimenopause Test Kit
        name: "Perimenopause Test Kit",
        price: "40.00",
        imageUrl:
            "https://mycdn.myrocky.com/wp-content/uploads/20240906110242/FSH-Box.png",
        bulletPoints: [
            "Helps identify if you are perimenopausal with 99% accuracy",
            "Urine test",
            "3 testing strips",
        ],
        showInfoIcon: true,
        dataType: "simple",
        dataVar: "",
        dataAddToCart: "287539",
        faqContent: `
      <p class="mb-4"><strong>Q: When should I use the test?</strong><br>
        A: For the most accurate result, we recommend using first-morning urine. If you are menstruating, it is advisable to test during the first week of your cycle and retest one week later.</p>
      <p class="mb-4"><strong>Q: Does a positive test mean you are in menopause?</strong><br>
        A: A positive test could mean you are either peri-menopausal or menopausal. To know for sure if you are menopausal, this is best discussed with your doctor as further tests may be needed.</p>
      <p class="mb-4"><strong>Q: Does a negative test result mean I'm not menopausal?</strong><br>
        A: A negative test result does not rule out peri-menopause or menopause, especially if you are experiencing relevant symptoms. You should discuss your symptoms with a doctor.</p>
    `,
    },
    {
        id: "287538", // Ovulation Test Kit
        name: "Ovulation Test Kit",
        price: "20.00",
        imageUrl:
            "https://mycdn.myrocky.com/wp-content/uploads/20240906110139/LH-Box.png",
        bulletPoints: [
            "Helps identify most fertile period for pregnancy with 99% accuracy",
            "Urine test",
            "10 testing strips",
        ],
        showInfoIcon: true,
        dataType: "simple",
        dataVar: "",
        dataAddToCart: "287538",
        faqContent: `
      <p class="mb-4"><strong>Q: When should I use this test?</strong><br>
        A: If you have 28 day cycles, test between days 10 to 18. Day one is the first day of your period. If your cycle is different, use this formula (length of your cycle - 28 + 10). For example, a 22 day cycle - 28 + 10 = day 4 to 12.</p>
      <p class="mb-4"><strong>Q: What time of the day should I perform the test?</strong><br>
        A: The test can be performed at any time of the day; however, first morning urine is not recommended. You should also reduce fluid intake for 2 hours before testing so your urine is more concentrated.</p>
      <p class="mb-4"><strong>Q: When should I stop testing?</strong><br>
        A: Stop testing once your test is positive, unless advised otherwise by your doctor.</p>
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

    // {
    //   id: "PLACEHOLDER_VM_ID", // Vulval Moisturizer - REPLACE WITH ACTUAL PRODUCT ID
    //   name: "Vulval Moisturizer",
    //   price: "35.00",
    //   imageUrl:
    //     "https://mycdn.myrocky.com/wp-content/uploads/20250629080157/VM-front-scaled.jpg",
    //   description:
    //     "Comfort where it matters most — daily hydration for a confident, irritation-free you.",
    //   bulletPoints: [
    //     "Non-hormonal & ultra-gentle: pH-balanced, fragrance-free, and safe for even the most sensitive vulvar skin.",
    //     "Deep hydration with clean ingredients: Powered by hyaluronic acid, jojoba oil, and vitamin E to soothe, protect, and restore.",
    //     "More than dryness relief: Supports everyday comfort from chafing, irritation, and changes due to hormones, aging, or hair removal",
    //   ],
    //   showInfoIcon: true,
    //   faqContent: `
    //     <p class="mb-4"><strong>Q: How often should I use the Vulval Moisturizer?</strong><br>
    //       A: For best results, use daily or as needed. It's gentle enough for everyday use and can be applied whenever you experience dryness or irritation.</p>
    //     <p class="mb-4"><strong>Q: Is it safe to use during pregnancy or while breastfeeding?</strong><br>
    //       A: Yes, our vulval moisturizer is formulated with clean, non-hormonal ingredients that are safe during pregnancy and breastfeeding. However, always consult with your healthcare provider if you have concerns.</p>
    //     <p class="mb-4"><strong>Q: Can I use this with other intimate products?</strong><br>
    //       A: Yes, this moisturizer is compatible with most other intimate care products. If you experience any irritation, discontinue use and consult your healthcare provider.</p>
    //   `,
    // },
    // {
    //   id: "323576", // Dad Hat
    //   name: "MyRocky Dad Hat",
    //   price: "29.99",
    //   imageUrl:
    //     "https://mycdn.myrocky.com/wp-content/uploads/20241211132726/Copy-of-RockyHealth-15-scaled.webp",
    //   bulletPoints: ["One size fits all", "Adjustable strap", "Cotton twill"],
    // },
];

const FemaleCrossSellPopup = ({
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
            addOnProducts={femaleAddOnProducts}
            onCheckout={onCheckout}
            selectedProductId={selectedProductId}
        />
    );
};

export default FemaleCrossSellPopup;
