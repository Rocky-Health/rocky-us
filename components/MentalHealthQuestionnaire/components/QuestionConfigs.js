export const QUESTION_CONFIGS = {
  // Current Situation Question (501)
  currentSituation: {
    title: "Tell us about your current situation",
    currentPage: 1,
    pageNo: 1,
    questionId: "501",
    options: [
      "I’m currently on medications and want to get it from MyRocky",
      "I'm currently on medication but want to make a change",
      "I have never been on medication for mental health before",
      "I am not on medication for mental health but have been in the past",
    ],
    showAdditionalInputFor: [
      "I’m currently on medications and want to get it from MyRocky",
      "I am not on medication for mental health but have been in the past",
    ],
    additionalInputPlaceholder: "Please list your current medications",
    medicationsInputFields: {
      "I’m currently on medications and want to get it from MyRocky": [
        {
          key: "l-501_1-input",
          placeholder: "Please state name and dose of medication",
        },
        { key: "l-501_1-textarea", placeholder: "Who was this prescribed by" },
      ],
      "I am not on medication for mental health but have been in the past": [
        {
          key: "l-501_3-input",
          placeholder: "Please state name and dose of medication",
        },
        { key: "l-501_3-textarea", placeholder: "Who was this prescribed by" },
      ],
    },
    continueToQuestionFor: {
      "I’m currently on medications and want to get it from MyRocky": "509",
      "I'm currently on medication but want to make a change": "502",
      "I am not on medication for mental health but have been in the past":
        "504",
      "I have never been on medication for mental health before": "504",
    },
    addsFunctionFor: {
      "I’m currently on medications and want to get it from MyRocky":
        "choose_509_1",
    },
  },

  // Change Type Question (502)
  changeType: {
    title: "Please select the change you would like to make",
    currentPage: 2,
    pageNo: 2,
    questionId: "502",
    options: ["Switch medications", "Reduce my dose", "Increase my dose"],
  },

  // Change Reason Question (503)
  changeReason: {
    title: "Please explain the reason for the change",
    currentPage: 3,
    pageNo: 3,
    questionId: "503",
    options: [
      "A) I'm not seeing the results I hoped for",
      "B) I am having side effects",
      "Both A & B",
      "Other",
    ],
    showAdditionalInputFor: "Other",
    additionalInputPlaceholder: "Please explain...",
    continueToQuestionFor: {
      Other: "504",
    },
  },

  // Symptoms Question (504)
  symptoms: {
    title: "What best describes how you are feeling?",
    currentPage: 4,
    pageNo: 4,
    questionId: "504",
    isMultiChoice: true,
    options: [
      "Stressed out",
      "Anxious or worried",
      "Depressed or hopeless",
      "Struggling to sleep",
      "Something else",
    ],
    showAdditionalInputFor: "Something else",
    additionalInputPlaceholder: "Please explain...",
  },

  // How Long Question (505)
  howLong: {
    title: "How long have you felt this way?",
    currentPage: 5,
    pageNo: 5,
    questionId: "505",
    options: [
      "Less than 3 months",
      "3-6 months",
      "6-12 months",
      "Between 1-3 years",
      "More than 3 years",
    ],
  },

  // Recent Events Question (506)
  recentEvents: {
    title:
      "Are there any recent events in your life that could be impacting how you feel?",
    currentPage: 6,
    pageNo: 6,
    questionId: "506",
    isMultiChoice: true,
    options: [
      "Death of a loved one",
      "Divorce or Breakup",
      "Job loss or uncertainty",
      "Changes to your health",
      "Financial troubles",
      "Something else",
      "None of the above",
    ],
    showAdditionalInputFor: 5,
    additionalInputPlaceholder: "Please explain...",
    noneOfTheAboveIndex: 6,
  },

  // Support Methods Question (507)
  supportMethods: {
    title: "Have you tried any of the following to support your mental health?",
    currentPage: 7,
    pageNo: 7,
    questionId: "507",
    isMultiChoice: true,
    options: [
      "Therapy",
      "Mindfulness or Meditation",
      "Eating healthy",
      "Physical activity",
      "Something else",
      "None of the above",
    ],
    showAdditionalInputFor: 4,
    additionalInputPlaceholder: "Please explain...",
    noneOfTheAboveIndex: 5,
  },

  // Results Question (508)
  results: {
    title: "What results are you looking for?",
    currentPage: 8,
    pageNo: 8,
    questionId: "508",
    isMultiChoice: true,
    options: [
      "To feel happier",
      "Not worry so much",
      "More energy",
      "Better sleep",
      "All the above",
      "Other",
    ],
    showAdditionalInputFor: 5,
    additionalInputPlaceholder: "Please explain...",
  },

  // Mental Health Treatment Journey Question (509)
  mentalHealthJourney: {
    title:
      "When you think about what your mental health treatment journey might look like, which of the following is most important to you?",
    currentPage: 9,
    pageNo: 9,
    questionId: "509",
    isMultiChoice: true,
    options: [
      "Taking medication",
      "Self Help (Educational videos, articles, and meditation)",
      "Speaking to a therapist",
    ],
    showPopupFor: ["Speaking to a therapist"],
  },

  // Psychiatrist Consult Question (510)
  psychiatristConsult: {
    title: "Have you consulted with a psychiatrist before?",
    currentPage: 10,
    pageNo: 10,
    questionId: "510",
    options: ["Yes", "No"],
    showAdditionalInputFor: "Yes",
    additionalInputPlaceholder:
      "Please give details of the visit including when it was and diagnosis made.",
    continueToQuestionFor: {
      Yes: "511",
    },
  },

  // Medications Question (527)
  medications: {
    title: "Are you currently taking any of the following medications?",
    currentPage: 27,
    pageNo: 27,
    questionId: "527",
    isMultiChoice: true,
    options: [
      "Anti seizure medications",
      "Antibiotics",
      "Anticoagulants (blood thinners)",
      "Antifungals",
      "HIV medications",
      "Tuberculosis medications",
      "Methadone",
      "None",
    ],
    noneOfTheAboveIndex: 7,
  },

  // Medical Conditions Question (528)
  medicalConditions: {
    title: "Do you have any of the following medical conditions?",
    currentPage: 28,
    pageNo: 28,
    questionId: "528",
    isMultiChoice: true,
    options: [
      "Diabetes",
      "High blood pressure",
      "Kidney failure",
      "Liver disease",
      "Narrow angle glaucoma",
      "QT prolongation",
      "Seizure disorder or epilepsy",
      "Bleeding disorder",
      "None of these apply",
    ],
    showAdditionalInputFor: "Seizure disorder or epilepsy",
    additionalInputPlaceholder:
      "When was your last seizure? State month and year..",
    noneOfTheAboveIndex: 8,
  },

  // Allergies Question (529)
  allergies: {
    title: "Do you have any known allergies?",
    currentPage: 29,
    pageNo: 29,
    questionId: "529",
    options: ["Yes", "No"],
    showAdditionalInputFor: "Yes",
    additionalInputPlaceholder: "Please state your allergies",
    continueToQuestionFor: {
      Yes: "530",
    },
  },

  // Current Medications Question (530)
  currentMedications: {
    title: "Do you take any medications?",
    currentPage: 30,
    pageNo: 30,
    questionId: "530",
    options: ["Yes", "No"],
    showAdditionalInputFor: "Yes",
    additionalInputPlaceholder: "Please list your medications",
    continueToQuestionFor: {
      Yes: "531",
    },
  },

  // Medical History Question (531)
  medicalHistory: {
    title: "Do you have any medical conditions?",
    currentPage: 31,
    pageNo: 31,
    questionId: "531",
    options: ["Yes", "No"],
    showAdditionalInputFor: "Yes",
    additionalInputPlaceholder: "What are they?",
    continueToQuestionFor: {
      Yes: "532",
    },
  },

  // Alcohol Question (532)
  alcohol: {
    title: "Do you drink alcohol?",
    currentPage: 32,
    pageNo: 32,
    questionId: "532",
    notes:
      "One shot of 40% spirits is 1 unit.-One glass of wine or a pint of beer is 2 units.",
    options: [
      "Yes, more than 14 units/week",
      "Yes, Less than 14 units/week",
      "No",
    ],
  },

  // Drugs Question (533)
  drugs: {
    title: "Do you use any of the following drugs?",
    currentPage: 33,
    pageNo: 33,
    questionId: "533",
    isMultiChoice: true,
    options: [
      "Cocaine",
      "Marijuana",
      "Magic Mushrooms",
      "Tobacco/Vaping Nicotine",
      "Poppers",
      "None of these apply",
    ],
    noneOfTheAboveIndex: 5,
  },

  // Health Care Team Questions (538)
  healthCareTeamQuestions: {
    title: "Do you have any questions for our health care team?",
    currentPage: 34,
    pageNo: 34,
    questionId: "538",
    options: [
      "No",
      "Yes"
    ],
    showAdditionalInputFor: "Yes",
    additionalInputPlaceholder: "Please describe your questions for our health care team..."
  },

  // Photo ID instructions
  photoIdInstructions: {
    title: "Photo ID Verification",
    subtitle:
      "For your security and to comply with healthcare regulations, we need to verify your identity.",
    currentPage: 35,
    pageNo: 35,
    questionId: "534",
  },

  // Photo ID Upload
  photoIdUpload: {
    title: "Upload Your Photo ID",
    subtitle: "Please upload a valid government-issued photo ID",
    currentPage: 37,
    pageNo: 37,
    questionId: "535",
  },
  questionnaireComplete: {
    title: "Thank you for completing the questionnaire!",
    subtitle: "We've received your information and will be in touch soon.",
    currentPage: 37,
    pageNo: 37,
    questionId: "536",
    message: [
      "We've received your information. Our healthcare professionals will review your answers and contact you soon.",
    ],
  },

  phq9AndGad7Scale: {
    title:
      "How often have you been bothered by the following over the past 2 weeks?",
    options: [
      "Not at all",
      "Several Days",
      "More than half the days",
      "Nearly every day",
    ],
  },
};

