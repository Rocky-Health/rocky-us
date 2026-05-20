import { logger } from "@/utils/devLogger";

export const questions = [
  {
    id: 1,
    pageNo: 1,
    questionId: "1",
    title: "What was your biological sex at birth?",
    subtitle: "For example, on your original birth certificate",
    inputType: "radio",
    options: [
      { id: "1_0", value: "Male" },
      { id: "1_1", value: "Female", requiresConsent: true },
    ],
    requiresConsentPopup: false,
  },
  {
    id: 2,
    pageNo: 2,
    questionId: "30",
    title: "Do you have any known allergies?",
    inputType: "radio",
    options: [
      {
        id: "30_1",
        value: "No",
        className: "other-input-hide",
        otherField: "allergies-field",
      },
      {
        id: "30_2",
        value: "Yes",
        className: "other-input-show",
        otherField: "allergies-field",
      },
    ],
    conditionalField: {
      condition: (formData) => formData["30"] === "Yes",
      fieldId: "31",
      name: "31",
      placeholder: "e.g. Allergy1, Allergy2",
      label:
        "Please enter the allergies in the box below separated by comma (,)",
    },
  },
  {
    id: 3,
    pageNo: 3,
    questionId: "138",
    title: "Do you drink alcohol?",
    subtitle:
      "One shot of 40% spirits is 1 unit. One glass of wine or a pint of beer is 2 units.",
    inputType: "radio",
    options: [
      { id: "138_1", value: "No" },
      { id: "138_2", value: "Yes, more than 14 units/week" },
      { id: "138_3", value: "Yes, Less than 14 units/week" },
    ],
  },
  {
    id: 4,
    pageNo: 4,
    questionId: "23",
    title: "Do you use any of the following drugs?",
    inputType: "checkbox",
    options: [
      { id: "23_1", name: "23_1", value: "Cocaine" },
      { id: "23_2", name: "23_2", value: "Marijuana" },
      { id: "23_3", name: "23_3", value: "Magic Mushrooms" },
      { id: "23_4", name: "23_4", value: "Tobacco/vaping nicotine" },
      { id: "23_6", name: "23_6", value: "Poppers" },
      {
        id: "23_5",
        name: "23_5",
        value: "None of these apply",
        isNoneOption: true,
      },
    ],
  },
  {
    id: 5,
    pageNo: 5,
    questionId: "5",
    title: "Do you have any of the following medical conditions?",
    inputType: "checkbox",
    options: [
      {
        id: "5_1",
        name: "5_1",
        value: "No Medical Issues",
        isNoneOption: true,
      },
      { id: "5_2", name: "5_2", value: "Coronary artery disease" },
      { id: "5_3", name: "5_3", value: "Stroke or Transient ischemic attack" },
      { id: "5_4", name: "5_4", value: "High blood pressure" },
      { id: "5_5", name: "5_5", value: "Peripheral vascular disease" },
      { id: "5_6", name: "5_6", value: "Diabetes" },
      { id: "5_7", name: "5_7", value: "Neurological disease" },
      { id: "5_8", name: "5_8", value: "Low Testosterone" },
      { id: "5_9", name: "5_9", value: "Mental Health issues" },
      { id: "5_11", name: "5_11", value: "Enlarged Prostate" },
      { id: "5_12", name: "5_12", value: "Structural damage to your penis" },
      {
        id: "5_13",
        name: "5_13",
        value: "Other",
        isOtherOption: true,
        otherField: "other-medical-conditions-field",
      },
    ],
    conditionalField: {
      condition: (formData) => formData["5_13"] === "Other",
      fieldId: "56",
      name: "56",
      placeholder: "e.g. Medical Condition1, Medical Condition2",
      label:
        "Please enter the medical conditions in the box below separated by comma (,)",
    },
  },
  {
    id: 6,
    pageNo: 6,
    questionId: "25",
    title: "Are you currently taking any prescription medications?",
    inputType: "radio",
    options: [
      { id: "25_1", value: "No" },
      { id: "25_2", value: "Yes" },
    ],
  },
  {
    id: 7,
    pageNo: 7,
    questionId: "27",
    title: "Are you taking any of the following medications?",
    inputType: "checkbox",
    requiresConsentPopup: true,
    options: [
      {
        id: "27_1",
        name: "27_1",
        value: "Glyceral Trinitrate spray or tablets",
        showWarning: true,
      },
      {
        id: "27_2",
        name: "27_2",
        value: "Isosorbide Mononitrate",
        showWarning: true,
      },
      {
        id: "27_3",
        name: "27_3",
        value: "Isosorbide Dinitrate",
        showWarning: true,
      },
      {
        id: "27_4",
        name: "27_4",
        value: "Nitroprusside",
        showWarning: true,
      },
      {
        id: "27_5",
        name: "27_5",
        value: "Any other nitrate-containing medication in any form",
        showWarning: true,
      },
      {
        id: "27_7",
        name: "27_7",
        value: "None of these apply",
        isNoneOption: true,
      },
      {
        id: "27_6",
        name: "27_6",
        value: "Other",
        isOtherOption: true,
        otherField: "other-medicine-dropdown-field",
      },
    ],
    conditionalField: {
      condition: (formData) => formData["27_6"] === "Other",
      fieldId: "28",
      name: "28",
      type: "text",
      placeholder: "Please enter your medication details.",
      label: "Please enter your medication details.",
    },
  },
  {
    id: 8,
    pageNo: 8,
    questionId: "33",
    title: "What sexual issues are you experiencing?",
    inputType: "checkbox",
    options: [
      { id: "33_1", name: "33_1", value: "Difficulty getting an erection" },
      { id: "33_2", name: "33_2", value: "Difficulty maintaining an erection" },
      {
        id: "33_3",
        name: "33_3",
        value: "Low sexual desire",
        requiresConsent: true,
        consentPopupContent: {
          title: "Low Sex Drive Notice",
          message:
            "You've indicated you have low sex drive.\n\nWhile erectile dysfunction and low libido can sometimes occur together, they are often caused by different underlying issues.\n\n💡 Please note: Treatments for erectile dysfunction are unlikely to improve sex drive.\n\nLow libido may require further evaluation, as it can be linked to hormonal, psychological, or medical factors.\n\n👉 We strongly recommend that you consult your physician or a healthcare professional for a full assessment.",
          acknowledgementRequired: true,
          acknowledgementField: "97_1",
        },
      },
      {
        id: "33_5",
        name: "33_5",
        value: "Ejaculating too early",
        requiresConsent: true,
        consentPopupContent: {
          title: "Please read",
          message:
            "Premature ejaculation lacks a strict definition but is generally considered penetrative sex lasting under three minutes, leading to dissatisfaction. If this sounds like your experience, ED treatments won't help—please visit our premature ejaculation page instead.",
        },
      },
    ],
  },
  {
    id: 9,
    pageNo: 9,
    questionId: "42",
    title: "When was the last time you had normal sexual function?",
    inputType: "radio",
    options: [
      { id: "42_1", value: "Currently normal" },
      { id: "42_2", value: "3 months ago" },
      { id: "42_3", value: "6 months ago" },
      { id: "42_4", value: "12 months ago" },
      { id: "42_5", value: "Always had problems" },
    ],
  },
  {
    id: 10,
    pageNo: 10,
    questionId: "35",
    title: "How did your ED start?",
    inputType: "radio",
    requiresConsentPopup: true,
    options: [
      { id: "35_1", value: "Suddenly" },
      { id: "35_2", value: "Gradually" },
    ],
    consentPopupContent: {
      title: "Please read",
      message:
        "ED can have a variety of underlying causes, some of which may require treatment. We recommend you schedule an appointment with your doctor to discuss this further and arrange any necessary tests. For now, let MyRocky do some of the work for you.",
      acknowledgementRequired: true,
      acknowledgementField: "96_1",
    },
  },
  {
    id: 11,
    pageNo: 11,
    questionId: "37",
    title: "How often is ED a problem for you?",
    inputType: "radio",
    options: [
      { id: "37_1", value: "All the time" },
      { id: "37_2", value: "Sometimes" },
      { id: "37_3", value: "Rarely" },
    ],
  },
  {
    id: 12,
    pageNo: 12,
    questionId: "40",
    title: "Do you get morning erections?",
    inputType: "radio",
    options: [
      { id: "40_1", value: "Yes" },
      { id: "40_2", value: "Have not had one in over three months" },
      { id: "40_3", value: "Never had them" },
    ],
  },
  {
    id: 13,
    pageNo: 13,
    questionId: "45",
    title: "What was your most recent blood pressure reading?",
    subtitle:
      "Please provide your blood pressure reading taken within the last 6 months.",
    inputType: "radio",
    requiresConsentPopup: true,
    options: [
      { id: "45_0", value: "120/80 or lower (Normal)" },
      { id: "45_1", value: "121/81 to 140/90 (Above Normal)" },
      {
        id: "45_2",
        value: "141/91 to 179/99  (High)",
        requiresConsent: true,
        consentPopupContent: {
          title: "Please keep in mind...",
          message:
            "Your blood pressure is considered high. We'll be able to give you your prescription but please speak to your doctor to discuss your blood pressure.",
          acknowledgementRequired: true,
          acknowledgementField: "102_1",
        },
      },
      {
        id: "45_3",
        value: ">180/100 (Higher)",
        label: "&gt;180/100 (Higher)",
        requiresConsent: true,
        consentPopupContent: {
          title: "Sorry...",
          message:
            "Your blood pressure is considered very high and we would not be able to provide you with a prescription today. We strongly advise you seek immediate medical attention.",
          blocksProceed: true,
        },
      },
      {
        id: "45_4",
        value: "I don't know my blood pressure",
        requiresConsent: true,
        consentPopupContent: {
          title: "Sorry...",
          message:
            "Unfortunately it would not be safe to give you a prescription without knowing your blood pressure.",
          blocksProceed: true,
        },
      },
    ],
  },
  {
    id: 14,
    pageNo: 14,
    questionId: "51",
    title:
      "Are you currently taking any medication(s) to help lower your blood pressure?",
    subtitle: "(antihypertensives)",
    inputType: "radio",
    requiresConsentPopup: true,
    options: [
      {
        id: "51_1",
        value: "Yes",
        requiresConsent: true,
        consentPopupContent: {
          title: "Please keep in mind that...",
          message:
            "When antihypertensives are combined with sildenafil or tadalafil, this may lower blood pressure even further causing you to feel faint. Although it is generally safe to take these medications together, it is best to take them 4 hours apart to avoid this side effect.",
          acknowledgementRequired: true,
          acknowledgementField: "103_1",
        },
      },
      { id: "51_2", value: "No" },
    ],
  },
  {
    id: 15,
    pageNo: 15,
    questionId: "49",
    title: "Do you experience any of the following cardiovascular symptoms?",
    inputType: "checkbox",
    requiresConsentPopup: true,
    options: [
      {
        id: "49_1",
        name: "49_1",
        value: "Chest pain during sex",
        requiresConsent: true,
        consentPopupContent: {
          title: "Unfortunately...",
          message:
            "It would not be safe to provide you with a prescription at this time. Please consult a doctor as soon as possible to discuss your symptoms.",
          blocksProceed: true,
        },
      },
      {
        id: "49_2",
        name: "49_2",
        value: "Chest pain during exercise",
        requiresConsent: true,
        consentPopupContent: {
          title: "Unfortunately...",
          message:
            "It would not be safe to provide you with a prescription at this time. Please consult a doctor as soon as possible to discuss your symptoms.",
          blocksProceed: true,
        },
      },
      {
        id: "49_3",
        name: "49_3",
        value: "Unexplained fainting or dizziness",
        requiresConsent: true,
        consentPopupContent: {
          title: "Unfortunately...",
          message:
            "It would not be safe to provide you with a prescription at this time. Please consult a doctor as soon as possible to discuss your symptoms.",
          blocksProceed: true,
        },
      },
      { id: "49_4", name: "49_4", value: "Leg or buttock pain with exercise" },
      { id: "49_5", name: "49_5", value: "Abnormal heart rate or rhythm" },
      {
        id: "49_6",
        name: "49_6",
        value: "None of these apply to me",
        isNoneOption: true,
      },
    ],
    conditionalField: {
      condition: (formData) => formData["49_5"],
      fieldId: "81",
      name: "81",
      type: "text",
      placeholder: "Please state the condition",
      label: "Please state the condition",
    },
  },
  {
    id: 16,
    pageNo: 16,
    questionId: "2",
    title: "Let's figure this out.",
    subtitle: "Have you used ED meds before?",
    inputType: "radio",
    options: [
      { id: "2_0", value: "Yes" },
      { id: "2_1", value: "No" },
    ],
    conditionalField: {
      condition: (formData) => formData["2"] === "Yes",
      fieldId: "148",
      name: "148",
      type: "text",
      placeholder: "Please state the medication and dosage",
      label: "Please state the medication and dosage",
    },
  },
  {
    id: 17,
    pageNo: 17,
    questionId: "203",
    title: "About your medication",
    inputType: "radio",
    content: {
      benefitsTitle:
        "Intended benefits of Cialis(Tadalafil) / Viagra(Sildenafil) for sexual health:",
      benefits: ["To help get and/or maintain an erection"],
      benefitsNote:
        "*This isn’t a full list of potential side effects. To learn more, please book an appointment or send a message to your clinician",
      sideEffectsTitle: "Possible Side Effects:",
      sideEffects: [
        "Headaches",
        "Facial flushing",
        "Muscle pain",
        "Indigestion",
        "Low blood pressure",
      ],
      sideEffectsNote:
        "*Please be aware the above list does not include all possible side effects. If you want to know more, please book an appointment with our healthcare team at the end of this questionnaire.",
    },
    options: [
      {
        id: "203_0",
        value:
          "I have read and understood the intended benefits and possible side effects and do not have any questions",
      },
      {
        id: "203_1",
        value: "I have questions and will book a phone call",
      },
    ],
  },
  {
    id: 18,
    pageNo: 18,
    questionId: "179",
    title: "You're Almost Done",
    subtitle: "Connect with our Medical Team",
    subtitle2: "Do you have any questions for our healthcare team?",
    inputType: "radio",
    options: [
      { id: "179_0", value: "Yes" },
      { id: "179_1", value: "No" },
    ],
    conditionalField: {
      condition: (formData) => formData["179"] === "Yes",
      fieldId: "181",
      name: "181",
      type: "text",
      placeholder: "Specify your questions",
      label: "Specify your questions",
    },
  },
  {
    id: 19,
    pageNo: 19,
    questionId: "178",
    title:
      "Would you like to book a call with one of our clinician or pharmacists?",
    inputType: "radio",
    options: [
      { id: "178_2", value: "Clinician" },
      { id: "178_3", value: "Pharmacist" },
      {
        id: "178_1",
        value: "No",
        label: "No Thanks",
        requiresConsent: true,
        consentPopupContent: {
          title: "Acknowledgement",
          message:
            "I hereby acknowledge that by foregoing an appointment with a licensed physician or pharmacist, it is my sole responsibility to ensure I am aware of how to appropriately use the medication requested, furthermore I hereby confirm that I am aware of any potential side effects that may occur through the use of the aforementioned medication and hereby confirm that I do not have any medical questions to ask. I will ensure I have read the relevant product page and FAQ prior to use of the prescribed medication. Should I have any questions to ask, I am aware of how to contact the clinical team at MyRocky or get a hold of my primary care provider.",
          acknowledgementRequired: true,
          acknowledgementField: "182_1",
          alternativeOption: "book-call-instead",
        },
      },
    ],
  },
  {
    id: 20,
    pageNo: 20,
    questionId: "204",
    title: "Upload Photo ID",
    inputType: "checkbox",
    content: {
      mainNote:
        "Please note this step is mandatory. If you are unable to complete at this time, email your ID to clinicadmin@myrocky.com",
      secondaryNote:
        "Your questionnaire will not be reviewed without this. As per our T&C's a $45 cancellation fee will be charged if we are unable to verify you.",
    },
    acknowledgement: {
      required: true,
      fieldId: "204_1",
      text: "I hereby understand and acknowledge the above message",
    },
  },
  {
    id: 21,
    pageNo: 21,
    questionId: "196",
    title: "Verify your Identity",
    subtitle: "Take a picture holding your ID.",
    subtitle2: "Your face and ID must be clearly visible",
    inputType: "upload",
    fileUpload: {
      accept: "image/jpeg,image/jpg,image/png",
      label: "Tap to upload the ID photo",
      maxSize: 20 * 1024 * 1024, // 20MB
      noteText: "Please capture a selfie of yourself",
      restrictions:
        "Only JPG, JPEG, and PNG images are supported.\nMax allowed file size per image is 20MB",
    },
  },
  {
    id: 22,
    pageNo: 22,
    questionId: "",
    inputType: "",
    completionPage: {
      title: "Thank You!",
      message: "Your form has been successfully submitted!",
      subMessage: "We will review your information and be in touch shortly.",
      socialLinks: [
        {
          url: "https://www.facebook.com/people/Rocky-Health-Inc/100084461297628/",
          platform: "facebook",
        },
        {
          url: "https://www.instagram.com/myrocky/",
          platform: "instagram",
        },
        {
          url: "https://twitter.com/myrockyca",
          platform: "twitter",
        },
      ],
      homeLink: {
        text: "Back Home",
        url: "/",
      },
    },
  },
];

export const popupMessages = {
  female: {
    title: "Just a Quick Note! 😊",
    message:
      "We noticed you selected Female—currently, our treatments for erectile dysfunction are only available for men.",
  },
  nitrates: {
    title: "Sorry",
    message:
      "As much as we would love to help, ED medications are not considered safe when taken with this medication. It may cause your blood pressure to drop leading to a possible faint or collapse. We are therefore unable to provide you with a prescription on this occasion and would encourage you to speak to your regular doctor.",
  },
};

export const getQuestionById = (questionId) => {
  return questions.find((q) => q.questionId === questionId);
};

export const getQuestionByPage = (pageNumber) => {
  const question = questions.find((q) => q.pageNo === pageNumber);
  logger.log(`Getting question for page ${pageNumber}:`, question);
  return question;
};
