import { WLProducts } from "../../data/PreConsultationProductsData";

// Simplified quiz configuration for BO
// Only includes: BMI Calculator, Potential Weight Loss, Your Weight, and Recommendations
export const boSimplifiedConfig = {
    recommendationRules: [
        // Weight loss recommendation logic (same as standard WL)
        {
            conditions: {
                bmi: (bmi) => bmi < 27,
            },
            outcome: {
                recommended: null,
                alternatives: [],
                message: "You are not eligible for medical weight loss.",
            },
        },
        {
            conditions: {
                bmi: (bmi) => bmi >= 27,
                weightDuration: "less-than-6",
            },
            outcome: {
                recommended: WLProducts.RYBELSUS,
                alternatives: [WLProducts.COMPOUNDED_TIRZEPATIDE, WLProducts.COMPOUNDED_SEMAGLUTIDE, WLProducts.OZEMPIC, WLProducts.WEGOVY, WLProducts.RYBELSUS],
            },
        },
        {
            conditions: {
                bmi: (bmi) => bmi >= 27,
            },
            outcome: {
                recommended: WLProducts.COMPOUNDED_TIRZEPATIDE,
                alternatives: [WLProducts.COMPOUNDED_SEMAGLUTIDE, WLProducts.OZEMPIC, WLProducts.MOUNJARO, WLProducts.WEGOVY, WLProducts.RYBELSUS],
            },
        },
        {
            conditions: {}, // Default case
            outcome: {
                recommended: WLProducts.COMPOUNDED_TIRZEPATIDE,
                alternatives: [WLProducts.COMPOUNDED_SEMAGLUTIDE, WLProducts.OZEMPIC, WLProducts.MOUNJARO, WLProducts.WEGOVY, WLProducts.RYBELSUS],
            },
        },
    ],

    steps: {
        // Step 1: BMI Calculator
        1: {
            id: "currentWeight",
            type: "BMICalculator",
            title: "See how much weight you could lose",
            field: "currentWeight",
            required: true,
            showPopupAfterStep: "potentialWeightLoss", // Show popup after BMI calculation
        },
        // Step 2: Your Weight Popup (shown after potential weight loss calculation)
        2: {
            id: "yourWeight",
            type: "popup",
            // This will be handled by popup system
        },

         2: {
            id: "RockyLongTerm",
            type: "popup",
            // This will be handled by popup system
        },
        // Step 3: Product Recommendations
        4: {
            id: "productRecommendations",
            type: "recommendation",
            title: "Recommended for you",
            field: "selectedProduct",
            required: true,
        },
    },

    // Navigation configuration (simplified)
    navigation: {
        1: 2, // BMI Calculator -> Your Weight Popup
        2: 3, // Your Weight Popup -> Product Recommendations
        3: 4, // Product Recommendations -> Complete (goes to checkout)
    },

    // Progress mapping
    progressMap: {
        1: 25, // BMI Calculator
        2: 50,
        3: 75, // Your Weight Popup
        4: 100, // Product Recommendations
    },

    // Step titles
    stepTitles: {
        1: "Height & Weight",
        2: "Your Weight",
        3: "Rocky Long-Term",
        4: "Product Recommendations",
    },

    // Popup configurations
    popups: {
        // Potential Weight Loss Calculation Popup (shown after BMI step)
        potentialWeightLoss: {
            asPage: false,
            isWL: true,
            component: "Counter",
            title: "Calculating your potential weight loss",
            texts: [
                "Your height is {height}",
                "Your weight is {weight}",
                "Calculating based on clinical data",
            ],
            headerStyle:
                "headers-font text-[26px] md:text-[32px] leading-[120%] mb-[16px]",
            messageStyle: "text-[20px] md:text-[24px] leading-[140%] mb-[24px]",
            nextPopup: "YourWeightPopup", // Configure which popup to show after counter finishes
            buttons: [
                {
                    label: "Continue",
                    action: "openPopup",
                    popupName: "YourWeightPopup",
                    primary: false,
                    disabled: true,
                },
            ],
        },

        // Your Weight Popup (shown after potential weight loss calculation)
        YourWeightPopup: {
            progress: "50",
            isWL: true,
            asPage: true,
            component: "YourWeightPopup",
            title: "Your Weight", // Add title for popup
            text: "{weight}",
            PrivacyText: true,
            buttons: [
                {
          label: "Continue",
          action: "openPopup",
          popupName: "RockyLongTerm",
          primary: true,
        },
            ],
        },


         RockyLongTerm: {
                progress: "75",
                isWL: true,
                headerStyle:
                    "headers-font text-[26px]  md:text-[32px] headers-font leading-[120%] mb-[16px] text-center",
                title: "Rocky creates long-term weight loss",
                messageStyle:
                    "text-[14px] md:text-[16px] leading-[140%] mb-[24px] text-center",
                message:
                    "Rocky members lose 2-5x more weight than similar programs. Our approach goes beyond just medication — we help you build lasting habits for a healthier life.",
                image: "/wl-pre-consultation/Weight1.jpg",
                imageTop: false,
                imageStyle:
                    "w-[100%] h-[320px] md:h-[324px] lg:w-[335px] rounded-[32px] mb-4",
                OnAverageMessage: true,
                PrivacyText: true,
                buttons: [
                    {
                    label: "Continue",
                    action: "navigate",
                    payload: 4, // Go to step 4 (per navigation config)
                    primary: true,
                    },
                ],
    },



    },
};