// PHQ-9 questions (511-519)
export const PHQ9_QUESTIONS = [
  {
    subtitle: "Little interest or pleasure in doing things?",
    questionId: "511",
    score: "PHQ9",
  },
  {
    subtitle: "Feeling down, depressed, or hopeless?",
    questionId: "512",
    score: "PHQ9",
  },
  {
    subtitle: "Trouble falling or staying asleep, or sleeping too much?",
    questionId: "513",
    score: "PHQ9",
  },
  {
    subtitle: "Feeling tired or having little energy?",
    questionId: "514",
    score: "PHQ9",
  },
  {
    subtitle: "Poor appetite or overeating?",
    questionId: "515",
    score: "PHQ9",
  },
  {
    subtitle:
      "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
    questionId: "516",
    score: "PHQ9",
  },
  {
    subtitle:
      "Trouble concentrating on things, such as reading the newspaper or watching television",
    questionId: "517",
    score: "PHQ9",
  },
  {
    subtitle:
      "Moving or speaking so slowly that other people could have noticed? Or so fidgety or restless that you have been moving a lot more than usual?",
    questionId: "518",
    score: "PHQ9",
  },
  {
    subtitle:
      "Thoughts that you would be better off dead, or thoughts of hurting yourself in some way?",
    questionId: "519",
    score: "PHQ9",
  },
];

