import { WLProducts } from "../../data/PreConsultationProductsData";

// Simplified quiz configuration for BO
// Only includes: BMI Calculator, Potential Weight Loss, Your Weight, and Recommendations
export const boSimplifiedConfig = {
    recommendationRules: [
        // Weight loss recommendation logic (same as standard WL)
        {
            conditions: {
                bmi: (bmi) => bmi <= 20,
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
        // Step 2: RockyLongTerm Popup (shown after potential weight loss calculation)
        2: {
            id: "RockyLongTerm",
            type: "popup",
            // This will be handled by popup system
        },
        // Step 3: Province (only shown if not authenticated)
        3: {
            id: "province",
            passIf: "authenticate",
            type: "select",
            title: "First, let's make sure we have licensed providers in your area.",
            subtitle:
                "Weight loss medications are prescribed online and delivered to your door.",
            field: "province",
            required: true,
            label: "State",
            privacyNote:
                "We respect your privacy. All of your information is securely stored on our HIPAA Compliant server.",
            options: [
                { id: "", label: "Select a state" },
                { id: "AZ", label: "Arizona" },
                { id: "CA", label: "California" },
                { id: "CO", label: "Colorado" },
                { id: "CT", label: "Connecticut" },
                { id: "DE", label: "Delaware" },
                { id: "FL", label: "Florida" },
                { id: "GA", label: "Georgia" },
                { id: "ID", label: "Idaho" },
                { id: "IL", label: "Illinois" },
                { id: "IN", label: "Indiana" },
                { id: "IA", label: "Iowa" },
                { id: "KY", label: "Kentucky" },
                { id: "LA", label: "Louisiana" },
                { id: "ME", label: "Maine" },
                { id: "MD", label: "Maryland" },
                { id: "MA", label: "Massachusetts" },
                { id: "MO", label: "Missouri" },
                { id: "MT", label: "Montana" },
                { id: "NE", label: "Nebraska" },
                { id: "NV", label: "Nevada" },
                { id: "NH", label: "New Hampshire" },
                { id: "NJ", label: "New Jersey" },
                { id: "NM", label: "New Mexico" },
                { id: "NY", label: "New York" },
                { id: "NC", label: "North Carolina" },
                { id: "ND", label: "North Dakota" },
                { id: "OH", label: "Ohio" },
                { id: "OK", label: "Oklahoma" },
                { id: "OR", label: "Oregon" },
                { id: "PA", label: "Pennsylvania" },
                { id: "RI", label: "Rhode Island" },
                { id: "SC", label: "South Carolina" },
                { id: "SD", label: "South Dakota" },
                { id: "TN", label: "Tennessee" },
                { id: "TX", label: "Texas" },
                { id: "UT", label: "Utah" },
                { id: "VT", label: "Vermont" },
                { id: "VA", label: "Virginia" },
                { id: "WA", label: "Washington" },
                { id: "WV", label: "West Virginia" },
                { id: "WI", label: "Wisconsin" },
                { id: "WY", label: "Wyoming" },
            ],
        },
        // Step 4: Basic Info (only shown if not authenticated)
        4: {
            id: "basicInfo",
            passIf: "authenticate",
            type: "form",
            title: "Let’s start with the basics",
            field: "sex",
            conditionalNavigation: {
                male: 5,
                female: 5,
            },
            fields: [
                {
                    id: "sex",
                    label: "Sex assigned at birth",
                    type: "radio",
                    options: [
                        { value: "male", label: "Male" },
                        { value: "female", label: "Female" },
                    ],
                },
                {
                    id: "dateOfBirth",
                    label: "Birth Date",
                    type: "date",
                    placeholder: "mm/dd/yyyy",
                },
                {
                    id: "zip_code",
                    label: "Zip Code",
                    type: "text",
                    placeholder: "90210",
                },
            ],
            privacyNote:
                "We respect your privacy. All of your information is securely stored on our HIPAA Compliant server.",
            required: true,
        },
        // Step 5: First Information (only shown if not authenticated)
        5: {
            id: "firstInformation",
            passIf: "authenticate",
            type: "form",
            titleCenter: true,
            title: `<p style="color:#A0693B; text-align:center; line-height: 140%;font-size:16px">We're almost done!</p><p class="text-center text-[26px] headers-font mb-[24px]">Let us know your details</p>`,
            privacyNote:
                "We respect your privacy. All of your information is securely stored on our HIPAA Compliant server.",
            fields: [
                {
                    id: "firstName",
                    label: "Name",
                    type: "text",
                    placeholder: "Enter Your Name",
                },
                {
                    id: "lastName",
                    label: "Last Name",
                    type: "text",
                    placeholder: "Your Last Name",
                },
            ],
            required: true,
        },
        // Step 6: Contact Info (only shown if not authenticated) - This triggers registration
        6: {
            id: "contactInfo",
            passIf: "authenticate",
            type: "form",
            titleCenter: true,
            title: `<p style="color:#A0693B; text-align:center; line-height: 140%;font-size:16px">Finally,</p><p class="text-center text-[26px] headers-font mb-[24px]">How can we reach you, if needed?</p>`,
            privacyNote:
                "We respect your privacy. All of your information is securely stored on our HIPAA Compliant server.",
            fields: [
                {
                    id: "phone",
                    label: "Phone Number",
                    type: "tel",
                    placeholder: "Your Phone Number",
                },
            ],
            required: true,
        },
        // Step 7: Product Recommendations
        7: {
            id: "productRecommendations",
            type: "recommendation",
            title: "Recommended for you",
            field: "selectedProduct",
            required: true,
        },
        // Step 8: Select Your Weight Loss Plan (Compounded products only)
        8: {
            id: "selectWeightLossPlan",
            type: "planSelection",
            title: "Select Your Weight Loss Plan",
            field: "selectedPlan",
            required: true,
        },
    },

    // Navigation configuration
    navigation: {
        1: 2, // BMI Calculator -> RockyLongTerm Popup
        2: 3, // RockyLongTerm Popup -> Province (or skip to 7 if authenticated)
        3: 4, // Province -> Basic Info
        4: 5, // Basic Info -> First Information
        5: 6, // First Information -> Contact Info
        6: 7, // Contact Info -> Product Recommendations
        7: 8, // Product Recommendations -> Plan Selection (for compounded only; else checkout)
        8: 100, // Plan Selection -> Checkout
    },

    // Progress mapping
    progressMap: {
        1: 14, // BMI Calculator
        2: 28, // RockyLongTerm Popup
        3: 42, // Province
        4: 56, // Basic Info
        5: 70, // First Information
        6: 85, // Contact Info
        7: 92, // Product Recommendations
        8: 100, // Plan Selection
    },

    // Step titles
    stepTitles: {
        1: "Height & Weight",
        2: "MyRocky Long-Term",
        3: "State Selection",
        4: "Your Basic Info",
        5: "Your Details",
        6: "Contact Information",
        7: "Product Recommendations",
        8: "Select Your Weight Loss Plan",
    },

    // WooCommerce variation IDs per plan, keyed by product ID
    // Variation ID IS sent as the product ID to WooCommerce (same pattern as ED flow)
    planVariationIds: {
        "489523": { // Compounded Tirzepatide
            monthly:   "489523",
            "3month":  "490167",
            "6month":  "490168",
            "12month": "490169",
        },
        "489798": { // Compounded Semaglutide
            monthly:   "489798",
            "3month":  "490164",
            "6month":  "490165",
            "12month": "490166",
        },
    },

    // Plan options keyed by product ID — each product has its own pricing
    planOptions: {
        // Compounded Tirzepatide (489523)
        "489523": {
            monthly: {
                id: "monthly",
                label: "Monthly Auto-Refill",
                subtitle: "Flexible. Pay as you go plan.",
                price: "$260",
                originalPrice: "$389",
                savings: "Save $129",
                subscriptionPeriod: "1_month",
                isDefault: true,
            },
            "3month": {
                id: "3month",
                badge: "STARTER BUNDLE",
                label: "3 Month Supply",
                price: "$299",
                originalPrice: "$389",
                savings: "Save $270",
                subscriptionPeriod: "3_month",
                type: "One-time purchase",
            },
            "6month": {
                id: "6month",
                badge: "MOST POPULAR",
                label: "6 Month Supply",
                price: "$275",
                originalPrice: "$389",
                savings: "Save $684",
                subscriptionPeriod: "6_month",
                type: "One-time purchase",
            },
            "12month": {
                id: "12month",
                badge: "BEST VALUE",
                label: "12 Month Supply",
                price: "$240",
                originalPrice: "$389",
                savings: "Save $1,788",
                subscriptionPeriod: "12_month",
                type: "One-time purchase",
            },
        },
        // Compounded Semaglutide (489798)
        "489798": {
            monthly: {
                id: "monthly",
                label: "Monthly Auto-Refill",
                subtitle: "Flexible. Pay as you go plan.",
                price: "$150",
                originalPrice: "$279",
                savings: "Save $129",
                subscriptionPeriod: "1_month",
                isDefault: true,
            },
            "3month": {
                id: "3month",
                badge: "STARTER BUNDLE",
                label: "3 Month Supply",
                price: "$199",
                originalPrice: "$279",
                savings: "Save $240",
                subscriptionPeriod: "3_month",
                type: "One-time purchase",
            },
            "6month": {
                id: "6month",
                badge: "MOST POPULAR",
                label: "6 Month Supply",
                price: "$175",
                originalPrice: "$279",
                savings: "Save $624",
                subscriptionPeriod: "6_month",
                type: "One-time purchase",
            },
            "12month": {
                id: "12month",
                badge: "BEST VALUE",
                label: "12 Month Supply",
                price: "$150",
                originalPrice: "$279",
                savings: "Save $1,548",
                subscriptionPeriod: "12_month",
                type: "One-time purchase",
            },
        },
    },
    planInclusions: [
        "New Rx shipped every 30 days",
        "Unlimited provider support",
        "Regular check-ins",
        "Nutrition & lifestyle support",
    ],

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
            nextPopup: "EmailPopUp", // Show EmailPopUp after counter (which checks authentication)
            buttons: [
                {
                    label: "Continue",
                    action: "openPopup",
                    popupName: "EmailPopUp",
                    primary: false,
                    disabled: true,
                },
            ],
        },

        // Email Popup - Shows authentication form if not logged in, or auto-skips if logged in
        EmailPopUp: {
            isWL: true,
            component: "WeightLossResultPasswordPopup",
            image: "/wl-pre-consultation/lose-20-mob.png",
            imageStyle: "w-[335px] h-[523px] rounded-[32px] mb-12",
            imageTop: false,
            buttons: [
                {
                    label: "Continue",
                    action: "openPopup",
                    popupName: "YourWeightPopup",
                    primary: true,
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
            title: "MyRocky creates long-term weight loss",
            messageStyle:
                "text-[14px] md:text-[16px] leading-[140%] mb-[24px] text-center",
            message:
                "MyRocky members lose 2-5x more weight than similar programs. Our approach goes beyond just medication — we help you build lasting habits for a healthier life.",
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
                    payload: 3, // Go to step 3 (will skip to 7 if authenticated)
                    primary: true,
                },
            ],
        },

        pregnancy: {
            isWL: true,
            asPage: false,
            headerStyle:
                "headers-font text-[26px] md:text-[32px] leading-[120%] mb-[16px] text-center",
            title: "Sorry, you are not eligible for our weight loss program",
            messageStyle:
                "text-[14px] md:text-[16px] leading-[140%] mb-[24px] rounded-lg p-[16px]",
            message: `<center>Based on your answers, GLP-1 therapy through our online program would not be a good fit. Your health is very important to us, and some conditions/medications require more personalized, in-person support to ensure the best and safest care. We recommend you visit your usual doctor.</center>`,
            image: "/wl-pre-consultation/pregnancy-warning.png",
            imageStyle: "w-[358px] h-[324px] mb-4",
            buttons: [
                {
                    label: "Close",
                    action: "close",
                    primary: true,
                },
            ],
        },
    },
};
