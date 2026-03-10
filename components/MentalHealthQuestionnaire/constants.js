export const QUESTION_CONFIG = {
  1: {
    // Current situation question
    nextQuestions: {
      "I’m currently on medications and want to get it from MyRocky": 9,
      "I'm currently on medication but want to make a change": 2,
      "I am not on medication for mental health but have been in the past": 4,
      "I have never been on medication for mental health before": 4,
    },
  },
  2: {
    // Change type question
    nextQuestion: 3,
  },
  3: {
    // Change reason question
    nextQuestion: 4,
  },
  4: {
    // Symptoms question
    nextQuestion: 5,
  },
  5: {
    // How long feeling this way
    nextQuestion: 6,
  },
  6: {
    // Recent events question
    nextQuestion: 7,
  },
  7: {
    // Support methods
    nextQuestion: 8,
  },
  8: {
    // Results looking for
    nextQuestion: 9,
  },
  9: {
    // Mental health journey
    nextQuestion: 10,
  },
  10: {
    // Psychiatrist consultation
    nextQuestion: 11,
  },
  26: {
    nextQuestion: 27,
  },
  27: {
    // Medications question
    nextQuestion: 28,
  },
  28: {
    // Medical conditions
    nextQuestion: 29,
  },
  29: {
    // Allergies
    nextQuestion: 30,
  },
  30: {
    // Current medications
    nextQuestion: 31,
  },
  31: {
    // Medical conditions
    nextQuestion: 32,
  },
  32: {
    // Alcohol
    nextQuestion: 33,
  },
  33: {
    // Drugs
    nextQuestion: 34,
  },
  34: {
    // Health Care Team Questions
    nextQuestion: 35,
  },
  35: {
    // ID Upload instruction page with acknowledgement
    nextQuestion: 36,
  },
  36: {
    // ID Upload page
    nextQuestion: 37,
  },
};

export const VALIDATION_RULES = {
  1: (formData) => !!formData["501"],
  2: (formData) => !!formData["502"],
  3: (formData) => {
    if (formData["503"] === "Other") {
      return !!formData["503"] && !!formData["l-503_4-textarea"];
    }
    return !!formData["503"];
  },
  4: (formData) => {
    return (
      !!formData["504_1"] ||
      !!formData["504_2"] ||
      !!formData["504_3"] ||
      !!formData["504_4"] ||
      !!formData["504_5"]
    );
  },
  5: (formData) => !!formData["505"],
  6: (formData) => {
    return (
      !!formData["506_1"] ||
      !!formData["506_2"] ||
      !!formData["506_3"] ||
      !!formData["506_4"] ||
      !!formData["506_5"] ||
      !!formData["506_6"] ||
      !!formData["506_7"]
    );
  },
  7: (formData) => {
    return (
      !!formData["507_1"] ||
      !!formData["507_2"] ||
      !!formData["507_3"] ||
      !!formData["507_4"] ||
      !!formData["507_5"] ||
      !!formData["507_6"]
    );
  },
  8: (formData) => {
    return (
      !!formData["508_1"] ||
      !!formData["508_2"] ||
      !!formData["508_3"] ||
      !!formData["508_4"] ||
      !!formData["508_5"] ||
      !!formData["508_6"]
    );
  },
  9: (formData) => {
    return !!formData["509_1"] || !!formData["509_2"] || !!formData["509_3"];
  },
  10: (formData) => {
    if (formData["510"] === "Yes") {
      return !!formData["l-510_1-textarea"];
    }
    return !!formData["510"];
  },
  11: (formData) => !!formData["511"],
  12: (formData) => !!formData["512"],
  13: (formData) => !!formData["513"],
  14: (formData) => !!formData["514"],
  15: (formData) => !!formData["515"],
  16: (formData) => !!formData["516"],
  17: (formData) => !!formData["517"],
  18: (formData) => !!formData["518"],
  19: (formData) => !!formData["519"],
  20: (formData) => !!formData["520"],
  21: (formData) => !!formData["521"],
  22: (formData) => !!formData["522"],
  23: (formData) => !!formData["523"],
  24: (formData) => !!formData["524"],
  25: (formData) => !!formData["525"],
  26: (formData) => !!formData["526"],
  27: (formData) => {
    return (
      formData["527_1"] ||
      formData["527_2"] ||
      formData["527_3"] ||
      formData["527_4"] ||
      formData["527_5"] ||
      formData["527_6"] ||
      formData["527_7"] ||
      formData["527_8"]
    );
  },
  28: (formData) => {
    return (
      formData["528_1"] ||
      formData["528_2"] ||
      formData["528_3"] ||
      formData["528_4"] ||
      formData["528_5"] ||
      formData["528_6"] ||
      formData["528_7"] ||
      formData["528_8"] ||
      formData["528_9"]
    );
  },
  29: (formData) => {
    if (formData["529"] === "Yes") {
      return !!formData["l-529_1-textarea"];
    }
    return !!formData["529"];
  },
  30: (formData) => {
    if (formData["530"] === "Yes") {
      return !!formData["l-530_1-textarea"];
    }
    return !!formData["530"];
  },
  31: (formData) => {
    if (formData["531"] === "Yes") {
      return !!formData["l-531_1-textarea"];
    }
    return !!formData["531"];
  },
  32: (formData) => !!formData["532"],
  33: (formData) => {
    return Object.keys(formData).some((key) => {
      if (key.startsWith("533_") && formData[key]) {
        return true;
      }
      return false;
    });
  },
     34: (formData) => {
     if (!formData["538"]) return false;
     if (formData["538"] === "Yes") {
       return !!formData["539"] && formData["539"].trim() !== "";
     }
     return true;
   },
  35: (formData) => !!formData["photoIdAcknowledged"],
  36: (formData) => true,
};

export const MENTAL_HEALTH_SCORES = {
  PHQ9: {
    0: "Not at all",
    1: "Several Days",
    2: "More than half the days",
    3: "Nearly every day",
  },
  GAD7: {
    0: "Not at all",
    1: "Several Days",
    2: "More than half the days",
    3: "Nearly every day",
  },
};