// GAD-7 questions (520-526)
export const GAD7_QUESTIONS = [
  {
    subtitle: "Feeling nervous, anxious, or on edge?",
    questionId: "520",
    score: "GAD7",
  },
  {
    subtitle: "Not being able to stop or control worrying?",
    questionId: "521",
    score: "GAD7",
  },
  {
    subtitle: "Worrying too much about different things?",
    questionId: "522",
    score: "GAD7",
  },
  {
    subtitle: "Trouble relaxing?",
    questionId: "523",
    score: "GAD7",
  },
  {
    subtitle: "Being so restless that it's hard to sit still?",
    questionId: "524",
    score: "GAD7",
  },
  {
    subtitle: "Becoming easily annoyed or irritable?",
    questionId: "525",
    score: "GAD7",
  },
  {
    subtitle: "Feeling afraid as if something awful might happen?",
    questionId: "526",
    score: "GAD7",
  },
];

export const createPHQ9Question = (question, questionId, currentPage) => ({
  ...QUESTION_CONFIGS.phq9AndGad7Scale,
  subtitle: question.subtitle,
  questionId: question.questionId,
  currentPage,
  pageNo: currentPage,
  scoreType: question.score,
});

export const createGAD7Question = (question, questionId, currentPage) => ({
  ...QUESTION_CONFIGS.phq9AndGad7Scale,
  subtitle: question.subtitle,
  questionId: question.questionId,
  currentPage,
  pageNo: currentPage,
  scoreType: question.score,
});

// Generate PHQ-9 and GAD-7 questions
export const generateMentalHealthQuestions = () => {
  const phq9Questions = PHQ9_QUESTIONS.map((question, index) =>
    createPHQ9Question(question, question.questionId, index + 11)
  );

  const gad7Questions = GAD7_QUESTIONS.map((question, index) =>
    createGAD7Question(question, question.questionId, index + 20)
  );

  return [...phq9Questions, ...gad7Questions];
};
