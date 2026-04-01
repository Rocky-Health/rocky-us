import { WLProducts } from "../../data/PreConsultationProductsData";

// Simplified quiz configuration for BO
// Only includes: BMI Calculator, Potential Weight Loss, Your Weight, and Recommendations
export const glp2PreConsultationConfig = {
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
            title: "",
            field: "currentWeight",
            required: true,
        },
        // Step 2: Before & After
        2: {
            id: "beforeAfter",
            type: "beforeAfter",
            title: "",
            required: false,
        },
        // Step 3: Pace Question
        3: {
            id: "paceQuestion",
            type: "paceQuestion",
            title: "",
            field: "pacePreference",
            required: true,
        },
        // Step 4: Pace Result (depends on selected Step 3 answer)
        4: {
            id: "paceResult",
            type: "paceResult",
            title: "",
            field: "pacePreference",
            required: false,
        },
        // Step 5: Sleep Hours
        5: {
            id: "sleepHours",
            type: "sleepQuestion",
            title: "",
            field: "sleepHours",
            required: true,
            options: [
                { id: "less-than-5", label: "Less than 5 hours" },
                { id: "6-7", label: "6-7 hours" },
                { id: "8-9", label: "8-9 hours" },
                { id: "more-than-9", label: "More than 9 hours" },
            ],
        },
        // Step 6: Before & After 2
        6: {
            id: "beforeAfter2",
            type: "beforeAfter2",
            title: "",
            required: false,
        },
        // Step 7: Willingness
        7: {
            id: "willingness",
            type: "willingnessQuestion",
            title: "",
            field: "willingness",
            required: true,
            options: [
                {
                    id: "reduce-caloric-intake",
                    label: "Reduce your caloric intake alongside medication",
                },
                {
                    id: "increase-physical-activity",
                    label: "Increase your physical activity alongside medication",
                },
                { id: "none", label: "None of the above" },
            ],
        },
        // Step 8: Weight Changed
        8: {
            id: "weightChangedLastYear",
            type: "weightChangedQuestion",
            title: "",
            field: "weightChangedLastYear",
            required: true,
            options: [
                { id: "lost-significant", label: "Lost a significant amount" },
                { id: "lost-little", label: "Lost a little" },
                { id: "about-same", label: "About the same" },
                { id: "gained-little", label: "Gained a little" },
                { id: "gained-significant", label: "Gained a significant amount" },
            ],
        },
        // Step 9: Before & After 3
        9: {
            id: "beforeAfter3",
            type: "beforeAfter3",
            title: "",
            required: false,
        },
        // Step 10: Medication Priority
        10: {
            id: "medicationPriority",
            type: "medicationPriorityQuestion",
            title: "",
            field: "medicationPriority",
            required: true,
            options: [
                { id: "affordability", label: "Affordability" },
                { id: "potency", label: "Potency" },
            ],
        },
        // Step 11: State of Mind
        11: {
            id: "stateOfMind",
            type: "stateOfMindQuestion",
            title: "",
            field: "stateOfMind",
            required: true,
            showPopupAfterStep: "Step11EmailPopUp",
            options: [
                { id: "ready", label: "I'm Ready!" },
                { id: "hopeful", label: "I'm feeling hopeful" },
                { id: "cautious", label: "I'm cautious" },
            ],
        },
        // Step 12: Province (only shown if not authenticated)
        12: {
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
        // Step 13: Basic Info (only shown if not authenticated)
        13: {
            id: "basicInfo",
            passIf: "authenticate",
            type: "form",
            title: "Let’s start with the basics",
            field: "sex",
            conditionalNavigation: {
                Male: 14,
                Female: 14,
            },
            fields: [
                {
                    id: "sex",
                    label: "Sex assigned at birth",
                    type: "radio",
                    options: [
                        { value: "Male", label: "Male" },
                        { value: "Female", label: "Female" },
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
        // Step 14: First Information (only shown if not authenticated)
        14: {
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
        // Step 15: Contact Info (only shown if not authenticated) - This triggers registration
        15: {
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
        // Step 16: Product Recommendations
        16: {
            id: "productRecommendations",
            type: "recommendation",
            title: "Recommended for you",
            field: "selectedProduct",
            required: true,
        },
        // Step 17: Select Your Weight Loss Plan (Compounded products only)
        17: {
            id: "selectWeightLossPlan",
            type: "planSelection",
            title: "Select Your Weight Loss Plan",
            field: "selectedPlan",
            required: true,
        },
    },

    // Navigation configuration
    navigation: {
        1: 2, // BMI Calculator -> Before/After
        2: 3, // Before/After -> Pace Question
        3: 4, // Pace Question -> Pace Result
        4: 5, // Pace Result -> Sleep Hours
        5: 6, // Sleep Hours -> Before/After2
        6: 7, // Before/After2 -> Willingness
        7: 8, // Willingness -> Weight Changed
        8: 9, // Weight Changed -> Before/After3
        9: 10, // Before/After3 -> Medication Priority
        10: 11, // Medication Priority -> State of Mind
        11: 12, // State of Mind -> Province (or skip to 16 if authenticated)
        12: 13, // Province -> Basic Info
        13: 14, // Basic Info -> First Information
        14: 15, // First Information -> Contact Info
        15: 16, // Contact Info -> Product Recommendations
        16: 17, // Product Recommendations -> Plan Selection (for compounded only; else checkout)
        17: 100, // Plan Selection -> Checkout
    },

    // Progress mapping
    progressMap: {
        1: 10, // BMI Calculator
        2: 20, // Before/After
        3: 30, // Pace Question
        4: 40, // Pace Result
        5: 50, // Sleep Hours
        6: 58, // Before/After2
        7: 66, // Willingness
        8: 73, // Weight Changed
        9: 79, // Before/After3
        10: 84, // Medication Priority
        11: 88, // State of Mind
        12: 91, // Province
        13: 94, // Basic Info
        14: 96, // First Information
        15: 98, // Contact Info
        16: 99, // Product Recommendations
        17: 100, // Plan Selection
    },

    // Step titles
    stepTitles: {
        1: "Height & Weight",
        2: "Before & After",
        3: "Weekly Pace",
        4: "Personalized Pace",
        5: "Sleep",
        6: "Before & After",
        7: "Willingness",
        8: "Weight Changed",
        9: "Before & After",
        10: "Priority",
        11: "State Of Mind",
        12: "State Selection",
        13: "Your Basic Info",
        14: "Your Details",
        15: "Contact Information",
        16: "Product Recommendations",
        17: "Select Your Weight Loss Plan",
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
                price: "$359",
                originalPrice: "$389",
                savings: "Save $30",
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
                price: "$249",
                originalPrice: "$279",
                savings: "Save $30",
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
        // Step 11 sign-in gate: existing users -> recommendation; new users -> registration chain
        Step11EmailPopUp: {
            isWL: true,
            component: "WeightLossResultPasswordPopup",
            nextAction: "continue",
            nextPayload: null,
            passwordPopupMode: "stepElevenSignInGate",
            authenticatedNavigateTo: 16,
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
                    payload: 2, // Go to step 2 (then through steps 3-11, or skip to 16 if authenticated)
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
