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
        alternatives: [
          WLProducts.COMPOUNDED_TIRZEPATIDE,
          WLProducts.COMPOUNDED_SEMAGLUTIDE,
          WLProducts.OZEMPIC,
          WLProducts.WEGOVY,
          WLProducts.RYBELSUS,
        ],
      },
    },
    {
      conditions: {
        bmi: (bmi) => bmi >= 27,
      },
      outcome: {
        recommended: WLProducts.COMPOUNDED_TIRZEPATIDE,
        alternatives: [
          WLProducts.COMPOUNDED_SEMAGLUTIDE,
          WLProducts.OZEMPIC,
          WLProducts.MOUNJARO,
          WLProducts.WEGOVY,
          WLProducts.RYBELSUS,
        ],
      },
    },
    {
      conditions: {}, // Default case
      outcome: {
        recommended: WLProducts.COMPOUNDED_TIRZEPATIDE,
        alternatives: [
          WLProducts.COMPOUNDED_SEMAGLUTIDE,
          WLProducts.OZEMPIC,
          WLProducts.MOUNJARO,
          WLProducts.WEGOVY,
          WLProducts.RYBELSUS,
        ],
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
    // Step 2: Goal Weight
    2: {
      id: "goalWeight",
      type: "goalWeight",
      title: "",
      field: "goalWeight",
      required: true,
    },
    // Step 3: Before & After
    3: {
      id: "beforeAfter",
      type: "beforeAfter",
      title: "",
      required: false,
    },
    // Step 4: Pace Question
    4: {
      id: "paceQuestion",
      type: "paceQuestion",
      title: "",
      field: "pacePreference",
      required: true,
    },
    // Step 5: Pace Result (depends on selected Step 4 answer)
    5: {
      id: "paceResult",
      type: "paceResult",
      title: "",
      field: "pacePreference",
      required: false,
    },
    // Step 6: Sleep Hours
    6: {
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
    // Step 7: Before & After 2
    7: {
      id: "beforeAfter2",
      type: "beforeAfter2",
      title: "",
      required: false,
    },
    // Step 8: Willingness
    8: {
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
    // Step 9: Weight Changed
    9: {
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
    // Step 10: Before & After 3
    10: {
      id: "beforeAfter3",
      type: "beforeAfter3",
      title: "",
      required: false,
    },
    // Step 11: Medication Priority
    11: {
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
    // Step 12: State of Mind
    12: {
      id: "stateOfMind",
      type: "stateOfMindQuestion",
      title: "",
      field: "stateOfMind",
      required: true,
      options: [
        { id: "ready", label: "I'm Ready!" },
        { id: "hopeful", label: "I'm feeling hopeful" },
        { id: "cautious", label: "I'm cautious" },
      ],
    },
    // Step 13: Date of Birth (only shown if not authenticated)
    13: {
      id: "dateOfBirth",
      passIf: "authenticate",
      type: "glp2Dob",
      title: "What is your date of birth?",
      field: "dateOfBirth",
      required: true,
    },
    // Step 14: Personal Info - First Name, Last Name, State (only shown if not authenticated)
    14: {
      id: "personalInfo",
      passIf: "authenticate",
      type: "form",
      title: "Your medical checkup",
      privacyNote:
        "We respect your privacy. All of your information is securely stored on our HIPAA Compliant server.",
      fields: [
        {
          id: "firstName",
          label: "First Name",
          type: "text",
          placeholder: "Enter your first name",
          required: true,
        },
        {
          id: "lastName",
          label: "Last Name",
          type: "text",
          placeholder: "Enter your last name",
          required: true,
        },
        {
          id: "sex",
          label: "Gender",
          type: "select",
          required: true,
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
          ],
        },
        {
          id: "province",
          label: "What state will your medication be shipped to?",
          type: "select",
          required: true,
          options: [
            { value: "", label: "Select a state" },
            { value: "AZ", label: "Arizona" },
            { value: "CA", label: "California" },
            { value: "CO", label: "Colorado" },
            { value: "CT", label: "Connecticut" },
            { value: "DE", label: "Delaware" },
            { value: "FL", label: "Florida" },
            { value: "GA", label: "Georgia" },
            { value: "ID", label: "Idaho" },
            { value: "IL", label: "Illinois" },
            { value: "IN", label: "Indiana" },
            { value: "IA", label: "Iowa" },
            { value: "KY", label: "Kentucky" },
            { value: "LA", label: "Louisiana" },
            { value: "ME", label: "Maine" },
            { value: "MD", label: "Maryland" },
            { value: "MA", label: "Massachusetts" },
            { value: "MO", label: "Missouri" },
            { value: "MT", label: "Montana" },
            { value: "NE", label: "Nebraska" },
            { value: "NV", label: "Nevada" },
            { value: "NH", label: "New Hampshire" },
            { value: "NJ", label: "New Jersey" },
            { value: "NM", label: "New Mexico" },
            { value: "NY", label: "New York" },
            { value: "NC", label: "North Carolina" },
            { value: "ND", label: "North Dakota" },
            { value: "OH", label: "Ohio" },
            { value: "OK", label: "Oklahoma" },
            { value: "OR", label: "Oregon" },
            { value: "PA", label: "Pennsylvania" },
            { value: "RI", label: "Rhode Island" },
            { value: "SC", label: "South Carolina" },
            { value: "SD", label: "South Dakota" },
            { value: "TN", label: "Tennessee" },
            { value: "TX", label: "Texas" },
            { value: "UT", label: "Utah" },
            { value: "VT", label: "Vermont" },
            { value: "VA", label: "Virginia" },
            { value: "WA", label: "Washington" },
            { value: "WV", label: "West Virginia" },
            { value: "WI", label: "Wisconsin" },
            { value: "WY", label: "Wyoming" },
          ],
        },
      ],
      required: true,
    },
    // Step 15: Contact / Auth - Email, Phone, Password (only shown if not authenticated)
    15: {
      id: "contactAuth",
      passIf: "authenticate",
      type: "glp2ContactAuth",
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
    1: 2, // BMI Calculator -> Goal Weight
    2: 3, // Goal Weight -> Before/After
    3: 4, // Before/After -> Pace Question
    4: 5, // Pace Question -> Pace Result
    5: 6, // Pace Result -> Sleep Hours
    6: 7, // Sleep Hours -> Before/After2
    7: 8, // Before/After2 -> Willingness
    8: 9, // Willingness -> Weight Changed
    9: 10, // Weight Changed -> Before/After3
    10: 11, // Before/After3 -> Medication Priority
    11: 12, // Medication Priority -> State of Mind
    12: 13, // State of Mind -> DOB (or skip to 16 if authenticated)
    13: 14, // DOB -> Personal Info
    14: 15, // Personal Info -> Contact/Auth
    15: 16, // Contact/Auth -> Product Recommendations
    16: 17, // Product Recommendations -> Plan Selection (for compounded only; else checkout)
    17: 100, // Plan Selection -> Checkout
  },

  // Progress mapping
  progressMap: {
    1: 8, // BMI Calculator
    2: 16, // Goal Weight
    3: 24, // Before/After
    4: 32, // Pace Question
    5: 40, // Pace Result
    6: 48, // Sleep Hours
    7: 55, // Before/After2
    8: 62, // Willingness
    9: 69, // Weight Changed
    10: 75, // Before/After3
    11: 81, // Medication Priority
    12: 86, // State of Mind
    13: 90, // DOB
    14: 93, // Personal Info
    15: 96, // Contact/Auth
    16: 99, // Product Recommendations
    17: 100, // Plan Selection
  },

  // Step titles
  stepTitles: {
    1: "Height & Weight",
    2: "Goal Weight",
    3: "Before & After",
    4: "Weekly Pace",
    5: "Personalized Pace",
    6: "Sleep",
    7: "Before & After",
    8: "Willingness",
    9: "Weight Changed",
    10: "Before & After",
    11: "Priority",
    12: "State Of Mind",
    13: "Date of Birth",
    14: "Personal Info",
    15: "Contact & Account",
    16: "Product Recommendations",
    17: "Select Your Weight Loss Plan",
  },

  // WooCommerce variation IDs per plan, keyed by product ID
  // Variation ID IS sent as the product ID to WooCommerce (same pattern as ED flow)
  planVariationIds: {
    489523: {
      // Compounded Tirzepatide
      monthly: "489523",
      "3month": "490167",
      "6month": "490168",
      "12month": "490169",
    },
    489799: {
      // Compounded Semaglutide
      monthly: "489799",
      "3month": "490164",
      "6month": "490165",
      "12month": "490166",
    },
  },

  // Plan options keyed by product ID — each product has its own pricing
  planOptions: {
    // Compounded Tirzepatide (489523)
    489523: {
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
    // Compounded Semaglutide (489799)
    489799: {
      monthly: {
        id: "monthly",
        label: "Monthly Auto-Refill",
        subtitle: "Flexible. Pay as you go plan.",
        price: "$150",
        originalPrice: "$249",
        savings: "Save $99",
        subscriptionPeriod: "1_month",
        isDefault: true,
      },
      "3month": {
        id: "3month",
        badge: "STARTER BUNDLE",
        label: "3 Month Supply",
        price: "$199",
        originalPrice: "$249",
        savings: "Save $150",
        subscriptionPeriod: "3_month",
        type: "One-time purchase",
      },
      "6month": {
        id: "6month",
        badge: "MOST POPULAR",
        label: "6 Month Supply",
        price: "$175",
        originalPrice: "$249",
        savings: "Save $444",
        subscriptionPeriod: "6_month",
        type: "One-time purchase",
      },
      "12month": {
        id: "12month",
        badge: "BEST VALUE",
        label: "12 Month Supply",
        price: "$150",
        originalPrice: "$249",
        savings: "Save $1,188",
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
