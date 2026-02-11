import { WLProducts } from "../../data/PreConsultationProductsData";

// // Segmented Compounded Semaglutide product for wl-offer flow
// const COMPOUNDED_SEMAGLUTIDE_SEGMENTED = {
//     id: "489778",
//     name: "Compounded Semaglutide",
//     description: "(semaglutide) Vial",
//     price: "$299",
//     details: "Semaglutide is the generic version of Ozempic. It is a personalized treatment to help reduce appetite and keep you fuller for longer",
//     url: "https://myrocky.b-cdn.net/WP%20Images/Global%20Images/ozempic/Semaglutide.jpg",
//     supplyAvailable: true,
// };

// Configuration for wl-offer-pre-consultation flow
// This is isolated from other quiz configs to allow custom features
export const wlOfferConfig = {
    recommendationRules: [
        // Weight loss recommendation logic
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
                recommended: WLProducts.COMPOUNDED_SEMAGLUTIDE,
                alternatives: [WLProducts.COMPOUNDED_TIRZEPATIDE, WLProducts.OZEMPIC, WLProducts.WEGOVY, WLProducts.RYBELSUS],
            },
        },
        {
            conditions: {
                bmi: (bmi) => bmi >= 27,
            },
            outcome: {
                recommended: WLProducts.COMPOUNDED_SEMAGLUTIDE,
                alternatives: [WLProducts.COMPOUNDED_TIRZEPATIDE, WLProducts.OZEMPIC, WLProducts.MOUNJARO, WLProducts.WEGOVY, WLProducts.RYBELSUS],
            },
        },
        {
            conditions: {}, // Default case
            outcome: {
                recommended: WLProducts.COMPOUNDED_SEMAGLUTIDE,
                alternatives: [WLProducts.COMPOUNDED_TIRZEPATIDE, WLProducts.OZEMPIC, WLProducts.MOUNJARO, WLProducts.WEGOVY, WLProducts.RYBELSUS],
            },
        },
    ],

    steps: {
        // Step 1: BMI Calculator
        1: {
            id: "currentWeight",
            type: "BMICalculator",
            title: "What is your height and weight?",
            subtitle:
                "<span style='color:#B4845A; font-size:16px'>This helps calculate your BMI (Body Mass Index), a general screening tool for body composition.</span>",
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
    },

    // Navigation configuration
    navigation: {
        1: 2, // BMI Calculator -> Your Weight Popup
        2: "checkout", // Your Weight Popup -> Direct to checkout
    },

    // Progress mapping
    progressMap: {
        1: 50, // BMI Calculator
        2: 100, // Your Weight Popup (final step)
    },

    // Step titles
    stepTitles: {
        1: "Height & Weight",
        2: "Your Weight",
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
                    action: "redirectToCheckout", // Redirect directly to checkout
                    primary: true,
                },
            ],
        },
    },
};
