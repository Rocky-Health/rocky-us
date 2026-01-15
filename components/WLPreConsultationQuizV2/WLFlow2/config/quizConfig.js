import { WLProducts } from "../../data/PreConsultationProductsData";
//  Quiz Configuration - Data-driven approach
export const quizConfig = {
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
    1: {
      id: "accomplishment",
      type: "checkbox",
      title: "What do you want to accomplish with Rocky?",
      QSpanHeader: "I want to ...",
      subtitle: "I want to ...",
      field: "accomplishment",
      required: true,
      options: [
        { id: "lose-weight", label: "Lose weight" },
        {
          id: "improve-general-health",
          label: "Improve my general physical health",
        },
        {
          id: "improve-other-condition",
          label: "Improve another health condition",
        },
        {
          id: "increase-confidence",
          label: "Increase confidence about my appearance",
        },
        {
          id: "increase-energy",
          label: "Increase energy for activities I enjoy",
        },
        { id: "other-goal", label: "I have another goal not listed above" },
      ],
    },
    2: {
      id: "currentWeight",
      type: "BMICalculator",
      title: "What is your height and weight?",
      subtitle:
        "<span style='color:#B4845A; font-size:16px'>This helps calculate your BMI (Body Mass Index), a general screening tool for body composition.</span>",
      field: "currentWeight",
      required: true,
      showPopupAfterStep: "potentialWeightLoss",
    },
    3: {
      id: "basicInfo",
      passIf: "authenticate",
      type: "form",
      title: "We'll start with the basics",
      field: "sex",
      conditionalNavigation: {
        Male: 5,
        Female: 4,
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


    4: {
      id: "pregnantOrbreastfeeding",
      type: "radio",
      title: "Do any of these apply to you?",
      field: "pregnantOrbreastfeeding",
      required: true,
      options: [
        { id: "pregnant", label: "I am pregnant" },
        { id: "breastfeeding", label: "I am currently breastfeeding" },
        { id: "none", label: "None of the above" },
      ],
      conditionalActions: {
        pregnant: { action: "showPopup", popupType: "pregnancy" },
        breastfeeding: { action: "showPopup", popupType: "pregnancy" },
      },
    },
    5: {
      id: "weightImpactStatements",
      type: "checkbox",
      title: "Because of my weight..",
      subtitle:
        "<span class='text-[16px]'>Select all the statements that apply to you.</span>",
      field: "weightImpactStatements",
      required: true,
      options: [
        { id: "not-myself", label: "I don’t feel like myself" },
        { id: "lack-confidence", label: "I lack confidence in my appearance" },
        {
          id: "not-physical-activities",
          label: "I’m not able to do physical activities I enjoy",
        },
        {
          id: "not-complete-daily-activities",
          label:
            "I’m not able to complete my daily activities I need accomplish (for example, errands or chores)",
        },
        { id: "not-enough-energy", label: "I don’t have enough energy" },
        { id: "feel-unhealthy", label: "I feel unhealthy" },
        {
          id: "not-wear-clothes",
          label: "I’m not able to wear clothes that I want",
        },
        { id: "feel-judged", label: "I feel judged by others" },
      ],
      exclusiveOptions: ["none"],
    },

    6: {
      id: "medications",
      type: "radio",
      title: "Do you take any of the following medications?",
      field: "medications",
      required: true,
      exclusiveOptions: ["none"],
      options: [
        { id: "none", label: "None of the below" },
        {
          id: "sulfonylureas",
          label: "Sulfonylureas (i.e. Gliclazide or glimepiride)",
        },
        { id: "insulin", label: "Insulin" },
        { id: "meglitinides", label: "Meglitinides" },
        { id: "furosemide", label: "Furosemide (Lasix)" },
        {
          id: "ssris",
          label: "SSRIs (fluoxetine, citalopram, sertraline, escitalopram)",
        },
      ],
      conditionalActions: {
        sulfonylureas: { action: "showPopup", popupType: "medication" },
        insulin: { action: "showPopup", popupType: "medication" },
        meglitinides: { action: "showPopup", popupType: "medication" },
        furosemide: { action: "showPopup", popupType: "medication" },
        ssris: { action: "showPopup", popupType: "medication" },
      },
    },

    7: {
      id: "eatingDisorderDiagnosis",
      type: "radio",
      title: "Have you ever been diagnosed with an eating disorder?",
      field: "eatingDisorderDiagnosis",
      required: true,
      options: [
        { id: "no", label: "No" },
        { id: "yes", label: "Yes" },
        { id: "maybe", label: "No, but I think I may have one" },
      ],
      conditionalActions: {
        yes: { action: "showPopup", popupType: "eatingDisorder" },
        maybe: { action: "showPopup", popupType: "eatingDisorder" },
      },
    },

    8: {
      id: "medicalConditions",
      type: "radio",
      title: "Do you have any of the following medical conditions?",
      field: "medicalConditions",
      required: true,
      exclusiveOptions: ["none"],
      options: [
        { id: "none", label: "None of the below" },
        { id: "men2", label: "Multiple Endocrine Neoplasia Type 2" },
        {
          id: "thyroid",
          label: "Personal or family history pf medullary thyroid cancer",
        },
        { id: "retinopathy", label: "Diabetic retinopathy" },
        { id: "liverKidney", label: "Chronic liver or kidney disease" },
        {
          id: "eatingDisorder",
          label: "Receiving treatment or consultation for an eating disorder",
        },

        {
          id: "schizophrenia",
          label: "Schizophrenia or mania/bipolar disorder",
        },
      ],
      conditionalActions: {
        men2: { action: "showPopup", popupType: "medicalCondition" },
        thyroid: { action: "showPopup", popupType: "medicalCondition" },
        retinopathy: { action: "showPopup", popupType: "medicalCondition" },
        liverKidney: { action: "showPopup", popupType: "medicalCondition" },
        eatingDisorder: { action: "showPopup", popupType: "medicalCondition" },
        schizophrenia: { action: "showPopup", popupType: "medicalCondition" },
      },
    },

    // 8: {
    //   id: "genderAtBirth",
    //   type: "radio",
    //   title: "Please select your assigned gender at birth",
    //   field: "genderAtBirth",
    //   required: true,
    //   conditionalNavigation: {
    //     male: 10,
    //     female: 9,
    //   },
    //   conditionalActions: {
    //     male: { action: "showPopup", popupType: "WeightLoss" },
    //     female: { action: "showPopup", popupType: "WeightLoss" },
    //   },
    //   options: [
    //     { id: "male", label: "Male" },
    //     { id: "female", label: "Female" },
    //   ],
    // },



    9: {
      id: "state",
      type: "select",
      passIf: "authenticate",
      title: "First, let’s make sure we have licensed providers in your area.",
      subtitle:
        "Weight loss medications are prescribed online and delivered to your door.",
      field: "state",
      required: true,
      label: "State",
      options: [
        { id: "", label: "Select a state" },
        { id: "CO", label: "Colorado" },
        { id: "CT", label: "Connecticut" },
        { id: "FL", label: "Florida" },
        { id: "ID", label: "Idaho" },
        { id: "IL", label: "Illinois" },
        { id: "IA", label: "Iowa" },
        { id: "KY", label: "Kentucky" },
        { id: "ME", label: "Maine" },
        { id: "MD", label: "Maryland" },
        { id: "MN", label: "Minnesota" },
        { id: "MT", label: "Montana" },
        { id: "NE", label: "Nebraska" },
        { id: "NV", label: "Nevada" },
        { id: "OK", label: "Oklahoma" },
        { id: "TX", label: "Texas" },
        { id: "WA", label: "Washington" },
        { id: "WY", label: "Wyoming" },
      ],
    },
    10: {
      id: "firstInformation",
      type: "form",
      passIf: "authenticate",
      titleCenter: true,
      title: `<p style="color:#A0693B; text-align:center; line-height: 140%;font-size:16px">We’re almost done!</p><p class="text-center text-[26px] headers-font mb-[24px]">Let us know your details</p>`,
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

    11: {
      id: "contactInfo",
      type: "form",
      passIf: "authenticate",
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
  },

  // Navigation configuration
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
  },

  // Progress mapping
  progressMap: {
    1: 16,
    2: 32,
    3: 48,
    4: 54,
    5: 62,
    6: 70,
    7: 75,
    8: 80,
    9: 92,
    10: 95,
    11: 98,
  },

  // Step titles
  stepTitles: {
    1: "Your Top Priority",
    2: "Height & Weight",
    3: "Your Basic Info",
    4: "Continue Basic Info",
    5: "Heart Health",
    6: "Quality of Life Impact",
    7: "Weight-Related Statements",
    8: "Methods You've Tried",
  },

  // Popup configurations
  popups: {
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
      buttons: [
        {
          label: "Continue",
          action: "close",
          primary: false,
          disabled: true,
        },
      ],
    },

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

    WeightLossResultPasswordPopup: {
      isWL: true,
      component: "WeightLossResultPasswordPopup",
      buttons: [
        {
          label: "Continue",
          action: "openPopup",
          popupName: "YourWeightPopup",
          primary: true,
        },
      ],
    },

    YourWeightPopup: {
      progress: "34",
      isWL: true,
      asPage: true,
      component: "YourWeightPopup",
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
      progress: "36",
      isWL: true,
      headerStyle:
        "headers-font text-[26px]  md:text-[32px] headers-font leading-[120%] mb-[16px] text-center",
      title: "Rocky creates long-term weight loss",
      messageStyle:
        "text-[14px] md:text-[16px] leading-[140%] mb-[24px] text-center",
      message:
        "On average, Rocky members lose 2-5x more weight vs. similar programs – without restrictive diets. Our holistic approach goes beyond just treatments – we help you develop habits for a healthier, happier you.",
      image: "/wl-pre-consultation/Weight.png",
      imageTop: false,
      imageStyle:
        "w-[100%] h-[320px] md:h-[324px] lg:w-[335px] rounded-[32px] mb-4",
      OnAverageMessage: true,
      PrivacyText: true,
      buttons: [
        {
          label: "Continue",
          action: "navigate",
          payload: 3, // Go to step 4 (per navigation config)
          primary: true,
        },
      ],
    },

    BodyNeeds: {
      isWL: true,
      messageStyle:
        "text-[14px] md:text-[16px] leading-[140%] mb-[24px] bg-[#F7F9FB] rounded-lg p-[16px]",
      message: `<center class="font-medium">Your body needs time to adjust to GLP-1 therapy—typically the first 4 weeks are about metabolic acclimation. From there,<u class="font-light"> weight loss tends to accelerate </u>, with many patients seeing their most noticeable results between weeks 5 and 9.</center> <br /> <center>At Rocky, we don’t just treat the symptoms — we <b>identify the underlying drivers of your metabolic health, helping you lose weight and keep it off for good.</b></center>`,
      image: "/wl-pre-consultation/WeightLossProgress.png",
      imageStyle: "w-[335px] h-[309px]",
      imageTop: true,
      buttons: [
        {
          label: "Continue",
          action: "continue",
          primary: true,
        },
      ],
    },

    WeightLoss: {
      isWL: true,
      asPage: false,
      contentAlign: "left",
      title: "You’ve qualified",
      headerStyle:
        "mb-[24px]   text-[#AE7E56] headers-font text-[26px] leading-[120%] mt-6",
      messageStyle: "text-[20px] leading-[140%] ",
      message: "Lose {weightToLose} lbs in a year",
      buttons: [
        {
          label: "Continue",
          action: "continue",
          primary: true,
        },
      ],
    },

    medicalCondition: {
      isWL: true,
      asPage: false,
      headerStyle:
        "headers-font text-[26px] md:text-[32px] leading-[120%] mb-[16px] text-center",
      title: "Sorry, you are not eligible for our weight loss program",
      messageStyle:
        "text-[14px] md:text-[16px] leading-[140%] mb-[24px] rounded-lg p-[16px]",
      message: `<center>Based on your answers, GLP-1 therapy through our online program would not be a good fit. Your health is very important to us, and some conditions/medications require more personalized, in-person support to ensure the best and safest care. We recommend you visit your usual doctor.</center>`,
      image: "/wl-pre-consultation/medical-condition-warning.png",
      imageStyle: "w-[358px] h-[324px] mb-4",

      buttons: [
        {
          label: "Close",
          action: "close",
          primary: true,
        },
      ],
    },
    medication: {
      isWL: true,
      asPage: false,
      headerStyle:
        "headers-font text-[26px] md:text-[32px] leading-[120%] mb-[16px] text-center",
      title: "Sorry, you are not eligible for our weight loss program",
      messageStyle:
        "text-[14px] md:text-[16px] leading-[140%] mb-[24px] rounded-lg p-[16px]",
      message: `<center>Based on your answers, GLP-1 therapy through our online program would not be a good fit. Your health is very important to us, and some conditions/medications require more personalized, in-person support to ensure the best and safest care. We recommend you visit your usual doctor.</center>`,
      image: "/wl-pre-consultation/medication-warning.png",
      imageStyle: "w-[358px] h-[324px] mb-4",
      buttons: [
        {
          label: "Close",
          action: "close",
          primary: true,
        },
      ],
    },
    eatingDisorder: {
      isWL: true,
      asPage: false,
      headerStyle:
        "headers-font text-[26px] md:text-[32px] leading-[120%] mb-[16px] text-center",
      title: "Sorry, you are not eligible for our weight loss program",
      messageStyle:
        "text-[14px] md:text-[16px] leading-[140%] mb-[24px] rounded-lg p-[16px]",
      message: `<center>Based on your answers, GLP-1 therapy through our online program would not be a good fit. Your health is very important to us, and some conditions/medications require more personalized, in-person support to ensure the best and safest care. We recommend you visit your usual doctor.</center>`,
      image: "/wl-pre-consultation/eating-disorder-warning.png",
      imageStyle: "w-[358px] h-[324px] mb-4",
      buttons: [
        {
          label: "Close",
          action: "close",
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
