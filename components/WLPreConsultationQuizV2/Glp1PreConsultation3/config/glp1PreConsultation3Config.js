import { WLProducts } from "../../data/PreConsultationProductsData";

// Simplified quiz configuration for BO
// Only includes: BMI Calculator, Potential Weight Loss, Your Weight, and Recommendations
export const glp1PreConsultation3Config = {
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
        // Step 3: Gender (full-bleed; sex collected here, not on personal-info form)
        3: {
            id: "sex",
            type: "glp1Gender",
            title: "",
            field: "sex",
            required: true,
        },
        // Step 4: Weight-gain-related effects (multi-select; copy depends on sex)
        4: {
            id: "weightGainEffects",
            type: "glp1WeightGainEffects",
            field: "weightGainEffects",
            required: true,
        },
        // Step 5: Female safety screening (skipped automatically for male)
        5: {
            id: "femalePregnancySafety",
            type: "glp1FemaleSafetyFirst",
            field: "femalePregnancySafety",
            required: true,
            skipIf: { sex: "male" },
        },
        // Step 6: Body composition priority (men: after effects; women: after safety “none”)
        6: {
            id: "bodyPriority",
            type: "glp1BodyPriority",
            title: "",
            field: "bodyPriority",
            required: true,
            options: [
                { id: "lose-weight", label: "Lose Weight", icon: "scale" },
                { id: "gain-muscle", label: "Gain Muscle", icon: "muscle" },
                {
                    id: "maintain-body",
                    label: "Maintain my current body",
                    icon: "ok",
                },
            ],
        },
        // Step 7: Metabolic science (GLP-1 outcomes)
        7: {
            id: "metabolicScience",
            type: "glp1MetabolicScience",
            title: "",
            required: false,
        },
        // Step 8: Before & After (testimonial) — before “How GLP-1 works”
        8: {
            id: "beforeAfter",
            type: "beforeAfter",
            title: "",
            required: false,
        },
        // Step 9: How GLP-1 works (wlps graphic + timeline copy)
        9: {
            id: "howGlp1Works",
            type: "glp1HowGlp1Works",
            title: "",
            required: false,
        },
        // Step 10: Primary reason for GLP-1 (first Details step)
        10: {
            id: "glp1PrimaryReason",
            type: "glp1PrimaryReason",
            title: "",
            field: "glp1PrimaryReason",
            required: true,
            options: [
                { id: "live-longer", label: "I want to live longer" },
                {
                    id: "feel-look-better",
                    label: "I want to feel and look better",
                },
                {
                    id: "reduce-health-issues",
                    label: "I want to reduce current health issues",
                },
                { id: "all-of-these", label: "All of these" },
            ],
        },
        // Step 11: Pace Question
        11: {
            id: "paceQuestion",
            type: "paceQuestion",
            title: "",
            field: "pacePreference",
            required: true,
        },
        // Step 12: Pace Result (depends on pace answer)
        12: {
            id: "paceResult",
            type: "paceResult",
            title: "",
            field: "pacePreference",
            required: false,
        },
        // Step 13: Overall sleep quality
        13: {
            id: "overallSleep",
            type: "sleepQuestion",
            title: "",
            field: "overallSleep",
            required: true,
            options: [
                { id: "pretty-good", label: "Pretty Good" },
                { id: "bit-restless", label: "A bit restless" },
                { id: "dont-sleep-well", label: "I don't sleep well" },
            ],
        },
        // Step 14: Sleep duration (hours per night)
        14: {
            id: "sleepHours",
            type: "sleepHoursQuestion",
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
        // Step 15: Before & After (opposite testimonial vs step 8)
        15: {
            id: "beforeAfterOpposite",
            type: "beforeAfter",
            invertGenderTestimonial: true,
            title: "",
            required: false,
        },
        // Step 16: GLP-1 safety — conditions that may prevent prescribing
        16: {
            id: "glp1MedicalContraindications",
            type: "glp1MedicalContraindications",
            title: "",
            field: "glp1MedicalContraindications",
            required: true,
            options: [
                { id: "none", label: "None of these" },
                { id: "end-stage-kidney", label: "End-stage kidney disease" },
                {
                    id: "end-stage-liver",
                    label: "End-stage liver disease (cirrhosis)",
                },
                { id: "anorexia-bulimia", label: "Anorexia/bulimia" },
                { id: "suicidal-thoughts", label: "Suicidal thoughts" },
                { id: "active-cancer", label: "Active cancer" },
                { id: "organ-transplants", label: "Organ transplants" },
                { id: "pancreatitis", label: "Pancreatitis" },
                { id: "type-1-diabetes", label: "Type 1 diabetes" },
                { id: "currently-on-insulin", label: "Currently on insulin" },
                {
                    id: "diabetic-retinopathy",
                    label: "Diabetic retinopathy",
                },
                { id: "thyroid-cyst", label: "Thyroid cyst" },
            ],
        },
        // Step 17: Additional health questions (GLP-1-related risks)
        17: {
            id: "glp1MoreHealthQuestions",
            type: "glp1MoreHealthQuestions",
            title: "",
            field: "glp1AdditionalHealthQuestions",
            required: true,
            options: [
                { id: "none", label: "None of these" },
                {
                    id: "medullary-thyroid-cancer-family",
                    label: "You or an immediate family member has a history of medullary thyroid cancer",
                },
                {
                    id: "diabetic-insulin-retinopathy",
                    label: "Diabetic on Insulin or have a history of diabetic retinopathy",
                },
                {
                    id: "men2-family",
                    label: "You or an immediate family member have a history of multiple endocrine neoplasia type 2",
                },
                { id: "kidney-conditions", label: "Kidney Conditions" },
                {
                    id: "kidney-specialist-12mo",
                    label: "Seen a kidney specialist in the past 12 months",
                },
                {
                    id: "solitary-kidney-transplant",
                    label: "History of solitary kidney, or kidney transplant",
                },
                {
                    id: "kidney-failure-history",
                    label: "History of kidney failure",
                },
                {
                    id: "gi-disorders-ibd",
                    label: "You have a history of GI disorders such as inflammatory bowel disease",
                },
            ],
        },
        // Step 18: Recent GLP-1 / weight-loss meds (past 4 weeks)
        18: {
            id: "glp1RecentGlp1WeightLoss",
            type: "glp1RecentGlp1WeightLoss",
            title: "",
            field: "glp1RecentGlp1WeightLoss",
            required: true,
            conditionalNavigation: {
                no: 20,
                "yes-glp1": 19,
                "yes-other-weight-med": 19,
            },
            options: [
                {
                    id: "yes-glp1",
                    label: "Yes, I've taken GLP-1 medication",
                },
                {
                    id: "yes-other-weight-med",
                    label: "Yes, I've taken a different medication for weight loss",
                },
                { id: "no", label: "No" },
            ],
        },
        // Step 19: Prior medication details (shown only if recent use = GLP-1 or other WL med)
        19: {
            id: "glp1PriorWeightLossMedicationDetails",
            type: "glp1PriorWeightLossMedicationDetails",
            title: "",
            required: true,
            skipIf: { glp1RecentGlp1WeightLoss: "no" },
        },
        // Step 20: Willingness
        20: {
            id: "willingness",
            type: "glp1WillingnessQuestion",
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
        // Step 21: Weight Changed
        21: {
            id: "weightChangedLastYear",
            type: "glp1WeightChangedQuestion",
            title: "",
            field: "weightChangedLastYear",
            required: true,
            options: [
                { id: "lost-significant", label: "Lost a significant amount" },
                { id: "lost-little", label: "Lost a little" },
                { id: "about-same", label: "About the same" },
                { id: "gained-little", label: "Gained a little" },
                {
                    id: "gained-significant",
                    label: "Gained a significant amount",
                },
            ],
        },
        // Step 22: Before & After 2 (same testimonial for all)
        22: {
            id: "beforeAfter2",
            type: "beforeAfter2",
            title: "",
            required: false,
        },
        // Step 23: Average blood pressure range
        23: {
            id: "glp1BloodPressureRange",
            type: "glp1BloodPressureQuestion",
            title: "",
            field: "glp1BloodPressureRange",
            required: true,
            imageSrc: "/glp-3-quiz/blood-pressure.jpg",
            question: "What is your average blood pressure range?",
            options: [
                { id: "normal", label: "<120/80 (Normal)" },
                { id: "elevated", label: "120-129/<80 (Elevated)" },
                {
                    id: "high-stage-1",
                    label: "130-139/80-89 (High Stage 1)",
                },
                { id: "high-stage-2", label: "≥140/90 (High Stage 2)" },
                { id: "not-sure", label: "I'm not sure" },
            ],
        },
        // Step 24: Resting heart rate
        24: {
            id: "glp1RestingHeartRate",
            type: "glp1HeartRateQuestion",
            title: "",
            field: "glp1RestingHeartRate",
            required: true,
            imageSrc: "/glp-3-quiz/heart-rate.jpg",
            imageAlt: "Person using a pulse oximeter on their finger",
            question: "How about your average resting heart rate?",
            options: [
                { id: "slow", label: "<60 beats per minute (Slow)" },
                {
                    id: "normal",
                    label: "60-100 beats per minute (Normal)",
                },
                {
                    id: "slightly-fast",
                    label: "101-110 beats per minute (Slightly Fast)",
                },
                { id: "fast", label: ">110 beats per minute (Fast)" },
                { id: "not-sure", label: "I'm not sure" },
            ],
        },
        // Step 25: Medication Priority
        25: {
            id: "medicationPriority",
            type: "medicationPriorityQuestion",
            title: "",
            field: "medicationPriority",
            required: true,
            options: [
                {
                    id: "affordability",
                    label: "Affordability",
                    subtitle: "Lowest price",
                    icon: "receipt",
                },
                {
                    id: "potency",
                    label: "Potency",
                    subtitle: "Stronger dose",
                    icon: "trend",
                },
            ],
            secondaryQuestion: {
                field: "glp1AdministrationPreference",
                prompt: "GLP-1 is available as an injection or drops under the tongue. Which sounds best?",
                options: [
                    {
                        id: "inject",
                        label: "I prefer to inject",
                        subtitle: "One injection per week",
                        icon: "syringe",
                    },
                    {
                        id: "drops",
                        label: "I prefer drops",
                        subtitle: "Oral GLP-1 meds",
                        icon: "dropper",
                    },
                ],
            },
        },
        // Step 26: Current medications (yes/no + details if yes)
        26: {
            id: "glp1CurrentMedications",
            type: "glp1CurrentMedicationsQuestion",
            title: "",
            field: "glp1CurrentlyTakesMedications",
            detailsField: "glp1CurrentMedicationsDetails",
            required: true,
            imageSrc: "/glp-3-quiz/medications.jpg",
            question: "Do you currently take any medications?",
            detailsLabel:
                "Please add some details about the current medicine you take.",
            options: [
                { id: "yes", label: "Yes" },
                { id: "no", label: "No" },
            ],
        },
        // Step 27: State of Mind
        27: {
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
        // Step 28: Additional info for medical team (yes/no + details if yes)
        28: {
            id: "glp1MedicalTeamAdditionalInfo",
            type: "glp1MedicalTeamAdditionalInfoQuestion",
            title: "",
            field: "glp1HasInfoForMedicalTeam",
            detailsField: "glp1MedicalTeamAdditionalInfoDetails",
            required: true,
            introLead: "MyRocky medical providers typically review every form",
            introHighlight: "within 6-24 hours.",
            question:
                "Do you have any further information which you would like our medical team to know?",
            detailsLabel:
                "Provide details here. Please do not include urgent or emergency medical information.",
            options: [
                { id: "yes", label: "Yes" },
                { id: "no", label: "No" },
            ],
        },
        // Step 29: Date of Birth (only shown if not authenticated)
        29: {
            id: "dateOfBirth",
            passIf: "authenticate",
            type: "glp2Dob",
            title: "What is your date of birth?",
            field: "dateOfBirth",
            required: true,
        },
        // Step 30: Personal Info - Medical review summary + name & state (only shown if not authenticated)
        30: {
            id: "personalInfo",
            passIf: "authenticate",
            type: "glp1MedicalReviewPersonal",
            title: "Your Medical Review",
            eligibilityLead: "Let's proceed to check your eligibility.",
            privacyNote:
                "Your information is never shared and is protected by HIPAA.",
            fields: [
                {
                    id: "firstName",
                    label: "First Name",
                    type: "text",
                    placeholder: "",
                    required: true,
                },
                {
                    id: "lastName",
                    label: "Last Name",
                    type: "text",
                    placeholder: "",
                    required: true,
                },
                {
                    id: "province",
                    label: "What state will your medication be shipped to?",
                    type: "select",
                    required: true,
                    options: [
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
        // Step 31: Contact / Auth - Email, Phone, Password (only shown if not authenticated)
        31: {
            id: "contactAuth",
            passIf: "authenticate",
            type: "glp2ContactAuth",
            required: true,
        },
        // Step 32: Product Recommendations
        32: {
            id: "productRecommendations",
            type: "recommendation",
            title: "Recommended for you",
            field: "selectedProduct",
            required: true,
        },
        // Step 33: Select Your Weight Loss Plan (Compounded products only)
        33: {
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
        2: 3, // Goal Weight -> Gender
        3: 4, // Gender -> Weight-gain effects
        4: 5, // Weight-gain effects -> Female safety (body priority if male skips 5)
        5: 6, // Female safety -> Body priority
        6: 7, // Body priority -> Metabolic science
        7: 8, // Metabolic science -> Before & After testimonial
        8: 9, // Before & After -> How GLP-1 works
        9: 10, // How GLP-1 works -> Primary reason (Details)
        10: 11, // Primary reason -> Pace Question
        11: 12, // Pace Question -> Pace Result
        12: 13, // Pace Result -> Sleep Hours
        13: 14, // Sleep quality -> Sleep hours
        14: 15, // Sleep hours -> Before & After (opposite testimonial)
        15: 16, // Before & After -> Medical conditions screening
        16: 17, // Medical conditions -> More health questions
        17: 18, // More health questions -> Recent GLP-1 / weight-loss meds
        18: 19, // Recent meds -> prior details (branch) or willingness (see conditionalNavigation)
        19: 20, // Prior medication details -> Willingness
        20: 21, // Willingness -> Weight Changed
        21: 22, // Weight Changed -> Before & After 2
        22: 23, // Before & After 2 -> Blood pressure
        23: 24, // Blood pressure -> Heart rate
        24: 25, // Heart rate -> Medication Priority
        25: 26, // Medication Priority -> Current medications
        26: 27, // Current medications -> State of Mind
        27: 28, // State of Mind -> Medical team additional info
        28: 29, // Medical team info -> DOB (or skip forward if authenticated)
        29: 30, // DOB -> Personal Info
        30: 31, // Personal Info -> Contact/Auth
        31: 32, // Contact/Auth -> Product Recommendations
        32: 33, // Product Recommendations -> Plan Selection (for compounded only; else checkout)
        33: 100, // Plan Selection -> Checkout
    },

    // Progress mapping
    progressMap: {
        1: 8, // BMI Calculator
        2: 14, // Goal Weight
        3: 20, // Gender
        4: 26, // Weight-gain effects
        5: 29, // Female safety
        6: 30, // Body priority
        7: 31, // Metabolic science
        8: 32, // Before & After testimonial
        9: 33, // How GLP-1 works
        10: 34, // Primary reason for GLP-1
        11: 36, // Pace Question
        12: 38, // Pace Result
        13: 44, // Sleep quality
        14: 50, // Sleep hours
        15: 53, // Before & After (opposite testimonial)
        16: 55, // Medical conditions screening
        17: 56, // More health questions
        18: 57, // Recent GLP-1 / weight-loss meds
        19: 58, // Prior medication details
        20: 59, // Willingness
        21: 62, // Weight Changed
        22: 68, // Before & After 2
        23: 71, // Blood pressure
        24: 72, // Heart rate
        25: 73, // Medication Priority
        26: 75, // Current medications
        27: 78, // State of Mind
        28: 80, // Medical team additional info
        29: 82, // DOB
        30: 86, // Personal Info
        31: 90, // Contact/Auth
        32: 94, // Product Recommendations
        33: 100, // Plan Selection
    },

    // High-level phases for UI stepper (each phase maps to many concrete steps)
    progressPhases: [
        {
            key: "start",
            label: "Start",
            steps: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        },
        {
            key: "details",
            label: "Details",
            steps: [
                10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
                26, 27, 28,
            ],
        },
        {
            key: "eligibility",
            label: "Eligibility",
            steps: [29, 30, 31, 32, 33],
        },
    ],

    // Step titles
    stepTitles: {
        1: "Height & Weight",
        2: "Goal Weight",
        3: "Gender",
        4: "How weight affects you",
        5: "Safety first",
        6: "Your priority",
        7: "Metabolic science",
        8: "Before & After",
        9: "How GLP-1 works",
        10: "Your motivation",
        11: "Weekly Pace",
        12: "Personalized Pace",
        13: "Sleep quality",
        14: "Sleep hours",
        15: "Before & After",
        16: "Health screening",
        17: "More health questions",
        18: "Recent GLP-1 use",
        19: "Prior medication",
        20: "Willingness",
        21: "Weight Changed",
        22: "Before & After",
        23: "Blood pressure",
        24: "Heart rate",
        25: "Priority",
        26: "Medications",
        27: "State Of Mind",
        28: "Medical team",
        29: "Date of Birth",
        30: "Your Medical Review",
        31: "Contact & Account",
        32: "Product Recommendations",
        33: "Select Your Weight Loss Plan",
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
            authenticatedNavigateTo: 32,
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
                    payload: 2, // Go to step 2 (then through steps 3-13, or skip to recommendations if authenticated)
                    primary: true,
                },
            ],
        },

        pregnancy: {
            isWL: true,
            asPage: true,
            popupLayout: "notQualifiedSerif",
            hideProgressBar: true,
            disqualificationEyebrow: "It Looks like you may not qualify...",
            disqualificationMain:
                "Based on your answers and your medical history, you're not a great candidate for telemedicine. The safest course of action would have you consider working with a local doctor or clinic as certain complications may need closer monitoring or response times than telemedicine may allow.",
            disqualificationFooterHtml: `If you believe you're an exception and would like to have someone from our medical staff review more details or provide additional advice regarding your specific circumstances, you can schedule a call here <a href="/contact-us" style="color:#A7885A;text-decoration:underline">Schedule a call with a Nurse</a>.`,
            buttons: [
                {
                    label: "Check Again",
                    action: "close",
                    primary: true,
                    variant: "sky",
                },
            ],
        },
    },
};
