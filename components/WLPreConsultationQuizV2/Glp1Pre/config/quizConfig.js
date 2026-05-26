import { WLProducts } from "../../data/PreConsultationProductsData";

// Simplified quiz configuration for BO
// Only includes: BMI Calculator, Potential Weight Loss, Your Weight, and Recommendations
export const quizConfig = {
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
      id: "Sex",
      type: "radio-text",
      title: "Are you male or female? *",
      field: "sex",
      required: true,
      options: [
        { id: "male", label: "Male" },
        { id: "female", label: "Female" },
      ],
      conditionalActions: {
      },
    },


    3: {
      id: "DOB",
      type:"DOBGLp1",
      title:"",
      field: "dateOfBirth",
      required: true,
    },
    4: {
      id: "healthQuestions1",
      type: "checkbox",
      title: "Do any of these apply to you? *",
      field: "healthQuestions1",
      required: true,
      exclusiveOptions: ["none-of-the-above"],
      selectionWarning: {
        message:
          "For your safety, this answer may disqualify you from a prescription",
        excludeOptionIds: ["none-of-the-above"],
      },
      options: [
        {
          id: "end-stage-kidney-disease",
          label: "End-stage kidney disease (on or about to be on dialysis)",
        },
        {
          id: "end-stage-liver-disease",
          label: "End-stage liver disease (cirrhosis)",
        },
        {
          id: "suicidal-thoughts-or-attempt",
          label:
            "Current suicidal thoughts and/or prior suicidal attempt",
        },
        {
          id: "active-or-recent-cancer",
          label:
            "Cancer (active diagnosis, active treatment, or in remission or cancer-free for less than 5 continuous years - does not apply to non-melanoma skin cancer that was considered cured via simple excision)",
        },
        {
          id: "severe-gastrointestinal-condition",
          label:
            "Severe gastrointestinal condition (gastroparesis, blockage, inflammatory bowel disease)",
        },
        {
          id: "substance-use-disorder",
          label:
            "Current diagnosis of or treatment for alcohol, opioid, or substance use disorder/dependence",
        },
        {
          id: "none-of-the-above",
          label: "None of the above",
        },
      ],
    },
    5: {
      id: "healthQuestions2",
      type: "checkbox",
      title: "Do any of these apply to you? *",
      field: "healthQuestions2",
      required: true,
      exclusiveOptions: ["none-of-the-above"],
      options: [
        { id: "gallbladder-disease", label: "Gallbladder disease" },
        {
          id: "hypertension-high-blood-pressure",
          label: "Hypertension (high blood pressure)",
        },
        { id: "seizures", label: "Seizures" },
        { id: "glaucoma", label: "Glaucoma" },
        { id: "sleep-apnea", label: "Sleep apnea" },
        {
          id: "type-2-diabetes-not-on-insulin",
          label: "Type 2 diabetes (not on insulin)",
        },
        {
          id: "type-2-diabetes-on-insulin",
          label: "Type 2 diabetes (on insulin)",
        },
        { id: "type-1-diabetes", label: "Type 1 diabetes" },
        {
          id: "diabetic-retinopathy-or-blindness",
          label:
            "Diabetic retinopathy (diabetic eye disease), damage to the optic nerve from trauma or reduced blood flow, or blindness",
        },
        {
          id: "warfarin-use",
          label:
            "Use of the blood thinner warfarin (Coumadin/Jantoven)",
        },
        {
          id: "pancreatitis-history-or-current",
          label: "History of or current pancreatitis",
        },
        {
          id: "thyroid-or-men2-history",
          label:
            "Personal or family history of thyroid cyst/nodule, thyroid cancer, medullary thyroid carcinoma, or multiple endocrine neoplasia syndrome type 2",
        },
        { id: "gout", label: "Gout" },
        {
          id: "high-cholesterol-or-triglycerides",
          label: "High cholesterol or triglycerides",
        },
        { id: "depression", label: "Depression" },
        { id: "head-injury", label: "Head injury" },
        {
          id: "brain-or-spinal-cord-tumor-infection",
          label: "Tumor/infection in brain/spinal cord",
        },
        { id: "low-sodium", label: "Low sodium" },
        {
          id: "liver-disease-including-fatty-liver",
          label: "Liver disease, including fatty liver",
        },
        { id: "kidney-disease", label: "Kidney disease" },
        {
          id: "elevated-resting-heart-rate",
          label: "Elevated resting heart rate (tachycardia)",
        },
        {
          id: "cad-or-recent-heart-attack-stroke",
          label:
            "Coronary artery disease or heart attack/stroke in last 2 years",
        },
        {
          id: "allergic-to-any-medication",
          label: "Allergic to any medication",
        },
        {
          id: "congestive-heart-failure",
          label: "Congestive heart failure",
        },
        {
          id: "qt-prolongation-or-arrhythmia",
          label: "QT prolongation or other heart rhythm disorder",
        },
        {
          id: "hospitalization-last-year",
          label: "Hospitalization within the last 1 year",
        },
        {
          id: "hiv",
          label: "Human immunodeficiency virus (HIV)",
        },
        { id: "acid-reflux", label: "Acid reflux" },
        {
          id: "asthma-reactive-airway-disease",
          label: "Asthma/reactive airway disease",
        },
        {
          id: "urinary-stress-incontinence",
          label: "Urinary stress incontinence",
        },
        {
          id: "pcos",
          label: "Polycystic ovarian syndrome (PCOS)",
        },
        {
          id: "low-testosterone",
          label: "Clinically proven low testosterone",
        },
        { id: "osteoarthritis", label: "Osteoarthritis" },
        { id: "constipation", label: "Constipation" },
        {
          id: "none-of-the-above",
          label: "None of the above",
        },
      ],
    },
    6: {
      id: "opiatesLast3Months",
      type: "radio-text",
      title:
        "Within the last 3 months, have you taken opiate pain medications and/or opiate-based street drugs? *",
      field: "opiatesLast3Months",
      textField: "opiatesLast3MonthsDetails",
      required: true,
      options: [
        {
          id: "yes",
          label: "Yes",
          showTextInput: true,
          textPlaceholder: "Please provide details",
        },
        { id: "no", label: "No" },
      ],
    },
    7: {
      id: "priorWeightLossSurgeries",
      type: "radio-text",
      title: "Have you had prior weight loss surgeries? *",
      field: "priorWeightLossSurgeries",
      textField: "priorWeightLossSurgeriesDetails",
      required: true,
      options: [
        {
          id: "yes",
          label: "Yes",
          showTextInput: true,
          textPlaceholder: "Please provide details",
        },
        { id: "no", label: "No" },
      ],
    },
    8: {
      id: "currentPrescriptionMedications",
      type: "radio-text",
      title: "Do you currently take any prescription medications? *",
      field: "currentPrescriptionMedications",
      textField: "currentPrescriptionMedicationsDetails",
      required: true,
      options: [
        {
          id: "yes",
          label: "Yes",
          showTextInput: true,
          textPlaceholder: "Please list your current prescription medications",
        },
        { id: "no", label: "No" },
      ],
    },
    9: {
      id: "bloodPressureRange",
      type: "radio-text",
      title: "What is your blood pressure range? *",
      field: "bloodPressureRange",
      required: true,
      options: [
        { id: "lt-120-80", label: "<120/80 (Normal)" },
        { id: "120-129-lt-80", label: "120 to 129/<80 (Elevated)" },
        { id: "130-139-80-89", label: "130 to 139/80-89 (High Stage 1)" },
        { id: "gte-140-90", label: ">=140/90 (High Stage 2)" },
      ],
    },
    10: {
      id: "restingHeartRate",
      type: "radio-text",
      title: "What is your average resting heart rate? *",
      field: "restingHeartRate",
      required: true,
      options: [
        { id: "lt-60", label: "<60 beats per minute (Slow)" },
        { id: "60-100", label: "60 to 100 beats per minute (Normal)" },
        {
          id: "101-110",
          label: "101 to 110 beats per minute (Slightly Fast)",
        },
        { id: "gt-110", label: ">110 beats per minute (Fast)" },
      ],
    },

     11:{
      id: "beforeAfter",
      type: "beforeAfter",
      title: "",
      required: false,
    },

    12: {
      id: "paceQuestion",
      type: "paceQuestion",
      title: "",
      field: "pacePreference",
      required: true,
    },

     13: {
      id: "paceResult",
      type: "paceResult",
      title: "",
      field: "pacePreference",
      required: false,
    },

    14: {
      id: "takenMedications",
      type: "radio-text",
      title: "Have you taken medication for weight loss within the past 4 weeks? *",
      field: "takenMedications",
      textField: "takenMedicationsDetails",
      required: true,
      conditionalNavigation: {
          yes_taken: 15,
          yes_different: 17,
          no: 18,
      },
      options: [
         { id: "yes_taken", label: "Yes, I've taken GLP-1 medication", },
         { id: "yes_different", label: "Yes, I've taken a different medication for weight loss" },
         { id: "no", label: "No" },
      ],
    },
    15: {
      id: "title",
      type: "title",
      title: "Great! You have experience with GLP-1.",
      styleClasses :"text-[#AE7E56] subheaders-font md:text-[48px] text-[28px] leading-[115%] mb-10",
    },
    16: {
      id: "glp1TakenMedications",
      type: "form",
      title: "Have you taken medication for weight loss within the past 4 weeks? *",
      required: true,
      fields:[
        {
          id: "listNames",
          label: "Please list the name, dose, and frequency of your GLP-1 medication. *",
          type: "textarea",
          required: true,
        },
         {
          id: "lastDose",
          label: "When was your last dose of medication? *",
          type: "radio",
          required: true,
          options: [
            { id: "0_5", value: "0_5", label: "0-5 days" },
            { id: "6_10", value: "6_10", label: "6-10 days" },
            { id: "11_14", value: "11_14", label: "11-14 days" },
            { id: "15_28", value: "15_28", label: "More than 2 weeks ago but within the last 4 weeks" },
            { id: "more_than_28", value: "more_than_28", label: "More than 4 weeks ago" },
          ],
        },

        {
          id: "startingWeight",
          label: "What was your starting weight in pounds? *",
          type: "text",
          required: true,
        },
        {
          id:"uploadedMedicationPhoto",
          label:"Please take or upload a photo of your GLP-1 medication",
          description:"If you are requesting a prescription for your current or higher dose, this is important. If you don't have a photo available, you can skip this.",
          type:"file",
          required:false,
        },
        {
          id:"medicationEffectiveness",
          label:"Do you agree to only obtain weight loss medication through this program moving forward? *",
          type:"radio",
          required:true,
          options:[
            { id: "yes", value:"yes", label: "Yes" },
            { id: "no", value:"no", label: "No" },
          ],
        }
      ],
      
    },


    17: {
      id: "glp1TakenMedications",
      type: "form",
      title: "Have you taken medication for weight loss within the past 4 weeks? *",
      required: true,
      fields:[
        {
          id: "listNames",
          label: "Please list the name, dose, and frequency of your GLP-1 medication. *",
          type: "textarea",
          required: true,
        },
      

        {
          id: "startingWeight",
          label: "What was your starting weight in pounds? *",
          type: "text",
          required: true,
        },
       
        {
          id:"medicationEffectiveness",
          label:"Do you agree to only obtain weight loss medication through this program moving forward? *",
          type:"radio",
          required:true,
          options:[
            { id: "yes", value:"yes", label: "Yes" },
            { id: "no", value:"no", label: "No" },
          ],
        }
      ],
      
    },

    18: {
      id:"tried",
      type:"radio-text",
      textField:"",
      title:"Have you ever tried to lose weight in a weight management program (Jenny Craig, Weight Watchers, etc)? *",
      field:"tried",
      required:true,
      options:[
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" },
      ],
    },


    19: {
      id: "title",
      type: "title",
      title: "MyRocky medical providers review every form within 24 hours",
      styleClasses :"text-[#AE7E56] subheaders-font md:text-[32px] text-[28px] leading-[115%] mb-10",
    },

    20: {
      id:"tried",
      type:"radio-text",
      textField:"",
      title:"Do you have any further information which you would like our medical team to know? *",
      field:"tried",
      required:true,
      options:[
        { id: "yes", label: "Yes" },
        { id: "no", label: "No" },
      ],
    },


    21: {
      id: "title",
      type: "title",
      title: "Your needs are <span class='text-[#AE7E56]'>unique</span>, and your medicine should be, too!",
      styleClasses :"text-[#000000] opacity-[85%] subheaders-font mb-4 md:text-[32px] text-[28px] leading-[115%]",
      description: "Your GLP-1 medication is personalized to your specific needs",
      descriptionStyleClasses: "text-[#000000] opacity-[85%] text-[16px] leading-[140%] font-[400] mb-10 text-center",
    },

    22: {
      id: "personalizedRecommendation",
      title: "Please select the following options that you are interested in *",
      type: "checkbox",
      options: [
        {
          id: "maintain-muscle-mass",
          value: "maintain-muscle-mass",  
          label: "Maintaining muscle mass as I lose weight",
        },
        {
          id: "prefer-not-to-inject",
          value: "prefer-not-to-inject",
          label: "Would prefer not to inject",
        },
        {
          id: "manage-side-effects",
          value: "manage-side-effects",
          label: "Managing potential side effects such as nausea/vomiting",
        },
        {
          id: "aging-longevity-support",
          value: "aging-longevity-support",
          label:
            "Assist with aging and longevity (cellular/DNA damage, immune system dysfunction, etc)",
        },
        {
          id: "improve-cognitive-function",
          value: "improve-cognitive-function",
          label: "Improving cognitive function and mental clarity",
        },
        {
          id: "improve-energy-levels",
          value: "improve-energy-levels",
          label: "Improving energy levels",
        },
        {
          id: "regulate-menses-hormonal-status",
          value: "regulate-menses-hormonal-status",
          label: "Regulating menses and hormonal status",
        },
        {
          id: "improve-sleep-quality",
          value: "improve-sleep-quality",
          label: "Improving sleep quality",
        },
        {
          id: "not-sure-discuss-with-clinician",
          value: "not-sure-discuss-with-clinician",
          label:
            "I\u2019m not sure - I\u2019d like to discuss formulation options with a clinician via a live virtual consult",
        },
      ],
    },

    23: {
      id: "infoConsent",
      type: "data",
      required: false,
    },

    24: {
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



    25: {
      id: "contactIntro",
      type: "contactIntro",
      required: false,
    },

    26: {
      id: "contactAuth",
      passIf: "authenticate",
      type: "glp1ContactAuth",
      required: true,
    },

    // Step 27: Product Recommendations
    27: {
      id: "productRecommendations",
      type: "recommendation",
      title: "Recommended for you",
      field: "selectedProduct",
      required: true,
    },

    // Step 28: Select Your Weight Loss Plan
    28: {
      id: "selectWeightLossPlan",
      type: "planSelection",
      title: "Select Your Weight Loss Plan",
      field: "selectedPlan",
      required: true,
    },

  },

  // Page-based navigation structure.
  // A single page can contain one or more question steps.
  pages: {
    1: { stepIds: [1, 2, 3, 4, 5, 6, 7,8, 9, 10] },
    2: { stepIds: [11] },
    3: { stepIds: [12] },
    4: { stepIds: [13] },
    5: { stepIds: [14]},
    6: { stepIds: [15, 16] },
    7: { stepIds: [17] },
    8: {  stepIds: [18] },
    9: { stepIds: [19, 20] },
    10: { stepIds: [21, 22] },
    11: {stepIds: [23, 24] },
    12: {stepIds: [25, 26] },
    13: {stepIds: [27] },
    14: {stepIds: [28] },
  },

  // Navigation configuration (page → next page)
  navigation: {
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 7,
    7: 8,
    8: 9,
    9: 10,
    10: 11,
    11: 12,
    12: 13,
    13: 14,
    14: null, // End of quiz (checkout)
  },

  // Progress mapping (page → progress %)
  progressMap: {
    1: 0,
    2: 10,
    3: 20,
    4: 30,
    5: 40,
    6: 50,
    7: 60,
    8: 70,
    9: 80,
    10: 90,
    11: 95,
    12: 98,
    13: 99,
    14: 100,
  },

  // Step titles
  stepTitles: {
    1: "Height & Weight",
    2: "Sex",
    3: "Date of Birth",
    4: "Health Questions 1",
    5: "Health Questions 2",
    6: "Opiate Use",
    7: "Prior Weight Loss Surgeries",
    8: "Prescription Medications",
    9: "Blood Pressure",
    10: "Resting Heart Rate",
    11: "Priority",
    12: "State Of Mind",
    13: "Date of Birth",
    14: "Personal Info",
    15: "Contact & Account",
    16: "Product Recommendations",
    17: "Select Your Weight Loss Plan",
    18: "Contact Introduction",
    19: "Contact Authentication",
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
    489798: {
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
    // Compounded Semaglutide (489798)
    489798: {
      monthly: {
        id: "monthly",
        label: "Monthly Auto-Refill",
        subtitle: "Flexible. Pay as you go plan.",
        price: "$150",
        recurringNote: "$249/month after first month",
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
