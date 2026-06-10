export const hairQuestionList = [
  // Question => 1
  {
    questionId: "137",
    type: "single-choice",
    questionHeader: "What best describes your hair?",
    answers: [
      {
        body: "Receding hairline",
        imageSrc:
          "https://wpbe.myrocky.com/wp-content/themes/salient-child/img/receding.svg",
      },
      {
        body: "Thinning at the crown",
        imageSrc:
          "https://wpbe.myrocky.com/wp-content/themes/salient-child/img/crown.svg",
      },
      {
        body: "Overall hair loss/thinning",
        imageSrc:
          "https://wpbe.myrocky.com/wp-content/themes/salient-child/img/overall.svg",
      },
      {
        body: "Full head of hair",
        imageSrc:
          "https://wpbe.myrocky.com/wp-content/themes/salient-child/img/nowhere.svg",
      },
    ],
  },
  // Question => 2
  {
    questionId: "138",
    type: "single-choice",
    questionHeader: "What sort of results are you looking for?",
    answers: [
      {
        body: "Regrowing my hair",
      },
      {
        body: "Preventing future hair loss",
      },
      {
        body: "Both",
      },
    ],
  },
  // Question => 3
  {
    questionId: "158",
    type: "date",
    questionHeader: "Let's make sure you're eligible for treatment",
    subtitle: "My birth date is",
  },
  // Question => 4
  {
    questionId: "1",
    type: "single-choice",
    questionHeader: "What was your biological sex at birth?",
    subtitle: "For example, on your original birth certificate",
    answers: [
      {
        body: "Male",
      },
      {
        body: "Female",
      },
    ],
  },
  // Question => 5
  {
    questionId: "25",
    type: "single-choice",
    questionHeader: "Have you ever been diagnosed with any liver problem?",
    answers: [
      {
        body: "Yes",
      },
      {
        body: "No",
      },
    ],
  },
  // Question => 6
  {
    questionId: "39",
    type: "single-choice",
    questionHeader: "Have you ever been diagnosed with Breast Cancer?",
    answers: [
      {
        body: "Yes",
      },
      {
        body: "No",
      },
    ],
  },
  // Question => 7
  {
    questionId: "22",
    type: "single-choice",
    questionHeader: "Have you ever been diagnosed with prostate cancer?",
    answers: [
      {
        body: "Yes",
      },
      {
        body: "No",
      },
    ],
  },
  // Question => 8
  {
    questionId: "23",
    type: "multi-choice",
    questionHeader:
      "Are you experiencing any of the following symptoms on your scalp?",
    subtitle:
      "People can experience various causes of hair loss. We want to know whether yours is one that requires different treatment.",
    answers: [
      {
        body: "Burning or pain",
        id: "23_1",
      },
      {
        body: "Patches of rough, scaly skin or scarring",
        id: "23_2",
      },
      {
        body: "Pustules or crusting",
        id: "23_3",
      },
      {
        body: "No, none of these",
        id: "23_4",
        isNoneOption: true,
      },
    ],
  },
  // Question => 9
  {
    questionId: "24",
    type: "multi-choice",
    questionHeader: "Do you have any of the following conditions?",
    answers: [
      {
        body: "Scalp psoriasis",
        id: "24_1",
      },
      {
        body: "Eczema of the scalp",
        id: "24_2",
      },
      {
        body: "Ringworm infection",
        id: "24_3",
      },
      {
        body: "Alopecia areata",
        id: "24_4",
      },
      {
        body: "None of the above",
        id: "24_5",
        isNoneOption: true,
      },
    ],
  },
  // Question => 10 (Active condition question)
  {
    questionId: "40",
    type: "single-choice",
    questionHeader: "Is it currently active?",
    answers: [
      {
        body: "Yes",
      },
      {
        body: "No, my scalp is clear",
      },
    ],
  },
  // Question => 11
  {
    questionId: "26",
    type: "multi-choice",
    questionHeader: "Are you currently experiencing any of the following?",
    answers: [
      {
        body: "Premature ejaculation",
        id: "26_1",
      },
      {
        body: "Low sex drive",
        id: "26_2",
      },
      {
        body: "Trouble getting or maintaining erections",
        id: "26_3",
      },
      {
        body: "No, none of these",
        id: "26_4",
        isNoneOption: true,
      },
    ],
  },
  // Question => 12
  {
    questionId: "27",
    type: "multi-choice",
    questionHeader:
      "Have you been diagnosed or currently experiencing any of the following medical conditions?",
    answers: [
      {
        body: "Depression",
        id: "27_1",
      },
      {
        body: "Anxiety",
        id: "27_2",
      },
      {
        body: "Psychosis",
        id: "27_3",
      },
      {
        body: "Current or past suicidal ideation",
        id: "27_4",
      },
      {
        body: "Other",
        id: "27_5",
        addsTextArea: true,
        textAreaId: "36",
      },
      {
        body: "None of the above",
        id: "27_6",
        isNoneOption: true,
      },
    ],
  },
  // Question => 13
  {
    questionId: "28",
    type: "single-choice",
    questionHeader: "Do you currently take any medications?",
    answers: [
      {
        body: "No",
      },
      {
        body: "Yes",
        addsTextArea: true,
        textAreaId: "29",
        textAreaLabel:
          "Please enter the exact name and dosing of the medications you are taking",
        textAreaPlaceholder:
          "Example: Medication 1 and Dose 1, Medication 2 and Dose 2",
      },
    ],
  },
  // Question => 14
  {
    questionId: "30",
    type: "single-choice",
    questionHeader: "Do you have any other medical conditions?",
    subtitle:
      "Certain conditions can complicate diagnosis, increase risks, or change the recommended treatments so it's important for your provider to know.",
    answers: [
      {
        body: "No",
      },
      {
        body: "Yes",
        addsTextArea: true,
        textAreaId: "41",
        textAreaPlaceholder:
          "e.g. Other Medical Condition 1, Other Medical Condition 2",
      },
    ],
  },
  // Question => 15
  {
    questionId: "31",
    type: "single-choice",
    questionHeader: "Do you have any known allergies?",
    answers: [
      {
        body: "No",
      },
      {
        body: "Yes",
        addsTextArea: true,
        textAreaId: "32",
        textAreaLabel:
          "Please enter the allergies in the box below separated by commas (,)",
        textAreaPlaceholder: "Example: Allergie 1, Allergie 2",
      },
    ],
  },
  // Question => 16
  {
    questionId: "upload",
    type: "photo-upload",
    questionHeader: "Photo Upload",
    subtitle: "Please upload photos of your hairline and top of head",
  },
  // Question => 17
  {
    questionId: "203",
    type: "single-choice",
    questionHeader: "About your medication",
    notes: [
      "Intended benefits of Finasteride for Hair Loss:",
      "To help prevent further hair loss in male pattern baldness",
      "This is not a cure for male pattern baldness",
      "If medication is stopped, hair loss is likely to start again",
      "When can I expect to see initial results:",
      "3 to 6 months",
      "Possible Side Effects:*",
      "Erectile dysfunction",
      "Low sex drive",
      "Difficulty ejaculating",
      "Indigestion",
      "Mood disturbance",
    ],
    answers: [
      {
        body: "I have read and understood the intended benefits and possible side effects and do not have any questions",
      },
      // {
      //     body: "I have questions and will book a phone call"
      // }
    ],
  },
  // Question => 18
  {
    questionId: "35",
    type: "single-choice",
    questionHeader: "Do you have any questions for our healthcare team?",
    answers: [
      {
        body: "Yes",
      },
      {
        body: "No",
      },
    ],
  },
  // Question => 19
  {
    questionId: "37",
    type: "single-choice",
    questionHeader: "Would you like to book an appointment with our health care team?",
    answers: [
      {
        body: "Clinician",
      },
      {
        body: "Pharmacist",
      },
      {
        body: "No",
      },
    ],
  },
  // Question => 20
  {
    questionId: "204",
    type: "acknowledgement",
    questionHeader: "Upload Photo ID",
    message:
      "Please note this step is mandatory. If you are unable to complete at this time, email your ID to clinicadmin@myrocky.com",
    additionalMessage:
      "Your questionnaire will not be reviewed without this. As per our T&C's a $45 cancellation fee will be charged if we are unable to verify you.",
  },
  // Question => 21
  {
    questionId: "196",
    type: "photo-id-upload",
    questionHeader: "Verify your Identity",
    subtitle:
      "Take a picture holding your ID. Your face and ID must be clearly visible",
  },
];

export default hairQuestionList;
