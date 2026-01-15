// Step navigation configuration
export const stepConfig = {  // Defines the navigation paths between steps
  navigation: {
    1: 2, // Weight Concerns -> Diet Description
    2: 3, // Diet Description -> BMI Calculator
    3: 4, // BMI Calculator -> Weight Loss Goal
    4: 5, // Weight Loss Goal -> Weight Loss Motivation
    5: 6, // Weight Loss Motivation -> Weight Loss Results
    6: 7, // Weight Loss Results -> Province Selection
    7: 8, // Province Selection -> Age Verification
    8: 9, // Age Verification -> Medical Conditions
    9: 10, // Medical Conditions -> Medications
    10: 11, // Medications -> Eating Disorder
    11: 12, // Eating Disorder -> Pregnancy
    12: 13, // Pregnancy -> Needle Preference
    13: 14, // Needle Preference -> Product Recommendations
    14: 15, // Product Recommendations -> Next Step (outside of this flow)
    15: 16, // Confirmation -> Final
  },

  // Previous step navigation (for back button)
  previousStep: {
    2: 1, // Diet Description -> Weight Concerns
    3: 2, // BMI Calculator -> Diet Description
    4: 3, // Weight Loss Goal -> BMI Calculator
    5: 4, // Weight Loss Motivation -> Weight Loss Goal
    6: 5, // Weight Loss Results -> Weight Loss Motivation
    7: 6, // Province Selection -> Weight Loss Results
    8: 7, // Age Verification -> Province Selection
    9: 8, // Medical Conditions -> Age Verification
    10: 9, // Medications -> Medical Conditions
    11: 10, // Eating Disorder -> Medications
    12: 11, // Pregnancy -> Eating Disorder
    13: 12, // Needle Preference -> Pregnancy
    14: 13, // Product Recommendations -> Needle Preference
    15: 14, // Confirmation -> Product Recommendations
    16: 15, // Final -> Confirmation
    17: 1, // Keep this for any edge cases
  },

  // Progress mapping for progress bar
  progressMap: {
    1: 7, // Weight Concerns
    2: 14, // Diet Description
    3: 21, // BMI Calculator
    4: 28, // Weight Loss Goal
    5: 35, // Weight Loss Motivation
    6: 42, // Weight Loss Results
    7: 50, // Province Selection
    8: 57, // Age Verification
    9: 64, // Medical Conditions
    10: 71, // Medications
    11: 78, // Eating Disorder
    12: 85, // Pregnancy
    13: 92, // Needle Preference
    14: 100, // Product Recommendations
    15: 100, // Confirmation
    16: 100, // Final
  },
};

// Utility functions for BMI calculation
export const calculateBMI = (heightFeet, heightInches, weightPounds) => {
  if (
    heightFeet <= 0 ||
    heightInches < 0 ||
    heightInches >= 12 ||
    !weightPounds
  ) {
    return 0;
  }

  const heightInInches = heightFeet * 12 + heightInches;
  const calculatedBmi =
    (weightPounds / (heightInInches * heightInInches)) * 703;

  return calculatedBmi.toFixed(2);
};

// Utility for product recommendation
export const determineRecommendedProduct = (bmi, weightDuration, PRODUCTS) => {
  if (bmi < 27) {
    return null;
  }

  let recommended = PRODUCTS.COMPOUNDED_TIRZEPATIDE;
  let alternatives = [PRODUCTS.COMPOUNDED_SEMAGLUTIDE, PRODUCTS.OZEMPIC, PRODUCTS.MOUNJARO, PRODUCTS.WEGOVY];

  if (weightDuration === "less-than-6") {
    recommended = PRODUCTS.RYBELSUS;
    alternatives = [PRODUCTS.COMPOUNDED_TIRZEPATIDE, PRODUCTS.COMPOUNDED_SEMAGLUTIDE, PRODUCTS.OZEMPIC, PRODUCTS.WEGOVY];
  }

  return {
    recommended,
    alternatives,
  };
};
